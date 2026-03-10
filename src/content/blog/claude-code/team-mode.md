---
title: "oh-my-claudecode Team 模式详解：多智能体协作开发实战"
description: "深入解析 oh-my-claudecode 的 Team 模式，了解如何协调多个 Claude Code Agent 完成复杂开发任务"
category: "claude-code"
tags: ["claude-code", "oh-my-claudecode", "team", "multi-agent", "协作"]
date: 2026-03-10
---

## 什么是 Team 模式

Team 模式是 oh-my-claudecode 最推荐的协作方式，它利用 Claude Code 原生的团队工具，让多个 Agent 协调工作，共同完成复杂任务。

简单来说，你只需要告诉系统"做什么"，系统会自动分解任务、协调资源、完成工作。

```
/team 3:executor "修复所有 TypeScript 错误"
```

系统会自动创建 3 个并行的 executor Agent，分别处理不同的 TypeScript 错误。

---

## Team 模式的核心概念

### 1. 团队组成

```
用户输入: "/team 3:executor 修复所有 TypeScript 错误"
              │
              ▼
      [TEAM ORCHESTRATOR (Lead)]
              │
              ├── 创建团队
              ├── 分析并分解任务
              ├── 创建子任务
              ├── 分配给各个 Agent
              ├── 监控进度
              └── 完成清理
```

### 2. Agent 数量

你可以指定 Agent 数量（1-20）：

```bash
/team 1:executor "修复这个 bug"
/team 3:executor "修复所有 TypeScript 错误"
/team 10:executor "重构整个前端"
```

如果不指定数量，系统会自动根据任务复杂度来决定。

### 3. Agent 类型

可以指定不同类型的 Agent：

| 类型 | 用途 |
|------|------|
| `executor` | 代码执行（默认）|
| `debugger` | 调试修复 |
| `designer` | UI 设计 |
| `codex` | Codex CLI workers |
| `gemini` | Gemini CLI workers |

---

## Team 执行流程

### 分阶段管道（Staged Pipeline）

Team 执行遵循一个精心设计的管道：

```
team-plan → team-prd → team-exec → team-verify → team-fix (循环)
```

### 各阶段详解

| 阶段 | 使用 Agent | 说明 |
|------|-----------|------|
| **team-plan** | explore (Haiku), planner (Opus) | 理解任务，分解为子任务 |
| **team-prd** | analyst (Opus) | 生成详细需求规格 |
| **team-exec** | executor (Sonnet) | 并行执行各个子任务 |
| **team-verify** | verifier (Sonnet) | 验证结果 |
| **team-fix** | executor/debugger | 修复失败项（循环）|

### Agent 路由规则

1. **用户只指定 team-exec 阶段的 Agent 类型**
2. **其他阶段由 Lead 自动选择合适的 Agent**
3. **安全敏感任务会自动添加 security-reviewer**
4. **大型重构会自动添加 code-reviewer**

---

## 实际使用示例

### 示例 1：修复多个 TypeScript 错误

```bash
/team 5:executor "修复所有 TypeScript 错误"
```

执行流程：
1. **plan**: 分析项目中的 TypeScript 错误
2. **prd**: 列出每个错误及修复方案
3. **exec**: 5 个 executor 并行修复
4. **verify**: 验证修复结果
5. **fix**: 处理修复失败的部分

### 示例 2：实现完整功能

```bash
/team "实现用户认证模块"
```

系统会自动：
1. 分析需要哪些文件
2. 规划实现步骤
3. 并行实现注册、登录、JWT 等
4. 编写测试
5. 验证功能

### 示例 3：复杂重构

```bash
/team ralph "重构认证系统"
```

使用 `ralph` 修饰符会启用持久化循环：
- 失败时自动重试
- 完成后需要架构师验证

### 示例 4：使用外部 CLI

```bash
# 使用 Codex CLI
/team 2:codex "review architecture"

# 使用 Gemini CLI
/team 2:gemini "redesign UI"
```

---

## Team 模式的技术细节

### 状态存储

Claude Code 原生管理团队状态：

```
~/.claude/
  teams/fix-ts-errors/
    config.json          # 团队元数据 + 成员列表
  tasks/fix-ts-errors/
    1.json               # 子任务 #1
    2.json               # 子任务 #2
    3.json               # 子任务 #3
```

### 团队通信

Agent 之间可以相互通信：

```bash
# 发送消息给队友
@worker-2 这个 API 接口我改好了，你那边测试一下

# 接收消息
[收到 worker-1 的消息]: 用户模型已经添加了 avatar 字段
```

### 任务依赖

子任务可以设置依赖关系：

```json
{
  "task_id": 2,
  "depends_on": [1],
  "description": "创建用户 API",
  "status": "pending"
}
```

---

## Team vs 其他模式

| 模式 | 适用场景 | 特点 |
|------|---------|------|
| **Team** | 多任务并行处理 | 推荐方式，原生团队支持 |
| **Autopilot** | 端到端自动执行 | 从想法到代码全自动 |
| **Deep Interview** | 需求不明确 | 苏格拉底式提问 |
| **Direct** | 简单明确任务 | 直接执行 |

---

## Team 模式的优势

### 1. 并行处理

多个 Agent 同时工作，大幅提升效率：

```
串行: 任务1 → 任务2 → 任务3 (30分钟)
并行: 任务1
      任务2  (10分钟)
      任务3
```

### 2. 专业分工

不同 Agent 做不同的事：

- executor: 写代码
- debugger: 修 bug
- designer: 做 UI
- security-reviewer: 安全审查

### 3. 自动协调

Lead Agent 自动：
- 分解任务
- 分配资源
- 处理依赖
- 监控进度

### 4. 容错机制

- 失败自动重试
- 架构师验证
- 循环修复直到通过

---

## 使用建议

### 何时使用 Team

- 需要同时处理多个文件
- 任务可以并行分解
- 需要不同专业技能的组合

### 何时不使用

- 简单的小任务
- 高度耦合的代码
- 需要频繁沟通的任务

### 优化技巧

1. **任务粒度**：不要太大也不要太小
2. **依赖清晰**：减少任务间的依赖
3. **及时干预**：可以随时介入指导

---

## 总结

Team 模式是 oh-my-claudecode 最强大的功能之一：

- **原生支持**：利用 Claude Code 的团队工具
- **自动协调**：Lead Agent 处理所有协调工作
- **并行执行**：大幅提升开发效率
- **专业分工**：不同 Agent 做不同的事
- **容错机制**：自动重试和验证

掌握 Team 模式，让你的开发效率翻倍！

---

## 参考链接

- [GitHub: oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [Team Skill 文档](https://github.com/Yeachan-Heo/oh-my-claudecode/tree/main/skills/team)
