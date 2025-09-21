import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const provided = (req.header('x-api-key') || '').trim();
    const expected = (process.env.API_KEY || '').trim();

    if (!expected) {
      throw new UnauthorizedException('API key not configured on the server.');
    }

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid API key.');
    }

    return true;
  }
}
