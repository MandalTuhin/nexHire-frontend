# Design Document — nexHire Frontend

## Overview

nexHire is an Angular 18 single-page application (SPA) that serves as the frontend for an HR management platform. It communicates with a Spring Boot monolith backend via REST APIs using JWT-based authentication. The UI is built with Angular Material 18 for a consistent, accessible, and professional look.

The application has three distinct user roles — Candidate, HR, and Admin — each with a different set of screens and capabilities. Role-based routing guards enforce access control at the client side (the backend enforces it at the API level as well).

This document covers the frontend architecture, module breakdown, data models, correctness properties, error handling, and testing strategy.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Angular 18 SPA                        │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Candidate │  │   HR     │  │  Admin   │              │
│  │  Module  │  │  Module  │  │  Module  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       └──────────────┴─────────────┘                    │
│                      │                                  │
│             ┌─────────▼──────────┐                      │
│             │   Shared Module    │                      │
│             │ (Services, Guards, │                      │
│             │  Interceptors,     │                      │
│             │  Components)       │                      │
│             └─────────┬──────────┘                      │
│                       │                                 │
│             ┌─────────▼──────────┐                      │
│             │   HTTP Client +    │                      │
│             │   Auth Interceptor │                      │
│             └─────────┬──────────┘                      │
└───────────────────────┼─────────────────────────────────┘
                        │ REST / JSON (JWT Auth)
              ┌─────────▼──────────┐
              │  Spring Boot API   │
              │     (Backend)      │
              └────────────────────┘
```

### Routing Structure

```
/                         → redirect to /login
/login                    → AuthComponent (public)
/candidate                → CandidateShell (guard: CandidateGuard)
  /candidate/dashboard    → CandidateDashboard
  /candidate/apply        → JobApplicationForm
  /candidate/status       → PipelineStatus
  /candidate/switch       → ProjectSwitchRequest
/hr                       → HRShell (guard: HRGuard)
  /hr/dashboard           → HRDashboard
  /hr/candidates          → CandidateList
  /hr/candidates/:id      → CandidateDetail
  /hr/budget              → BudgetPanel
  /hr/allocations         → AllocationPanel
  /hr/project-switches    → ProjectSwitchQueue
/admin                    → AdminShell (guard: AdminGuard)
  /admin/dashboard        → AdminDashboard
  /admin/users            → UserManagement
  /admin/assets           → AssetManagement
  /admin/budget           → BudgetAllocation
  /admin/locations        → LocationManagement
  /admin/audit            → AuditLog
```

### Key Architectural Decisions

- **Standalone Components** — Angular 18 standalone components throughout (no NgModules). This is the modern Angular pattern and reduces boilerplate.
- **Lazy Loading** — Candidate, HR, and Admin feature areas are lazy-loaded routes to reduce initial bundle size.
- **HTTP Interceptor** — A single `AuthInterceptor` attaches the JWT token to every outgoing request and handles 401 responses by redirecting to login.
- **Route Guards** — `AuthGuard` checks for a valid token. `RoleGuard` checks the user's role against the route's required role.
- **State Management** — No NgRx for this scope. Angular services with RxJS `BehaviorSubject` are sufficient for shared state (auth state, notifications). Keeps complexity low.
- **Reactive Forms** — All forms use Angular Reactive Forms for validation and testability.

---

## Components and Interfaces

### Shared / Core

| Component / Service            | Responsibility                                   |
| ------------------------------ | ------------------------------------------------ |
| `AuthService`                  | Login, logout, JWT storage, role extraction      |
| `AuthInterceptor`              | Attach Bearer token to HTTP requests, handle 401 |
| `AuthGuard`                    | Block unauthenticated access                     |
| `RoleGuard`                    | Block access based on role mismatch              |
| `NotificationService`          | Fetch and store in-app notifications             |
| `NotificationBellComponent`    | Badge icon in nav bar                            |
| `AppShellComponent`            | Top nav bar + side nav layout wrapper            |
| `PipelineStatusBadgeComponent` | Reusable chip/badge for pipeline stages          |
| `ConfirmDialogComponent`       | Generic Angular Material confirm dialog          |
| `LoadingSpinnerComponent`      | Overlay spinner for async operations             |

### Candidate Feature

| Component                       | Responsibility                                                     |
| ------------------------------- | ------------------------------------------------------------------ |
| `CandidateDashboardComponent`   | Shows current pipeline stage, pending actions, BGC status, letters |
| `JobListingComponent`           | Displays the single job posting                                    |
| `ApplicationFormComponent`      | Multi-step form: personal details, resume upload, submission       |
| `PipelineStatusComponent`       | Visual stepper showing all pipeline stages                         |
| `ProjectSwitchRequestComponent` | Form to submit a project switch request                            |

### HR Feature

| Component                     | Responsibility                                                       |
| ----------------------------- | -------------------------------------------------------------------- |
| `HRDashboardComponent`        | Summary cards: candidates per stage, budget summary, pending actions |
| `CandidateListComponent`      | Filterable table of all candidates with pipeline stage               |
| `CandidateDetailComponent`    | Full candidate view with stage-appropriate action buttons            |
| `AssessmentPanelComponent`    | Send assessment link, mark as complete                               |
| `BGCPanelComponent`           | View BGC status, initiate BGC                                        |
| `OfferLetterPanelComponent`   | Generate and send offer letter                                       |
| `JoiningLetterPanelComponent` | Budget check + send joining letter                                   |
| `BudgetPanelComponent`        | Shows allocated, spent, remaining budget                             |
| `AllocationPanelComponent`    | Assign training track and project to a joiner                        |
| `ProjectSwitchQueueComponent` | List of pending switch requests with approve/reject                  |

### Admin Feature

| Component                     | Responsibility                                   |
| ----------------------------- | ------------------------------------------------ |
| `AdminDashboardComponent`     | System stats: asset counts, active hiring cycles |
| `UserManagementComponent`     | List users, change role, activate/deactivate     |
| `AssetManagementComponent`    | Asset inventory table, assign, return assets     |
| `BudgetAllocationComponent`   | Create hiring cycles, allocate budgets to HRs    |
| `LocationManagementComponent` | CRUD for City → Office → Block hierarchy         |
| `AuditLogComponent`           | Filterable, read-only activity log table         |

---

## Data Models

These TypeScript interfaces mirror the backend API response shapes.

```typescript
// Auth
interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  role: "CANDIDATE" | "HR" | "ADMIN";
  userId: string;
  name: string;
}

