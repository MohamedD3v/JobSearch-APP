import { EventEmitter } from 'node:events';
import { template } from '../email/template.email';
import { sendEmail } from '../email/send.email';

interface EmailEventData {
  to: string;
  otp: string;
  firstName: string;
}

export const emailEvent = new EventEmitter();

emailEvent.on('confirmEmail', (data: EmailEventData) => {
  const subject = 'Job Search App - Email Verification';
  const html = template(Number(data.otp), data.firstName, subject);
  sendEmail({ to: data.to, subject, html }).catch(() => {});
});

emailEvent.on('forgetPassword', (data: EmailEventData) => {
  const subject = 'Job Search App - Password Reset';
  const html = template(Number(data.otp), data.firstName, subject);
  sendEmail({ to: data.to, subject, html }).catch(() => {});
});
