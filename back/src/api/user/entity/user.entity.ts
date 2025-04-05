import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({ unique: true, length: 30 })
  user_id: string;

  @Column({ length: 128 })
  user_password: string;

  @Column({ unique: true, length: 30 })
  user_nickname: string;

  @Column({ unique: true, length: 50 })
  user_email: string;

  @Column({ default: 1 })
  user_role: string;
}
