---
title: "Claude Code 完整学习路线"
description: "从入门到精通，涵盖 Claude Code 所有命令、使用场景和实战用例"
category: "claude-code"
tags: ["claude-code", "CLI", "命令参考", "学习路线"]
date: 2026-03-10
series: "Claude Code 从入门到精通"
seriesOrder: 2
---

## 学习路线概览

Claude Code 是 Anthropic 推出的 AI 编程 CLI 工具，让你在终端中与 Claude 协作开发。本文按学习阶段组织，从安装到高级用法，覆盖所有命令和功能。

```
安装入门 → 基础对话 → 文件操作 → 项目管理 → 高级功能 → 自动化集成
```

---

## 第一阶段：安装与启动

### 安装

```bash
npm install -g @anthropic-ai/claude-code
```

### 启动方式

```bash
# 交互模式：进入 REPL 对话
claude

# 带初始提问启动
claude "帮我分析这个项目的架构"

# 单次查询模式（非交互，输出后退出）
claude -p "解释什么是 React Server Components"

# JSON 输出（适合脚本集成）
claude -p "列出项目依赖" --output-format json

# 管道输入
cat src/utils.ts | claude -p "审查这段代码"
git diff | claude -p "总结这次改动"
```

### 认证管理

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `/login` | 登录或切换 Anthropic 账号 | 首次使用或切换账号 |
| `/logout` | 退出登录 | 切换到其他认证方式 |
| `/status` | 查看账号、模型、会话状态 | 确认当前登录状态和用量 |

```bash
# 也可以通过环境变量认证
export ANTHROPIC_API_KEY="sk-ant-..."
```

---

## 第二阶段：基础对话与导航

### 核心交互

在 REPL 中直接用自然语言对话：

```
> 帮我修复 login 页面的表单验证 bug
> 给 UserService 类添加单元测试
> 把这个函数从 JavaScript 重构为 TypeScript
```

### 键盘快捷键

| 快捷键 | 功能 | 使用场景 |
|--------|------|----------|
| `Enter` | 发送消息 | 提交指令 |
| `\` + `Enter` | 换行（多行输入） | 编写复杂的多行提示 |
| `Escape` | 取消当前生成 | Claude 回答方向不对时中断 |
| `Ctrl+C` | 取消生成或退出 | 中断操作 |
| `Ctrl+D` | 退出 Claude Code | 结束会话 |
| `Ctrl+L` | 清屏 | 终端太乱时清理 |
| `Tab` | 接受工具调用 | 批准文件编辑或命令执行 |
| `Shift+Tab` | 自动批准本轮所有操作 | 信任 Claude 的一系列操作时 |
| `↑` / `↓` | 浏览历史消息 | 重复或修改之前的指令 |
| `@` | 引用文件路径（自动补全） | 指定要操作的文件 |

### 文件引用

用 `@` 符号引用项目文件，Claude 会自动读取内容：

```
> @src/components/Header.tsx 这个组件有什么性能问题？
> @package.json 帮我升级所有过期的依赖
> @tsconfig.json 和 @eslint.config.js 这两个配置有冲突吗？
```

---

## 第三阶段：会话管理

### 会话控制命令

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `/clear` | 清空对话历史，重新开始 | 切换到完全不同的任务 |
| `/compact` | 压缩对话以减少上下文占用 | 对话太长快要超出上下文窗口 |
| `/cost` | 查看当前会话的 token 用量和费用 | 监控使用成本 |
| `/diff` | 查看待处理的文件变更 | 审查 Claude 做了哪些修改 |
| `/undo` | 撤销最近的变更 | Claude 改错了，需要回退 |

```
# /compact 可以带自定义压缩指令
/compact 只保留关于数据库迁移的上下文

# 查看费用
/cost
# 输出示例：Session cost: $0.42 | Tokens: 15,234 in / 8,921 out
```

### 会话恢复

```bash
# 继续上一次对话
claude -c

# 恢复指定会话
claude -r <session-id>

# 在 REPL 中恢复
/resume
```

用例：昨天做到一半的重构任务，今天继续。

---

## 第四阶段：模型与模式切换

### 模型切换

| 命令 | 说明 |
|------|------|
| `/model` | 交互式选择模型 |
| `/model opus` | 切换到 Opus（最强） |
| `/model sonnet` | 切换到 Sonnet（均衡） |
| `/model haiku` | 切换到 Haiku（最快最便宜） |

```bash
# CLI 启动时指定模型
claude -m opus
claude -p "复杂架构分析" --model opus
```

使用建议：
- **Opus**：复杂架构设计、大规模重构、疑难 bug
- **Sonnet**：日常编码、代码审查、功能开发
- **Haiku**：简单问答、格式转换、快速查询

### 模式切换

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `/plan` | 切换计划模式 | 让 Claude 先规划再执行，适合复杂任务 |
| `/fast` | 切换快速模式 | 同模型更快输出，适合简单任务 |
| `/think` | 切换深度思考模式 | 需要 Claude 仔细推理的复杂问题 |
| `/vim` | 切换 vim 键绑定 | vim 用户的操作习惯 |

```
# 计划模式：Claude 先出方案，你确认后再执行
/plan
> 重构整个认证系统，从 session 迁移到 JWT

