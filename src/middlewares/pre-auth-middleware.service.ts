import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { FirebaseAdmin } from '../common/firebase-admin/firebase-admin.service';

@Injectable()
export class PreAuthMiddleware implements NestMiddleware {
  constructor(private readonly firebaseAdminService: FirebaseAdmin) {}
  private static accessDenied(url: string, res: Response) {
    res.status(401).json({
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: url,
      message: 'Access Denied - Either your token is invalid or expired',
    });
  }

  async use(req: Request, res: Response, next) {
    // return PreAuthMiddleware.accessDenied(req.url, res);
    const token = req.headers.authorization;
    if (token != null && token != '') {
      try {
        const decodedToken = await this.firebaseAdminService.validateToken(
          token.replace('Bearer ', ''),
        );
        // console.log(decodedToken);
        if (decodedToken) {
          const { uid, email, email_verified } = decodedToken;
          req['user'] = {
            uid,
            email,
            email_verified,
          };
          next();
        } else {
          return PreAuthMiddleware.accessDenied(req.url, res);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      return PreAuthMiddleware.accessDenied(req.url, res);
    }
  }
}
