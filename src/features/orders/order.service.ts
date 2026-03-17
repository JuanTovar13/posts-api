import { pool } from "../../config/database"
import Boom from "@hapi/boom"
import { CreateOrderDTO } from "./order.types"

interface OrderItemDTO {
  product_id: string;
  quantity: number;
}

export const getOrders = async () => {

  const result = await pool.query(`
    SELECT * FROM orders
  `)

  return result.rows
}

export const getOrdersByConsumerService = async (
  consumerId: string
) => {

  const result = await pool.query(
    `
    SELECT
      id,
      store_id,
      status,
      created_at
    FROM orders
    WHERE consumer_id = $1
    ORDER BY created_at DESC
    `,
    [consumerId]
  );

  return result.rows;
};

export const getOrdersWithItemsByConsumerService = async (
  consumerId: string
) => {

  const result = await pool.query(
    `
    SELECT 
      o.id as order_id,
      o.status,
      o.created_at,
      p.name as product_name,
      oi.quantity
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.consumer_id = $1
    ORDER BY o.created_at DESC
    `,
    [consumerId]
  );

  return result.rows;
};


export const getOrderById = async (id: string) => {

  const orderResult = await pool.query(
    `
    SELECT o.*, s.name as store_name
    FROM orders o
    JOIN stores s ON s.id = o.store_id
    WHERE o.id = $1
    `,
    [id]
  );

  const order = orderResult.rows[0];

  if (!order) {
    throw Boom.notFound("Order not found");
  }

  const itemsResult = await pool.query(
    `
    SELECT 
      p.name,
      p.price,
      oi.quantity
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = $1
    `,
    [id]
  );

  return {
    ...order,
    items: itemsResult.rows
  };
};


export const createOrderService = async (
  consumerId: string,
  storeId: string,
  items: OrderItemDTO[]
) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const orderResult = await client.query(
      `
      INSERT INTO orders (consumer_id, store_id)
      VALUES ($1,$2)
      RETURNING *
      `,
      [consumerId, storeId]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity)
        VALUES ($1,$2,$3)
        `,
        [order.id, item.product_id, item.quantity]
      );
    }

    await client.query("COMMIT");

    return order;

  } catch (error) {

    await client.query("ROLLBACK");
    throw error;

  } finally {

    client.release();

  }
};

export const deleteOrderService = async (orderId: string) => {

  const result = await pool.query(
    `
    DELETE FROM orders
    WHERE id = $1
    RETURNING *
    `,
    [orderId]
  );

  return result.rows[0];
};


export const assignDelivery = async (
  orderId: string,
  deliveryId: string
) => {

  const result = await pool.query(
    `
    UPDATE orders
    SET delivery_id = $1
    WHERE id = $2
    RETURNING *
    `,
    [deliveryId, orderId]
  )

  const order = result.rows[0]

  if (!order) {
    throw Boom.notFound("Order not found")
  }

  return order
}