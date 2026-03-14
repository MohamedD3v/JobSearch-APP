import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '../utils/token/token.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authorization.split(' ')[1];
    const decoded = verifyToken({
      token,
      signature: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
    });

    if (!decoded) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = decoded;
    return true;
  }
}
