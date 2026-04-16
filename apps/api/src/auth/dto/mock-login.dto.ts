import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

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
}
