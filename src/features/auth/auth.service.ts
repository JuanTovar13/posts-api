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
  name,
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
    INSERT INTO users(id,name, role)
    VALUES($1,$2,$3)
    `,
    [userId, name, role]
  )

  if (role === "store") {

    await pool.query(
      `
      INSERT INTO stores( name, user_id)
      VALUES($1,$2)
      `,
      [`${name}'s Store`, userId]
    );

  }

  return {
    id: userId,
    email,
    name,
    role
  }
}