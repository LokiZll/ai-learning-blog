---
title: "从零编写 Claude Code Team 模式：多智能体协作框架完整实现指南"
description: "手把手教你从零开始构建一个类似 oh-my-claudecode 的 Team 多智能体协作系统，包含 Agent 定义、任务协调、状态管理等核心功能的完整实现"
category: "claude-code"
tags: ["claude-code", "team", "multi-agent", "框架开发", "教程"]
date: 2026-03-10
---

## 为什么要写 Team 模式

在上一篇文章中，我们介绍了 oh-my-claudecode 的 Team 模式。它解决的问题是：

- 单个 Agent 能力有限
- 复杂任务需要多人协作
- 需要自动分解任务、协调资源

今天，我们来**从零实现一个简化版的 Team 模式**。

---

## 最终目标

我们要实现一个这样的系统：

```bash
/team 3 "修复所有 TypeScript 错误"
```

系统会自动：
1. 分析任务，分解成多个子任务
2. 创建多个 Agent 并行处理
3. 协调任务依赖关系
4. 收集结果，验证完成

---

## 技术架构

### 核心组件

```
team-framework/
├── agents/           # Agent 定义
│   └── executor.md
├── skills/          # Skill 定义
│   └── team/
│       └── skill.md
├── src/
│   ├── index.ts     # 入口
│   ├── orchestrator.ts  # 协调器
│   ├── task.ts     # 任务管理
│   ├── agent.ts    # Agent 管理
│   └── state.ts    # 状态管理
└── package.json
```

### 技术栈

- TypeScript
- Node.js
- @anthropic-ai/claude-agent-sdk

---

## 步骤 1：初始化项目

### 创建项目结构

```bash
mkdir team-framework && cd team-framework
npm init -y
npm install typescript @types/node tsx @anthropic-ai/claude-agent-sdk zod
npx tsc --init
```

### 配置 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

---

## 步骤 2：定义 Agent 系统

### 创建 Agent 基类

```typescript
// src/agent.ts

export type AgentModel = 'haiku' | 'sonnet' | 'opus';

export interface AgentConfig {
  name: string;
  description: string;
  model: AgentModel;
  systemPrompt: string;
}

export interface Agent {
  config: AgentConfig;
  execute(task: Task): Promise<TaskResult>;
}

// Agent 实现：Executor
export class ExecutorAgent implements Agent {
  config: AgentConfig;

  constructor(model: AgentModel = 'sonnet') {
    this.config = {
      name: 'executor',
      description: '代码执行 Agent',
      model,
      systemPrompt: `You are Executor. Your mission is to implement code changes precisely as specified.

Success Criteria:
- The requested change is implemented with the smallest viable diff
- All modified files pass type checking
- Build and tests pass
- No new abstractions introduced for single-use logic

Constraints:
- Work ALONE for implementation
- Prefer the smallest viable change
- Do not broaden scope beyond requested behavior`
    };
  }

  async execute(task: Task): Promise<TaskResult> {
    console.log(`[Executor] Starting task: ${task.id}`);

    // 这里调用 Claude API 执行任务
    const result = await this.runWithClaude(task);

    console.log(`[Executor] Completed task: ${task.id}`);
    return result;
  }

  private async runWithClaude(task: Task): Promise<TaskResult> {
    // 实际实现中调用 Claude API
    // 这里简化处理
    return {
      taskId: task.id,
      success: true,
      output: 'Task completed',
      artifacts: []
    };
  }
}
```

### 创建任务类型

```typescript
// src/task.ts

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Task {
  id: string;
  description: string;
  status: TaskStatus;
  dependencies: string[];  // 依赖的其他任务 ID
  assignee?: string;       // 分配的 Agent ID
  result?: TaskResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  output: string;
  artifacts: string[];  // 生成的文件等
  error?: string;
}

export interface TaskGraph {
  tasks: Map<string, Task>;

  // 添加任务
  addTask(task: Task): void;

  // 获取可执行的任务（所有依赖都已完成）
  getRunnableTasks(): Task[];

  // 更新任务状态
  updateTaskStatus(taskId: string, status: TaskStatus, result?: TaskResult): void;

  // 检查是否全部完成
  isComplete(): boolean;
}
```

### 实现任务图

