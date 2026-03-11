# SKTaxi Docs Index

Use this file as the entry point when a task depends on local documents for implementation.

## How To Read These Docs

- Start from the narrowest document that matches the task.
- Use broader documents for context, not for exact screen or API behavior when a more specific document exists.
- Treat `open-questions`, `plan`, `analysis`, and `report` documents as non-final unless the task explicitly asks to implement a proposal.
- If code must win because a document is stale, update the document in the same change.

## Document Groups

- Product and architecture:
  - `project-overview.md`
- UI redesign:
  - `ui-redesign/README.md`
  - `ui-redesign/ui-foundations.md`
  - `ui-redesign/ui-states-and-interactions.md`
  - `ui-redesign/ui-navigation-and-ia.md`
  - `ui-redesign/ui-component-spec.md`
  - `ui-redesign/ui-screen-templates.md`
  - `ui-redesign/ui-content-rules.md`
  - `ui-redesign/implementation-roadmap.md`
  - `ui-redesign/open-questions.md`
- Backend and API:
  - `SKTaxi-backend-spec.md`
- Firebase migration:
  - `firebase-v22-README.md`
  - `firebase-v22-summary.md`
  - `firebase-v22-quick-reference.md`
  - `firebase-v22-migration-plan.md`
  - `firebase-v22-file-by-file-guide.md`
- Screen-specific refactors:
  - `ChatDetailScreen-Refactor-Storyboard.md`
- Admin and operations:
  - `manage-app-notices-guide.md`
  - `admin-web-storyboard.md`
- Build and testing:
  - `android-build-guide.md`
  - `android-testing-checklist.md`
- Legal and policy:
  - `이용약관.md`
  - `개인정보처리방침.md`
  - `법적-리스크-분석-보고서.md`

## Priority Rules

- Screen, storyboard, and component-spec documents override broad roadmap or overview documents.
- Feature and migration guides override the general project overview for exact implementation details.
- Newer dated documents override older snapshots for the same scope.
- Roadmaps and checklists define sequence and exit criteria, not exact UI or API truth.
