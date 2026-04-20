import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
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
		description: 'Token temporal para restablecer la contraseña.',
	})
	@IsString({ message: 'El token es obligatorio' })
	@MinLength(1, { message: 'El token es obligatorio' })
	token: string;

	@ApiProperty({
		description: 'Nueva contraseña del usuario.',
	})
	@IsString({ message: 'La nueva contraseña es obligatoria' })
	@MinLength(8, {
		message: 'La nueva contraseña debe tener al menos 8 caracteres',
	})
	newPassword: string;

	@ApiProperty({
		description: 'Confirmación de la nueva contraseña del usuario.',
	})
	@IsString({ message: 'La confirmación de contraseña es obligatoria' })
	@MinLength(8, {
		message:
			'La confirmación de contraseña debe tener al menos 8 caracteres',
	})
	confirmPassword: string;
}