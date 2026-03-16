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
  subject: 'Eduflow tizimi - akkaunt yaratildi',
  html: `
  <table width="100%" style="background:#f4f6fb;padding:30px;font-family:Arial;">
    <tr>
      <td align="center">

        <table width="600" style="background:#fff;border-radius:8px;padding:30px">
          <tr>
            <td style="text-align:center;font-size:22px;font-weight:bold;color:#6C63FF">
              EDUFLOW TIZIMI
            </td>
          </tr>

          <tr>
            <td>
              <h2>Salom, ${fullName}</h2>

              <p>EDUFLOW TIZIMIGA KIRISH UCHUN:</p>

              <p><b>LOGIN:</b> ${email}</p>
              <p><b>PAROLINGIZ:</b> ${password}</p>

              <div style="margin-top:20px">
                <a href="https://edu-flow.uz/login"
                   style="background:#6C63FF;color:white;padding:10px 20px;text-decoration:none;border-radius:5px">
                   Tizimga kirish
                </a>
              </div>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
  `
});
}