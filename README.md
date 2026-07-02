# Offline Dashboard Code Maintenance Manual

Built by **sxxiif**

> This README is a technical maintenance manual for the dashboard code. It is not a product description. Use it when you want to edit `index.html` or `app.js` without breaking week switching, fixed team names, fixed section titles, fixed columns, tables, charts, export names, or VDI/offline behavior.

---

## 1. File relationship

The dashboard is maintained with two main files:

```text
index.html
app.js
README.md
```

### `index.html`

Use `index.html` for:

- CSS and visual styling.
- Top navigation buttons.
- Static containers for each tab.
- Import file input.
- Chart modal root.
- No-script warning.
- The script reference to `app.js`.

The important static containers are:

```html
<section id="home" class="view active"></section>
<section id="team1" class="view"></section>
<section id="team2" class="view"></section>
<section id="team3" class="view"></section>
<section id="overview" class="view"></section>
<div id="chartModal" class="chart-modal-root"></div>
```

The script reference must stay at the bottom of `index.html`:

```html
<script src="./app.js" defer></script>
```

Keep `index.html` and `app.js` in the same folder. Do not rename `app.js` unless you also update the script line.

### `app.js`

Use `app.js` for:

- Data model.
- Local storage.
- Week switching.
- Rendering Team 1, Team 2, Team 3, and Overview.
- Tables.
- Charts.
- Import/export.
- Word export.
- Button functions.
- Global persistence for names, labels, and columns.

Most future changes should be done in `app.js`, not in `index.html`.

---

## 2. Important rule: global settings vs weekly data

The dashboard has two types of data.

### Global settings

These must stay the same when moving between weeks:

```text
Team names
Section titles
Subject titles
Column titles
User-added columns
Default table schemas
Chart titles
Fixed layout settings
```

These belong in:

```js
state.global
```

Important global objects:

```js
state.global.teamNames
state.global.labels
state.global.flexTableSchemas
state.global.taskReceivedColumns
```

### Weekly data

These can change from week to week:

```text
Daily entries
Tasks
Jira records
System counts
TNA rows
Availability rows
Maintenance notes
Team notes
Weekly summary
```

These belong under:

```js
state.weeks[weekStart].teams
state.teams
```

### Rule

If a value is a **name/title/column/layout setting**, save it globally.

If a value is an **actual weekly row/input/task/count**, save it inside the selected week.

---

## 3. Patches at the bottom of `app.js`

The current `app.js` has original functions and final override patches near the bottom. In JavaScript, the later function assignment wins.

For example, if `renderTeam3()` appears earlier and later appears again near the bottom, the bottom version is the active one.

When editing the latest dashboard, always check the bottom patch sections first:

```js
/* --- Requested latest-dashboard patch: no risks, no dropdowns, permanent labels, Team 3 daily inputs --- */
/* --- Requested patch continuation: force all editable section dropdowns into manual inputs --- */
/* --- Targeted fix patch: latest dashboard columns, Team 2 system chart, Team 3 daily inputs, remove Name Operations --- */
/* --- Final column cleanup + global column schema persistence patch --- */
```

Do not only edit the first function you see near the top. If the same function is redefined near the bottom, edit the bottom version.

---

## 4. Where to change team names permanently

Team names are controlled by these functions:

```js
teamDisplayName(teamKey)
updateTeamName(teamKey, value)
ensureGlobalSettings()
applyGlobalSettingsToCurrentWeek()
openWeek(weekStart)
saveState()
```

### Active logic

The active team-name persistence is in the final global patch:

```js
state.global.teamNames[teamKey]
```

### What `teamDisplayName()` should do

It should read from the global team name first:

```js
teamDisplayName = function(teamKey) {
  ensureGlobalSettings();
  return state.global.teamNames?.[teamKey] || state.teams?.[teamKey]?.name || defaultTeamName(teamKey);
};
```

### What `updateTeamName()` should do

It should update:

```js
state.global.teamNames[teamKey]
state.teams[teamKey].name
state.weeks[*].teams[teamKey].name
```

This is what prevents names from resetting when clicking Previous Week or Next Week.

### Do not do this

Do not only set:

```js
state.teams[teamKey].name = value;
```

That only changes the current week and can reset later.

---

## 5. Where to change section/subject titles permanently

Section titles use:

