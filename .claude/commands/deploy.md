构建 AI 学习博客并部署到服务器。

执行以下步骤：

1. 在项目根目录运行 `npm run build`（包含 astro build + pagefind 索引生成）
2. 将 dist/ 目录打包：`tar -czf /tmp/ai-blog-dist.tar.gz -C dist .`
3. 上传到服务器：`scp -i ~/.ssh/slow_life_deploy_20260210_154824 /tmp/ai-blog-dist.tar.gz root@47.94.229.233:/tmp/`
4. SSH 到服务器解压文件：`ssh -i ~/.ssh/slow_life_deploy_20260210_154824 root@47.94.229.233 "cd /var/www/ai-learning-blog && rm -rf * && tar -xzf /tmp/ai-blog-dist.tar.gz && rm /tmp/ai-blog-dist.tar.gz"`
5. 重载 Nginx：`ssh -i ~/.ssh/slow_life_deploy_20260210_154824 root@47.94.229.233 "nginx -s reload"`
6. 验证部署：`curl -s -o /dev/null -w 'HTTP %{http_code}' http://47.94.229.233/`

每一步完成后报告结果，如果某步失败则停止并报告错误。

$ARGUMENTS
