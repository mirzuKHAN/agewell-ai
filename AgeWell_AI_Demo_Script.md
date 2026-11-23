# AgeWell AI — live demonstration guide

Suggested duration: 6–8 minutes. The application is a local academic prototype using fictional people and synthetic measurements only.

## Before the presentation

1. Start the application with `yarn dev` and open the local Vite URL.
2. Click the circular reset icon near the role selector. This returns the demo clock to 08:55, restores the sample records and switches to Manager view.
3. Keep the browser window large enough to show the full sidebar and dashboard.
4. Do not refresh the page during the walkthrough: the simulation state is held in memory and a refresh restores the initial data.

## Demo order and presenter talk track

### 1. Introduce the product — Overview (about 45 seconds)

**Show:** Overview page, Manager view.

**Say:**

> AgeWell AI is our proposed B2B software platform for elderly-care organisations in Hong Kong. The aim is to make medication workflows easier to coordinate and audit, bring selected health measurements into one review workflow, and provide appropriate updates to authorised family members. The system is intended to support professional care, not replace clinical judgement.
>
> This is a local academic prototype. All residents and readings are synthetic, and there is no live medical-device or eHealth connection.

Point out the KPI cards: active residents, medication tasks due, overdue tasks and open review alerts.

If the overview shows 13% documentation completeness, explain that this is the current administered-event count divided by the eight medication events in this small demo dataset. The seven-day bar chart below it is a separate illustrative dataset; it is not a measured outcome from a real institution.

### 2. Demonstrate the medication workflow — Medication (about 2 minutes)

**Show:** Click Medication in the sidebar.

**Say:**

> Medication management is the MVP's centre of gravity. Authorised staff set up and verify schedules. The platform creates task lists, allows staff to record an outcome, identifies overdue items and maintains an audit history. It does not prescribe or change dosages.

The reset clock starts at 08:55. Two events are scheduled for 09:00. Use the top-bar `+15 min` control once. The clock moves to 09:10, which is the configured 10-minute grace boundary, and the two still-pending 09:00 tasks become overdue.

Select one pending task and record an outcome such as **Administered**. Explain that this means a staff member recorded administration; it is not proof that the resident swallowed the medication. You may also record **Declined**, **Withheld**, **Missed** or **Not confirmed** where appropriate. These are workflow records, not clinical instructions.

For a repeatable live demo, avoid changing every task. One successful status change is enough to show the interaction and audit trail.

### 3. Demonstrate monitoring and human review — Health monitoring (about 1 minute)

**Show:** Click Health monitoring.

**Say:**

> The prototype can receive selected readings from a compatible device, preserve the source and timestamp, and flag values that meet the institution's configured review rules. The alert asks an authorised person to review the information; it is not a diagnosis or an automatic emergency decision.

Point to the systolic and heart-rate examples in the review queue. Select one, review the reading, optionally enter a short follow-up note, and mark it reviewed. Mention that the numeric thresholds in this prototype are illustrative software-demo settings only, not clinical reference ranges.

### 4. Demonstrate resident and family access — Residents / Family portal (about 1 minute)

**Show:** Switch to Manager view if necessary, then click Residents.

**Say:**

> Each profile has a demonstration family-sharing permission. Only records marked as share-enabled are included in the family portal view. In a deployed service, this would need proper identity verification, authority and consent processes; this switch is only a prototype of the access-control concept.

Optionally toggle sharing for one resident. Then switch the top-right role selector to **Family view**. The interface changes to the Family portal and only share-enabled residents appear. Switch back to Manager view afterwards.

### 5. Demonstrate the business model — Business simulation (about 1½ minutes)

**Show:** Switch to Manager view and open Business simulation.

**Say:**

> The second part connects the product to the business proposal. The base case uses 75 residents per typical home, a HK$1,500 monthly site fee and HK$60 per active resident per month. It also includes implementation and optional hardware revenue. These are planning assumptions, not actual company results.
>
> The base case targets 8 institutions in 2027 and 95 by the end of 2031. The model calculates subscription revenue from average active institutions, rather than assuming every year-end customer paid for a full year.

Point out the 2031 outputs: HK$6.81 million revenue and HK$0.71 million operating profit before depreciation, interest and tax. Select the downside preset or reduce the acquisition multiplier to show the effect of slower sales. Restore the base assumptions before leaving this page.

Be clear that the proposal describes downside and upside scenarios qualitatively; any exact scenario multipliers shown by the prototype are illustrative modelling choices.

### 6. Close with the audit trail — Audit log (about 30 seconds)

**Show:** Click Audit log.

**Say:**

> Actions taken during the demo are recorded with a simulated time, actor and description. This demonstrates traceability for operational review. The current version keeps this information in local application memory only; a production service would need persistent, secured audit storage.

Finish by returning to Overview.

## Important claims to avoid

- Do not say the prototype has been clinically validated or used in real care homes.
- Do not say a reminder acknowledgement proves medication was taken.
- Do not describe a threshold flag as a diagnosis, prediction or emergency decision.
- Do not claim that actual wearables, eHealth+, real family accounts or cloud services are connected.
- Do not present the proposal's financial assumptions or proposed KPI targets as actual performance.
- Do not describe the family-sharing switch as production-grade consent or authentication.

## Quick reset if the demo goes off-script

Click the circular reset icon in the top bar. This restores Manager view, the 08:55 starting time, fictional residents, medication events, health readings, audit entries and base financial assumptions.
