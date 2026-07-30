import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class MockLoginDto {
    @ApiProperty({
        description: 'Dirección de correo electrónico del usuario.',
    })
	@IsEmail()
	email: string;

    @ApiProperty({
        description: 'Contraseña del usuario.',
    })
	@IsString()
	@MinLength(8)
	password: string;

    @ApiPropertyOptional({
        description: 'Token de verificación de reCAPTCHA v2 invisible.',
    })
    @IsOptional()
    @IsString()
    @MinLength(1)
    recaptchaToken: string;
}
