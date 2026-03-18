import { BadRequestException } from '@nestjs/common';
import { Resend } from 'resend';

export const sendEmail = async (data: any) => {
  if (!data.html && !data.text)
    throw new BadRequestException('Please insert Data');

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'JobApp <onboarding@resend.dev>',
    to: data.to,
    subject: data.subject,
    html: data.html,
    text: data.text,
  });
};
