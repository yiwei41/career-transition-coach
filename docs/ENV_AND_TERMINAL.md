# 环境变量与终端操作说明

## 一、环境变量 (.env)

### 1. 文件位置与作用

- **`.env.local`**：本地环境变量（不要提交到 Git，已在 `.gitignore` 中）
- **`.env.example`**：示例模板，方便别人知道需要哪些变量

### 2. 当前需要的变量

在项目根目录的 `.env.local` 中应包含：

```bash
# Gemini API（用于 AI 功能）
GEMINI_API_KEY=你的_Gemini_密钥

# Google 登录（OAuth 2.0 客户端 ID，需带 VITE_ 前缀才能在浏览器里用）
VITE_GOOGLE_CLIENT_ID=你的_Google_客户端ID.apps.googleusercontent.com
```

- 获取 Gemini 密钥：<https://aistudio.google.com/apikey>
- 获取 Google OAuth 客户端 ID：<https://console.cloud.google.com/apis/credentials>  
  - 应用类型选「网页应用」
  - **重要**：在「已授权的 JavaScript 来源」中添加：
    - `http://localhost:3000`（默认端口）
    - `http://localhost:3001`（如果 3000 被占用，Vite 会自动用 3001）
    - `http://localhost:5173`（Vite 的另一个常见端口）
  - 在「已授权的重定向 URI」中添加：
    - `http://localhost:3000`
    - `http://localhost:3001`
    - `http://localhost:5173`

### 3. 修改 .env 后必须做的事

Vite 只在**启动开发服务器时**读取 `.env.local`，所以：

- **每次改过 `.env.local` 后，都要先停掉 dev 服务器，再重新执行 `npm run dev`**，新的环境变量才会生效。

---

## 二、终端操作

### 1. 重新开始（干净重启）

1. **停掉当前 dev 服务器**  
   在运行 `npm run dev` 的终端里按：`Ctrl + C`（Mac 上也可能是 `Ctrl + C`）。

2. **（可选）新开一个终端**  
   - Cursor：`` Ctrl+` `` 或菜单 **Terminal → New Terminal**。

3. **进入项目目录并启动**  
   ```bash
   cd "/Users/dingling/Github Clone/career-transition-coach-1"
   npm run dev
   ```

4. 看到类似 `Local: http://localhost:3000/` 或 `http://localhost:3001/` 后，在浏览器打开该地址即可。
   - 如果 3000 端口被占用，Vite 会自动尝试 3001、3002 等端口

### 2. 若终端“不见了”

- 在 Cursor 底部点 **Terminal** 标签，或按 `` Ctrl+` `` 打开/切换终端面板。
- 若终端被关掉，**Terminal → New Terminal** 再执行上面的 `cd` 和 `npm run dev` 即可。

### 3. 常用命令速查

| 操作           | 命令           |
|----------------|----------------|
| 安装依赖       | `npm install`  |
| 启动开发服务器 | `npm run dev`  |
| 构建生产版本   | `npm run build`|
| 本地预览构建   | `npm run preview` |

---

## 三、Google 登录仍不工作时的检查

### 快速检查清单

1. ✅ **确认 `.env.local` 存在且包含 `VITE_GOOGLE_CLIENT_ID`**
   ```bash
   cat .env.local | grep VITE_GOOGLE_CLIENT_ID
   ```

2. ✅ **确认已重启 dev 服务器**（改过 `.env.local` 后一定要重启）
   - 停掉：`Ctrl + C`
   - 重启：`npm run dev`

3. ✅ **确认 Google Cloud Console 配置**
   - 打开：<https://console.cloud.google.com/apis/credentials>
   - 找到你的 OAuth 2.0 客户端 ID
   - 检查「已授权的 JavaScript 来源」是否包含当前端口（如 `http://localhost:3001`）
   - 检查「已授权的重定向 URI」是否包含当前端口

4. ✅ **检查浏览器控制台**
   - 在浏览器打开你的应用（如 `http://localhost:3001`）
   - 按 **F12** 或 **Cmd+Option+I**（Mac）打开开发者工具
   - 切到 **Console** 标签
   - 点击「Continue with Google」或「Test: Trigger Google Login」
   - 查看是否有**红色报错**，常见错误：
     - `Error 400: redirect_uri_mismatch` → 需要在 Google Console 添加当前端口
     - `Error 403: access_denied` → OAuth 同意屏幕配置问题
     - `Missing VITE_GOOGLE_CLIENT_ID` → 环境变量未加载，需重启 dev 服务器

5. ✅ **验证环境变量是否加载**
   - 在浏览器 Console 输入：`console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)`
   - 应该能看到你的客户端 ID，而不是 `undefined`

### 当前状态（2026-01-26）

- ✅ Dev 服务器运行在：`http://localhost:3001/`
- ✅ `.env.local` 已配置：`VITE_GOOGLE_CLIENT_ID=143451847454-0d5re8ljgvv99vdidg60qvq9kh3evscl.apps.googleusercontent.com`
- ⚠️ **需要确认**：Google Cloud Console 中是否已添加 `http://localhost:3001` 作为授权来源
