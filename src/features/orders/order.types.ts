export interface Order {
  id: string
  consumer_id: string
  delivery_id?: string
  store_id: string
}

export interface OrderItemInput {
  product_id: string
  quantity: number
}

export interface CreateOrderDTO {
  consumer_id: string
  store_id: string
  items: OrderItemInput[]
}