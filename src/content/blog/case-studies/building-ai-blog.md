---
title: "用 AI 搭建个人学习博客"
description: "记录使用 Astro + AI 工具从零搭建个人知识博客的完整过程"
category: "case-studies"
tags: ["astro", "博客", "实战"]
date: 2026-03-10
---

## 项目背景

作为一个 AI 学习者，学习笔记散落在 Notion、印象笔记、GitHub 等多个平台，检索效率低下。于是决定搭建一个专属的 AI 学习博客，统一管理所有学习内容。

### 需求分析

核心需求很简单：

1. **写作方便**：用 Markdown 写文章，Git 管理版本
2. **分类清晰**：按 AI 基础、提示工程、AI 工具、实战案例分类
3. **搜索快速**：全文搜索，快速找到需要的内容
4. **阅读舒适**：代码高亮、目录导航、暗黑模式

## 技术选型

经过对比，最终选择了以下技术栈：

```
框架：Astro 5.x（静态站点生成）
交互：React（搜索、主题切换）
样式：Tailwind CSS v4
搜索：Pagefind（静态全文搜索）
部署：Vercel + GitHub 自动部署
```

### 为什么选 Astro

- **零 JS 默认**：静态页面不加载多余的 JavaScript
- **内容优先**：内置 Content Collections，天然适合博客
- **Islands 架构**：只在需要交互的地方加载 React
- **构建速度快**：静态生成，页面加载极快

## 实现过程

### 1. 内容管理

使用 Astro 的 Content Collections 管理文章：

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['ai-basics', 'prompt-engineering', 'ai-tools', 'case-studies']),
    tags: z.array(z.string()),
    date: z.coerce.date(),
  }),
});
```

### 2. 搜索集成

Pagefind 在构建时生成搜索索引，无需后端服务：

```json
{
  "scripts": {
    "build": "astro build && npx pagefind --site dist"
  }
}
```

在文章页面标记需要索引的内容区域：

```html
<div data-pagefind-body>
  <!-- 文章内容 -->
</div>
```

### 3. 暗黑模式

通过 Tailwind CSS 的 `dark:` 变体实现，配合 `localStorage` 持久化用户偏好。关键是在 `<head>` 中添加内联脚本，防止页面闪烁。

## 经验总结

1. **Astro 的 Content Collections 非常好用**，Zod schema 验证确保文章元数据的一致性
2. **Pagefind 是静态博客搜索的最佳选择**，零配置、体积小、搜索快
3. **Tailwind v4 的 CSS-first 配置**比之前的 JS 配置更简洁
4. **AI 工具大幅提升了开发效率**，从设计到编码全程有 AI 辅助

> 最好的学习方式就是边学边做，把学到的东西用起来。
