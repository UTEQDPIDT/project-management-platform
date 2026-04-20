import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from "./dto/email.dto";

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    constructor(private readonly configService: ConfigService){}
    emailTransport(){
        const rawPort = this.configService.get<string>('MAIL_PORT');// Read port as string from config
        const parsedPort = rawPort ? parseInt(rawPort, 10) : NaN;// Default to 465 if parsing fails or if not provided
        const port = Number.isFinite(parsedPort) ? parsedPort : 465; // Use secure connection for port 465
        const secure = port === 465; // true for 465, false for other ports

        const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port,
            secure, // true for 465, false for other ports
            auth: {
              user: this.configService.get<string>('MAIL_USER'), // generated ethereal user
              pass: this.configService.get<string>('MAIL_PASS'), // generated ethereal password
            },
            });
            return transporter;
        };

    async sendEmail(dto: SendEmailDto){
        const {recipients, subject, html} = dto;
        const transport = this.emailTransport();

        const options: nodemailer.SendMailOptions = {
            from: this.configService.get<string>('MAIL_FROM'),
            to: recipients,
            subject: subject,
            html: html,
        };
        try {
            await transport.sendMail(options);
            this.logger.log(`Email sent to: ${recipients.join(', ')}`);
            return { message: 'Email sent successfully' };
            
        } catch (error) {
            this.logger.error(`Failed to send email to ${recipients.join(', ')} | subject: ${subject}`,
            error instanceof Error ? error.stack : String(error),
    );
    throw new InternalServerErrorException('Failed to send email');
        }
    }

    async sendPasswordReset(toEmail: string, resetUrl: string) {
        const html = `
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>
                <a href="${resetUrl}" target="_blank" rel="noreferrer">
                    Restablecer contraseña
                </a>
            </p>
            <p>Este enlace expira en 15 minutos.</p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
        `;

        await this.sendEmail({
            recipients: [toEmail],
            subject: 'Restablece tu contraseña - PREP UTEQ',
            html,
        });
    }
}
