import type { Transporter } from 'nodemailer'
import { join } from 'node:path'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as ejs from 'ejs'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private transporter: Transporter
  private readonly isDev = process.env.NODE_ENV !== 'production'

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('mail.host'),
      port: this.configService.get('mail.port'),
      secure: this.configService.get('mail.port') === 465,
      auth: {
        user: this.configService.get('mail.user'),
        pass: this.configService.get('mail.password'),
      },
    })
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('mail.from'),
        to,
        subject,
        html,
      })
      this.logger.log(`Email sent to ${to}`)
    }
    catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error)
      throw error
    }
  }

  private async renderTemplate(templateName: string, data: Record<string, unknown>): Promise<string> {
    // 开发环境使用源文件，生产环境使用编译后的文件
    const templatePath = this.isDev
      ? join(process.cwd(), 'res', `${templateName}.ejs`)
      : join(process.cwd(), 'dist', 'res', `${templateName}.ejs`)
    return await ejs.renderFile(templatePath, data)
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get('frontendUrl')
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`

    const html = await this.renderTemplate('verification', {
      name,
      verificationUrl,
      year: new Date().getFullYear(),
    })

    await this.sendMail(to, '验证您的 Zeta 账号邮箱', html)
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get('frontendUrl')
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`

    const html = await this.renderTemplate('password-reset', {
      name,
      resetUrl,
      year: new Date().getFullYear(),
    })

    await this.sendMail(to, '重置您的 Zeta 账号密码', html)
  }
}