```js
labelInput(teamKey, key, fallback, extraClass)
getLabel(teamKey, key, fallback)
updateLabel(teamKey, key, value)
```

### How labels are saved

Permanent section titles are saved here:

```js
state.global.labels[teamKey][key]
```

Example:

```js
state.global.labels.team2['team2.systemTitle'] = 'System Graph';
```

### How to add a new permanent section title

When rendering a title, use `labelInput()`:

```js
<h3>${labelInput('team2', 'team2.newSectionTitle', 'Default Section Name')}</h3>
```

Use a unique key:

```text
team2.newSectionTitle
team3.dailyInputsTitle
team1.recoveryTableTitle
```

### Do not do this

Do not hard-code editable titles like this:

```html
<h3>My Section</h3>
```

Hard-coded titles are not editable and not globally persisted.

---

## 6. Where to change table column titles permanently

Normal table headers use:

```js
thLabel(teamKey, key, fallback)
```

Flexible tables use column objects stored inside each table:

```js
table.columns = [
  { id: '...', label: 'Task Name', type: 'text' }
]
```

The active global persistence for flexible table schemas is:

```js
state.global.flexTableSchemas[teamKey][tableKey]
```

### Important functions

```js
syncGlobalFlexSchemaFromCurrent(teamKey, tableKey)
setSchemaFromTable(teamKey, tableKey)
applySchemaToTable(teamKey, tableKey, table)
applyFinalGlobalColumnsToCurrentWeek()
compactAllExistingWeeksOnce()
addFlexColumn(teamKey, tableKey)
updateFlexColumn(teamKey, tableKey, colId, field, value)
deleteFlexColumn(teamKey, tableKey, colId)
```

### What keeps added columns permanent

When a user clicks Add Column, the function must:

1. Add the column to the current table.
2. Update the global schema.
3. Save state.
4. Reapply the global schema when moving weeks.

The important line is:

```js
setSchemaFromTable(teamKey, tableKey);
```

This stores the current table columns globally.

### Do not do this

Do not only push the column to the current week table:

```js
table.columns.push(col);
```

If you do this without updating the global schema, the column may disappear when changing week.

---

## 7. Where to add/remove default table columns

Default flexible table columns are controlled by:

```js
COMPACT_DEFAULT_SCHEMAS
```

Look near the bottom of `app.js` inside:

```js
/* --- Final column cleanup + global column schema persistence patch --- */
```

Example structure:

```js
const COMPACT_DEFAULT_SCHEMAS = {
  team2: {
    requestedTasksTable: [
      { label:'Task Name', type:'text' },
      { label:'Ref Number', type:'text' },
      { label:'Requested From', type:'text' },
      { label:'Notes', type:'text' }
    ]
  }
};
```

### Column object fields

Each column has:

```js
{ label: 'Column Name', type: 'text' }
```

Allowed practical types:

```text
text
number
date
```

### Add a default column

Example:

```js
requestedTasksTable: [
  { label:'Task Name', type:'text' },
  { label:'Ref Number', type:'text' },
  { label:'Requested From', type:'text' },
  { label:'Priority', type:'text' },
  { label:'Notes', type:'text' }
]
```

### Remove a default column

Remove the object from the array.

Example, remove `Requested From`:

```js
requestedTasksTable: [
  { label:'Task Name', type:'text' },
  { label:'Ref Number', type:'text' },
  { label:'Notes', type:'text' }
]
```

### Keep tables compact

Do not create too many default columns. Users can add extra columns manually. Because manually added columns are now stored globally, they will persist across weeks.

---

## 8. How to prevent duplicated columns

Column duplication usually happens when:

- A new default schema is applied every time a week opens.
- Columns are matched by generated `id` instead of stable position/schema.
- A new column is added to current week but not saved globally.
- Old default columns are still present in old weeks.

The current cleanup logic uses:

```js
compactAllExistingWeeksOnce()
compactTableColumns(teamKey, tableKey, table, forceCompactDefaults)
applyFinalGlobalColumnsToCurrentWeek()
```

The version flag is:

```js
state.meta.columnCompactVersion = 2;
```

If you intentionally want to force the cleanup again after changing default schemas, increase the version number, for example:

```js
state.meta.columnCompactVersion === 3
state.meta.columnCompactVersion = 3
```

