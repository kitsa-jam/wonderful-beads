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
