# Software Requirements Specification
## Fitness CMS – Booking Simplification
- **Version:** v0.1  
- **Date:** 2025-11-10  
- **Owner:** Codex Automation Agent  
- **Reviewer:** TBD  
- **Status:** Draft

---

## §1 Purpose & Scope
- **Purpose:** Capture requirements for simplifying the FitPro Booking page by removing legacy toggles and the embedded QR check-in control while keeping essential filters intact.
- **In Scope:** Booking filter header, FullCalendar toolbar controls, QR check-in entry point.
- **Out of Scope:** Booking data APIs, booking detail modals, PT-specific booking flows.
- **Related Documents:** Product vision brief (TBD-01), Existing Booking SRS (TBD-02).

## §2 Terminology & References
| Term | Definition |
| --- | --- |
| Booking Calendar | Calendar view aggregating standard and PT bookings |
| QR Check-in | Flow using QR scanner to mark attendance |
| Toolbar | FullCalendar header button group |

| Reference | Description |
| --- | --- |
| PDPA | Personal Data Protection Act (SG) |
| GDPR | General Data Protection Regulation (EU) |
| PCI DSS | Payment Card Industry Data Security Standard |

- **Stakeholder Groups:** Front desk staff, PT coordinators, operations managers.
- **Goals:** Reduce clutter in booking filters while keeping primary booking management actions in place.
- **Assumptions:**  
  - Timezone = Asia/Bangkok.  
  - Currency = VND (not displayed in this change).  
  - Users access via desktop and tablet form factors.
- **Constraints:**  
  - Must retain REST integrations unchanged.  
  - UI built with React + FullCalendar; no backend changes allowed.

## §4 External Interfaces
- **UI:** Booking page in Fitness CMS vertical layout.
- **System:** FullCalendar instance reading existing booking APIs.
- **Hardware:** N/A.

## §5 Functional Requirements
### MoSCoW Prioritization
- Must: BKG-FR-001 … BKG-FR-003
- Should: None
- Could: None
- Won't: Reintroduce legacy toggles.

#### BKG-FR-001
- **Statement:** The booking filter header SHALL display only the location multi-select, status, source, keyword, and date filters without booking-type toggle checkboxes.
- **Priority:** Must
- **Acceptance Criteria:**
  - Given the booking page loads,
    When the filter header renders,
    Then no checkbox labeled `Đặt lịch theo nhóm` or `Đặt lịch PT` is present.
  - Given the screen width is ≥ 1200px,
    When the filter header renders,
    Then the remaining filters align without empty gaps larger than 24px.
- **V&V Method:** Test (DOM assertion) + Inspection (UX review)
- **Source:** G03, BR-021, BKG-UC-001
- **Assumptions/Constraints:** Layout spacing uses existing SCSS tokens; no new style sheet introduced.

#### BKG-FR-002
- **Statement:** The calendar toolbar SHALL exclude the custom button labeled “Check in”.
- **Priority:** Must
- **Acceptance Criteria:**
  - Given the booking calendar renders,
    When the header toolbar is inspected,
    Then only navigation controls and “Thêm mới” remain on the right-hand side.
  - Given developer tools search for `.fc-QrScanner-button`,
    When the toolbar is inspected,
    Then no matching element exists.
- **V&V Method:** Test (DOM query) + Inspection (manual)
- **Source:** G03, BR-022, BKG-UC-002
- **Assumptions/Constraints:** Toolbar still hosts FullCalendar “Add new booking” shortcut.

#### BKG-FR-003
- **Statement:** The page SHALL exclude any `QR Check in` buttons or inline scanner components from the booking view.
- **Priority:** Must
- **Acceptance Criteria:**
  - Given the booking page loads,
    When searching the DOM for text `QR Check in`,
    Then no matching element is rendered.
  - Given build artifacts are inspected,
    When scanning for `QRCodeCheckInScanner`,
    Then the component is not bundled into the page.
- **V&V Method:** Test (DOM query) + Analysis (bundle inspection)
- **Source:** G03, BR-023, BKG-UC-003
- **Assumptions/Constraints:** QR check-in will be accessed via dedicated modules outside this page.

