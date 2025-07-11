# 🚀 Mono Full-Stack CLI

一个快速创建全栈 monorepo 项目的脚手架CLI工具，支持 NextJS、NestJS 和 React Native。

## ✨ 功能特性

- 🌐 **NextJS 前端**: 使用 TypeScript + Tailwind CSS + Radix UI
- 🔥 **NestJS 后端**: 集成 Drizzle ORM + PostgreSQL + Winston + Zod
- 📱 **React Native 移动端**: 使用 Expo + TypeScript + Zustand
- 📦 **Lerna Monorepo**: 统一管理多个应用
- 🛠️ **开发工具**: ESLint + Prettier + TypeScript
- 🔧 **包管理器支持**: pnpm、npm、yarn

## 🎯 项目模板

| 模板类型 | 包含内容 | 适用场景 |
|----------|----------|----------|
| `frontend-only` | NextJS | 纯前端项目 |
| `fullstack` | NextJS + NestJS | 全栈 Web 应用 |
| `mobile-app` | React Native + NestJS | 移动端 + 后端 |
| `complete` | NextJS + NestJS + React Native | 完整的全栈解决方案 |

## 📦 安装

```bash
# 全局安装
npm install -g @leona/mono-full-stack-cli

# 或者使用 npx 直接运行
npx @leona/mono-full-stack-cli create my-app
```

## 🚀 快速开始

### 创建新项目

```bash
# 交互式创建项目
mono-cli create my-awesome-app

# 使用指定模板
mono-cli create my-app --template fullstack

# 使用默认配置（跳过交互）
mono-cli create my-app --template complete --yes

# 在当前目录初始化
mono-cli init --template fullstack
```

### 命令选项

```bash
mono-cli create [project-name] [options]

选项:
  -t, --template <template>  指定项目模板 (frontend-only, fullstack, mobile-app, complete)
  -y, --yes                  使用默认配置，跳过交互式提示
  --skip-install            跳过依赖安装
  -h, --help                显示帮助信息
```

## 📁 生成的项目结构

```
my-app/
├── apps/                    # 应用程序
│   ├── frontend/           # NextJS 前端应用 (port: 3000) - 仅fullstack和complete模板
│   ├── backend/            # NestJS 后端应用 (port: 3001) - fullstack、mobile-app和complete模板
│   └── mobile/             # React Native 移动应用 - mobile-app和complete模板
├── packages/                # 共享包
│   ├── types/              # 共享类型定义
│   ├── utils/              # 共享工具函数
│   └── api-client/         # API 客户端 (fullstack模板)
├── package.json            # 根包配置
├── lerna.json             # Lerna 配置
├── pnpm-workspace.yaml    # PNPM 工作空间配置
└── README.md              # 项目说明
```

## 🛠️ 开发工作流

### 启动开发服务器

```bash
# 启动所有服务
pnpm dev

# 分别启动服务
pnpm dev:frontend     # NextJS 前端 (http://localhost:3000)
pnpm dev:backend      # NestJS 后端 (http://localhost:3001)
pnpm dev:mobile       # React Native 移动端 (Expo)
```

### 构建项目

```bash
# 构建所有应用
pnpm build

# 分别构建
pnpm build:frontend
pnpm build:backend
```

### 代码质量

```bash
# 代码检查
pnpm lint
pnpm type-check

# 格式化代码
pnpm lint:fix
```

### 数据库操作 (后端应用)

```bash
# 生成数据库迁移
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 打开数据库管理界面
pnpm db:studio

# 执行数据库种子
pnpm db:seed
```

## 🏗️ 技术栈详情

### 前端 (NextJS)
- **框架**: NextJS 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件库**: Radix UI + shadcn/ui
- **状态管理**: React Context / Zustand
- **开发工具**: ESLint + Prettier

### 后端 (NestJS)
- **框架**: NestJS
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM + Drizzle Kit
- **验证**: Zod + class-validator
- **日志**: Winston + Chalk (彩色日志)
- **文档**: Swagger/OpenAPI
- **安全**: Helmet + CORS
- **环境配置**: dotenv

### 移动端 (React Native)
- **框架**: React Native + Expo
- **导航**: React Navigation
- **状态管理**: Zustand
- **网络请求**: Axios
- **UI组件**: 自定义组件库
- **开发工具**: TypeScript + ESLint

### Monorepo 工具
- **包管理**: Lerna + pnpm/npm/yarn
- **工作空间**: 支持 pnpm workspaces
- **共享包**: 类型定义、工具函数、API客户端
- **版本管理**: Lerna conventional commits

## ⚙️ 环境配置

### 数据库配置 (后端应用)

1. 复制环境变量配置文件：
```bash
cp apps/backend/.env.example apps/backend/.env
```

2. 编辑 `.env` 文件：
```env
# 数据库连接
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# 应用配置
PORT=3001
NODE_ENV=development

# 安全配置
JWT_SECRET=your-super-secret-jwt-key
```

3. 运行数据库迁移：
```bash
pnpm db:generate
pnpm db:migrate
```

### 开发环境要求

- **Node.js**: >= 18.0.0
- **包管理器**: pnpm >= 8.0.0 (推荐) / npm / yarn
- **数据库**: PostgreSQL (后端应用)
- **移动开发**: Expo CLI (移动应用)

## 🔧 高级配置

### 自定义包管理器

```bash
# 使用 npm
mono-cli create my-app --template fullstack

# 在交互模式中选择包管理器
mono-cli create my-app
```

### 跳过依赖安装

```bash
# 跳过自动安装依赖
mono-cli create my-app --skip-install

# 手动安装依赖
cd my-app
pnpm install
```

### 自定义端口

生成的应用默认使用以下端口：
- 前端: 3000
- 后端: 3001

你可以在各应用的配置文件中修改端口设置。

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 更新日志

### v1.0.0
- ✨ 初始版本发布
- 🌐 支持 NextJS 前端应用生成
- 🔥 支持 NestJS 后端应用生成
- 📱 支持 React Native 移动应用生成
- 📦 Lerna monorepo 配置
- 🛠️ 完整的开发工具链

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

## 🙋‍♂️ 支持

如果你遇到任何问题或有功能建议，请：

1. 查看 [Issues](https://github.com/leona-team/mono-full-stack-cli/issues)
2. 创建新的 Issue
3. 加入我们的讨论

---

**享受编码！** 🎉 