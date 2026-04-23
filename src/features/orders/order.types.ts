import { OrderStatus } from '../auth/auth.types';

export interface Order {
  id: string;
  consumer_id: string;
  delivery_id: string | null;
  store_id: string;
  status: OrderStatus;
  delivery_position: string | null;
  destination: string;
  created_at: string;
}

export interface OrderItemDTO {
  product_id: string;
  quantity: number;
}

export interface CreateOrderDTO {
  consumer_id: string;
  store_id: string;
  destination_lat: number;
  destination_lng: number;
  items: OrderItemDTO[];
}

export interface UpdatePositionDTO {
  lat: number;
  lng: number;
}
