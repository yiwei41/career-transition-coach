# 产品公开部署指南

让其他人通过链接访问 Coach.ai，推荐使用 **Vercel** 或 **Netlify**（免费、简单）。

---

## 一、部署到 Vercel（推荐）

### 1. 准备工作

1. 注册 [Vercel](https://vercel.com)（可用 GitHub 登录）
2. 确保项目已推送到 GitHub

### 2. 导入项目

1. 登录 Vercel → 点击 **Add New** → **Project**
2. 选择你的 GitHub 仓库 `career-transition-coach-1`
3. 点击 **Import**

### 3. 配置环境变量

在 Vercel 项目设置中，添加以下环境变量：

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `GEMINI_API_KEY` | Gemini API 密钥 | ✅ |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 客户端 ID | ✅ |
| `SUPABASE_URL` | Supabase 项目 URL | 可选 |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 可选 |

### 4. 部署

点击 **Deploy**，等待构建完成。部署成功后你会得到类似 `https://xxx.vercel.app` 的链接。

---

## 二、配置 Google OAuth（重要）

部署后，**必须**在 Google Cloud Console 中添加你的线上域名，否则 Google 登录会失败。

1. 打开 [Google Cloud Console - 凭据](https://console.cloud.google.com/apis/credentials)
2. 找到你的 OAuth 2.0 客户端 ID，点击编辑
3. 在 **已授权的 JavaScript 来源** 中添加：
   - `https://你的项目.vercel.app`
   - 若使用自定义域名，也需添加
4. 在 **已授权的重定向 URI** 中添加：
   - `https://你的项目.vercel.app`
   - `https://你的项目.vercel.app/auth`
   - `https://你的项目.vercel.app/builder`
5. 保存

---

## 三、部署到 Netlify（备选）

1. 注册 [Netlify](https://netlify.com)
2. 点击 **Add new site** → **Import an existing project**
3. 连接 GitHub，选择仓库
4. 构建命令：`npm run build`，发布目录：`dist`（通常已自动识别）
5. 在 **Site settings** → **Environment variables** 中添加上述环境变量
6. 部署完成后，在 Google Console 中同样添加 Netlify 域名

---

## 四、安全提醒

- **API Key 暴露**：当前项目在前端直接调用 Gemini API，API Key 会出现在打包后的 JS 中。若担心泄露，可后续改为后端代理。
- **建议**：在 Gemini API 控制台设置用量提醒，避免超出预算。

---

## 五、分享链接

部署完成后，将你的链接（如 `https://xxx.vercel.app`）分享给他人即可。他人访问时会先进入登录页，可选择「Continue with Google」或「Continue without an account」。
