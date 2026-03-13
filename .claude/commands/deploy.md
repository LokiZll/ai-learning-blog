构建并部署 AI 学习博客到服务器。

**优化后的快速部署流程：**

```bash
# 1. 本地构建
npm run build

# 2. 打包并上传（排除 node_modules，减少传输量）
cd dist && tar --exclude='*.mjs' -czf /tmp/ai-blog.tar.gz . && cd ..
scp -i ~/.ssh/slow_life_deploy_20260210_154824 /tmp/ai-blog.tar.gz root@47.94.229.233:/tmp/

# 3. 服务器部署（保留 node_modules，只更新静态文件）
ssh -i ~/.ssh/slow_life_deploy_20260210_154824 root@47.94.229.233 "
  cd /var/www/ai-learning-blog
  rm -rf client server entry.mjs
  tar -xzf /tmp/ai-blog.tar.gz -C .
  rm /tmp/ai-blog.tar.gz
  pkill -f 'entry.mjs' 2>/dev/null || true
  cd /var/www/ai-learning-blog && node server/entry.mjs &
  sleep 1
  nginx -s reload
"

# 4. 验证
curl -s -o /dev/null -w 'HTTP %{http_code}' http://47.94.229.233/
```

**核心优化：**
- 排除 server 目录（体积大，由 node_modules 中的代码重新生成）
- 保留 node_modules，避免每次 npm install
- 添加 nginx reload 确保代理生效
- 单条 SSH 命令完成部署，减少连接次数

---

## 快速部署命令（直接复制使用）

```bash
npm run build && cd dist && tar --exclude='*.mjs' -czf /tmp/ai-blog.tar.gz . && cd .. && scp -i ~/.ssh/slow_life_deploy_20260210_154824 /tmp/ai-blog.tar.gz root@47.94.229.233:/tmp/ && ssh -i ~/.ssh/slow_life_deploy_20260210_154824 root@47.94.229.233 "cd /var/www/ai-learning-blog && rm -rf client server entry.mjs && tar -xzf /tmp/ai-blog.tar.gz -C . && rm /tmp/ai-blog.tar.gz && pkill -f 'entry.mjs' 2>/dev/null || true && node server/entry.mjs &" && sleep 2 && curl -s -o /dev/null -w 'HTTP %{http_code}' http://47.94.229.233/
```

---

## 常见问题

### 首次部署或依赖更新
需要完整安装依赖：
```bash
ssh root@47.94.229.233 "cd /var/www/ai-learning-blog && npm install"
```

### 502 错误
```bash
ssh root@47.94.229.233 "nginx -s reload && pkill -f entry.mjs; cd /var/www/ai-learning-blog && node server/entry.mjs &"
```

$ARGUMENTS
