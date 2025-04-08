export interface RoomInfo {
  room_id: string;
  room_title: string;
  max_player: number;
  current_player: number;
  host_nickname: string;
  is_locked: boolean;
  password: string;
}
