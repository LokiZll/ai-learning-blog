---
title: "从零编写 Claude Code Autopilot 模式：从想法到代码的完全自动化实现指南"
description: "手把手教你从零开始构建一个类似 oh-my-claudecode 的 Autopilot 自动执行系统，包含需求分析、任务规划、代码执行、QA 验证等完整流程的实现"
category: "claude-code"
tags: ["claude-code", "autopilot", "自动化", "框架开发", "教程"]
date: 2026-03-10
---

## 什么是 Autopilot 模式

Autopilot 是最强大的自动化执行模式，你只需要描述你想要什么，系统会自动完成从需求分析到代码实现的全部工作。

```
/autopilot 构建一个博客系统
```

系统会自动：
1. **需求扩展** - 将模糊想法转化为详细规格
2. **任务规划** - 创建可执行的实现计划
3. **代码执行** - 并行实现各个模块
4. **QA 验证** - 循环测试直到通过
5. **多视角审查** - 架构、安全、质量全覆盖
6. **环境清理** - 清理临时文件

---

## 技术架构

### 核心组件

```
autopilot-framework/
├── src/
│   ├── index.ts           # 入口
│   ├── expander.ts       # 需求扩展器
│   ├── planner.ts        # 任务规划器
│   ├── executor.ts       # 代码执行器
│   ├── qa.ts            # QA 验证器
│   ├── validator.ts     # 多视角验证器
│   ├── cleaner.ts       # 环境清理器
│   └── pipeline.ts      # 管道协调
├── agents/              # Agent 定义
└── package.json
```

---

## 步骤 1：初始化项目

```bash
mkdir autopilot-framework && cd autopilot-framework
npm init -y
npm install typescript @types/node tsx @anthropic-ai/claude-agent-sdk zod
npx tsc --init
```

---

## 步骤 2：定义需求扩展器

### 需求扩展器实现

```typescript
// src/expander.ts

export interface Spec {
  title: string;
  description: string;
  features: Feature[];
  techStack: TechStack;
  acceptanceCriteria: string[];
}

export interface Feature {
  name: string;
  description: string;
  priority: 'must' | 'should' | 'could';
}

export interface TechStack {
  frontend?: string;
  backend?: string;
  database?: string;
  other?: string[];
}

export class RequirementExpander {
  private model: string;

  constructor(model: string = 'opus') {
    this.model = model;
  }

  /**
   * 将模糊想法扩展为详细规格
   */
  async expand(idea: string, context?: string): Promise<Spec> {
    console.log(`[Expander] Expanding: ${idea}`);

    const prompt = this.buildPrompt(idea, context);
    const response = await this.callClaude(prompt);

    return this.parseResponse(response);
  }

  private buildPrompt(idea: string, context?: string): string {
    return `
请分析以下想法，生成详细的产品规格。

原始想法: ${idea}

${context ? `项目背景: ${context}` : ''}

请以 JSON 格式返回规格：
{
  "title": "产品名称",
  "description": "一句话描述",
  "features": [
    {
      "name": "功能名称",
      "description": "功能描述",
      "priority": "must|should|could"
    }
  ],
  "techStack": {
    "frontend": "前端技术",
    "backend": "后端技术",
    "database": "数据库"
  },
  "acceptanceCriteria": ["验收标准1", "验收标准2"]
}
`;
  }

  private async callClaude(prompt: string): Promise<string> {
    // 这里简化处理，实际调用 Claude API
    return JSON.stringify({
      title: '博客系统',
      description: '一个功能完善的博客系统',
      features: [
        { name: '用户认证', description: '注册、登录、JWT', priority: 'must' },
        { name: '文章管理', description: 'CRUD 操作', priority: 'must' },
        { name: '评论系统', description: '文章评论功能', priority: 'should' },
        { name: '标签分类', description: '文章标签和分类', priority: 'could' }
      ],
      techStack: {
        frontend: 'React + TypeScript',
        backend: 'Express',
        database: 'SQLite'
      },
      acceptanceCriteria: [
        '用户可以注册和登录',
        '可以创建、编辑、删除文章',
        '文章可以添加标签',
        '可以查看文章列表和详情'
      ]
    });
  }

  private parseResponse(response: string): Spec {
    try {
      return JSON.parse(response);
    } catch {
      throw new Error('Failed to parse spec response');
    }
  }
}
```

