# Contributing to MicroForge

First of all, thank you for your interest in contributing to **MicroForge** 🎉  
Open-source survives because people like you show up and help. This guide is here to make that process as smooth as possible, even if this is your **first-ever contribution**.

Please read this document before starting. It explains:
- How to set up the project locally
- How to pick an issue and create a branch
- How to test your changes
- How to open a Pull Request (PR)

---

## 📌 What is MicroForge?

**MicroForge** is an enterprise-grade, cloud-native microservices platform that demonstrates:
- Polyglot microservices (Go, Java, Python, Node.js, React)
- Docker-based local development
- Kubernetes-native production deployment
- DevOps best practices and observability patterns

If you want to learn **real-world microservices + DevOps**, this project is a great place to contribute.

📖 Main documentation:  
👉 https://github.com/Manoj-14/MicroForge

---

## 🧑‍💻 Who Can Contribute?

Anyone.

- First-time open-source contributors ✅  
- Students learning Docker, Kubernetes, or backend/frontend development ✅  
- Experienced developers looking to improve documentation, tooling, or services ✅  

If something is confusing, that itself is a valid thing to fix.

---

## 🛠️ Prerequisites

Before you begin, make sure you have the following installed:

### Required
- **Git**  
  https://git-scm.com/downloads
- **Docker & Docker Compose**  
  https://docs.docker.com/get-docker/

### Optional (for Kubernetes work)
- **kubectl**  
  https://kubernetes.io/docs/tasks/tools/

You do **not** need to know every language used in this repo. Many contributions are docs, config, or small fixes.

---

## 🚀 Local Development Setup (Beginner Friendly)

### 1️⃣ Fork the Repository
Click the **Fork** button on GitHub:
👉 https://github.com/Manoj-14/MicroForge

This creates your own copy of the repository.

---

### 2️⃣ Clone Your Fork

```bash
git clone https://github.com/<your-username>/MicroForge.git
cd MicroForge/src
```
---

### 3️⃣ Start the Project Using Docker Compose

This runs **all services together**.

```bash
docker-compose up -d
```
⏳ The first run may take a few minutes.

Once done, open:

Frontend: http://localhost:3000

If the page loads, your setup works 🎉


### 🐛 Picking an Issue

Look at open issues:
👉 https://github.com/Manoj-14/MicroForge/issues

**Labels to look for:**
```bash
good first issue
documentation
help wanted
```

**👉 Before starting work, comment on the issue and ask to be assigned.**

## Caution:
Never work directly on `main` branch.  
All pull requests should target the `stage` branch.

### 🌿 Branching Guidelines

Always create a new branch. Never work directly on main.

Branch Naming Convention
`feature/<short-description> `
`fix/<short-description>`
`docs/<short-description>`

***Example***
```bash 
git checkout -b docs/add-contributing-guide
 ```

### ✅ Making Changes

- Keep changes focused and small
- Follow existing folder structure

***For documentation:***

- Use clear language
- Assume the reader is a beginner

***For code:***

- Avoid unrelated refactors
- Add comments where helpful

### 🧪 Local Validation (Before You Push)

Before opening a PR:

- Ensure Docker services start without errors
- For documentation-only changes:
- Ensure Markdown renders correctly on GitHub

***For code changes:***
- Service should build/run locally
- No breaking changes to other services

### 📝 Commit Message Guidelines

Write clear, meaningful commit messages.

***Good examples***
+ docs: add contributing guidelines
+ fix: correct port mismatch in docker-compose
+ feat: add health endpoint to metadata service

### 🔁 Opening a Pull Request (PR)

* ***Push your branch:***
```bash
git push origin <branch-name>
```

* ***Open a PR against the main branch:***
```bash
👉 https://github.com/Manoj-14/MicroForge/pulls
```

Fill out the PR template carefully. Refer the `PR_TEMPLATE.md`

### 📋 What Maintainers Look For

- Clear description of what and why
- Related issue linked (which can be linked using "#" followed by the issue number)
- No unnecessary changes
- Beginner-friendly documentation where applicable

## 🧭 Code of Conduct

- Please be respectful and constructive.
- This project follows standard open-source collaboration etiquette.
- If unsure, default to kindness.

## 🙌 Need Help?

If you’re stuck:
- Comment on the issue you’re working on
- Ask questions in the PR by tagging the authors or maintainers using "@"
- Explain what you tried
- Create an issue if the problem persists to reach out to the community for help 

**Thank you for contributing to MicroForge 🚀**
We appreciate your time and effort!