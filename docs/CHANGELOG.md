# TravelGenie - 开发日志

> AI 自动维护的开发流水日志，用于保持上下文记忆  
> **规则**: 禁止覆盖，只能追加 (Append-Only)

---

## [2026-01-15 15:08] 项目初始化

### 📋 创建核心文档

- **Action**: 创建了项目需求文档体系
  - `docs/REQUIREMENTS.md` - 任务导向的需求与功能清单
  - `docs/CHANGELOG.md` - 本开发日志
  - `docs/TECH_CONTEXT.md` - 技术架构与上下文
- **Decision**: 采用"记忆架构"工作流
  - 文件系统作为长期记忆
  - 每次代码变更必须更新文档
  - 遵循 R-T-C-D 循环 (Read-Think-Code-Document)

### 🎯 需求确认

- **目标**: 开发旅游规划智能体 (TravelGenie)
- **核心功能**:

  1. AI 对话式交互 (阿里通义千问)
  2. 智能行程规划 (根据天数/预算/兴趣)
  3. 酒店/景点/美食推荐 (第三方 API)
  4. 费用预算计算与优化建议
  5. 路径路线图可视化 (高德地图)

- **技术栈**:

  - 前端: React 18 + TypeScript + Vite + Tailwind CSS
  - 后端: NestJS 10 + Prisma + PostgreSQL
  - AI: 阿里通义千问 API (SSE 流式输出)
  - 地图: 高德地图 JS API

- **UI 风格**: 清新旅行风 🌿 (薄荷绿/天空蓝配色)

### 📝 待确认问题

1. 后端是否确定使用 NestJS? (备选: Go + Gin)
2. 是否需要用户登录系统?
3. 行程数据持久化方式 (数据库 vs 本地存储)
4. 酒店/餐饮价格数据源 (实时 API vs 参考价)
5. 导出功能优先级 (MVP 是否包含)

---

## 开发记录模板

```markdown
## [YYYY-MM-DD HH:mm] <标题>

### 📝 修改内容

- **Files Changed**: `path/to/file1.ts`, `path/to/file2.tsx`
- **Action**: 简要描述做了什么

### 💡 决策理由

- **Why**: 为什么这么做? 有什么技术考量?

### 🐛 问题修复 (如适用)

- **Bug**: 简述问题
- **Root Cause**: 根因分析
- **Solution**: 解决方案

### ⚠️ 注意事项

- 需要特别注意的点
```

---

<!-- 以下是实际开发记录，按时间倒序追加 -->

## [2026-01-15 15:50] Phase 1: 项目基础搭建完成

### 📝 修改内容

- **Files Created**:
  - Frontend: `package.json`, `vite.config.ts`, `tailwind.config.js`, `src/main.tsx`, `src/App.tsx`, `src/pages/LandingPage.tsx`
  - Backend: `package.json`, `src/main.ts`, `src/app.module.ts`, `src/app.controller.ts`, `src/app.service.ts`
  - Mock Data: `backend/src/data/hotels-mock.json`, `attractions-mock.json`, `restaurants-mock.json`
  - Docs: `README.md`

### 📦 已创建的目录结构

```
d:\project\study\
├── frontend/              # React + Vite 前端
│   ├── src/
│   │   ├── pages/
│   │   │   └── LandingPage.tsx  # 首页
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/               # NestJS 后端
│   ├── src/
│   │   ├── data/          # Mock 数据
│   │   │   ├── hotels-mock.json (6家酒店)
│   │   │   ├── attractions-mock.json (7个景点)
│   │   │   └── restaurants-mock.json (9家餐厅)
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── app.service.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env.example
│
└── docs/
    ├── REQUIREMENTS.md
    ├── CHANGELOG.md
    └── TECH_CONTEXT.md
```

### 💡 决策理由

- **手动创建项目结构**: 避免使用 `npm create vite` 等交互式命令，防止卡住等待用户输入
- **Mock 数据优先**: 先用精选的 Mock 数据保证功能完整性，后期再接入更多 API
- **清新旅行风设计系统**: 在 Tailwind 配置中定义了薄荷绿/天空蓝配色方案

### 🎨 UI 设计亮点

- Landing Page 包含:
  - Hero 区域 + 搜索框
  - 3 个特性卡片 (AI 规划 / 路线可视化 / 费用透明)
  - Framer Motion 动画效果
  - 渐变背景 + Blob 动画装饰

