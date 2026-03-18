import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('EMAIL'),
        pass: this.configService.get<string>('PASS'),
      },
      family: 4,
    } as SMTPTransport.Options);
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