## §6 Non-Functional Requirements
#### BKG-NFR-001
- **Statement:** The simplified booking header SHALL render with Largest Contentful Paint ≤ 2.5 seconds at P95 for 50 concurrent users.
- **V&V Method:** Performance Test (Lighthouse) + Monitoring (browser devtools)
- **Source:** BR-030

#### BKG-NFR-002
- **Statement:** The simplified booking layout SHALL maintain keyboard navigation order across remaining filter and toolbar controls without introducing unreachable elements.
- **V&V Method:** Test (Jest + axe) + Inspection (manual keyboard walkthrough)
- **Source:** BR-031

#### BKG-NFR-003
- **Statement:** The filter header SHALL maintain responsive wrapping with no horizontal scroll on viewports ≥ 768px.
- **V&V Method:** Test (Visual regression) + Inspection (responsive devtools)
- **Source:** BR-032

## §7 Data & Policies
### 7.1 Data Entities
- **BookingSummary:** `{ id, start_time, end_time, status }`
- **PTBooking:** `{ id, trainer_id, customer_id, status }`

### 7.2 Classification
- Operational data; PDPA/GDPR scope due to customer information.

### 7.3 Retention & Masking
- No additional data persisted; QR payloads SHALL remain client-side and not logged beyond existing audit trails.

## §8 KPIs & Business Rules
- **BKG-KPI-001:** Booking page first meaningful paint ≤ 2.0 seconds on Chrome desktop (rolling 7-day average).

## §9 APIs & Events
| ID | Endpoint | Method | Payload | Success Response | Error Handling | Auth |
| --- | --- | --- | --- | --- | --- | --- |
| BKG-API-001 | `/booking/list` | GET | Existing filters (keyword, status, source, location_ids, date range) | `[{ id, customer, trainer, status, start, end }]` | HTTP 4xx/5xx with `{ status, message }` | JWT Bearer |

## §10 Testing & Definition of Done
- **Strategy:**  
  - Unit: React Testing Library to confirm absence of removed controls including `QR Check in` references.  
  - Integration: FullCalendar toolbar snapshot ensuring no `.fc-QrScanner-button`.  
  - E2E: Cypress smoke verifying calendar navigation and add-new workflow operate normally.
- **Definition of Done:** All FR/NFR test cases pass; lint/build clean; UX review confirms spacing.

## §11 Requirements Traceability Matrix
| Requirement | Use Case | API | Test Case |
| --- | --- | --- | --- |
| BKG-FR-001 | BKG-UC-001 | BKG-API-001 | TC-BKG-001 |
| BKG-FR-002 | BKG-UC-002 | N/A | TC-BKG-002 |
| BKG-FR-003 | BKG-UC-003 | N/A | TC-BKG-003 |
| BKG-NFR-001 | BKG-UC-001 | N/A | TC-BKG-004 |
| BKG-NFR-002 | BKG-UC-003 | N/A | TC-BKG-005 |
| BKG-NFR-003 | BKG-UC-001 | BKG-API-001 | TC-BKG-006 |

## §12 Risk Register
| Risk | Probability | Impact | Mitigation |
| --- | --- | --- | --- |
| Loss of booking-type filter flexibility | Medium | Medium | Monitor feedback; consider feature toggle if demand returns |
| Users expecting inline QR check-in | Medium | Medium | Publish release note pointing to dedicated QR module |
| Keyboard navigation gap after layout change | Low | High | Run axe scan per release |

## §13 TBD Log
| ID | Description | Owner | Due |
| --- | --- | --- | --- |
| TBD-01 | Link to updated product vision or roadmap | Product Owner | 2025-11-20 |
| TBD-02 | Reference to prior Booking SRS for traceability | Business Analyst | 2025-11-20 |

## §14 Change History
| Version | Date | Description | Author |
| --- | --- | --- | --- |
| v0.1 | 2025-11-10 | Khởi tạo tài liệu sơ bộ | Codex Automation Agent |

## §15 Appendix
- Placeholders for updated toolbar screenshot, spacing diagram, and navigation decision table (TBD).

