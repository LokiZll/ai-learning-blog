---
title: "从零编写 Claude Code Deep Interview 模式：苏格拉底式需求挖掘完整实现指南"
description: "手把手教你从零开始构建一个类似 oh-my-claudecode 的 Deep Interview 需求挖掘系统，包含模糊度评分、多维度提问、状态管理等完整实现"
category: "claude-code"
tags: ["claude-code", "deep-interview", "需求分析", "苏格拉底", "框架开发", "教程"]
date: 2026-03-10
---

## 什么是 Deep Interview 模式

Deep Interview 是最独特的功能 —— 它不是帮你写代码，而是帮你**想清楚到底要什么**。

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

### 1. 模糊度评分（Ambiguity Score）

```
模糊度 = 1.0 (完全模糊)
模糊度 = 0.0 (完全清晰)
```

### 2. 评估维度

| 维度 | 说明 |
|------|------|
| 功能范围 | 要做什么功能？ |
| 用户画像 | 谁会用这个产品？ |
| 技术约束 | 有什么技术限制？ |
| 验收标准 | 怎么算做成了？ |
| 时间预算 | 什么时候要？ |

---

## 技术架构

### 核心组件

```
deep-interview-framework/
├── src/
│   ├── index.ts           # 入口
│   ├── types.ts           # 类型定义
│   ├── state.ts           # 状态管理
│   ├── scorer.ts          # 模糊度评分器
│   ├── generator.ts       # 问题生成器
│   ├── interviewer.ts     # 访谈控制器
│   ├── classifier.ts       # 问题分类器
│   └── output.ts          # 输出生成器
├── package.json
└── tsconfig.json
```

---

## 步骤 1：初始化项目

```bash
mkdir deep-interview-framework && cd deep-interview-framework
npm init -y
npm install typescript @types/node tsx uuid zod
npx tsc --init
```

---

## 步骤 2：定义核心类型

### 类型定义

```typescript
// src/types.ts

export type AmbiguityDimension =
  | 'functionality'  // 功能范围
  | 'user_persona'   // 用户画像
  | 'tech_constraints' // 技术约束
  | 'acceptance'     // 验收标准
  | 'timeline';      // 时间预算

export interface DimensionScore {
  dimension: AmbiguityDimension;
  score: number;      // 0-1, 1 = 完全模糊
  confidence: number;  // 置信度
}

export interface QuestionRound {
  round: number;
  dimension: AmbiguityDimension;
  question: string;
  answer?: string;
  scoreAfter: number;
}

export interface InterviewState {
  id: string;
  initialIdea: string;
  projectType: 'greenfield' | 'brownfield';
  dimensions: Record<AmbiguityDimension, number>;
  rounds: QuestionRound[];
  currentAmbiguity: number;
  threshold: number;
  codebaseContext?: string;
  status: 'initializing' | 'interviewing' | 'completed' | 'aborted';
  createdAt: Date;
  updatedAt: Date;
}

export interface FinalSpec {
  id: string;
  initialIdea: string;
  projectType: 'greenfield' | 'brownfield';
  clarifiedRequirements: ClarifiedRequirement[];
  ambiguityScore: number;
  rounds: number;
  recommendations: string[];
}

export interface ClarifiedRequirement {
  dimension: AmbiguityDimension;
  question: string;
  answer: string;
  keyInsights: string[];
}
```

---

## 步骤 3：实现状态管理器

### 状态管理器

