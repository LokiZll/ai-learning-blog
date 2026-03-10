---
title: "Claude Code 实战：大规模代码迁移指南"
description: "深入探讨如何利用 Claude Code 完成大规模代码重构，包括 React 迁移到 Vue、JavaScript 迁移到 TypeScript 等典型场景"
category: "claude-code"
tags: ["claude-code", "重构", "代码迁移", "TypeScript", "React"]
date: 2026-03-10
series: "Claude Code 进阶系列"
seriesOrder: 2
---

## 何时需要大规模重构

代码迁移通常出现在以下场景：
- 技术栈升级（React 15 → React 18）
- 语言迁移（JavaScript → TypeScript）
- 框架迁移（Vue 2 → Vue 3）
- 架构重构（SPA → 微前端）

这类任务的特点是：
- 涉及文件多（几十到几百个）
- 逻辑复杂，容易遗漏
- 需要保持功能不变

---

## 重构前的准备工作

### 1. 创建重构分支

```bash
git checkout -b refactor/migrate-to-typescript
```

### 2. 编写 CLAUDE.md

```
# 重构任务
将项目从 JavaScript 迁移到 TypeScript

# 技术要求
- 目标：TypeScript strict 模式
- 使用类型推断，尽量减少显式类型
- 保持所有现有 API 不变

# 重要约束
- 先读懂每个文件再修改
- 不要一次性改太多，每次 5-10 个文件
- 每改完跑测试确保功能正常
```

### 3. 制定迁移计划

用 `/plan` 让 Claude 规划：

```
/plan
> 将 src/ 目录下的 JavaScript 文件迁移到 TypeScript
> 步骤：
> 1. 先配置 tsconfig.json
> 2. 按依赖顺序从小到大迁移（utils → components → pages）
> 3. 每迁移一类文件，运行测试
```

---

## 迁移策略

### 按依赖顺序迁移

不要一次性迁移所有文件，正确的顺序是：

```
1. 工具函数（utils）      → 无外部依赖
2. 类型定义（types）     → 无外部依赖
3. 基础组件（components） → 依赖 utils 和 types
4. 业务组件             → 依赖基础组件
5. 页面（pages）        → 依赖组件
6. 入口文件（index）     → 依赖 everything
```

### 小批量渐进迁移

每次只处理 5-10 个相关文件：

```
> 迁移 src/utils/ 目录下的文件到 TypeScript：
> - 分析每个文件的依赖关系
> - 从最简单的开始
> - 确保每个文件迁移后项目能正常运行
```

---

## 具体迁移示例：JS → TS

### 原始代码（JavaScript）

```javascript
// src/utils/format.js
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
}

export function formatCurrency(amount, currency = 'CNY') {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

### Claude 迁移后（TypeScript）

```typescript
// src/utils/format.ts
type DateFormat = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'YYYY年MM月DD日';
type CurrencyCode = 'CNY' | 'USD' | 'EUR';

export function formatDate(
  date: Date | string,
  format: DateFormat = 'YYYY-MM-DD'
): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'CNY'
): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

---

## 处理复杂依赖

### 组件迁移示例

原始 React Class 组件：

```jsx
// src/components/Button.jsx
import React from 'react';
import './Button.css';

export default class Button extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    type: 'primary',
    onClick: () => {},
  };

  handleClick = (e) => {
    this.props.onClick(e);
  };

  render() {
    const { type, children } = this.props;
    return (
      <button className={`btn btn-${type}`} onClick={this.handleClick}>
        {children}
      </button>
    );
  }
}
```

迁移到 TypeScript 函数组件：

```tsx
// src/components/Button.tsx
import React from 'react';
import './Button.css';

interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

export default function Button({
  type = 'primary',
  onClick,
  children,
}: ButtonProps) {
  return (
    <button className={`btn btn-${type}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

---

## 常见问题处理

### 1. 第三方库没有类型定义

```
> 提示：安装 @types/xxx 包，或者创建自定义类型声明
```

```bash
npm install -D @types/lodash
```

或创建 `src/types/custom.d.ts`：

```typescript
declare module 'some-lib' {
  export function doSomething(config: any): any;
}
```

### 2. 类型推断失败

让 Claude 添加显式类型：

```typescript
// 推断失败
const data = fetchData();

// 添加类型
interface User {
  id: number;
  name: string;
}
const data: User[] = fetchData();
```

### 3. 迁移过程中的循环依赖

```
> 提示：重构代码结构，消除循环依赖
```

常见方案：
- 提取公共类型到独立文件
- 使用依赖注入
- 重构为单向依赖

---

## 验证与测试

### 1. 增量验证

每迁移一类文件，运行测试：

```bash
npm test
```

### 2. 类型检查

```bash
npx tsc --noEmit
```

### 3. E2E 测试

```
> 运行项目的端到端测试，确保功能没有被破坏
```

---

## 重构完成后的检查清单

- [ ] 所有文件迁移完成
- [ ] `tsc --noEmit` 无错误
- [ ] 所有测试通过
- [ ] 手动测试核心功能正常
- [ ] 更新 CI/CD 配置
- [ ] 更新文档

---

## 总结

大规模代码迁移的关键：

1. **计划先行** - 用 `/plan` 制定详细方案
2. **小步快跑** - 每次只迁移一小批文件
3. **持续验证** - 每一步都运行测试
4. **保持沟通** - 不确定的地方及时询问 Claude

Claude Code 在这类任务中的优势：
- 自动处理大量重复性工作
- 保持代码风格一致
- 减少人为疏忽
- 提供迁移建议

但请记住：迁移过程中时刻保持警惕，Claude 的输出不一定 100% 正确，关键逻辑一定要手动验证！
