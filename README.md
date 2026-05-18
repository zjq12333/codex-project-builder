# Project Builder

`Project Builder` 是一个面向零基础用户的软件项目构建插件。它把“我想做一个软件”拆成 13 个明确阶段，让 AI 按阶段推进、记录进度、执行验收，并避免跳步骤或假装完成。

## 作用

- 把产品想法拆成可执行的 13 个阶段
- 为每个阶段提供固定文档模板
- 记录项目当前进度，支持跨会话恢复
- 在阶段结束前执行基本验收
- 同时提供 `Skill` 触发方式和 `MCP` 工具调用方式

## 适用场景

- 你想让 AI 从 0 到 1 帮你做一个软件
- 你不想一次性生成一堆不可控代码
- 你希望 AI 每一步都有阶段边界、文档产物和验收动作
- 你需要一个适合 `Codex` / `Cursor` / `Claude Code` 的项目推进框架

## 13 个阶段

1. `PRD`：产品定义
2. `Architecture`：技术方案
3. `Data Model`：数据模型
4. `API Design`：接口设计
5. `Skeleton`：项目骨架
6. `Core Loop`：核心闭环
7. `Auth`：权限与认证
8. `Real Executor`：真实执行器
9. `Observability`：日志与可观测性
10. `Tests`：测试补齐
11. `Frontend MVP`：前端最小可用版本
12. `Deployment`：部署准备
13. `Polish`：产品化优化

## 目录结构

```text
project-builder/
├── .codex-plugin/
│   └── plugin.json
├── .mcp.json
├── mcp/
│   ├── package.json
│   └── server.js
├── skills/
│   └── project-builder/
│       └── SKILL.md
├── scripts/
│   ├── init.js
│   ├── stage.js
│   ├── validate.js
│   └── report.js
└── templates/
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── API.md
    ├── DATA_MODEL.md
    ├── DEVELOPMENT.md
    ├── TESTING.md
    └── DEPLOYMENT.md
```

## 调用方式

### 1. 作为插件使用

启用后，用户可以直接对 AI 说：

- `从零做一个软件：……`
- `继续做`
- `检查项目进度`

这是最自然的调用方式，适合实际使用。

### 2. 作为 MCP 工具调用

插件暴露了 5 个 MCP 工具：

- `project_init`
- `project_status`
- `stage_complete`
- `stage_validate`
- `project_report`

适合代理、脚本或内部工具链直接调用。

### 3. 作为脚本调用

也可以直接运行本地脚本：

```powershell
node scripts\init.js <project-dir> <project-name>
node scripts\stage.js status <project-dir>
node scripts\stage.js complete <project-dir> <stage-id>
node scripts\validate.js <project-dir> <stage-id>
node scripts\report.js <project-dir>
```

## MCP 工具说明

### `project_init`

初始化项目，创建：

- `.codeproject/meta.json`
- `AGENTS.md`
- 所有阶段模板文档

### `project_status`

返回当前阶段、阶段完成情况和下一步。

### `stage_complete`

标记某一阶段完成，并自动推进到下一阶段。

### `stage_validate`

执行阶段验收，返回当前阶段存在的问题。

### `project_report`

生成人类可读的阶段进度报告。

## 依赖

- `Node.js >= 18`
- `@modelcontextprotocol/sdk`
- `zod`

`mcp/` 目录下运行：

```powershell
npm install
```

## 当前仓库

- GitHub: `https://github.com/zjq12333/codex-project-builder`

## 说明

- 这是一个插件，不只是单独的 `Skill`
- 插件内部同时包含 `Skill` 和 `MCP`
- 用户侧通常通过自然语言触发
- 工具侧通常通过 `MCP tools` 调用
