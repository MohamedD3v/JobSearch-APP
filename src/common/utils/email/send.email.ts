import { BadRequestException } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { MailOptions } from 'nodemailer/lib/sendmail-transport';

export const sendEmail = async (data: MailOptions) => {
  if (!data.html && !data.attachments?.length && !data.text)
    throw new BadRequestException('Please insert Data');
  const transporter = createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
    family: 4,
  } as SMTPTransport.Options);
  await transporter.sendMail({
    ...data,
    from: `"Job Search App" <${process.env.EMAIL}>`,
    to: data.to,
  });
};
