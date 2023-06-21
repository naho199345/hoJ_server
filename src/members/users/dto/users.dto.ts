import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';
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
