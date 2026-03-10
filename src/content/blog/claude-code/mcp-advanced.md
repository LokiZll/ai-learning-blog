---
title: "Claude Code MCP 深入：自定义 Server 开发实战"
description: "手把手教你开发自定义 MCP Server，扩展 Claude Code 的能力边界，实现与任意系统集成"
category: "claude-code"
tags: ["claude-code", "MCP", "Server", "自定义集成"]
date: 2026-03-10
series: "Claude Code 进阶系列"
seriesOrder: 3
---

## 什么是 MCP

MCP（Model Context Protocol）是 Claude Code 的扩展协议，允许你为 Claude 添加自定义工具和能力。通过 MCP Server，你可以：

- 连接外部 API（GitHub、Slack、数据库等）
- 执行自定义操作（文件处理、系统命令等）
- 扩展 Claude 的技能范围

---

## MCP 架构概览

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│   MCP Client    │────▶│   MCP Server    │
│                 │     │   (内置)         │     │   (自定义)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  外部系统       │
                                               │  (API/DB/文件系统)│
                                               └─────────────────┘
```

---

## 快速开始：内置 MCP

Claude Code 自带一些常用 MCP：

### 添加 NPM 包作为 MCP

```bash
claude mcp add npm:/@anthropic-ai/mcp-server-github
```

### 查看已添加的 MCP

```bash
claude mcp list
```

### 移除 MCP

```bash
claude mcp remove server-name
```

---

## 自定义 MCP Server 开发

下面我们开发一个实际可用的 MCP Server：项目管理 MCP。

### 1. 创建项目

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/server-filesystem zod
```

### 2. 基本结构

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'project-manager',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 定义工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_task',
        description: '创建一个新任务',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '任务标题' },
            description: { type: 'string', description: '任务描述' },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: '优先级'
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'list_tasks',
        description: '列出所有任务',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed'],
              description: '过滤状态'
            },
          },
        },
      },
      {
        name: 'update_task_status',
        description: '更新任务状态',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: { type: 'string', description: '任务 ID' },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed'],
              description: '新状态'
            },
          },
          required: ['taskId', 'status'],
        },
      },
    ],
  };
});

// 任务存储（内存中，生产环境用数据库）
const tasks = new Map();

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'create_task': {
      const id = `task_${Date.now()}`;
      const task = {
        id,
        title: args.title,
        description: args.description || '',
        priority: args.priority || 'medium',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      tasks.set(id, task);
      return {
        content: [
          {
            type: 'text',
            text: `✅ 已创建任务: ${task.title} (ID: ${id})`,
          },
        ],
      };
    }

    case 'list_tasks': {
      let taskList = Array.from(tasks.values());
      if (args.status) {
        taskList = taskList.filter(t => t.status === args.status);
      }
      const text = taskList.length === 0
        ? '暂无任务'
        : taskList.map(t => `- [${t.status}] ${t.title} (${t.priority})`).join('\n');
      return {
        content: [{ type: 'text', text }],
      };
    }

    case 'update_task_status': {
      const task = tasks.get(args.taskId);
      if (!task) {
        return {
          content: [{ type: 'text', text: '❌ 任务不存在' }],
        };
      }
      task.status = args.status;
      tasks.set(args.taskId, task);
      return {
        content: [
          { type: 'text', text: `✅ 已更新任务状态: ${task.title} → ${args.status}` },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 3. 打包配置

```json
// package.json
{
  "type": "module",
  "bin": {
    "project-manager": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## 在 Claude Code 中使用

### 添加自定义 MCP

```bash
claude mcp add project-manager /path/to/my-mcp-server/dist/index.js
```

### 使用示例

```
> 创建一个高优先级的任务：实现用户登录功能
> 创建一个低优先级的任务：更新文档

> 列出所有待处理的任务

> 把第一个任务的状态改为进行中
```

---

## 实战案例：数据库 MCP Server

### 连接 PostgreSQL

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import pg from 'pg';

const { Pool } = pg;

// 连接数据库
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const server = new Server(
  { name: 'database-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query',
        description: '执行 SQL 查询',
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string', description: 'SQL 查询语句' },
          },
          required: ['sql'],
        },
      },
      {
        name: 'describe_table',
        description: '查看表结构',
        inputSchema: {
          type: 'object',
          properties: {
            table: { type: 'string', description: '表名' },
          },
          required: ['table'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'query': {
      const result = await pool.query(args.sql);
      return {
        content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }],
      };
    }

    case 'describe_table': {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
      `, [args.table]);
      return {
        content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### 使用方式

```
> 查询 users 表中有多少用户

> 查看 orders 表的结构
```

---

## 最佳实践

### 1. 错误处理

```typescript
try {
  // 操作数据库
} catch (error) {
  return {
    content: [{ type: 'text', text: `❌ 错误: ${error.message}` }],
    isError: true,
  };
}
```

### 2. 安全性

- 不要在 MCP Server 中硬凭证
- 使用环境变量
- 限制可执行的 SQL 操作

```typescript
// 禁止危险操作
if (args.sql.toLowerCase().includes('drop') &&
    args.sql.toLowerCase().includes('table')) {
  throw new Error('不允许删除表');
}
```

### 3. 日志记录

```typescript
console.error(`[${new Date().toISOString()}] Query:`, args.sql);
```

---

## 常用 MCP 生态

| MCP | 功能 |
|-----|------|
| @anthropic-ai/mcp-server-github | GitHub API 操作 |
| @modelcontextprotocol/server-filesystem | 文件系统操作 |
| @modelcontextprotocol/server-brave-search | 搜索 |
| @modelcontextprotocol/server-puppeteer | 浏览器控制 |

---

## 总结

MCP 是扩展 Claude Code 能力的最强方式：

1. **连接外部系统** - 数据库、API、文件系统
2. **自定义工具** - 按需创建特定功能
3. **生态丰富** - 社区已有大量可用 MCP

通过自定义 MCP，你可以把 Claude Code 变成任何系统的控制中心！
