import { pool } from "../../config/database"
import Boom from "@hapi/boom"
import { CreateStoreDTO } from "./store.types"

export const getStores = async () => {

  const result = await pool.query(`
    SELECT * FROM stores
  `)

  return result.rows
}


export const getStoreById = async (id: string) => {

  const result = await pool.query(
    `
    SELECT * FROM stores
    WHERE id = $1
    `,
    [id]
  )

  const store = result.rows[0]

  if (!store) {
    throw Boom.notFound("Store not found")
  }

  return store
}


export const createStore = async (data: CreateStoreDTO) => {

  if (!data.name || !data.user_id) {
    throw Boom.badRequest("name and user_id are required")
  }

  const result = await pool.query(
    `
    INSERT INTO stores(name, user_id)
    VALUES($1,$2)
    RETURNING *
    `,
    [data.name, data.user_id]
  )

  return result.rows[0]
}


export const openStore = async (id: string) => {

  const result = await pool.query(
    `
    UPDATE stores
    SET is_open = true
    WHERE id = $1
    RETURNING *
    `,
    [id]
  )

  const store = result.rows[0]

  if (!store) {
    throw Boom.notFound("Store not found")
  }

  return store
}


export const closeStore = async (id: string) => {

  const result = await pool.query(
    `
    UPDATE stores
    SET is_open = false
    WHERE id = $1
    RETURNING *
    `,
    [id]
  )

  const store = result.rows[0]

  if (!store) {
    throw Boom.notFound("Store not found")
  }

  return store
}