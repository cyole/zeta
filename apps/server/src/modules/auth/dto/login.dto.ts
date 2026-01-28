import { EmailField, PasswordField } from '@/common/dto/base.dto'

export class LoginDto {
  @EmailField()
  email!: string

  @PasswordField()
  password!: string
}
