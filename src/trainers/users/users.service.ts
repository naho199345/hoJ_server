import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AccountDto, SetPwdDto, SignUpDto } from './dto/users.dto';
import { ErrorMessage, Role } from 'src/common/enums';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { User } from 'src/common/entities/user.entity';
import { ConflictException } from '@nestjs/common/exceptions';
import { CryptoService } from 'src/common/utils/cypto/crypto.service';
import { Payload } from 'src/common/interfaces';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  private isDev = process.env.NODE_ENV === undefined;

  async signUp(signUpData: SignUpDto): Promise<void> {
    const { account, pwd, name, phoneNum } = signUpData;

    const existingUser = await User.findOne({ where: { account }, select: ['account'] });

    if (existingUser) {
      throw new ConflictException(`${ErrorMessage.auth_Insert_001} ${name}(${account})`);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pwd, salt);
    const newUser = User.create({
      account,
      pwd: hashedPassword,
      phoneNum: phoneNum,
      name,
    });

    await newUser.save();
  }

  async setPassword(setPwdDto: SetPwdDto): Promise<void> {
    const { account, pwd, newPwd } = setPwdDto;
    const encAccount = this.cryptoService.encryptString(account);
    const user = await User.findOne({ where: { account: encAccount } });

    if (!user) {
      throw new UnauthorizedException(ErrorMessage.auth_List_001);
    }

    if (!(await bcrypt.compare(pwd, user.pwd))) {
      throw new UnauthorizedException(ErrorMessage.auth_Update_001);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPwd, salt);

    user.pwd = hashedPassword;
    user.isChgPwd = '1';
    await user.save();
  }

  async delInterviewer(accountDto: AccountDto): Promise<void> {
    const { account } = accountDto;
    const encAccount = this.cryptoService.encryptString(account);

    const user = await User.findOne({
      where: { account: encAccount },
    });

    if (!user) {
      throw new UnauthorizedException(ErrorMessage.auth_List_001);
    }

    await User.remove(user);
  }

  async signIn(
    req: Request & { user: { id: number; account: string; name: string; role: Role } },
  ): Promise<{ accessToken: string; isChgPwd: string }> {
    if (!req.user) {
      throw new UnauthorizedException(ErrorMessage.auth_Insert_002);
    }
    const encAccount = this.cryptoService.encryptString(req.user.account);
    const { isChgPwd } = await User.findOne({ where: { account: encAccount }, select: ['isChgPwd'] });

    const payload = req.user;
    const accessToken = await this.signJwt(req, payload);
    return { accessToken, isChgPwd };
  }

  signOut(req: Request) {
    const cookieOptions = {
      domain: 'localhost',
      path: '/',
      maxAge: 0,
    };
    req.res.clearCookie('hoJtoken', cookieOptions);
  }

  async validateUser(
    userAccount: string,
    userPassword: string,
  ): Promise<{ id: number; account: string; name: string }> {
    const user = await User.findOne({ where: { account: userAccount } });
    const { id, name } = user;
    return { id, account: userAccount, name };
  }

  async signJwt(req: Request, payload: Payload): Promise<string> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES'),
    });
    try {
      req.res.cookie('hoJtoken', accessToken);
    } catch (error) {
      console.log(error);
    }

    return accessToken;
  }
}
