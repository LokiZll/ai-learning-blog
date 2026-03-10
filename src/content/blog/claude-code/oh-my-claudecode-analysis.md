---
title: "oh-my-claudecode 项目分析：它用到了 Claude Code 的哪些功能？"
description: "深入分析 oh-my-claudecode 这个多智能体编排框架，探索它如何充分利用 Claude Code 的各种功能，从 Agent 定义到 Skill 系统再到 MCP 集成"
category: "claude-code"
tags: ["claude-code", "oh-my-claudecode", "multi-agent", "MCP", "自定义技能"]
date: 2026-03-10
---

## 什么是 oh-my-claudecode

[oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) 是一个受 oh-my-zsh 启发的 Claude Code 增强框架，被称为"零学习曲线的多智能体编排系统"。

简单来说，它让 Claude Code 变成了一个**智能体团队管理者**，可以协调多个专业 Agent 完成复杂任务。

截至目前，这个项目已经发布了 **4.7.9 版本**，在 GitHub 上获得了大量关注。它解决的问题是：如何让 Claude Code 能够处理更复杂、更大规模的开发任务？

---

## 项目用到的 Claude Code 功能

通过深入分析项目源码，我整理出了它使用的所有 Claude Code 核心功能：

### 1. Custom Agents（自定义智能体）

这是项目的核心。oh-my-claudecode 定义了 **17 个专业 Agent**，每个 Agent 都有明确的职责和专业的 Prompt。

#### Agent 详细说明

| Agent | 模型 | 职责 |
|-------|------|------|
| `planner` | Opus | 项目规划，通过访谈收集需求，创建可执行计划 |
| `architect` | Opus | 架构设计，分析技术方案，评估架构合理性 |
| `critic` | Opus | 代码审查，评估方案质量，确保质量标准 |
| `executor` | Sonnet | 代码执行，负责具体实现，最小化改动 |
| `analyst` | Opus | 需求分析，挖掘隐藏需求和边缘情况 |
| `test-engineer` | Sonnet | 测试工程师，编写测试用例 |
| `qa-tester` | Sonnet | QA 测试，质量验证 |
| `debugger` | Sonnet | 调试专家，定位和修复问题 |
| `security-reviewer` | Opus | 安全审查，检查漏洞 |
| `code-reviewer` | Sonnet | 代码审查，代码质量评估 |
| `explore` | Haiku | 代码探索，快速了解代码库 |
| `verifier` | Sonnet | 结果验证，确认功能正确 |
| `scientist` | Opus | 调研分析，研究技术方案 |
| `designer` | Sonnet | UI/UX 设计 |
| `document-specialist` | Sonnet | 文档专家 |
| `writer` | Sonnet | 写作助手 |
| `git-master` | Sonnet | Git 操作专家 |

#### Agent 配置示例

以 `executor.md` 为例，看看一个 Agent 是如何定义的：

```markdown
---
name: executor
description: Focused task executor for implementation work (Sonnet)
model: claude-sonnet-4-6
---

<Agent_Prompt>
  <Role>
    You are Executor. Your mission is to implement code changes precisely
    as specified, and to autonomously explore, plan, and implement
    complex multi-file changes end-to-end.
  </Role>

  <Success_Criteria>
    - The requested change is implemented with the smallest viable diff
    - All modified files pass lsp_diagnostics with zero errors
    - Build and tests pass
    - No new abstractions introduced for single-use logic
  </Success_Criteria>

  <Constraints>
    - Work ALONE for implementation
    - Prefer the smallest viable change
    - Do not broaden scope beyond requested behavior
    - After 3 failed attempts, escalate to architect agent
  </Constraints>
</Agent_Prompt>
```

每个 Agent 都定义了：
- **Role**：角色描述
- **Success_Criteria**：成功标准
- **Constraints**：约束条件
- **Investigation_Protocol**：调查协议
- **Tool_Usage**：工具使用规范

### 2. Skills（自定义技能）

项目实现了 **27 个自定义 Skills**，这是用户与系统交互的主要方式。

#### 核心 Skills 详解

**plan - 计划技能**

这是最复杂的 Skill，支持 4 种模式：

| 模式 | 触发条件 | 行为 |
|------|----------|------|
| Interview | 模糊需求 | 交互式需求收集 |
| Direct | `--direct` | 直接生成计划 |
| Consensus | `--consensus`, "ralplan" | 多轮评审 |
| Review | `--review` | 评审现有计划 |

```
# 访谈模式
/plan "帮我做一个任务管理 App"

# 直接模式
/plan --direct "在用户服务中添加积分功能"

# 共识模式
/plan --consensus "重构认证系统"

# 评审模式
/plan --review
```

