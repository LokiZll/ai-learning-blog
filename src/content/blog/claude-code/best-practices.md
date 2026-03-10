---
title: "Claude Code 最佳实践"
description: "总结 Claude Code 日常开发中的高效用法、避坑指南和实战经验"
category: "claude-code"
tags: ["claude-code", "最佳实践", "工作流"]
date: 2026-03-10
series: "Claude Code 从入门到精通"
seriesOrder: 3
---

## CLAUDE.md：让 Claude 真正理解你的项目

CLAUDE.md 是影响 Claude 输出质量最关键的因素。写好它，等于给 Claude 配了一个项目老手做导师。

### 该写什么

```markdown
# 项目概述
这是一个基于 Next.js 14 的电商后台，使用 App Router。

# 技术栈
- Next.js 14 (App Router)
- TypeScript strict
- Tailwind CSS v4
- Prisma + PostgreSQL
- Vitest + Testing Library

# 代码规范
- 组件使用函数式 + Hooks，不用 class
- 状态管理用 Zustand，不用 Redux
- API 路由统一放在 src/app/api/ 下
- 所有数据库操作通过 src/lib/db.ts 中的封装方法

# 命名约定
- 组件文件：PascalCase（UserProfile.tsx）
- 工具函数：camelCase（formatDate.ts）
- 常量：UPPER_SNAKE_CASE
- CSS 类名：Tailwind 优先，自定义类用 kebab-case

# 重要目录
- src/components/ui/ — 基础 UI 组件（Button, Input, Modal）
- src/lib/ — 工具函数和配置
- src/hooks/ — 自定义 Hooks
```

### 不该写什么

- 不要写太泛的指令（"写好代码"）
- 不要把整个 README 复制进去
- 不要写过时的信息，定期更新
- 不要超过 200 行，太长 Claude 反而抓不住重点

### 分层策略

```
~/.claude/CLAUDE.md          → 你的个人偏好（所有项目生效）
./CLAUDE.md                  → 团队共享的项目规范
./CLAUDE.local.md            → 你个人的项目备注（不提交 Git）
```

个人全局 CLAUDE.md 示例：

```markdown
- 提交信息使用中文
- 代码注释使用英文
- 优先使用已有的工具函数，不要重复造轮子
- 修改代码前先读懂现有实现
```

---

## 提示词技巧：怎么跟 Claude 说话效率最高

### 给足上下文

```
❌ 修复这个 bug
✅ src/hooks/useAuth.ts 的 refreshToken 函数在 token 过期时
   没有正确重试，导致用户被踢出登录。请修复重试逻辑，
   参考 src/lib/api.ts 中的 retryWithBackoff 实现。
```

### 用 @ 引用文件

```
> @src/components/DataTable.tsx 和 @src/types/table.ts
  给 DataTable 组件添加列排序功能，排序状态通过 URL 参数持久化
```

Claude 会自动读取这些文件，比你手动粘贴代码高效得多。

### 分步拆解复杂任务

```
❌ 帮我搭建一个完整的用户系统

✅ 第一步：先帮我设计 User 的 Prisma schema，
   需要支持邮箱登录和 OAuth（Google、GitHub）

# Claude 完成后
✅ 第二步：基于这个 schema，创建注册和登录的 API 路由

# 继续
✅ 第三步：创建前端的登录表单组件
```

### 明确约束条件

```
> 重构 src/utils/date.ts
  要求：
  - 不引入新依赖，用原生 Intl API
  - 保持所有现有导出的函数签名不变
  - 添加对应的单元测试
```

### 让 Claude 先分析再动手

```
> 先分析 src/services/payment.ts 的现有实现，
  告诉我你理解的业务逻辑，然后再开始重构
```

这样可以在 Claude 动手之前纠正它的理解偏差。

---

## 模型选择策略

不是所有任务都需要最强的模型。合理选择能省钱又高效。

| 任务类型 | 推荐模型 | 理由 |
|----------|----------|------|
| 架构设计、大规模重构 | Opus | 需要深度理解和全局视野 |
| 日常功能开发 | Sonnet | 性价比最高 |
| 代码审查 | Sonnet | 够用且快 |
| 简单问答、格式转换 | Haiku | 最快最便宜 |
| 疑难 bug 排查 | Opus + `/think` | 需要深度推理 |
| 批量文件修改 | Sonnet | 速度和质量的平衡 |

实际操作：

```
# 日常开发用 Sonnet
/model sonnet

# 遇到难题切 Opus + 深度思考
/model opus
/think

# 简单查询切 Haiku 省钱
/model haiku
> package.json 里 react 的版本是多少？
```

---

## 计划模式：复杂任务的正确打开方式

对于涉及多文件、多步骤的任务，先让 Claude 规划再执行：

```
/plan
> 将项目的状态管理从 Context API 迁移到 Zustand
```

