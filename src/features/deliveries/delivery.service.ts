import Boom from "@hapi/boom";
import { pool } from "../../config/database";

export const getAvailableOrdersService = async () => {

  const result = await pool.query(
    `
    SELECT * FROM orders
    WHERE delivery_id IS NULL
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
    SELECT * FROM orders
    WHERE delivery_id = $1
    `,
    [deliveryId]
  );

  return result.rows;
};