---
title: 基于github pages部署个人博客网站的教程
date: 2026-06-01 18:53 +0800
categories: [前端]
tags: [前端, 教学, 个人建站]
---

# 基于github pages部署个人博客网站的教程

你还在为买不起域名和vps而担心吗,还在为备案而发愁吗?

别担心,github 为每一个个人开发者提供了一套完整的部署静态网站的工作流——**GitHub Pages**。通过它，你可以完全免费、免服务器、免备案地拥有一份属于自己的互联网自留地。

下面就手把手带你完成一个纯静态博客网站的搭建与部署。

---

## 准备工作

在开始之前，请确保你已经具备以下几点：

1. 一个 **GitHub 账号**（如果没有，请先去 [github.com](https://github.com) 注册）。
2. 本地安装了 **Git** 工具（用于将代码推送到 GitHub）。
3. 网页基础代码（本教程以最简单的 `index.html` 为例，你后续也可以换成 Hexo、Hugo 或 React/Vue 构建后的静态文件）。

---

## 第一步：创建专属仓库

GitHub Pages 的特殊之处在于，它会识别一个固定命名规则的仓库作为你的个人主页。

1. 登录 GitHub，点击右上角的 **「+」** 号，选择 **New repository**（新建仓库）。
2. **Repository name（仓库名称）** 必须严格遵守以下格式：
`你的用户名.github.io`
> ⚠️ **注意：** 如果你的 GitHub 用户名是 `zhangsan`，那么仓库名必须是 `zhangsan.github.io`。


3. 将仓库设为 **Public（公开）**（免费版 GitHub Pages 必须要求仓库公开）。
4. 其他选项（如 Add a README）可以不勾选，直接点击下方的 **Create repository**。

---

## 第二步：准备你的博客首页

在本地电脑上找一个合适的地方，创建一个文件夹（例如命名为 `my-blog`），并在里面新建一个名为 `index.html` 的文件。

用编辑器打开 `index.html`，写入以下简单的 HTML 代码：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的个人博客</title>
    <style>
        body { font-family: sans-serif; text-align: center; margin-top: 100px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>Hello World! 👋</h1>
    <p>欢迎来到我的 GitHub Pages 个人博客。这是我的第一篇文章！</p>
</body>
</html>

```

---

## 第三步：将代码推送到 GitHub

打开终端（Terminal）或 Git Bash，进入你刚刚创建的 `my-blog` 文件夹，依次执行以下命令，将代码提交并推送到 GitHub 仓库：

```bash
# 初始化 Git 仓库
git init

# 将文件添加到暂存区
git add index.html

# 提交到本地仓库
git commit -m "feat: init my blog website"

# 切换到主分支（GitHub 现在默认使用 main）
git branch -M main

# 关联远程仓库（请将下方链接替换为你自己仓库的实际地址）
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git

# 推送代码到 GitHub
git push -u origin main

```

---

## 第四步：开启 GitHub Pages 服务

通常情况下，对于 `你的用户名.github.io` 这种特殊形态的仓库，在你推送代码的那一刻，GitHub 就会自动开始构建并发布。

你可以通过以下步骤确认状态：

1. 刷新你的 GitHub 仓库页面，点击顶部的 **Settings（设置）**。
2. 在左侧边栏找到 **Code and automation** 模块，点击 **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 确保选择的是 `Deploy from a branch`。
4. **Branch** 应当选择 `main` 分支，目录选择 `/ (root)`，点击 Save。

稍等 1-2 分钟，你会在该页面顶部看到一行绿色的提示：

> Your site is live at `https://你的用户名.github.io/`

---

## 成果展示 🎉

现在，打开浏览器，访问 `https://你的用户名.github.io/`，你就能看到刚才编写的 "Hello World" 页面了！

这个网址是全球可访问的，意味着你已经成功将自己的网站发布到了公网上。

---

## 进阶玩法推荐

如果你觉得单写 HTML 页面太麻烦，GitHub Pages 完美支持以下进阶方案：

* **静态网站生成器：** 结合 **Hexo**、**Hugo** 或 **Jekyll**。你可以用 Markdown 愉快地写文章，一键生成静态网页并推送到该仓库。
* **现代前端框架：** 使用 React / Vue / Vite 搭建的高级网站，可以通过 GitHub Actions 配置自动化工作流，实现代码一推，自动打包部署。
* **自定义域名：** 虽然免费提供了 `.github.io` 后缀，但如果你以后购买了专属域名，也可以在 Pages 设置中直接绑定，同样不需要备案。

快去给你的博客添砖加瓦吧！