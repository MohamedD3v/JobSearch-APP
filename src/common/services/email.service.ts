import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL'),
        pass: this.configService.get<string>('PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: `Job Search APP <${this.configService.get<string>('EMAIL')}>`,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch {
      return false;
    }
  }
}
