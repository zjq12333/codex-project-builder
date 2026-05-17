import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── Constants ──
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.dirname(__dirname);
const TEMPLATES_DIR = path.join(PLUGIN_ROOT, "templates");

const STAGES = {
  stage_1:  { id: "stage_1",  num: 1,  name: "产品定义 (PRD)",           emoji: "📋" },
  stage_2:  { id: "stage_2",  num: 2,  name: "技术方案设计",              emoji: "🏗️" },
  stage_3:  { id: "stage_3",  num: 3,  name: "数据模型设计",              emoji: "📊" },
  stage_4:  { id: "stage_4",  num: 4,  name: "API 设计",                 emoji: "🔌" },
  stage_5:  { id: "stage_5",  num: 5,  name: "项目骨架搭建",              emoji: "🦴" },
  stage_6:  { id: "stage_6",  num: 6,  name: "核心闭环实现",              emoji: "⚙️" },
  stage_7:  { id: "stage_7",  num: 7,  name: "权限和认证",                emoji: "🔐" },
  stage_8:  { id: "stage_8",  num: 8,  name: "真实执行器",                emoji: "🚀" },
  stage_9:  { id: "stage_9",  num: 9,  name: "日志和可观测性",            emoji: "📝" },
  stage_10: { id: "stage_10", num: 10, name: "测试补齐",                  emoji: "🧪" },
  stage_11: { id: "stage_11", num: 11, name: "前端 MVP",                 emoji: "🖥️" },
  stage_12: { id: "stage_12", num: 12, name: "部署准备",                  emoji: "📦" },
  stage_13: { id: "stage_13", num: 13, name: "产品化优化",                emoji: "✨" },
};

const STAGE_IDS = Object.keys(STAGES);

const TEMPLATE_FILES = [
  "PRD.md", "ARCHITECTURE.md", "API.md", "DATA_MODEL.md",
  "DEVELOPMENT.md", "TESTING.md", "DEPLOYMENT.md",
];

const VALIDATION_CHECKS = {
  stage_1: (dir) => {
    const prd = path.join(dir, "PRD.md");
    if (!fs.existsSync(prd)) return ["PRD.md: 文件不存在"];
    const content = fs.readFileSync(prd, "utf-8");
    const required = [
      { label: "一句话描述",      re: /一句话描述|产品描述|产品定位/ },
      { label: "目标用户",        re: /目标用户|用户群体/ },
      { label: "核心痛点",        re: /核心痛点|痛点/ },
      { label: "核心使用场景",    re: /核心.*场景|使用场景/ },
      { label: "MVP 功能列表",    re: /MVP.*功能|功能列表/ },
      { label: "暂不做的功能",    re: /暂不做|不做|未来.*功能/ },
      { label: "用户主流程",      re: /用户主流程|主流程|核心流程/ },
      { label: "成功指标",        re: /成功指标|指标/ },
      { label: "主要风险",        re: /风险/ },
      { label: "当前假设",        re: /假设/ },
    ];
    return required.filter(r => !r.re.test(content)).map(r => `PRD.md: 缺少 "${r.label}"`);
  },
  stage_2: (dir) => {
    const f = path.join(dir, "ARCHITECTURE.md");
    if (!fs.existsSync(f)) return ["ARCHITECTURE.md: 文件不存在"];
    const c = fs.readFileSync(f, "utf-8");
    const reqs = [/技术栈/, /模块划分|系统模块/, /数据流/, /技术风险/, /替代方案/];
    return reqs.filter(r => !r.test(c)).map(() => `ARCHITECTURE.md: 缺少必要章节`);
  },
  stage_3: (dir) => {
    const f = path.join(dir, "DATA_MODEL.md");
    if (!fs.existsSync(f)) return ["DATA_MODEL.md: 文件不存在"];
    const c = fs.readFileSync(f, "utf-8");
    return [/实体/, /字段/, /关系/, /索引/, /删除策略/]
      .filter(r => !r.test(c)).map(() => `DATA_MODEL.md: 缺少必要章节`);
  },
  stage_4: (dir) => {
    const f = path.join(dir, "API.md");
    if (!fs.existsSync(f)) return ["API.md: 文件不存在"];
    const c = fs.readFileSync(f, "utf-8");
    return [/Method|GET|POST|PUT|DELETE/, /Path/, /请求参数|Request/, /响应|Response/, /错误码/]
      .filter(r => !r.test(c)).map(() => `API.md: 缺少必要章节`);
  },
  stage_5: (dir) => [
    ...(!fs.existsSync(path.join(dir, "README.md")) ? ["README.md: 文件不存在"] : []),
    ...(!fs.existsSync(path.join(dir, ".env.example")) ? [".env.example: 文件不存在"] : []),
  ],
  stage_6: (dir) => {
    const has = ["tests", "__tests__", "test"].some(d => fs.existsSync(path.join(dir, d)));
    return has ? [] : ["tests/: 测试目录不存在，核心闭环必须有测试"];
  },
  stage_7: (dir) => [],
  stage_8: (dir) => [],
  stage_9: (dir) => [],
  stage_10: (dir) => {
    const has = ["tests", "__tests__", "test"].some(d => fs.existsSync(path.join(dir, d)));
    return has ? [] : ["tests/: 测试目录不存在"];
  },
  stage_11: (dir) => [],
  stage_12: (dir) => [
    ...(!fs.existsSync(path.join(dir, "Dockerfile")) ? ["Dockerfile: 文件不存在"] : []),
    ...(!fs.existsSync(path.join(dir, "DEPLOYMENT.md")) ? ["DEPLOYMENT.md: 文件不存在"] : []),
  ],
  stage_13: (dir) => [],
};

