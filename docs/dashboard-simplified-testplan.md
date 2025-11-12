# Test Plan – Fitness CMS Dashboard Simplification
- **Module:** Dashboard Landing Metrics  
- **Author:** Codex Automation Agent  
- **Date:** 2025-11-10  
- **Test Owner:** Frontend QA  
- **Tools:** Jest, React Testing Library, Cypress (future E2E, TBD)

## 1. Test Scope & Objectives
- Validate rendering of four primary metric cards.
- Confirm data formatting and graceful handling of loading/error states.
- Ensure responsive layout behavior across breakpoints.
- Guard against regression of removed AI/analytics components.

## 2. Test Environment
- Node 18.x, Vite dev server.
- Mock dashboard service using MSW or Jest manual mocks.
- Browser matrix: Chrome (latest), Safari (latest).
- Timezone forced to Asia/Bangkok during tests.

## 3. Test Cases

| ID | Type | Precondition | Steps (Given/When/Then) | Expected Result |
| --- | --- | --- | --- | --- |
| TC-001 | Unit | Mock API returns metrics `{ revenue: { current: 1250000 }, member: { current: { total: 450 } }, package: { current: 32 } }` | Given the dashboard mounts,<br/>When the API resolves successfully,<br/>Then the four cards render labels `Tổng doanh số`, `Tổng cộng thành viên`, `Khách hàng mới`, `Gói tập` with respective values | Cards display `1,250,000 VND`, `450`, `0`, `32`; snapshot matches |
| TC-002 | Unit | Mock API returns `{ member: { current: { new: 12 } } }` with other fields null | Given the dashboard mounts,<br/>When optional fields are missing,<br/>Then the component renders zero defaults without crashing | UI shows `0 VND`, `0`, `12`, `0`; console errors absent |
| TC-003 | Unit | Mock API rejects with error | Given the dashboard mounts,<br/>When the API request fails,<br/>Then an alert banner displays `Không thể tải dữ liệu.` | Error alert visible; cards show fallback zeros |
| TC-004 | Integration | Viewport width 1280px | Given the viewport ≥ 1200px,<br/>When the dashboard loads,<br/>Then four cards align in a single row | CSS classes `col-xl-3` ensure four columns |
| TC-005 | Integration | Viewport width 992px | Given the viewport between 768px and 1199px,<br/>When the dashboard loads,<br/>Then cards wrap into two rows with two columns each | DOM layout verified by computed style |
| TC-006 | Integration | Axe accessibility scan | Given the dashboard rendered,<br/>When running axe,<br/>Then no WCAG 2.1 AA color contrast violations occur | Axe returns zero violations |

## 4. Test Data
- Mock payload fixtures stored under `src/tests/fixtures/dashboardMetrics.json` (TBD).
- Currency formatting validated with VND values using integers.

## 5. Regression Checklist
- No references to removed AI/analytics components remain.
- `dashboardService.getListDataStatistic` still invoked once.
- No unused imports in `Dashboard/index.jsx`.

## 6. Coverage & Reporting
- Aim for ≥ 80% statement coverage on `Dashboard/index.jsx`.
- Integrate tests into existing `npm test` workflow; add coverage flag `--coverage`.
- Record results in CI dashboard; include screenshots for responsive checks (TBD).

## 7. Risks & Mitigations
- **Risk:** External API schema drift → **Mitigation:** Contract test stub updates.
- **Risk:** Localization conflicts with fixed Vietnamese labels → **Mitigation:** Document requirement and add snapshot assertions.

## 8. Exit Criteria
- All test cases executed and passed.
- No high/critical defects open.
- Coverage threshold met; lint passes.

