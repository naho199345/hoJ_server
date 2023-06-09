import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ErrorMessage } from 'src/common/enums';

export class SignUpDto {
  @IsEmail(
    {},
    {
      message: ErrorMessage.auth_Insert_003,
    },
  )
  @ApiProperty({ default: 'asdfasdf22@naver.com' })
  @IsNotEmpty()
  readonly account: string;

  @IsString()
  @ApiProperty({ default: 'Asdfasdf!2' })
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,12}$/, {
    message: ErrorMessage.auth_Insert_004,
  })
  readonly pwd: string;

  @IsString()
  @ApiProperty({ default: '김승호' })
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @ApiProperty({ default: '010-1234-1234' })
  @IsNotEmpty()
  readonly phoneNum: string;

  @IsString()
  @ApiProperty({ default: 'snssnsksk12@naver.com' })
  @IsNotEmpty()
  readonly regId: string;
}

export class SignInDto {
  @IsString()
  @ApiProperty({ default: 'asdfasdf22@naver.com' })
  @IsNotEmpty()
  readonly account: string;

  @IsString()
  @ApiProperty({ default: 'Asdfasdf!2' })
  @IsNotEmpty()
  readonly pwd: string;
}

export class AccountDto {
  @IsString()
  @ApiProperty({ default: 'asdfasdf22@naver.com' })
  @IsNotEmpty()
  readonly account: string;
}

export class SetPwdDto {
  @IsString()
  @ApiProperty({ default: 'asdfasdf22@naver.com' })
  @IsNotEmpty()
  readonly account: string;

  @IsString()
  @ApiProperty({ default: 'Asdfasdf!2' })
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,12}$/, {
    message: ErrorMessage.auth_Insert_004,
  })
  readonly pwd: string;

  @IsString()
  @ApiProperty({ default: 'G212gasdff!2' })
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,12}$/, {
    message: ErrorMessage.auth_Insert_004,
  })
  readonly newPwd: string;
}

export class CreateResetTokenDto {
  @IsString()
  @ApiProperty({ default: 'asdfasdf22@naver.com' })
  @IsNotEmpty()
  readonly account: string;

  @IsString()
  @ApiProperty({ default: '김승호' })
  @IsNotEmpty()
  readonly name: string;
}

export class ResetPwdDto {
  @IsString()
  @ApiProperty({
    default:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiYWNjb3VudCI6ImFzZGZhc2RmMjJAbmF2ZXIuY29tIiwibmFtZSI6Iuq5gOyKue2YuCIsInJvbGUiOiLrqbTsoJHqtIAiLCJpYXQiOjE2ODE4NjQyNTIsImV4cCI6MTY4MTg2NDc1Mn0.oqTNLIu0c29RLp3ojWev7ha65d8s1GN32X6O9nMTtEU',
  })
  @IsNotEmpty()
  readonly key: string;

  @IsString()
  @ApiProperty({ default: 'G212gasdff!2' })
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,12}$/, {
    message: ErrorMessage.auth_Insert_004,
  })
  readonly newPwd: string;
}
