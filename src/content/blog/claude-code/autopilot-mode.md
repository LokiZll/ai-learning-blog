---
title: "oh-my-claudecode Autopilot 模式详解：从想法到代码的完全自动化"
description: "深入解析 oh-my-claudecode 的 Autopilot 模式，了解如何实现从模糊想法到完整产品的全自动开发"
category: "claude-code"
tags: ["claude-code", "oh-my-claudecode", "autopilot", "自动化", "全栈开发"]
date: 2026-03-10
---

## 什么是 Autopilot 模式

Autopilot 是 oh-my-claudecode 最强大的功能之一 —— 只需要描述你想要什么，系统会自动完成从需求分析到代码实现的全部工作。

```
/autopilot 构建一个博客系统
```

你只需要说一句话，系统会：
1. 分析需求
2. 设计架构
3. 编写代码
4. 编写测试
5. 验证功能
6. 清理环境

---

## Autopilot 的核心理念

### 解决什么问题

很多开发者有这样的困扰：
- "我想做一个 App，但不知道从哪开始"
- "需求不清晰，怕做出来不是想要的"
- "太复杂了，不知道怎么规划"

Autopilot 的答案是：**把不确定性留给自己，把确定性交给用户**

### 设计原则

1. **全自动化**：用户只需要给想法，其他都交给系统
2. **质量保障**：多阶段验证，确保输出质量
3. **自动纠错**：QA 循环直到通过
4. **多视角审查**：架构、安全、代码质量全方位检查

---

## Autopilot 工作流程

### 完整执行流程

```
用户输入: /autopilot 构建一个 REST API

┌─────────────────────────────────────────────────────────────┐
│ Phase 0 - Expansion (扩展)                                 │
│   分析想法 → 生成详细规格 (.omc/autopilot/spec.md)         │
├─────────────────────────────────────────────────────────────┤
│ Phase 1 - Planning (规划)                                  │
│   架构师 → 创建实现计划 (.omc/plans/autopilot-impl.md)    │
│   批评家 → 验证计划质量                                     │
├─────────────────────────────────────────────────────────────┤
│ Phase 2 - Execution (执行)                                  │
│   Ralph + Ultrawork → 并行实现                              │
├─────────────────────────────────────────────────────────────┤
│ Phase 3 - QA (质量保证)                                     │
│   构建 → Lint → 测试 → 修复 (最多 5 次循环)                │
├─────────────────────────────────────────────────────────────┤
│ Phase 4 - Validation (验证)                                 │
│   架构师 → 功能完整性                                       │
│   安全审查 → 漏洞检查                                       │
│   代码审查 → 质量评估                                       │
├─────────────────────────────────────────────────────────────┤
│ Phase 5 - Cleanup (清理)                                    │
│   删除状态文件 → 退出                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 各阶段详解

### Phase 0: Expansion（扩展）

**目标**：将模糊的想法转化为详细的规格说明书

**执行**：
- 如果有 ralplan 共识计划 → 跳过 Phase 0 和 Phase 1
- 如果有 deep-interview 规格 → 直接使用
- 否则：Analyst (Opus) + Architect (Opus) 生成规格

**输出**：
```
.omc/autopilot/spec.md
```

**示例**：

```
用户输入: "做一个任务管理 App"

系统分析后输出:
# 任务管理 App 规格

## 核心功能
- 用户注册/登录
- 创建/编辑/删除任务
- 任务分类和标签
- 任务截止日期提醒
- 任务进度追踪

## 技术方案
- 前端: React + TypeScript
- 后端: Express + SQLite
- 认证: JWT

