import Boom from "@hapi/boom";
import { pool } from "../../config/database";

export const createOrderItemService = async (
  orderId: string,
  productId: string,
  quantity: number
) => {

  const result = await pool.query(
    `
    INSERT INTO order_items (order_id, product_id, quantity)
    VALUES ($1,$2,$3)
    RETURNING *
    `,
    [orderId, productId, quantity]
  );

  return result.rows[0];
};