export enum UserRole {
  CONSUMER = "consumer",
  STORE = "store",
  DELIVERY = "delivery"
}

export enum OrderStatus {
  CREATED     = 'Creado',
  IN_DELIVERY = 'En entrega',
  DELIVERED   = 'Entregado',
}

export interface AuthenticateUserDTO {
  email: string
  password: string
}

export interface CreateUserDTO {
  email: string
  password: string
  name: string
  role: UserRole
}