---

## 步骤 3：定义任务规划器

### 任务规划器实现

```typescript
// src/planner.ts

import { Spec } from './expander.js';

export interface Plan {
  id: string;
  spec: Spec;
  steps: PlanStep[];
  estimatedTime: number;
}

export interface PlanStep {
  id: string;
  description: string;
  files: string[];
  dependencies: string[];
  estimatedTime: number;
}

export class TaskPlanner {
  /**
   * 根据规格创建实现计划
   */
  async createPlan(spec: Spec): Promise<Plan> {
    console.log('[Planner] Creating implementation plan...');

    const prompt = this.buildPrompt(spec);
    const response = await this.callClaude(prompt);

    return this.parseResponse(response, spec);
  }

  private buildPrompt(spec: Spec): string {
    return `
请为以下产品规格创建详细的实现计划。

产品规格:
- 名称: ${spec.title}
- 描述: ${spec.description}
- 技术栈: ${spec.techStack.frontEnd} + ${spec.techStack.backend}
- 数据库: ${spec.techStack.database}

功能列表:
${spec.features.map(f => `- ${f.name}: ${f.description}`).join('\n')}

请以 JSON 格式返回计划:
{
  "steps": [
    {
      "id": "step-1",
      "description": "步骤描述",
      "files": ["文件路径1", "文件路径2"],
      "dependencies": ["依赖步骤ID"],
      "estimatedTime": 30
    }
  ]
}
`;
  }

  private async callClaude(prompt: string): Promise<string> {
    // 返回示例计划
    return JSON.stringify({
      steps: [
        {
          id: 'step-1',
          description: '初始化项目结构',
          files: ['package.json', 'tsconfig.json', 'src/index.ts'],
          dependencies: [],
          estimatedTime: 10
        },
        {
          id: 'step-2',
          description: '实现用户认证模块',
          files: ['src/auth/register.ts', 'src/auth/login.ts', 'src/auth/middleware.ts'],
          dependencies: ['step-1'],
          estimatedTime: 30
        },
        {
          id: 'step-3',
          description: '实现文章管理模块',
          files: ['src/article/create.ts', 'src/article/list.ts', 'src/article/update.ts', 'src/article/delete.ts'],
          dependencies: ['step-2'],
          estimatedTime: 45
        },
        {
          id: 'step-4',
          description: '实现标签分类功能',
          files: ['src/tag/index.ts'],
          dependencies: ['step-3'],
          estimatedTime: 20
        },
        {
          id: 'step-5',
          description: '编写单元测试',
          files: ['tests/**/*.test.ts'],
          dependencies: ['step-3', 'step-4'],
          estimatedTime: 30
        }
      ]
    });
  }

  private parseResponse(response: string, spec: Spec): Plan {
    const data = JSON.parse(response);

    return {
      id: `plan-${Date.now()}`,
      spec,
      steps: data.steps,
      estimatedTime: data.steps.reduce((sum: number, s: any) => sum + s.estimatedTime, 0)
    };
  }
}
```

---

## 步骤 4：定义代码执行器

### 代码执行器实现

```typescript
// src/executor.ts

import { Plan, PlanStep } from './planner.js';

export interface ExecutionResult {
  stepId: string;
  success: boolean;
  output: string;
  files: string[];
  errors?: string[];
}

export class CodeExecutor {
  private parallel: boolean;

  constructor(parallel: boolean = true) {
    this.parallel = parallel;
  }

  /**
   * 执行计划
   */
  async execute(plan: Plan): Promise<ExecutionResult[]> {
    console.log(`[Executor] Starting execution: ${plan.steps.length} steps`);

    const results: ExecutionResult[] = [];
    const completed = new Set<string>();

    // 按依赖顺序执行
    for (const step of plan.steps) {
      // 检查依赖是否完成
      const depsReady = step.dependencies.every(depId => completed.has(depId));

      if (!depsReady) {
        console.log(`[Executor] Waiting for dependencies: ${step.id}`);
        continue;
      }

      console.log(`[Executor] Executing step: ${step.id}`);

      const result = await this.executeStep(step);
      results.push(result);

      if (result.success) {
        completed.add(step.id);
      } else {
        console.error(`[Executor] Step failed: ${step.id}`, result.errors);
        break;
      }
    }

    return results;
  }

  private async executeStep(step: PlanStep): Promise<ExecutionResult> {
    console.log(`[Executor] Implementing: ${step.description}`);
    console.log(`[Executor] Files: ${step.files.join(', ')}`);

    // 模拟代码生成
    const prompt = `
