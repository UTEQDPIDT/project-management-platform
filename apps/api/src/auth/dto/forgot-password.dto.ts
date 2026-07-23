import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'Dirección de correo electrónico institucional del usuario.',
        example: 'ejemplo@uteq.edu.mx',
    })
    @IsEmail({}, { message: 'El correo es inválido' })
    @Matches(/^[A-Za-z0-9._%+-]+@uteq\.edu\.mx$/i, {
        message: 'El correo debe terminar en @uteq.edu.mx',
    })
    email: string;

    @ApiProperty({
        description: 'Token de verificación de reCAPTCHA v2 invisible.',
    })
    @IsString()
    @MinLength(1)
    recaptchaToken: string;

}