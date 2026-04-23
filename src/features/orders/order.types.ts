export type OrderStatus = 'pending' | 'accepted' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  consumer_id: string;
  delivery_id: string | null;
  store_id: string;
  status: OrderStatus;
  pickup_lat: number | null;
  pickup_lng: number | null;
  created_at: string;
}

export interface OrderItemInput {
  product_id: string;
  quantity: number;
}

export interface CreateOrderDTO {
  consumer_id: string;
  store_id: string;
  items: OrderItemInput[];
}

export interface OrderItemDTO {
  product_id: string;
  quantity: number;
}
