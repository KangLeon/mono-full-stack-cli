# 📱 项目模板选择指南

## 🎯 四种项目模板详解

### 1. `frontend-only` - 仅前端项目
**技术栈**: NextJS + TypeScript + Tailwind CSS
```
my-app/
├── apps/
│   └── frontend/          # NextJS 应用 (port: 3000)
├── packages/
│   ├── types/            # 共享类型
│   └── utils/            # 工具函数
└── package.json
```

**适用场景**:
- 纯前端项目 (SPA、静态网站)
- 需要服务端渲染的网站
- 不需要自定义后端API的项目

**启动命令**:
```bash
pnpm dev:frontend  # http://localhost:3000
```

---

### 2. `fullstack` - 全栈Web应用
**技术栈**: NextJS + NestJS + PostgreSQL
```
my-app/
├── apps/
│   ├── frontend/          # NextJS 应用 (port: 3000)
│   └── backend/           # NestJS API (port: 3001)
├── packages/
│   ├── types/            # 共享类型
│   ├── utils/            # 工具函数
│   └── api-client/       # API客户端
└── package.json
```

**适用场景**:
- 传统Web应用
- 管理后台系统
- 需要复杂业务逻辑的Web应用
- B端应用

**启动命令**:
```bash
pnpm dev                   # 启动所有服务
pnpm dev:frontend         # http://localhost:3000
pnpm dev:backend          # http://localhost:3001
```

---

### 3. `mobile-app` - 移动端应用 ⭐️ **推荐移动端开发**
**技术栈**: React Native (Expo) + NestJS + PostgreSQL
```
my-app/
├── apps/
│   ├── mobile/            # React Native 应用
│   └── backend/           # NestJS API (port: 3001)
├── packages/
│   ├── types/            # 共享类型
│   ├── utils/            # 工具函数
│   └── api-client/       # API客户端
└── package.json
```

**适用场景**:
- **纯移动端应用** ✅
- iOS/Android App开发
- 需要原生功能的移动应用
- 移动优先的产品

**技术优势**:
- ✅ **直连后端**: React Native直接调用NestJS API
- ✅ **高性能**: 无需通过NextJS中转，减少延迟
- ✅ **原生体验**: 使用Expo获得接近原生的性能
- ✅ **资源优化**: 不需要Web前端，节省服务器资源

**启动命令**:
```bash
pnpm dev:mobile          # 启动Expo开发服务器
pnpm dev:backend         # http://localhost:3001
```

---

### 4. `complete` - 完整全栈解决方案
**技术栈**: NextJS + NestJS + React Native + PostgreSQL
```
my-app/
├── apps/
│   ├── frontend/          # NextJS Web应用 (port: 3000)
│   ├── backend/           # NestJS API (port: 3001)
│   └── mobile/            # React Native 移动应用
├── packages/
│   ├── types/            # 共享类型
│   ├── utils/            # 工具函数
│   └── api-client/       # API客户端
└── package.json
```

**适用场景**:
- 需要Web + 移动端的完整解决方案
- 大型产品的MVP开发
- 需要多端同步的应用
- 企业级应用

**启动命令**:
```bash
pnpm dev                 # 启动所有服务
pnpm dev:frontend        # http://localhost:3000
pnpm dev:backend         # http://localhost:3001  
pnpm dev:mobile          # Expo开发服务器
```

## 🤔 如何选择模板？

### 移动端开发建议 📱

**如果你主要做移动端开发，推荐选择 `mobile-app` 模板：**

✅ **性能优势**:
- React Native 直接连接 NestJS API (localhost:3001)
- 避免NextJS中转，减少网络延迟
- 更快的API响应时间

✅ **架构简洁**:
- 移动端 ↔ 后端 (直连)
- 而不是：移动端 ↔ NextJS ↔ NestJS (多层)

✅ **资源优化**:
- 不需要维护Web前端
- 服务器资源全部用于API和移动端
- 更简单的部署架构

### 选择决策树

```
需要Web前端吗？
├─ 不需要 → 选择 `mobile-app` (React Native + NestJS)
└─ 需要
   ├─ 只要Web → 选择 `frontend-only` 或 `fullstack`
   └─ Web + 移动端 → 选择 `complete`

需要后端API吗？
├─ 不需要 → 选择 `frontend-only`
└─ 需要 → 选择其他模板
```

## 💡 技术栈对比

| 特性 | frontend-only | fullstack | mobile-app | complete |
|------|---------------|-----------|------------|----------|
| Web前端 | ✅ NextJS | ✅ NextJS | ❌ | ✅ NextJS |
| 移动端 | ❌ | ❌ | ✅ RN+Expo | ✅ RN+Expo |
| 后端API | ❌ | ✅ NestJS | ✅ NestJS | ✅ NestJS |
| 数据库 | ❌ | ✅ PostgreSQL | ✅ PostgreSQL | ✅ PostgreSQL |
| API性能 | - | Web优化 | **移动端优化** | 通用 |
| 部署复杂度 | 低 | 中 | **低** | 高 |
| 资源消耗 | 低 | 中 | **低** | 高 |

## 🚀 快速开始

```bash
# 移动端应用 (推荐移动开发)
mono-cli create my-mobile-app --template mobile-app

# 全栈Web应用
mono-cli create my-web-app --template fullstack

# 完整解决方案
mono-cli create my-complete-app --template complete

# 纯前端项目
mono-cli create my-frontend --template frontend-only
```

**选择 `mobile-app` 模板，享受更好的移动端开发体验！** 🎉 