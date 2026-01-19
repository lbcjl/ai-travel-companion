# 技术上下文文档 (Technical Context)

## 项目架构

### 整体结构（Monorepo）

> **Cloud Architecture**:
>
> - **Frontend**: Vercel (Edge Network)
> - **Backend**: Render (Web Service)
> - **Database**: Neon / Supabase (PostgreSQL)

```
study/
├── docs/                    # 📚 项目文档
│   ├── REQUIREMENTS.md      # 需求文档
│   ├── CHANGELOG.md         # 开发日志
│   ├── TECH_CONTEXT.md      # 技术架构
│   └── DEPLOY.md            # 🚀 部署指南
├── frontend/                # 🎨 React 前端
│   ├── src/
│   │   ├── components/      # UI 组件
│   │   ├── services/        # API 服务
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── types/           # TypeScript 类型
│   │   └── App.tsx
│   ├── public/
│   └── package.json
├── backend/                 # ⚙️ NestJS 后端
│   ├── src/
│   │   ├── chat/            # 聊天模块
│   │   ├── travel/          # 旅行方案模块
│   │   ├── database/        # 数据库配置
│   │   └── main.ts
│   └── package.json
├── shared/                  # 🔗 共享类型定义
│   └── types/
└── package.json             # 根 package.json
```

## 技术栈详细信息

### 前端技术栈

| 技术       | 版本    | 用途                 |
| ---------- | ------- | -------------------- |
| React      | 19.x    | UI 框架              |
| TypeScript | 5.x     | 类型安全             |
| Vite       | 最新    | 构建工具             |
| Axios      | 最新    | HTTP 客户端          |
| CSS        | Vanilla | 样式（遵循设计规范） |

### 后端技术栈

| 技术               | 版本 | 用途         |
| ------------------ | ---- | ------------ |
| NestJS             | 10.x | 服务端框架   |
| TypeScript         | 5.x  | 类型安全     |
| TypeORM            | 最新 | ORM          |
| SQLite             | 3.x  | 数据库       |
| @alicloud/qwen-sdk | TBD  | 通义千问 SDK |

## 核心数据模型

### 1. Conversation（对话会话）

```typescript
interface Conversation {
	id: string // UUID
	userId?: string // 可选，用户 ID（未来）
	messages: Message[] // 消息列表
	travelPlan?: TravelPlan // 关联的旅行方案
	createdAt: Date
	updatedAt: Date
}
```

### 2. Message（消息）

```typescript
interface Message {
	id: string // UUID
	conversationId: string // 所属会话
	role: 'user' | 'assistant' | 'system'
	content: string // 消息内容
	timestamp: Date
}
```

### 3. TravelPlan（旅行方案）

```typescript
interface TravelPlan {
	id: string // UUID
	conversationId: string // 来源会话
	destination: string // 目的地
	startDate?: Date // 开始日期
	endDate?: Date // 结束日期
	duration?: number // 天数
	budget?: number // 预算
	travelers?: number // 旅行人数
	itinerary: DayItinerary[] // 每日行程
	accommodations?: Accommodation[] // 住宿推荐
	transportation?: TransportInfo // 交通信息
	budgetBreakdown?: BudgetItem[] // 预算明细
	tips?: string[] // 实用贴士
	createdAt: Date
}

interface DayItinerary {
	day: number // 第几天
	date?: Date
	activities: Activity[] // 活动列表
}

interface Activity {
	time?: string // 时间（如 "09:00"）
	title: string // 活动标题
	description?: string // 描述
	location?: string // 地点
	duration?: string // 持续时间
	cost?: number // 费用
	tips?: string // 提示
}
```

## API 端点设计

### Chat API

```
POST   /api/chat/message          # 发送消息并获取 AI 回复
GET    /api/chat/conversations    # 获取对话列表
GET    /api/chat/:id              # 获取单个对话详情
DELETE /api/chat/:id              # 删除对话
```

### Travel Plan API

```
GET    /api/travel/plans          # 获取所有方案
GET    /api/travel/plans/:id      # 获取单个方案
POST   /api/travel/plans          # 手动创建方案
DELETE /api/travel/plans/:id      # 删除方案
```

## 阿里通义千问集成

### 环境变量配置

```env
# .env
QWEN_API_KEY=your_api_key_here
QWEN_MODEL=qwen-turbo           # 或 qwen-plus, qwen-max
```

### System Prompt（系统提示词）

```
你是一位专业的旅行规划师助手。你的任务是通过与用户的对话，收集以下信息：
1. 目的地（国家/城市）
2. 出行时间（起止日期或天数）
3. 旅行预算
4. 同行人数和类型（独自/情侣/家庭/朋友）
5. 兴趣偏好（自然风光/历史文化/美食/购物/冒险等）
6. 特殊需求（住宿标准、交通方式、身体限制等）

收集到足够信息后，请生成一份详细的旅行方案，包括：
- 每日行程安排
- 景点推荐（含开放时间、门票）
- 餐饮建议
- 住宿推荐
- 交通指南
- 预算明细
- 实用贴士

请以友好、专业的口吻与用户交流，并在生成方案时使用结构化的 JSON 格式。
```

## 前端设计系统

### 配色方案

```css
/* 主题色 - 旅游风格渐变 */
--color-primary: hsl(200, 95%, 55%); /* 海洋蓝 */
--color-secondary: hsl(25, 95%, 60%); /* 日落橙 */
--color-accent: hsl(280, 70%, 65%); /* 紫罗兰 */

/* 深色模式背景 */
--bg-dark: hsl(220, 20%, 10%);
--bg-dark-elevated: hsl(220, 18%, 15%);

/* 玻璃拟态效果 */
--glass-bg: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: 12px;
```

### 字体

- **主字体**: Inter (Google Fonts)
- **标题字体**: Poppins (Google Fonts)
- **代码字体**: Fira Code

### 动画时长

- **快速**: 150ms (hover, focus)
- **标准**: 300ms (展开/收起)
- **慢速**: 500ms (页面过渡)

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式（同时启动前后端）
npm run dev

# 仅前端
npm run dev:frontend

# 仅后端
npm run dev:backend

# 构建
npm run build

# 测试
npm run test
```

## 注意事项

1. **API Key 安全**: 通义千问 API Key 必须存储在环境变量中，不可提交到 Git
2. **类型共享**: 前后端共享的类型定义放在 `shared/types/` 目录
3. **错误处理**: 所有 API 调用必须有完善的错误处理
4. **用户体验**: AI 回复使用流式响应（SSE），提供打字效果
