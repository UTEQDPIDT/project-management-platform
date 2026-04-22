import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';

export class InitializePasswordDto {
    @ApiProperty({
        description: 'Dirección de correo electrónico institucional del usuario.',
        example: 'ejemplo@uteq.edu.mx',
    })
    @IsEmail({}, { message: 'El correo es inválido' })
    @Matches(/^[A-Za-z0-9._%+-]+@uteq\.edu\.mx$/i, {
        message: 'El correo debe terminar en @uteq.edu.mx',
    })
    email: string;
}