### ⚠️ 待办事项

- [ ] 安装前后端依赖 (`pnpm install`)
- [ ] 启动开发服务器测试
- [ ] 创建 AI、Trip、Map 等功能模块
- [ ] 申请高德地图 API Key

---

## [2026-01-15 16:43] 修复 TypeScript 类型缓存问题

### 🐛 问题描述

- **Error**: `类型"AiService"上不存在属性"chatStream"。`
- **Location**: `backend/src/modules/ai/ai.controller.ts:L51`
- **Impact**: TypeScript 编译器报错，阻止开发

### 🔍 根因分析

- **实际情况**: `chatStream` 方法确实存在于 `ai.service.ts` 中（L64-L130）
- **原因**: TypeScript Language Server 的类型缓存未刷新
  - NestJS 增量编译可能未检测到 Service 文件更新
  - IDE 的类型定义缓存了旧版本

### ✅ 解决方案

- **Action**: 清除编译缓存和构建产物
  ```bash
  rm -rf dist node_modules/.cache
  ```
- **Effect**: 强制 TypeScript 重新分析类型定义
- **Alternative**: 如果问题仍然存在，可能需要重启 IDE 或 TypeScript Language Server

### 📝 记录要点

- **文件涉及**:
  - `backend/src/modules/ai/ai.service.ts` - 包含 `chatStream` 方法定义
  - `backend/src/modules/ai/ai.controller.ts` - 调用 `chatStream` 的位置
- **方法签名**:
  ```typescript
  async chatStream(options: {
    messages: QwenChatRequest['messages']
    temperature?: number
    maxTokens?: number
    onChunk: (chunk: string) => void
    onComplete: () => void
    onError: (error: Error) => void
  }): Promise<void>
  ```

### ⚠️ 预防措施

- 遇到"属性不存在"错误时，先确认代码是否真的缺失该属性
- 对于 NestJS 项目，清除 `dist` 目录通常能解决大部分类型问题
- 开发时建议启用 `watch` 模式，自动检测变更

---

## [2026-01-15 16:44] 修复 SSE 流式接口 404 错误

### 🐛 问题描述

- **Error**: `POST /api/ai/chat/stream` 返回 404 (Not Found)
- **Location**: 前端请求 `/api/ai/chat/stream` 时失败
- **Impact**: 无法使用流式聊天功能

### 🔍 根因分析

- **错误原因**: NestJS 的 `@Sse()` 装饰器默认只支持 GET 请求
- **前端实现**: `chatStore.ts` 使用 POST 方法发送请求（L79-87）
- **冲突**: 装饰器限制导致路由无法匹配，返回 404

### ✅ 解决方案

- **Action**: 修改 `ai.controller.ts` 的 `streamChat` 方法
  - 将 `@Sse('chat/stream')` 改为 `@Post('chat/stream')`
  - 手动注入 `@Res()` 响应对象
  - 手动设置 SSE 响应头：
    ```typescript
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    ```
  - 移除 RxJS Observable，改用直接写入响应流

### 📝 修改内容

- **Files Changed**: `backend/src/modules/ai/ai.controller.ts`
- **移除依赖**:
  - `@nestjs/common` 中的 `Sse`, `MessageEvent`
  - `rxjs` 中的 `Observable`, `Subject`
- **新增依赖**:
  - `@nestjs/common` 中的 `Res`
  - `express` 中的 `Response` 类型

### 💡 技术要点

**SSE 实现方式对比**:

1. **NestJS 原生 @Sse 装饰器**:

   - ✅ 优点: 简洁，自动处理响应头
   - ❌ 缺点: 只支持 GET 请求，无法接收 POST body
   - 适用场景: 简单的服务端推送

2. **手动 SSE 实现**:
   - ✅ 优点: 支持任意 HTTP 方法，可接收请求体
   - ✅ 优点: 完全控制响应流
   - ❌ 缺点: 需要手动设置响应头
   - 适用场景: 需要基于请求体内容推送数据

### ⚠️ 待验证

- [ ] 启动后端服务器，确认没有编译错误
- [ ] 前端发送消息，验证 SSE 流式响应是否正常
- [ ] 测试错误处理逻辑

---