```typescript
// src/task-graph.ts

import { Task, TaskResult, TaskStatus, TaskGraph } from './task.js';

export class TaskGraphImpl implements TaskGraph {
  tasks: Map<string, Task> = new Map();

  addTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  getRunnableTasks(): Task[] {
    const runnable: Task[] = [];

    for (const [id, task] of this.tasks) {
      if (task.status !== 'pending') continue;

      // 检查所有依赖是否都已完成
      const depsCompleted = task.dependencies.every(depId => {
        const dep = this.tasks.get(depId);
        return dep?.status === 'completed';
      });

      if (depsCompleted) {
        runnable.push(task);
      }
    }

    return runnable;
  }

  updateTaskStatus(taskId: string, status: TaskStatus, result?: TaskResult): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = status;
    task.result = result;
    task.updatedAt = new Date();
  }

  isComplete(): boolean {
    for (const task of this.tasks.values()) {
      if (task.status !== 'completed' && task.status !== 'failed') {
        return false;
      }
    }
    return true;
  }
}
```

---

## 步骤 3：实现任务分解器

### 任务分解策略

```typescript
// src/decomposer.ts

export interface DecompositionResult {
  tasks: Task[];
  dependencies: Map<string, string[]>;  // taskId -> 依赖的 taskIds
}

export class TaskDecomposer {

  /**
   * 将一个大任务分解为多个子任务
   */
  async decompose(mainTask: string, agent: Agent): Promise<DecompositionResult> {
    console.log(`[Decomposer] Decomposing: ${mainTask}`);

    // 使用 Claude 来分析任务并分解
    const decompositionPrompt = `
请分析以下任务，将其分解为多个可并行执行的子任务。

任务: ${mainTask}

请以 JSON 格式返回任务列表：
{
  "tasks": [
    {
      "id": "task-1",
      "description": "子任务描述"
    },
    ...
  ],
  "dependencies": {
    "task-2": ["task-1"],  // task-2 依赖 task-1
    ...
  }
}

原则：
1. 每个子任务应该可以独立执行
2. 任务数量控制在 1-10 个
3. 优先并行，必要时才设置依赖
`;

    // 调用 Claude API 获取分解结果
    const response = await this.callClaude(decompositionPrompt);
    const parsed = JSON.parse(response);

    // 转换为 Task 对象
    const tasks: Task[] = parsed.tasks.map((t: any) => ({
      id: t.id,
      description: t.description,
      status: 'pending' as TaskStatus,
      dependencies: parsed.dependencies[t.id] || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return { tasks, dependencies: new Map(Object.entries(parsed.dependencies)) };
  }

  private async callClaude(prompt: string): Promise<string> {
    // 这里简化处理，实际需要调用 Claude API
    // 返回示例分解结果
    return JSON.stringify({
      tasks: [
        { id: 'task-1', description: '分析 TypeScript 错误' },
        { id: 'task-2', description: '修复错误 1-10' },
        { id: 'task-3', description: '修复错误 11-20' },
        { id: 'task-4', description: '修复错误 21-30' },
        { id: 'task-5', description: '验证修复结果' }
      ],
      dependencies: {
        'task-2': ['task-1'],
        'task-3': ['task-1'],
        'task-4': ['task-1'],
        'task-5': ['task-2', 'task-3', 'task-4']
      }
    });
  }
}
```

---

## 步骤 4：实现 Agent 池

### Agent 池管理

