import path from 'path'
import fs from 'fs-extra'
import { exec } from 'child_process'
import { promisify } from 'util'
import { ProjectConfig } from '../types/index.js'

const execAsync = promisify(exec)

/**
 * 生成Lerna monorepo配置
 */
export async function generateLernaConfig(
    projectPath: string,
    config: ProjectConfig
): Promise<void> {
    // 初始化Lerna
    await execAsync('npx lerna init', { cwd: projectPath })

    // 创建根目录package.json
    await createRootPackageJson(projectPath, config)

    // 创建lerna.json配置
    await createLernaConfig(projectPath, config)

    // 创建workspace配置
    await createWorkspaceConfig(projectPath, config)

    // 创建共享包
    await createSharedPackages(projectPath, config)

    // 创建根目录配置文件
    await createRootConfigs(projectPath, config)
}

/**
 * 创建根目录package.json
 */
async function createRootPackageJson(
    projectPath: string,
    config: ProjectConfig
): Promise<void> {
    const packageJson = {
        name: config.name,
        private: true,
        workspaces: ['apps/*', 'packages/*'],
        scripts: {
            // 开发命令
            dev: 'lerna run dev --parallel',
            'dev:frontend': 'lerna run dev --scope="@*/frontend"',
            'dev:backend': 'lerna run dev --scope="@*/backend"',
            'dev:mobile': 'lerna run start --scope="@*/mobile"',

            // 构建命令
            build: 'lerna run build',
            'build:frontend': 'lerna run build --scope="@*/frontend"',
            'build:backend': 'lerna run build --scope="@*/backend"',

            // 测试命令
            test: 'lerna run test',
            'test:watch': 'lerna run test:watch --parallel',

            // 代码检查
            lint: 'lerna run lint',
            'lint:fix': 'lerna run lint:fix',
            'type-check': 'lerna run type-check',

            // 数据库相关（如果有后端）
            ...(config.features.backend && {
                'db:generate': 'lerna run db:generate --scope="@*/backend"',
                'db:migrate': 'lerna run db:migrate --scope="@*/backend"',
                'db:studio': 'lerna run db:studio --scope="@*/backend"',
                'db:seed': 'lerna run db:seed --scope="@*/backend"',
            }),

            // 依赖管理
            clean: 'lerna clean && rm -rf node_modules',
            bootstrap: 'lerna bootstrap',
            install:
                config.packageManager === 'pnpm'
                    ? 'pnpm install'
                    : `${config.packageManager} install`,

            // 发布相关
            version: 'lerna version',
            publish: 'lerna publish',

            // 工具命令
            fresh: 'rm -rf node_modules apps/*/node_modules packages/*/node_modules && pnpm install',
        },
        devDependencies: {
            lerna: '^8.0.0',
            '@types/node': '^20.0.0',
            typescript: '^5.0.0',
            prettier: '^3.0.0',
            eslint: '^8.0.0',
        },
        engines: {
            node: '>=18.0.0',
            [config.packageManager]: '>=8.0.0',
        },
        packageManager:
            config.packageManager === 'pnpm' ? 'pnpm@8.0.0' : undefined,
    }

    await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, {
        spaces: 2,
    })
}

/**
 * 创建lerna.json配置
 */
async function createLernaConfig(
    projectPath: string,
    config: ProjectConfig
): Promise<void> {
    const lernaConfig = {
        $schema: 'node_modules/lerna/schemas/lerna-schema.json',
        version: '0.0.0',
        npmClient: config.packageManager,
        command: {
            publish: {
                conventionalCommits: true,
                message: 'chore(release): publish',
                registry: 'https://registry.npmjs.org/',
            },
            bootstrap: {
                ignore:
                    config.packageManager === 'npm' ? 'component-*' : undefined,
                npmClientArgs:
                    config.packageManager === 'pnpm'
                        ? ['--no-package-lock']
                        : undefined,
            },
        },
        packages: ['apps/*', 'packages/*'],
    }

    await fs.writeJson(path.join(projectPath, 'lerna.json'), lernaConfig, {
        spaces: 2,
    })
}

/**
 * 创建workspace配置
 */
