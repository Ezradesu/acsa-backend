import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.config.get<string>('SMTP_HOST'),
            port: Number(this.config.get('SMTP_PORT')) || 587,
            secure: false, // TLS via STARTTLS
            auth: {
                user: this.config.get<string>('SMTP_USER'),
                pass: this.config.get<string>('SMTP_PASS'),
            },
        });
    }

    async sendVerificationEmail(to: string, token: string): Promise<void> {
        const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

        await this.transporter.sendMail({
            from: this.config.get<string>('SMTP_FROM') ?? `"ACSA" <noreply@acsejukabadi.com>`,
            to,
            subject: 'Verifikasi Email - ACSA Sejuk Abadi',
            html: `
                <!DOCTYPE html>
                <html lang="id">
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                                    <tr>
                                        <td style="background:#1a73e8;padding:32px;text-align:center;">
                                            <h1 style="color:#ffffff;margin:0;font-size:24px;">ACSA Sejuk Abadi</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:40px 32px;">
                                            <h2 style="color:#333333;margin:0 0 16px;">Verifikasi Email Anda</h2>
                                            <p style="color:#555555;line-height:1.6;margin:0 0 24px;">
                                                Terima kasih telah mendaftar! Klik tombol di bawah untuk memverifikasi alamat email Anda.
                                                Link ini berlaku selama <strong>24 jam</strong>.
                                            </p>
                                            <div style="text-align:center;margin:32px 0;">
                                                <a href="${verificationUrl}"
                                                   style="background:#1a73e8;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
                                                    Verifikasi Email
                                                </a>
                                            </div>
                                            <p style="color:#888888;font-size:13px;line-height:1.5;margin:24px 0 0;">
                                                Jika Anda tidak merasa mendaftar di ACSA Sejuk Abadi, abaikan email ini.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:24px 32px;border-top:1px solid #eeeeee;">
                                            <p style="color:#aaaaaa;font-size:12px;margin:0;text-align:center;">
                                                &copy; ${new Date().getFullYear()} ACSA Sejuk Abadi. Seluruh hak cipta dilindungi.
                                            </p>
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

        this.logger.log(`Verification email sent to ${to}`);
    }
}
