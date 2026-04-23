import { pool } from '../../config/database';
import { supabase } from '../../config/supabase';
import Boom from '@hapi/boom';
import { Order, UpdatePositionDTO, CreateOrderDTO } from './order.types';
import { OrderStatus } from '../auth/auth.types';

const ARRIVAL_RADIUS_METERS = 5;

// ─── Queries ────────────────────────────────────────────────────────────────

export const getOrders = async () => {
  const result = await pool.query(`
    SELECT
      o.id,
      o.consumer_id,
      o.delivery_id,
      o.store_id,
      o.status,
      o.created_at,
      ST_Y(o.destination::geometry)        AS destination_lat,
      ST_X(o.destination::geometry)        AS destination_lng,
      ST_Y(o.delivery_position::geometry)  AS delivery_lat,
      ST_X(o.delivery_position::geometry)  AS delivery_lng,
      s.name AS store_name,
      u.name AS consumer_name
    FROM orders o
    JOIN stores s ON s.id = o.store_id
    JOIN users  u ON u.id = o.consumer_id
    ORDER BY o.created_at DESC
  `);
  return result.rows;
};

export const getOrderById = async (id: string) => {
  const orderResult = await pool.query(
    `
    SELECT
      o.id,
      o.consumer_id,
      o.delivery_id,
      o.store_id,
      o.status,
      o.created_at,
      ST_Y(o.destination::geometry)        AS destination_lat,
      ST_X(o.destination::geometry)        AS destination_lng,
      ST_Y(o.delivery_position::geometry)  AS delivery_lat,
      ST_X(o.delivery_position::geometry)  AS delivery_lng,
      s.name AS store_name,
      u.name AS consumer_name
    FROM orders o
    JOIN stores s ON s.id = o.store_id
    JOIN users  u ON u.id = o.consumer_id
    WHERE o.id = $1
    `,
    [id],
  );

  const order = orderResult.rows[0];
  if (!order) throw Boom.notFound('Order not found');

  const itemsResult = await pool.query(
    `
    SELECT p.name AS product_name, p.price, oi.quantity
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = $1
    `,
    [id],
  );

  return { ...order, items: itemsResult.rows };
};

export const getOrdersWithItemsByConsumerService = async (consumerId: string) => {
  const result = await pool.query(
    `
    SELECT
      o.id AS order_id,
      o.status,
      o.created_at,
      ST_Y(o.destination::geometry)        AS destination_lat,
      ST_X(o.destination::geometry)        AS destination_lng,
      ST_Y(o.delivery_position::geometry)  AS delivery_lat,
      ST_X(o.delivery_position::geometry)  AS delivery_lng,
      p.name  AS product_name,
      oi.quantity
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products    p  ON p.id = oi.product_id
    WHERE o.consumer_id = $1
    ORDER BY o.created_at DESC
    `,
    [consumerId],
  );
  return result.rows;
};

export const getPendingOrdersService = async () => {
  const result = await pool.query(`
    SELECT
      o.id,
      o.consumer_id,
      o.store_id,
      o.status,
      o.created_at,
      ST_Y(o.destination::geometry) AS destination_lat,
      ST_X(o.destination::geometry) AS destination_lng,
      s.name AS store_name,
      u.name AS consumer_name
    FROM orders o
    JOIN stores s ON s.id = o.store_id
    JOIN users  u ON u.id = o.consumer_id
    WHERE o.status = '${OrderStatus.CREATED}'
    ORDER BY o.created_at DESC
  `);
  return result.rows;
};

// ─── Mutations ───────────────────────────────────────────────────────────────

export const createOrderService = async (dto: CreateOrderDTO) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `
      INSERT INTO orders (consumer_id, store_id, status, destination)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
      RETURNING
        id, consumer_id, store_id, status, created_at,
        ST_Y(destination::geometry) AS destination_lat,
        ST_X(destination::geometry) AS destination_lng
      `,
      [
        dto.consumer_id,
        dto.store_id,
        OrderStatus.CREATED,
        dto.destination_lng,
        dto.destination_lat,
      ],
    );

    const order = orderResult.rows[0] as Order;

    for (const item of dto.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [order.id, item.product_id, item.quantity],
      );
    }

    await client.query('COMMIT');

    await broadcastOrderEvent(order.id, 'order-created', order);
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const deleteOrderService = async (orderId: string) => {
  const result = await pool.query(
    `DELETE FROM orders WHERE id = $1 RETURNING *`,
    [orderId],
  );
  return result.rows[0];
};

export const acceptOrderService = async (orderId: string, deliveryId: string) => {
  const result = await pool.query(
    `
    UPDATE orders
    SET delivery_id = $1, status = $2
    WHERE id = $3 AND status = $4
    RETURNING
      id, consumer_id, delivery_id, store_id, status, created_at,
      ST_Y(destination::geometry) AS destination_lat,
      ST_X(destination::geometry) AS destination_lng
    `,
    [deliveryId, OrderStatus.IN_DELIVERY, orderId, OrderStatus.CREATED],
  );

  const order = result.rows[0];
  if (!order) throw Boom.conflict('Order not found or already accepted');

  await broadcastOrderEvent(orderId, 'order-accepted', order);
  return order;
};

export const updateDeliveryPositionService = async (
  orderId: string,
  deliveryId: string,
  dto: UpdatePositionDTO,
) => {
  // Update delivery_position using PostGIS — note ST_MakePoint(lng, lat)
  const updateResult = await pool.query(
    `
    UPDATE orders
    SET delivery_position = ST_SetSRID(ST_MakePoint($1, $2), 4326)
    WHERE id = $3 AND delivery_id = $4 AND status = $5
    RETURNING id
    `,
    [dto.lng, dto.lat, orderId, deliveryId, OrderStatus.IN_DELIVERY],
  );

  if (!updateResult.rows[0]) {
    throw Boom.forbidden('Order not found, not yours, or not in delivery');
  }

  // Broadcast position to the order-specific channel so consumer sees it live
  await broadcastOrderEvent(orderId, 'position-update', { lat: dto.lat, lng: dto.lng });

  // Check arrival using ST_DWithin — PostGIS handles geodesic distance in meters
  const arrivalResult = await pool.query(
    `
    SELECT id
    FROM orders
    WHERE id = $1
      AND ST_DWithin(delivery_position, destination, $2)
    `,
    [orderId, ARRIVAL_RADIUS_METERS],
  );

  if (arrivalResult.rows.length > 0) {
    await markAsDeliveredService(orderId, deliveryId);
  }

  return { lat: dto.lat, lng: dto.lng };
};

export const markAsDeliveredService = async (orderId: string, deliveryId: string) => {
  const result = await pool.query(
    `
    UPDATE orders
    SET status = $1
    WHERE id = $2 AND delivery_id = $3
    RETURNING
      id, consumer_id, delivery_id, store_id, status, created_at,
      ST_Y(destination::geometry) AS destination_lat,
      ST_X(destination::geometry) AS destination_lng,
      ST_Y(delivery_position::geometry) AS delivery_lat,
      ST_X(delivery_position::geometry) AS delivery_lng
    `,
    [OrderStatus.DELIVERED, orderId, deliveryId],
  );

  const order = result.rows[0];
  if (!order) throw Boom.notFound('Order not found');

  await broadcastOrderEvent(orderId, 'order-delivered', order);
  return order;
};

// ─── Broadcast ───────────────────────────────────────────────────────────────

const broadcastOrderEvent = async (
  orderId: string,
  event: string,
  payload: object,
) => {
  const channel = supabase.channel(`order:${orderId}`);
  await channel.httpSend(event, payload);
  supabase.removeChannel(channel);
};
