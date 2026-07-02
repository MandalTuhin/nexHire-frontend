# Requirements Document

## Introduction

nexHire is an Angular-based frontend for a HR management system designed to replace manual Excel-based HR workflows at TCS ILP. The platform serves three roles — Candidate, HR, and Admin — and covers the full hiring lifecycle: job application, assessment, background verification, offer and joining letters, budget control, asset assignment, training allocation, project allocation, and project switching. The backend is a Spring Boot monolith with REST APIs. This document captures the frontend requirements only.

## Glossary

- **Candidate**: A person who has applied for a job and is progressing through the hiring pipeline.
- **Employee**: A candidate who has accepted an offer and joined the organization. In this system, an employee is still a "user" with the Candidate role but with an active employment status.
- **HR**: Human Resources personnel who manage candidates, budgets, offers, and allocations.
- **Admin**: System administrator who manages assets, budgets, roles, and system-level configuration.
- **Hiring Cycle**: A defined period during which HR recruits a batch of candidates under a fixed budget.
- **BGC**: Background Check — performed by a third-party service. The system tracks its status.
- **Offer Letter**: A formal document sent to a candidate after BGC passes, indicating a conditional job offer.
- **Joining Letter**: A formal document sent to a candidate after budget approval, confirming their start date.
- **Assessment**: An external evaluation (e.g., a test on a third-party platform) whose link is sent to the candidate through the system.
- **Asset**: Physical or digital equipment assigned to a new joiner (e.g., laptop, ID card, access credentials).
- **Training Track**: A predefined training program or curriculum assigned to a new joiner.
- **Project**: A work engagement to which an employee is allocated.
- **Location**: A hierarchical address comprising City → Office → Block.
- **Angular Material**: The UI component library used for all UI elements.
- **JWT**: JSON Web Token used for session authentication.
- **Role-Based Access Control (RBAC)**: A security model where UI features and routes are shown or hidden based on the user's role.

---

## Requirements

### Requirement 1 — Authentication and Session Management

**User Story:** As any user (Candidate, HR, Admin), I want to log in securely and have my session managed, so that I can access only the features relevant to my role.

#### Acceptance Criteria

1. WHEN a user submits valid credentials, THE Authentication Module SHALL authenticate the user and store the JWT token in session storage.
2. WHEN a user submits invalid credentials, THE Authentication Module SHALL display a clear error message without revealing which field (username or password) is incorrect.
3. WHEN a JWT token expires, THE Authentication Module SHALL redirect the user to the login page and clear session storage.
4. WHEN a logged-in user navigates to a route not permitted for their role, THE Router Guard SHALL redirect the user to their role-appropriate dashboard.
5. WHEN a user clicks logout, THE Authentication Module SHALL clear the session token and redirect to the login page.

---

### Requirement 2 — Role-Based Dashboard

**User Story:** As any user, I want to see a dashboard tailored to my role when I log in, so that I can quickly access the actions most relevant to me.

#### Acceptance Criteria

1. WHEN a Candidate logs in, THE Dashboard Module SHALL display the candidate's current pipeline stage, pending actions (e.g., complete assessment), and status of BGC.
2. WHEN an HR logs in, THE Dashboard Module SHALL display a summary of active candidates per pipeline stage, pending actions (e.g., candidates awaiting offer), and current budget utilization.
3. WHEN an Admin logs in, THE Dashboard Module SHALL display system-level summaries including asset inventory counts and active hiring cycles.
4. WHILE a user is logged in, THE Navigation Module SHALL display only menu items and actions permitted for that user's role.

---

### Requirement 3 — Candidate Application and Pipeline

**User Story:** As a Candidate, I want to apply for the single available job posting and track my progress through the hiring pipeline, so that I know where I stand at each step.

#### Acceptance Criteria

1. WHEN a Candidate visits the job listing page, THE Job Module SHALL display the single available job posting with its title, description, and requirements.
2. WHEN a Candidate submits an application, THE Application Module SHALL capture personal details, resume upload, and submit the application to the backend.
3. WHEN a Candidate has already applied, THE Application Module SHALL display the current pipeline status instead of the application form.
4. WHEN a Candidate's application status changes (e.g., assessment sent, BGC initiated), THE Pipeline Status Module SHALL reflect the updated status without requiring a page reload.
5. IF a Candidate attempts to apply more than once for the same job, THEN THE Application Module SHALL prevent the submission and display an informative message.

---

### Requirement 4 — Assessment Management

