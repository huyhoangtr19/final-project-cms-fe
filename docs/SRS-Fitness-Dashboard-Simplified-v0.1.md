# Software Requirements Specification
## Fitness CMS – Dashboard Simplification
- **Version:** v0.1  
- **Date:** 2025-11-10  
- **Owner:** Codex Automation Agent  
- **Reviewer:** TBD  
- **Status:** Draft

---

## §1 Purpose & Scope
- **Purpose:** Document functional and non-functional requirements for simplifying the Fitness CMS Dashboard to four primary business metrics.  
- **In Scope:** UI/UX of dashboard landing view, data retrieval for 4 metrics, responsive layout behavior.  
- **Out of Scope:** Historical analytics, AI predictions, exports, staff KPI deep dives.  
- **Related Documents:** Product vision (TBD-01).  

## §2 Terminology & References
| Term | Definition |
| --- | --- |
| Dashboard | Landing page within Fitness CMS showing operator KPIs |
| Metric Card | UI element presenting a single KPI value with label |
| PT Package | Paid personal training package |
| New Customer | Customer created within selected reporting window |

| Reference | Description |
| --- | --- |
| PDPA | Personal Data Protection Act (SG) |
| GDPR | General Data Protection Regulation (EU) |
| PCI DSS | Payment Card Industry Data Security Standard |

## §3 Stakeholders & Context
- **Stakeholder Groups:**  
  - Business Owners (require quick revenue snapshot)  
  - Operations Managers (monitor member counts)  
  - CS Leads (track new customers)  
  - PT Coordinators (review package sales)
- **Business Goals:** Provide immediate visibility of daily operational KPIs.
- **Assumptions:**  
  - Timezone = Asia/Bangkok.  
  - Currency = VND.  
  - Data source uses latest closed business day unless otherwise specified.
- **Constraints:**  
  - Rate limit: UI SHALL not issue more than 4 API calls on initial render.  
  - Frontend stack fixed to React + Vite + SCSS.

## §4 External Interfaces
- **UI:** Responsive dashboard page rendered in existing layout shell.  
- **System:** Backend dashboard statistics API (`/dashboard/statistics`).  
- **Hardware:** N/A.

## §5 Functional Requirements
### MoSCoW Prioritization
- Must: REV-FR-001 … REV-FR-004  
- Should: None  
- Could: None  
- Won't: Legacy analytics widgets.

#### REV-FR-001
- **Statement:** The dashboard SHALL display the metric card labeled "Tổng doanh số" showing the current reporting period revenue in VND.
- **Priority:** Must
- **Acceptance Criteria:**
  - Given valid revenue data exists,
    When the dashboard loads,
    Then the card renders currency formatted revenue with thousands separators and VND suffix.
  - Given the API returns zero,
    When the card renders,
    Then the value displays `0 VND`.
- **V&V Method:** Test (Frontend component test) + Analysis (API contract review)
- **Source:** G01, BR-001, REV-UC-001
- **Assumptions/Constraints:** Rounding half-up 0 decimals; data freshness ≤ 15 minutes.

#### REV-FR-002
- **Statement:** The dashboard SHALL display the metric card labeled "Tổng cộng thành viên" showing the current total member count.
- **Priority:** Must
- **Acceptance Criteria:**
  - Given member totals in the API response,
    When the dashboard loads,
    Then the card renders the integer count with thousand separators.
  - Given member totals are null,
    When the dashboard loads,
    Then the card renders `0`.
- **V&V Method:** Test (Component snapshot & logic) + Inspection (UX review)
- **Source:** G01, BR-002, REV-UC-001
- **Assumptions/Constraints:** Count SHALL be non-negative integer.

#### REV-FR-003
- **Statement:** The dashboard SHALL display the metric card labeled "Khách hàng mới" showing the count of new customers in the reporting period.
- **Priority:** Must
- **Acceptance Criteria:**
  - Given new customer data arrives,
    When the dashboard loads,
    Then the card renders the integer count.
  - Given no new customers,
    When the dashboard loads,
    Then the card renders `0`.
- **V&V Method:** Test (Component logic) + Analysis (API)
- **Source:** G01, BR-003, REV-UC-001
- **Assumptions/Constraints:** Definition of "new" aligned with backend (TBD-02).

