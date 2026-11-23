# AgeWell AI — local simulation prototype

A local-only React + TypeScript prototype for the AgeWell AI institutional business proposal. It is designed for an academic demonstration and uses synthetic data only.

## 1. Create the Vite project

Choose **React + TypeScript** when creating the Vite app. Do not select the React Compiler template for this project; it is not needed for the prototype.

If you have not created the app yet:

```bash
yarn create vite agewell-ai --template react-ts
cd agewell-ai
```

## 2. Install dependencies

From the root of your Vite project:

```bash
yarn add @mantine/core @mantine/hooks @mantine/notifications @tabler/icons-react recharts
```

The app uses Mantine for the component system and Recharts for the visualisations. Tailwind is not required.

## 3. Copy the source files

Copy the `src` folder in this bundle into your Vite project, replacing the starter `src` folder:

```text
src/
  App.tsx
  main.tsx
  styles.css
  types.ts
  data/
    demoData.ts
  engine/
    financial.ts
    medication.ts
```

Keep the Vite-generated `index.html`, `vite.config.ts`, `tsconfig*.json` and `package.json`. The standard React + TypeScript Vite template already has the required entry point configuration.

## 4. Run it

```bash
yarn dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## What is implemented

- Institutional overview dashboard and operational KPIs.
- Role selector: manager, caregiver, healthcare professional and family.
- Resident directory and simulated family-sharing permission switches.
- Medication task list, simulated clock, overdue detection and event recording.
- Health readings, review flags, synthetic reading generation and review notes.
- Cantonese, Mandarin and English text reminder previews (no speech synthesis or audio playback).
- Family portal filtered by the local family-sharing permission flag.
- Audit log.
- Five-year financial model with acquisition, servicing and pricing controls.
- Resettable demonstration data; no backend, database, network calls or real health records.

## Demo walkthrough

1. Start in Manager view on the Overview page.
2. Open Medication management and note the two 09:00 tasks.
3. Advance the simulated time by 15 minutes. Pending tasks reach the overdue state at the 10-minute grace boundary.
4. Record one event as Administered and another as Declined. The audit trail updates.
5. Open Health monitoring and review a flagged synthetic reading.
6. Open Residents and toggle family sharing for a resident; then switch to Family view to see the portal filter.
7. Return to Manager view and open Business simulation. Restore the base assumptions, then change acquisition or servicing costs to demonstrate scenario sensitivity.
8. Use the reset icon to restore the full initial demo state.

## Important limitations

- All people and measurements are fictional.
- Thresholds are illustrative software-demo rules, not clinical reference ranges or medical advice.
- The software does not diagnose, prescribe, change medication or make emergency decisions.
- “Administered” means a staff member recorded that event; it is not proof that medication was swallowed.
- The family permission switch is a UI demonstration, not production-grade consent, authentication or authorisation.
- State is in memory and resets on page refresh. There is no backend or database.
- The downside preset uses 25% fewer acquisitions and 20% higher direct servicing costs as a quantified demonstration assumption. The proposal describes higher servicing costs but does not specify the percentage. The upside preset uses 25% more acquisitions as an illustrative assumption, not a figure stated in the proposal.

## Financial model notes

The base forecast uses the proposal's assumptions:

- 8, 12, 20, 25 and 30 new institutions in 2027–2031.
- HK$1,500 monthly site fee and HK$60 monthly fee per active resident.
- 75 residents per typical institution.
- HK$20,000 implementation revenue and HK$15,000 hardware revenue per new institution.
- HK$10,000 hardware cost per new institution and HK$15,000 annual servicing/hosting cost per average active institution.
- The proposal's operating expense and capital expenditure schedules.
- HK$9 million initial funding at the start of 2027.

The app derives average active institutions as the midpoint of the opening and year-end customer counts, matching the proposal's base-case table. Operating profit is before depreciation, interest and tax. The simplified cash calculation excludes working-capital movement, financing costs, taxes, depreciation and further fundraising, as in the proposal.
