# One Job

> Focus on one task at a time with a beautiful, swipe-to-interact mobile-first interface.

**One Job** is a task management application built with domain-driven design principles. It implements a card-based interface where users see one task at a time, can swipe right to complete or left to defer tasks, and organize complex work into hierarchical substacks.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)

## ✨ Features

### 🎯 **Core Task Management**
- **One-at-a-time focus**: See only the current task to maintain concentration
- **Swipe interactions**: Right to complete, left to defer
- **Smart task ordering**: Deferred tasks move to bottom of stack
- **Real-time persistence**: All changes immediately saved to backend

### 📚 **Hierarchical Organization** 
- **Substacks**: Break complex tasks into organized sub-projects
- **Nested task management**: Each substack is a mini task-stack
- **Visual hierarchy**: Clear parent-child relationships

### 🔄 **Integration Ready**
- **External system imports**: Architecture supports Linear, Jira, etc.
- **RESTful API**: Complete backend API for all operations
- **Domain-driven design**: Clean separation for easy extension

### 📱 **Modern UX**
- **Mobile-first**: Optimized for phone use with touch gestures
- **Smooth animations**: Framer Motion powered transitions
- **Beautiful UI**: shadcn/ui components with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ (for frontend)
- **Python** 3.9+ (for backend)
- **Git** (for cloning)

### 1. Clone & Setup
```bash
git clone <repository-url>
cd one-job

# Install frontend dependencies
npm install

# Setup Python backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

### 2. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 3. Open & Use
- **Frontend**: http://localhost:8080
- **API Docs**: http://127.0.0.1:8000/docs
- **Ready to use!** The SQLite database auto-creates

## 🏗️ Architecture

One Job follows **domain-driven design** with clear separation of concerns:

```
┌─────────────────────────┐
│       Frontend          │
│   React + TypeScript    │
│     (Port 8080)        │
└─────────┬───────────────┘
          │ HTTP API
          │
┌─────────▼───────────────┐
│       Backend           │
│   FastAPI + SQLAlchemy  │
│     (Port 8000)        │
└─────────┬───────────────┘
          │ ORM
          │
┌─────────▼───────────────┐
│      Database           │
│ SQLite (dev) / PG (prod)│
└─────────────────────────┘
```

**Key Design Principles:**
- **API-First**: All functionality exposed via REST API
- **Mobile-First**: Touch-optimized responsive design  
- **Test-Driven**: Comprehensive test coverage
- **Integration-Ready**: Clean interfaces for external systems

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture Guide](docs/ARCHITECTURE.md) | Detailed system design and patterns |
| [API Specification](docs/API.md) | Complete REST API reference |
| [Developer Guide](docs/DEVELOPMENT.md) | How to extend and contribute |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment options |
| [Testing Guide](docs/TESTING.md) | Testing strategy and examples |

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Framer Motion** - Smooth animations
- **React Query** - Server state management

### Backend  
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Python ORM with relationship support
- **Pydantic** - Data validation and serialization
- **pytest** - Testing framework
- **SQLite/PostgreSQL** - Database options

### Development
- **Domain-Driven Design** - Clean architecture patterns
- **Test-Driven Development** - Comprehensive test coverage
- **API-First Design** - All features exposed via REST API

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Backend tests
cd backend
source ../venv/bin/activate
python -m pytest -v

# Frontend tests (when implemented)
npm test
```

Current test coverage:
- ✅ Unit tests for all API endpoints
- ✅ Integration tests for complete workflows  
- ✅ Task management operations
- ✅ Substack functionality
- ✅ Data persistence

## 🎯 Project Status

**Current Phase: MVP Complete** ✅
- [x] Core task management working
- [x] Substack system implemented
- [x] Full backend-frontend integration
- [x] Comprehensive test coverage
- [x] Development documentation

**Next Phase: Integration** 🚧
- [ ] Linear/Jira import functionality
- [ ] Advanced task filtering
- [ ] User authentication
- [ ] Multi-user support

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Pull request process
- Issue reporting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with assistance from Claude Code
- Inspired by domain-driven design principles
- UI components from shadcn/ui
- Icons from Lucide React

---

**Ready to focus on one job at a time?** Clone, run, and start organizing your work with intention.

For questions or support, please open an issue in the repository.