export enum UserRole {
  CONSUMER = "consumer",
  STORE = "store",
  DELIVERY = "delivery"
}

export interface AuthenticateUserDTO {
  email: string
  password: string
}

export interface CreateUserDTO {
  email: string
  password: string
  role: UserRole
}