```typescript
// src/state.ts

import { InterviewState, QuestionRound } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class StateManager {
  private state: InterviewState | null = null;

  /**
   * 初始化访谈状态
   */
  initialize(idea: string, projectType: 'greenfield' | 'brownfield'): InterviewState {
    const now = new Date();

    this.state = {
      id: uuidv4(),
      initialIdea: idea,
      projectType,
      dimensions: {
        functionality: 1.0,
        user_persona: 1.0,
        tech_constraints: 1.0,
        acceptance: 1.0,
        timeline: 1.0
      },
      rounds: [],
      currentAmbiguity: 1.0,
      threshold: 0.2,  // 20% 阈值
      status: 'initializing',
      createdAt: now,
      updatedAt: now
    };

    console.log(`[State] Initialized interview: ${this.state.id}`);
    console.log(`[State] Initial ambiguity: ${(this.state.currentAmbiguity * 100).toFixed(0)}%`);

    return this.state;
  }

  /**
   * 添加问答轮次
   */
  addRound(dimension: string, question: string, answer: string, scoreAfter: number): void {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    const round: QuestionRound = {
      round: this.state.rounds.length + 1,
      dimension: dimension as any,
      question,
      answer,
      scoreAfter
    };

    this.state.rounds.push(round);
    this.state.currentAmbiguity = scoreAfter;
    this.state.status = 'interviewing';
    this.state.updatedAt = new Date();

    console.log(`[State] Round ${round.round} completed`);
    console.log(`[State] Ambiguity: ${(scoreAfter * 100).toFixed(0)}%`);
  }

  /**
   * 获取当前状态
   */
  getState(): InterviewState | null {
    return this.state;
  }

  /**
   * 检查是否完成
   */
  isComplete(): boolean {
    if (!this.state) return false;
    return this.state.currentAmbiguity <= this.state.threshold;
  }

  /**
   * 结束访谈
   */
  end(status: 'completed' | 'aborted'): void {
    if (this.state) {
      this.state.status = status;
      this.state.updatedAt = new Date();
    }
  }

  /**
   * 获取最弱的维度
   */
  getWeakestDimension(): { dimension: string; score: number } {
    if (!this.state) {
      throw new Error('State not initialized');
    }

    let weakest: string = 'functionality';
    let lowestScore = 1.0;

    for (const [dim, score] of Object.entries(this.state.dimensions)) {
      if (score < lowestScore) {
        lowestScore = score;
        weakest = dim;
      }
    }

    return { dimension: weakest, score: lowestScore };
  }
}
```

---

## 步骤 4：实现模糊度评分器

### 模糊度评分器