#### REV-FR-004
- **Statement:** The dashboard SHALL display the metric card labeled "Gói tập" showing the count of active PT packages sold in the reporting period.
- **Priority:** Must
- **Acceptance Criteria:**
  - Given package data exists,
    When the dashboard loads,
    Then the card renders the integer count.
  - Given no package sales,
    When the dashboard loads,
    Then the card renders `0`.
- **V&V Method:** Test (Component logic) + Analysis (API)
- **Source:** G01, BR-004, REV-UC-001
- **Assumptions/Constraints:** Count excludes cancelled packages.

## §6 Non-Functional Requirements
#### REV-NFR-001
- **Statement:** The dashboard cards SHALL render with Largest Contentful Paint ≤ 2.0 seconds on P95 for broadband users at 100 RPS backend load.
- **V&V Method:** Performance Test (Lighthouse) + Monitoring (APM)
- **Source:** BR-010

#### REV-NFR-002
- **Statement:** The simplified dashboard SHALL achieve WCAG 2.1 AA contrast ratios for card text on existing branding colors.
- **V&V Method:** Inspection (Axe, manual review)
- **Source:** BR-011

#### REV-NFR-003
- **Statement:** The dashboard SHALL maintain layout responsiveness with four cards displaying in a single row ≥1200px width, two rows between 768–1199px, and single column <768px.
- **V&V Method:** Demonstration (Responsive testing) + Test (Jest DOM query)
- **Source:** BR-012

## §7 Data & Policies
### 7.1 Data Entities
- **RevenueSummary:** `{ amount_vnd: number, updated_at: ISO8601 }`
- **MemberSummary:** `{ total: number, new_members: number }`
- **PackageSummary:** `{ total_packages: number }`

### 7.2 Classification
- Operational data, sensitivity: Internal (PDPA compliant). No PCI data surfaced.

### 7.3 Retention & Masking
- Data stored per backend policy (not persisted on frontend). API responses SHALL avoid PII beyond aggregated counts.

## §8 KPIs & Business Rules
- **REV-KPI-001:** Daily revenue snapshot = Σ confirmed sales in VND for current day; report 2 decimal rounding half-up.

## §9 APIs & Events
| ID | Endpoint | Method | Payload | Success Response | Error Handling | Auth |
| --- | --- | --- | --- | --- | --- | --- |
| REV-API-001 | `/dashboard/statistics` | GET | `?location_id` (optional) | `{ revenue: { current, previous }, member: { current: { total, new } }, package: { current } }` | HTTP 4xx/5xx with `{ status, message }` | JWT Bearer |

## §10 Testing & Definition of Done
- **Strategy:**  
  - Unit: React component tests with Jest + React Testing Library for card rendering and API adaptation.  
  - Integration: Mock service ensuring API schema compatibility.  
  - E2E: Cypress scenario verifying four cards on load (TBD).  
- **Acceptance Criteria:** All FR/NFR tests passing; no lint errors; Lighthouse performance check meeting REV-NFR-001.

## §11 Requirements Traceability Matrix
| Requirement | Use Case | API | Test Case |
| --- | --- | --- | --- |
| REV-FR-001 | REV-UC-001 | REV-API-001 | TC-001 |
| REV-FR-002 | REV-UC-001 | REV-API-001 | TC-002 |
| REV-FR-003 | REV-UC-001 | REV-API-001 | TC-003 |
| REV-FR-004 | REV-UC-001 | REV-API-001 | TC-004 |
| REV-NFR-001 | REV-UC-001 | N/A | TC-005 |
| REV-NFR-002 | REV-UC-001 | N/A | TC-006 |
| REV-NFR-003 | REV-UC-001 | N/A | TC-007 |

## §12 Risk Register
| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| API payload missing required fields | Medium | High | Add defensive defaults and monitor logs |
| Legacy components still imported | Medium | Medium | Code review & lint check |
| Accessibility regression due to color contrast | Low | Medium | Run automated axe tests |

## §13 TBD Log
| ID | Description | Owner | Due |
| --- | --- | --- | --- |
| TBD-01 | Confirm product vision reference document link | Product Owner | 2025-11-20 |
| TBD-02 | Define “new customer” window (daily vs monthly) | Analytics Lead | 2025-11-20 |

## §14 Change History
| Version | Date | Description | Author |
| --- | --- | --- | --- |
| v0.1 | 2025-11-10 | Khởi tạo tài liệu sơ bộ | Codex Automation Agent |

## §15 Appendix
- Placeholder for architecture diagram, responsive layout wireframe, and decision tables (TBD).

