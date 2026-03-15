export type UserRole = "consumer" | "store" | "delivery"

export interface User {
  id: string
  name: string
  role: UserRole
}

export interface CreateUserDTO {
  name: string
  role: UserRole
}