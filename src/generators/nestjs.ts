import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs-extra'
import { ProjectConfig } from '../types/index.js'

const execAsync = promisify(exec)

/**
 * 生成NestJS应用
 */
export async function generateNestjsApp(
    projectPath: string,
    config: ProjectConfig
): Promise<void> {
    const backendPath = path.join(projectPath, 'apps', 'backend')

    // 使用nest cli创建项目
    const createCommand = [
        'npx @nestjs/cli new',
        'backend',
        '--package-manager',
        config.packageManager,
        '--skip-git',
        '--strict',
    ].join(' ')

    // 在apps目录中执行
    const appsDir = path.join(projectPath, 'apps')
    await fs.ensureDir(appsDir)

    await execAsync(createCommand, { cwd: appsDir })

    // 修改package.json
    await updateNestjsPackageJson(backendPath, config)

    // 添加数据库配置
    await addDatabaseConfig(backendPath, config)

    // 添加日志配置
    await addLoggingConfig(backendPath, config)

    // 添加验证配置
    await addValidationConfig(backendPath, config)

    // 创建基础模块
    await createBaseModules(backendPath, config)
}

/**
 * 更新NestJS package.json
 */
async function updateNestjsPackageJson(
    backendPath: string,
    config: ProjectConfig
): Promise<void> {
    const packageJsonPath = path.join(backendPath, 'package.json')
    const packageJson = await fs.readJson(packageJsonPath)

    // 更新项目信息
    packageJson.name = `@${config.name}/backend`
    packageJson.private = true

    // 添加额外的依赖
    packageJson.dependencies = {
        ...packageJson.dependencies,
        // 数据库相关
        'drizzle-orm': '^0.42.0',
        'drizzle-kit': '^0.31.0',
        postgres: '^3.4.0',
        '@neondatabase/serverless': '^1.0.0',

        // 验证相关
        zod: '^3.25.0',
        'class-validator': '^0.14.0',
        'class-transformer': '^0.5.1',

        // 日志相关
        winston: '^3.11.0',
        chalk: '^5.3.0',
        'nest-winston': '^1.9.0',

        // 工具类
        dotenv: '^16.5.0',
        '@nestjs/config': '^3.0.0',
        '@nestjs/swagger': '^7.0.0',
        helmet: '^7.0.0',
        compression: '^1.7.4',
    }

    packageJson.devDependencies = {
        ...packageJson.devDependencies,
        '@types/node': '^20.0.0',
        '@types/compression': '^1.7.0',
    }

    // 更新scripts
    packageJson.scripts = {
        ...packageJson.scripts,
        'start:dev': 'nest start --watch --port 3001',
        'start:debug': 'nest start --debug --watch --port 3001',
        'start:prod': 'node dist/main --port 3001',
        'db:generate': 'drizzle-kit generate',
        'db:migrate': 'drizzle-kit migrate',
        'db:studio': 'drizzle-kit studio',
        'db:push': 'drizzle-kit push',
        'db:seed': 'tsx src/database/seed.ts',
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}

/**
 * 添加数据库配置
 */
async function addDatabaseConfig(
    backendPath: string,
    config: ProjectConfig
): Promise<void> {
    // 创建drizzle配置
    const drizzleConfigContent = `import { defineConfig } from 'drizzle-kit';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export default defineConfig({
  schema: './src/database/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
`

    await fs.writeFile(
        path.join(backendPath, 'drizzle.config.ts'),
        drizzleConfigContent
    )

    // 创建数据库模块
    const databaseDir = path.join(backendPath, 'src', 'database')
    await fs.ensureDir(databaseDir)

    // 数据库连接
    const databaseContent = `import { drizzle } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import * as schema from './schema';

config();

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export type Database = typeof db;
`

    await fs.writeFile(path.join(databaseDir, 'database.ts'), databaseContent)

    // 创建schema目录和基础schema
    const schemaDir = path.join(databaseDir, 'schema')
    await fs.ensureDir(schemaDir)

    // 用户schema示例
    const userSchemaContent = `import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  name: z.string().min(1).max(255),
  email: z.string().email(),
});

export const selectUserSchema = createSelectSchema(users);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
`

    await fs.writeFile(path.join(schemaDir, 'users.ts'), userSchemaContent)

    // 创建index文件
    const indexContent = `export * from './users';
`

    await fs.writeFile(path.join(schemaDir, 'index.ts'), indexContent)

    // 创建.env示例文件
    const envExampleContent = `# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Application
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key
`

    await fs.writeFile(
        path.join(backendPath, '.env.example'),
        envExampleContent
    )
}

/**
 * 添加日志配置
 */
async function addLoggingConfig(
    backendPath: string,
    config: ProjectConfig
): Promise<void> {
    const loggerDir = path.join(backendPath, 'src', 'logger')
    await fs.ensureDir(loggerDir)

    const loggerContent = `import { Injectable } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import chalk from 'chalk';

const { combine, timestamp, printf, colorize } = winston.format;

// 自定义格式化函数
const customFormat = printf(({ level, message, timestamp }) => {
  const coloredLevel = level.includes('error') 
    ? chalk.red(level.toUpperCase())
    : level.includes('warn')
    ? chalk.yellow(level.toUpperCase())
    : level.includes('info')
    ? chalk.blue(level.toUpperCase())
    : chalk.green(level.toUpperCase());
    
  return \`\${chalk.gray(timestamp)} [\${coloredLevel}] \${message}\`;
});

@Injectable()
export class LoggerService {
  private readonly logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
      timestamp(),
      customFormat
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log' 
      }),
    ],
  });

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(message, trace);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}

export const winstonConfig = WinstonModule.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});
`

    await fs.writeFile(path.join(loggerDir, 'logger.service.ts'), loggerContent)
}

/**
 * 添加验证配置
 */
async function addValidationConfig(
    backendPath: string,
    config: ProjectConfig
): Promise<void> {
    const validationDir = path.join(backendPath, 'src', 'validation')
    await fs.ensureDir(validationDir)

    // Zod验证管道
    const zodPipeContent = `import { 
  PipeTransform, 
  Injectable, 
  ArgumentMetadata, 
  BadRequestException 
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(\`Validation failed: \${error.message}\`);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
`

    await fs.writeFile(
        path.join(validationDir, 'zod-validation.pipe.ts'),
        zodPipeContent
    )
}

/**
 * 创建基础模块
 */
async function createBaseModules(
    backendPath: string,
    config: ProjectConfig
): Promise<void> {
    // 更新主模块
    const appModuleContent = `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LoggerService, winstonConfig } from './logger/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonConfig),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule {}
`

    await fs.writeFile(
        path.join(backendPath, 'src', 'app.module.ts'),
        appModuleContent
    )

    // 创建用户模块
    const usersDir = path.join(backendPath, 'src', 'users')
    await fs.ensureDir(usersDir)

    // 用户控制器
    const usersControllerContent = `import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UsePipes 
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from '../validation/zod-validation.pipe';
import { UsersService } from './users.service';
import { insertUserSchema, type User, type NewUser } from '../database/schema';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Get all users' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Get user by id' })
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(+id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(insertUserSchema))
  @ApiResponse({ status: 201, description: 'Create new user' })
  async create(@Body() createUserDto: NewUser): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
`

    await fs.writeFile(
        path.join(usersDir, 'users.controller.ts'),
        usersControllerContent
    )

    // 用户服务
    const usersServiceContent = `import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../database/database';
import { users, type User, type NewUser } from '../database/schema';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UsersService {
  constructor(private readonly logger: LoggerService) {}

  async findAll(): Promise<User[]> {
    this.logger.log('Finding all users');
    return await db.select().from(users);
  }

  async findOne(id: number): Promise<User | null> {
    this.logger.log(\`Finding user with id: \${id}\`);
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async create(userData: NewUser): Promise<User> {
    this.logger.log(\`Creating new user: \${userData.email}\`);
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }
}
`

    await fs.writeFile(
        path.join(usersDir, 'users.service.ts'),
        usersServiceContent
    )

    // 用户模块
    const usersModuleContent = `import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LoggerService } from '../logger/logger.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, LoggerService],
  exports: [UsersService],
})
export class UsersModule {}
`

    await fs.writeFile(
        path.join(usersDir, 'users.module.ts'),
        usersModuleContent
    )

    // 更新主文件
    const mainContent = `import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Winston日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('${config.name} API')
    .setDescription('${config.name} Backend API Documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(\`🚀 Backend server is running on http://localhost:\${port}\`);
  console.log(\`📚 API documentation available at http://localhost:\${port}/api/docs\`);
}

bootstrap();
`

    await fs.writeFile(path.join(backendPath, 'src', 'main.ts'), mainContent)
}