// ── Helpers ──
function metaPath(projectDir) {
  return path.join(projectDir, ".codeproject", "meta.json");
}

function loadMeta(projectDir) {
  const p = metaPath(projectDir);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function saveMeta(projectDir, meta) {
  meta.updated_at = new Date().toISOString();
  const p = metaPath(projectDir);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(meta, null, 2), "utf-8");
}

function buildDefaultMeta(projectName) {
  const now = new Date().toISOString();
  const stages = {};
  for (const id of STAGE_IDS) {
    stages[id] = { status: id === "stage_1" ? "in_progress" : "pending", completed_at: null };
  }
  return {
    project_name: projectName,
    current_stage: "stage_1",
    created_at: now,
    updated_at: now,
    stages,
  };
}

function safeCall(fn, errorLabel) {
  try {
    return fn();
  } catch (e) {
    const label = errorLabel || "tool_error";
    const msg = (e.message || "Unknown error").split("\n")[0].replace(/[A-Za-z]:\\[^\n\r,;\']*/g, "<path>");
    return { content: [{ type: "text", text: JSON.stringify({ error: label + ": " + msg }) }] };
  }
}

// ── Server ──
const server = new McpServer({
  name: "project-builder",
  version: "0.1.0",
});

// Tool: project_init
server.tool(
  "project_init",
  "初始化一个新项目。创建 .codeproject/meta.json 状态文件和所有模板文档（PRD.md 等）。",
  {
    project_dir: z.string().describe("项目目录的绝对路径"),
    project_name: z.string().describe("项目名称"),
  },
  async ({ project_dir, project_name }) => safeCall(() => {
    // Ensure project directory exists
    if (!fs.existsSync(project_dir)) {
      fs.mkdirSync(project_dir, { recursive: true });
    }

    const meta = buildDefaultMeta(project_name);
    saveMeta(project_dir, meta);

    const created = [];
    for (const tf of TEMPLATE_FILES) {
      const src = path.join(TEMPLATES_DIR, tf);
      const dst = path.join(project_dir, tf);
      if (fs.existsSync(src) && !fs.existsSync(dst)) {
        fs.copyFileSync(src, dst);
        created.push(tf);
      }
    }

    const agentsPath = path.join(project_dir, "AGENTS.md");
    if (!fs.existsSync(agentsPath)) {
      fs.writeFileSync(agentsPath, `# AI Development Agent Instructions\n\n项目: ${project_name}\n创建: ${meta.created_at}\n`, "utf-8");
      created.push("AGENTS.md");
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "ok",
          project_name,
          project_dir,
          current_stage: "阶段 1 - 产品定义 (PRD)",
          created_files: created,
          next_step: "告诉 AI：我要做一个软件：【描述你的想法】",
        }, null, 2),
      }],
    };
  }, "project_init failed")
);

// Tool: project_status
server.tool(
  "project_status",
  "查看项目当前进度。返回当前阶段、所有阶段的完成状态和下一步。",
  {
    project_dir: z.string().describe("项目目录的绝对路径"),
  },
  async ({ project_dir }) => safeCall(() => {
    const meta = loadMeta(project_dir);
    if (!meta) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "项目未初始化。请先调用 project_init。" }) }] };
    }

    const stages = STAGE_IDS.map(id => ({
      id,
      num: STAGES[id].num,
      name: STAGES[id].name,
      emoji: STAGES[id].emoji,
      status: meta.stages[id].status,
      completed_at: meta.stages[id].completed_at,
    }));

    const completed = stages.filter(s => s.status === "completed").length;
    const current = stages.find(s => s.status === "in_progress");
    const next = stages.find(s => s.status === "pending");

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          project_name: meta.project_name,
          current_stage: current ? `${current.emoji} ${current.num}. ${current.name}` : "全部完成 🎉",
          progress: `${completed}/${13}`,
          stages,
          next_step: next ? `${next.emoji} ${next.num}. ${next.name}` : null,
        }, null, 2),
      }],
    };
  }, "project_status failed")
);

