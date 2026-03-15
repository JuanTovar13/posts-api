import Boom from "@hapi/boom"
import { supabase } from "../../config/supabase"
import { pool } from "../../config/database"
import { AuthenticateUserDTO, CreateUserDTO } from "./auth.types"

export const authenticateUserService = async ({
  email,
  password
}: AuthenticateUserDTO) => {

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    })

  if (error) {
    throw Boom.unauthorized(error.message)
  }

  return data
}


export const createUserService = async ({
  email,
  password,
  role
}: CreateUserDTO) => {

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error || !data.user) {
    throw Boom.badRequest(error?.message || "Error creating user")
  }

  const userId = data.user.id

  await pool.query(
    `
    INSERT INTO users(id, role)
    VALUES($1,$2)
    `,
    [userId, role]
  )

  return {
    id: userId,
    email,
    role
  }
}