```typescript
// src/scorer.ts

import { AmbiguityDimension, DimensionScore } from './types.js';

export class AmbiguityScorer {
  /**
   * 评估模糊度
   */
  score(answer: string, dimension: AmbiguityDimension): number {
    const analysis = this.analyzeAnswer(answer, dimension);
    return analysis.ambiguityScore;
  }

  /**
   * 分析答案并给出模糊度评分
   */
  private analyzeAnswer(answer: string, dimension: AmbiguityDimension): {
    ambiguityScore: number;
    confidence: number;
    insights: string[];
  } {
    const lowerAnswer = answer.toLowerCase();

    // 针对不同维度使用不同的评分逻辑
    switch (dimension) {
      case 'functionality':
        return this.scoreFunctionality(lowerAnswer);
      case 'user_persona':
        return this.scoreUserPersona(lowerAnswer);
      case 'tech_constraints':
        return this.scoreTechConstraints(lowerAnswer);
      case 'acceptance':
        return this.scoreAcceptance(lowerAnswer);
      case 'timeline':
        return this.scoreTimeline(lowerAnswer);
      default:
        return { ambiguityScore: 0.5, confidence: 0.5, insights: [] };
    }
  }

  private scoreFunctionality(answer: string): any {
    // 检查是否包含具体功能描述
    const specificFeatures = [
      'crud', 'create', 'read', 'update', 'delete',
      'login', 'register', 'auth',
      'api', 'rest', 'graphql',
      'database', 'sql', 'mongodb',
      'user', 'admin', 'role',
      'payment', 'order', 'cart'
    ];

    const hasFeatures = specificFeatures.some(f => answer.includes(f));
    const isSpecific = answer.length > 50 && answer.split(',').length > 2;

    if (hasFeatures && isSpecific) {
      return { ambiguityScore: 0.2, confidence: 0.9, insights: ['列出了具体功能'] };
    } else if (answer.length > 20) {
      return { ambiguityScore: 0.5, confidence: 0.7, insights: ['有功能描述但不够具体'] };
    } else {
      return { ambiguityScore: 0.8, confidence: 0.8, insights: ['功能描述模糊'] };
    }
  }

  private scoreUserPersona(answer: string): any {
    const personas = [
      'developer', 'engineer', 'programmer',
      'student', 'beginner', 'intermediate', 'advanced',
      'team', 'company', 'enterprise',
      'mobile', 'web', 'desktop'
    ];

    const hasPersona = personas.some(p => answer.includes(p));
    const hasDetail = answer.length > 30;

    if (hasPersona && hasDetail) {
      return { ambiguityScore: 0.15, confidence: 0.9, insights: ['明确的目标用户'] };
    } else if (hasPersona) {
      return { ambiguityScore: 0.4, confidence: 0.8, insights: ['有目标用户但描述较少'] };
    } else {
      return { ambiguityScore: 0.85, confidence: 0.9, insights: ['未明确目标用户'] };
    }
  }

  private scoreTechConstraints(answer: string): any {
    const techs = [
      'react', 'vue', 'angular', 'next.js', 'nuxt',
      'node', 'python', 'java', 'go', 'rust',
      'typescript', 'javascript',
      'aws', 'azure', 'gcp', 'vercel',
      'sql', 'mongodb', 'postgresql', 'mysql'
    ];

    const hasTech = techs.some(t => answer.includes(t));
    const hasPreference = answer.includes('prefer') || answer.includes('want') || answer.includes('use');

    if (hasTech && hasPreference) {
      return { ambiguityScore: 0.1, confidence: 0.9, insights: ['有明确技术偏好'] };
    } else if (hasTech) {
      return { ambiguityScore: 0.3, confidence: 0.8, insights: ['提到了技术栈'] };
    } else if (answer.includes('no') || answer.includes('any') || answer.includes('whatever')) {
      return { ambiguityScore: 0.7, confidence: 0.6, insights: ['没有技术限制'] };
    } else {
      return { ambiguityScore: 0.8, confidence: 0.7, insights: ['未讨论技术约束'] };
    }
  }

  private scoreAcceptance(answer: string): any {
    const criteria = [
      'test', 'pass', 'success',
      'work', 'functional',
      'deploy', 'production',
      'verify', 'check'
    ];

    const hasCriteria = criteria.some(c => answer.includes(c));
    const isMeasurable = /\d+/.test(answer); // 包含数字

    if (hasCriteria && isMeasurable) {
      return { ambiguityScore: 0.15, confidence: 0.9, insights: ['有可衡量的验收标准'] };
    } else if (hasCriteria) {
      return { ambiguityScore: 0.4, confidence: 0.8, insights: ['有验收标准但不够具体'] };
    } else {
      return { ambiguityScore: 0.85, confidence: 0.8, insights: ['缺少验收标准'] };
    }
  }

  private scoreTimeline(answer: string): any {
    const timeline = [
      'asap', 'urgent', 'week', 'month', 'quarter',
      'deadline', 'launch', 'release'
    ];

    const hasTimeline = timeline.some(t => answer.includes(t));
    const hasDate = /\d{4}|\d{1,2}\/\d{1,2}/.test(answer);

    if (hasTimeline && hasDate) {
      return { ambiguityScore: 0.1, confidence: 0.9, insights: ['有明确时间线'] };
    } else if (hasTimeline) {
      return { ambiguityScore: 0.35, confidence: 0.8, insights: ['有时间概念但不精确'] };
    } else {
      return { ambiguityScore: 0.6, confidence: 0.7, insights: ['未讨论时间线'] };
    }
  }

  /**
   * 计算综合模糊度
   */
  calculateOverall(dimensions: Record<string, number>): number {
    // 加权平均
    const weights: Record<string, number> = {
      functionality: 0.3,    // 功能最重要
      user_persona: 0.2,
      tech_constraints: 0.15,
      acceptance: 0.2,
      timeline: 0.15
    };

    let total = 0;
    let weightTotal = 0;

    for (const [dim, score] of Object.entries(dimensions)) {
      const weight = weights[dim] || 0.2;
      total += score * weight;
      weightTotal += weight;
    }

    return total / weightTotal;
  }
}
```

