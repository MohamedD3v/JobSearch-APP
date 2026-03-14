import { BadRequestException } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const sendEmail = async (data: MailOptions) => {
  if (!data.html && !data.attachments?.length && !data.text)
    throw new BadRequestException('Please insert Data');
  const transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  > = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
  const info = await transporter.sendMail({
    ...data,
    from: `"Job Search App" <${process.env.EMAIL}>`,
    to: data.to,
  });
  console.log(`Message Sent To ${info.messageId}`);
};
