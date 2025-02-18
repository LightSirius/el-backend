import { CreateUserAuthLocalDto } from './create-user-auth-local.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuthType } from '../entities/user-auth.entity';
import { CreateUserAuthNaverDto } from './create-user-auth-naver.dto';
import { UserGender } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'user_name' })
  @IsString()
  user_name: string;
  @ApiProperty({ description: 'user_gender' })
  @IsEnum(UserGender)
  user_gender: UserGender;
  @ApiProperty({ description: 'user_born' })
  @IsDate()
  @Type(() => Date)
  user_born: Date;
  @ApiProperty({ description: 'user_email' })
  @IsEmail()
  user_email: string;
  @ApiProperty({ description: 'user_ci' })
  @IsString()
  user_ci: string;
  @ApiProperty({ description: 'user_phone_number' })
  @IsString()
  user_phone_number: string;
  @ApiProperty({ description: 'user_phone_sns_agree' })
  @IsBoolean()
  user_phone_sns_agree: boolean;
  @ApiProperty({ description: 'user_phone_sns_agree_date' })
  @IsDate()
  @Type(() => Date)
  user_phone_sns_agree_date: Date;
  @ApiProperty({ description: 'AuthType' })
  @IsEnum(AuthType)
  auth_type: AuthType;
  @ApiProperty({ description: 'CreateUserAuthLocalDto' })
  @IsOptional()
  userAuthLocal?: CreateUserAuthLocalDto;
  @ApiProperty({ description: 'CreateUserAuthNaverDto' })
  @IsOptional()
  userAuthNaver?: CreateUserAuthNaverDto;
}
