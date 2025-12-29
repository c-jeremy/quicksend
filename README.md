
# my-worker

这是一个使用 GitHub Actions 自动部署的 Cloudflare Worker 项目。

## 🚀 快速开始

### 1. 获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **My Profile** → **API Tokens**
3. 点击 **Create Token**
4. 使用 "Edit Cloudflare Workers" 模板
5. 复制生成的 token

### 2. 设置 GitHub Repository

1. 将此项目上传到 GitHub
2. 进入仓库的 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加 secret：
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: 你的 API token

### 3. 部署

推送代码到 `main` 分支即可自动部署：

```bash
git add .
git commit -m "Deploy worker"
git push origin main
```

或在 GitHub Actions 页面手动触发部署。

## 💻 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 手动部署
npm run deploy
```

## 📝 项目结构

```
my-worker/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions 配置
├── src/
│   └── index.js            # Worker 入口文件
├── .gitignore
├── package.json
├── wrangler.toml           # Wrangler 配置
└── README.md
```

## 🔧 配置说明

### wrangler.toml

- `name`: Worker 名称
- `main`: 入口文件路径
- `compatibility_date`: 兼容性日期

### 多环境配置

在 `wrangler.toml` 中添加环境配置：

```toml
[env.production]
name = "my-worker-prod"

[env.staging]
name = "my-worker-staging"
```

修改 GitHub Actions workflow 以支持多环境部署。

## 📚 资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler 文档](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

## 📄 License

MIT
