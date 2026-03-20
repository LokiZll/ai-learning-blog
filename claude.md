# AI 学习博客 - 项目格调

## 网站 slogan

**多彩知识，绽放智慧**

## 网站定位

duoblog.com 是一个专注于 AI 学习的知识平台，致力于为中文用户提供高质量的 AI 技术内容。

## 内容方向

- AI 基础知识与概念
- 提示工程实战技巧
- AI 工具使用指南
- 行业实战案例分析
- Claude Code 等开发工具深度使用

## 文风风格

- 专业但不晦涩
- 实用导向，案例驱动
- 深入浅出，易于理解
- 保持技术准确性的同时注重可读性

## 设计风格

- 现代简洁，响应式设计
- 深色模式支持
- 清晰的层次结构
- 舒适的阅读体验

## 技术要点

### Pagefind 搜索集成

**关键原则：Pagefind 需要静态 HTML 才能索引内容**

1. **SSR 页面无法被索引** - 如果页面使用 `prerender = false`（SSR 模式），不会生成静态 HTML，pagefind 无法索引该内容。必须改为 `prerender = true` 并使用 `getStaticPaths()` 预渲染。

2. **Pagefind URL 来源** - pagefind 从文件路径提取 URL。例如 `dist/client/blog/...` 会被提取成 `/client/blog/...`。实际 URL 不需要 `/client` 前缀时，需要在搜索结果返回时修正：
   ```typescript
   result.url = result.url.replace(/^\/client/, '');
   ```

3. **部署目录结构** - nginx 的 root 是 `/var/www/ai-learning-blog/client`，但 pagefind 构建输出在 `dist/pagefind/`，部署时需要移动到正确位置：
   ```bash
   mv pagefind client/
   ```

4. **构建后验证** - pagefind 构建完成后会显示索引的页面数量（`Indexed X pages`），如果数量异常少，说明大部分内容未被索引。

### 部署清单

- 清理旧文件：`rm -rf client server entry.mjs pagefind`
- 解压到正确位置：`tar -xzf /tmp/ai-blog.tar.gz -C .`
- 移动 pagefind：`mv pagefind client/`
- 重启服务：`pkill -f 'entry.mjs' && nohup node server/entry.mjs &`

### SSR vs 预渲染决策

| 场景 | 模式 | 说明 |
|------|------|------|
| 文章详情页 | 预渲染 (`prerender = true`) | 需要被 pagefind 索引 |
| 评论、点赞等动态功能 | SSR (`prerender = false`) | 需要服务端数据 |
| 分类、标签页 | 预渲染 | 需要被索引 |
| 用户个人页面 | SSR | 动态内容 |
