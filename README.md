# Project Builder · 项目构建器

> 13-stage software project lifecycle manager for zero-basis users.
> 面向零基础用户的 13 阶段软件项目生命周期管理器。

[English](#english) | [中文](#中文)

---

## English

### What It Does

Project Builder turns "I want to build an app" into a working, tested, deployable product — through 13 guided stages. It tracks progress across sessions, validates every stage, and never lets the AI skip steps.

### Who It's For

- People who have **never coded** but want to build software with AI
- AI coding agents (Codex, Cursor, Claude Code) that need structured project discipline
- Anyone who wants reproducible, testable, incremental software delivery

### The 13 Stages

| # | Stage | What You Get |
|---|-------|-------------|
| 1 | PRD | Product requirements doc |
| 2 | Architecture | Tech stack & system design |
| 3 | Data Model | Entities, fields, relationships |
| 4 | API Design | Endpoints, request/response specs |
| 5 | Skeleton | Runnable project scaffold |
| 6 | Core Loop | Create → Execute → Check → Result |
| 7 | Auth | Login, permissions, access control |
| 8 | Real Executor | Replace mocks with real business logic |
| 9 | Observability | Logging, tracing, audit |
| 10 | Tests | Unit, API, integration, edge cases |
| 11 | Frontend | Minimal usable UI |
| 12 | Deployment | Docker, env vars, health checks |
| 13 | Polish | Error messages, UX, docs, perf |

### How to Use

1. **Start a new project:** Tell your AI agent:
   > "我要做一个软件：【describe your idea】"

2. **Continue:** Say "继续" or "往下做" — the plugin remembers where you left off.

3. **Check progress:** Say "项目进度" or the AI auto-checks at session start.

### What's Inside

- **Skill** (`SKILL.md`) — 13-stage behavioral rules for the AI agent
- **MCP Server** — 5 tools for init, status, validation, stage management, and reporting
- **CLI Scripts** — Fallback `node scripts/*.js` commands
- **Templates** — 7 pre-built document templates (PRD, ARCH, API, DATA_MODEL, etc.)

### Architecture

```
project-builder/
├── .codex-plugin/plugin.json    # Plugin manifest
├── .mcp.json                    # MCP server config (stdio)
├── skills/project-builder/
│   └── SKILL.md                 # AI agent behavior rules
├── mcp/
│   ├── server.js                # MCP server (5 tools)
│   └── package.json             # @modelcontextprotocol/sdk
├── scripts/                     # CLI fallback
│   ├── init.js                  # Project initialization
│   ├── stage.js                 # Stage state tracker
│   ├── validate.js              # Acceptance checks
│   └── report.js                # Progress report
└── templates/                   # Document templates
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── API.md
    ├── DATA_MODEL.md
    ├── DEVELOPMENT.md
    ├── TESTING.md
    └── DEPLOYMENT.md
```

### MCP Tools

| Tool | Purpose |
|------|---------|
| `project_init` | Initialize project + generate templates |
| `project_status` | Read current stage and full progress |
| `stage_complete` | Mark stage done, auto-advance |
| `stage_validate` | Run acceptance checks |
| `project_report` | Human-readable progress report |

### Requirements

- Node.js >= 18
- Codex desktop app (for MCP integration)
- Dependencies auto-installed via `npm install` in `mcp/`

---

## 中文

### 它能做什么

Project Builder 把"我想做一个软件"变成可运行、可测试、可部署的产品——通过 13 个有引导的阶段推进。跨会话自动记住进度，每个阶段必须验收通过才能进入下一步，AI 不能跳阶段、不能假装完成。

### 适合谁

- **从未写过代码**但想用 AI 做软件的人
- 需要结构化项目纪律的 AI 编程助手（Codex、Cursor、Claude Code）
- 任何想要可复现、可测试、渐进式软件交付的人

### 13 个阶段

| 阶段 | 名称 | 产出 |
|------|------|------|
| 1 | 产品定义 | PRD.md — 用户、场景、MVP 范围 |
| 2 | 技术方案 | ARCHITECTURE.md — 技术栈、模块、数据流 |
| 3 | 数据模型 | DATA_MODEL.md — 实体、字段、关系、状态机 |
| 4 | API 设计 | API.md — 接口、参数、响应、错误码 |
| 5 | 项目骨架 | 可启动的项目框架 + 健康检查 |
| 6 | 核心闭环 | 创建→触发→状态→结果→失败处理 |
| 7 | 权限认证 | 登录、资源归属、越权测试 |
| 8 | 真实执行器 | 替换 mock 为真实业务逻辑 |
| 9 | 可观测性 | 日志、追踪、审计 |
| 10 | 测试补齐 | 单元/API/集成/边界测试 |
| 11 | 前端 MVP | 最小可用界面 |
| 12 | 部署准备 | Docker、环境变量、健康检查 |
| 13 | 产品优化 | 错误提示、体验、文档、性能 |

### 怎么用

1. **开始新项目：** 对 AI 说：
   > "我要做一个软件：【描述你的想法】"

2. **继续做：** 说"继续"或"往下做"——插件自动从上次断点继续。

3. **查看进度：** 说"项目进度"，或 AI 在每次对话开始时自动检查。

### 技术架构

```
project-builder/
├── .codex-plugin/plugin.json    # 插件清单
├── .mcp.json                    # MCP 配置 (stdio)
├── skills/project-builder/
│   └── SKILL.md                 # AI 行为规则
├── mcp/
│   ├── server.js                # MCP 服务 (5 个工具)
│   └── package.json             # @modelcontextprotocol/sdk
├── scripts/                     # CLI 备选
│   ├── init.js                  # 项目初始化
│   ├── stage.js                 # 阶段状态跟踪
│   ├── validate.js              # 验收检查
│   └── report.js                # 进度报告
└── templates/                   # 文档模板
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── API.md
    ├── DATA_MODEL.md
    ├── DEVELOPMENT.md
    ├── TESTING.md
    └── DEPLOYMENT.md
```

### MCP 工具

| 工具 | 作用 |
|------|------|
| `project_init` | 初始化项目 + 生成模板文档 |
| `project_status` | 查看当前阶段和全部进度 |
| `stage_complete` | 标记阶段完成，自动推进 |
| `stage_validate` | 运行验收检查 |
| `project_report` | 生成人类可读进度报告 |

### 环境要求

- Node.js >= 18
- Codex 桌面应用（MCP 集成需要）
- 依赖通过 `mcp/` 下的 `npm install` 自动安装

---

## License

MIT
