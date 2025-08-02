# One Job

> See one task. Do one task. Feel accomplished.

<div align="center">
  
  **[🚀 Try One Job Now](https://onejob.co)** • **[📱 View Demo](https://onejob.co)** • **[💻 Run Locally](#-quick-start)**
  
  ![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
  ![License](https://img.shields.io/badge/license-MIT-green.svg)
  ![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
  
</div>

---

## 😵 The Problem

- **47 browser tabs** open, 3 todo apps, sticky notes everywhere
- **Context switching** kills productivity (studies show 23 minutes to refocus!)
- Traditional task lists create **anxiety**, not clarity
- You spend more time **organizing** tasks than **doing** them

## 💡 The Solution: One Job

**One Job** is a revolutionary task management app that shows you only one task at a time. Built with a beautiful, swipe-to-interact mobile interface, it transforms how you work by eliminating distractions and decision fatigue.

✨ **Swipe right** to complete. **Swipe left** to defer. That's it.

## 🤔 Why One Job?

- **🧠 Psychology-backed**: Single-tasking improves focus by 40% and reduces errors by 50%
- **📱 Mobile-first**: Actually works on your phone (revolutionary, we know!)
- **⚡ Zero friction**: Swipe right = done. No menus, no clicks, no confusion
- **🎯 Intentional**: No notifications, badges, or guilt trips about overdue tasks
- **🏃 Momentum-building**: Each completed task fuels the next one

## 💼 Perfect For

- **👨‍💻 Developers**: Track your current debugging task without losing context in 47 browser tabs
- **📚 Students**: One assignment at a time means less overwhelm, better grades
- **💰 Freelancers**: Focus on billable work, defer distractions until later
- **🏠 Parents**: Tackle household tasks without the mental load of seeing everything at once
- **🧘 Anyone**: Who's tired of productivity theater and just wants to get things done

## ✨ Key Features

**🎯 Single-Task Focus** • See only what matters right now  
**👆 Swipe Gestures** • Complete (→) or defer (←) with natural gestures  
**📚 Smart Substacks** • Break big tasks into smaller ones without losing focus  
**🔄 Intelligent Ordering** • Deferred tasks automatically move to the back  
**💾 Always Saved** • Every action syncs instantly - never lose work  
**🌐 Integration Ready** • Import from Jira, Linear, Todoist (coming soon)

## 🚀 Get Started

### 🌐 Try it Online (Recommended)

**👉 [Use One Job Now](https://onejob.co)** - No installation needed! Works on any device.

### 💻 Run Locally

Want to run it yourself? Get started in under 2 minutes:

```bash
# Clone and enter the project
git clone https://github.com/Design-in-Product/one-job.git
cd one-job

# Install and start everything
npm install && npm run dev      # Start frontend (port 8080)

# In a new terminal:
cd backend && python -m venv venv && source venv/bin/activate
pip install -r ../requirements.txt && uvicorn main:app --reload
```

**That's it!** Open http://localhost:8080 and start focusing.

## ❓ FAQ

**Q: What if I have 100 tasks?**  
A: You still do them one at a time. One Job just makes that obvious.

**Q: Can I see all my tasks at once?**  
A: Yes, but why would you want that anxiety? Focus on what's in front of you.

**Q: What happens to deferred tasks?**  
A: They move to the bottom of your stack. They'll come back when you're ready.

**Q: Is my data safe?**  
A: Your tasks are saved locally and to your backend. We don't track or sell anything.

**Q: Can I import from other apps?**  
A: Jira, Linear, and Todoist imports coming soon. For now, start fresh - it's liberating!

## 🎯 Project Status

**✅ MVP Complete** - Core task management with swipe gestures  
**🚧 Coming Soon** - Jira/Linear imports, team features, native mobile apps

## 🤝 Contributing

We'd love your help making One Job even better! Check out:
- [Contributing Guide](docs/CONTRIBUTING.md) - Get started with development
- [GitHub Issues](https://github.com/Design-in-Product/one-job/issues) - See what we're working on
- [Discussions](https://github.com/Design-in-Product/one-job/discussions) - Share ideas and feedback

---

<div align="center">

## 🎉 Start Focusing Today

Stop managing tasks. Start completing them.

### **[Try One Job Now →](https://onejob.co)**

*Built for humans who want to get things done, not organize things to do.*

<br>

**[Documentation](docs/)** • **[API Reference](docs/API.md)** • **[Architecture](docs/ARCHITECTURE.md)**

Made with ❤️ by people who hate todo lists

</div>

---

<details>
<summary><b>🛠️ Technical Details</b> (for developers)</summary>

### Architecture

One Job follows **domain-driven design** with clear separation of concerns:

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Framer Motion
- **Backend**: FastAPI + SQLAlchemy + Pydantic + SQLite/PostgreSQL  
- **API-First**: RESTful API with complete OpenAPI documentation
- **Mobile-First**: Touch-optimized responsive design
- **Test-Driven**: Comprehensive test coverage with pytest

### Technology Stack

**Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion  
**Backend**: FastAPI, SQLAlchemy, Pydantic, pytest  
**Database**: SQLite (dev) / PostgreSQL (production)  
**Testing**: pytest for backend, Jest/Vitest planned for frontend

### Running Tests

```bash
# Backend tests
cd backend && python -m pytest -v

# Frontend tests (coming soon)
npm test
```

</details>

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.