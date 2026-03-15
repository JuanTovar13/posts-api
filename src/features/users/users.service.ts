import { pool } from "../../config/database"
import { CreateUserDTO } from "./users.types"
import Boom from "@hapi/boom"

export const getUsers = async () => {

  const result = await pool.query(`
    SELECT * FROM users
  `)

  return result.rows
}


export const getUserById = async (id: string) => {

  const result = await pool.query(
    `
    SELECT * FROM users
    WHERE id = $1
    `,
    [id]
  )

  const user = result.rows[0]

  if (!user) {
    throw Boom.notFound("User not found")
  }

  return user
}


export const createUser = async (data: CreateUserDTO) => {

  if (!data.name || !data.role) {
    throw Boom.badRequest("name and role are required")
  }

  const result = await pool.query(
    `
    INSERT INTO users(name, role)
    VALUES($1,$2)
    RETURNING *
    `,
    [data.name, data.role]
  )

  return result.rows[0]
}