Update both checks consistently inside `compactAllExistingWeeksOnce()`.

---

## 9. Where to add a new flexible table

Use flexible tables when you want editable rows, editable column titles, Add Row, Add Column, and Delete Column.

### Step 1: Add default schema

Add the table to:

```js
COMPACT_DEFAULT_SCHEMAS
```

Example:

```js
team2: {
  newTableKey: [
    { label:'Item', type:'text' },
    { label:'Status', type:'text' },
    { label:'Notes', type:'text' }
  ]
}
```

### Step 2: Add table key to the final table list

Add it to:

```js
FLEX_TABLE_KEYS_FINAL
```

Example:

```js
team2: ['requestedTasksTable','internalTaskTable','personnelTable','tnaTable','newTableKey']
```

### Step 3: Ensure the table exists

Use:

```js
ensureFlexTable(t, 'newTableKey', [
  { label:'Item', type:'text' },
  { label:'Status', type:'text' },
  { label:'Notes', type:'text' }
], []);
```

This usually belongs inside the team schema function, such as:

```js
ensureTeam2(t, weekStart)
ensureTeam3(t, weekStart)
```

### Step 4: Render the table

Call `renderFlexTable()` inside the correct render function:

```js
${renderFlexTable('team2','newTableKey','team2.newTableTitle','New Table','Editable flexible table.')}
```

For Team 2, add it inside:

```js
renderTeam2 = function() { ... }
```

For Team 3, add it inside:

```js
renderTeam3 = function() { ... }
```

For Team 1, add it inside:

```js
renderTeam1 = function() { ... }
```

### Step 5: Test persistence

After adding a table:

1. Open the tab.
2. Add a column.
3. Rename a column.
4. Move to next week.
5. Return to current week.
6. Confirm the column still exists and the title did not reset.

---

## 10. Where to add or change charts

Charts are rendered in `app.js`.

Important chart functions:

```js
renderSvgChart(data, type, keyA, keyB)
renderMultiSeriesSvgChart(data, type, series)
renderHorizontalBarChart(rows)
renderWideBarList(rows, emptyMessage)
renderTeam2StatsChart()
renderTeam2ResultsChart()
renderTeam2SystemChart()
renderJiraChart()
renderTasksReceivedRecoveredChart()
renderOverviewBarChart(rows)
```

### Preferred chart for long names

Use:

```js
renderWideBarList(rows, emptyMessage)
```

or:

```js
renderHorizontalBarChart(rows)
```

Long names are easier to read in a horizontal chart/list than in a normal bar chart.

### Example chart data

```js
const rows = state.teams.team2.systemResults.map(r => ({
  label: r.systemName,
  value: number(r.count)
}));

return renderWideBarList(rows, 'No system data yet.');
```

### Add a new chart section

Create a chart render function:

```js
function renderMyNewChart() {
  const rows = state.teams.team2.myList.map(r => ({
    label: r.name,
    value: number(r.count)
  }));
  return renderWideBarList(rows, 'No data yet.');
}
```

Then add it to the target team render function:

```js
<div class="card section">
  <div class="card-head wrap">
    <div><h3>${labelInput('team2','team2.myChartTitle','My Chart')}</h3></div>
    <div class="section-tools">${refreshButton('myChart')}</div>
  </div>
  <div class="chart-box">${renderMyNewChart()}</div>
</div>
```

### Bigger chart button

Use:

```js
<button class="btn small" onclick="openAnyChartModal('team2System')">Bigger</button>
```

Then update `openAnyChartModal(kind)` with the new chart kind.

---

## 11. How to fix chart names being cut

Chart names get cut when code uses `.slice()` or when the SVG left margin is too small.

Search for:

```js
slice(
```

Avoid this unless you intentionally want shortened labels.

### Better solution

Use `renderWideBarList()` for names that can be long:

```js
renderTeam2SystemChart = function() {
  const rows = (state.teams.team2.systemResults || []).map(r => ({
    label: r.systemName,
    value: number(r.count)
  }));
  return renderWideBarList(rows, 'No system data yet.');
};
```

### SVG horizontal chart fix

If you must use SVG, increase the left margin:

```js
const left = 260;
```

Increase height per row:

```js
const h = Math.max(260, rows.length * 50 + 70);
```

Use the full label:

