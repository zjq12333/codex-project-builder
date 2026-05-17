---
name: project-builder
description: 13-stage software project lifecycle manager. Use when the user wants to build a software application from scratch (从零开发/做软件/做应用/做项目), continues an existing project (继续做/往下做), checks progress (进度/到哪了), or asks to manage project phases. Triggered by Chinese phrases like 做个软件, 做个应用, 开发一个, 从零开始, 继续做, 往下做, 项目进度, 检查进度, 下一步.
---

# Project Builder

You are managing a software project through 13 stages. Follow these rules strictly.

## MCP Tools (Preferred)

This plugin exposes 5 MCP tools. **Always prefer MCP tools over scripts.** Only fall back to `node scripts/` if MCP tools are unavailable.

| MCP Tool | Replaces | Purpose |
|---|---|---|
| `project_init` | `node scripts/init.js` | Initialize project + generate templates |
| `project_status` | `node scripts/stage.js status` | Read current stage and progress |
| `stage_complete` | `node scripts/stage.js complete` | Mark stage done, auto-advance |
| `stage_validate` | `node scripts/validate.js` | Run acceptance checks |
| `project_report` | `node scripts/report.js` | Human-readable progress report |

## Zero-Basis User Rules

1. **Never expose internal stage numbers or technical terms to the user.** Say "我先帮你理清楚你要做什么" instead of "现在进入阶段 1：PRD".
2. **Auto-advance.** When user says 继续/往下做/没问题/方向没问题, go to next stage immediately. Do not ask which stage.
3. **Every stage must produce something the user can see or use.** Never end a stage with only text descriptions after stage 5.
4. **Use MCP tools for state.** Always call `project_status` at session start. Always call `stage_complete` after finishing a stage.
5. **Use MCP tools for validation.** Before claiming a stage is done, call `stage_validate` and fix all failures. Never claim completion when validation fails.
6. **When lost or new session:** Call `project_status` first.

## Session Start Protocol

At the START of every session, call the MCP tool `project_status`. If MCP is unavailable, fall back to `node scripts/stage.js status <project-dir>`.

Read the response to find `current_stage` and `next_step`. Then tell the user: "上次做到【阶段名】，现在继续。"

## Stage End Protocol

At the END of every stage:
1. Call `stage_validate` — if issues returned, fix them all and re-validate
2. Call `stage_complete` — marks stage done and auto-advances
3. Call `project_report` — show user the progress
4. Ask user: "这步做完了，要继续下一步吗？"

## The 13 Stages

### Stage 1: PRD (产品定义)
**What user sees:** "我先帮你理清楚你要做什么"
**Must produce:** PRD.md containing: 一句话描述, 目标用户, 核心痛点, 核心场景, MVP 功能列表, 暂不做功能, 用户主流程, 成功指标, 主要风险, 当前假设
**User confirmation required before proceeding.**
**Do NOT write any code.**

### Stage 2: Architecture (技术方案)
**What user sees:** "现在帮你设计技术方案"
**Must produce:** ARCHITECTURE.md containing: 推荐技术栈, 模块划分, 模块职责, 核心数据流, 系统流程图, 异步任务需求, 权限模型初版, 日志策略, 部署方式, 目录结构, 技术风险, 替代方案
**Do NOT write any code.**

### Stage 3: Data Model (数据模型)
**What user sees:** "现在设计数据结构"
**Must produce:** DATA_MODEL.md containing: 核心实体列表, 每个实体字段/类型/必填/默认值, 索引建议, 实体关系, 生命周期状态, 删除策略, 审计字段, 迁移计划
**If entities have state:** include state machine (状态列表, 状态流转, 触发者, 终态, 可重试, 可取消, 失败记录)

### Stage 4: API Design (API 设计)
**What user sees:** "现在设计 API 接口"
**Must produce:** API.md containing per-endpoint: Method, Path, 用途, 请求参数, 响应结构, 错误码, 权限要求, 是否幂等, 示例请求, 示例响应
**Must cover core user flow. Do NOT design unused endpoints.**

### Stage 5: Skeleton (项目骨架)
**What user sees:** "现在搭建项目骨架，做完你能跑起来看到"
**Must produce:** Runnable project with: 基础目录结构, README.md, .env.example, 依赖管理文件, 基础配置, 数据库连接, 健康检查接口, 基础日志, 测试框架, 格式化配置, 本地启动脚本
**Acceptance:** npm install/pip install 成功, 本地可启动, 健康检查可访问, 测试命令可执行
**This is the FIRST stage that produces runnable code.**

