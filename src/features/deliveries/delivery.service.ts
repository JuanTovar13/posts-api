import Boom from "@hapi/boom";
import { pool } from "../../config/database";

export const getAvailableOrdersService = async () => {

  const result = await pool.query(
    `
    SELECT 
      o.id,
      o.status,
      s.name as store_name
    FROM orders o
    JOIN stores s ON s.id = o.store_id
    WHERE o.delivery_id = $1
    ORDER BY o.created_at DESC
    `
  );

  return result.rows;
};

export const acceptOrderService = async (
  orderId: string,
  deliveryId: string
) => {

  const result = await pool.query(
    `
    UPDATE orders
    SET delivery_id = $1,
        status = 'accepted'
    WHERE id = $2
    AND delivery_id IS NULL
    RETURNING *
    `,
    [deliveryId, orderId]
  );

  if (result.rows.length === 0) {
    throw Boom.badRequest("Order not available");
  }

  return result.rows[0];
};

export const getMyOrdersService = async (deliveryId: string) => {

  const result = await pool.query(
    `
    SELECT 
      o.id,
      o.status,
      s.name as store_name
    FROM orders o
    JOIN stores s ON s.id = o.store_id
    WHERE o.delivery_id = $1
    ORDER BY o.created_at DESC
    `,
    [deliveryId]
  );

  return result.rows;
};