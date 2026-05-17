// init.js — Initialize a new project with .codeproject/meta.json and template docs
// Usage: node init.js <project-dir> <project-name>

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const projectDir = args[0];
const projectName = args[1];

if (!projectDir || !projectName) {
  console.log("Usage: node init.js <project-dir> <project-name>");
  process.exit(1);
}

// Find the plugin root (where templates/ lives)
const scriptDir = __dirname;
const pluginRoot = path.dirname(scriptDir);
const templatesDir = path.join(pluginRoot, "templates");

// Create .codeproject
const cpDir = path.join(projectDir, ".codeproject");
fs.mkdirSync(cpDir, { recursive: true });

const now = new Date().toISOString();
const meta = {
  project_name: projectName,
  current_stage: "stage_1",
  created_at: now,
  updated_at: now,
  stages: {
    stage_1:  { status: "in_progress",  completed_at: null },
    stage_2:  { status: "pending",      completed_at: null },
    stage_3:  { status: "pending",      completed_at: null },
    stage_4:  { status: "pending",      completed_at: null },
    stage_5:  { status: "pending",      completed_at: null },
    stage_6:  { status: "pending",      completed_at: null },
    stage_7:  { status: "pending",      completed_at: null },
    stage_8:  { status: "pending",      completed_at: null },
    stage_9:  { status: "pending",      completed_at: null },
    stage_10: { status: "pending",      completed_at: null },
    stage_11: { status: "pending",      completed_at: null },
    stage_12: { status: "pending",      completed_at: null },
    stage_13: { status: "pending",      completed_at: null },
  }
};

fs.writeFileSync(path.join(cpDir, "meta.json"), JSON.stringify(meta, null, 2), "utf-8");

// Copy template files
const templates = {
  "AGENTS.md": `# AI Development Agent Instructions

你是我的 AI 软件开发代理。你的任务是协助我从 0 到 1 开发一个真实可运行、可测试、可迭代的软件应用。

你必须严格遵守 Project Builder 插件的 Skill 规则，按 13 个阶段推进。

项目名称: ${projectName}
创建时间: ${now}

## 快速命令
- 检查进度: node scripts/stage.js status .
- 验收当前阶段: node scripts/validate.js . <stage-id>
`,
};

for (const [filename, content] of Object.entries(templates)) {
  const targetPath = path.join(projectDir, filename);
  if (!fs.existsSync(targetPath)) {
    fs.writeFileSync(targetPath, content, "utf-8");
    console.log(`创建: ${filename}`);
  }
}

// Copy template .md files from plugin templates dir
const templateFiles = ["PRD.md", "ARCHITECTURE.md", "API.md", "DATA_MODEL.md", "DEVELOPMENT.md", "TESTING.md", "DEPLOYMENT.md"];
if (fs.existsSync(templatesDir)) {
  for (const tf of templateFiles) {
    const src = path.join(templatesDir, tf);
    const dst = path.join(projectDir, tf);
    if (fs.existsSync(src) && !fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
      console.log(`创建: ${tf}`);
    }
  }
}

console.log(`\n✅ 项目 "${projectName}" 初始化完成`);
console.log(`目录: ${projectDir}`);
console.log(`当前阶段: 阶段 1 - 产品定义 (PRD)`);
console.log(`\n下一步: 告诉 AI "我要做一个软件：【描述你的想法】"`);