// Pipeline
type PipelineStage =
  | "APPLIED"
  | "ASSESSMENT_SENT"
  | "ASSESSMENT_COMPLETED"
  | "BGC_IN_PROGRESS"
  | "BGC_PASSED"
  | "BGC_FAILED"
  | "OFFER_SENT"
  | "JOINING_LETTER_SENT"
  | "JOINED"
  | "REJECTED";

// Candidate
interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  appliedAt: string; // ISO date string
  pipelineStage: PipelineStage;
  assessmentLink?: string;
  bgcStatus?: "IN_PROGRESS" | "PASSED" | "FAILED";
  assignedTrainingTrack?: string;
  assignedProject?: ProjectAllocation;
  location?: Location;
}

// Budget
interface HiringCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  allocatedAmount: number;
}

interface BudgetAllocation {
  id: string;
  cycleId: string;
  hrId: string;
  hrName: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
}

// Asset
type AssetStatus = "AVAILABLE" | "IN_USE" | "UNDER_MAINTENANCE";

interface Asset {
  id: string;
  assetType: string;
  assetTag: string;
  status: AssetStatus;
  assignedToId?: string;
  assignedToName?: string;
  assignedAt?: string;
}

// Location
interface Location {
  cityId: string;
  city: string;
  officeId: string;
  office: string;
  blockId: string;
  block: string;
}

// Project
interface Project {
  id: string;
  name: string;
  team: string;
  location: Location;
}

interface ProjectAllocation {
  projectId: string;
  projectName: string;
  team: string;
  location: Location;
  allocatedAt: string;
}

// Project Switch
type SwitchRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ProjectSwitchRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  currentProjectId: string;
  currentProjectName: string;
  targetProjectId: string;
  targetProjectName: string;
  reason: string;
  status: SwitchRequestStatus;
  submittedAt: string;
  resolvedAt?: string;
  rejectionReason?: string;
}

// Notifications
interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

// Audit Log
interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actionType: string;
  entityType: string;
  entityId: string;
  description: string;
  timestamp: string;
}

