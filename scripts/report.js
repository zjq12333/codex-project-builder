// report.js — Generate human-readable progress report
// Usage: node report.js <project-dir>

const fs = require("fs");
const path = require("path");

const STAGES = {
  stage_1:  { num: 1,  name: "产品定义",            emoji: "📋" },
  stage_2:  { num: 2,  name: "技术方案设计",         emoji: "🏗️" },
  stage_3:  { num: 3,  name: "数据模型设计",         emoji: "📊" },
  stage_4:  { num: 4,  name: "API 设计",            emoji: "🔌" },
  stage_5:  { num: 5,  name: "项目骨架搭建",         emoji: "🦴" },
  stage_6:  { num: 6,  name: "核心闭环实现",         emoji: "⚙️" },
  stage_7:  { num: 7,  name: "权限和认证",           emoji: "🔐" },
  stage_8:  { num: 8,  name: "真实执行器",           emoji: "🚀" },
  stage_9:  { num: 9,  name: "日志和可观测性",       emoji: "📝" },
  stage_10: { num: 10, name: "测试补齐",             emoji: "🧪" },
  stage_11: { num: 11, name: "前端 MVP",            emoji: "🖥️" },
  stage_12: { num: 12, name: "部署准备",             emoji: "📦" },
  stage_13: { num: 13, name: "产品化优化",           emoji: "✨" },
};

function metaPath(projectDir) {
  return path.join(projectDir, ".codeproject", "meta.json");
}

const args = process.argv.slice(2);
const projectDir = args[0];

if (!projectDir) {
  console.log("Usage: node report.js <project-dir>");
  process.exit(1);
}

const p = metaPath(projectDir);
if (!fs.existsSync(p)) {
  console.error("No project found. Run init.js first.");
  process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(p, "utf-8"));
const completed = Object.values(meta.stages).filter(s => s.status === "completed").length;
const total = 13;
const pct = Math.round((completed / total) * 100);

const barLen = 20;
const filled = Math.round((completed / total) * barLen);
const bar = "█".repeat(filled) + "░".repeat(barLen - filled);

console.log("");
console.log(`📁 ${meta.project_name}`);
console.log(`进度: ${bar} ${completed}/${total} (${pct}%)`);
console.log(`创建时间: ${new Date(meta.created_at).toLocaleString("zh-CN")}`);
console.log(`最后更新: ${new Date(meta.updated_at).toLocaleString("zh-CN")}`);
console.log("");

for (const [id, info] of Object.entries(STAGES)) {
  const s = meta.stages[id];
  const icon = s.status === "completed" ? "✅" : s.status === "in_progress" ? "🔄" : "⬜";
  const date = s.completed_at ? ` — ${new Date(s.completed_at).toLocaleString("zh-CN")}` : "";
  console.log(`${icon} ${info.emoji} ${info.num}. ${info.name}${date}`);
}

if (completed === total) {
  console.log("\n🎉 项目开发完成！");
} else {
  const current = Object.entries(STAGES).find(([id]) => meta.stages[id].status === "in_progress");
  if (current) {
    console.log(`\n➡️ 当前正在: ${current[1].emoji} ${current[1].name}`);
  }
}