**User Story:** As an HR, I want to send assessment links to candidates and track completion, so that I can evaluate candidates before proceeding to BGC.

#### Acceptance Criteria

1. WHEN an HR selects a candidate in the "Applied" stage, THE Assessment Module SHALL allow the HR to input and send an external assessment link to the candidate.
2. WHEN an HR sends an assessment link, THE Assessment Module SHALL update the candidate's pipeline status to "Assessment Sent" and record a timestamp.
3. WHEN a Candidate logs in after an assessment link is sent, THE Candidate Dashboard SHALL display the assessment link with clear instructions to complete it on the external platform.
4. WHEN an HR marks an assessment as completed for a candidate, THE Assessment Module SHALL update the pipeline status to "Assessment Completed" and unlock the BGC initiation step.
5. IF an HR attempts to initiate BGC before marking assessment as completed, THEN THE Assessment Module SHALL prevent the action and display a guidance message.

---

### Requirement 5 — Background Check (BGC) Tracking

**User Story:** As an HR, I want to initiate and track the BGC status for candidates, so that I can proceed with offers only for verified candidates.

#### Acceptance Criteria

1. WHEN an HR initiates BGC for a candidate, THE BGC Module SHALL send the request to the backend and update the candidate's pipeline status to "BGC In Progress".
2. WHEN the third-party BGC service updates a candidate's result, THE BGC Module SHALL display the updated status (In Progress, Passed, Failed) on both the HR view and the Candidate dashboard.
3. WHEN a BGC result is "Passed", THE BGC Module SHALL unlock the offer letter step for that candidate in the HR interface.
4. WHEN a BGC result is "Failed", THE BGC Module SHALL display the failed status and prevent progression to the offer stage.
5. WHILE a BGC is in progress, THE BGC Module SHALL display a clear "Pending" indicator to both the candidate and HR.

---

### Requirement 6 — Offer and Joining Letter

**User Story:** As an HR, I want to send offer and joining letters to candidates at the appropriate pipeline stages, so that candidates receive timely, formal communication.

#### Acceptance Criteria

1. WHEN a candidate's BGC status is "Passed", THE Offer Module SHALL enable the HR to generate and send an offer letter for that candidate.
2. WHEN an HR sends an offer letter, THE Offer Module SHALL update the candidate's pipeline status to "Offer Sent" and record the timestamp.
3. WHEN an HR wishes to send a joining letter, THE Budget Module SHALL check available budget against the cost of adding this candidate to the batch before enabling the send action.
4. IF the available budget is insufficient for the current batch size, THEN THE Budget Module SHALL display the budget shortfall amount and prevent sending the joining letter.
5. WHEN a joining letter is sent, THE Offer Module SHALL deduct the candidate's cost from the HR's available hiring budget and update the pipeline status to "Joining Letter Sent".
6. WHEN a Candidate receives an offer or joining letter, THE Candidate Dashboard SHALL display the letter with an option to download it.

---

### Requirement 7 — Budget Management

**User Story:** As an Admin, I want to allocate hiring budgets to HRs per hiring cycle, so that hiring spend is controlled and visible.

#### Acceptance Criteria

1. WHEN an Admin creates a new hiring cycle, THE Budget Module SHALL allow the Admin to set a total budget amount, cycle name, and date range.
2. WHEN an Admin allocates budget to an HR, THE Budget Module SHALL record the allocation and make it available for that HR to spend.
3. WHEN an HR views the budget panel, THE Budget Module SHALL display the total allocated budget, amount spent, and remaining balance in real time.
4. WHEN a joining letter is sent by an HR, THE Budget Module SHALL automatically reduce the HR's remaining budget by the predefined per-candidate cost.
5. IF an HR's remaining budget drops below the per-candidate cost, THEN THE Budget Module SHALL visually flag the budget as insufficient before attempting any send action.

---

### Requirement 8 — Asset Assignment

**User Story:** As an Admin, I want to assign assets to new joiners, so that employees have the equipment they need from day one.

#### Acceptance Criteria

1. WHEN a joining letter has been sent to a candidate, THE Asset Module SHALL allow the Admin to view that candidate in the asset assignment queue.
2. WHEN an Admin assigns an asset to a candidate, THE Asset Module SHALL record the asset type, asset ID, and assignment timestamp, and mark the asset as "In Use".
3. WHEN an Admin views asset inventory, THE Asset Module SHALL display all assets with their current status (Available, In Use, Under Maintenance).
4. IF an Admin attempts to assign an asset already marked "In Use", THEN THE Asset Module SHALL prevent the assignment and display the current assignee's name.
5. WHEN an employee leaves or switches projects, THE Asset Module SHALL allow the Admin to mark the asset as returned and update its status to "Available".

