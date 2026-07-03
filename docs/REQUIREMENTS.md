# One Job - Requirements Specification

> **Document Version**: 1.0  
> **Last Updated**: January 2025  
> **Status**: MVP Complete, Integration Phase Planning

## 🎯 Project Overview

One Job is a mobile-first task management application built with domain-driven design principles. It implements a card-based interface where users see one task at a time, enabling focused work through swipe-based interactions and hierarchical task organization.

### Vision Statement
*"Focus on one job at a time with beautiful, swipe-to-interact mobile-first interface."*

### Key Design Philosophy
- **Single-task focus**: Display only the current task to maintain concentration
- **Mobile-first**: Touch-optimized responsive design with gesture controls
- **Domain-driven**: Clean architecture with clear separation of concerns
- **API-first**: All functionality exposed via RESTful API

---

## 📋 Functional Requirements

### FR1: Core Task Management

#### FR1.1 Task Creation and Storage
- **FR1.1.1** Users SHALL be able to create tasks with title and description
- **FR1.1.2** System SHALL auto-assign unique UUIDs to all tasks
- **FR1.1.3** System SHALL automatically timestamp task creation
- **FR1.1.4** System SHALL assign sequential sort_order to new tasks
- **FR1.1.5** New tasks SHALL default to "todo" status

#### FR1.2 Task State Management
- **FR1.2.1** Tasks SHALL have exactly two primary states: "todo" and "done"
- **FR1.2.2** System SHALL maintain both `status` field (for API) and `completed` boolean (for frontend compatibility)
- **FR1.2.3** Task completion SHALL automatically set `completed_at` timestamp
- **FR1.2.4** Task reactivation SHALL clear `completed_at` timestamp

#### FR1.3 Task Deferral System
- **FR1.3.1** Users SHALL be able to defer todo tasks through swipe-left gesture
- **FR1.3.2** Deferred tasks SHALL move to bottom of task stack
- **FR1.3.3** System SHALL track deferral count and timestamp for each task
- **FR1.3.4** System SHALL automatically reorder remaining tasks when one is deferred
- **FR1.3.5** Only tasks in "todo" status SHALL be deferrable

#### FR1.4 Task Ordering and Display
- **FR1.4.1** Active tasks SHALL be sorted by ascending sort_order
- **FR1.4.2** Completed tasks SHALL be sorted by descending completion date
- **FR1.4.3** System SHALL display task count badges for active and completed tasks
- **FR1.4.4** Frontend SHALL show only the top task in the main view

### FR2: Hierarchical Organization (Substacks)

#### FR2.1 Substack Creation
- **FR2.1.1** Users SHALL be able to create named substacks within any task
- **FR2.1.2** Substacks SHALL have unique UUIDs and creation timestamps
- **FR2.1.3** System SHALL maintain parent-child relationship between tasks and substacks
- **FR2.1.4** Each substack SHALL function as an independent task container

#### FR2.2 Substack Task Management
- **FR2.2.1** Users SHALL be able to add tasks to substacks
- **FR2.2.2** Substack tasks SHALL have their own completion status
- **FR2.2.3** Substack tasks SHALL maintain sort_order within their container
- **FR2.2.4** System SHALL support nested navigation between parent tasks and substacks

#### FR2.3 Substack Navigation
- **FR2.3.1** Users SHALL be able to navigate into substack views
- **FR2.3.2** Substack view SHALL display parent task context
- **FR2.3.3** Users SHALL be able to return to parent task view
- **FR2.3.4** Navigation transitions SHALL be animated for clarity

### FR3: User Interface and Interaction

#### FR3.1 Mobile-First Design
- **FR3.1.1** Interface SHALL be optimized for phone screens (mobile-first)
- **FR3.1.2** All interactions SHALL be touch-friendly with appropriate tap targets
- **FR3.1.3** Interface SHALL be responsive across device sizes
- **FR3.1.4** Card-based layout SHALL provide clear visual hierarchy

#### FR3.2 Gesture Controls (Card Deck Experience)
- **FR3.2.1** Swipe-right gesture SHALL complete tasks
- **FR3.2.2** Swipe-left gesture SHALL defer tasks
- **FR3.2.3** Tap on a face-up card SHALL open task details modal
- **FR3.2.4** Tap on the face-down deck SHALL flip the top card face-up
- **FR3.2.5** Long-press SHALL open the arc menu (Add Task / Completed / Integrations / Settings)
- **FR3.2.6** All gestures SHALL provide visual feedback (drag follow, tilt, Done/Later hints)
- **FR3.2.7** A face-up card SHALL auto-flip face-down after 1 minute of inactivity
- **FR3.2.8** After a swipe, the next card SHALL auto-reveal when tasks remain

