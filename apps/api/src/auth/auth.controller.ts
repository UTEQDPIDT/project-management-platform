import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@repo/types';

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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8h
      });

      res.cookie('refreshToken', response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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
  async mockLogin(@Body('email') email: string, @Res() res) {
    try {
      const user = await this.authService.validateUser(email);
      if (!user) {
        throw new BadRequestException();
      }

      const response = await this.authService.login(
        user._id.toString(),
        user.role,
      );

      res.cookie('accessToken', response.accessToken, {
        httpOnly: true,
        secure: false,
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
      return res.status(401).json({ message: 'Invalid email' });
    }
  }

  @Public()
  @Post('logout')
  async signOut(@Req() req, @Res() res) {
    await this.authService.signOut(req.user.id);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }
}
