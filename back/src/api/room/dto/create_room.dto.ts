export class CreateRoomDto {
  room_title: string;
  host_nickname: string;
  max_player: number;
  is_locked: boolean;
  password?: string;
  has_bot?: boolean;
}