**autopilot - 自动驾驶**

完全自主的执行模式，从想法到代码：

```
/autopilot 构建一个 REST API
```

工作流程：
1. **Phase 0** - 扩展：将想法转化为详细规格
2. **Phase 1** - 规划：创建实现计划
3. **Phase 2** - 执行：使用 Ralph + Ultrawork 并行执行
4. **Phase 3** - QA：循环测试直到通过（最多 5 次）
5. **Phase 4** - 验证：多视角审查
6. **Phase 5** - 清理：删除状态文件

**deep-interview - 深度访谈**

通过苏格拉底式提问帮你理清需求：

```
/deep-interview "我想做一个任务管理 App"
```

这会进行多轮提问：
- "你的目标用户是谁？"
- "他们主要使用什么设备？"
- "核心功能优先级是什么？"
- ...

**team - 团队协作**

这是推荐的执行方式：

```
/team 3:executor "修复所有 TypeScript 错误"
```

运行流程：
```
team-plan → team-prd → team-exec → team-verify → team-fix (循环)
```

#### 其他 Skills

| Skill | 功能 |
|-------|------|
| `ralph` | 执行器，单任务执行 |
| `ultraqa` | 自动化 QA 测试 |
| `ultrawork` | 并行工作流 |
| `explorer` | 代码探索 |
| `skill` | 创建新技能 |
| `setup` | 初始化设置 |
| `release` | 发布流程 |
| `mcp-setup` | MCP 配置 |
| `omc-teams` | 团队管理 |

### 3. MCP Server（Model Context Protocol）

项目自定义了 MCP Server，提供了强大的扩展能力：

```json
{
  "mcpServers": {
    "t": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/bridge/mcp-server.cjs"]
    }
  }
}
```

#### Bridge 系统架构

```
bridge/
├── cli.cjs           # 主 CLI 入口 (2.3MB)
├── mcp-server.cjs    # MCP 服务器 (838KB)
├── team-bridge.cjs   # 团队桥接 (725KB)
├── team-mcp.cjs      # 团队 MCP (654KB)
├── team.js           # 团队核心 (201KB)
└── runtime-cli.cjs   # 运行时 CLI (169KB)
```

这个 MCP Server 提供了：
- CLI 命令桥接
- Team 多智能体协调
- 运行时状态管理
- 与 Claude Code 的通信

### 4. Hooks（钩子）

项目定义了自动化钩子，实现工作流自动化：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "prettier --write" }]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "tsc --noEmit" }]
      }
    ]
  }
}
```

可以实现：
- 工具使用后自动格式化代码
- 完成后自动运行类型检查
- 自动 lint 检查

### 5. Plugin 系统

项目实现了完整的插件系统：

```json
{
  "name": "oh-my-claudecode",
  "version": "4.7.9",
  "description": "Multi-agent orchestration system for Claude Code",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json"
}
```

安装方式：
```bash
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode
/plugin install oh-my-claudecode
```

### 6. RALPLAN-DR 共识机制

这是项目的核心创新 - 一个结构化的决策框架：

```
RALPLAN-DR =
  - Principles (原则)
  - Decision Drivers (决策驱动因素)
  - Options (选项)
  - Pre-mortem (事前验尸)
  - ADR (架构决策记录)
```

在共识模式下：
1. **Planner** 创建计划 + RALPLAN-DR 摘要
2. **Architect** 评审架构合理性
3. **Critic** 评估质量标准
4. 循环直到 Critic 通过（最多 5 次）
5. 生成 ADR 决策记录

### 7. CLI 工具

项目提供了独立的 CLI 工具 `omc`：

```json
{
  "bin": {
    "oh-my-claudecode": "bridge/cli.cjs",
    "omc": "bridge/cli.cjs",
    "omc-cli": "bridge/cli.cjs"
  }
}
```

使用方式：
```bash
omc team 2:codex "review auth module"
omc team status
omc team shutdown
omc ask codex "解释这段代码"
```

---

## 核心工作流程详解

### Team 模式（推荐）

这是最推荐的协作方式：

```
用户输入: /team 3:executor "修复所有 TypeScript 错误"

执行流程:
┌─────────────────────────────────────────────────────┐
│ team-plan      →  理解任务，拆分子任务             │
│ team-prd       →  生成详细需求                     │
│ team-exec      →  并行执行多个 executor            │
│ team-verify    →  验证结果                         │
│ team-fix       →  修复失败项 (循环)                │
└─────────────────────────────────────────────────────┘
```

**示例**：
```
/team 3:executor "实现用户认证模块"
```

会启动 3 个并行 executor，分别处理：
- 1 个：用户注册 API
- 1 个：登录 API
- 1 个：JWT Token 处理

### Autopilot 模式

完全自主的执行，从想法到产品：

```
用户输入: /autopilot 构建一个博客系统

