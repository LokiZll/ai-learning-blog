---
title: "Cursor IDE 使用指南"
description: "全面了解 Cursor IDE 的核心功能和使用技巧，提升 AI 辅助编程效率"
category: "ai-tools"
tags: ["cursor", "IDE", "编程工具"]
date: 2026-03-08
---

## Cursor 简介

Cursor 是一款基于 VS Code 的 AI 驱动代码编辑器，深度集成了大语言模型，让 AI 成为你的编程搭档。

### 核心功能

1. **AI Chat**：在编辑器内与 AI 对话，讨论代码问题
2. **Inline Edit**：选中代码后直接让 AI 修改
3. **代码补全**：智能的 Tab 补全，理解项目上下文
4. **Composer**：多文件编辑，AI 帮你完成跨文件的修改

## 快速上手

### 安装与配置

从 [cursor.com](https://cursor.com) 下载安装后，可以直接导入 VS Code 的配置：

```bash
# Cursor 支持直接导入 VS Code 扩展和设置
# 首次启动时会提示是否导入
```

### 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd + K` | Inline Edit（行内编辑） |
| `Cmd + L` | 打开 AI Chat |
| `Cmd + I` | 打开 Composer |
| `Tab` | 接受 AI 补全建议 |

## 使用技巧

### 1. 善用 @引用

在 Chat 中使用 `@` 符号引用上下文：

```
@file:src/utils/auth.ts 这个文件的认证逻辑有什么安全隐患？
@codebase 项目中哪里用到了 Redis？
```

### 2. 编写 .cursorrules

在项目根目录创建 `.cursorrules` 文件，定义项目规范：

```
# .cursorrules 示例
你是一个 TypeScript 专家。
项目使用 React 18 + Next.js 14。
遵循以下规范：
- 使用函数组件和 Hooks
- 使用 Tailwind CSS 进行样式开发
- 所有组件都需要 TypeScript 类型定义
```

### 3. Composer 多文件编辑

当需要跨多个文件进行修改时，Composer 非常有用：

```
请帮我创建一个用户认证模块：
1. 创建 src/hooks/useAuth.ts
2. 创建 src/components/LoginForm.tsx
3. 更新 src/app/layout.tsx 添加认证 Provider
```

## 最佳实践

- **提供足够上下文**：让 AI 了解你的项目结构和技术栈
- **审查 AI 生成的代码**：不要盲目接受，理解每一行代码
- **渐进式使用**：从简单的补全开始，逐步尝试更复杂的功能
- **结合文档**：AI 可能不了解最新的 API，必要时提供文档链接
