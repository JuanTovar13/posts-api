import { Creator } from '../../shared/types/creator';

export interface UserPosition {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  user: Creator;
  updated_at: string;
}

export interface UpdatePositionDTO {
  latitude: number;
  longitude: number;
}
