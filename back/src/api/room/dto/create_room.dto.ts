export class CreateRoomDto {
  room_title: string;
  max_player: number;
  is_locked: boolean;
  password?: string;
}