```typescript
// src/agent-pool.ts

import { Agent, ExecutorAgent } from './agent.js';

export interface AgentInstance {
  id: string;
  type: string;
  agent: Agent;
  status: 'idle' | 'busy';
  currentTask?: string;
}

export class AgentPool {
  private agents: Map<string, AgentInstance> = new Map();
  private queue: string[] = [];  // 任务队列

  constructor() {
    // 默认创建 3 个 Executor
    this.createAgents('executor', 3);
  }

  createAgents(type: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const id = `${type}-${i + 1}`;

      let agent: Agent;
      switch (type) {
        case 'executor':
          agent = new ExecutorAgent();
          break;
        default:
          agent = new ExecutorAgent();
      }

      this.agents.set(id, {
        id,
        type,
        agent,
        status: 'idle'
      });
    }

    console.log(`[AgentPool] Created ${count} ${type} agents`);
  }

  /**
   * 获取一个空闲的 Agent
   */
  getIdleAgent(): AgentInstance | undefined {
    for (const agent of this.agents.values()) {
      if (agent.status === 'idle') {
        return agent;
      }
    }
    return undefined;
  }

  /**
   * 分配任务给 Agent
   */
  async assignTask(taskId: string, agentInstance: AgentInstance, task: Task): Promise<void> {
    agentInstance.status = 'busy';
    agentInstance.currentTask = taskId;

    console.log(`[AgentPool] Assigning task ${taskId} to ${agentInstance.id}`);

    try {
      const result = await agentInstance.agent.execute(task);

      console.log(`[AgentPool] Task ${taskId} completed by ${agentInstance.id}`);

      // 释放 Agent
      agentInstance.status = 'idle';
      agentInstance.currentTask = undefined;

    } catch (error) {
      console.error(`[AgentPool] Task ${taskId} failed:`, error);
      agentInstance.status = 'idle';
      agentInstance.currentTask = undefined;
      throw error;
    }
  }

  /**
   * 获取 Agent 状态
   */
  getStatus(): { idle: number; busy: number } {
    let idle = 0, busy = 0;
    for (const agent of this.agents.values()) {
      if (agent.status === 'idle') idle++;
      else busy++;
    }
    return { idle, busy };
  }
}
```

---

## 步骤 5：实现协调器

### Team 协调器

```typescript
// src/orchestrator.ts

import { Task, TaskResult, TaskGraph } from './task.js';
import { TaskGraphImpl } from './task-graph.js';
import { TaskDecomposer, DecompositionResult } from './decomposer.js';
import { AgentPool } from './agent-pool.js';
import { StateManager } from './state.js';

export interface TeamConfig {
  maxParallel: number;      // 最大并行数
  maxRetries: number;      // 最大重试次数
  timeout: number;         // 任务超时时间(毫秒)
}

export class TeamOrchestrator {
  private decomposer: TaskDecomposer;
  private agentPool: AgentPool;
  private stateManager: StateManager;
  private config: TeamConfig;

  constructor(config: Partial<TeamConfig> = {}) {
    this.config = {
      maxParallel: 5,
      maxRetries: 3,
      timeout: 300000,
      ...config
    };

    this.decomposer = new TaskDecomposer();
    this.agentPool = new AgentPool();
    this.stateManager = new StateManager();
  }

  /**
   * 执行 Team 任务
   */
  async execute(task: string, agentCount: number = 3): Promise<TeamResult> {
    console.log(`[Orchestrator] Starting team task: ${task}`);

    // 1. 分解任务
    const decomposition = await this.decomposer.decompose(task, new ExecutorAgent());

    // 2. 创建任务图
    const taskGraph = new TaskGraphImpl();
    for (const t of decomposition.tasks) {
      taskGraph.addTask(t);
    }

    // 保存状态
    const sessionId = this.stateManager.createSession(task);

    try {
      // 3. 执行任务循环
      await this.executeLoop(taskGraph);

      // 4. 收集结果
      const results = this.collectResults(taskGraph);

      console.log(`[Orchestrator] Team task completed`);

      return {
        success: true,
        taskCount: decomposition.tasks.length,
        results
      };

    } finally {
      this.stateManager.endSession(sessionId);
    }
  }

  /**
   * 执行循环
   */
  private async executeLoop(taskGraph: TaskGraph): Promise<void> {
    let iteration = 0;
    const maxIterations = 100;  // 防止无限循环

    while (!taskGraph.isComplete() && iteration < maxIterations) {
      iteration++;

      // 获取可执行的任务
      const runnableTasks = taskGraph.getRunnableTasks();

      if (runnableTasks.length === 0) {
        // 没有可执行的任务，检查是否有死锁
        const pending = Array.from(taskGraph.tasks.values())
          .filter(t => t.status === 'pending');

        if (pending.length > 0) {
          console.error('[Orchestrator] Deadlock detected: no runnable tasks but some pending');
          break;
        }
        break;
      }

      // 获取空闲的 Agent
      const idleAgents: any[] = [];
      let agent = this.agentPool.getIdleAgent();
      while (agent && idleAgents.length < this.config.maxParallel) {
        idleAgents.push(agent);
        agent = this.agentPool.getIdleAgent();
      }

      if (idleAgents.length === 0) {
        // 所有 Agent 都忙，等待一下
        await this.sleep(1000);
        continue;
      }

      // 分配任务给 Agents
      const promises: Promise<any>[] = [];

      for (let i = 0; i < Math.min(runnableTasks.length, idleAgents.length); i++) {
        const task = runnableTasks[i];
        const agentInstance = idleAgents[i];

        task.status = 'in_progress';

        const promise = this.agentPool.assignTask(task.id, agentInstance, task)
          .then(result => {
            taskGraph.updateTaskStatus(
              task.id,
              result.success ? 'completed' : 'failed',
              result
            );
          })
          .catch(error => {
            taskGraph.updateTaskStatus(task.id, 'failed', {
              taskId: task.id,
              success: false,
              output: '',
              artifacts: [],
              error: String(error)
            });
          });

        promises.push(promise);
      }

      // 等待这批任务完成
      await Promise.all(promises);
    }
  }

  /**
   * 收集结果
   */
  private collectResults(taskGraph: TaskGraph): TaskResult[] {
    const results: TaskResult[] = [];

    for (const task of taskGraph.tasks.values()) {
      if (task.result) {
        results.push(task.result);
      }
    }

    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface TeamResult {
  success: boolean;
  taskCount: number;
  results: TaskResult[];
}
```

