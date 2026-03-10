---
title: "Claude Code 入门指南"
description: "快速上手 Claude Code CLI，掌握 AI 辅助编程的核心工作流"
category: "claude-code"
tags: ["claude-code", "CLI", "入门"]
date: 2026-03-10
series: "Claude Code 从入门到精通"
seriesOrder: 1
---

## 什么是 Claude Code

Claude Code 是 Anthropic 推出的官方 CLI 工具，让你在终端中直接与 Claude 协作编程。它能读取项目文件、执行命令、编辑代码，像一个真正的编程搭档。

### 核心能力

- **代码理解**：自动读取项目结构和文件内容
- **代码编写**：直接创建和修改文件
- **命令执行**：运行构建、测试等 shell 命令
- **多轮对话**：保持上下文，持续迭代

## 安装与使用

```bash
# 安装
npm install -g @anthropic-ai/claude-code

# 在项目目录中启动
cd your-project
claude
```

### 常用操作

直接用自然语言描述你的需求：

```
> 帮我修复 login 页面的表单验证 bug
> 给这个项目添加 dark mode 支持
> 重构 utils/api.ts，改用 fetch 替代 axios
```

## 自定义命令

在项目中创建 `.claude/commands/` 目录，添加 Markdown 文件即可定义自定义命令：

```markdown
<!-- .claude/commands/deploy.md -->
构建项目并部署到服务器。

1. 运行 `npm run build`
2. 上传 dist/ 到服务器
3. 验证部署结果

$ARGUMENTS
```

使用方式：`/project:deploy`

## 最佳实践

1. **提供上下文**：在 `CLAUDE.md` 中描述项目结构和约定
2. **善用自定义命令**：将重复操作封装为命令
3. **审查变更**：AI 生成的代码要仔细审查
4. **渐进式使用**：从小任务开始，逐步信任
