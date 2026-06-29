# Offline Weekly Operations Dashboard

A single-file offline dashboard for weekly team updates, operational tracking, charts, risks/blockers, personnel cards, TNA records, and overview reporting.

Built by **sxxiif**.

## What this dashboard is

This dashboard is designed to run fully offline inside a VDI/browser environment. It does not need a server, internet connection, CDN, external JavaScript, web fonts, or any installation.

You only need to open:

```text
index.html
```

## Key features

- One single HTML file
- Works offline by opening `index.html` directly
- No external libraries
- No CDN
- No server required
- No Node.js or Python required
- Dark and light theme support
- English and Arabic language toggle
- Weekly navigation:
  - Previous week
  - Next week
  - This week
  - Jump to week by date
- Local saving using browser `localStorage`
- Export and Import JSON
- Export Word-compatible report
- Print / Save as PDF using browser print
- Team 1, Team 2, Team 3, and Overview pages
- Inline SVG charts
- Collapsible sections
- Compact delete buttons
- Personnel cards
- TNA sections
- Risks/blockers overview by team

## Recommended GitHub structure

Keep the repository simple:

```text
repository-name/
├── index.html
├── README.md
├── LOGO_README.md
└── .gitignore
```

Optional later:

```text
repository-name/
├── index.html
├── logo.png
├── README.md
├── LOGO_README.md
└── .gitignore
```

If you want the project to remain one-file only, do not add `logo.png`. Instead, embed the logo as Base64 inside `index.html`. See `LOGO_README.md`.

## How to use

1. Download or copy `index.html`.
2. Move it to your VDI.
3. Double-click the file, or open it with your browser.
4. Select the team page or overview page.
5. Add/update data.
6. Use Export JSON to save a backup of the data.
7. Use Import JSON to load saved/shared data later.

## Data storage

The dashboard saves data locally in the browser using `localStorage`.

This means:

- Data is stored on the same machine/browser where the dashboard was used.
- Data is not uploaded anywhere.
- Data does not sync automatically between different PCs or VDIs.
- To move data between users or machines, use Export JSON and Import JSON.

## Important localStorage note

If the browser cache/storage is cleared, dashboard data can be deleted. Export JSON regularly if the data is important.

Recommended backup routine:

```text
Every week:
1. Update the dashboard.
2. Click Export JSON.
3. Save the exported JSON file in a safe shared location.
```

## VDI compatibility

The dashboard is designed to be lightweight:

- Vanilla JavaScript only
- Inline SVG charts
- No external packages
- No network requests
- No background server
- No heavy frameworks

It should work on a VDI with 10 GB RAM and low CPU usage. Actual performance depends on browser version, VDI policy, and amount of data entered.

For best performance:

- Keep old data exported/backed up.
- Avoid storing very large notes or thousands of rows in one week.
- Collapse sections that are not being used.
- Use the latest available browser in the VDI if allowed.

## Offline requirements

The dashboard does not require internet.

Allowed:

```text
index.html
```

Optional:

```text
logo.png
```

Not required:

```text
node_modules/
server.js
package.json
chart.js
external CSS
external JS
CDN links
```

## Export options

### Export JSON
Use this to save the actual dashboard data. This is the most important backup format.

### Import JSON
Use this to restore or load data.

### Export Word
Generates a Word-compatible `.doc` file from the report content.

### Print / Save as PDF
Uses the browser print dialog. Choose “Save as PDF” if the VDI/browser allows it.

## Editing team names

Team names can be edited inside the dashboard from the team title area. Changes are saved automatically.

## Themes

The dashboard includes:

- Dark theme
- Light theme

The selected theme is saved locally.

## Languages

The dashboard includes:

- English
- Arabic

Arabic mode switches the layout direction to RTL where applicable.

## Logo

Logo setup is documented in:

```text
LOGO_README.md
```

You can either:

- Use `logo.png` beside `index.html`, or
- Embed the logo as Base64 directly inside `index.html`

## GitHub upload notes

Before uploading to GitHub:

- Remove sensitive/private business data.
- Do not upload exported JSON files if they contain real internal information.
- Do not upload a company logo unless you are allowed to publish it.
- Do not upload screenshots containing sensitive team data.
- Keep the repo generic if it is public.

## Suggested repository description

```text
Offline single-file weekly operations dashboard for team updates, risks, charts, and reports.
```

## Suggested topics

```text
offline-dashboard
html-dashboard
vanilla-javascript
localstorage
weekly-reporting
operations-dashboard
single-file-app
```

## Troubleshooting

### Data disappeared
The browser storage may have been cleared, or the file was opened in a different browser/profile. Restore using Import JSON if you exported a backup.

### PDF export does not download directly
Use the browser print window and select “Save as PDF”. Some VDIs restrict PDF printing.

### Word export opens with formatting warning
This can happen because the file is generated from HTML. It is normal for browser-generated `.doc` exports.

### Arabic layout looks different
Arabic uses RTL direction, so alignment and layout may shift. This is expected.

### Logo not showing
Check that `logo.png` is in the same folder as `index.html`, or use the Base64 method in `LOGO_README.md`.

## License

Choose a license based on how you want others to use the dashboard. If this is private/internal, you can keep the repository private and avoid adding a public open-source license.