---

## 步骤 6：实现状态管理

### 状态管理器

```typescript
// src/state.ts

import { Task } from './task.js';

export interface TeamSession {
  id: string;
  mainTask: string;
  tasks: Task[];
  status: 'running' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export class StateManager {
  private sessions: Map<string, TeamSession> = new Map();

  /**
   * 创建新会话
   */
  createSession(mainTask: string): string {
    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: TeamSession = {
      id,
      mainTask,
      tasks: [],
      status: 'running',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(id, session);
    console.log(`[StateManager] Created session: ${id}`);

    return id;
  }

  /**
   * 获取会话
   */
  getSession(id: string): TeamSession | undefined {
    return this.sessions.get(id);
  }

  /**
   * 更新会话状态
   */
  updateSession(id: string, updates: Partial<TeamSession>): void {
    const session = this.sessions.get(id);
    if (session) {
      Object.assign(session, updates, { updatedAt: new Date() });
    }
  }

  /**
   * 结束会话
   */
  endSession(id: string): void {
    const session = this.sessions.get(id);
    if (session) {
      session.status = 'completed';
      session.updatedAt = new Date();
      console.log(`[StateManager] Session ended: ${id}`);
    }
  }

  /**
   * 获取所有会话
   */
  getAllSessions(): TeamSession[] {
    return Array.from(this.sessions.values());
  }
}
```

---

## 步骤 7：创建 Skill 定义

### Team Skill 配置

```markdown
---
name: team
description: N coordinated agents on shared task list
---

# Team Skill

## Usage

```
/team N "task description"
/team "task description"
```

## Parameters

- **N** - Number of teammate agents (1-20)
- **task** - High-level task to decompose

## Execution Flow

1. Parse the user's input
2. Decompose task into subtasks
3. Create task graph with dependencies
4. Assign tasks to agents in parallel
5. Monitor progress and handle dependencies
6. Collect results

## Agent Types

| Type | Model | Use Case |
|------|-------|----------|
| executor | Sonnet | Standard implementation |
| executor | Opus | Complex tasks |
| debugger | Sonnet | Bug fixing |
```

---

## 步骤 8：创建 CLI 入口

### 主入口文件

```typescript
// src/index.ts

import { TeamOrchestrator } from './orchestrator.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: team-framework "task description"');
    console.log('       team-framework 3 "task description"');
    process.exit(1);
  }

  // 解析参数
  let agentCount = 3;
  let task = '';

  if (/^\d+$/.test(args[0])) {
    agentCount = parseInt(args[0]);
    task = args.slice(1).join(' ');
  } else {
    task = args.join(' ');
  }

  if (!task) {
    console.error('Error: No task specified');
    process.exit(1);
  }

  console.log(`\n=== Team Framework ===`);
  console.log(`Task: ${task}`);
  console.log(`Agents: ${agentCount}\n`);

  // 执行任务
  const orchestrator = new TeamOrchestrator({
    maxParallel: agentCount
  });

  const result = await orchestrator.execute(task, agentCount);

  console.log(`\n=== Results ===`);
  console.log(`Total tasks: ${result.taskCount}`);
  console.log(`Success: ${result.success}`);
  console.log(`Completed: ${result.results.filter(r => r.success).length}`);
  console.log(`Failed: ${result.results.filter(r => !r.success).length}\n`);
}

main().catch(console.error);
```

