---
title: "Claude Code 实战：用 AI 从零开发一个命令行工具"
description: "通过一个完整的命令行工具开发案例，展示如何利用 Claude Code 从需求分析到最终交付的全流程"
category: "claude-code"
tags: ["claude-code", "实战案例", "CLI", "项目开发"]
date: 2026-03-10
series: "Claude Code 进阶系列"
seriesOrder: 1
---

## 项目背景

很多开发者想要开发自己的命令行工具，但不知道从哪里开始。本文将展示如何利用 Claude Code 从零开发一个实用的 CLI 工具 —— 一个叫 `gitflow` 的 Git 工作流管理工具。

目标功能：
- 一键创建 feature、bugfix、release 分支
- 自动合并到主分支并清理
- 查看分支状态

---

## 第一步：项目规划

```
> 我想开发一个 Node.js CLI 工具，用于简化 Git 工作流。请帮我：
1. 先设计项目结构和功能
2. 创建基础的 package.json 和入口文件
3. 实现第一个命令：创建 feature 分支
```

Claude 的规划：

```
项目结构：
├── bin/
│   └── gitflow           # 入口文件
├── src/
│   ├── commands/         # 命令实现
│   │   ├── feature.js
│   │   ├── bugfix.js
│   │   └── release.js
│   └── index.js          # 主入口
├── package.json
└── README.md
```

---

## 第二步：初始化项目

Claude 自动创建了基础文件：

**package.json**：
```json
{
  "name": "gitflow-cli",
  "version": "1.0.0",
  "bin": {
    "gitflow": "./bin/gitflow"
  },
  "type": "module"
}
```

**bin/gitflow**：
```javascript
#!/usr/bin/env node
import { Command } from 'commander';
import feature from '../src/commands/feature.js';

const program = new Command();

program
  .name('gitflow')
  .description('Git 工作流管理工具')
  .version('1.0.0');

program
  .command('feature')
  .description('创建 feature 分支')
  .argument('<name>', '功能名称')
  .action(feature);

program.parse();
```

---

## 第三步：实现核心命令

继续让 Claude 实现 `feature.js`：

```
> 实现 src/commands/feature.js，功能是：
1. 检查当前目录是否是 Git 仓库
2. 确保在 develop 分支上
3. 创建 feature/xxx 分支
4. 输出成功信息
```

```javascript
import { execSync } from 'child_process';

export default function feature(name) {
  // 检查 Git 仓库
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch {
    console.error('错误：当前目录不是 Git 仓库');
    process.exit(1);
  }

  // 检查 develop 分支
  const currentBranch = execSync('git branch --show-current').toString().trim();
  if (currentBranch !== 'develop') {
    console.error('错误：请在 develop 分支上执行此命令');
    process.exit(1);
  }

  // 创建 feature 分支
  const branchName = `feature/${name}`;
  execSync(`git checkout -b ${branchName}`);

  console.log(`✅ 已创建并切换到 feature 分支: ${branchName}`);
}
```

---

## 第四步：添加更多命令

用同样的方式，Claude 继续实现了其他命令：

**bugfix.js** - 紧急修复分支
```javascript
import { execSync } from 'child_process';

export default function bugfix(name) {
  const branchName = `bugfix/${name}`;
  execSync(`git checkout -b ${branchName develop`);
  console.log(`✅ 已创建 bugfix 分支: ${branchName}`);
}
```

**release.js** - 发布分支
```javascript
export default function release(version) {
  const branchName = `release/${version}`;
  // 创建 release 分支并打标签
  execSync(`git checkout -b ${branchName}`);
  execSync(`git tag v${version}`);
  console.log(`✅ 已创建 release 分支并打标签: v${version}`);
}
```

---

## 第五步：完善工具

添加辅助功能：

```
> 添加以下功能：
1. status 命令 - 查看所有分支状态
2. finish 命令 - 完成 feature 并合并到 develop
3. 添加 --help 和颜色输出
```

### status 命令实现

```javascript
import { execSync } from 'child_process';

export default function status() {
  const branches = execSync('git branch --format="%(refname:short) %(upstream:short)"')
    .toString()
    .trim()
    .split('\n');

  console.log('\n📊 当前分支状态：\n');
  branches.forEach(branch => {
    console.log(`  ${branch || '(无上游)'}`);
  });
  console.log('');
}
```

### finish 命令实现

```javascript
export default function finish() {
  const currentBranch = execSync('git branch --show-current').toString().trim();

  if (!currentBranch.startsWith('feature/')) {
    console.error('错误：只能在 feature 分支上执行 finish');
    process.exit(1);
  }

  // 切换到 develop
  execSync('git checkout develop');
  execSync(`git merge ${currentBranch}`);
  execSync(`git branch -d ${currentBranch}`);

  console.log(`✅ 已合并并删除分支: ${currentBranch}`);
}
```

---

## 成果展示

最终项目结构：

```
gitflow-cli/
├── bin/
│   └── gitflow
├── src/
│   ├── commands/
│   │   ├── feature.js
│   │   ├── bugfix.js
│   │   ├── release.js
│   │   ├── status.js
│   │   └── finish.js
│   └── index.js
├── package.json
└── README.md
```

使用方式：

```bash
# 安装
npm install -g gitflow-cli

# 创建功能分支
gitflow feature login-page

# 查看状态
gitflow status

# 完成功能
gitflow finish
```

---

## 总结

这个案例展示了 Claude Code 辅助开发的典型流程：

1. **需求描述** - 用自然语言描述你想要的功能
2. **分步实现** - 每次让 Claude 实现一个小功能
3. **持续验证** - 及时运行测试，确保功能正确
4. **迭代完善** - 根据需要添加更多功能

关键技巧：
- 描述需求时尽量具体
- 大任务拆分成小步骤
- 及时检查 Claude 的输出
- 用 `/plan` 让 Claude 先规划再执行

这个 200 行左右的小工具，整个开发过程只用了不到 1 小时。如果你有更复杂的需求，Claude Code 同样可以胜任！
