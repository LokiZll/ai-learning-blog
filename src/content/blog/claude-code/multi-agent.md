---
title: "Claude Code 多 Agent 协作：打造高效开发团队"
description: "探索如何利用多个 Claude Code 实例同时工作，实现并行开发、代码审查、测试覆盖等复杂任务的协同处理"
category: "claude-code"
tags: ["claude-code", "multi-agent", "协作", "并行开发"]
date: 2026-03-10
series: "Claude Code 进阶系列"
seriesOrder: 5
---

## 什么是多 Agent 协作

多 Agent 协作是指同时运行多个 Claude Code 实例，每个 Agent 负责不同的任务或模块，类似于一个开发团队的多人协作。

典型场景：
- 前后端并行开发
- 代码审查 + 功能开发同时进行
- 多个模块同时实现
- 测试覆盖 + 文档编写并行

---

## 本地多实例协作

### 启动多个会话

在不同的终端窗口启动多个 Claude Code：

```bash
# 终端 1：前端开发
claude
> 开发用户界面模块

# 终端 2：后端开发
claude
> 开发 API 接口

# 终端 3：代码审查
claude
> 审查刚才开发的代码
```

### 工作目录隔离

每个终端可以在不同目录：

```bash
# 前端目录
cd ~/projects/frontend
claude

# 后端目录
cd ~/projects/backend
claude

# 公共组件目录
cd ~/projects/shared-components
claude
```

---

## 场景一：前后端并行开发

### 场景描述

你需要同时开发一个功能，包括：
- 前端：用户列表页面 + 添加用户表单
- 后端：用户 CRUD API
- 数据库：用户表设计

### 协作策略

```
┌─────────────────┐     ┌─────────────────┐
│   Agent 1      │     │   Agent 2      │
│   (前端)        │     │   (后端)        │
│                 │     │                │
│ - UI 组件      │     │ - API 路由     │
│ - 页面逻辑      │     │ - 业务逻辑     │
│ - 状态管理      │     │ - 数据验证     │
└─────────────────┘     └─────────────────┘
          │                     │
          └──────────┬──────────┘
                     │
              ┌──────▼──────┐
              │   协调者     │
              │  (你)       │
              └─────────────┘
```

### 操作步骤

**Agent 1（前端子任务）：**

```
> 开发用户列表页面，要求：
> 1. 显示用户表格，包含姓名、邮箱、角色
> 2. 顶部有"添加用户"按钮
> 3. 点击按钮弹出表单弹窗
> 4. 表单包含：姓名、邮箱、角色（选择器）
> 5. 使用项目现有的 UI 组件风格
> API 调用使用 /api/users 的 GET 和 POST
```

**Agent 2（后端子任务）：**

```
> 开发用户 API 接口：
> 1. GET /api/users - 返回用户列表
> 2. POST /api/users - 创建新用户
> 3. 用户模型：id, name, email, role, createdAt
> 4. 添加基本的输入验证
> 使用 Prisma + SQLite
```

### 协调技巧

1. **先定义接口**：让两个 Agent 都遵循同一个 API 约定
2. **定期同步**：每隔一段时间让两个 Agent 互相检查接口是否匹配
3. **处理冲突**：如果修改了同一文件，手动合并

```
> Agent 1: 帮我检查 Agent 2 写的 API 接口定义
> Agent 2: 帮我检查 Agent 1 的前端组件是否正确调用了 API
```

---

## 场景二：开发 + 审查并行

### 场景描述

一个 Agent 负责开发功能，另一个 Agent 负责实时审查。

### 设置审查 Agent

```
> 你是一个代码审查专家。请：
> 1. 监听 src/ 目录的变化
> 2. 每次我让你审查时，检查最近的代码变更
> 3. 关注：逻辑错误、安全问题、性能问题、代码风格
> 4. 按严重程度排序输出问题
> 5. 如果没有问题，输出"✅ 代码审查通过"
```

### 开发 Agent

```
> 开发用户认证模块：
> 1. 实现登录/登出功能
> 2. 使用 JWT token
> 3. 实现 token 刷新机制
> 4. 完成后运行测试
```

### 审查流程

开发 Agent 完成后：

```
> 审查刚才开发的所有代码变更
```

---

## 场景三：功能 + 测试并行

### 场景描述