async function createWorkspaceConfig(
    projectPath: string,
    config: ProjectConfig
): Promise<void> {
    if (config.packageManager === 'pnpm') {
        // 创建pnpm-workspace.yaml
        const workspaceContent = `packages:
  - 'apps/*'
  - 'packages/*'
`

        await fs.writeFile(
            path.join(projectPath, 'pnpm-workspace.yaml'),
            workspaceContent
        )

        // 创建.npmrc配置
        const npmrcContent = `shared-workspace-lockfile=true
link-workspace-packages=true
prefer-workspace-packages=true
hoist-pattern[]=*eslint*
hoist-pattern[]=*prettier*
`

        await fs.writeFile(path.join(projectPath, '.npmrc'), npmrcContent)
    }
}

/**
 * 创建共享包
 */
async function createSharedPackages(
    projectPath: string,
    config: ProjectConfig
): Promise<void> {
    const packagesDir = path.join(projectPath, 'packages')
    await fs.ensureDir(packagesDir)

    // 创建共享类型包
    await createTypesPackage(packagesDir, config)

    // 创建共享工具包
    await createUtilsPackage(packagesDir, config)

    // 如果有前端和后端，创建API客户端包
    if (config.features.frontend && config.features.backend) {
        await createApiClientPackage(packagesDir, config)
    }
}

/**
 * 创建共享类型包
 */
async function createTypesPackage(
    packagesDir: string,
    config: ProjectConfig
): Promise<void> {
    const typesDir = path.join(packagesDir, 'types')
    await fs.ensureDir(typesDir)

    const packageJson = {
        name: `@${config.name}/types`,
        version: '1.0.0',
        private: true,
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
            build: 'tsc',
            dev: 'tsc --watch',
            clean: 'rm -rf dist',
        },
        devDependencies: {
            typescript: '^5.0.0',
        },
    }

    await fs.writeJson(path.join(typesDir, 'package.json'), packageJson, {
        spaces: 2,
    })

    // 创建TypeScript配置
    const tsConfig = {
        extends: '../../tsconfig.json',
        compilerOptions: {
            outDir: './dist',
            rootDir: './src',
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist'],
    }

    await fs.writeJson(path.join(typesDir, 'tsconfig.json'), tsConfig, {
        spaces: 2,
    })

    // 创建源码目录
    const srcDir = path.join(typesDir, 'src')
    await fs.ensureDir(srcDir)

    // 基础类型定义
    const indexContent = `// 用户相关类型
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页类型
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 环境类型
export type Environment = 'development' | 'production' | 'test';

// 导出所有类型
export * from './api';
`

    await fs.writeFile(path.join(srcDir, 'index.ts'), indexContent)

    // API类型定义
    const apiTypesContent = `// API端点类型
export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
}

// 重新导入User类型
import { User } from './index';
`

    await fs.writeFile(path.join(srcDir, 'api.ts'), apiTypesContent)
}

/**
 * 创建共享工具包
 */
async function createUtilsPackage(
    packagesDir: string,
    config: ProjectConfig
): Promise<void> {
    const utilsDir = path.join(packagesDir, 'utils')
    await fs.ensureDir(utilsDir)

    const packageJson = {
        name: `@${config.name}/utils`,
        version: '1.0.0',
        private: true,
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
            build: 'tsc',
            dev: 'tsc --watch',
            clean: 'rm -rf dist',
        },
        dependencies: {
            'date-fns': '^3.0.0',
        },
        devDependencies: {
            typescript: '^5.0.0',
            '@types/node': '^20.0.0',
        },
    }

    await fs.writeJson(path.join(utilsDir, 'package.json'), packageJson, {
        spaces: 2,
    })

    // TypeScript配置
    const tsConfig = {
        extends: '../../tsconfig.json',
        compilerOptions: {
            outDir: './dist',
            rootDir: './src',
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist'],
    }

    await fs.writeJson(path.join(utilsDir, 'tsconfig.json'), tsConfig, {
        spaces: 2,
    })

    // 创建工具函数
    const srcDir = path.join(utilsDir, 'src')
    await fs.ensureDir(srcDir)

    const indexContent = `export * from './format';
export * from './validation';
export * from './constants';
`

    await fs.writeFile(path.join(srcDir, 'index.ts'), indexContent)

    // 格式化工具
    const formatContent = `import { format } from 'date-fns';

/**
 * 格式化日期
 */
export function formatDate(date: Date | string, pattern = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern);
}

/**
 * 格式化货币
 */
export function formatCurrency(amount: number, currency = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
`

    await fs.writeFile(path.join(srcDir, 'format.ts'), formatContent)

    // 验证工具
    const validationContent = `/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证密码强度
 */
export function isStrongPassword(password: string): boolean {
  // 至少8位，包含大小写字母、数字和特殊字符
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * 验证手机号格式
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^1[3-9]\\d{9}$/;
  return phoneRegex.test(phone);
}
`

    await fs.writeFile(path.join(srcDir, 'validation.ts'), validationContent)

    // 常量定义
    const constantsContent = `/**
 * API端点
 */
export const API_ENDPOINTS = {
  USERS: '/users',
  AUTH: '/auth',
} as const;

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败',
  INVALID_EMAIL: '邮箱格式不正确',
  INVALID_PASSWORD: '密码格式不正确',
  REQUIRED_FIELD: '此字段为必填项',
} as const;

/**
 * 应用配置
 */
export const APP_CONFIG = {
  API_TIMEOUT: 10000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
`

    await fs.writeFile(path.join(srcDir, 'constants.ts'), constantsContent)
}

