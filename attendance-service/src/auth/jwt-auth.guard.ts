import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Gin equivalent: the JWT auth middleware. Rejects with 401 when the token is missing/invalid. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
