import { ArrayNotEmpty, IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsEmail({},{each: true})
    recipients: string[];

    @IsString()
    subject: string;

    @IsString()
    html: string;

    @IsOptional()
    @IsString()
    text?: string;
}