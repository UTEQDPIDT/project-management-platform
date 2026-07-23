import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type RecaptchaVerifyResponse = {
	success: boolean;
	challenge_ts?: string;
	hostname?: string;
	'error-codes'?: string[];
};

@Injectable()
export class RecaptchaService {
	private readonly verifyUrl: string;

	constructor(private readonly configService: ConfigService) {
		this.verifyUrl = this.configService.get<string>(
			'RECAPTCHA_VERIFY_URL',
			'https://www.google.com/recaptcha/api/siteverify',
		);
	}

	async verifyTokenOrThrow(token: string, remoteIp?: string) {
		const secret = this.configService.get<string>('RECAPTCHA_SECRET_KEY', '');

		if (!secret) {
			throw new BadRequestException('reCAPTCHA is not configured.');
		}

		if (!token?.trim()) {
			throw new BadRequestException('Missing reCAPTCHA token.');
		}

		const body = new URLSearchParams();
		body.append('secret', secret);
		body.append('response', token);
		if (remoteIp) {
			body.append('remoteip', remoteIp);
		}

		let response: Response;
		try {
			response = await fetch(this.verifyUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body,
			});
		} catch {
			throw new BadRequestException('Unable to verify reCAPTCHA.');
		}

		if (!response.ok) {
			throw new BadRequestException('Unable to verify reCAPTCHA.');
		}

		const data = (await response.json()) as RecaptchaVerifyResponse;
		if (!data.success) {
			throw new BadRequestException('Invalid reCAPTCHA.');
		}
	}
}
