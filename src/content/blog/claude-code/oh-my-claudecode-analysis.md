---
title: "oh-my-claudecode 项目分析：它用到了 Claude Code 的哪些功能？"
description: "深入分析 oh-my-claudecode 这个多智能体编排框架，探索它如何充分利用 Claude Code 的各种功能"
category: "claude-code"
tags: ["claude-code", "oh-my-claudecode", "multi-agent", "MCP", "自定义技能"]
date: 2026-03-10
---

## 什么是 oh-my-claudecode

[oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) 是一个受 oh-my-zsh 启发的 Claude Code 增强框架，被称为"零学习曲线的多智能体编排系统"。

简单来说，它让 Claude Code 变成了一个**智能体团队管理者**，可以协调多个专业 Agent 完成复杂任务。

---

## 项目用到的 Claude Code 功能

通过分析项目源码，我整理出了它使用的所有 Claude Code 核心功能：

### 1. Custom Agents（自定义智能体）

项目定义了 **17 个专业 Agent**，每个 Agent 都有明确的职责：

| Agent | 职责 |
|-------|------|
| `planner` | 项目规划，通过访谈收集需求 |
| `architect` | 架构设计，分析技术方案 |
| `critic` | 代码审查，评估方案质量 |
| `executor` | 代码执行，负责具体实现 |
| `analyst` | 需求分析，挖掘隐藏需求 |
| `test-engineer` | 测试工程师，编写测试用例 |
| `qa-tester` | QA 测试，质量验证 |
| `debugger` | 调试专家，定位问题 |
| `security-reviewer` | 安全审查 |
| `code-reviewer` | 代码审查 |
| `explore` | 代码探索 |
| `verifier` | 结果验证 |
| `scientist` | 调研分析 |
| `designer` | UI/UX 设计 |
| `document-specialist` | 文档专家 |
| `writer` | 写作助手 |
| `git-master` | Git 操作专家 |

每个 Agent 都有独立的配置文件，定义了详细的角色描述、约束条件和成功标准。

### 2. Skills（自定义技能）

项目实现了 **27 个自定义 Skills**：

```
skills/
├── plan/           # 计划技能（支持访谈、直接、共识模式）
├── autopilot/      # 自动驾驶模式
├── team/           # 团队协作
├── deep-interview/ # 深度访谈
├── explorer/       # 代码探索
├── skill/          # 技能创建
├── setup/          # 初始化设置
├── release/        # 发布流程
├── mcp-setup/      # MCP 配置
├── omc-teams/      # 团队管理
├── ralph/          # 执行器
├── ultraqa/        # QA 测试
├── ultrawork/      # 工作流
└── ...
```

这些技能大幅扩展了 Claude Code 的能力边界。

### 3. MCP Server（Model Context Protocol）

项目自定义了 MCP Server：

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

这个 MCP Server 提供了：
- CLI 命令桥接
- Team 多智能体协调
- 运行时交互

### 4. Hooks（钩子）

项目定义了自动化钩子：

```json
{
  "hooks": {
    "PostToolUse": [...],
    "Stop": [...]
  }
}
```

可以实现：
- 工具使用后自动格式化
- 完成后自动运行测试
- 自动 lint 检查

### 5. Plugin 系统

项目实现了完整的插件系统：

```json
{
  "name": "oh-my-claudecode",
  "version": "4.7.9",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json"
}
```

通过 `/plugin` 命令即可安装使用。

### 6. CLI 工具

项目提供了独立的 CLI 工具：

```json
{
  "bin": {
    "oh-my-claudecode": "bridge/cli.cjs",
    "omc": "bridge/cli.cjs",
    "omc-cli": "bridge/cli.cjs"
  }
}
```

支持：
- `omc team` - 团队协作
- `omc ask` - 智能问答
- 各种子命令

---

## 核心工作流程

### Team 模式（推荐）

```
team-plan → team-prd → team-exec → team-verify → team-fix (循环)
```

用户只需输入：

```
/team 3:executor "修复所有 TypeScript 错误"
```

系统会自动协调多个 Agent 完成。

### Autopilot 模式

```
/autopilot 构建一个 REST API
```

全自动执行，无需干预。

### Deep Interview

```
/deep-interview "我想做一个任务管理 App"
```

通过苏格拉底式提问帮你理清需求。

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

---

## 从零实现的启示

如果我们要写一个类似的框架，核心需要：

1. **Agent 定义系统** - 定义每个 Agent 的角色、约束、成功标准
2. **Skill 框架** - 实现可配置的技能系统
3. **多 Agent 协调** - 实现团队协作和任务分发
4. **MCP 集成** - 扩展外部能力
5. **CLI 工具** - 提供命令行交互

---

## 总结

oh-my-claudecode 展示了 Claude Code 的强大可扩展性：

- **17 个专业 Agent** - 覆盖开发全流程
- **27 个自定义 Skills** - 大幅提升效率
- **MCP 集成** - 连接外部系统
- **Plugin 系统** - 零门槛使用
- **Team 编排** - 多 Agent 协作

它证明了 Claude Code 不仅仅是一个编程助手，更是一个可以深度定制的**智能体编排平台**。

---

## 参考链接

- [GitHub: oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [官方文档](https://yeachan-heo.github.io/oh-my-claudecode-website)