请实现以下功能:

步骤: ${step.description}
需要创建/修改的文件:
${step.files.map(f => `- ${f}`).join('\n')}

请生成代码。
`;

    // 这里实际会调用 Claude API 生成代码
    const code = await this.generateCode(step);

    // 模拟写入文件
    for (const file of step.files) {
      console.log(`[Executor] Writing: ${file}`);
    }

    return {
      stepId: step.id,
      success: true,
      output: 'Step completed',
      files: step.files
    };
  }

  private async generateCode(step: PlanStep): Promise<string> {
    // 实际实现中调用 Claude API
    return `# Generated code for ${step.description}`;
  }
}
```

---

## 步骤 5：定义 QA 验证器

### QA 验证器实现

```typescript
// src/qa.ts

export interface QAConfig {
  maxCycles: number;
  sameErrorThreshold: number;
}

export interface QAResult {
  passed: boolean;
  cycles: number;
  errors: QAError[];
}

export interface QAError {
  type: 'build' | 'lint' | 'test' | 'runtime';
  message: string;
  file?: string;
  line?: number;
}

export class QAValidator {
  private config: QAConfig;

  constructor(config: Partial<QAConfig> = {}) {
    this.config = {
      maxCycles: 5,
      sameErrorThreshold: 3,
      ...config
    };
  }

  /**
   * 运行 QA 循环直到通过或达到最大次数
   */
  async validate(): Promise<QAResult> {
    let cycles = 0;
    let lastError: string | null = null;
    let sameErrorCount = 0;
    const allErrors: QAError[] = [];

    while (cycles < this.config.maxCycles) {
      cycles++;
      console.log(`[QA] Cycle ${cycles}/${this.config.maxCycles}`);

      // 1. 构建
      const buildResult = await this.runBuild();
      if (!buildResult.success) {
        const error: QAError = {
          type: 'build',
          message: buildResult.error
        };
        allErrors.push(error);
        await this.fixErrors([error]);
        continue;
      }

      // 2. Lint
      const lintResult = await this.runLint();
      if (!lintResult.success) {
        const error: QAError = {
          type: 'lint',
          message: lintResult.error
        };
        allErrors.push(error);
        await this.fixErrors([error]);
        continue;
      }

      // 3. 测试
      const testResult = await this.runTests();
      if (!testResult.success) {
        const errors = testResult.errors.map(e => ({
          type: 'test' as const,
          message: e
        }));
        allErrors.push(...errors);
        await this.fixErrors(errors);

        // 检查是否同一错误重复
        const errorKey = testResult.errors.join(',');
        if (errorKey === lastError) {
          sameErrorCount++;
        } else {
          sameErrorCount = 0;
        }
        lastError = errorKey;

        if (sameErrorCount >= this.config.sameErrorThreshold) {
          console.error('[QA] Same error repeated too many times, stopping');
          break;
        }
        continue;
      }

      // 全部通过
      console.log('[QA] All checks passed!');
      return {
        passed: true,
        cycles,
        errors: []
      };
    }

    return {
      passed: false,
      cycles,
      errors: allErrors
    };
  }

  private async runBuild(): Promise<{ success: boolean; error?: string }> {
    console.log('[QA] Running build...');
    // 实际运行 npm run build
    return { success: true };
  }

  private async runLint(): Promise<{ success: boolean; error?: string }> {
    console.log('[QA] Running lint...');
    // 实际运行 npm run lint
    return { success: true };
  }

