import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthJwtPayload } from '../types/jwt-payload';
import { Inject, Injectable } from '@nestjs/common';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtCofniguration: ConfigType<typeof refreshJwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshJwtCofniguration.secret as string,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  /**
   * Validate refresh token
   *
   * @param req contains the header authorization: Bearer
   * @param payload contains the userId on the sub key
   * @returns the userId
   *
   */

  validate(req: Request, payload: AuthJwtPayload) {
    // extract the refresh token from the request
    // then replace the Bearer token with an empty string
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();

    // 1. extract userId from payload
    const userId = payload.sub;

    // 2. validate the refreshToken
    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
