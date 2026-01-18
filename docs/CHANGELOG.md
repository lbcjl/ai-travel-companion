# 开发日志 (Development Log)

> AI 自动维护的开发日志，用于保持上下文记忆。

## [2026-01-18 08:49] 项目初始化

**Action**: 创建智能旅游规划应用项目

**Decision**:

- 采用 Monorepo 结构，便于前后端代码共享和类型定义
- 技术栈：React 19 + NestJS 10 + TypeScript
- 数据库：TypeORM + SQLite（简化部署）
- AI集成：阿里通义千问 API

**Files Created**:

- `docs/REQUIREMENTS.md` - 项目需求文档
- `docs/CHANGELOG.md` - 本文件
- `docs/TECH_CONTEXT.md` - 技术上下文（待创建）

**Next Steps**:

- 查询阿里通义千问 API 官方文档
- 初始化后端 NestJS 项目
- 初始化前端 React 项目

## [2026-01-18 08:58] 开始执行 - 根级别配置

**Action**: 创建 Monorepo 根级别配置文件

**User Confirmation**:

- ✅ 使用 pnpm 进行包管理
- ✅ 已有通义千问 API Key
- ✅ 同意 Monorepo 结构
- ✅ 前端设计风格符合预期

**Files Created**:

- `package.json` - 根 package.json，配置 pnpm workspaces
- `pnpm-workspace.yaml` - pnpm workspace 配置
- `.gitignore` - Git 忽略文件
- `.env.example` - 环境变量模板
- `README.md` - 项目说明文档

**Next**: 初始化后端 NestJS 项目

## [2026-01-18 09:10] 后端开发完成

**Action**: 创建后端 NestJS 应用

**Files Created**:

- `backend/package.json` - 后端依赖配置
- `backend/src/main.ts` - NestJS 入口
- `backend/src/app.module.ts` - 根模块
- `backend/src/entities/` - TypeORM 实体（Conversation, Message, TravelPlan）
- `backend/src/chat/` - Chat 模块（集成通义千问 API）
  - `qwen.service.ts` - 通义千问 API 封装
  - `chat.service.ts` - 聊天业务逻辑
  - `chat.controller.ts` - REST API 端点
- `backend/src/travel/` - Travel 模块

**Key Features**:

- TypeORM + SQLite 数据库
- 通义千问 AI 集成（支持流式响应）
- RESTful API 设计
- 系统提示词优化（旅行规划师助手）

## [2026-01-18 09:15] 前端开发完成

**Action**: 创建前端 React 应用

**Files Created**:

- `frontend/package.json` - 前端依赖（React 19 + Vite）
- `frontend/src/index.css` - 设计系统（旅游主题配色）
- `frontend/src/components/`
  - `ChatInterface.tsx` - 主聊天界面
  - `MessageBubble.tsx` - 消息气泡组件
  - `InputBox.tsx` - 输入框组件
- `frontend/src/hooks/useChat.ts` - 聊天状态管理
- `frontend/src/services/api.ts` - API 服务封装

**Design Highlights**:

- 独特配色：深海蓝 → 日落橙 → 薰衣草紫
- 字体：Outfit (display) + Crimson Pro (serif)
- 玻璃拟态效果 + 微妙的背景动画
- 流畅的消息动画
- 响应式设计

**Next**: 安装依赖并启动应用测试

## [2026-01-18 10:08] 集成 LangChain 框架

**Action**: 使用 LangChain 替代直接 API 调用

**Changes**:

- 安装 LangChain 依赖（`langchain`, `@langchain/openai`, `@langchain/core`, `zod`）
- 创建 `backend/src/chat/langchain.service.ts` - 使用 ChatOpenAI 连接通义千问
- 更新 `ChatModule` 和 `ChatService` 使用 LangChainService
- LangChain 提供更好的消息管理和可扩展性

## [2026-01-18 10:10] 优化 AI 输出格式

**Action**: 增强 System Prompt，要求更详细的旅行方案

**Enhanced Requirements**:

