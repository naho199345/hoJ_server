import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { Role } from '../enums/Role';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 128, unique: true })
  account: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pwd: string;

  @Column({ type: 'char', length: 1, nullable: true, default: '0' })
  isChgPwd: string;

  @Column({ type: 'varchar', length: 128 })
  regId: string;

  @CreateDateColumn()
  regDt: Date;
}
