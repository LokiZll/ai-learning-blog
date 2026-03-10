---
title: "Claude Code Skills 技能系统完全指南"
description: "深入了解 Claude Code 的 Skills 技能系统，包括内置技能、自定义配置和实战用法"
category: "claude-code"
tags: ["claude-code", "skills", "技能系统", "slash commands", "MCP"]
date: 2026-03-10
series: "Claude Code 从入门到精通"
seriesOrder: 3
---

## 什么是 Skills？

Skills（技能）是 Claude Code 提供的快捷命令系统，让你通过 `/技能名` 的方式快速调用特定功能。每个技能都对应一组预定义的 prompt 和工具权限，可以显著提升工作效率。

### 技能调用方式

```
/skill-name        # 调用技能
/skills            # 查看所有可用技能列表
```

---

## 内置技能列表

Claude Code 提供以下内置技能：

### 1. /commit - 智能提交

自动分析代码变更，生成符合规范的 Git 提交信息。

```
/commit
/commit -m "自定义消息"
```

**工作流程：**
1. 分析当前 git 状态
2. 展示变更摘要供确认
3. 自动生成提交信息
4. 执行提交（需确认）

### 2. /review-pr - PR 审查

获取 PR 详细信息并进行代码审查。

```
/review-pr 123
/review-pr 456 --repo owner/repo
```

**功能：**
- 获取 PR 标题、描述、状态
- 列出变更文件
- 分析代码质量
- 提供改进建议

### 3. /test - 测试生成

为当前代码上下文生成测试用例。

```
/test
/test --framework vitest
/test --coverage
```

### 4. /docs - 文档生成

生成或增强代码文档。

```
/docs
/docs --format markdown
```

---

## 自定义技能配置

### 配置文件位置

在项目根目录创建 `.claude/settings.json`：

```json
{
  "skills": {
    "my-skill": {
      "description": "自定义技能描述",
      "prompt": "你是一个 X 专家，请帮我...",
      "tools": ["Read", "Edit", "Write", "Bash"],
      "env": {
        "API_KEY": "value"
      }
    }
  }
}
```

### 技能字段说明

| 字段 | 说明 |
|------|------|
| `description` | 技能描述，用于 `/skills` 列表显示 |
| `prompt` | 技能的 system prompt |
| `tools` | 允许使用的工具列表 |
| `env` | 环境变量（仅在技能运行时可用） |

### 示例：API 文档生成技能

```json
{
  "skills": {
    "api-docs": {
      "description": "生成 OpenAPI 文档",
      "prompt": "你是一个 API 文档专家。请根据代码中的接口定义生成 OpenAPI 3.0 规范的 YAML 文档。",
      "tools": ["Read", "Glob", "Grep", "Write"]
    }
  }
}
```

使用方式：`/api-docs`

---

## MCP 技能扩展

通过 MCP（Model Context Protocol）可以添加更多技能。

### 安装 MCP 服务器

```bash
claude mcp add npm:/path/to/server
```

### 常用 MCP 技能

- **GitHub**: 仓库管理、Issue、PR 操作
- **Slack**: 消息发送
- **Database**: 数据库查询
- **Filesystem**: 高级文件操作

---

## 技能使用技巧

### 1. 组合使用

```
# 先审查代码，再生成测试
/review-pr 123
/test
```

### 2. 传参

部分技能支持参数：

```
/commit "修复登录 bug"
/review-pr 456 --repo my-org/my-repo
```

### 3. 在对话中引用

```
帮我用 /test 技能为这个函数生成测试
```

---

## 常见问题

### Q: 如何查看所有可用技能？

运行 `/skills` 或查看官方文档。

### Q: 技能可以自定义快捷键吗？

不支持自定义快捷键，但技能会自动补全。

### Q: 技能权限可以限制吗？

可以，通过 `tools` 字段限制可用工具。

---

## 总结

Skills 是 Claude Code 强大的扩展机制：

- **内置技能**：开箱即用，覆盖常见场景
- **自定义技能**：灵活配置，满足特定需求
- **MCP 扩展**：生态丰富，按需添加

掌握技能系统，让你的开发效率翻倍！