```js
${esc(r.label)}
```

Do not use:

```js
String(r.label).slice(0, 14)
```

---

## 12. How to remove dropdowns

Avoid rendering:

```html
<select>
```

Old helper functions may exist in the file, but should not be used for editable dashboard fields:

```js
dropdownCell()
yesNoDropdown()
complexityDropdown()
severityDropdown()
statusDropdown()
availabilityStatusDropdown()
```

Use manual text input instead:

```js
<input class="cell-input" type="text" value="..." oninput="...">
```

Date fields can stay:

```js
<input type="date">
```

Number fields can stay:

```js
<input type="number">
```

For table cells, use:

```js
renderFlexCell()
renderReceivedCell()
```

Make sure they output `<input>`, not `<select>`.

---

## 13. Team 3 custom logic

Team 3 is customized near the bottom of `app.js`.

Important functions:

```js
renderTeam3()
renderTeam3DailyInputs()
renderTeam3Operations()
renderTeam3LogMaintenance()
renderTeam3NameOperations()
```

### Team 3 Daily Inputs

Team 3 should use daily inputs under each other, not weekday cards.

Active function:

```js
renderTeam3DailyInputs()
```

It uses:

```js
state.teams.team3.bullets
```

Button functions:

```js
addTeam3Bullet()
updateBullet(id, value)
deleteBullet(id)
```

### Team 3 Daily Inputs style

The style is controlled in `index.html` by classes like:

```css
.team3-routine-card
.routine-list
.routine-entry
.routine-dot
.routine-line-input
.routine-time
```

Do not use the yellow concern styling for Team 3 daily inputs.

Avoid these classes for Team 3 daily input cards:

```css
concern-card
concern-entry
concern-dot
concern-line-input
```

### Remove sections from Team 3

Edit the active bottom version of:

```js
renderTeam3 = function() { ... }
```

To remove a section, remove its render call.

Example, to remove operations:

```js
${renderTeam3Operations()}
```

To keep Name Operations removed, this must remain removed from `renderTeam3()`:

```js
${renderTeam3NameOperations()}
```

Also keep this override:

```js
renderTeam3NameOperations = function() { return ''; };
```

---

## 14. Overview maintenance

The Overview page is rendered by:

```js
renderOverview()
```

Because `renderOverview()` appears more than once, edit the bottom/latest version.

Important Overview helpers:

```js
calculateOverviewTotals()
renderOverviewTnaUpdates()
renderOverviewAbsences()
renderUrgentAndRedItems()
renderOverviewTeam3Status()
renderOverviewSystemHealth()
```

### Add a section to Overview

Add a card inside the active `renderOverview()` template:

```js
<div class="card">
  <div class="card-head"><h3>New Overview Section</h3></div>
  ${renderMyOverviewSection()}
</div>
```

### Remove a section from Overview

Remove the card from the active `renderOverview()` template.

### Keep Risks / Blockers removed

Do not add back:

```js
renderOverviewRisksByTeam()
renderTeamRisks(teamKey)
```

Do not add cards titled:

```text
Risks / Blockers
Important Risks
Open Risks
```

### TNA updates

TNA overview logic is:

```js
renderOverviewTnaUpdates()
```

It collects rows from:

```js
state.teams[teamKey].tnaTable
```

### Absence people

Absence overview logic is:

```js
renderOverviewAbsences()
isAbsenceRow(row)
```

It collects rows from:

```js
state.teams[teamKey].availability
```

---

## 15. Export filename changes

JSON export is controlled by:

```js
exportJSON()
```

Word export is controlled by:

```js
exportWord(target)
```

The date helper is:

```js
exportDateStamp()
```

Current pattern:

```js
a.download = `weekly-dashboard-export-${exportDateStamp()}.json`;
```

Word export pattern:

