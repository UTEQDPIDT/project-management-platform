import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class MockRegisterDto {
    @ApiProperty({
        description: 'Nombre(s) del usuario.',
    })
    @IsString()
    @MinLength(1)
    givenName: string;

    @ApiProperty({
        description: 'Appellido(s) del usuario.',
    })    
    @IsString()
    @MinLength(1)
    familyName: string;

    @ApiProperty({
        description: 'Dirección de correo electrónico del usuario.',
        example: 'jsuarez@uteq.edu.mx',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario.',
    })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({
        description: 'Token de verificación de reCAPTCHA v2 invisible.',
    })
    @IsString()
    @MinLength(1)
    recaptchaToken: string;
}
