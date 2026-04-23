import { pool } from '../../config/database';
import { supabase } from '../../config/supabase';
import { UpsertPositionDTO, UserPosition } from './position.types';
import { checkDeliveryProximityAndDeliver } from '../orders/order.service';

const POSITION_WITH_USER = `
  SELECT
    up.id,
    up.latitude,
    up.longitude,
    up.updated_at,
    json_build_object('id', u.id, 'name', u.name, 'role', u.role) AS user
  FROM user_positions up
  JOIN users u ON u.id = up.id
`;

export const getPositionsService = async (): Promise<UserPosition[]> => {
  const { rows } = await pool.query<UserPosition>(
    `${POSITION_WITH_USER} ORDER BY up.updated_at DESC`,
  );
  return rows;
};

export const upsertPositionService = async (
  userId: string,
  dto: UpsertPositionDTO,
): Promise<UserPosition> => {
  await pool.query(
    `INSERT INTO user_positions (id, latitude, longitude)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE
       SET latitude   = EXCLUDED.latitude,
           longitude  = EXCLUDED.longitude,
           updated_at = NOW()`,
    [userId, dto.latitude, dto.longitude],
  );

  const { rows } = await pool.query<UserPosition>(
    `${POSITION_WITH_USER} WHERE up.id = $1`,
    [userId],
  );

  const position = rows[0];

  broadcastPositionUpdated(position);
  checkDeliveryProximityAndDeliver(userId, dto.latitude, dto.longitude);

  return position;
};

export const deletePositionService = async (userId: string): Promise<void> => {
  await pool.query(`DELETE FROM user_positions WHERE id = $1`, [userId]);
  broadcastPositionRemoved(userId);
};

const broadcastPositionUpdated = async (position: UserPosition) => {
  const channel = supabase.channel('positions');
  await channel.httpSend('position-updated', position);
  supabase.removeChannel(channel);
};

const broadcastPositionRemoved = async (userId: string) => {
  const channel = supabase.channel('positions');
  await channel.httpSend('position-removed', { userId });
  supabase.removeChannel(channel);
};