# 也可以用快捷键切换计划模式
# Shift+Tab 按两次
```

---

## 第五阶段：权限管理

### 权限模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `default` | 每个危险操作都需确认 | 日常开发，安全第一 |
| `plan` | 可自由读取，写入需确认 | 探索性任务，先看再改 |
| `auto` | Claude 自主判断权限 | 信任度高的重复性任务 |

```bash
# 启动时指定权限模式
claude --permission-mode plan
claude --permission-mode auto
```

### 权限规则配置

```
# 查看和管理权限
/permissions
```

在 `.claude/settings.json` 中配置细粒度规则：

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(npm test:*)",
      "Bash(npm run lint:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git push --force:*)"
    ]
  }
}
```

用例：允许 Claude 自由运行测试和 lint，但禁止危险的删除和强制推送。

---

## 第六阶段：项目配置

### CLAUDE.md 记忆文件

Claude 会自动加载项目中的 CLAUDE.md 文件作为持久化指令：

| 文件位置 | 作用域 | 是否提交到 Git |
|----------|--------|---------------|
| `./CLAUDE.md` | 项目级，团队共享 | 是 |
| `./CLAUDE.local.md` | 项目级，仅本地 | 否（gitignore） |
| `.claude/CLAUDE.md` | 项目级 | 是 |
| `~/.claude/CLAUDE.md` | 全局，所有项目 | — |

```
# 初始化项目 CLAUDE.md
/init

# 编辑记忆文件
/memory
```

CLAUDE.md 示例：

```markdown
# 项目约定

- 使用 TypeScript strict 模式
- 组件使用函数式写法 + Hooks
- 样式使用 Tailwind CSS，不用 CSS Modules
- 测试使用 Vitest，文件放在 __tests__ 目录
- 提交信息使用中文
- API 路由前缀为 /api/v1
```

### 设置文件

| 命令 | 说明 |
|------|------|
| `/config` | 打开设置界面 |
| `/project` | 查看项目级设置 |

```bash
# CLI 管理配置
claude config list              # 列出所有设置
claude config get model         # 查看当前模型
claude config set model sonnet  # 设置默认模型
```

设置文件优先级（从高到低）：

1. 企业托管：`/etc/claude-code/managed-settings.json`
2. 项目共享：`.claude/settings.json`
3. 项目本地：`.claude/settings.local.json`
4. 用户全局：`~/.claude/settings.json`

---

## 第七阶段：自定义命令

在项目中创建可复用的命令模板：

```
.claude/commands/deploy.md      → /project:deploy
.claude/commands/test.md        → /project:test
.claude/commands/db/migrate.md  → /project:db:migrate
~/.claude/commands/review.md    → /user:review
```

### 命令文件格式

```markdown
<!-- .claude/commands/deploy.md -->
构建项目并部署到生产服务器。

步骤：
1. 运行 `npm run build`
2. 运行测试确保没有回归
3. 部署到服务器
4. 验证部署结果

$ARGUMENTS
```

`$ARGUMENTS` 会被替换为用户输入的参数：

```
/project:deploy 只部署前端
# $ARGUMENTS = "只部署前端"
```

### 实用命令示例

代码审查命令：

```markdown
<!-- .claude/commands/review.md -->
审查当前分支的所有变更。

1. 运行 `git diff main...HEAD` 查看所有改动
2. 检查代码质量、安全性、性能
3. 给出改进建议，按严重程度排序

$ARGUMENTS
```

生成变更日志：

```markdown
<!-- .claude/commands/changelog.md -->
根据最近的 git 提交生成变更日志。

1. 运行 `git log --oneline` 查看最近的提交
2. 按功能、修复、优化分类整理
3. 输出 Markdown 格式的变更日志

$ARGUMENTS
```

---

## 第八阶段：MCP 服务器集成

MCP（Model Context Protocol）让 Claude Code 连接外部工具和数据源。

### MCP 管理命令

```bash
# 添加 stdio 类型的 MCP 服务器
claude mcp add my-db-tool -- node /path/to/server.js

# 添加 SSE 类型的 MCP 服务器
claude mcp add --transport sse my-api https://api.example.com/mcp

# 指定作用域
claude mcp add -s user my-tool -- command    # 用户级（所有项目）
claude mcp add -s project my-tool -- command # 项目级（默认）

# 管理
claude mcp list                # 列出所有 MCP 服务器
claude mcp remove my-tool      # 移除
claude mcp reset               # 重置所有配置
```

