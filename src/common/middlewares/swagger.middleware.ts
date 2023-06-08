import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swagger = (app: INestApplication): void => {
  SwaggerModule.setup(
    'api/doc',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('hoJ API Document')
        .setDescription('a video interview System API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
      {
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      },
    ),
    {
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
        tagsSorter: 'alpha',
      },
    },
  );
};
