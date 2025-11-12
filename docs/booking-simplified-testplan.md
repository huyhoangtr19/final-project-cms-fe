# Test Plan – Fitness CMS Booking Simplification
- **Module:** Booking Calendar  
- **Author:** Codex Automation Agent  
- **Date:** 2025-11-10  
- **Scope:** Removal of booking-type checkboxes, removal of legacy “Check in” toolbar button, removal of embedded `QR Check in` control.
- **Tools:** Jest, React Testing Library, Cypress (planned), axe-core.

## 1. Test Objectives
- Validate that booking filters render without legacy checkboxes while retaining spacing.
- Confirm the calendar toolbar no longer includes the `Check in` button, yet still shows `Thêm mới`.
- Verify no `QR Check in` button or scanner remnants remain on the page.
- Guard against regression in responsive layout across breakpoints.

## 2. Environment
- Node 18.x, Vite dev server.
- Browsers: Chrome latest (desktop), Safari latest (tablet emulation).
- Timezone forced to Asia/Bangkok during automated tests.

## 3. Test Cases

| ID | Type | Preconditions | Steps (Given/When/Then) | Expected Result |
| --- | --- | --- | --- | --- |
| TC-BKG-001 | Unit | Render booking page with mock data | Given the booking page mounts,<br/>When querying for labels `Đặt lịch theo nhóm` or `Đặt lịch PT`,<br/>Then the query returns no elements | Removed checkboxes absent |
| TC-BKG-002 | Unit | Render fullcalendar toolbar | Given custom buttons render,<br/>When querying for `.fc-QrScanner-button`,<br/>Then the selector matches zero elements | Legacy toolbar button removed |
| TC-BKG-003 | Unit | Render booking page with mock data | Given the booking page mounts,<br/>When searching for text `QR Check in` or component `QRCodeCheckInScanner`,<br/>Then no matching nodes are returned | QR control removed |
| TC-BKG-004 | Integration | Viewport ≥ 1200px | Given filters render on wide screens,<br/>When measuring horizontal spacing,<br/>Then no gap exceeds 24px and layout stays aligned | Layout spacing consistent |
| TC-BKG-005 | Integration | Viewport 768–1023px | Given responsive layout,<br/>When the filters wrap,<br/>Then no horizontal scrollbar appears | Responsive layout intact |
| TC-BKG-006 | Accessibility | axe-core scan on booking page | Given filter and toolbar controls render,<br/>When running axe,<br/>Then no critical WCAG 2.1 AA violations exist | Layout remains accessible |

## 4. Test Data
- Fixtures mimic combined booking/PT lists (`fixtures/bookings.json`, TBD).
- Use MSW to stub booking APIs where needed.

## 5. Regression Checklist
- `Add new booking` button remains accessible.
- Calendar navigation buttons still highlight active view.
- Lint/build output remains free of unused QR scanner artifacts.

## 6. Coverage & Reporting
- Target ≥ 80% statement coverage on `src/pages/Booking/index.jsx`.
- Include tests in `npm test -- --coverage`; integrate Cypress E2E smoke for toolbar and filter navigation.

## 7. Risks & Mitigation
- **Risk:** Legacy QR artifacts remain in bundle → **Mitigation:** Add static analysis to ensure component import absent.
- **Risk:** Responsive assertions brittle across breakpoints → **Mitigation:** Use Storybook or Percy in future iteration.

## 8. Exit Criteria
- All test cases executed with pass status.
- Build and lint succeed.
- UX approval obtained for updated layout.

