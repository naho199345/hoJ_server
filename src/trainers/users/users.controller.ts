import { Controller, Post, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { ApiExtraModels, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AccountDto, CreateResetTokenDto, ResetPwdDto, SetPwdDto, SignInDto, SignUpDto } from './dto/users.dto';
import { UsersService } from './users.service';
import { Role } from 'src/common/enums/Role';
import { Public } from 'src/common/decorators';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';

@ApiTags('유저 로그인')
@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '유저 추가' })
  @ApiExtraModels(SignUpDto)
  @Post('/signnUp')
  async signUp(@Body() signUpData: SignUpDto): Promise<void> {
    const result = await this.usersService.signUp(signUpData);
    return result;
  }

  @ApiOperation({ summary: '유저 비밀번호 수정' })
  @ApiExtraModels(SignUpDto)
  @Patch('/setPwd')
  async setPassword(@Body() setPwdDto: SetPwdDto): Promise<void> {
    const result = await this.usersService.setPassword(setPwdDto);
    return result;
  }

  @ApiOperation({ summary: '유저 삭제' })
  @ApiExtraModels(AccountDto)
  @Post('/deleteUser')
  async delInterviewer(@Body() accountDto: AccountDto): Promise<void> {
    const result = await this.usersService.delInterviewer(accountDto);
    return result;
  }

  @ApiOperation({ summary: '유저 로그인' })
  @UseGuards(LocalAuthGuard)
  @ApiExtraModels(SignInDto)
  @Public()
  @Post('/signIn')
  async signIn(
    @Req() req: Request & { user: { id: number; account: string; name: string; role: Role; isChgPwd: string } },
    @Body() Body: SignInDto,
  ): Promise<any> {
    const result = await this.usersService.signIn(req);
    return result;
  }

  @ApiOperation({ summary: '로그아웃' })
  @Public()
  @Post('logout')
  signOut(@Req() req: Request & { user: { account: string; name: string; role: Role } }): any {
    return this.usersService.signOut(req);
  }

  // @ApiOperation({ summary: '비밀번호 초기화 토큰생성' })
  // @Public()
  // @ApiExtraModels(CreateResetTokenDto)
  // @Post('sendemail')
  // async sendEmail(@Body() createResetTokenDto: CreateResetTokenDto): Promise<any> {
  //   const result = await this.usersService.sendEmail(createResetTokenDto);
  //   return result;
  // }

  // @ApiOperation({ summary: '비밀번호 초기화' })
  // @Public()
  // @ApiExtraModels(ResetPwdDto)
  // @Post('resetpwd')
  // async resetPwd(@Body() resetPwdDto: ResetPwdDto): Promise<void> {
  //   const result = await this.usersService.resetPwd(resetPwdDto);
  //   return result;
  // }
}