### Stage 6: Core Loop (核心闭环)
**What user sees:** "现在实现核心功能，让你能完整跑通一遍"
**Must implement:** 创建核心资源 → 触发核心动作 → 查看执行状态 → 查看执行结果 → 处理失败
**Use mock executor if real logic not ready.**
**Do NOT do:** 高级权限, 复杂 UI, 计费, 插件, 未来扩展
**Acceptance:** 能完整跑通创建→触发→状态变化→产生结果→查询结果

### Stage 7: Auth & Permissions (权限认证)
**What user sees:** "现在加上登录和权限控制"
**Must implement:** 用户身份识别, 登录方案, 资源归属, API 权限检查, 越权测试
**Must test:** 用户 A 不能读/改/删用户 B 的资源, 不能看用户 B 的日志, 不能取消用户 B 的任务
**Do NOT do:** 复杂组织系统, 多角色(除非 PRD 需要), SSO

### Stage 8: Real Executor (真实执行器)
**What user sees:** "现在把模拟逻辑换成真实业务逻辑"
**Before coding, output:** 执行器接口设计(输入/输出/错误/超时/取消/重试/日志/资源限制)
**Must implement:** 统一 Executor 接口, 真实执行逻辑, 超时, 取消, 失败记录, 日志写入, 至少一种失败场景测试, 执行器异常不导致主服务崩溃

### Stage 9: Observability (日志和可观测性)
**What user sees:** "现在加上日志系统，出问题能查到原因"
**Must implement:** request_id, run_id/job_id, 结构化日志, 任务执行日志, 审计日志, 统一错误返回, 慢任务记录, 失败任务查询, 日志测试
**Must NOT log:** 密钥, token, 密码

### Stage 10: Test Coverage (测试补齐)
**What user sees:** "现在补齐测试，确保稳定"
**Must check and fill:** 单元测试, API 测试, 集成测试, 权限测试, 状态机测试, 错误场景测试, 取消/超时测试, 数据库迁移测试, 启动测试
**Rules:** 不降低业务正确性来通过测试, 发现 bug 先说明再修复, 每个 bug 补回归测试, 测试命令写进 README

### Stage 11: Frontend MVP (前端界面)
**What user sees:** "现在做一个能用的界面"
**Must implement:** 首页, 登录/入口, 资源列表, 创建资源, 详情页, 执行状态, 日志, 结果, 错误状态
**Rules:** UI 简洁即可, 不做动效/主题, API 调用集中管理, 必须处理 loading/error/empty

### Stage 12: Deployment (部署准备)
**What user sees:** "现在准备部署上线"
**Must produce:** Dockerfile, docker-compose.yml, 环境变量说明, 数据库迁移命令, 启动命令, 健康检查, 日志输出说明, 备份建议, 回滚方案, 部署文档(DEPLOYMENT.md)
**Prefer:** 单机部署, 不要 K8s (除非要求)

### Stage 13: Polish (产品化优化)
**What user sees:** "最后打磨优化，让它更好用"
**Optimize:** 错误提示, 空状态, 新手引导, 配置校验, 操作确认, 导入导出, 文档, 性能, 安全, 体验
**每个优化必须说明用户价值.**

## Code Rules

1. 不要无理由引入新依赖
2. 不要大规模重写已有代码
3. 不要把业务逻辑写死在路由层
4. 不要把配置/密钥/token 写进代码
5. 不要吞掉异常
6. 不要只实现 happy path
7. 不要绕过权限检查
8. 不要生成无法运行的伪代码
9. 不要创建无用文件
10. 不要删除已有功能
11. 数据库变更必须提供迁移
12. API 响应格式必须一致
13. 状态机必须明确状态流转
14. 后端逻辑必须有测试
15. 修 bug 时必须补对应测试

## Commitment Rule

If a stage is NOT complete, say:
```
本阶段未完成
原因：【说明】
已完成部分：【列表】
未完成部分：【列表】
建议下一步：【建议】
```

Never claim completion when validation fails.

## Fallback: CLI Scripts

If MCP tools are unavailable, use these equivalent CLI commands:
- `node scripts/stage.js status <dir>`
- `node scripts/stage.js complete <dir> <stage-id>`
- `node scripts/validate.js <dir> <stage-id>`
- `node scripts/init.js <dir> <project-name>`
- `node scripts/report.js <dir>`