/**
 * 创建API客户端包
 */
async function createApiClientPackage(
    packagesDir: string,
    config: ProjectConfig
): Promise<void> {
    const apiClientDir = path.join(packagesDir, 'api-client')
    await fs.ensureDir(apiClientDir)

    const packageJson = {
        name: `@${config.name}/api-client`,
        version: '1.0.0',
        private: true,
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
            build: 'tsc',
            dev: 'tsc --watch',
            clean: 'rm -rf dist',
        },
        dependencies: {
            axios: '^1.6.0',
            [`@${config.name}/types`]: '1.0.0',
        },
        devDependencies: {
            typescript: '^5.0.0',
        },
    }

    await fs.writeJson(path.join(apiClientDir, 'package.json'), packageJson, {
        spaces: 2,
    })

    // TypeScript配置
    const tsConfig = {
        extends: '../../tsconfig.json',
        compilerOptions: {
            outDir: './dist',
            rootDir: './src',
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist'],
    }

    await fs.writeJson(path.join(apiClientDir, 'tsconfig.json'), tsConfig, {
        spaces: 2,
    })

    // 创建API客户端
    const srcDir = path.join(apiClientDir, 'src')
    await fs.ensureDir(srcDir)

    const indexContent = `export * from './client';
export * from './endpoints';
`

    await fs.writeFile(path.join(srcDir, 'index.ts'), indexContent)

    // API客户端
    const clientContent = `import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@${config.name}/types';

export class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL = 'http://localhost:3001') {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 可以在这里添加认证token
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // 处理错误响应
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
`

    await fs.writeFile(path.join(srcDir, 'client.ts'), clientContent)

    // API端点
    const endpointsContent = `import { apiClient } from './client';
import type { User, CreateUserRequest, UpdateUserRequest } from '@${config.name}/types';

export const userApi = {
  async getUsers() {
    return apiClient.get<User[]>('/users');
  },

  async getUser(id: string) {
    return apiClient.get<User>(\`/users/\${id}\`);
  },

  async createUser(data: CreateUserRequest) {
    return apiClient.post<User>('/users', data);
  },

  async updateUser(id: string, data: UpdateUserRequest) {
    return apiClient.put<User>(\`/users/\${id}\`, data);
  },

  async deleteUser(id: string) {
    return apiClient.delete(\`/users/\${id}\`);
  },
};
`

    await fs.writeFile(path.join(srcDir, 'endpoints.ts'), endpointsContent)
}

/**
 * 创建根目录配置文件
 */