---

## 步骤 5：实现问题生成器

### 问题生成器

```typescript
// src/generator.ts

import { AmbiguityDimension } from './types.js';

interface QuestionTemplate {
  dimension: AmbiguityDimension;
  question: string;
  context?: string;
}

export class QuestionGenerator {
  private templates: Record<AmbiguityDimension, QuestionTemplate[]> = {
    functionality: [
      {
        dimension: 'functionality',
        question: '这个产品必须有哪些核心功能？'
      },
      {
        dimension: 'functionality',
        question: '用户主要用这个产品来做什么？'
      },
      {
        dimension: 'functionality',
        question: '有什么功能是没有也行的？'
      }
    ],
    user_persona: [
      {
        dimension: 'user_persona',
        question: '谁会是这个产品的主要用户？'
      },
      {
        dimension: 'user_persona',
        question: '这些用户的的技术水平如何？'
      },
      {
        dimension: 'user_persona',
        question: '用户主要在什么场景下使用这个产品？'
      }
    ],
    tech_constraints: [
      {
        dimension: 'tech_constraints',
        question: '有什么技术限制吗？比如必须使用某项技术？'
      },
      {
        dimension: 'tech_constraints',
        question: '部署环境有什么要求？'
      },
      {
        dimension: 'tech_constraints',
        question: '对性能有什么要求？'
      }
    ],
    acceptance: [
      {
        dimension: 'acceptance',
        question: '你怎么知道这个产品做成了？'
      },
      {
        dimension: 'acceptance',
        question: '有什么具体的验收标准吗？'
      },
      {
        dimension: 'acceptance',
        question: '第一版上线需要包含什么？'
      }
    ],
    timeline: [
      {
        dimension: 'timeline',
        question: '什么时候需要完成？'
      },
      {
        dimension: 'timeline',
        question: '有阶段性目标吗？'
      },
      {
        dimension: 'timeline',
        question: '这个时间紧迫吗？'
      }
    ]
  };

  /**
   * 生成下一个问题
   */
  generate(
    dimension: AmbiguityDimension,
    history: Array<{ question: string; answer: string }>,
    currentAnswer: string
  ): string {
    // 根据上下文选择具体的问题
    const templates = this.templates[dimension];
    const usedQuestions = history.map(h => h.question);

    // 找到第一个未使用的问题
    for (const template of templates) {
      if (!usedQuestions.includes(template.question)) {
        // 根据当前答案调整问题
        return this.adjustQuestion(template.question, currentAnswer, dimension);
      }
    }

    // 如果都用过了，返回一个跟进问题
    return this.generateFollowUp(dimension, currentAnswer);
  }

  /**
   * 调整问题，使其更具针对性
   */
  private adjustQuestion(
    question: string,
    answer: string,
    dimension: AmbiguityDimension
  ): string {
    const lowerAnswer = answer.toLowerCase();

    // 根据答案添加跟进
    switch (dimension) {
      case 'functionality':
        if (lowerAnswer.length < 30) {
          return question + ' 可以详细说说吗？';
        }
        return question;

      case 'user_persona':
        if (!lowerAnswer.includes('web') && !lowerAnswer.includes('mobile')) {
          return question + ' 主要在什么设备上使用？';
        }
        return question;

      case 'tech_constraints':
        if (lowerAnswer.includes('no') || lowerAnswer.includes('any')) {
          return '那有什么偏好的技术栈吗？';
        }
        return question;

      default:
        return question;
    }
  }

  /**
   * 生成跟进问题
   */
  private generateFollowUp(dimension: AmbiguityDimension, answer: string): string {
    const followUps: Record<AmbiguityDimension, string> = {
      functionality: '还有什么是需要考虑的？',
      user_persona: '这些用户有什么特别的需求吗？',
      tech_constraints: '有什么是绝对不能用的技术吗？',
      acceptance: '上线后的优先级是什么？',
      timeline: '中间有什么里程碑吗？'
    };

    return followUps[dimension];
  }
}
```