## 验收标准
- [ ] 用户可以注册登录
- [ ] 可以创建任务
- [ ] 可以编辑任务
- [ ] ...
```

### Phase 1: Planning（规划）

**目标**：创建可执行的实现计划

**执行**：
- Architect (Opus): 创建实现计划
- Critic (Opus): 验证计划质量

**输出**：
```
.omc/plans/autopilot-impl.md
```

**计划内容**：
- 详细步骤
- 文件列表
- 依赖关系
- 验收标准

### Phase 2: Execution（执行）

**目标**：根据计划实现代码

**执行**：
- 根据任务复杂度选择模型：
  - 简单任务 → Executor (Haiku)
  - 标准任务 → Executor (Sonnet)
  - 复杂任务 → Executor (Opus)
- 独立任务并行执行

**工具**：
- Ralph: 单任务执行器
- Ultrawork: 并行工作流

### Phase 3: QA（质量保证）

**目标**：确保代码通过所有测试

**执行**：
1. 运行构建
2. 运行 Lint 检查
3. 运行单元测试
4. 如果失败 → 修复 → 重复

**规则**：
- 最多循环 5 次
- 如果同一错误重复 3 次 → 停止并报告问题

### Phase 4: Validation（验证）

**目标**：多视角审查确保质量

**执行**（并行）：
- **Architect**: 功能完整性检查
- **Security-reviewer**: 安全漏洞检查
- **Code-reviewer**: 代码质量检查

**规则**：
- 所有审查都必须通过
- 如果有拒绝项 → 修复 → 重新验证

### Phase 5: Cleanup（清理）

**目标**：清理临时文件

**执行**：
- 删除 `.omc/state/autopilot-state.json`
- 删除 `.omc/state/ralph-state.json`
- 删除 `.omc/state/ultrawork-state.json`
- 删除 `.omc/state/ultraqa-state.json`

---

## 触发条件

### 自动触发

当用户说这些时，自动进入 Autopilot 模式：

```
- "build me..."
- "create me..."
- "make me..."
- "autopilot"
- "auto pilot"
- "autonomous"
- "full auto"
- "handle it all"
- "I want a/an..."
```

### 不适用场景

- 探索选项/头脑风暴 → 用 plan
- 只想解释/草稿 → 直接回答
- 单一代码修改 → 用 ralph 或 executor
- 快速修复 bug → 用 executor

---

## 使用示例

### 示例 1：构建 REST API

```
/autopilot 构建一个图书管理 REST API
```

系统会：
1. 生成 API 规格
2. 设计路由结构
3. 实现 CRUD 操作
4. 编写测试
5. 验证功能

### 示例 2：创建 CLI 工具

```
/autopilot 创建一个追踪每日习惯的 CLI 工具，带打卡功能
```

### 示例 3：完整前端项目

```
/autopilot 用 React 做一个天气预报应用
```

---

## Autopilot 的技术细节

### 状态管理

```
.omc/
  ├── autopilot/
  │   └── spec.md           # 规格文档
  ├── plans/
  │   └── autopilot-impl.md  # 实现计划
  └── state/
      ├── autopilot-state.json
      ├── ralph-state.json
      ├── ultrawork-state.json
      └── ultraqa-state.json
```

### Agent 选择策略

| 任务复杂度 | Agent | 模型 |
|-----------|-------|------|
| 简单 | executor | Haiku |
| 标准 | executor | Sonnet |
| 复杂 | executor | Opus |

### QA 循环

```typescript
const MAX_QA_CYCLES = 5;
const SAME_ERROR_THRESHOLD = 3;

let cycle = 0;
let sameErrorCount = 0;
let lastError = null;

while (cycle < MAX_QA_CYCLES) {
  const result = runTests();

  if (result.passed) {
    break;
  }

  if (result.error === lastError) {
    sameErrorCount++;
  } else {
    sameErrorCount = 0;
  }

  if (sameErrorCount >= SAME_ERROR_THRESHOLD) {
    reportFatalError(result.error);
    break;
  }

  fixErrors(result.errors);
  cycle++;
}
```

---

## Autopilot vs 其他模式

| 特性 | Autopilot | Team | Deep Interview |
|------|-----------|------|----------------|
| 自动化程度 | 全自动 | 半自动 | 手动 |
| 适用场景 | 完整产品 | 多任务并行 | 需求不清 |
| 人工干预 | 无 | 指导 | 大量 |
| 执行速度 | 慢但省心 | 快 | 最慢 |
| 质量 | 高 | 高 | 最高 |

---

## 使用建议

### 什么时候用 Autopilot

- 你很清楚想要什么
- 需要完整的产品/功能
- 愿意等待全自动执行
- 信任系统的质量把控

### 什么时候不用

- 需求还不清楚 → 用 Deep Interview
- 只想问问题 → 直接问
- 小改动 → 用 Team 或 ralph

### 优化技巧

1. **描述具体**：越具体，输出越符合预期
2. **指定技术栈**：如 "用 React + TypeScript"
3. **说明约束**：如 "不要使用数据库"
4. **随时取消**：可以说 "/cancel" 停止

---

## 实际效果

根据项目文档，Autopilot 可以：

- **从 2-3 行描述**生成完整功能
- **多阶段验证**确保质量
- **自动修复**大部分错误
- **生成可直接运行**的代码

---

## 总结

Autopilot 是 oh-my-claudecode 最强大的功能：

- **全自动**：从想法到代码一步到位
- **高质量**：多阶段验证确保输出
- **容错强**：自动修复大部分问题
- **多视角**：架构、安全、质量全覆盖

当你有一个明确的想法时，Autopilot 是最快的实现方式！

---

## 参考链接

- [GitHub: oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [Autopilot Skill 文档](https://github.com/Yeachan-Heo/oh-my-claudecode/tree/main/skills/autopilot)