async function createRootConfigs(
    projectPath: string,
    config: ProjectConfig
): Promise<void> {
    // 创建根目录TypeScript配置
    const tsConfig = {
        compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'node',
            lib: ['ES2022'],
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            declaration: true,
            declarationMap: true,
            sourceMap: true,
            resolveJsonModule: true,
        },
        include: [],
        exclude: ['node_modules', '**/dist', '**/build'],
    }

    await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, {
        spaces: 2,
    })

    // 创建Prettier配置
    const prettierConfig = {
        semi: true,
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
    }

    await fs.writeJson(path.join(projectPath, '.prettierrc'), prettierConfig, {
        spaces: 2,
    })

    // 创建ESLint配置
    const eslintConfig = {
        root: true,
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint'],
        extends: ['eslint:recommended', '@typescript-eslint/recommended'],
        env: {
            node: true,
            es2022: true,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    }

    await fs.writeJson(path.join(projectPath, '.eslintrc.json'), eslintConfig, {
        spaces: 2,
    })

    // 创建.gitignore
    const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
/build
/dist
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Mobile
*.mobileprovision
*.p8
*.p12
*.key
*.pem

# Expo
.expo/
dist/
web-build/

# Database
*.db
*.sqlite

# Temporary folders
tmp/
temp/
`

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent)

    // 创建README
    const readmeContent = `# ${config.name}

一个基于 Lerna 的全栈 monorepo 项目，包含：

${
    config.features.frontend
        ? '- 🌐 **前端**: NextJS + TypeScript + Tailwind CSS'
        : ''
}
${
    config.features.backend
        ? '- 🔥 **后端**: NestJS + Drizzle ORM + PostgreSQL + Winston'
        : ''
}
${config.features.mobile ? '- 📱 **移动端**: React Native + Expo' : ''}

## 快速开始

### 安装依赖

\`\`\`bash
${config.packageManager} install
\`\`\`

### 启动开发服务器

\`\`\`bash
# 启动所有服务
${config.packageManager} run dev

# 或分别启动
${
    config.features.frontend
        ? `${config.packageManager} run dev:frontend  # http://localhost:3000`
        : ''
}
${
    config.features.backend
        ? `${config.packageManager} run dev:backend   # http://localhost:3001`
        : ''
}
${
    config.features.mobile
        ? `${config.packageManager} run dev:mobile     # Expo开发工具`
        : ''
}
\`\`\`

## 项目结构

\`\`\`
${config.name}/
├── apps/                    # 应用程序
${
    config.features.frontend
        ? '│   ├── frontend/           # NextJS 前端应用'
        : ''
}
${
    config.features.backend
        ? '│   ├── backend/            # NestJS 后端应用'
        : ''
}
${
    config.features.mobile
        ? '│   └── mobile/             # React Native 移动应用'
        : ''
}
├── packages/                # 共享包
│   ├── types/              # 共享类型定义
│   ├── utils/              # 共享工具函数
${
    config.features.frontend && config.features.backend
        ? '│   └── api-client/        # API 客户端'
        : ''
}
├── package.json            # 根包配置
├── lerna.json             # Lerna 配置
${
    config.packageManager === 'pnpm'
        ? '└── pnpm-workspace.yaml   # PNPM 工作空间配置'
        : ''
}
\`\`\`

## 开发指南

### 构建项目

\`\`\`bash
${config.packageManager} run build
\`\`\`

### 运行测试

\`\`\`bash
${config.packageManager} run test
\`\`\`

### 代码检查

\`\`\`bash
${config.packageManager} run lint
${config.packageManager} run type-check
\`\`\`

${
    config.features.backend
        ? `### 数据库操作

\`\`\`bash
# 生成数据库迁移
${config.packageManager} run db:generate

# 执行数据库迁移
${config.packageManager} run db:migrate

# 打开数据库管理界面
${config.packageManager} run db:studio
\`\`\`

### 环境变量

复制 \`.env.example\` 到 \`.env\` 并填入相应的配置：

\`\`\`bash
cp apps/backend/.env.example apps/backend/.env
\`\`\`
`
        : ''
}

## 技术栈

${
    config.features.frontend
        ? `### 前端
- **框架**: NextJS 15
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件**: Radix UI
- **状态管理**: React Context/Zustand
`
        : ''
}

${
    config.features.backend
        ? `### 后端
- **框架**: NestJS
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **验证**: Zod
- **日志**: Winston + Chalk
- **文档**: Swagger
`
        : ''
}

${
    config.features.mobile
        ? `### 移动端
- **框架**: React Native + Expo
- **导航**: React Navigation
- **状态管理**: Zustand
- **网络**: Axios
`
        : ''
}

## 贡献指南

1. Fork 项目
2. 创建功能分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 打开 Pull Request

## 许可证

此项目基于 MIT 许可证。查看 [LICENSE](LICENSE) 文件了解更多信息。
`

    await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent)
}
