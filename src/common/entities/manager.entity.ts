import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 128, unique: true })
  account: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  phoneNum: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pwd: string;

  @Column({ type: 'char', length: 1, nullable: true, default: '0' })
  isChgPwd: string;

  @Column({ type: 'char', length: 1 })
  isPaymentStep: string;

  @CreateDateColumn()
  regDt: Date;
}
