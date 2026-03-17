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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background:#f4f6fb; font-family:Arial,sans-serif;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb; padding:20px 0;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#6C63FF,#9b5de5); text-align:center; padding:28px 20px;">
                  <h1 style="margin:0; color:#fff; font-size:22px; letter-spacing:1px;">EDUFLOW TIZIMI</h1>
                  <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:13px;">Akkauntingiz muvaffaqiyatli yaratildi</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:28px 24px;">
                  <h2 style="margin:0 0 12px; font-size:20px; color:#1e1e2e;">Salom, ${fullName}! 👋</h2>
                  <p style="margin:0 0 20px; color:#555; font-size:14px; line-height:1.6;">
                    Siz <strong>EDUFLOW</strong> tizimiga muvaffaqiyatli qo'shildingiz. Quyidagi ma'lumotlar bilan tizimga kirishingiz mumkin:
                  </p>

                  <!-- Credentials -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7ff; border:1px solid #e0dbff; border-radius:10px; overflow:hidden;">
                    
                    <!-- Login -->
                    <tr>
                      <td style="padding:14px 16px; border-bottom:1px solid #e0dbff;">
                        <div style="font-size:11px; font-weight:700; color:#6C63FF; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Login</div>
                        <div style="font-size:14px; color:#1e1e2e; font-weight:600; word-break:break-all;">${email}</div>
                      </td>
                    </tr>

                    <!-- Parol -->
                    <tr>
                      <td style="padding:14px 16px;">
                        <div style="font-size:11px; font-weight:700; color:#6C63FF; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Parol</div>
                        <div style="font-size:24px; color:#1e1e2e; font-weight:800; letter-spacing:4px;">${password}</div>
                      </td>
                    </tr>

                  </table>

                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                    <tr>
                      <td align="center">
                        <a href="http://localhost:5173/login"
                           style="display:inline-block; background:linear-gradient(135deg,#6C63FF,#9b5de5); color:#fff; text-decoration:none; padding:14px 40px; border-radius:8px; font-weight:700; font-size:15px;">
                          Tizimga kirish →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:24px 0 0; font-size:12px; color:#aaa; text-align:center;">
                    Agar siz bu emailni kutmagan bo'lsangiz, e'tiborsiz qoldiring.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb; text-align:center; padding:14px; font-size:12px; color:#aaa; border-top:1px solid #f0f0f0;">
                  &copy; 2026 EDUFLOW. Barcha huquqlar himoyalangan.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </body>
    </html>
    `,
  });
}