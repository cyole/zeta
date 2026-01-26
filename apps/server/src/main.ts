import type { OpenAPIObject } from '@nestjs/swagger'
import { join } from 'node:path'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import 'reflect-metadata'

function wrapResponseSchema(document: OpenAPIObject): void {
  document.components = document.components || {}
  document.components.schemas = document.components.schemas || {}
  document.components.schemas.Response = {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'object' },
      timestamp: { type: 'string', example: new Date().toISOString() },
    },
  }

  for (const path of Object.keys(document.paths)) {
    const pathItem = document.paths[path] as Record<string, unknown>
    for (const method of Object.keys(pathItem)) {
      const operation = pathItem[method] as Record<string, unknown> | undefined
      if (operation?.responses) {
        const response200 = (operation.responses as Record<string, unknown>)['200'] as Record<string, unknown> | undefined
        if (response200?.content) {
          const content = response200.content as Record<string, unknown>
          const jsonContent = content['application/json'] as Record<string, unknown> | undefined
          const originalSchema = jsonContent?.schema as Record<string, unknown> | undefined

          content['application/json'] = {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: originalSchema || { type: 'object' },
                timestamp: { type: 'string', example: new Date().toISOString() },
              },
            },
          }
        }
      }
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)

  // Global prefix
  app.setGlobalPrefix('api')

  // Static files for uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  })

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  })

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter())

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  )

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Zeta API')
      .setDescription('前端提效平台 API 文档')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)

    wrapResponseSchema(document)

    SwaggerModule.setup('api/docs', app, document)
  }

  const port = configService.get('PORT', 3001)
  await app.listen(port)

  console.log(`🚀 Server is running on http://localhost:${port}`)
  console.log(`📚 API Docs: http://localhost:${port}/api/docs`)
}

bootstrap()
