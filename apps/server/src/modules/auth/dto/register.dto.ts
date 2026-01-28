import { EmailField, NameField, StrongPasswordField } from '@/common/dto/base.dto'

export class RegisterDto {
  @EmailField()
  email!: string

  @StrongPasswordField()
  password!: string

  @NameField()
  name!: string
}
