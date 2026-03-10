---
title: "oh-my-claudecode Deep Interview 模式详解：苏格拉底式需求挖掘"
description: "深入解析 oh-my-claudecode 的 Deep Interview 模式，了解如何通过苏格拉底式提问将模糊想法转化为清晰规格"
category: "claude-code"
tags: ["claude-code", "oh-my-claudecode", "deep-interview", "需求分析", "苏格拉底"]
date: 2026-03-10
---

## 什么是 Deep Interview 模式

Deep Interview 是 oh-my-claudecode 最独特的功能 —— 它不是帮你写代码，而是帮你**想清楚到底要什么**。

当你只有一个模糊的想法时，直接让 Autopilot 执行往往会事倍功半。Deep Interview 通过**苏格拉底式提问**，一层层剥开你内心的假设，直到需求变得清晰无比。

```
/deep-interview "我想做一个帮助程序员学习的 App"
```

系统会开始多轮提问：
- "你的目标用户是谁？"
- "他们主要想学什么？"
- "有什么特别的功能需求？"
- ...

---

## 核心概念

### 数学化模糊度评分

Deep Interview 引入了一个创新概念：**模糊度评分**（Ambiguity Score）

```
模糊度 = 1.0 (完全模糊)
模糊度 = 0.0 (完全清晰)
```

系统会从多个维度评估：

| 维度 | 说明 |
|------|------|
| 功能范围 | 要做什么功能？ |
| 用户画像 | 谁会用这个产品？ |
| 技术约束 | 有什么技术限制？ |
| 验收标准 | 怎么算做成了？ |
| 时间预算 | 什么时候要？ |

每回答一个问题，模糊度就会下降。当模糊度 ≤ 0.2（20%）时，才能进入执行阶段。

### 苏格拉底方法

借鉴古希腊哲学家苏格拉底的**问答法**：

1. **不直接给答案**，而是引导思考
2. **暴露假设**，让你意识到自己没想过的问题
3. **层层递进**，从表面到本质

---

## Deep Interview 工作流程

### 完整流程

```
用户输入: /deep-interview "我想做一个任务管理 App"

┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Initialize (初始化)                                │
│   - 解析用户想法                                            │
│   - 判断 greenfield vs brownfield                          │
│   - 初始化状态                                              │
│   - 显示初始模糊度: 100%                                   │
├─────────────────────────────────────────────────────────────┤
│ Phase 2: Interview Loop (访谈循环)                         │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ 2a: 生成下一个问题                                    │  │
│   │     - 找出最弱的维度                                  │  │
│   │     - 生成针对性的问题                                │  │
│   ├─────────────────────────────────────────────────────┤  │
│   │ 2b: 提问 (一次只问一个!)                             │  │
│   ├─────────────────────────────────────────────────────┤  │
│   │ 2c: 更新模糊度分数                                    │  │
│   ├─────────────────────────────────────────────────────┤  │
│   │ 2d: 检查是否达到阈值 (≤ 20%)                         │  │
│   │     - 是 → 进入 Phase 3                              │  │
│   │     - 否 → 继续循环                                  │  │
│   └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ Phase 3: Output (输出)                                     │
│   - 生成详细规格文档                                        │
│   - 输送到 3-stage pipeline                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Initialize（初始化）

### 1. 解析用户想法

从参数中提取用户的原始输入：

```
用户输入: "我想做一个帮助程序员学习的 App"
```

### 2. 判断项目类型

**Greenfield（全新项目）**：白纸一张，从头开始

**Brownfield（现有项目）**：在已有代码库上扩展

如何判断？
- 检查当前目录是否有源代码
- 检查是否有 package.json、git 历史等
- 如果有，且用户想修改/扩展 → brownfield

### 3. 初始化状态

```json
{
  "active": true,
  "current_phase": "deep-interview",
  "state": {
    "interview_id": "<uuid>",
    "type": "greenfield|brownfield",
    "initial_idea": "我想做一个帮助程序员学习的 App",
    "rounds": [],
    "current_ambiguity": 1.0,
    "threshold": 0.2,
    "codebase_context": null,
    "challenge_modes_used": []
  }
}
```

### 4. 公告开始

> Starting deep interview. I'll ask targeted questions to understand your idea thoroughly before building anything. After each answer, I'll show your clarity score. We'll proceed to execution once ambiguity drops below 20%.
>
> **Your idea:** "我想做一个帮助程序员学习的 App"
> **Project type:** greenfield
> **Current ambiguity:** 100%

---

## Phase 2: Interview Loop（访谈循环）

这是核心环节，系统会不断提问，直到模糊度降到 20% 以下。

### 2a: 生成下一个问题

**策略**：找出当前最弱的维度，生成针对性的问题

问题风格按维度分类：

| 维度 | 问题风格 |
|------|----------|
| 功能范围 | "这个 App 必须有哪些功能？" |
| 用户画像 | "谁会用这个 App？" |
| 技术约束 | "有什么技术限制吗？" |
| 验收标准 | "你怎么知道做成了？" |
| 时间预算 | "什么时候要？" |

### 2b: 提问（一次只问一个！）

**黄金规则**：一次只问一个问题

```
❌ 不好: "用户是谁？什么时候要？预算多少？"
✅ 好:   "你的目标用户是谁？"
```

### 2c: 更新模糊度分数

每回答一个问题，更新模糊度：

```
回答: "主要是初中级开发者"
模糊度: 100% → 85%

回答: "他们想学编程和算法"
模糊度: 85% → 70%

