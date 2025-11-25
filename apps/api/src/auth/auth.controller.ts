import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user._id, req.user.role);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.login(req.user._id, req.user.role);

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
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  async signOut(@Req() req, @Res() res) {
    await this.authService.signOut(req.user.id);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: 'Signed out successfully' });
  }
}