// User Management
interface User {
  id: string;
  name: string;
  email: string;
  role: "CANDIDATE" | "HR" | "ADMIN";
  isActive: boolean;
  createdAt: string;
}
```

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Property 1: JWT is stored on successful login
_For any_ valid login credential pair, after a successful login API response, the JWT token from the response should be present in session storage under the expected key.
**Validates: Requirements 1.1**

Property 2: Session is cleared on 401 response
_For any_ outgoing HTTP request that receives a 401 Unauthorized response, the auth interceptor should clear session storage and trigger navigation to the login route.
**Validates: Requirements 1.3**

Property 3: Role guard redirects unauthorized routes
_For any_ combination of user role and application route, if the route requires a role the user does not have, the route guard should redirect the user to their role-appropriate dashboard rather than rendering the protected component.
**Validates: Requirements 1.4**

Property 4: Session is cleared on logout
_For any_ logged-in session, after the logout action is triggered, session storage should contain no JWT token.
**Validates: Requirements 1.5**

Property 5: Candidate dashboard reflects pipeline stage
_For any_ candidate user object, the candidate dashboard should render a pipeline stage indicator whose value matches the pipelineStage field of the candidate data.
**Validates: Requirements 2.1**

Property 6: HR dashboard shows correct candidate counts per stage
_For any_ list of candidates, the HR dashboard summary should display a count per pipeline stage that equals the count of candidates in that stage in the input list.
**Validates: Requirements 2.2**

Property 7: Navigation renders only role-permitted items
_For any_ authenticated user role, the navigation menu should contain no items that belong exclusively to a different role.
**Validates: Requirements 2.4**

Property 8: Application form rejects invalid submissions
_For any_ application form submission where required fields are empty or invalid, the form should remain in an invalid state and the submit action should be disabled.
**Validates: Requirements 3.2**

Property 9: Sending assessment link transitions pipeline to ASSESSMENT_SENT
_For any_ candidate in the APPLIED stage, after an HR sends an assessment link, the candidate's displayed pipeline stage should be ASSESSMENT_SENT.
**Validates: Requirements 4.2**

Property 10: BGC status display matches API response
_For any_ BGC status value returned by the API (IN_PROGRESS, PASSED, FAILED), the BGC status displayed in the UI should exactly match that value.
**Validates: Requirements 5.2**

Property 11: Offer letter step is unlocked only when BGC is PASSED
_For any_ candidate, the offer letter send action should be enabled if and only if the candidate's bgcStatus is PASSED.
**Validates: Requirements 5.3**

Property 12: Joining letter send action respects budget availability
_For any_ combination of remaining budget and per-candidate cost, the joining letter send action should be enabled if and only if remaining budget is greater than or equal to the per-candidate cost.
**Validates: Requirements 6.3**

Property 13: Budget remaining is always allocated minus spent
_For any_ budget allocation record, the displayed remaining amount should equal the allocatedAmount minus the spentAmount.
**Validates: Requirements 7.3**

Property 14: Duplicate project switch requests are blocked
_For any_ employee who already has a PENDING project switch request, the submit button for a new switch request should be disabled.
**Validates: Requirements 10.5**

Property 15: Notifications grow on status change events
_For any_ status-change event dispatched to the notification service, the notification list for the target user should contain one additional unread notification.
**Validates: Requirements 13.1**

Property 16: Audit log entries contain all required fields
_For any_ audit log entry returned by the API, the rendered row in the audit log table should display a non-empty actor name, action type, entity description, and timestamp.
**Validates: Requirements 14.1**

---

## Error Handling

### HTTP Error Strategy

All HTTP errors are handled centrally in `AuthInterceptor` and a global `ErrorHandlerService`:

| HTTP Status      | Handling                                                       |
| ---------------- | -------------------------------------------------------------- |
| 400 Bad Request  | Display API error message in a snackbar or inline form error   |
| 401 Unauthorized | Clear session, redirect to `/login`                            |
| 403 Forbidden    | Show "Access Denied" snackbar, no redirect                     |
| 404 Not Found    | Show "Resource not found" message inline                       |
| 500 Server Error | Show generic "Something went wrong, please try again" snackbar |
| Network Error    | Show "Unable to reach server" snackbar                         |

### Form Validation Errors

- All forms use Angular Reactive Forms validators.
- Validation errors appear inline below the relevant field immediately on blur or submit.
- Submit buttons are disabled while the form is in an invalid state.
- File upload (resume) validates file type (PDF, DOCX) and size (max 5MB) on the client side.

### Pipeline State Guard Errors

When an HR attempts an action that is not valid for the candidate's current pipeline stage (e.g., sending an offer before BGC passes), the action button is disabled and a tooltip explains why it is unavailable. This prevents silent failures.

---

## Testing Strategy

### Framework Setup

- **Unit / Component Tests**: Angular's built-in testing utilities with Jasmine + Karma (default Angular test setup).
- **Property-Based Tests**: [fast-check](https://github.com/dubzzz/fast-check) — a well-maintained, TypeScript-native property-based testing library. Install via `npm install --save-dev fast-check`.
- Each property-based test runs a minimum of **100 iterations** using fast-check's default or explicitly configured `numRuns`.

### Unit Testing

Unit tests cover:

- Service methods (AuthService, NotificationService, etc.) with mocked HTTP responses.
- Route guards with various role/route combinations.
- Form validation logic.
- Pipe and utility function outputs.
- Component rendering for specific data states (e.g., BGC PASSED renders enabled offer button).

### Property-Based Testing

Each correctness property from the Correctness Properties section above must be implemented as a property-based test using fast-check.

**Tagging convention** — every property-based test must include this comment tag:

```
// Feature: nexhire-frontend, Property {N}: {property_text}
```

**Example:**

```typescript
// Feature: nexhire-frontend, Property 13: Budget remaining is always allocated minus spent
it("remaining always equals allocated minus spent", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 1_000_000 }),
      fc.integer({ min: 0, max: 1_000_000 }),
      (allocated, spent) => {
        fc.pre(spent <= allocated);
        const budget: BudgetAllocation = {
          allocatedAmount: allocated,
          spentAmount: spent,
          remainingAmount: allocated - spent,
        } as any;
        expect(computeRemaining(budget)).toBe(allocated - spent);
      },
    ),
    { numRuns: 100 },
  );
});
```

### Integration Points

- HTTP calls are tested using Angular's `HttpClientTestingModule` to intercept and mock API responses without a real server.
- Route guard tests use Angular's `RouterTestingModule`.

### What Is Not Tested via Automation

- Visual aesthetics (colors, spacing, typography) — manual review only.
- Third-party BGC webhook delivery — backend concern.
- Actual file upload to server — integration test with real backend is out of scope for this frontend spec.