同时编写功能代码和测试用例。

### 测试 Agent

```
> 你是一个测试工程师。请：
> 1. 阅读 src/utils/format.ts 的现有代码
> 2. 为所有导出函数编写 Vitest 测试
> 3. 覆盖正常情况和边界情况
> 4. 测试文件放在 src/utils/__tests__/
```

### 功能 Agent

```
> 扩展 src/utils/format.ts：
> 1. 添加 formatCurrency 函数
> 2. 添加 formatRelativeTime 函数（如"3分钟前"）
> 3. 添加类型定义
> 4. 保持与现有代码风格一致
```

---

## 场景四：多模块同时开发

### 场景描述

一个大型功能涉及多个独立模块。

### 启动多个 Agent

```bash
# 为每个模块启动一个 Claude Code
claude -p "你是用户模块开发者，负责 src/modules/user/" --continue
claude -p "你是订单模块开发者，负责 src/modules/order/" --continue
claude -p "你是支付模块开发者，负责 src/modules/payment/" --continue
```

### 模块 Agent 配置

每个 Agent 的 CLAUDE.md：

```markdown
# 用户模块
- 路径：src/modules/user/
- 依赖：src/lib/db.ts
- API 风格：RESTful
- 遵循项目现有模式
```

### 合并策略

模块完成后，你来整合：

```
> 检查这三个模块的导出是否一致
> 帮我把它们整合到主应用中
```

---

## Git 分支协作

### 分支策略

```
main
├── feature/user-api      (Agent 1)
├── feature/user-ui       (Agent 2)
└── feature/payment       (Agent 3)
```

### Agent 1

```bash
git checkout -b feature/user-api
claude
> 开发用户 API...
git commit -m "feat: 添加用户 API"
```

### Agent 2

```bash
git checkout -b feature/user-ui
claude
> 开发用户界面...
git commit -m "feat: 添加用户界面"
```

### 合并

```bash
git checkout main
git merge feature/user-api
git merge feature/user-ui
```

---

## 最佳实践

### 1. 明确的职责划分

每个 Agent 应该有清晰的任务范围：

```
Agent A: 只负责 src/api/ 的后端代码
Agent B: 只负责 src/components/ 的前端代码
Agent C: 负责测试和文档
```

### 2. 使用 CLAUDE.md 约束

为每个 Agent 创建专门的配置：

```markdown
# 模块：用户系统
只在这个目录下工作：src/modules/user/
不要修改其他模块的代码
API 响应格式：{ code, data, message }
```

### 3. 定期同步

让 Agent 之间互相检查接口：

```
> Agent 1: 检查 Agent 2 的 API 是否与你期望的格式一致
```

### 4. 保留协调者角色

人类（你）作为协调者：
- 分配任务
- 解决冲突
- 最终整合
- 质量把关

---

## 常见问题

### 问题 1：修改冲突

**症状：** 两个 Agent 修改了同一个文件

**解决：**
- 明确禁止同时修改同一文件
- 发现冲突后手动合并

### 问题 2：接口不一致

**症状：** 前端和后端的 API 格式不匹配

**解决：**
- 先定义接口文档
- 开发前让两个 Agent 确认
- 开发后互相验证

### 问题 3：重复代码

**症状：** 两个 Agent 实现了相同的功能

**解决：**
- 创建共享模块
- 明确每个 Agent 的职责边界

---

## 进阶：自动化协调

可以创建一个"项目经理"Agent：

```
> 你是一个项目经理 Agent。管理三个开发 Agent：
> - Agent 1: 用户模块
> - Agent 2: 订单模块
> - Agent 3: 测试
>
> 你的职责：
> 1. 分配任务
> 2. 跟踪进度
> 3. 协调接口
> 4. 整合代码
```

---

## 总结

多 Agent 协作的关键：

1. **明确分工** - 每个 Agent 有清晰的职责
2. **定义接口** - 减少联调成本
3. **定期同步** - 及时发现不一致
4. **人类协调** - 最终整合和质量把关

适用场景：
- 大型项目多模块并行开发
- 功能开发 + 测试同时进行
- 代码审查实时进行

不适用：
- 小项目（开销太大）
- 高度耦合的代码
- 需要频繁沟通的任务

合理使用多 Agent 协作，可以显著提升开发效率！
