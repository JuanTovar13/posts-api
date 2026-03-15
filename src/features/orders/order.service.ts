import { pool } from "../../config/database"
import Boom from "@hapi/boom"
import { CreateOrderDTO } from "./order.types"

export const getOrders = async () => {

  const result = await pool.query(`
    SELECT * FROM orders
  `)

  return result.rows
}


export const getOrderById = async (id: string) => {

  const orderResult = await pool.query(
    `
    SELECT * FROM orders
    WHERE id = $1
    `,
    [id]
  )

  const order = orderResult.rows[0]

  if (!order) {
    throw Boom.notFound("Order not found")
  }

  const itemsResult = await pool.query(
    `
    SELECT oi.*, p.name, p.price
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = $1
    `,
    [id]
  )

  return {
    ...order,
    items: itemsResult.rows
  }
}


export const createOrder = async (data: CreateOrderDTO) => {

  const { consumer_id, store_id, items } = data

  if (!consumer_id || !store_id || !items || items.length === 0) {
    throw Boom.badRequest("consumer_id, store_id and items are required")
  }

  const orderResult = await pool.query(
    `
    INSERT INTO orders(consumer_id, store_id)
    VALUES($1,$2)
    RETURNING *
    `,
    [consumer_id, store_id]
  )

  const order = orderResult.rows[0]

  for (const item of items) {

    await pool.query(
      `
      INSERT INTO order_items(order_id, product_id, quantity)
      VALUES($1,$2,$3)
      `,
      [order.id, item.product_id, item.quantity]
    )

  }

  return order
}


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