  private async runTests(): Promise<{ success: boolean; errors: string[] }> {
    console.log('[QA] Running tests...');
    // 实际运行 npm test
    return { success: true, errors: [] };
  }

  private async fixErrors(errors: QAError[]): Promise<void> {
    console.log(`[QA] Fixing ${errors.length} errors...`);
    // 调用 Claude API 修复错误
    for (const error of errors) {
      console.log(`[QA] Fixing: ${error.message}`);
    }
  }
}
```

---

## 步骤 6：定义多视角验证器

### 多视角验证器实现

```typescript
// src/validator.ts

export interface ValidationResult {
  passed: boolean;
  reviews: ReviewResult[];
}

export interface ReviewResult {
  type: 'architect' | 'security' | 'quality';
  passed: boolean;
  issues: string[];
  suggestions: string[];
}

export class MultiValidator {
  /**
   * 运行多视角验证
   */
  async validate(): Promise<ValidationResult> {
    console.log('[Validator] Starting multi-perspective validation...');

    // 并行执行三种验证
    const [architectResult, securityResult, qualityResult] = await Promise.all([
      this.validateArchitecture(),
      this.validateSecurity(),
      this.validateQuality()
    ]);

    const reviews = [architectResult, securityResult, qualityResult];
    const passed = reviews.every(r => r.passed);

    return { passed, reviews };
  }

  private async validateArchitecture(): Promise<ReviewResult> {
    console.log('[Validator] Checking architecture...');

    // 调用 Architect Agent
    const prompt = `
请审查以下代码的架构合理性:
1. 模块划分是否清晰
2. 依赖关系是否合理
3. 是否符合设计原则

请返回 JSON:
{
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}
`;

    // 简化处理
    return {
      type: 'architect',
      passed: true,
      issues: [],
      suggestions: []
    };
  }

  private async validateSecurity(): Promise<ReviewResult> {
    console.log('[Validator] Checking security...');

    // 调用 Security Reviewer Agent
    const prompt = `
请审查以下代码的安全漏洞:
1. SQL 注入
2. XSS 攻击
3. 认证授权问题
4. 敏感信息泄露

请返回 JSON:
{
  "issues": ["问题1"],
  "suggestions": ["建议1"]
}
`;

    return {
      type: 'security',
      passed: true,
      issues: [],
      suggestions: []
    };
  }

  private async validateQuality(): Promise<ReviewResult> {
    console.log('[Validator] Checking code quality...');

    // 调用 Code Reviewer Agent
    const prompt = `
请审查以下代码的质量:
1. 代码风格
2. 可维护性
3. 性能问题
4. 错误处理

请返回 JSON:
{
  "issues": ["问题1"],
  "suggestions": ["建议1"]
}
`;

    return {
      type: 'quality',
      passed: true,
      issues: [],
      suggestions: []
    };
  }
}
```

---

## 步骤 7：定义环境清理器

### 环境清理器实现

```typescript
// src/cleaner.ts

export interface CleanResult {
  deleted: string[];
  errors: string[];
}

export class EnvironmentCleaner {
  /**
   * 清理临时文件
   */
  async clean(stateFiles: string[]): Promise<CleanResult> {
    console.log('[Cleaner] Cleaning environment...');

    const deleted: string[] = [];
    const errors: string[] = [];

    for (const file of stateFiles) {
      try {
        console.log(`[Cleaner] Deleting: ${file}`);
        // 实际删除文件
        deleted.push(file);
      } catch (error) {
        errors.push(`Failed to delete ${file}: ${error}`);
      }
    }

    return { deleted, errors };
  }
}
```

---

## 步骤 8：实现管道协调器

### 管道协调器实现

```typescript
// src/pipeline.ts

import { RequirementExpander, Spec } from './expander.js';
import { TaskPlanner, Plan } from './planner.js';
import { CodeExecutor } from './executor.js';
import { QAValidator } from './qa.js';
import { MultiValidator } from './validator.js';
import { EnvironmentCleaner } from './cleaner.js';

export interface AutopilotConfig {
  maxQACycles: number;
  enableValidation: boolean;
  enableCleanup: boolean;
}

