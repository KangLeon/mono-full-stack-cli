# 🎉 恭喜！CLI工具已成功发布到npm！

## 📦 发布信息

✅ **包名**: `mono-full-stack-cli`  
✅ **版本**: 1.0.0  
✅ **npm链接**: https://www.npmjs.com/package/mono-full-stack-cli  
✅ **大小**: 33.1 kB  

## 🚀 快速使用

### 全局安装

```bash
# 使用npm安装
npm install -g mono-full-stack-cli

# 使用pnpm安装
pnpm add -g mono-full-stack-cli

# 使用yarn安装
yarn global add mono-full-stack-cli
```

### 直接使用 (无需安装)

```bash
# 使用npx直接运行
npx mono-full-stack-cli create my-awesome-app

# 或使用create-mono-app别名
npx create-mono-app my-awesome-app
```

## 🎯 使用示例

### 1. 交互式创建项目

```bash
# 启动交互式创建流程
mono-cli create my-app

# 系统会提示你选择：
# 🎯 项目模板:
#   - 🌐 仅前端 (NextJS)
#   - 🔥 全栈 (NextJS + NestJS) 
#   - 📱 移动端 (React Native + NestJS)
#   - 🚀 完整版 (NextJS + NestJS + React Native)
# 
# 📦 包管理器:
#   - pnpm (推荐)
#   - npm
#   - yarn
```

### 2. 快速创建 (跳过交互)

```bash
# 创建移动端应用
mono-cli create my-mobile-app --template mobile-app --yes

# 创建全栈应用
mono-cli create my-web-app --template fullstack --yes

# 创建完整解决方案
mono-cli create my-complete-app --template complete --yes --skip-install
```

### 3. 使用别名命令

```bash
# 两个命令完全等价
mono-cli create my-app
create-mono-app my-app
```

### 4. 在当前目录初始化

```bash
# 在当前目录初始化项目
mono-cli init --template fullstack
```

## 📊 四种项目模板

| 模板 | 技术栈 | 适用场景 | 启动命令 |
|------|--------|----------|----------|
| `frontend-only` | NextJS | 纯前端项目 | `pnpm dev:frontend` |
| `fullstack` | NextJS + NestJS | Web全栈应用 | `pnpm dev` |
| `mobile-app` | React Native + NestJS | 移动端应用 | `pnpm dev:mobile` + `pnpm dev:backend` |
| `complete` | 全部技术栈 | 完整解决方案 | `pnpm dev` |

## 🔧 生成的项目结构

```
my-app/
├── apps/                    # 应用程序
│   ├── frontend/           # NextJS 前端 (fullstack, complete)
│   ├── backend/            # NestJS 后端 (fullstack, mobile-app, complete)  
│   └── mobile/             # React Native (mobile-app, complete)
├── packages/                # 共享包
│   ├── types/              # 共享类型定义
│   ├── utils/              # 工具函数
│   └── api-client/         # API客户端 (有后端的模板)
├── package.json            # 根配置
├── lerna.json             # Lerna配置
└── pnpm-workspace.yaml    # 工作空间配置
```

## 🛠️ 生成项目后的开发流程

### 1. 进入项目目录

```bash
cd my-app
```

### 2. 安装依赖 (如果跳过了安装)

```bash
pnpm install
```

### 3. 配置环境变量 (如果有后端)

```bash
# 复制环境变量模板
cp apps/backend/.env.example apps/backend/.env

# 编辑数据库连接信息
vim apps/backend/.env
```

### 4. 运行数据库迁移 (如果有后端)

```bash
# 生成数据库迁移
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 打开数据库管理界面
pnpm db:studio
```

### 5. 启动开发服务器

```bash
# 启动所有服务
pnpm dev

# 或分别启动
pnpm dev:frontend    # http://localhost:3000
pnpm dev:backend     # http://localhost:3001
pnpm dev:mobile      # Expo开发服务器
```

## 💡 技术栈详情

### 前端 (NextJS)
- ✅ NextJS 15 (App Router)
- ✅ TypeScript 
- ✅ Tailwind CSS
- ✅ Radix UI 组件
- ✅ ESLint + Prettier

### 后端 (NestJS) 
- ✅ NestJS 框架
- ✅ Drizzle ORM + PostgreSQL
- ✅ Winston 彩色日志
- ✅ Zod 数据验证
- ✅ Swagger API 文档
- ✅ Helmet + CORS 安全中间件

### 移动端 (React Native)
- ✅ Expo 框架
- ✅ TypeScript
- ✅ Zustand 状态管理
- ✅ Axios 网络请求
- ✅ React Navigation 导航
- ✅ 自定义UI组件

### Monorepo 工具
- ✅ Lerna 包管理
- ✅ pnpm/npm/yarn 工作空间
- ✅ 共享类型和工具库
- ✅ 统一的构建和部署流程

## 🎨 推荐的开发模式

### 移动端优先开发

如果你主要做移动端开发，推荐使用 `mobile-app` 模板：

```bash
mono-cli create my-mobile-app --template mobile-app --yes
cd my-mobile-app
pnpm dev:backend &    # 后台运行API服务器
pnpm dev:mobile       # 启动Expo开发服务器
```

**优势**:
- 🚀 React Native 直连 NestJS API，性能更好
- 🎯 专注移动端开发，无Web前端干扰
- 💰 节省服务器资源，部署更简单

### 全栈Web开发

```bash
mono-cli create my-web-app --template fullstack --yes
cd my-web-app
pnpm dev              # 同时启动前端和后端
```

### 完整产品开发

```bash
mono-cli create my-product --template complete --yes
cd my-product
pnpm dev              # 启动所有服务
```

## 🚨 常见问题

### Q: 如何更新CLI工具？
```bash
npm update -g mono-full-stack-cli
```

### Q: 如何卸载CLI工具？
```bash
npm uninstall -g mono-full-stack-cli
```

### Q: 生成的项目可以修改吗？
✅ 完全可以！生成的项目是完整的源代码，你可以自由修改和扩展。

### Q: 支持哪些数据库？
目前支持 PostgreSQL，未来版本会支持 MySQL 和 SQLite。

### Q: 可以添加认证功能吗？
✅ 可以！生成的 NestJS 后端已经配置好了基础架构，你可以轻松添加 JWT、OAuth 等认证功能。

## 🔗 相关链接

- 📦 **npm包**: https://www.npmjs.com/package/mono-full-stack-cli
- 📚 **源代码**: https://github.com/leona-team/mono-full-stack-cli
- 🐛 **问题反馈**: https://github.com/leona-team/mono-full-stack-cli/issues
- 📖 **文档**: README.md

## 🎉 开始你的全栈开发之旅吧！

```bash
# 立即开始
npx mono-full-stack-cli create my-awesome-project
```

**一行命令，创建整个全栈生态系统！** 🚀 