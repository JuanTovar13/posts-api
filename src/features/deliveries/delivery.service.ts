import { pool } from "../../config/database"
import Boom from "@hapi/boom"

export const getAvailableOrders = async () => {

  const result = await pool.query(`
    SELECT *
    FROM orders
    WHERE delivery_id IS NULL
  `)

  return result.rows
}


export const getMyOrders = async (deliveryId: string) => {

  const result = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE delivery_id = $1
    `,
    [deliveryId]
  )

  return result.rows
}


export const takeOrder = async (
  orderId: string,
  deliveryId: string
) => {

  const orderCheck = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE id = $1
    `,
    [orderId]
  )

  const order = orderCheck.rows[0]

  if (!order) {
    throw Boom.notFound("Order not found")
  }

  if (order.delivery_id) {
    throw Boom.conflict("Order already taken")
  }

  const result = await pool.query(
    `
    UPDATE orders
    SET delivery_id = $1
    WHERE id = $2
    RETURNING *
    `,
    [deliveryId, orderId]
  )

  return result.rows[0]
}