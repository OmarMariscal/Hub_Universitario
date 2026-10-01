import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'El campo firstName es obligatorio' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'El campo lastName es obligatorio' })
  @IsString()
  lastName: string;

  @IsNotEmpty({ message: 'El campo email es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  email: string;

  @IsNotEmpty({ message: 'El campo password es obligatorio' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/, {
    message: 'La contraseña debe incluir al menos una mayúscula, un número y un carácter especial',
  })
  password: string;

  @IsNotEmpty({ message: 'El campo confirmPassword es obligatorio' })
  @IsString()
  confirmPassword: string;
}