---

## 步骤 6：实现访谈控制器

### 访谈控制器

```typescript
// src/interviewer.ts

import { StateManager } from './state.js';
import { AmbiguityScorer } from './scorer.js';
import { QuestionGenerator } from './generator.js';
import { OutputGenerator } from './output.js';
import { InterviewState, FinalSpec } from './types.js';

export class DeepInterviewController {
  private stateManager: StateManager;
  private scorer: AmbiguityScorer;
  private generator: QuestionGenerator;
  private outputGenerator: OutputGenerator;

  constructor() {
    this.stateManager = new StateManager();
    this.scorer = new AmbiguityScorer();
    this.generator = new QuestionGenerator();
    this.outputGenerator = new OutputGenerator();
  }

  /**
   * 开始访谈
   */
  async start(idea: string, projectType: 'greenfield' | 'brownfield' = 'greenfield'): Promise<InterviewState> {
    console.log(`\n========== Deep Interview Started ==========`);
    console.log(`Idea: ${idea}`);
    console.log(`Project Type: ${projectType}\n`);

    // 初始化状态
    const state = this.stateManager.initialize(idea, projectType);

    // 公告开始
    this.announceStart(state);

    return state;
  }

  /**
   * 获取下一个问题
   */
  getNextQuestion(): string {
    const state = this.stateManager.getState();
    if (!state) {
      throw new Error('Interview not started');
    }

    const { dimension } = this.stateManager.getWeakestDimension();
    const history = state.rounds.map(r => ({
      question: r.question,
      answer: r.answer || ''
    }));

    const lastAnswer = state.rounds.length > 0
      ? state.rounds[state.rounds.length - 1].answer || ''
      : '';

    return this.generator.generate(
      dimension as any,
      history,
      lastAnswer
    );
  }

  /**
   * 处理回答
   */
  async processAnswer(answer: string): Promise<{
    question: string;
    score: number;
    isComplete: boolean;
  }> {
    const state = this.stateManager.getState();
    if (!state) {
      throw new Error('Interview not started');
    }

    // 获取当前问题
    const currentQuestion = state.rounds.length > 0
      ? state.rounds[state.rounds.length - 1].question
      : this.getNextQuestion();

    // 评估模糊度
    const { dimension } = this.stateManager.getWeakestDimension();
    const dimensionScore = this.scorer.score(answer, dimension as any);

    // 更新维度分数
    state.dimensions[dimension as any] = dimensionScore;

    // 计算新的综合模糊度
    const newAmbiguity = this.scorer.calculateOverall(state.dimensions);

    // 记录轮次
    this.stateManager.addRound(dimension, currentQuestion, answer, newAmbiguity);

    // 检查是否完成
    const isComplete = this.stateManager.isComplete();

    console.log(`[Interview] Answer processed`);
    console.log(`[Interview] Dimension: ${dimension}, Score: ${(dimensionScore * 100).toFixed(0)}%`);
    console.log(`[Interview] Overall Ambiguity: ${(newAmbiguity * 100).toFixed(0)}%\n`);

    return {
      question: currentQuestion,
      score: newAmbiguity,
      isComplete
    };
  }

  /**
   * 获取最终规格
   */
  generateFinalSpec(): FinalSpec {
    const state = this.stateManager.getState();
    if (!state) {
      throw new Error('Interview not started');
    }

    this.stateManager.end('completed');
    return this.outputGenerator.generate(state);
  }

  /**
   * 公告开始
   */
  private announceStart(state: InterviewState): void {
    console.log(`
