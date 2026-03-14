// src/users/helpers/mail.helper.ts
import { MailerService } from '@nestjs-modules/mailer';

export async function sendWelcomeMail(
  mailerService: MailerService,
  email: string,
  fullName: string,
  password: string,
) {
  await mailerService.sendMail({
    to: email,
    subject: 'Akkauntingiz yaratildi',
    html: `
      <h2>Salom, ${fullName}!</h2>
      <p>Login: ${email}</p>
      <p>Parol: ${password}</p>
    `,
  });
}