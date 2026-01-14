# 01. 版本控制 (Git) - 实战演练

> "Talk is cheap. Show me the code." —— Linus Torvalds (Git 之父)

光记命令是记不住的。今天我们来模拟一个真实的场景：**从零开始搭建你的个人博客**。

## 🛠️ 准备工作：运行环境

1.  **安装 Git**: 请前往 [git-scm.com](https://git-scm.com/) 下载并安装。
2.  **Windows 用户**: 强烈建议使用安装时附带的 **Git bash** 终端，而不是默认的 CMD。

---

---

## 🎭 场景一：项目启动 (The Beginning)

你决定开始写博客。首先，我们需要在本地建立一个“基地”。

### 1. 初始化基地

打开终端，我们创建一个文件夹并告诉 Git：“这里归你管了”。

```bash
# 1. 创建并进入目录
mkdir my-blog
cd my-blog

# 2. 初始化 Git 仓库
git init
# 输出: Initialized empty Git repository in .../my-blog/.git/
```

### 2. 写下第一行代码

创建一个 `README.md`，写上你的博客标题。

```bash
echo "# 我的技术博客" > README.md
```

### 3. 第一次“存档” (Commit)

Git 的工作流是：**修改 -> 暂存 (Add) -> 提交 (Commit)**。想象你在玩游戏，Commit 就是手动存档。

```bash
# 查看状态：Git 会告诉你有一个 "Untracked file: README.md"
git status

# 暂存：把文件放入“待提交区”
git add README.md

# 提交：真正存入历史记录
git commit -m "feat: init project with readme"
```

---

## 🎭 场景二：开发新功能 (Feature Branch)

博客需要一个“关于我”的页面。**切记：永远不要在主分支 (main/master) 直接改代码**，我们要养成开分支的好习惯。

### 1. 创建新分支

想象这是一个平行宇宙，你在里面胡搞乱搞也不会影响主世界。

```bash
# 创建并切换到 feature/about 分支
git checkout -b feature/about
# 或者比较新的写法：git switch -c feature/about
```

> **注**: 如果你的默认主分支叫 `master`，建议运行 `git branch -M main` 把它改成 `main`，这是目前的行业标准。

### 2. 开发功能

创建 `about.md` 文件。

```bash
echo "我是全栈练习生，喜欢唱、跳、Rap、Coding。" > about.md

# 提交这个新功能
git add .
git commit -m "feat: add about page"
```

### 3. 合并回主世界 (Merge)

功能开发完了，我们需要把平行宇宙的成果合并回主世界。

```bash
# 1. 先切回主分支
git checkout main

# 2. 把 feature/about 分支合并过来
git merge feature/about
# 输出: Updating ... Fast-forward ...
```

🎉 恭喜！你的主分支现在也有了 `about.md`。

---

## 🎭 场景三：团队协作与冲突 (Conflict)

假设你还有一个队友（或者你在另一台电脑上）也修改了 `README.md`。

**你的修改**：

```markdown
# 我的超酷技术博客
```

**队友的修改**：

```markdown
# 某某的超级无敌博客
```

当你尝试 `git pull` 或 `git merge` 时，Git 会懵圈：**“等等，你们改了同一行，我听谁的？”** 这就是**冲突**。

> 🛠️ **想亲手制造并解决一个冲突吗？**
> 请直接跳转到 **[05*通关挑战/01*实战通关指南.md](file:///d:/project/study/00_计算机科学与Web基础/05_通关挑战/01_实战通关指南.md)**，完成“挑战一：Git 左右互搏”。那里有手把手的模拟教程。

### 解决冲突实战

Git 会把文件改成这样：

```text
<<<<<<< HEAD
# 我的超酷技术博客
=======
# 某某的超级无敌博客
>>>>>>> branch-b
```

**怎么修？**

1.  打开文件，手动删掉 `<<<<`, `====`, `>>>>` 这些符号。
2.  保留你觉得对的那行（或者把两行合并）。
3.  **再次提交**：

```bash
# 修改完文件后
git add README.md
git commit -m "fix: resolve conflict in readme title"
```

---

## 🛠️ 进阶防坑指南 (Best Practices)

### 1. `.gitignore` 是你的防弹衣

有些东西通过了就不能撤回（比如密码）。在项目第一天，**必须**配置 `.gitignore`。

**实战**：在项目根目录创建 `.gitignore` 文件，写入：

```text
# 忽略依赖包（体积大，随时可以 npm install）
node_modules/

# 忽略系统文件
.DS_Store

# 忽略私密配置（绝对不能上传！）
.env
secret.key
```

### 2. 后悔药：Git Reset

- **场景**：刚 commit 完，发现注释写错了，或者少提了一个文件。
- **解法**：
  ```bash
  # 撤销最近一次 commit，但保留代码在暂存区
  git reset --soft HEAD~1
  ```

### 3. 临时任务：Git Stash

- **场景**：你在 `dev` 分支改到一半，突然要修 `main` 分支的一个紧急 Bug。你不想提交半成品。
- **解法**：

  ```bash
  # 1. 把当前现场“冷冻”起来
  git stash

  # 2. 切去修 Bug... 修完回来

  # 3. “解冻”现场，继续干活
  git stash pop
  ```

---

> 🎯 **课后挑战**
>
> 1. 在 GitHub 上创建一个新仓库。
> 2. 将你本地的 `my-blog` 关联上去 (`git remote add origin ...`)。
> 3. 把代码推送到云端 (`git push -u origin main`)。
