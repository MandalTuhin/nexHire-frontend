# Implementation Plan — nexHire Frontend

- [ ] 1. Set up project structure and core configuration
  - Scaffold Angular 18 app with standalone components (`ng new nexhire --standalone --routing --style=scss`)
  - Install Angular Material 18 (`ng add @angular/material`) and fast-check (`npm install --save-dev fast-check`)
  - Create folder structure: `src/app/core`, `src/app/shared`, `src/app/features/auth`, `src/app/features/candidate`, `src/app/features/hr`, `src/app/features/admin`
  - Configure `provideHttpClient(withInterceptors([authInterceptor]))` in `app.config.ts`
  - Set up global Angular Material theme in `styles.scss`
  - _Requirements: 1.1, 1.3_

- [ ] 2. Implement authentication — service, interceptor, and guards
- [ ] 2.1 Implement AuthService
  - Create `AuthService` in `core/services/auth.service.ts`
  - Methods: `login(req: LoginRequest): Observable<AuthResponse>`, `logout()`, `getToken()`, `getRole()`, `getUserId()`
  - Store JWT in `sessionStorage` on login; clear on logout
  - Expose `currentUser$: BehaviorSubject<AuthResponse | null>`
  - _Requirements: 1.1, 1.5_

- [ ] 2.2 Write property test for AuthService login/logout round trip
  - **Property 1: JWT is stored on successful login**
  - **Property 4: Session is cleared on logout**
  - **Validates: Requirements 1.1, 1.5**

- [ ] 2.3 Implement AuthInterceptor
  - Create functional interceptor `authInterceptor` in `core/interceptors/auth.interceptor.ts`
  - Attach `Authorization: Bearer <token>` header to every outgoing request
  - On 401 response: clear session storage, navigate to `/login`
  - _Requirements: 1.3_

- [ ] 2.4 Write property test for AuthInterceptor 401 handling
  - **Property 2: Session is cleared on 401 response**
  - **Validates: Requirements 1.3**

- [ ] 2.5 Implement route guards
  - Create `AuthGuard` (blocks unauthenticated users, redirects to `/login`)
  - Create `RoleGuard` (accepts required role list; redirects to role dashboard if mismatch)
  - _Requirements: 1.4_

- [ ] 2.6 Write property test for RoleGuard
  - **Property 3: Role guard redirects unauthorized routes**
  - **Validates: Requirements 1.4**

- [ ] 3. Build app shell, routing, and navigation
  - Create `AppShellComponent` with Angular Material sidenav + toolbar
  - Implement top-level `app.routes.ts` with lazy-loaded routes for `/login`, `/candidate`, `/hr`, `/admin`
  - Build `NavigationComponent` that renders menu items based on user role from `AuthService`
  - Implement `NotificationBellComponent` with unread badge
  - _Requirements: 2.4, 13.3_

- [ ] 3.1 Write property test for role-based navigation rendering
  - **Property 7: Navigation renders only role-permitted items**
  - **Validates: Requirements 2.4**

- [ ] 4. Implement login page
  - Create `LoginComponent` in `features/auth/`
  - Reactive form with email + password fields, validators, and inline error messages
  - On success: navigate to role-appropriate dashboard
  - On failure: display generic error message (do not reveal which field failed)
  - _Requirements: 1.1, 1.2_

- [ ] 5. Build shared components and services
  - Create `PipelineStatusBadgeComponent` — renders a colored chip for each `PipelineStage` value
  - Create `ConfirmDialogComponent` — generic Angular Material dialog with confirm/cancel
  - Create `LoadingSpinnerComponent` — overlay spinner
  - Create `NotificationService` with `notifications$: BehaviorSubject<Notification[]>`, `fetchNotifications()`, `markAsRead(id)`
  - Create `ErrorHandlerService` to display snackbar messages for HTTP errors
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 5.1 Write property test for NotificationService
  - **Property 15: Notifications grow on status change events**
  - **Validates: Requirements 13.1**

- [ ] 6. Implement Candidate feature
- [ ] 6.1 Build CandidateDashboard
  - Fetch candidate profile from API on init
  - Display pipeline stage using `PipelineStatusBadgeComponent`
  - Show pending action card (e.g., "Complete your assessment" with link if assessment sent)
  - Show BGC status section when in BGC stages
  - Show letter download buttons when offer/joining letters are available
  - _Requirements: 2.1, 3.3, 5.5_

- [ ] 6.2 Write property test for CandidateDashboard pipeline stage rendering
  - **Property 5: Candidate dashboard reflects pipeline stage**
  - **Validates: Requirements 2.1**

- [ ] 6.3 Build Job Listing and Application Form
  - `JobListingComponent` fetches and displays the single job posting
  - `ApplicationFormComponent` — multi-step reactive form: step 1 personal details, step 2 resume upload
  - Validate all required fields; disable submit on invalid state
  - If candidate has already applied, redirect to `/candidate/status`
  - _Requirements: 3.1, 3.2, 3.5_

- [ ] 6.4 Write property test for Application Form validation
  - **Property 8: Application form rejects invalid submissions**
  - **Validates: Requirements 3.2**