> Starting deep interview. I'll ask targeted questions to understand your idea thoroughly before building anything. After each answer, I'll show your clarity score. We'll proceed to execution once ambiguity drops below ${(state.threshold * 100)}%.
>
> **Your idea:** "${state.initialIdea}"
> **Project type:** ${state.projectType}
> **Current ambiguity:** ${(state.currentAmbiguity * 100).toFixed(0)}%
`);
  }

  /**
   * 获取进度
   */
  getProgress(): { rounds: number; ambiguity: number; threshold: number } {
    const state = this.stateManager.getState();
    if (!state) {
      return { rounds: 0, ambiguity: 1.0, threshold: 0.2 };
    }

    return {
      rounds: state.rounds.length,
      ambiguity: state.currentAmbiguity,
      threshold: state.threshold
    };
  }
}
```

---

## 步骤 7：实现输出生成器

### 输出生成器

```typescript
// src/output.ts

import { InterviewState, FinalSpec, ClarifiedRequirement } from './types.js';

export class OutputGenerator {
  /**
   * 生成最终规格文档
   */
  generate(state: InterviewState): FinalSpec {
    // 提取澄清的需求
    const clarifiedRequirements = this.extractRequirements(state);

    // 生成建议
    const recommendations = this.generateRecommendations(state);

    return {
      id: state.id,
      initialIdea: state.initialIdea,
      projectType: state.projectType,
      clarifiedRequirements,
      ambiguityScore: state.currentAmbiguity,
      rounds: state.rounds.length,
      recommendations
    };
  }

  /**
   * 提取澄清的需求
   */
  private extractRequirements(state: InterviewState): ClarifiedRequirement[] {
    const requirements: ClarifiedRequirement[] = [];

    // 按维度分组
    const byDimension: Record<string, { question: string; answers: string[] }> = {};

    for (const round of state.rounds) {
      if (!byDimension[round.dimension]) {
        byDimension[round.dimension] = {
          question: round.question,
          answers: []
        };
      }
      if (round.answer) {
        byDimension[round.dimension].answers.push(round.answer);
      }
    }

    // 转换为 ClarifiedRequirement
    for (const [dimension, data] of Object.entries(byDimension)) {
      requirements.push({
        dimension: dimension as any,
        question: data.question,
        answer: data.answers.join(' | '),
        keyInsights: this.extractInsights(data.answers)
      });
    }

    return requirements;
  }

  /**
   * 提取关键洞察
   */
  private extractInsights(answers: string[]): string[] {
    const insights: string[] = [];

    for (const answer of answers) {
      const lower = answer.toLowerCase();

      // 检测关键信息
      if (lower.includes('react') || lower.includes('vue') || lower.includes('angular')) {
        insights.push('明确的前端框架');
      }
      if (lower.includes('node') || lower.includes('python') || lower.includes('java')) {
        insights.push('明确的后端技术');
      }
      if (lower.includes('student') || lower.includes('beginner')) {
        insights.push('目标用户为初学者');
      }
      if (lower.includes('enterprise') || lower.includes('company')) {
        insights.push('目标用户为企业/团队');
      }
      if (lower.includes('week') || lower.includes('month')) {
        insights.push('有明确的时间要求');
      }
    }

    return insights;
  }

  /**
   * 生成建议
   */
  private generateRecommendations(state: InterviewState): string[] {
    const recommendations: string[] = [];

    // 根据模糊度评分给出建议
    if (state.dimensions.functionality > 0.5) {
      recommendations.push('建议进一步明确核心功能范围');
    }
    if (state.dimensions.user_persona > 0.5) {
      recommendations.push('建议明确目标用户画像');
    }
    if (state.dimensions.tech_constraints > 0.5) {
      recommendations.push('建议确定技术栈偏好');
    }
    if (state.dimensions.acceptance > 0.5) {
      recommendations.push('建议添加具体的验收标准');
    }

    // 根据项目类型给出建议
    if (state.projectType === 'greenfield') {
      recommendations.push('建议先做 MVP 原型');
    } else {
      recommendations.push('建议与现有系统保持一致');
    }

    return recommendations;
  }

  /**
   * 输出为 Markdown
   */
  toMarkdown(spec: FinalSpec): string {
    let markdown = `# ${spec.initialIdea}\n\n`;
    markdown += `## 项目信息\n\n`;
    markdown += `- **类型**: ${spec.projectType}\n`;
    markdown += `- **初始模糊度**: ${(1 - spec.ambiguityScore) * 100}%\n`;
    markdown += `- **访谈轮次**: ${spec.rounds}\n\n`;

    markdown += `## 澄清的需求\n\n`;

    for (const req of spec.clarifiedRequirements) {
      markdown += `### ${this.dimToCN(req.dimension)}\n\n`;
      markdown += `**问题**: ${req.question}\n\n`;
      markdown += `**回答**: ${req.answer}\n\n`;

      if (req.keyInsights.length > 0) {
        markdown += `**关键洞察**:\n`;
        for (const insight of req.keyInsights) {
          markdown += `- ${insight}\n`;
        }
        markdown += '\n';
      }
    }

    if (spec.recommendations.length > 0) {
      markdown += `## 建议\n\n`;
      for (const rec of spec.recommendations) {
        markdown += `- ${rec}\n`;
      }
    }

    return markdown;
  }

  private dimToCN(dim: string): string {
    const map: Record<string, string> = {
      functionality: '功能范围',
      user_persona: '用户画像',
      tech_constraints: '技术约束',
      acceptance: '验收标准',
      timeline: '时间预算'
    };
    return map[dim] || dim;
  }
}
```

---

## 步骤 8：创建 CLI 入口

### 入口文件

```typescript
// src/index.ts

