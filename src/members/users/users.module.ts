import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../common/strategies/passport.jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config/dist';
import { LocalStrategy } from 'src/common/strategies/local.strategy';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CryptoModule } from 'src/common/utils/cypto/crypto.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (ConfigService: ConfigService) => ({
        secret: ConfigService.get('JWT_ACCESS_TOKEN'),
        signOptions: {
          expiresIn: ConfigService.get('JWT_ACCESS_TOKEN_EXPIRES'),
        },
      }),
    }),
    PassportModule,
    CryptoModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService, JwtStrategy, LocalStrategy, RoleGuard],
  exports: [JwtModule, UsersService],
})
export class UsersModule {}
