import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oidc';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { StrategyService } from '../strategy.service';

config();

// TODO: first login after service comes up always fails. maybe something is lazy init.
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private strategyService: StrategyService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(issuer: string, profile: any, cb: any): Promise<any> {
    const { id, displayName, emails } = profile;
    const result = await this.strategyService.validate(
      'google',
      id,
      id,
      {
        name: displayName,
        email: emails[0].value,
      },
      { google: { id } },
    );
    return cb(null, result);
  }
}