// Tool: stage_complete
server.tool(
  "stage_complete",
  "标记一个阶段为完成，并自动进入下一阶段。调用前应先通过 stage_validate 验收。",
  {
    project_dir: z.string().describe("项目目录的绝对路径"),
    stage_id: z.enum(STAGE_IDS).describe("阶段 ID，如 stage_1"),
  },
  async ({ project_dir, stage_id }) => safeCall(() => {
    const meta = loadMeta(project_dir);
    if (!meta) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "项目未初始化" }) }] };
    }
    if (!meta.stages[stage_id]) {
      return { content: [{ type: "text", text: JSON.stringify({ error: `未知阶段: ${stage_id}` }) }] };
    }

    const info = STAGES[stage_id];
    meta.stages[stage_id].status = "completed";
    meta.stages[stage_id].completed_at = new Date().toISOString();

    const nextStage = STAGE_IDS
      .map(id => STAGES[id])
      .find(s => s.num > info.num);

    if (nextStage) {
      meta.current_stage = nextStage.id;
      meta.stages[nextStage.id].status = "in_progress";
    }

    saveMeta(project_dir, meta);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          completed: `${info.emoji} ${info.num}. ${info.name}`,
          next: nextStage ? `${nextStage.emoji} ${nextStage.num}. ${nextStage.name}` : "全部完成 🎉",
        }, null, 2),
      }],
    };
  }, "stage_complete failed")
);

// Tool: stage_validate
server.tool(
  "stage_validate",
  "对指定阶段运行验收检查，返回所有未通过的问题。",
  {
    project_dir: z.string().describe("项目目录的绝对路径"),
    stage_id: z.enum(STAGE_IDS).describe("阶段 ID，如 stage_1"),
  },
  async ({ project_dir, stage_id }) => safeCall(() => {
    const check = VALIDATION_CHECKS[stage_id];
    if (!check) {
      return { content: [{ type: "text", text: JSON.stringify({ error: `未知阶段: ${stage_id}` }) }] };
    }

    const issues = check(project_dir);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          stage: `${STAGES[stage_id].emoji} ${STAGES[stage_id].name}`,
          passed: issues.length === 0,
          issues,
          issue_count: issues.length,
        }, null, 2),
      }],
    };
  }, "stage_validate failed")
);

// Tool: project_report
server.tool(
  "project_report",
  "生成人类可读的项目进度报告，含进度条。",
  {
    project_dir: z.string().describe("项目目录的绝对路径"),
  },
  async ({ project_dir }) => safeCall(() => {
    const meta = loadMeta(project_dir);
    if (!meta) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "项目未初始化" }) }] };
    }

    const completed = STAGE_IDS.filter(id => meta.stages[id].status === "completed").length;
    const total = 13;
    const pct = Math.round((completed / total) * 100);
    const barLen = 20;
    const filled = Math.round((completed / total) * barLen);
    const bar = "█".repeat(filled) + "░".repeat(barLen - filled);

    const stages = STAGE_IDS.map(id => {
      const s = meta.stages[id];
      const icon = s.status === "completed" ? "✅" : s.status === "in_progress" ? "🔄" : "⬜";
      const date = s.completed_at ? ` — ${new Date(s.completed_at).toLocaleString("zh-CN")}` : "";
      return `${icon} ${STAGES[id].emoji} ${STAGES[id].num}. ${STAGES[id].name}${date}`;
    });

    const current = STAGE_IDS.find(id => meta.stages[id].status === "in_progress");

    return {
      content: [{
        type: "text",
        text: [
          `📁 ${meta.project_name}`,
          `进度: ${bar} ${completed}/${total} (${pct}%)`,
          "",
          ...stages,
          "",
          current ? `➡️ 当前正在: ${STAGES[current].emoji} ${STAGES[current].name}` : "🎉 项目开发完成！",
        ].join("\n"),
      }],
    };
  }, "project_report failed")
);

// ── Start ──
const transport = new StdioServerTransport();
await server.connect(transport);
