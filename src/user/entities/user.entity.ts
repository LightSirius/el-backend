import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAuth } from './user-auth.entity';

export enum UserGender {
  male = 'male',
  female = 'female',
  none = 'none',
}

@Entity()
export class User {
  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }

  @PrimaryGeneratedColumn('uuid')
  user_uuid: string;

  @Column()
  user_name: string;

  @Column({ type: 'enum', enum: UserGender, default: UserGender.none })
  user_gender: UserGender;

  @Column()
  user_born: Date;

  @Column()
  user_email: string;

  @Column({ default: null })
  user_ci: string;

  @Column({ default: null })
  user_phone_number: string;

  @Column({ default: false })
  user_phone_sns_agree: boolean;

  @Column({ default: null })
  user_phone_sns_agree_date: Date;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @OneToOne(() => UserAuth, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  userAuth: UserAuth;
}