export interface AutopilotResult {
  success: boolean;
  spec?: Spec;
  plan?: Plan;
  qaPassed: boolean;
  validationPassed: boolean;
  totalCycles: number;
}

export class AutopilotPipeline {
  private expander: RequirementExpander;
  private planner: TaskPlanner;
  private executor: CodeExecutor;
  private qa: QAValidator;
  private validator: MultiValidator;
  private cleaner: EnvironmentCleaner;
  private config: AutopilotConfig;

  constructor(config: Partial<AutopilotConfig> = {}) {
    this.config = {
      maxQACycles: 5,
      enableValidation: true,
      enableCleanup: true,
      ...config
    };

    this.expander = new RequirementExpander();
    this.planner = new TaskPlanner();
    this.executor = new CodeExecutor();
    this.qa = new QAValidator({ maxCycles: this.config.maxQACycles });
    this.validator = new MultiValidator();
    this.cleaner = new EnvironmentCleaner();
  }

  /**
   * 执行 Autopilot
   */
  async run(idea: string, context?: string): Promise<AutopilotResult> {
    console.log(`\n========== Autopilot Started ==========`);
    console.log(`Idea: ${idea}\n`);

    try {
      // Phase 0: 需求扩展
      console.log('>>> Phase 0: Requirement Expansion');
      const spec = await this.expander.expand(idea, context);
      console.log(`Spec: ${spec.title}\n`);

      // Phase 1: 任务规划
      console.log('>>> Phase 1: Task Planning');
      const plan = await this.planner.createPlan(spec);
      console.log(`Plan: ${plan.steps.length} steps, ~${plan.estimatedTime}min\n`);

      // Phase 2: 代码执行
      console.log('>>> Phase 2: Code Execution');
      const executionResults = await this.executor.execute(plan);
      const execSuccess = executionResults.every(r => r.success);
      console.log(`Execution: ${execSuccess ? 'Success' : 'Failed'}\n`);

      if (!execSuccess) {
        return { success: false, qaPassed: false, validationPassed: false, totalCycles: 0 };
      }

      // Phase 3: QA 验证
      console.log('>>> Phase 3: QA Validation');
      const qaResult = await this.qa.validate();
      console.log(`QA: ${qaResult.passed ? 'Passed' : 'Failed'} (${qaResult.cycles} cycles)\n`);

      if (!qaResult.passed) {
        return { success: false, spec, plan, qaPassed: false, validationPassed: false, totalCycles: qaResult.cycles };
      }

      // Phase 4: 多视角验证
      let validationPassed = true;
      if (this.config.enableValidation) {
        console.log('>>> Phase 4: Multi-perspective Validation');
        const validationResult = await this.validator.validate();
        validationPassed = validationResult.passed;
        console.log(`Validation: ${validationPassed ? 'Passed' : 'Failed'}\n`);
      }

      // Phase 5: 环境清理
      if (this.config.enableCleanup) {
        console.log('>>> Phase 5: Cleanup');
        await this.cleaner.clean([
          '.autopilot/state.json',
          '.autopilot/spec.json',
          '.autopilot/plan.json'
        ]);
        console.log('Cleanup: Done\n');
      }

      console.log('========== Autopilot Completed ==========\n');

      return {
        success: validationPassed,
        spec,
        plan,
        qaPassed: qaResult.passed,
        validationPassed,
        totalCycles: qaResult.cycles
      };

    } catch (error) {
      console.error('Autopilot failed:', error);
      return { success: false, qaPassed: false, validationPassed: false, totalCycles: 0 };
    }
  }
}
```

---

## 步骤 9：创建 CLI 入口

### 入口文件

```typescript
// src/index.ts