- [ ] 6.5 Build Pipeline Status page
  - Angular Material stepper showing all pipeline stages in order
  - Current stage is highlighted; completed stages are checked
  - _Requirements: 3.3, 3.4_

- [ ] 6.6 Build Project Switch Request form
  - Reactive form with target project dropdown and reason textarea
  - Disable submit button if a PENDING switch request already exists for this employee
  - _Requirements: 10.1, 10.5_

- [ ] 6.7 Write property test for project switch duplicate prevention
  - **Property 14: Duplicate project switch requests are blocked**
  - **Validates: Requirements 10.5**

- [ ] 7. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement HR feature
- [ ] 8.1 Build HR Dashboard
  - Summary cards: count of candidates per pipeline stage
  - Budget utilization card: allocated, spent, remaining
  - Pending actions list (candidates awaiting next HR action)
  - _Requirements: 2.2_

- [ ] 8.2 Write property test for HR Dashboard candidate stage counts
  - **Property 6: HR dashboard shows correct candidate counts per stage**
  - **Validates: Requirements 2.2**

- [ ] 8.3 Build Candidate List and Candidate Detail
  - `CandidateListComponent` — filterable/sortable Angular Material table; filter by stage
  - `CandidateDetailComponent` — full profile with action panels conditionally rendered by pipeline stage
  - _Requirements: 4.1, 5.1, 6.1_

- [ ] 8.4 Build Assessment Panel
  - Input field for external assessment link + Send button
  - On send: call API, update displayed stage to ASSESSMENT_SENT
  - "Mark as Completed" button unlocks BGC step; disabled if stage != ASSESSMENT_SENT
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 8.5 Write property test for assessment link pipeline transition
  - **Property 9: Sending assessment link transitions pipeline to ASSESSMENT_SENT**
  - **Validates: Requirements 4.2**

- [ ] 8.6 Build BGC Panel
  - Initiate BGC button (enabled only when assessment is COMPLETED)
  - Display current BGC status badge
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 8.7 Write property test for BGC status display and offer unlock
  - **Property 10: BGC status display matches API response**
  - **Property 11: Offer letter step is unlocked only when BGC is PASSED**
  - **Validates: Requirements 5.2, 5.3**

- [ ] 8.8 Build Offer Letter and Joining Letter Panels
  - Offer Letter: enabled only when BGC status is PASSED; call API to generate and send
  - Joining Letter: check remaining budget >= per-candidate cost; if not, show shortfall and disable send
  - On send: update pipeline stage and deduct from displayed budget
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 8.9 Write property test for joining letter budget gate
  - **Property 12: Joining letter send action respects budget availability**
  - **Validates: Requirements 6.3**

- [ ] 8.10 Build Budget Panel
  - Display allocated, spent, remaining in a Material card
  - Remaining = allocated - spent (computed client-side from API response)
  - Flag remaining as insufficient when below per-candidate cost threshold
  - _Requirements: 7.3, 7.5_

- [ ] 8.11 Write property test for budget remaining invariant
  - **Property 13: Budget remaining is always allocated minus spent**
  - **Validates: Requirements 7.3**

- [ ] 8.12 Build Allocation Panel
  - Training track dropdown (from API list) + assign button
  - Project dropdown (from API list of active projects) — disabled until training track is assigned
  - On project assign: record location from project data
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 8.13 Build Project Switch Queue
  - Table of PENDING switch requests with employee name, current project, target project
  - Approve button + Reject button (reject opens dialog for optional reason)
  - _Requirements: 10.2, 10.3, 10.4_

- [ ] 9. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement Admin feature
- [ ] 10.1 Build Admin Dashboard
  - Summary cards: total assets, assets in use, active hiring cycles
  - _Requirements: 2.3_

- [ ] 10.2 Build User Management
  - Material table with all users: name, email, role, status
  - Role change dropdown per row
  - Activate/Deactivate toggle — disabled for the currently logged-in Admin's own account
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 10.3 Build Asset Management
  - Asset inventory table with status chips (AVAILABLE, IN_USE, UNDER_MAINTENANCE)
  - Assign asset dialog: candidate picker from joined candidates queue; blocked if asset is IN_USE
  - Return asset action updates status to AVAILABLE
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 10.4 Build Budget Allocation
  - Create hiring cycle form: name, date range, total budget
  - Allocate budget to HR form: HR picker, amount
  - List of all allocations with spent/remaining per HR
  - _Requirements: 7.1, 7.2_

- [ ] 10.5 Build Location Management
  - Tree-style display: City → Office → Block
  - Add forms for each level
  - Delete blocked with employee count warning when location has active assignments
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 10.6 Build Audit Log
  - Read-only Material table in reverse chronological order
  - Filter controls: date range picker, actor search, action type dropdown
  - No edit or delete actions present in UI
  - _Requirements: 14.1, 14.2, 14.3_

- [ ] 10.7 Write property test for audit log entry rendering
  - **Property 16: Audit log entries contain all required fields**
  - **Validates: Requirements 14.1**

- [ ] 11. Final Checkpoint — Ensure all tests pass, ask the user if questions arise.