1. **每日详细行程**: 具体到时间段（如 09:00-12:00），包含上午/中午/下午/傍晚活动
2. **每日美食推荐**: 必须包含具体餐厅名称、特色菜品和人均消费（早/午/晚餐 + 小吃）
3. **每日预算明细**: 使用 Markdown 表格展示交通/门票/餐饮/其他费用，含每日小计
4. **住宿和交通指南**: 推荐区域、不同档次选择、价格范围
5. **实用贴士**: 最佳旅游季节、注意事项、省钱技巧

**Format**: 所有输出使用结构化 Markdown，善用表格、列表和表情符号

**Next**: 测试新的 AI 输出格式

## [2026-01-18 10:16] 前端UI优化

**Action**: 修复输入框滚动条和错误提示显示

**Changes**:

1. **隐藏输入框滚动条**
   - 在 `InputBox.css` 添加 `scrollbar-width: none` 和 `::-webkit-scrollbar` 样式
   - 支持 Firefox、Chrome、Edge 等浏览器

2. **优化错误提示**
   - 创建 `Toast.tsx` 和 `Toast.css` 组件
   - 移除固定显示的错误消息块
   - 错误时在右上角显示 Toast 弹窗
   - 3秒后自动消失，带滑入滑出动画

**Next**: 继续实施高德地图路线图功能

## [2026-01-18 10:20] 高德地图集成 Phase 1-3 完成

**Action**: 实施高德地图路线图功能（后端+前端）

### Phase 1: 后端Map Module

创建完整的地图服务模块：

- `backend/src/map/amap.service.ts` - 高德API封装（地理编码、静态地图）
- `backend/src/map/map.service.ts` - 业务逻辑层
- `backend/src/map/map.controller.ts` - REST API端点
- `backend/src/map/dto/` - DTO定义

**API端点：**

- `GET /api/map/geocode` - 单个地址解析
- `POST /api/map/generate` - 批量生成地图

### Phase 2: AI Prompt优化

更新LangChain System Prompt：

- 要求**Markdown表格格式**输出每日行程
- 表格必须包含：序号 | 时间 | 类型 | 名称 | **完整地址** | 停留时长 | 费用 | 说明
- 地址格式：城市+区域+街道+门牌号
- 餐厅必须是真实名称和地址

### Phase 3: 前端地图组件

创建React地图组件：

- `frontend/src/services/mapApi.ts` - 地图API服务
- `frontend/src/components/RouteMap.tsx` - 交互式地图组件
- `frontend/src/components/RouteMap.css` - 地图样式
- `frontend/src/vite-env.d.ts` - 环境变量类型
- `frontend/.env` - 前端环境配置

**地图功能：**

- 高德地图SDK动态加载
- 序号标记（1️⃣2️⃣3️⃣）
- 不同类型图标（景点/餐厅/酒店）
- 路线连接线
- 点击显示信息窗口

**Next**: Phase 4 - 集成测试和优化

## [2026-01-18 10:40] 环境变量统一管理 + 地图测试成功 ✅

**Action**: 优化项目环境变量管理结构

**Issue**:

- 环境变量分散在根目录和 `frontend/` 目录
- 前后端配置混乱，难以维护

**Solution**:

1. **删除** `frontend/.env` 和 `frontend/.env.example`
2. **统一**所有配置到根目录 `.env`
3. **配置** Vite 读取根目录：`vite.config.ts` 中 `envDir: '../'`
4. **规范命名**：
   - 后端：`AMAP_WEB_API_KEY`（无前缀）
   - 前端：`VITE_AMAP_JS_API_KEY`（VITE\_ 前缀）
5. **添加**安全密钥支持：`VITE_AMAP_SECURITY_KEY`

**Result**:

- ✅ 环境变量集中管理（只有一个 `.env`）
- ✅ 地图功能测试成功（北京3景点显示正常）
- ✅ 标记点、路线连接、信息窗口正常工作
- ✅ 创建环境变量配置指南文档

- ✅ 创建环境变量配置指南文档

## [2026-01-18 11:05] 地图组件增强与真实路径规划

