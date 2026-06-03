# 玩豆否 Wonderful Beads

玩豆否 Wonderful Beads 是一个在线拼豆图纸生成器，支持图片转拼豆图纸、自定义尺寸、MARD 色卡、色号统计、颜色清单、PNG/PDF/CSV/JSON 导出和手机端使用。

图片仅在浏览器本地处理，不会上传到服务器。

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址：

```text
http://localhost:5173/
```

## 构建命令

```bash
npm run build
```

构建输出目录：

```text
dist
```

## 部署到 Vercel

1. 将项目推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 新建项目并导入仓库。
3. Framework Preset 选择 `Vite`。
4. Build Command 填写：

```bash
npm run build
```

5. Output Directory 填写：

```text
dist
```

6. 点击 Deploy。

## 部署到 Netlify

1. 将项目推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Netlify 新建站点并导入仓库。
3. Build command 填写：

```bash
npm run build
```

4. Publish directory 填写：

```text
dist
```

5. 点击 Deploy site。

## 部署到 Hexo

玩豆否是一个纯前端静态应用，可以放进 Hexo 的 `source` 目录，让其他用户通过你的 Hexo 公开网址直接访问。

推荐访问路径：

```text
https://你的域名/wonderful-beads/
```

部署步骤：

1. 在本项目中构建静态文件：

```bash
npm run build
```

2. 在你的 Hexo 项目中创建目录：

```bash
mkdir -p source/wonderful-beads
```

3. 将本项目 `dist` 目录里的所有文件复制到 Hexo 项目的 `source/wonderful-beads`：

```bash
cp -r dist/* /你的hexo项目/source/wonderful-beads/
```

Windows PowerShell 示例：

```powershell
Copy-Item -Path .\dist\* -Destination "D:\你的hexo项目\source\wonderful-beads" -Recurse -Force
```

也可以直接使用项目内脚本自动构建并复制：

```powershell
.\scripts\deploy-hexo.ps1 -HexoRoot "D:\你的hexo项目"
```

4. 回到 Hexo 项目，重新生成并部署：

```bash
hexo clean
hexo generate
hexo deploy
```

说明：项目已使用相对资源路径和 Hash 路由，适合部署在 Hexo 子目录中。生成页地址会是：

```text
https://你的域名/wonderful-beads/#/create
```
