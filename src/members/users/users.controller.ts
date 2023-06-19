import { Controller, Post, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { ApiExtraModels, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AccountDto, FindUserByIdDto, SetPwdDto, SignInDto, SignUpDto } from './dto/users.dto';
import { UsersService } from './users.service';
import { Role } from 'src/common/enums/Role';
import { Public } from 'src/common/decorators';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';

@ApiTags('회원 로그인')
@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiHeader({
    name: 'itvkey',
  })
  @ApiOperation({ summary: '회원 추가' })
  @ApiExtraModels(SignUpDto)
  @Post('/interviewer')
  async interviewerSignUp(@Body() signUpData: SignUpDto): Promise<void> {
    const result = await this.usersService.interviewerSignUp(signUpData);
    return result;
  }

  @ApiOperation({ summary: '회원 비밀번호 수정' })
  @ApiExtraModels(SignUpDto)
  @Patch('/setpwd')
  async setPassword(@Body() setPwdDto: SetPwdDto): Promise<void> {
    const result = await this.usersService.setPassword(setPwdDto);
    return result;
  }

  @ApiHeader({
    name: 'itvkey',
  })
  @ApiOperation({ summary: '회원 삭제' })
  @ApiExtraModels(AccountDto)
  @Post('/deleteinterviewer')
  async delInterviewer(@Body() accountDto: AccountDto): Promise<void> {
    const result = await this.usersService.delInterviewer(accountDto);
    return result;
  }

  @ApiOperation({ summary: '회원 로그인' })
  @UseGuards(LocalAuthGuard)
  @ApiExtraModels(SignInDto)
  @Public()
  @Post('/login')
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

  @ApiHeader({
    name: 'itvkey',
  })
  @ApiOperation({ summary: 'id 찾기' })
  @ApiExtraModels(AccountDto)
  @Post('finduserbyaccount')
  async findUserByAccount(@Body() accountDto: AccountDto): Promise<any> {
    const result = await this.usersService.findUserByAccount(accountDto);
    return result;
  }

  @ApiOperation({ summary: 'id 찾기' })
  @ApiExtraModels(AccountDto)
  @Post('finduserbyid')
  async findUserById(@Body() findUserByIdDto: FindUserByIdDto): Promise<any> {
    const result = await this.usersService.findUserById(findUserByIdDto);
    return result;
  }
}