```
# 在 REPL 中查看 MCP 状态
/mcp
```

### 常见 MCP 用例

- **数据库查询**：连接 PostgreSQL/MySQL，让 Claude 直接查数据
- **Jira/Linear**：读取和更新项目管理工具中的任务
- **Figma**：读取设计稿，生成对应的前端代码
- **Sentry**：查看错误日志，辅助排查 bug

---

## 第九阶段：Hooks 生命周期

Hooks 让你在 Claude 执行操作前后运行自定义脚本。

### Hook 类型

| Hook | 触发时机 | 用途 |
|------|----------|------|
| `PreToolUse` | 工具执行前 | 拦截危险操作、自动格式化 |
| `PostToolUse` | 工具执行后 | 自动运行 lint、记录日志 |
| `Notification` | Claude 发送通知时 | 桌面通知、Slack 通知 |
| `Stop` | Claude 停止生成时 | 自动运行测试 |
| `SubagentStop` | 子代理停止时 | 子任务完成后的清理 |

### 配置示例

在 `.claude/settings.json` 中：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $CLAUDE_FILE_PATH"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint"
          }
        ]
      }
    ]
  }
}
```

用例：每次 Claude 编辑文件后自动运行 Prettier 格式化，每次 Claude 完成任务后自动运行 lint 检查。

---

## 第十阶段：CI/CD 与自动化集成

### 非交互模式

```bash
# 单次查询，适合脚本
claude -p "检查代码中的安全漏洞" --output-format json

# 限制最大轮次
claude -p "修复所有 TypeScript 类型错误" --max-turns 10

# 自定义系统提示
claude -p "审查代码" --system-prompt "你是一个安全审计专家"

# 追加系统提示
claude -p "优化性能" --append-system-prompt "关注数据库查询优化"

# 限制可用工具
claude -p "分析代码" --allowedTools "Read,Glob,Grep"
claude -p "修复 bug" --disallowedTools "Bash"
```

### CI 集成示例

```yaml
# GitHub Actions 中使用
- name: AI Code Review
  run: |
    git diff origin/main...HEAD | claude -p "审查这些变更，输出发现的问题" \
      --output-format json \
      --max-turns 3
```

### 作为 MCP 服务器运行

```bash
# 让其他工具通过 MCP 协议调用 Claude Code
claude mcp serve
```

### 远程控制

```bash
# 启动远程控制模式，可从 claude.ai 或手机端操控
claude remote-control
```

---

## 第十一阶段：诊断与调试

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `/doctor` | 运行诊断检查 | 遇到问题时排查环境 |
| `/bug` | 报告 bug | 发现 Claude Code 的问题 |
| `/feedback` | 提交反馈 | 功能建议或体验反馈 |
| `/add-dir` | 添加额外工作目录 | 需要跨多个项目工作 |
| `/context` | 查看上下文来源 | 了解 Claude 加载了哪些文件 |
| `/statusline` | 配置状态栏 | 在终端底部显示会话信息 |
| `/terminal-setup` | 配置终端集成 | 设置 Shift+Enter 等快捷键 |

```bash
# 启动时添加额外目录
claude --add-dir /path/to/shared-lib

# 详细输出模式，排查问题
claude --verbose
```

---

## 环境变量速查

| 变量 | 用途 |
|------|------|
| `ANTHROPIC_API_KEY` | API 密钥 |
| `ANTHROPIC_AUTH_TOKEN` | 替代认证 token |
| `ANTHROPIC_BASE_URL` | 自定义 API 端点 |
| `ANTHROPIC_MODEL` | 覆盖默认模型 |
| `CLAUDE_CODE_USE_BEDROCK` | 使用 AWS Bedrock |
| `CLAUDE_CODE_USE_VERTEX` | 使用 Google Vertex AI |
| `DISABLE_PROMPT_CACHING` | 禁用提示缓存 |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | 最大输出 token 数 |

---

## IDE 集成

Claude Code 支持 VS Code 和 JetBrains IDE：

| 快捷键 | 功能 |
|--------|------|
| `Cmd+Esc` / `Ctrl+Esc` | 快速启动 Claude Code |
| `Cmd+Option+K` / `Alt+Ctrl+K` | 插入文件引用 |

在 IDE 中可以直接选中代码，右键让 Claude 解释、重构或修复。

---

## 学习建议

1. **第一周**：安装、基础对话、文件引用、键盘快捷键
2. **第二周**：会话管理、模型切换、CLAUDE.md 配置
3. **第三周**：自定义命令、权限规则、计划模式
4. **第四周**：MCP 集成、Hooks、CI/CD 自动化

> 最有效的学习方式：在真实项目中使用，从简单任务开始，逐步探索高级功能。