回答: "主要是 Web 开发者"
模糊度: 70% → 55%
```

### 2d: 检查阈值

```
if (current_ambiguity <= threshold) {
  进入 Phase 3: 输出规格
} else {
  继续循环，问下一个问题
}
```

---

## Phase 3: Output（输出）

### 生成规格文档

当模糊度降到 20% 以下时，生成详细规格：

```markdown
# 任务管理 App 规格

## 项目信息
- 类型: greenfield
- 原始想法: 我想做一个帮助程序员学习的 App

## 需求澄清

### Q1: 目标用户是谁？
A: 初中级开发者

### Q2: 主要学什么？
A: 编程和算法

### Q3: 什么平台？
A: Web 应用

...

## 模糊度变化
- 初始: 100%
- 最终: 18%
- 提问轮次: 8

## 技术建议
（系统给出的技术方案建议）

## 下一步
建议进入 3-stage pipeline:
1. ralplan (consensus) → 细化计划
2. autopilot → 自动执行
```

### 输送到执行 pipeline

Deep Interview 的输出可以无缝连接到：

```
deep-interview → ralplan (consensus) → autopilot
```

---

## 实际使用示例

### 示例 1：从模糊到清晰

```
用户: /deep-interview "我想做一个任务管理 App"

系统: "你的目标用户是谁？"

用户: "主要是个人用户，自己管理日常任务"

系统: "好的。个人用户管理日常任务。当前模糊度: 85%"
系统: "这些用户主要在什么设备上使用？"

用户: "手机和电脑都需要"

系统: "手机和电脑。当前模糊度: 70%"
系统: "核心功能需要哪些？"

用户: "创建任务、设置截止日期、完成标记、分类标签"

系统: "CRUD + 分类。当前模糊度: 50%"
...

(继续 5-10 轮)

系统: "恭喜！模糊度已降至 18%，可以开始执行了！"
```

### 示例 2：brownfield 项目

```
用户: /deep-interview "给现有博客添加评论功能"

系统: 检测到 brownfield 项目
系统: 探索现有代码库结构...
系统: "现有博客使用什么技术栈？"

用户: "Next.js + PostgreSQL"

系统: "Next.js + PostgreSQL。当前模糊度: 75%"
...
```

---

## Deep Interview 的独特价值

### 解决 AI 开发的根本问题

> AI 可以构建任何东西。难点在于知道要构建什么。

很多 AI 执行失败不是因为能力不够，而是因为**需求不清晰**：

- "做一个聊天 App" → 结果做成了即时通讯而不是客服系统
- "做一个学习工具" → 结果做成了视频网站而不是练习平台

Deep Interview 确保在写代码之前，需求已经足够清晰。

### 借鉴 Ouroboros 项目

Deep Interview 灵感来自 [Ouroboros 项目](https://github.com/Q00/ouroboros)，该项目证明了：

> **规格质量是 AI 开发的主要瓶颈**

---

## 与其他模式的关系

### 3-Stage Pipeline

```
Deep Interview → Ralplan (共识) → Autopilot
```

| 阶段 | 目标 | 方式 |
|------|------|------|
| Deep Interview | 需求澄清 | 苏格拉底提问 |
| Ralplan | 计划细化 | 多方评审 |
| Autopilot | 自动执行 | 全自动实现 |

### 模式选择

| 场景 | 推荐模式 |
|------|----------|
| 需求完全不清楚 | Deep Interview |
| 需求基本清楚 | Ralplan |
| 需求很清晰 | Autopilot |

---

## 技术细节

### 维度评分

```typescript
interface ClarityScore {
  功能范围: number;      // 0-1
  用户画像: number;      // 0-1
  技术约束: number;      // 0-1
  验收标准: number;     // 0-1
  时间预算: number;      // 0-1
}

function calculateAmbiguity(scores: ClarityScore): number {
  // 模糊度 = 1 - 平均清晰度
  const avg = (scores.功能范围 + scores.用户画像 +
               scores.技术约束 + scores.验收标准 +
               scores.时间预算) / 5;
  return 1 - avg;
}
```

### 挑战模式

在特定轮次，系统会激活"挑战者"视角：

- **安全专家**：这个功能有什么安全风险？
- **产品经理**：用户真的需要这个吗？
- **技术专家**：技术实现可行吗？

---

## 使用建议

### 什么时候用

- 只有一个模糊的想法
- 担心做出来"不是想要的"
- 复杂项目，不确定要什么
- 想避免返工

### 什么时候不用

- 需求已经很清晰 → 直接用 Autopilot
- 只是问问题 → 直接问
- 快速小改动 → 直接做

### 优化技巧

1. **认真回答**：每个回答都会影响下一个问题
2. **想到就说**：不必等到想清楚在说
3. **可以随时退出**：可以说"够了，先这样做"

---

## 总结

Deep Interview 是 oh-my-claudecode 最独特的功能：

- **苏格拉底方法**：通过提问引导思考
- **模糊度评分**：量化需求清晰度
- **阈值控制**：模糊度 ≤ 20% 才能执行
- **3-Stage Pipeline**：无缝连接后续执行

如果你有一个模糊的想法，Deep Interview 是最好的起点！

---

## 参考链接

- [GitHub: oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [Deep Interview Skill 文档](https://github.com/Yeachan-Heo/oh-my-claudecode/tree/main/skills/deep-interview)
- [Ouroboros 项目](https://github.com/Q00/ouroboros)