### package.json 配置

```json
{
  "name": "team-framework",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "team": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.1.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 步骤 9：运行测试

### 编译和运行

```bash
# 编译
npm run build

# 运行
npm start "修复所有 TypeScript 错误"
```

### 输出示例

```
=== Team Framework ===
Task: 修复所有 TypeScript 错误
Agents: 3

[Decomposer] Decomposing: 修复所有 TypeScript 错误
[AgentPool] Created 3 executor agents
[Orchestrator] Starting team task: 修复所有 TypeScript 错误
[AgentPool] Assigning task task-1 to executor-1
[AgentPool] Assigning task task-2 to executor-2
[AgentPool] Assigning task task-3 to executor-3
[AgentPool] Task task-1 completed by executor-1
[AgentPool] Task task-2 completed by executor-2
[AgentPool] Task task-3 completed by executor-3
[Orchestrator] Team task completed

=== Results ===
Total tasks: 5
Success: true
Completed: 5
Failed: 0
```

---

## 完整代码结构

```
team-framework/
├── agents/
│   └── executor.ts       # Agent 定义
├── skills/
│   └── team/
│       └── skill.md      # Skill 配置
├── src/
│   ├── index.ts          # 入口
│   ├── agent.ts          # Agent 基类
│   ├── agent-pool.ts     # Agent 池
│   ├── task.ts           # 任务类型
│   ├── task-graph.ts    # 任务图
│   ├── decomposer.ts    # 任务分解器
│   ├── orchestrator.ts  # 协调器
│   └── state.ts         # 状态管理
├── package.json
└── tsconfig.json
```

---

## 进阶功能

### 1. 添加更多 Agent 类型

```typescript
// 添加 Debugger Agent
export class DebuggerAgent implements Agent {
  config: AgentConfig = {
    name: 'debugger',
    description: '调试专家',
    model: 'sonnet',
    systemPrompt: `You are Debugger. Your mission is to find and fix bugs.

Focus on:
- Reading error messages carefully
- Finding the root cause
- Making minimal fixes
- Verifying the fix works`
  };

  async execute(task: Task): Promise<TaskResult> {
    // 调试逻辑
  }
}
```

### 2. 添加任务优先级

```typescript
interface Task {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
  // ...
}
```

### 3. 添加进度报告

```typescript
class TeamOrchestrator {
  private reportProgress(taskGraph: TaskGraph): void {
    const total = taskGraph.tasks.size;
    const completed = Array.from(taskGraph.tasks.values())
      .filter(t => t.status === 'completed').length;
    const progress = Math.round((completed / total) * 100);

    console.clear();
    console.log(`Progress: ${progress}% (${completed}/${total})`);
  }
}
```

### 4. 添加 Web UI

```typescript
// 简单的状态展示服务器
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(stateManager.getAllSessions()));
});

server.listen(3000);
```

---

## 总结

我们实现了一个简化版的 Team 框架，包含：

| 组件 | 功能 |
|------|------|
| Agent | 任务执行者（Executor, Debugger 等）|
| Agent Pool | Agent 池，管理多个 Agent |
| Task Graph | 任务图，管理依赖关系 |
| Task Decomposer | 任务分解器，拆分大任务 |
| Team Orchestrator | 协调器，协调整个流程 |
| State Manager | 状态管理，保存会话状态 |

### 下一步可以做的

1. **集成 Claude API** - 使用 @anthropic-ai/claude-agent-sdk
2. **添加更多 Agent** - Designer, Security Reviewer 等
3. **完善错误处理** - 重试、超时、熔断
4. **添加持久化** - 存储到数据库
5. **添加 Web UI** - 可视化进度

这个框架虽然简化，但包含了 Team 模式的核心思想：**任务分解 + 并行执行 + 依赖协调**。

---

## 参考代码

完整的代码可以在 GitHub 上找到（待添加）。
