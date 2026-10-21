import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsEmail()
  @MaxLength(254)
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @IsNotEmpty()
  password: string;
}
