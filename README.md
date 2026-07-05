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
**💾 Always Saved** • Every action persists instantly, with automatic daily snapshots and one-tap Undo  
**🌐 Integration Ready** • Import from Jira, Linear, Todoist (coming soon)

## 🚀 Get Started

### 🌐 Use it now (Recommended)

**👉 [onejob.co/app](https://onejob.co/app/)** — no installation, no account.
Your tasks live on your device, work offline, and never touch a server.
On your phone: Share → **Add to Home Screen** to install it as an app.

### 💻 Run Locally

```bash
git clone https://github.com/Design-in-Product/one-job.git
cd one-job
npm install && npm run dev      # http://localhost:8080 — that's it
```

One Job is **local-first**: no backend needed. (The optional FastAPI
backend in `backend/` exists for future sync and integrations — run the
app with `?remote` to use it in development.)

## ❓ FAQ

**Q: What if I have 100 tasks?**  
A: You still do them one at a time. One Job just makes that obvious.

**Q: Can I see all my tasks at once?**  
A: Yes, but why would you want that anxiety? Focus on what's in front of you.

**Q: What happens to deferred tasks?**  
A: They move to the bottom of your stack. They'll come back when you're ready.

**Q: Is my data safe?**  
A: Your tasks live on your own device — no account, no cloud, no tracking. Export a backup anytime from Settings.

**Q: Can I import from other apps?**  
A: Jira, Linear, and Todoist imports coming soon. For now, start fresh - it's liberating!

## 🎯 Project Status

**✅ 1.0 (release candidate)** — Card Deck Experience: 3D card flips, swipe
gestures with haptics, substacks, offline-capable installable PWA,
local-first storage with JSON backup/restore, undo, and a wipe-proof
snapshot safety net  
**🚧 In flight** — iOS (TestFlight) and Android (Play) store releases  
**🔭 Next** — agent inbox via MCP, Todoist/Jira/Linear imports, cross-device sync

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

- **Local-first**: all persistence flows through the `TaskStore` seam
  (`src/services/taskStore.ts`) — device storage by default; demo and
  backend stores plug into the same interface, as will future adapters
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Framer Motion,
  installable PWA, i18n-ready (strings in `src/i18n/locales/`)
- **Native shells**: Capacitor projects for iOS/Android in `ios/` and
  `android/` (see `NATIVE.md`)
- **Optional backend**: FastAPI + SQLAlchemy + Pydantic (SQLite/PostgreSQL)
  for future sync/integrations

### Technology Stack

**Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion, i18next  
**Native**: Capacitor (iOS + Android)  
**Backend (optional)**: FastAPI, SQLAlchemy, Pydantic  
**Testing**: vitest (frontend store layer), pytest (backend)

### Running Tests

```bash
npm test                          # frontend (vitest)
cd backend && python -m pytest    # backend
```

</details>

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.