export interface Store {
  id: string
  name: string
  is_open: boolean
  user_id: string
}

export interface CreateStoreDTO {
  name: string
  user_id: string
}