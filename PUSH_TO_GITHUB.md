# Push this project to GitHub

Run these commands in your terminal from the `todo-app` folder.

## 1. Initialize git and commit (if not already done)

```bash
cd ~/todo-app
git init
git add .
git commit -m "Initial commit: to-do app with due dates"
```

## 2. Create a new repo on GitHub

- Go to [github.com/new](https://github.com/new)
- Set **Repository name** (e.g. `todo-app`)
- Choose **Public**
- Do **not** add a README, .gitignore, or license (you already have them)
- Click **Create repository**

## 3. Add GitHub as remote and push

Replace `YOUR_USERNAME` with your GitHub username and `todo-app` with the repo name if you used something else:

```bash
git remote add origin https://github.com/YOUR_USERNAME/todo-app.git
git branch -M main
git push -u origin main
```

If you use SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/todo-app.git
git branch -M main
git push -u origin main
```

After this, your project will be on GitHub.