#### FR3.3 Visual Design
- **FR3.3.1** Interface SHALL use gradient design system (taskGradient)
- **FR3.3.2** Components SHALL follow shadcn/ui design patterns
- **FR3.3.3** Animations SHALL be smooth (60fps) using Framer Motion
- **FR3.3.4** Interface SHALL provide clear status indicators

#### FR3.4 Task Display Views (Card Deck Experience — supersedes the tabbed interface)
- **FR3.4.1** Main view SHALL be a decluttered card deck: no permanent tabs, buttons, or navigation chrome
- **FR3.4.2** The deck SHALL present the top task as a playing card (face-down until tapped), with the remaining pile visible beneath
- **FR3.4.3** Completed and Integrations views SHALL be reachable via the long-press arc menu, with simple back navigation
- **FR3.4.4** Completed view SHALL list all finished tasks chronologically

### FR4: Data Persistence and API

#### FR4.0 Local-First Storage (1.0)
- **FR4.0.1** Tasks SHALL persist on-device by default with no backend dependency
- **FR4.0.2** All persistence SHALL flow through the TaskStore interface (local, demo, remote)
- **FR4.0.3** The remote (API) store SHALL activate only when explicitly configured (VITE_API_URL or ?remote)
- **FR4.0.4** The app SHALL be installable as a PWA and function offline

#### FR4.1 Backend API (optional in 1.0; required for integrations/sync)
- **FR4.1.1** System SHALL provide RESTful API for all operations
- **FR4.1.2** API SHALL follow OpenAPI 3.0 specification
- **FR4.1.3** All changes SHALL be persisted immediately to database
- **FR4.1.4** API SHALL return consistent JSON responses

#### FR4.2 Database Requirements
- **FR4.2.1** System SHALL support both SQLite (development) and PostgreSQL (production)
- **FR4.2.2** Database SHALL maintain referential integrity between tasks and substacks
- **FR4.2.3** All timestamps SHALL be timezone-aware (UTC)
- **FR4.2.4** System SHALL use UUIDs for all primary keys

#### FR4.3 Data Validation
- **FR4.3.1** All API inputs SHALL be validated using Pydantic models
- **FR4.3.2** System SHALL return appropriate HTTP status codes
- **FR4.3.3** Error responses SHALL include descriptive messages
- **FR4.3.4** System SHALL prevent SQL injection through ORM usage

### FR5: Integration Capabilities

#### FR5.1 External Service Integration Framework
- **FR5.1.1** System SHALL provide pluggable integration architecture
- **FR5.1.2** Tasks SHALL support external_id and source fields for integration tracking
- **FR5.1.3** Integration interface SHALL support both import and export operations
- **FR5.1.4** System SHALL provide webhook capability for real-time sync

#### FR5.2 Planned Integration Services
- **FR5.2.1** System SHALL support Asana integration (Personal Access Token auth)
- **FR5.2.2** System SHALL support Todoist integration (API Token auth)
- **FR5.2.3** System SHALL support Zapier webhook integration
- **FR5.2.4** System SHALL provide demo integration for testing

#### FR5.3 Integration Data Mapping
- **FR5.3.1** External tasks SHALL be mapped to One Job task schema
- **FR5.3.2** System SHALL preserve source attribution for imported tasks
- **FR5.3.3** System SHALL handle integration authentication securely
- **FR5.3.4** Integration failures SHALL not affect core functionality

---

## 🔧 Non-Functional Requirements

### NFR1: Performance Requirements

#### NFR1.1 Response Time
- **NFR1.1.1** API responses SHALL complete within 500ms for 95% of requests
- **NFR1.1.2** Task creation SHALL complete within 200ms
- **NFR1.1.3** UI animations SHALL maintain 60fps frame rate
- **NFR1.1.4** Database queries SHALL be optimized with appropriate indexes

#### NFR1.2 Scalability
- **NFR1.2.1** System SHALL support up to 10,000 tasks per user without performance degradation
- **NFR1.2.2** Database connection pooling SHALL be implemented for production
- **NFR1.2.3** Frontend SHALL implement virtual scrolling for large task lists
- **NFR1.2.4** System SHALL support horizontal scaling when needed

### NFR2: Reliability and Availability

#### NFR2.1 Data Integrity
- **NFR2.1.1** All task operations SHALL be atomic (complete or fail entirely)
- **NFR2.1.2** System SHALL maintain data consistency across all operations
- **NFR2.1.3** Database transactions SHALL include proper rollback mechanisms
- **NFR2.1.4** System SHALL prevent data loss during concurrent operations