import { AutopilotPipeline } from './pipeline.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: autopilot-framework "build a blog system"');
    console.log('       autopilot-framework --context "existing project" "add comments"');
    process.exit(1);
  }

  let idea = '';
  let context = '';

  if (args[0] === '--context') {
    context = args[1];
    idea = args.slice(2).join(' ');
  } else {
    idea = args.join(' ');
  }

  if (!idea) {
    console.error('Error: No idea specified');
    process.exit(1);
  }

  console.log(`\n========== Autopilot Framework ==========`);

  const pipeline = new AutopilotPipeline({
    maxQACycles: 5,
    enableValidation: true,
    enableCleanup: true
  });

  const result = await pipeline.run(idea, context);

  console.log('\n========== Results ==========');
  console.log(`Success: ${result.success}`);
  console.log(`QA Passed: ${result.qaPassed}`);
  console.log(`Validation Passed: ${result.validationPassed}`);
  console.log(`Total Cycles: ${result.totalCycles}`);

  process.exit(result.success ? 0 : 1);
}

main().catch(console.error);
```

---

## 步骤 10：运行测试

### 编译和运行

```bash
# 编译
npm run build

# 运行
npm start "构建一个博客系统"
```

### 输出示例

```
========== Autopilot Framework ==========

>>> Phase 0: Requirement Expansion
[Expander] Expanding: 构建一个博客系统
Spec: 博客系统

>>> Phase 1: Task Planning
[Planner] Creating implementation plan...
Plan: 5 steps, ~135min

>>> Phase 2: Code Execution
[Executor] Starting execution: 5 steps
[Executor] Executing step: step-1
[Executor] Executing step: step-2
...

>>> Phase 3: QA Validation
[QA] Cycle 1/5
[QA] Running build...
[QA] Running lint...
[QA] Running tests...
QA: Passed (1 cycles)

>>> Phase 4: Multi-perspective Validation
[Validator] Checking architecture...
[Validator] Checking security...
[Validator] Checking code quality...
Validation: Passed

>>> Phase 5: Cleanup
[Cleaner] Cleaning environment...
Cleanup: Done

========== Autopilot Completed ==========

========== Results ==========
Success: true
QA Passed: true
Validation Passed: true
Total Cycles: 1
```

---

## 完整代码结构

```
autopilot-framework/
├── src/
│   ├── index.ts          # CLI 入口
│   ├── expander.ts       # 需求扩展器
│   ├── planner.ts        # 任务规划器
│   ├── executor.ts       # 代码执行器
│   ├── qa.ts            # QA 验证器
│   ├── validator.ts     # 多视角验证器
│   ├── cleaner.ts       # 环境清理器
│   └── pipeline.ts      # 管道协调
├── package.json
└── tsconfig.json
```

---

## 进阶功能

### 1. 添加进度回调

```typescript
interface ProgressCallback {
  (phase: string, status: string, progress: number): void;
}

class AutopilotPipeline {
  onProgress?: ProgressCallback;

  async run(idea: string, context?: string): Promise<AutopilotResult> {
    this.onProgress?.('Phase 0', 'starting', 0);
    // ...
  }
}
```

### 2. 添加断点续传

```typescript
interface Checkpoint {
  phase: string;
  data: any;
  timestamp: number;
}

class AutopilotPipeline {
  async saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
    // 保存到文件
  }

  async loadCheckpoint(): Promise<Checkpoint | null> {
    // 从文件加载
  }
}
```

### 3. 添加成本控制

```typescript
interface CostTracker {
  tokens: number;
  cost: number;
}

class AutopilotPipeline {
  private trackCost(tokens: number): void {
    const cost = tokens * 0.001; // 假设价格
    console.log(`Cost: $${cost.toFixed(4)}`);
  }
}
```

---

## 总结

Autopilot 模式包含 6 个核心阶段：

| 阶段 | 组件 | 功能 |
|------|------|------|
| Phase 0 | RequirementExpander | 需求扩展 |
| Phase 1 | TaskPlanner | 任务规划 |
| Phase 2 | CodeExecutor | 代码执行 |
| Phase 3 | QAValidator | QA 验证 |
| Phase 4 | MultiValidator | 多视角验证 |
| Phase 5 | EnvironmentCleaner | 环境清理 |

核心思想：**全自动化 + 质量保障 + 多重验证**

---

## 参考

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [Autopilot Skill](https://github.com/Yeachan-Heo/oh-my-claudecode/tree/main/skills/autopilot)