Claude 会：
1. 分析现有的 Context 使用情况
2. 列出需要修改的文件
3. 设计迁移方案
4. 等你确认后再执行

按 `Ctrl+G` 可以在执行过程中编辑计划。

### 什么时候用计划模式

- 重构涉及 5 个以上文件
- 不确定最佳实现方案
- 需要保持向后兼容
- 团队协作中的关键改动

### 什么时候不用

- 修个 typo
- 加一行配置
- 简单的函数实现

---

## 权限配置：安全与效率的平衡

### 推荐的权限规则

在 `.claude/settings.json` 中：

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(npm test:*)",
      "Bash(npm run lint:*)",
      "Bash(npm run build:*)",
      "Bash(npx tsc --noEmit:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git push --force:*)",
      "Bash(git reset --hard:*)",
      "Bash(npm publish:*)"
    ]
  }
}
```

原则：
- **读操作全部放行**：让 Claude 自由探索代码
- **安全的构建/测试命令放行**：减少确认弹窗
- **危险操作明确禁止**：防止误操作
- **写文件保持确认**：每次编辑都过一眼

---

## 自定义命令：把重复操作变成一键触发

### 必备命令推荐

部署命令：

```markdown
<!-- .claude/commands/deploy.md -->
构建并部署项目。
1. 运行测试确保没有回归
2. 构建项目
3. 部署到服务器
4. 验证部署结果
$ARGUMENTS
```

提交命令：

```markdown
<!-- .claude/commands/commit.md -->
帮我提交代码。
1. 运行 git status 和 git diff 查看变更
2. 根据变更内容生成中文提交信息
3. 提交信息要简洁，说明"为什么改"而不是"改了什么"
$ARGUMENTS
```

新功能脚手架：

```markdown
<!-- .claude/commands/new-feature.md -->
为新功能创建脚手架文件。
功能名称：$ARGUMENTS
需要创建：
1. 页面组件
2. API 路由
3. 类型定义
4. 基础测试
遵循项目现有的文件组织结构和命名规范。
```

---

## Hooks：自动化质量保障

### 保存后自动格式化

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $CLAUDE_FILE_PATH 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

### 完成后自动检查

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsc --noEmit 2>&1 | head -20"
          }
        ]
      }
    ]
  }
}
```

这样 Claude 每次完成任务后，TypeScript 类型检查会自动运行，有错误会立即反馈。

---

## 会话管理技巧

### 及时压缩上下文

长对话会导致 Claude 的注意力分散。当你感觉回答质量下降时：

```
/compact 只保留关于用户认证模块的上下文
```

### 任务切换时清空

```
# 从 bug 修复切换到新功能开发
/clear
> 现在开始做用户头像上传功能
```

### 善用会话恢复

```bash
# 下班前的工作，第二天继续
claude -c
```

### 监控成本

```
/cost
```

如果发现某个任务消耗过多 token，考虑：
- 切换到更便宜的模型
- 用 `/compact` 压缩上下文
- 拆分成更小的子任务

---

## 代码审查工作流

```
# 审查当前分支的所有变更
> 审查 git diff main...HEAD 的所有改动，关注：
  1. 逻辑错误和边界情况
  2. 安全漏洞（注入、XSS、敏感信息泄露）
  3. 性能问题（N+1 查询、不必要的重渲染）
  4. 代码风格和可维护性
  按严重程度排序输出
```

也可以用内置命令：

```
/review
```

---

## 常见陷阱与避坑

### 1. 不要盲目接受所有改动

Claude 生成的代码不一定 100% 正确。养成习惯：
- 用 `/diff` 查看每次改动
- 关键逻辑手动验证
- 改完跑测试

### 2. 不要在一个会话里做太多不相关的事

上下文污染会导致 Claude 混淆。不同任务用 `/clear` 隔开。

### 3. 不要给太模糊的指令

```
❌ 优化一下这个项目
✅ src/pages/Dashboard.tsx 首次加载需要 3 秒，
   帮我分析瓶颈并优化到 1 秒以内
```

### 4. 不要忽略 Claude 的提问

如果 Claude 反问你确认，说明它对需求有不确定性。花 10 秒回答能避免后面返工 10 分钟。

### 5. 不要跳过 CLAUDE.md

没有 CLAUDE.md 的项目，Claude 每次都要重新理解你的偏好。5 分钟的配置能节省几个小时的纠正。

---

## 日常工作流模板

```
# 1. 开始工作
claude
/status                    # 确认状态

# 2. 配置上下文
/model sonnet              # 日常用 Sonnet

# 3. 开发
> @src/... 实现 xxx 功能   # 用 @ 引用相关文件

# 4. 验证
> 运行测试确认没有回归

# 5. 提交
/project:commit            # 用自定义命令提交

# 6. 遇到难题
/model opus                # 切换到 Opus
/think                     # 开启深度思考

# 7. 收工
/cost                      # 看看今天花了多少
```