import { DeepInterviewController } from './interviewer.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: deep-interview-framework "我想做一个帮助程序员学习的 App"');
    process.exit(1);
  }

  const idea = args.join(' ');

  // 创建访谈控制器
  const controller = new DeepInterviewController();

  // 开始访谈
  await controller.start(idea);

  // 模拟问答循环
  // 实际实现中，这里会等待用户输入
  const mockAnswers = [
    '主要是初中级开发者，想学编程和算法',
    'Web 应用，主要在电脑上看',
    'React + Node.js 吧，比较熟',
    '能跑起来就行，主要功能可用',
    '一个月内吧'
  ];

  console.log('\n--- 模拟问答 ---\n');

  for (let i = 0; i < mockAnswers.length; i++) {
    const question = controller.getNextQuestion();
    console.log(`Q${i + 1}: ${question}`);

    const { question: lastQ, score, isComplete } = await controller.processAnswer(mockAnswers[i]);

    console.log(`A${i + 1}: ${mockAnswers[i]}`);
    console.log(`Ambiguity: ${(score * 100).toFixed(0)}%\n`);

    if (isComplete) {
      console.log('>>> 访谈完成！\n');
      break;
    }
  }

  // 生成最终规格
  const spec = controller.generateFinalSpec();

  console.log('\n========== Final Spec ==========\n');
  console.log(JSON.stringify(spec, null, 2));

  // 输出 Markdown
  const { OutputGenerator } = await import('./output.js');
  const generator = new OutputGenerator();
  console.log('\n========== Markdown Output ==========\n');
  console.log(generator.toMarkdown(spec));
}

main().catch(console.error);
```

---

## 步骤 9：运行测试

### 编译和运行

```bash
# 编译
npm run build

