import { pool } from "../../config/database";
import { supabase } from "../../config/supabase";
import { UpdatePositionDTO, UserPosition } from "./position.types";
import { getPolygonContainingPoint } from "../polygons/polygon.service";
import {
  shouldNotifyPolygonEntry,
  upsertPolygonNotification,
} from "../notifications/notification.service";

export const getUserPositionService = async (
  userId: string,
): Promise<UserPosition | null> => {
  const result = await pool.query(
    `
    SELECT
      up.id,
      up.user_id,
      ST_Y(up.position::geometry) AS latitude,
      ST_X(up.position::geometry) AS longitude,
      json_build_object('id', u.id, 'userName', u.raw_user_meta_data->>'userName', 'email', u.email) AS user,
      up.updated_at
    FROM public.user_positions up
    JOIN auth.users u ON up.user_id = u.id
    WHERE up.user_id = $1
    `,
    [userId],
  );

  return result.rows[0] || null;
};

export const getPositionsService = async (): Promise<UserPosition[]> => {
  const result = await pool.query(`
    SELECT
      up.id,
      up.user_id,
      ST_Y(up.position::geometry) AS latitude,
      ST_X(up.position::geometry) AS longitude,
      json_build_object('id', u.id, 'userName', u.raw_user_meta_data->>'userName', 'email', u.email) AS user,
      up.updated_at
    FROM public.user_positions up
    JOIN auth.users u ON up.user_id = u.id
    ORDER BY up.updated_at DESC
  `);

  return result.rows;
};

export const createPositionService = async (
  userId: string,
  dto: UpdatePositionDTO,
): Promise<UserPosition> => {
  // If position already exists, delete it first
  const existing = await getUserPositionService(userId);
  if (existing) {
    await pool.query(`DELETE FROM public.user_positions WHERE user_id = $1`, [
      userId,
    ]);
  }

  const result = await pool.query(
    `
    INSERT INTO public.user_positions (user_id, position)
    VALUES ($1, ST_MakePoint($2, $3)::geography)
    RETURNING
      id,
      user_id,
      ST_Y(position::geometry) AS latitude,
      ST_X(position::geometry) AS longitude,
      updated_at
    `,
    [userId, dto.longitude, dto.latitude],
  );

  const row = result.rows[0];

  const userResult = await pool.query(
    `SELECT raw_user_meta_data->>'userName' AS user_name, email FROM auth.users WHERE id = $1`,
    [userId],
  );
  const user = userResult.rows[0];

  const position: UserPosition = {
    ...row,
    user: { userName: user.user_name, email: user.email },
  };

  broadcastPositionUpdated(position);

  return position;
};

export const updatePositionService = async (
  userId: string,
  dto: UpdatePositionDTO,
): Promise<UserPosition> => {
  const result = await pool.query<UserPosition>(
    `WITH updated AS (
      UPDATE public.user_positions
      SET position = ST_MakePoint($1, $2)::geography, updated_at = now()
      WHERE user_id = $3
      RETURNING id, user_id, ST_Y(position::geometry) AS latitude, ST_X(position::geometry) AS longitude, updated_at
    )
    SELECT u.id, u.user_id, u.latitude, u.longitude, u.updated_at,
      json_build_object('id', usr.id, 'userName', usr.raw_user_meta_data->>'userName', 'email', usr.email) AS user
    FROM updated u
    JOIN auth.users usr ON usr.id = u.user_id`,
    [dto.longitude, dto.latitude, userId],
  );

  if (result.rows.length === 0) {
    return createPositionService(userId, dto);
  }

  const position = result.rows[0];

  broadcastPositionUpdated(position);
  checkPolygonEntry(position);

  return position;
};

export const deletePositionService = async (userId: string): Promise<void> => {
  await pool.query(`DELETE FROM public.user_positions WHERE user_id = $1`, [
    userId,
  ]);

  broadcastPositionRemoved(userId);
};

const checkPolygonEntry = async (position: UserPosition) => {
  const polygon = await getPolygonContainingPoint(position.latitude, position.longitude);

  if (!polygon || polygon.created_by === position.user_id) return;

  const shouldNotify = await shouldNotifyPolygonEntry(position.user_id, polygon.id);
  if (!shouldNotify) return;

  await upsertPolygonNotification(position.user_id, polygon.id);
  await broadcastPolygonEntered(
    position.user_id,
    position.user.userName,
    polygon.id,
    polygon.name,
    polygon.created_by,
  );
};

const broadcastPositionUpdated = async (position: UserPosition) => {
  const channel = supabase.channel("positions");
  await channel.httpSend("position-updated", position);
  supabase.removeChannel(channel);
};

const broadcastPositionRemoved = async (userId: string) => {
  const channel = supabase.channel("positions");
  await channel.httpSend("position-removed", { userId });
  supabase.removeChannel(channel);
};

const broadcastPolygonEntered = async (
  userId: string,
  userName: string,
  polygonId: string,
  polygonName: string,
  ownerId: string,
) => {
  const channel = supabase.channel("positions");
  await channel.httpSend("polygon-entered", {
    userId,
    userName,
    polygonId,
    polygonName,
    ownerId,
  });
  supabase.removeChannel(channel);
};
