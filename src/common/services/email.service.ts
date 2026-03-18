import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.resend.emails.send({
        from: 'JobApp <onboarding@resend.dev>',
        to,
        subject,
        html,
      });
      return true;
    } catch {
      return false;
    }
  }
}
