# CampusCart Midterm Bug Lab

Deliberately buggy web app for SQA midterm activities:

1. Test case design (EP, BVA, decision table, state transition)
2. Bug reporting
3. Blackbox testing
4. Whitebox testing

Tech stack:

- React + TypeScript (Vite)
- Zustand with localStorage persistence
- Tailwind CSS

## Run Locally

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Student-Facing Documents

- docs/requirements.md
- docs/testcases-blackbox-template.md
- docs/testcases-whitebox-guide.md
- docs/bug-report-template.md
- docs/traceability-matrix-template.md

## Instructor-Only

- docs/bug-key.private.md

Keep this file private from students when needed.

## Notes on Persistence

1. App data persists via localStorage and survives refreshes.
2. Data is unique per browser profile and origin.
3. Device ID is generated and shown in the header for environment tracking.