```js
a.download = `${title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-export-${exportDateStamp()}.doc`;
```

### Change JSON filename

Example:

```js
a.download = `my-dashboard-${exportDateStamp()}.json`;
```

### Change Word filename

Example:

```js
a.download = `weekly-report-${exportDateStamp()}.doc`;
```

### Keep filename safe

Use this to clean names:

```js
title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()
```

---

## 16. Width and table layout fixes

Most table/width fixes are in `index.html` CSS.

Search for these classes:

```css
.app
.table-wrap
.comfort-table-wrap
.comfort-table
.flexible-wide-table
.tasks-received-table
.jira-table
.cell-input
.th-label-input
.th-label-textarea
.wide-table-card
```

### Main dashboard width

The main container is:

```css
.app {
  width: min(1540px, calc(100% - 28px));
}
```

To use more screen width, increase the pixel value or reduce side spacing:

```css
.app {
  width: min(1760px, calc(100% - 18px));
}
```

### Reduce horizontal scrolling

Use fewer default columns. Then adjust:

```css
table { width: 100%; }
.table-wrap { overflow-x: auto; }
.cell-input { width: 100%; }
```

### Make column titles wrap

Use textareas for headers:

```js
fullHeaderTextarea(value, onInputJs, title)
```

This is used by:

```js
thLabel()
renderFlexTable()
```

CSS classes:

```css
.th-label-input
.th-label-textarea
```

---

## 17. Collapse button fix

Collapse button styling is in `index.html`.

Important classes:

```css
.collapse-btn
.card.is-collapsed
.btn.add-btn
```

Expected icons:

```text
Expanded section: ▾
Collapsed section: ▸
Add button: +
```

### Correct CSS

```css
.collapse-btn::before { content: "▾"; }
.card.is-collapsed > .card-head .collapse-btn::before { content: "▸"; }
.btn.add-btn::before { content: "+"; }
```

### Correct JS

Collapse buttons are created by:

```js
enableCollapseControls(root)
```

It should create:

```js
btn.className = 'collapse-btn';
btn.textContent = '';
```

### Do not do this

Do not give the collapse button this class:

```html
<button class="btn add-btn collapse-btn">
```

That causes `+` and triangle together.

Correct:

```html
<button class="collapse-btn"></button>
```

---

## 18. localStorage and week switching

Storage and week switching are controlled by:

```js
loadState()
saveState()
saveCurrentWeekSnapshot()
openWeek(weekStart)
migrateDashboardState(inputState)
currentWeekStart()
changeWeek(offset)
goToThisWeek()
selectWeekByDate(value)
```

### What `openWeek()` must do

When changing weeks:

1. Save the current week snapshot.
2. Keep global settings.
3. Open or create the target week.
4. Ensure schema exists.
5. Apply global settings to current week.
6. Save.
7. Render.

Important calls:

```js
saveCurrentWeekSnapshot();
compactAllExistingWeeksOnce();
ensureTeamSchema(...);
applyFinalGlobalColumnsToCurrentWeek();
saveState();
render();
```

### What `saveState()` must do

It must save:

```js
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
```

It must not reset global values.

### Common bug

If team names, titles, or columns reset, check that `openWeek()` still applies:

```js
applyGlobalSettingsToCurrentWeek();
applyFinalGlobalColumnsToCurrentWeek();
```

---

## 19. Import/export JSON maintenance

### Export JSON

Function:

```js
exportJSON()
```

It should:

1. Call `saveState()`.
2. Convert `state` to JSON.
3. Create a Blob.
4. Download the file.

### Import JSON

Function:

```js
importJSON(event)
```

It should:

1. Read the selected JSON file.
2. Parse it.
3. Validate it has dashboard data.
4. Run migration:

```js
state = migrateDashboardState(imported);
```

5. Save and render.

### Important warning

Exported JSON can contain internal dashboard data. Do not upload real exported JSON files to public GitHub if they include confidential data.

---

## 20. How to add a normal non-flex table

Use normal tables only when the columns are fixed and do not need Add Column.

Example structure:

```js
function renderMyFixedTable() {
  const rows = state.teams.team1.myRows || [];
  return `<div class="card section">
    <div class="card-head wrap">
      <h3>${labelInput('team1','myTable.title','My Fixed Table')}</h3>
      <button class="btn small add-btn" onclick="addMyRow()"><span class="sr-only">Add Row</span></button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${thLabel('team1','myTable.name','Name')}</th>
            <th>${thLabel('team1','myTable.notes','Notes')}</th>
            <th class="action-col"><span class="sr-only">Delete</span></th>
          </tr>
        </thead>
        <tbody>${rows.map(r => `...</tbody>
      </table>
    </div>
  </div>`;
}
```

Use `thLabel()` so column titles can be renamed and saved.

---

## 21. How to add a new button safely

A button can use inline `onclick`, but the function must exist globally.

Example:

```html
<button class="btn small" onclick="myFunctionName()">Run</button>
```

Then in `app.js`:

```js
function myFunctionName() {
  // logic
}
```

or if inside a patch/IIFE:

```js
myFunctionName = function() {
  // logic
};
```

If the button does nothing, check the browser console for:

```text
ReferenceError: myFunctionName is not defined
```

---

## 22. Safe editing checklist

Before editing:

```text
Copy app.js to app_backup_YYYY-MM-DD.js
Copy index.html to index_backup_YYYY-MM-DD.html
```

After editing `app.js`, run:

```bash
node --check app.js
```

After editing `index.html`, check:

```html
<script src="./app.js" defer></script>
```

Then test manually:

```text
Start opens
Team 1 opens
Team 2 opens
Team 3 opens
Overview opens
Previous week works
Next week works
This week works
Team names stay after week switch
Section titles stay after week switch
Column titles stay after week switch
Added columns stay after week switch
Export JSON downloads
Import JSON works
Export Word downloads
Print/PDF opens print dialog
No dropdowns appear
No Risks / Blockers sections appear
Team 3 Daily Inputs appears at top
Collapse button shows only triangle
Charts show readable names
```

---

## 23. Common problems and where to check

### Blank page

Check:

```html
<script src="./app.js" defer></script>
```

Check that `app.js` is in the same folder as `index.html`.

Run:

```bash
node --check app.js
```

Open browser console and look for JavaScript errors.

### Buttons not working

Check the `onclick` function name exists in `app.js`.

Examples:

```js
showView()
exportJSON()
importJSON()
toggleTheme()
changeWeek()
```

### Team names reset

Check:

```js
state.global.teamNames
teamDisplayName()
updateTeamName()
openWeek()
applyGlobalSettingsToCurrentWeek()
```

### Section titles reset

Check:

```js
state.global.labels
getLabel()
updateLabel()
labelInput()
```

### Column titles reset

Check:

```js
state.global.flexTableSchemas
setSchemaFromTable()
updateFlexColumn()
applyFinalGlobalColumnsToCurrentWeek()
```

### Added columns disappear

Check:

```js
addFlexColumn()
setSchemaFromTable(teamKey, tableKey)
openWeek()
applySchemaToTable()
```

### Added columns duplicate

Check:

```js
compactAllExistingWeeksOnce()
state.meta.columnCompactVersion
compactTableColumns()
OBSOLETE_DEFAULT_LABELS
COMPACT_DEFAULT_SCHEMAS
```

### Graph labels are cut

Search for:

```js
slice(
```

Use:

```js
renderWideBarList()
renderHorizontalBarChart()
```

### Collapse icon shows plus and triangle

Check that collapse button class is only:

```html
collapse-btn
```

Not:

```html
add-btn collapse-btn
```

### Dropdowns appear again

Search for:

```html
<select
```

Search in `app.js` for:

```js
dropdownCell(
yesNoDropdown(
complexityDropdown(
statusDropdown(
```

Do not use those helpers in rendered editable fields.

### Tables are too wide

Reduce default columns in:

```js
COMPACT_DEFAULT_SCHEMAS
```

Adjust CSS in `index.html`:

```css
.app
.table-wrap
.comfort-table
.flexible-wide-table
.cell-input
.th-label-textarea
```

---

## 24. GitHub notes

Recommended files to upload:

```text
index.html
app.js
README.md
.gitignore
```

Do not upload:

```text
Exported JSON with real dashboard data
Screenshots with confidential data
Company data
Internal names if not approved
```

Suggested `.gitignore`:

```gitignore
*.json
*_export_*.json
*-export-*.json
*.doc
*.docx
*.pdf
.DS_Store
Thumbs.db
```

Keep this README updated whenever major dashboard logic changes.

---

## 25. Final rule for future changes

Before changing anything, decide whether the change is:

```text
A permanent setting
or
Weekly data
```

Permanent settings go to:

```js
state.global
```

Weekly data goes to:

```js
state.teams
state.weeks
```

This rule prevents the biggest dashboard problems:

```text
Team names resetting
Section titles resetting
Column titles resetting
Added columns disappearing
Columns duplicating between weeks
```
