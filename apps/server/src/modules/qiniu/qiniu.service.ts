import type { QiniuModuleOptions } from './qiniu.interface'
import { randomBytes } from 'node:crypto'
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common'
import * as qiniu from 'qiniu'
import { QINIU_CONFIG_PROVIDER } from './qiniu.constants'

interface UploadResult {
  url: string
  key: string
  name: string
  size: number
  type: string
}

interface UploadOptions {
  folder?: string
  prefix?: string
}

@Injectable()
export class QiniuService implements OnModuleInit {
  private readonly logger = new Logger(QiniuService.name)
  private mac: qiniu.auth.digest.Mac
  private config: qiniu.conf.Config
  private formUploader: qiniu.form_up.FormUploader
  private bucketManager: qiniu.rs.BucketManager

  constructor(
    @Inject(QINIU_CONFIG_PROVIDER) private options: QiniuModuleOptions,
  ) {}

  onModuleInit() {
    if (!this.options.accessKey || !this.options.secretKey || !this.options.bucket) {
      this.logger.warn('七牛云配置不完整，上传功能可能无法使用')
      return
    }

    try {
      this.mac = new qiniu.auth.digest.Mac(
        this.options.accessKey,
        this.options.secretKey,
      )

      // 创建配置对象
      this.config = new qiniu.conf.Config()

      // 创建上传器和资源管理器
      this.formUploader = new qiniu.form_up.FormUploader(this.config)
      this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config)

      this.logger.log(`七牛云服务初始化成功，存储空间: ${this.options.bucket}`)
    }
    catch (error) {
      this.logger.error('七牛云服务初始化失败:', error.message)
    }
  }

  /**
   * 上传文件
   */
  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const { folder = 'uploads', prefix = '' } = options

    if (!this.mac) {
      throw new BadRequestException('七牛云配置未初始化')
    }

    // 生成文件 key，统一放在 zeta 文件夹下
    const ext = this.getFileExtension(file.originalname)
    const hash = this.generateHash()
    const key = prefix
      ? `zeta/${folder}/${prefix}/${hash}${ext}`
      : `zeta/${folder}/${hash}${ext}`

    // 生成上传 token
    const uploadToken = this.generateUploadToken(key)

    // 上传文件
    try {
      const putExtra = new qiniu.form_up.PutExtra()
      const result = await this.formUploader.put(
        uploadToken,
        key,
        file.buffer,
        putExtra,
      )

      if (!result || !result.data) {
        throw new BadRequestException('上传失败')
      }

      return {
        url: this.getFullUrl(key),
        key,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      }
    }
    catch (error) {
      this.logger.error('上传失败:', error.message)
      throw new BadRequestException(`上传失败: ${error.message}`)
    }
  }

  /**
   * 上传 Base64 图片
   */
  async uploadBase64(
    base64: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const { folder = 'uploads', prefix = '' } = options

    if (!this.mac) {
      throw new BadRequestException('七牛云配置未初始化')
    }

    // 解析 base64
    const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) {
      throw new BadRequestException('无效的 Base64 图片格式')
    }

    const [, imageType, data] = matches
    // eslint-disable-next-line node/prefer-global/buffer
    const buffer = Buffer.from(data, 'base64')

    // 生成文件 key，统一放在 zeta 文件夹下
    const hash = this.generateHash()
    const key = prefix
      ? `zeta/${folder}/${prefix}/${hash}.${imageType}`
      : `zeta/${folder}/${hash}.${imageType}`

    // 生成上传 token
    const uploadToken = this.generateUploadToken(key)

    try {
      const putExtra = new qiniu.form_up.PutExtra()
      const result = await this.formUploader.put(
        uploadToken,
        key,
        buffer,
        putExtra,
      )

      if (!result || !result.data) {
        throw new BadRequestException('上传失败')
      }

      return {
        url: this.getFullUrl(key),
        key,
        name: `${hash}.${imageType}`,
        size: buffer.length,
        type: `image/${imageType}`,
      }
    }
    catch (error) {
      this.logger.error('上传失败:', error.message)
      throw new BadRequestException(`上传失败: ${error.message}`)
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string): Promise<boolean> {
    if (!this.mac) {
      throw new BadRequestException('七牛云配置未初始化')
    }

    try {
      const result = await this.bucketManager.delete(this.options.bucket, key)
      if (result.ok()) {
        this.logger.log(`文件删除成功: ${key}`)
        return true
      }
      throw new BadRequestException(`删除失败`)
    }
    catch (error) {
      this.logger.error('删除失败:', error.message)
      throw new BadRequestException(`删除失败: ${error.message}`)
    }
  }

  /**
   * 批量删除文件
   */
  async deleteFiles(keys: string[]): Promise<void> {
    if (!this.mac) {
      throw new BadRequestException('七牛云配置未初始化')
    }

    const deleteOperations = keys.map(key => qiniu.rs.deleteOp(this.options.bucket, key))

    try {
      const result = await this.bucketManager.batch(deleteOperations)
      if (result.ok()) {
        this.logger.log(`批量删除成功，共删除 ${keys.length} 个文件`)
        return
      }
      throw new BadRequestException(`批量删除失败`)
    }
    catch (error) {
      this.logger.error('批量删除失败:', error.message)
      throw new BadRequestException(`批量删除失败: ${error.message}`)
    }
  }

  /**
   * 获取上传 Token
   */
  getUploadToken(key?: string): string {
    if (!this.mac) {
      throw new BadRequestException('七牛云配置未初始化')
    }
    return this.generateUploadToken(key)
  }

  /**
   * 生成上传 Token
   */
  private generateUploadToken(key?: string): string {
    const scope = key
      ? `${this.options.bucket}:${key}`
      : this.options.bucket

    const putPolicy = new qiniu.rs.PutPolicy({
      scope,
      expires: 3600, // 1小时有效期
    })

    return putPolicy.uploadToken(this.mac)
  }

  /**
   * 获取完整 URL
   */
  private getFullUrl(key: string): string {
    const domain = this.options.domain.replace(/\/$/, '')
    return `${domain}/${key}`
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filename: string): string {
    const ext = filename.match(/\.(.[^.]*)$/)?.[1]
    return ext ? `.${ext}` : ''
  }

  /**
   * 生成随机 hash
   */
  private generateHash(): string {
    return randomBytes(8).toString('hex')
  }
}