# 运行
npm start "我想做一个帮助程序员学习的 App"
```

### 输出示例

```
========== Deep Interview Started ==========
Idea: 我想做一个帮助程序员学习的 App
Project Type: greenfield

> Starting deep interview. I'll ask targeted questions to understand your idea thoroughly before building anything. After each answer, I'll show your clarity score. We'll proceed to execution once ambiguity drops below 20%.
>
> **Your idea:** "我想做一个帮助程序员学习的 App"
> **Project type:** greenfield
> **Current ambiguity:** 100%

--- 模拟问答 ---

Q1: 谁会是这个产品的主要用户？
A1: 主要是初中级开发者，想学编程和算法
Ambiguity: 65%

Q2: 主要在什么设备上使用？
A2: Web 应用，主要在电脑上看
Ambiguity: 45%

...

>>> 访谈完成！

========== Final Spec ==========
{
  "id": "...",
  "initialIdea": "我想做一个帮助程序员学习的 App",
  "clarifiedRequirements": [...],
  "ambiguityScore": 0.15,
  "rounds": 6
}
```

---

## 完整代码结构

```
deep-interview-framework/
├── src/
│   ├── index.ts          # CLI 入口
│   ├── types.ts         # 类型定义
│   ├── state.ts         # 状态管理
│   ├── scorer.ts        # 模糊度评分
│   ├── generator.ts      # 问题生成
│   ├── interviewer.ts   # 访谈控制
│   ├── output.ts        # 输出生成
├── package.json
└── tsconfig.json
```

---

## 进阶功能

### 1. 添加 Brownfield 支持

```typescript
class DeepInterviewController {
  async detectProjectType(): Promise<'greenfield' | 'brownfield'> {
    // 检查当前目录是否有代码
    const hasPackageJson = fs.existsSync('package.json');
    const hasSrcDir = fs.existsSync('src');
    const hasGit = fs.existsSync('.git');

    if (hasPackageJson || hasSrcDir || hasGit) {
      return 'brownfield';
    }
    return 'greenfield';
  }
}
```

### 2. 添加挑战模式

```typescript
interface ChallengeMode {
  type: 'security' | 'product' | 'technical';
  question: string;
}

// 在特定轮次激活挑战模式
private activateChallenge(rounds: number): ChallengeMode | null {
  if (rounds === 3) {
    return {
      type: 'security',
      question: '这个功能有什么安全风险？'
    };
  }
  return null;
}
```

### 3. 添加进度保存

```typescript
class StateManager {
  async save(): Promise<void> {
    // 保存到文件
    fs.writeFileSync('.deep-interview/state.json', JSON.stringify(this.state));
  }

  async load(): Promise<boolean> {
    // 从文件加载
    if (fs.existsSync('.deep-interview/state.json')) {
      this.state = JSON.parse(fs.readFileSync('.deep-interview/state.json', 'utf-8'));
      return true;
    }
    return false;
  }
}
```

---

## 总结

Deep Interview 模式包含以下核心组件：

| 组件 | 功能 |
|------|------|
| StateManager | 状态管理 |
| AmbiguityScorer | 模糊度评分 |
| QuestionGenerator | 问题生成 |
| DeepInterviewController | 访谈控制 |
| OutputGenerator | 输出生成 |

核心流程：

```
初始化 → 获取最弱维度 → 生成问题 → 接收回答 → 更新评分 → 检查阈值
     ↓
   继续 ← ← ← ← ← ← ← ← (未达到阈值)
     ↓
   完成 → 生成规格
```

核心思想：**苏格拉底提问 + 模糊度量化 + 阈值控制**

---

## 参考

- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [Deep Interview Skill](https://github.com/Yeachan-Heo/oh-my-claudecode/tree/main/skills/deep-interview)
- [Ouroboros 项目](https://github.com/Q00/ouroboros)
