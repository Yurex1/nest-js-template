import { ConfigService } from '@nestjs/config';
import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('NestJS Template API')
  .setDescription('A comprehensive NestJS API template with user management')
  .setVersion('1.0.0')
  .addTag('user', 'User management endpoints')
  .addTag('auth', 'Authentication endpoints')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addServer(
    `http://localhost:${new ConfigService().get<number>('PORT') ?? 3000}`,
    'Development server',
  )
  .addServer('https://api.yourapp.com', 'Production server')
  .build();

export const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
  customfavIcon: '/favicon.ico',
  customSiteTitle: 'NestJS API Documentation',
  customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .scheme-container { background: #1f2937; padding: 15px; border-radius: 5px; }
    `,
};