执行流程:
Phase 0: Analyst + Architect → 生成详细规格
Phase 1: Planner → 创建实现计划
Phase 2: Executor → 并行实现
Phase 3: QA → 测试循环
Phase 4: 架构师/安全/代码审查 → 多视角验证
Phase 5: 清理状态文件
```

### Deep Interview

当你只有一个模糊的想法时：

```
用户: /deep-interview "我想做一个帮助程序员学习的 App"

系统会问:
1. 目标用户是谁？ (A: 初中级开发者)
2. 主要平台？ (A: Web + 移动端)
3. 核心功能？ (A: 教程 + 练习 + 打卡)
4. ...
```

通过多轮提问，最终生成一个清晰的规格说明书。

---

## 技术栈分析

项目使用的技术：

| 类型 | 技术 |
|------|------|
| 语言 | TypeScript |
| SDK | @anthropic-ai/claude-agent-sdk |
| MCP | @modelcontextprotocol/sdk |
| CLI | commander |
| 验证 | Zod |
| 数据库 | better-sqlite3 |
| 测试 | Vitest |
| 构建 | esbuild |
| 代码分析 | @ast-grep/napi |

---

## 从零实现的启示

如果我们要写一个类似的框架，核心需要：

### 1. Agent 定义系统

```typescript
interface Agent {
  name: string;
  model: 'haiku' | 'sonnet' | 'opus';
  role: string;
  successCriteria: string[];
  constraints: string[];
  investigationProtocol: string;
  toolUsage: string;
}
```

每个 Agent 需要：
- 明确的角色定位
- 可量化的成功标准
- 清晰的约束边界
- 特定场景的协议

### 2. Skill 框架

```typescript
interface Skill {
  name: string;
  description: string;
  purpose: string;
  useWhen: string[];
  doNotUseWhen: string[];
  steps: string[];
  toolUsage: string;
}
```

Skill 需要：
- 触发条件识别
- 步骤定义
- 工具权限配置
- Agent 协调逻辑

### 3. 多 Agent 协调

核心是如何协调多个 Agent：

```typescript
async function teamPipeline(task: string) {
  // 1. Plan - 理解任务
  const plan = await spawn('planner', task);

  // 2. PRD - 详细需求
  const prd = await spawn('architect', plan);

  // 3. Exec - 并行执行
  const results = await parallel('executor', splitTasks(prd));

  // 4. Verify - 验证
  for (const result of results) {
    await spawn('verifier', result);
  }

  // 5. Fix - 修复循环
  while (hasFailures(results)) {
    const fixes = await spawn('debugger', failures);
    await spawn('executor', fixes);
  }
}
```

### 4. 状态管理

项目使用 SQLite 存储状态：

```typescript
import Database from 'better-sqlite3';

const db = new Database('.omc/state.db');

// 存储任务状态
db.prepare(`
  CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    status TEXT,
    result TEXT,
    created_at DATETIME
  )
`);
```

### 5. MCP 集成

```typescript
import { Server } from '@modelcontextprotocol/sdk/server';

const server = new Server({
  name: 'omc-mcp',
  version: '1.0.0'
}, {
  capabilities: { tools: {} }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // 处理来自 Claude Code 的工具调用
});
```

---

## 版本演进历史

根据 CHANGELOG，项目的关键版本：

| 版本 | 关键功能 |
|------|----------|
| v1.0 | 基础框架 |
| v2.0 | Team 模式 |
| v3.0 | RALPLAN-DR 共识 |
| v4.0 | Claude Code 原生 Team 集成 |
| v4.7.9 | 当前版本 |

---

## 总结

oh-my-claudecode 展示了 Claude Code 的强大可扩展性：

- **17 个专业 Agent** - 覆盖开发全流程
- **27 个自定义 Skills** - 大幅提升效率
- **MCP 集成** - 连接外部系统
- **Plugin 系统** - 零门槛使用
- **Team 编排** - 多 Agent 协作
- **RALPLAN-DR** - 结构化决策

它证明了 Claude Code 不仅仅是一个编程助手，更是一个可以深度定制的**智能体编排平台**。

通过这个项目，你可以学到：
1. 如何定义专业的 Agent
2. 如何设计 Skill 交互逻辑
3. 如何协调多个 Agent
4. 如何构建 MCP 扩展
5. 如何实现完整的 CLI 工具

---

## 参考链接

- [GitHub: oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [官方文档](https://yeachan-heo.github.io/oh-my-claudecode-website)
- [NPM 包](https://www.npmjs.com/package/oh-my-claude-sisyphus)