**Action**: 增强 RouteMap 组件功能，实现真实道路导航

**Features**:

- **信息窗口增强**:
  - 显示详细位置信息（好玩的/highlights、好吃的/food）
  - 显示交通出行建议（transportation）
  - UI 美化（圆形序号、分类标签、图标）

- **真实路径规划**:
  - 集成 `AMap.Driving` 插件
  - 替代直线连接，显示真实道路轨迹
  - 保留自定义序号标记（1️⃣2️⃣3️⃣）同时隐藏默认起终点标记
  - 自动避障和最佳路线计算

- **Bug Fix**:
  - 修复地图标记序号显示问题（改用自定义 DOM 标记）
  - 修复路线不显示问题
  - 统一环境变量管理

**Next**: 集成到聊天界面，解析 AI 表格数据

## [2026-01-18 11:15] 地图功能集成到聊天窗口

**Action**: 实现 AI 生成行程自动展示 interactive map

**Features**:

- **自动解析 (Smart Parsing)**:
  - 自动识别 Markdown 中的行程表格
  - 提取 POI 名称、地址、时间、类型等元数据
- **批量地理编码 (Batch Geocoding)**:
  - 后台自动批量获取地点经纬度
  - 智能匹配北京默认坐标（防错误的 Fallback）
- **无缝集成**:
  - 聊天气泡底部自动追加地图卡片
  - 加载状态动画
- **Prompt 增强**:
  - 要求 AI 提供"好玩的"、"好吃的"、"交通"等丰富信息，并显示在地图上

**Next**: 全面端到端测试与 UI 细节打磨

## [2026-01-18 11:40] 行程规划真实性增强 (Realism & Weather)

**Action**: 深度优化 AI 规划逻辑，集成实时天气数据

**Features**:

- **地图分天展示 (Day-by-Day Map)**:
  - 自动将行程按天拆分
  - 提供 [第1天] [第2天] 切换 Tab
  - 解决所有点挤在一张图导致视角过大的问题
- **天气感知 (Weather Awareness)**:
  - 集成 `wttr.in` 免费天气服务
  - AI 自动根据目的地未来天气调整行程建议（e.g., 雨天推荐室内活动）
- **真实往返交通**:
  - 新增“往返大交通”板块，提供真实的航班号/高铁车次及预估票价
  - 强制 AI 确认出发地信息
- **具体住宿推荐**:
  - 拒绝模糊建议，强制推荐真实存在的酒店名称
  - 增加地段优势分析

**Fix**:

- 修复行程缺乏往返交通规划的问题
- **修复地图坐标回退问题**: 解析失败的地点不再默认显示在北京，而是直接过滤，避免地图视角错误

## [2026-01-18 12:05] 真实数据集成 - 高德地图 Web 服务

**Action**: 后端实现 `GaodeService`，通过 Web API 直连高德 POI 数据库

**Data**:

- **实时 POI 搜索**: 并发获取目的地城市的**热门美食**与**真实酒店**
- **上下文注入**: 将 API 返回的真实地点数据注入 AI System Prompt
- **效果**: AI 推荐的餐厅和酒店均为高德地图中真实存在的地点（包含评分、地址、人均消费）

**Fix**:

- **路线图净化**: 严格指令禁止 AI 将出发地（如机场/车站）放入行程表，解决地图跨度过大问题
- **中文日期解析**: 修复前端无法识别 "第三天" 格式导致地图空白的 Bug

## [2026-01-18 11:25] 聊天体验升级 - 支持富文本渲染

**Action**: 引入Markdown渲染引擎，优化AI回复可读性

**Improvements**:

- **Markdown 支持**: 使用 `react-markdown` + `remark-gfm` 完全替代简单的文本格式化
- **表格渲染**: 行程表现在以美观的 HTML 表格呈现，支持横向滚动，样式适配深色玻璃拟态主题
- **排版优化**: 优化了标题、列表、粗体的显示效果，提升阅读体验
- **无缝衔接**: 地图组件与新渲染的 Markdown 内容完美融合

**Fix**: 解决之前表格以纯文本显示不直观的问题
