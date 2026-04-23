export interface UserPosition {
  id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export interface UpsertPositionDTO {
  latitude: number;
  longitude: number;
}