#### NFR2.2 Error Handling
- **NFR2.2.1** System SHALL gracefully handle all error conditions
- **NFR2.2.2** User-facing error messages SHALL be clear and actionable
- **NFR2.2.3** System errors SHALL be logged for debugging
- **NFR2.2.4** Frontend SHALL maintain functionality during temporary backend issues

### NFR3: Security Requirements

#### NFR3.1 Data Protection
- **NFR3.1.1** All API endpoints SHALL validate input to prevent injection attacks
- **NFR3.1.2** SQLAlchemy ORM SHALL be used to prevent SQL injection
- **NFR3.1.3** CORS configuration SHALL restrict cross-origin requests appropriately
- **NFR3.1.4** Sensitive integration credentials SHALL be stored securely

#### NFR3.2 Future Authentication (Planned)
- **NFR3.2.1** System architecture SHALL support user authentication integration
- **NFR3.2.2** JWT token-based authentication SHALL be implementable
- **NFR3.2.3** User session management SHALL be secure
- **NFR3.2.4** Multi-user support SHALL maintain data isolation

### NFR4: Maintainability and Development

#### NFR4.1 Code Quality
- **NFR4.1.1** Code SHALL follow TypeScript/Python best practices
- **NFR4.1.2** All functions and classes SHALL have clear, single responsibilities
- **NFR4.1.3** Code SHALL be documented with clear comments and docstrings
- **NFR4.1.4** System SHALL maintain consistent naming conventions

#### NFR4.2 Testing Requirements
- **NFR4.2.1** Backend SHALL have >90% test coverage
- **NFR4.2.2** All API endpoints SHALL have unit tests
- **NFR4.2.3** Integration tests SHALL cover complete user workflows
- **NFR4.2.4** Tests SHALL be runnable in CI/CD environment

#### NFR4.3 Development Environment
- **NFR4.3.1** Development setup SHALL be completable in <15 minutes
- **NFR4.3.2** Hot reload SHALL be available for both frontend and backend
- **NFR4.3.3** Database migrations SHALL be version-controlled
- **NFR4.3.4** Development and production environments SHALL use same codebase

---

## 🌐 System Architecture Requirements

### AR1: Technology Stack

#### AR1.1 Frontend Requirements
- **AR1.1.1** React 18 with modern hooks and functional components
- **AR1.1.2** TypeScript for type safety and developer experience
- **AR1.1.3** Vite for fast builds and hot module replacement
- **AR1.1.4** TailwindCSS for utility-first styling
- **AR1.1.5** shadcn/ui for consistent, accessible component library
- **AR1.1.6** Framer Motion for smooth, performant animations
- **AR1.1.7** React Query for server state management and caching

#### AR1.2 Backend Requirements
- **AR1.2.1** FastAPI framework for modern Python web development
- **AR1.2.2** SQLAlchemy ORM for database abstraction and type safety
- **AR1.2.3** Pydantic for data validation and serialization
- **AR1.2.4** Uvicorn ASGI server for production deployment
- **AR1.2.5** pytest for comprehensive testing framework
- **AR1.2.6** Alembic for database migrations (future)

#### AR1.3 Database Requirements
- **AR1.3.1** SQLite for development and testing environments
- **AR1.3.2** PostgreSQL for production deployment
- **AR1.3.3** Database-agnostic code using SQLAlchemy abstractions
- **AR1.3.4** Support for connection pooling and transaction management

### AR2: Deployment and Infrastructure

#### AR2.1 Development Deployment
- **AR2.1.1** Frontend SHALL run on port 8080 via Vite dev server
- **AR2.1.2** Backend SHALL run on port 8000 via Uvicorn
- **AR2.1.3** SQLite database SHALL auto-create for immediate development
- **AR2.1.4** CORS SHALL be configured for local development

#### AR2.2 Production Deployment (Planned)
- **AR2.2.1** System SHALL be containerizable with Docker
- **AR2.2.2** Static assets SHALL be optimized and cached
- **AR2.2.3** Database migrations SHALL be automated
- **AR2.2.4** Environment-based configuration SHALL be supported

---

## 🚀 Current Implementation Status

### ✅ **COMPLETED (MVP Phase)**

#### Core Task Management
- [x] Task CRUD operations with FastAPI backend
- [x] SQLAlchemy models with UUID primary keys  
- [x] Two-state task system (todo/done) with deferral tracking
- [x] Automatic sort ordering and reordering logic
- [x] Real-time persistence to SQLite database

#### User Interface
- [x] Mobile-first React application with TypeScript
- [x] Swipe gesture controls (complete/defer) with drag-follow and hints
- [x] Card Deck Experience: 3D flip (FlipCard), playing-card back design (CardBack), deck underlay
- [x] Long-press arc menu (Add Task / Completed / Integrations)
- [x] shadcn/ui component system with TailwindCSS

