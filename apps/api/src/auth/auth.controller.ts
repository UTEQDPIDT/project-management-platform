import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@repo/types';
import { MockLoginDto } from './dto/mock-login.dto';
import { MockRegisterDto } from './dto/mock-register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user._id, req.user.role);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    try {
      if (!req.user) {
        console.error('No user found in request after Google OAuth');
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/error?message=authentication_failed`,
        );
      }

      const response = await this.authService.login(
        req.user._id,
        req.user.role,
      );

      res.cookie('accessToken', response.accessToken, {
        httpOnly: true,
        secure: false, // Only send cookies over HTTPS in production
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8h
      });

      res.cookie('refreshToken', response.refreshToken, {
        httpOnly: true,
        secure: false, // Only send cookies over HTTPS in production
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
      });

      if (req.user.role == 'ADMIN') {
        res.redirect(`${process.env.FRONTEND_URL}/admin/inicio`);
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/user/inicio`);
      }
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/error?message=callback_failed`,
      );
    }
  }

  @Public()
  @Post('mock-login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async mockLogin(@Body() body: MockLoginDto, @Res() res) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);

      const response = await this.authService.login(
        user._id.toString(),
        user.role,
      );

      res.cookie('accessToken', response.accessToken, {
        httpOnly: true,
        secure: false, // Only send cookies over HTTPS in production
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8h
      });

      res.cookie('refreshToken', response.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
      });

      const redirectPath =
        user.role === UserRole.ADMIN ? '/admin/inicio' : '/user/inicio';

      return res.status(200).json({ redirectUrl: redirectPath });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }
  }

  @Public()
  @Post('mock-register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async mockRegister(
    @Body() body: MockRegisterDto,
    @Res() res,
  ){
    try{
      const user = await this.authService.registerUser(body);

      const response = await this.authService.login(
        user._id.toString(),
        user.role,
      );

      res.cookie('accessToken', response.accessToken, {
        httpOnly: true,
        secure: false, // Only send cookies over HTTPS in production
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8h
      });

      res.cookie('refreshToken', response.refreshToken, {
        httpOnly: true,
        secure: false, // Only send cookies over HTTPS in production
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
      });

      const redirectPath =
        user.role === UserRole.ADMIN ? '/admin/inicio' : '/user/inicio';

        return res.status(201).json({ redirectUrl: redirectPath });

    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async forgotPassword(@Body() body: ForgotPasswordDto, @Res() res) {
    try {
      const response = await this.authService.forgotPassword(body.email);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(200).json({
        message:
          'Si el correo existe, enviaremos instrucciones para restablecer la contraseña',
      });
    }
  }

  @Public()
  @Post('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async resetPassword(@Body() body: ResetPasswordDto, @Res() res) {
    try {
      const response = await this.authService.resetPassword(body);
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof BadRequestException) {
        const response = error.getResponse();
        return res.status(error.getStatus()).json(
          typeof response === 'string' ? { message: response } : response,
        );
      }

      throw error;
    }
  }

  @Public()
  @Post('logout')
  async signOut(@Req() req, @Res() res) {
    if (req.user?.id) {
      await this.authService.signOut(req.user.id);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}
