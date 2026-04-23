import { pool } from '../../config/database';
import { supabase } from '../../config/supabase';
import Boom from '@hapi/boom';
import { Order, OrderItemDTO, OrderStatus } from './order.types';

const PICKUP_RADIUS_METERS = 5;

export const getOrders = async () => {
  const result = await pool.query(`SELECT * FROM orders`);
  return result.rows;
};

export const getOrdersByConsumerService = async (consumerId: string) => {
  const result = await pool.query(
    `SELECT id, store_id, status, created_at
     FROM orders
     WHERE consumer_id = $1
     ORDER BY created_at DESC`,
    [consumerId],
  );
  return result.rows;
};

export const getOrdersWithItemsByConsumerService = async (consumerId: string) => {
  const result = await pool.query(
    `SELECT
       o.id AS order_id,
       o.status,
       o.created_at,
       p.name AS product_name,
       oi.quantity
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products    p  ON p.id = oi.product_id
     WHERE o.consumer_id = $1
     ORDER BY o.created_at DESC`,
    [consumerId],
  );
  return result.rows;
};

export const getOrderById = async (id: string) => {
  const orderResult = await pool.query(
    `SELECT
       o.id,
       o.status,
       o.created_at,
       o.pickup_lat,
       o.pickup_lng,
       s.name AS store_name
     FROM orders o
     JOIN stores s ON s.id = o.store_id
     WHERE o.id = $1`,
    [id],
  );

  const order = orderResult.rows[0];
  if (!order) throw Boom.notFound('Order not found');

  const itemsResult = await pool.query(
    `SELECT p.name AS product_name, oi.quantity
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [id],
  );

  return { ...order, items: itemsResult.rows };
};

export const getPendingOrdersService = async () => {
  const result = await pool.query(
    `SELECT
       o.id,
       o.consumer_id,
       o.store_id,
       o.status,
       o.pickup_lat,
       o.pickup_lng,
       o.created_at,
       s.name AS store_name,
       u.name AS consumer_name
     FROM orders o
     JOIN stores s ON s.id = o.store_id
     JOIN users  u ON u.id = o.consumer_id
     WHERE o.status = 'pending'
     ORDER BY o.created_at DESC`,
  );
  return result.rows;
};

export const createOrderService = async (
  consumerId: string,
  storeId: string,
  items: OrderItemDTO[],
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Take pickup coords from the store's current position if available
    const posResult = await client.query(
      `SELECT up.latitude, up.longitude
       FROM stores s
       LEFT JOIN user_positions up ON up.id = s.user_id
       WHERE s.id = $1`,
      [storeId],
    );

    const storePos = posResult.rows[0];
    const pickupLat = storePos?.latitude ?? null;
    const pickupLng = storePos?.longitude ?? null;

    const orderResult = await client.query(
      `INSERT INTO orders (consumer_id, store_id, pickup_lat, pickup_lng)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [consumerId, storeId, pickupLat, pickupLng],
    );

    const order = orderResult.rows[0] as Order;

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [order.id, item.product_id, item.quantity],
      );
    }

    await client.query('COMMIT');

    await broadcastOrderEvent('order-created', order);
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
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

export const assignDelivery = async (orderId: string, deliveryId: string) => {
  const result = await pool.query(
    `UPDATE orders
     SET delivery_id = $1, status = 'accepted'
     WHERE id = $2 AND status = 'pending'
     RETURNING *`,
    [deliveryId, orderId],
  );

  const order = result.rows[0] as Order | undefined;
  if (!order) throw Boom.notFound('Order not found or already accepted');

  await broadcastOrderEvent('order-accepted', order);
  return order;
};

export const updateOrderStatusService = async (
  orderId: string,
  status: OrderStatus,
): Promise<Order> => {
  const result = await pool.query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [status, orderId],
  );

  const order = result.rows[0] as Order | undefined;
  if (!order) throw Boom.notFound('Order not found');

  await broadcastOrderEvent('order-status-updated', order);
  return order;
};

export const checkDeliveryProximityAndDeliver = async (
  deliveryId: string,
  currentLat: number,
  currentLng: number,
): Promise<void> => {
  const result = await pool.query<Order>(
    `SELECT * FROM orders
     WHERE delivery_id = $1 AND status = 'accepted'
     LIMIT 1`,
    [deliveryId],
  );

  const activeOrder = result.rows[0];
  if (!activeOrder || activeOrder.pickup_lat === null || activeOrder.pickup_lng === null) return;

  const distance = haversineDistance(
    currentLat,
    currentLng,
    activeOrder.pickup_lat,
    activeOrder.pickup_lng,
  );

  if (distance < PICKUP_RADIUS_METERS) {
    await updateOrderStatusService(activeOrder.id, 'delivered');
  }
};

const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const broadcastOrderEvent = async (event: string, order: Order) => {
  const channel = supabase.channel('orders');
  await channel.httpSend(event, { order });
  supabase.removeChannel(channel);
};