---

### Requirement 9 — Training and Project Allocation

**User Story:** As an HR, I want to assign a training track and a project to a new joiner, so that the employee is onboarded into the right team and program.

#### Acceptance Criteria

1. WHEN an HR opens a confirmed joiner's profile, THE Allocation Module SHALL allow the HR to select and assign a training track from a predefined list.
2. WHEN an HR assigns a training track, THE Allocation Module SHALL update the employee's profile with the track name and start date.
3. WHEN an HR opens a confirmed joiner's profile after training assignment, THE Allocation Module SHALL allow the HR to assign the employee to a project from a list of active projects.
4. WHEN an HR assigns a project, THE Allocation Module SHALL record the project name, team, and location (city, office, block) and update the employee's profile.
5. IF an HR attempts to assign a project before a training track is assigned, THEN THE Allocation Module SHALL display a warning and require training assignment first.

---

### Requirement 10 — Project Switch Request

**User Story:** As an Employee, I want to request a project switch, and as an HR, I want to review and action that request, so that project mobility is handled formally and transparently.

#### Acceptance Criteria

1. WHEN an Employee submits a project switch request, THE Project Switch Module SHALL capture the target project, reason, and submission timestamp.
2. WHEN an HR views pending project switch requests, THE Project Switch Module SHALL display all pending requests with employee details and requested project.
3. WHEN an HR approves a project switch request, THE Project Switch Module SHALL update the employee's current project and log the change with a timestamp.
4. WHEN an HR rejects a project switch request, THE Project Switch Module SHALL record the rejection with an optional reason and notify the employee via a status update on their dashboard.
5. WHILE a project switch request is pending, THE Project Switch Module SHALL prevent the employee from submitting another request for the same employee.

---

### Requirement 11 — Location Management

**User Story:** As an Admin, I want to manage the location hierarchy (City → Office → Block), so that accurate location data is available for allocations.

#### Acceptance Criteria

1. WHEN an Admin navigates to location management, THE Location Module SHALL display all existing cities, offices within each city, and blocks within each office.
2. WHEN an Admin adds a new city, office, or block, THE Location Module SHALL persist the entry and make it immediately available in allocation dropdowns.
3. IF an Admin attempts to delete a location that has active employee assignments, THEN THE Location Module SHALL prevent deletion and display a count of affected employees.

---

### Requirement 12 — User and Role Management

**User Story:** As an Admin, I want to manage user accounts and their roles, so that access is controlled and appropriate.

#### Acceptance Criteria

1. WHEN an Admin views the user list, THE User Management Module SHALL display all users with their name, email, current role, and account status (Active/Inactive).
2. WHEN an Admin changes a user's role, THE User Management Module SHALL update the role immediately and reflect the change on the user's next login.
3. WHEN an Admin deactivates a user account, THE User Management Module SHALL prevent that user from logging in while preserving their data.
4. IF an Admin attempts to deactivate their own account, THEN THE User Management Module SHALL prevent the action and display a warning message.

---

### Requirement 13 — Notifications and Activity Feed

**User Story:** As any user, I want to receive in-app notifications for actions relevant to me, so that I am informed of status changes without checking manually.

#### Acceptance Criteria

1. WHEN a status change occurs relevant to a user (e.g., assessment sent, BGC result updated, offer letter issued), THE Notification Module SHALL display an in-app notification to that user.
2. WHEN a user views the notification panel, THE Notification Module SHALL list notifications with a timestamp and mark them as read when viewed.
3. WHILE unread notifications exist, THE Navigation Module SHALL display a badge count on the notification icon.

---

### Requirement 14 — Audit Log

**User Story:** As an Admin, I want to view a log of all significant actions taken in the system, so that I have a reliable audit trail for accountability and troubleshooting.

#### Acceptance Criteria

1. WHEN any significant action is performed (e.g., role change, offer sent, asset assigned, budget allocated, BGC status updated), THE Audit Module SHALL record the action with the actor's identity, action type, affected entity, and timestamp.
2. WHEN an Admin views the audit log, THE Audit Module SHALL display entries in reverse chronological order with filters for date range, actor, and action type.
3. THE Audit Module SHALL display audit log entries as read-only and prevent any modification or deletion of log entries through the UI.
