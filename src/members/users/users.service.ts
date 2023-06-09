import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AccountDto, FindUserByIdDto, SetPwdDto, SignUpDto } from './dto/users.dto';
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

  async interviewerSignUp(signUpData: SignUpDto): Promise<void> {
    const roleIdentify = 0;
    const { account, pwd, name, regId } = signUpData;
    const encAccount = this.cryptoService.encryptString(account);
    const encRegId = this.cryptoService.encryptString(regId);

    const encName = this.cryptoService.encryptString(name);

    const existingUser = await User.findOne({ where: { account: encAccount }, select: ['account'] });

    if (existingUser) {
      throw new ConflictException(`${ErrorMessage.auth_Insert_001} ${name}(${account})`);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pwd, salt);
    const newUser = User.create({
      account: encAccount,
      pwd: hashedPassword,
      name: encName,
      role: roleIdentify === 0 ? Role.MANAGER : Role.USER,
      regId: encRegId,
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
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';
    const isDev = process.env.NODE_ENV === 'dev';
    let domain: string;

    if (isProduction) {
      domain = 'interview.catchapply.co.kr';
    } else if (isTest) {
      domain = 'interview-test.catchapply.co.kr';
    } else if (isDev) {
      domain = 'localhost';
    }

    const cookieOptions = {
      domain: domain,
      path: '/',
      maxAge: 0,
    };
    req.res.clearCookie('itvToken', cookieOptions);
  }

  async validateUser(
    userAccount: string,
    userPassword: string,
  ): Promise<{ id: number; account: string; name: string; role: string }> {
    const encAccount = this.cryptoService.encryptString(userAccount);

    const user = await User.findOne({ where: { account: encAccount } });
    if (user.role !== Role.MANAGER) {
      throw new UnauthorizedException(`해당 계정은 ${user.role}으로 등록되어 있습니다.`);
    }

    if (!user || !(await bcrypt.compare(userPassword, user.pwd))) {
      throw new UnauthorizedException(ErrorMessage.auth_List_002);
    }
    const { id, name, role } = user;
    const decName = this.cryptoService.decryptString(name);
    return { id, account: userAccount, name: decName, role };
  }

  async signJwt(req: Request, payload: Payload): Promise<string> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES'),
    });
    try {
      if (!this.isDev) {
        req.res.cookie('itvToken', accessToken, { domain: '.catchapply.co.kr', maxAge: 1000 * 60 * 60 * 24 });
      } else {
        req.res.cookie('itvToken', accessToken);
      }
    } catch (error) {
      console.log(error);
    }

    return accessToken;
  }

  async createToken(req: Request): Promise<{ accessToken: string }> {
    const { account } = req.body;
    const encAccount = this.cryptoService.encryptString(account);

    const user = await User.findOne({ where: { account: encAccount }, select: ['id', 'account', 'name', 'role'] });

    if (!user) {
      throw new HttpException('해당 계정의 방이 존재하지 않습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const { id, name, role } = user;

    if (role === Role.MANAGER) {
      throw new HttpException('잘못된 접근입니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const decName = this.cryptoService.decryptString(name);

    const accessToken = await this.signJwt(req, { id, account, name: decName, role });
    return { accessToken };
  }

  async findUserByAccount(accountDto: AccountDto): Promise<any> {
    const encAccount = this.cryptoService.encryptString(accountDto.account);

    const user = await User.findOne({ where: { account: encAccount }, select: ['id', 'account', 'name', 'role'] });

    const { id, account, name, role } = user;

    const decAccount = this.cryptoService.decryptString(account);
    const decName = this.cryptoService.decryptString(name);

    return { id, account: decAccount, name: decName, role };
  }

  async findUserById(findUserByIdDto: FindUserByIdDto): Promise<any> {
    const { id } = findUserByIdDto;
    const user = await User.findOne({ where: { id }, select: ['id', 'account', 'name', 'role'] });

    const { account, name, role } = user;

    const decAccount = this.cryptoService.decryptString(account);
    const decName = this.cryptoService.decryptString(name);

    return { id, account: decAccount, name: decName, role };
  }
}