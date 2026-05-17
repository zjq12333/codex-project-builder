// validate.js — Stage acceptance checks
// Usage: node validate.js <project-dir> <stage-id>
// NOTE: For structured output, prefer the MCP tool `stage_validate`.
// This script is a CLI fallback and matches the MCP validation logic.

const fs = require("fs");
const path = require("path");

const CHECKS = {
  stage_1: (dir) => {
    const prd = path.join(dir, "PRD.md");
    if (!fs.existsSync(prd)) return [{ file: "PRD.md", issue: "文件不存在" }];
    const content = fs.readFileSync(prd, "utf-8");
    const required = [
      { label: "一句话描述", pattern: /一句话描述|产品描述|产品定位/ },
      { label: "目标用户", pattern: /目标用户|用户群体/ },
      { label: "核心痛点", pattern: /核心痛点|痛点/ },
      { label: "核心使用场景", pattern: /核心.*场景|使用场景/ },
      { label: "MVP 功能列表", pattern: /MVP.*功能|功能列表/ },
      { label: "暂不做的功能", pattern: /暂不做|不做|未来.*功能/ },
      { label: "用户主流程", pattern: /用户主流程|主流程|核心流程/ },
      { label: "成功指标", pattern: /成功指标|指标/ },
      { label: "主要风险", pattern: /风险/ },
      { label: "当前假设", pattern: /假设/ },
    ];
    return required.filter(r => !r.pattern.test(content)).map(r => ({
      file: "PRD.md", issue: `缺少: ${r.label}`
    }));
  },

  stage_2: (dir) => {
    const arch = path.join(dir, "ARCHITECTURE.md");
    if (!fs.existsSync(arch)) return [{ file: "ARCHITECTURE.md", issue: "文件不存在" }];
    const content = fs.readFileSync(arch, "utf-8");
    const required = [
      /技术栈/,
      /模块划分|系统模块/,
      /数据流/,
      /技术风险/,
      /替代方案/,
    ];
    return required.filter(r => !r.test(content)).map(() => ({
      file: "ARCHITECTURE.md", issue: "缺少必要章节"
    }));
  },

  stage_3: (dir) => {
    const dm = path.join(dir, "DATA_MODEL.md");
    if (!fs.existsSync(dm)) return [{ file: "DATA_MODEL.md", issue: "文件不存在" }];
    const content = fs.readFileSync(dm, "utf-8");
    const required = [/实体/, /字段/, /关系/, /索引/, /删除策略/];
    return required.filter(r => !r.test(content)).map(() => ({
      file: "DATA_MODEL.md", issue: "缺少必要章节"
    }));
  },

  stage_4: (dir) => {
    const api = path.join(dir, "API.md");
    if (!fs.existsSync(api)) return [{ file: "API.md", issue: "文件不存在" }];
    const content = fs.readFileSync(api, "utf-8");
    const required = [/Method|GET|POST|PUT|DELETE/, /Path/, /请求参数|Request/, /响应|Response/, /错误码/];
    return required.filter(r => !r.test(content)).map(() => ({
      file: "API.md", issue: "缺少必要章节"
    }));
  },

  stage_5: (dir) => {
    const issues = [];
    if (!fs.existsSync(path.join(dir, "README.md"))) issues.push({ file: "README.md", issue: "文件不存在" });
    if (!fs.existsSync(path.join(dir, ".env.example"))) issues.push({ file: ".env.example", issue: "文件不存在" });
    return issues;
  },

  stage_6: (dir) => {
    const issues = [];
    const hasTests = ["tests", "__tests__", "test"].some(d => fs.existsSync(path.join(dir, d)));
    if (!hasTests) issues.push({ file: "tests/", issue: "测试目录不存在，核心闭环必须有测试" });
    return issues;
  },

  stage_7: (dir) => [],
  stage_8: (dir) => [],
  stage_9: (dir) => [],
  stage_10: (dir) => {
    const issues = [];
    const hasTests = ["tests", "__tests__", "test"].some(d => fs.existsSync(path.join(dir, d)));
    if (!hasTests) issues.push({ file: "tests/", issue: "测试目录不存在" });
    return issues;
  },
  stage_11: (dir) => [],
  stage_12: (dir) => {
    const issues = [];
    if (!fs.existsSync(path.join(dir, "Dockerfile"))) issues.push({ file: "Dockerfile", issue: "文件不存在" });
    if (!fs.existsSync(path.join(dir, "DEPLOYMENT.md"))) issues.push({ file: "DEPLOYMENT.md", issue: "文件不存在" });
    return issues;
  },
  stage_13: (dir) => [],
};

const args = process.argv.slice(2);
const projectDir = args[0];
const stageId = args[1];

if (!projectDir || !stageId) {
  console.log("Usage: node validate.js <project-dir> <stage-id>");
  process.exit(1);
}

if (!CHECKS[stageId]) {
  console.error(`ERROR: Unknown stage ${stageId}`);
  console.error("Valid stages: " + Object.keys(CHECKS).join(", "));
  process.exit(1);
}

const issues = CHECKS[stageId](projectDir);

if (issues.length === 0) {
  console.log(`✅ ${stageId} 验收通过`);
  process.exit(0);
} else {
  console.log(`❌ ${stageId} 验收未通过，发现 ${issues.length} 个问题：`);
  issues.forEach((i, idx) => {
    console.log(`  ${idx + 1}. ${i.file}: ${i.issue}`);
  });
  process.exit(1);
}
