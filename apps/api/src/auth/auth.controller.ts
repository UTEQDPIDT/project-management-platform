import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Public } from '../common/decorators/public.decorator';

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
          'http://localhost:3000/auth/error?message=authentication_failed',
        );
      }

      const response = await this.authService.login(
        req.user._id,
        req.user.role,
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

      if (req.user.role == 'ADMIN') {
        res.redirect(`http://localhost:3000/admin/inicio`);
      } else {
        res.redirect(`http://localhost:3000/user/inicio`);
      }
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('http://localhost:3000/auth/error?message=callback_failed');
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