> **2025-08 design pivot**: the original tabbed interface (Stack/Completed/Integrate)
> was replaced by the Card Deck Experience — a decluttered playing-card metaphor.
> Completed and Integrations are now views reached from the arc menu.

#### Hierarchical Organization
- [x] Substack creation and management
- [x] Nested task containers with independent sorting
- [x] Parent-child relationship tracking
- [x] Animated navigation between views

#### Testing and Documentation
- [x] Comprehensive unit tests for all API endpoints
- [x] Integration tests for complete workflows
- [x] Full API documentation with OpenAPI
- [x] Architecture documentation and guides

### 🚧 **IN PROGRESS (Integration Phase)**

#### External Service Integration Framework
- [x] Integration UI with service selection
- [x] Demo integration implementation
- [x] Webhook support infrastructure (Zapier)
- [ ] **Asana API integration** (Personal Access Token)
- [ ] **Todoist API integration** (API Token)
- [ ] **Linear API integration** (OAuth/API Key)
- [ ] **Jira API integration** (OAuth/API Token)

#### Advanced Features
- [ ] **Task filtering and search**
- [ ] **Bulk task operations**  
- [ ] **Task templates and quick-create**
- [ ] **Task time tracking and analytics**

### 📅 **PLANNED (Multi-User Phase)**

#### Authentication and User Management
- [ ] **JWT-based user authentication**
- [ ] **User registration and profile management**
- [ ] **Multi-user data isolation**
- [ ] **Team and workspace support**

#### Capture Gestures (added 2026-07-03)
- [x] **Persistent add affordance** (floating +, restores the pre-pivot always-visible add; shipped 1.0)
- [ ] **Pull-down to deal a blank card** (chromeless power gesture, post-1.0)

#### Localization (added 2026-07-02)
- [x] **App i18n pass** (i18next; all UI strings in src/i18n/locales/en.json; new locales = one JSON file, 2026-07-03)
- [ ] **Localized store listings** (App Store + Play, after app i18n)

#### Advanced Integrations
- [ ] **Real-time sync with external services**
- [ ] **Bi-directional task synchronization**
- [ ] **Calendar integration (Google/Outlook)**
- [ ] **Slack/Teams notifications**

#### Enterprise Features
- [ ] **Role-based access control**
- [ ] **Audit logging and compliance**
- [ ] **Custom integration SDK**
- [ ] **Advanced analytics and reporting**

---

## 🎯 Acceptance Criteria

### MVP Acceptance Criteria (✅ COMPLETE)
1. User can create, complete, and defer tasks via mobile interface
2. Swipe gestures work reliably for task interactions
3. Task ordering maintains consistency after deferrals
4. Substacks provide functional hierarchical organization
5. All task operations persist immediately to database
6. Application works offline-first with local database
7. Comprehensive test coverage >90% for backend
8. API documentation is complete and accurate

### Integration Phase Acceptance Criteria (🚧 IN PROGRESS)
1. Users can connect at least 2 external task services
2. Task import preserves essential data (title, description, status)
3. Integration failures don't crash the application
4. External task source attribution is maintained
5. Demo integration works for testing purposes
6. Webhook export functionality operates correctly

### Multi-User Phase Acceptance Criteria (📅 PLANNED)
1. Multiple users can use system without data conflicts
2. User authentication is secure and user-friendly
3. Data isolation prevents unauthorized access
4. Team features enable collaborative task management
5. System performance scales with user count

---

## 🔍 Quality Assurance Requirements

### Testing Strategy
- **Unit Tests**: All business logic functions and API endpoints
- **Integration Tests**: Complete user workflows and database operations  
- **End-to-End Tests**: Full application functionality via browser automation
- **Performance Tests**: Response time and concurrent user handling
- **Security Tests**: Input validation and authentication flows

### Code Quality Standards
- **TypeScript**: Strict mode enabled, no `any` types in production code
- **Python**: Type hints required, Black formatting, isort imports
- **ESLint**: Configured for React/TypeScript best practices
- **Prettier**: Consistent code formatting across project
- **Git Hooks**: Pre-commit linting and testing

### Documentation Requirements
- **API Documentation**: Auto-generated from OpenAPI specification
- **Code Documentation**: Inline comments for complex business logic
- **Architecture Documentation**: System design and patterns
- **User Documentation**: Setup and usage guides
- **Developer Documentation**: Contribution and extension guides

---

*This requirements document represents the current understanding of One Job functionality based on implemented features and planned roadmap. It will be updated as the system evolves and new requirements are identified.*