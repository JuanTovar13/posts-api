import { pool } from "../../config/database"
import Boom from "@hapi/boom"
import { CreateProductDTO } from "./product.types"


export const getProducts = async () => {

  const result = await pool.query(`
    SELECT * FROM products
  `)

  return result.rows
}


export const getProductsByStore = async (storeId: string) => {

  const result = await pool.query(
    `
    SELECT * FROM products
    WHERE store_id = $1
    `,
    [storeId]
  )

  return result.rows
}


export const getProductById = async (id: string) => {

  const result = await pool.query(
    `
    SELECT * FROM products
    WHERE id = $1
    `,
    [id]
  )

  const product = result.rows[0]

  if (!product) {
    throw Boom.notFound("Product not found")
  }

  return product
}


export const createProduct = async (data: CreateProductDTO) => {

  if (!data.name || !data.price || !data.store_id) {
    throw Boom.badRequest("name, price and store_id are required")
  }

  const result = await pool.query(
    `
    INSERT INTO products(name, price, store_id)
    VALUES($1,$2,$3)
    RETURNING *
    `,
    [data.name, data.price, data.store_id]
  )

  return result.rows[0]
}


export const deleteProduct = async (id: string) => {

  const result = await pool.query(
    `
    DELETE FROM products
    WHERE id = $1
    RETURNING *
    `,
    [id]
  )

  const product = result.rows[0]

  if (!product) {
    throw Boom.notFound("Product not found")
  }

  return product
}