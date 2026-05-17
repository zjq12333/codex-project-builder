// stage.js — Project stage state tracker
// Usage:
//   node stage.js status <project-dir>
//   node stage.js start <project-dir> <stage-id>
//   node stage.js complete <project-dir> <stage-id>

const fs = require("fs");
const path = require("path");

const STAGES = {
  stage_1:  { id: "stage_1",  num: 1,  name: "产品定义 (PRD)",           userLabel: "理清你要做什么" },
  stage_2:  { id: "stage_2",  num: 2,  name: "技术方案设计",              userLabel: "设计技术方案" },
  stage_3:  { id: "stage_3",  num: 3,  name: "数据模型设计",              userLabel: "设计数据结构" },
  stage_4:  { id: "stage_4",  num: 4,  name: "API 设计",                 userLabel: "设计 API 接口" },
  stage_5:  { id: "stage_5",  num: 5,  name: "项目骨架搭建",              userLabel: "搭建项目骨架" },
  stage_6:  { id: "stage_6",  num: 6,  name: "核心闭环实现",              userLabel: "实现核心功能" },
  stage_7:  { id: "stage_7",  num: 7,  name: "权限和认证",                userLabel: "加上登录和权限" },
  stage_8:  { id: "stage_8",  num: 8,  name: "真实执行器",                userLabel: "换成真实业务逻辑" },
  stage_9:  { id: "stage_9",  num: 9,  name: "日志和可观测性",            userLabel: "加上日志系统" },
  stage_10: { id: "stage_10", num: 10, name: "测试补齐",                  userLabel: "补齐测试" },
  stage_11: { id: "stage_11", num: 11, name: "前端 MVP",                 userLabel: "做界面" },
  stage_12: { id: "stage_12", num: 12, name: "部署准备",                  userLabel: "准备部署" },
  stage_13: { id: "stage_13", num: 13, name: "产品化优化",                userLabel: "打磨优化" },
};

function metaPath(projectDir) {
  return path.join(projectDir, ".codeproject", "meta.json");
}

function loadMeta(projectDir) {
  const p = metaPath(projectDir);
  if (!fs.existsSync(p)) {
    console.error(`ERROR: No .codeproject/meta.json found in ${projectDir}`);
    console.error("Run: node scripts/init.js <project-dir> <project-name>");
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch (e) {
    console.error(`ERROR: Corrupted .codeproject/meta.json in ${projectDir}`);
    console.error(e.message.split("\n")[0]);
    process.exit(1);
  }
}

function saveMeta(projectDir, meta) {
  meta.updated_at = new Date().toISOString();
  const p = metaPath(projectDir);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(meta, null, 2), "utf-8");
}

function cmdStatus(projectDir) {
  const meta = loadMeta(projectDir);
  const current = STAGES[meta.current_stage];
  console.log(`项目: ${meta.project_name}`);
  console.log(`当前阶段: ${current.num}. ${current.name}`);
  console.log("");
  console.log("阶段进度:");
  for (const [id, info] of Object.entries(STAGES)) {
    const s = meta.stages[id];
    const icon = s.status === "completed" ? "✅" : s.status === "in_progress" ? "🔄" : "⬜";
    const extra = s.completed_at ? ` (完成于 ${new Date(s.completed_at).toLocaleString("zh-CN")})` : "";
    console.log(`  ${icon} ${info.num}. ${info.name} [${s.status}]${extra}`);
  }

  // Find next incomplete stage
  const next = Object.values(STAGES).find(s => meta.stages[s.id].status !== "completed");
  if (next) {
    console.log(`\n下一步: ${next.num}. ${next.name}`);
  } else {
    console.log("\n🎉 全部阶段已完成！");
  }
}

function cmdStart(projectDir, stageId) {
  const meta = loadMeta(projectDir);
  if (!STAGES[stageId]) {
    console.error(`ERROR: Unknown stage ${stageId}`);
    process.exit(1);
  }
  meta.stages[stageId].status = "in_progress";
  meta.current_stage = stageId;
  saveMeta(projectDir, meta);
  const info = STAGES[stageId];
  console.log(`开始: ${info.num}. ${info.name}`);
}

function cmdComplete(projectDir, stageId) {
  const meta = loadMeta(projectDir);
  if (!STAGES[stageId]) {
    console.error(`ERROR: Unknown stage ${stageId}`);
    process.exit(1);
  }
  const info = STAGES[stageId];
  meta.stages[stageId].status = "completed";
  meta.stages[stageId].completed_at = new Date().toISOString();

  // Advance to next stage
  const stageNums = Object.values(STAGES).sort((a, b) => a.num - b.num);
  const nextStage = stageNums.find(s => s.num > info.num);
  if (nextStage) {
    meta.current_stage = nextStage.id;
    meta.stages[nextStage.id].status = "in_progress";
  }

  saveMeta(projectDir, meta);
  console.log(`✅ 完成: ${info.num}. ${info.name}`);
  if (nextStage) {
    console.log(`➡️ 进入: ${nextStage.num}. ${nextStage.name}`);
  } else {
    console.log("🎉 全部 13 个阶段已完成！");
  }
}

// CLI
const args = process.argv.slice(2);
const cmd = args[0];
const projectDir = args[1];
const stageId = args[2];

if (!cmd || !projectDir) {
  console.log("Usage: node stage.js <status|start|complete> <project-dir> [stage-id]");
  process.exit(1);
}

switch (cmd) {
  case "status":
    cmdStatus(projectDir);
    break;
  case "start":
    if (!stageId) { console.error("Need stage-id"); process.exit(1); }
    cmdStart(projectDir, stageId);
    break;
  case "complete":
    if (!stageId) { console.error("Need stage-id"); process.exit(1); }
    cmdComplete(projectDir, stageId);
    break;
  default:
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
}
