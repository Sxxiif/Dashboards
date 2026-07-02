// Offline dashboard configuration. Change team names, labels, default data, and section names here.
    const STORAGE_KEY = 'sxxiif_offline_weekly_dashboard_v1';
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const taskReceivedColumnMap = {
      date: { label: 'Date', type: 'date' },
      refNumber: { label: 'Ref Number', type: 'text' },
      caseName: { label: 'Case Name', type: 'text' },
      totalReceived: { label: 'Total Received', type: 'number' },
      totalRecovered: { label: 'Total Recovered', type: 'number' },
      complexity: { label: 'Complexity', type: 'select', options: ['Low','Medium','High','Critical'] },
      urgent: { label: 'Urgent', type: 'select', options: ['No','Yes'] },
      saifCreated: { label: 'Saif.Created', type: 'select', options: ['No','Yes'] },
      progress: { label: 'Progress %', type: 'number' },
      resultProgress: { label: 'Result Progress %', type: 'number' }
    };

    let currentView = 'home';
    let state = loadState();

    function uid() { return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8); }
    function nowStamp() { return new Date().toLocaleString(); }
    function todayISO() { return formatISODate(new Date()); }
    function esc(value) {
      return String(value ?? '').replace(/[&<>'"]/g, function(char) {
        return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char];
      });
    }
    function number(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
    function clampPercent(value) { return Math.max(0, Math.min(100, number(value))); }

    function ensureLabels(teamKey) {
      state.teams[teamKey].labels = state.teams[teamKey].labels || {};
      return state.teams[teamKey].labels;
    }
    function getLabel(teamKey, key, fallback) {
      const labels = ensureLabels(teamKey);
      return labels[key] !== undefined ? labels[key] : fallback;
    }
    function updateLabel(teamKey, key, value) {
      ensureLabels(teamKey)[key] = value;
      saveState();
    }
    function labelWidthStyle(value) {
      const len = Math.max(12, Math.min(86, String(value || '').length + 3));
      return `--label-width:${len}ch`;
    }
    function labelInput(teamKey, key, fallback, extraClass = '') {
      const value = getLabel(teamKey, key, fallback);
      return `<input class="label-input subject-label ${extraClass}" value="${esc(value)}" style="${labelWidthStyle(value)}" oninput="updateLabel('${teamKey}','${key}',this.value);this.style.setProperty('--label-width', Math.max(12, Math.min(86, this.value.length + 3)) + 'ch')" title="Rename label">`;
    }
    function thLabel(teamKey, key, fallback) {
      const k = String(key || '').toLowerCase();
      const f = String(fallback || '').toLowerCase();
      if (k.includes('action') || f === 'action') return '<span class="sr-only">Delete</span>';
      return `<input class="th-label-input" value="${esc(getLabel(teamKey, key, fallback))}" oninput="updateLabel('${teamKey}','${key}',this.value)" title="Rename column label">`;
    }
    function parseISODate(value) {
      const parts = String(value || todayISO()).split('-').map(Number);
      return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    }
    function formatISODate(date) {
      const d = new Date(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    function startOfWeekISO(value) {
      const d = value instanceof Date ? new Date(value) : parseISODate(value || todayISO());
      d.setHours(0, 0, 0, 0);
      const diff = (d.getDay() + 6) % 7; // Monday start
      d.setDate(d.getDate() - diff);
      return formatISODate(d);
    }
    function addDaysISO(value, daysToAdd) {
      const d = parseISODate(value);
      d.setDate(d.getDate() + daysToAdd);
      return formatISODate(d);
    }
    function formatShortDate(value) {
      return parseISODate(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    }
    function currentWeekStart() {
      state.meta = state.meta || {};
      state.meta.currentWeekStart = state.meta.currentWeekStart || startOfWeekISO(todayISO());
      return state.meta.currentWeekStart;
    }
    function currentWeekLabel() {
      const start = currentWeekStart();
      return `${formatShortDate(start)} - ${formatShortDate(addDaysISO(start, 6))}`;
    }

    function createDefaultState() {
      const daily = {};
      days.forEach(day => daily[day] = []);
      daily[days[new Date().getDay()]].push({ id: uid(), text: 'Add what was completed today here.', createdAt: nowStamp(), updatedAt: '' });
      return {
        meta: { createdAt: nowStamp(), lastSaved: nowStamp(), version: 1, theme: 'dark' },
        teams: {
          team1: {
            name: 'Team 1',
            subtitle: 'Weekly operational tasks dashboard',
            weeklySummary: 'Weekly operations summary. Update this with the main highlights for Team 1.',
            notes: 'Team notes and handover points.',
            kpis: [
              { id: uid(), label: 'Weekly Progress', value: '72%', detail: 'Based on current tasks' },
              { id: uid(), label: 'Open Risks', value: '2', detail: 'Active blockers' },
              { id: uid(), label: 'Recovered Systems', value: '6', detail: 'This week' },
              { id: uid(), label: 'Machine Health', value: '86%', detail: 'Active vs inactive' }
            ],
            risks: [
              { id: uid(), title: 'Dependency pending', owner: 'Owner', severity: 'Medium', status: 'Open', due: todayISO(), notes: 'Add blocker details.' }
            ],
            availability: [
              { id: uid(), name: 'Team Member', status: 'Available', from: todayISO(), to: todayISO(), notes: 'Normal coverage' }
            ],
            dailyTasks: daily,
            concernsTitle: 'Team 1 Concerns',
            concerns: [
              { id: uid(), text: 'Add operational concerns here.', createdAt: nowStamp(), updatedAt: '' }
            ],
            systemsActivity: [
              { id: uid(), systemName: 'Nvidia', description: 'GPU machines for active work', active: 12, inactive: 0 },
              { id: uid(), systemName: 'Nexus', description: 'Core operational platform', active: 7, inactive: 2 },
              { id: uid(), systemName: 'Opera', description: 'Support system', active: 0, inactive: 3 }
            ],
            tasksSummaryTitle: 'Team 1 Tasks Summary',
            tasksReceivedColumns: Object.keys(taskReceivedColumnMap),
            tasksReceived: [
              { id: uid(), date: todayISO(), refNumber: 'REF-001', caseName: 'Weekly recovery case', totalReceived: 12, totalRecovered: 8, complexity: 'Medium', urgent: 'Yes', saifCreated: 'Yes', progress: 70, resultProgress: 66 },
              { id: uid(), date: todayISO(), refNumber: 'REF-002', caseName: 'System validation', totalReceived: 6, totalRecovered: 6, complexity: 'Low', urgent: 'No', saifCreated: 'No', progress: 100, resultProgress: 100 }
            ],
            ongoingTasks: [
              { id: uid(), name: 'Validate active machines', owner: 'Owner', status: 'In Progress', progress: 65 }
            ],
            urgentTasks: [
              { id: uid(), name: 'Recover pending systems', deadline: todayISO(), owner: 'Owner', status: 'Open', progress: 35 }
            ],
            recoveredSystems: [
              { id: uid(), systemName: 'Nexus', recoveredCount: 3, notes: 'Recovered and validated', date: todayISO() }
            ],
            systemsOutcomes: [
              { id: uid(), systemName: 'Nvidia', statusLine: 'All machines are utilized in ongoing tasks', activeTasks: 8, pending: 2, completed: 10 },
              { id: uid(), systemName: 'Nexus', statusLine: 'Partial utilization due to inactive machines', activeTasks: 4, pending: 5, completed: 7 }
            ],
            taskChartType: 'line',
            jiraChartType: 'line',
            jiraFrom: todayISO(),
            jiraTo: todayISO(),
            jiraRecords: [
              { id: uid(), from: todayISO(), to: todayISO(), totalTasks: 18, recoveredTasks: 11, notes: 'Sample daily range' }
            ],
            genericTasks: []
          },
          team2: genericTeam('Team 2', 'Generic weekly dashboard. Replace later with Team 2 detailed layout.'),
          team3: genericTeam('Team 3', 'Generic weekly dashboard. Replace later with Team 3 detailed layout.')
        }
      };
    }

    function genericTeam(name, summary) {
      return {
        name,
        subtitle: 'Weekly team update',
        weeklySummary: summary,
        notes: 'Add team notes here.',
        kpis: [
          { id: uid(), label: 'Progress', value: '60%', detail: 'Editable KPI' },
          { id: uid(), label: 'Tasks', value: '4', detail: 'Total tasks' },
          { id: uid(), label: 'Risks', value: '1', detail: 'Open risks' },
          { id: uid(), label: 'Availability', value: '90%', detail: 'Team capacity' }
        ],
        genericTasks: [
          { id: uid(), title: 'Weekly task', owner: 'Owner', priority: 'Medium', status: 'In Progress', due: todayISO(), progress: 45 }
        ],
        risks: [
          { id: uid(), title: 'Risk item', owner: 'Owner', severity: 'Medium', status: 'Open', due: todayISO(), notes: 'Add risk details.' }
        ],
        availability: [
          { id: uid(), name: 'Team Member', status: 'Available', from: todayISO(), to: todayISO(), notes: 'No leave' }
        ]
      };
    }

    function createEmptyWeekTeams(weekStart) {
      const teams = createDefaultState().teams;
      const weekEnd = addDaysISO(weekStart, 6);
      const daily = {};
      days.forEach(day => daily[day] = []);
      teams.team1.weeklySummary = `Weekly operations summary for ${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}.`;
      teams.team1.notes = '';
      teams.team1.dailyTasks = daily;
      teams.team1.concerns = [];
      teams.team1.systemsActivity = [];
      teams.team1.tasksReceived = [];
      teams.team1.ongoingTasks = [];
      teams.team1.urgentTasks = [];
      teams.team1.recoveredSystems = [];
      teams.team1.systemsOutcomes = [];
      teams.team1.jiraFrom = weekStart;
      teams.team1.jiraTo = weekEnd;
      teams.team1.jiraRecords = [];
      teams.team1.risks = [];
      teams.team1.availability = [];
      ['team2','team3'].forEach(key => {
        teams[key].weeklySummary = `${teams[key].name} weekly summary for ${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}.`;
        teams[key].notes = '';
        teams[key].genericTasks = [];
        teams[key].risks = [];
        teams[key].availability = [];
      });
      return teams;
    }

    function ensureTeamSchema(teams, weekStart) {
      const fresh = createEmptyWeekTeams(weekStart);
      ['team1','team2','team3'].forEach(key => {
        teams[key] = teams[key] || fresh[key];
        Object.keys(fresh[key]).forEach(field => {
          if (teams[key][field] === undefined) teams[key][field] = fresh[key][field];
        });
        teams[key].labels = teams[key].labels || {};
      });
      days.forEach(day => {
        teams.team1.dailyTasks = teams.team1.dailyTasks || {};
        teams.team1.dailyTasks[day] = teams.team1.dailyTasks[day] || [];
      });
      teams.team1.tasksReceivedColumns = teams.team1.tasksReceivedColumns || Object.keys(taskReceivedColumnMap);
      teams.team1.labels = teams.team1.labels || {};
      teams.team1.taskChartType = teams.team1.taskChartType || 'line';
      teams.team1.jiraChartType = teams.team1.jiraChartType || 'line';
      teams.team1.jiraFrom = teams.team1.jiraFrom || weekStart;
      teams.team1.jiraTo = teams.team1.jiraTo || addDaysISO(weekStart, 6);
      return teams;
    }

    function migrateDashboardState(inputState) {
      const migrated = inputState && inputState.teams ? inputState : createDefaultState();
      migrated.meta = migrated.meta || {};
      migrated.meta.currentWeekStart = migrated.meta.currentWeekStart || startOfWeekISO(todayISO());
      migrated.meta.theme = migrated.meta.theme || 'dark';
      migrated.weeks = migrated.weeks || {};
      const wk = migrated.meta.currentWeekStart;
      if (!migrated.weeks[wk]) migrated.weeks[wk] = { createdAt: migrated.meta.createdAt || nowStamp(), updatedAt: migrated.meta.lastSaved || '', teams: migrated.teams };
      if (!migrated.weeks[wk].teams) migrated.weeks[wk].teams = migrated.teams || createEmptyWeekTeams(wk);
      migrated.weeks[wk].teams = ensureTeamSchema(migrated.weeks[wk].teams, wk);
      migrated.teams = migrated.weeks[wk].teams;
      return migrated;
    }

    function saveCurrentWeekSnapshot() {
      state.meta = state.meta || {};
      state.weeks = state.weeks || {};
      const wk = currentWeekStart();
      state.weeks[wk] = state.weeks[wk] || { createdAt: nowStamp(), updatedAt: '' };
      state.weeks[wk].teams = state.teams;
      state.weeks[wk].updatedAt = nowStamp();
    }

    function openWeek(weekStart) {
      if (!weekStart) return;
      saveCurrentWeekSnapshot();
      state.meta.currentWeekStart = startOfWeekISO(weekStart);
      const wk = state.meta.currentWeekStart;
      state.weeks = state.weeks || {};
      if (!state.weeks[wk]) state.weeks[wk] = { createdAt: nowStamp(), updatedAt: '', teams: createEmptyWeekTeams(wk) };
      state.weeks[wk].teams = ensureTeamSchema(state.weeks[wk].teams, wk);
      state.teams = state.weeks[wk].teams;
      saveState();
      render();
    }

    function changeWeek(offset) {
      openWeek(addDaysISO(currentWeekStart(), offset * 7));
    }

    function goToThisWeek() {
      openWeek(startOfWeekISO(todayISO()));
    }

    function selectWeekByDate(value) {
      if (!value) return;
      openWeek(value);
    }

    function renderWeekSwitcher() {
      const el = document.getElementById('weekSwitcher');
      if (!el) return;
      const start = currentWeekStart();
      el.innerHTML = `
        <button class="btn small" onclick="changeWeek(-1)">← Previous</button>
        <div class="week-chip"><span>Selected Week</span><strong>${esc(currentWeekLabel())}</strong></div>
        <button class="btn small" onclick="changeWeek(1)">Next →</button>
        <button class="btn small ghost" onclick="goToThisWeek()">This Week</button>
        <input class="input week-date-input" type="date" value="${esc(start)}" onchange="selectWeekByDate(this.value)" title="Jump to week">
      `;
    }

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return migrateDashboardState(createDefaultState());
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.teams) return migrateDashboardState(createDefaultState());
        return migrateDashboardState(parsed);
      } catch (error) {
        console.warn('Could not load dashboard state:', error);
        return migrateDashboardState(createDefaultState());
      }
    }

    function saveState() {
      state.meta = state.meta || {};
      state.meta.currentWeekStart = state.meta.currentWeekStart || startOfWeekISO(todayISO());
      state.meta.lastSaved = nowStamp();
      saveCurrentWeekSnapshot();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      renderLastSaved();
      renderWeekSwitcher();
    }

    function renderLastSaved() {
      const label = document.getElementById('lastSavedLabel');
      if (label) label.textContent = 'Auto-saved locally: ' + (state.meta?.lastSaved || 'not yet saved');
    }

    function applyTheme() {
      const theme = state.meta?.theme === 'light' ? 'light' : 'dark';
      document.body.classList.toggle('theme-light', theme === 'light');
      document.body.classList.toggle('theme-dark', theme !== 'light');
    }

    function renderThemeToggle() {
      const btn = document.getElementById('themeToggleBtn');
      if (!btn) return;
      const theme = state.meta?.theme === 'light' ? 'light' : 'dark';
      btn.textContent = theme === 'light' ? 'Dark Theme' : 'Light Theme';
      btn.title = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
    }

    function toggleTheme() {
      state.meta = state.meta || {};
      state.meta.theme = state.meta.theme === 'light' ? 'dark' : 'light';
      applyTheme();
      renderThemeToggle();
      saveState();
      render();
    }

    function showView(view) {
      currentView = view;
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(view).classList.add('active');
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function render() {
      applyTheme();
      renderThemeToggle();
      applyTheme();
      renderThemeToggle();
      renderLastSaved();
      renderWeekSwitcher();
      renderNavLabels();
      renderHome();
      if (currentView === 'team1') renderTeam1();
      if (currentView === 'team2') renderGenericTeam('team2');
      if (currentView === 'team3') renderGenericTeam('team3');
      if (currentView === 'overview') renderOverview();
      requestAnimationFrame(() => { autoGrowAll(); polishDeleteButtons(); });
    }



    function autoGrow(element) {
      if (!element) return;
      element.style.height = 'auto';
      element.style.height = Math.max(element.scrollHeight, 44) + 'px';
    }

    function autoGrowAll() {
      document.querySelectorAll('textarea.auto-grow').forEach(autoGrow);
    }

    function renderHome() {
      document.getElementById('home').innerHTML = `
        <div class="hero">
          <h2>Weekly command center for offline team updates.</h2>
          <p>Single HTML file, no internet, no folders, no external JavaScript. Choose a week from the top bar, update the team, export JSON, and import it again when needed.</p>
          <div class="pill-row" style="margin-top:18px">
            <span class="pill"><span class="dot good"></span>Offline ready</span>
            <span class="pill"><span class="dot"></span>Auto-save localStorage</span>
            <span class="pill"><span class="dot warn"></span>VDI friendly</span>
          </div>
        </div>
        <div class="grid team-grid">
          ${homeCard(teamDisplayName('team1'),'Operational dashboard with daily tasks, concerns, systems, recovery and Jira analytics.','team1','Open ' + teamDisplayName('team1'))}
          ${homeCard(teamDisplayName('team2'),'Generic weekly dashboard ready to replace with your Team 2 layout later.','team2','Open ' + teamDisplayName('team2'))}
          ${homeCard(teamDisplayName('team3'),'Generic weekly dashboard ready to replace with your Team 3 layout later.','team3','Open ' + teamDisplayName('team3'))}
          ${homeCard('Overview','Executive view pulling totals, risks, progress, recovery and important data from all teams.','overview','Open Overview', true)}
        </div>
      `;
    }

    function homeCard(title, body, view, buttonText, primary) {
      return `<div class="card team-card">
        <div><h3>${esc(title)}</h3><p class="subtle" style="margin-top:10px">${esc(body)}</p></div>
        <button class="btn ${primary ? 'primary' : ''}" onclick="showView('${view}')">${esc(buttonText)}</button>
      </div>`;
    }

    function pageTitle(title, subtitle, rightHtml = '') {
      return `<div class="page-title">
        <div><h2>${esc(title)}</h2><p class="subtle">${esc(subtitle || '')}</p></div>
        <div class="pill-row">${rightHtml}</div>
      </div>`;
    }

    function teamDisplayName(teamKey) {
      return state.teams?.[teamKey]?.name || ({ team1: 'Team 1', team2: 'Team 2', team3: 'Team 3' }[teamKey] || teamKey);
    }
    function updateTeamName(teamKey, value) {
      const clean = value || teamKey;
      state.teams[teamKey].name = clean;
      if (state.weeks) {
        Object.values(state.weeks).forEach(week => {
          if (week?.teams?.[teamKey]) week.teams[teamKey].name = clean;
        });
      }
      saveState();
      renderNavLabels();
    }
    function renderNavLabels() {
      ['team1','team2','team3'].forEach(key => {
        const btn = document.getElementById('nav-' + key);
        if (btn) btn.textContent = teamDisplayName(key);
      });
    }
    function teamPageTitle(teamKey, rightHtml = '') {
      const t = state.teams[teamKey];
      const name = teamDisplayName(teamKey);
      return `<div class="page-title">
        <div><h2><input class="label-input subject-label team-name-input" value="${esc(name)}" style="${labelWidthStyle(name)}" oninput="updateTeamName('${teamKey}',this.value);this.style.setProperty('--label-width', Math.max(12, Math.min(86, this.value.length + 3)) + 'ch')" title="Rename team name"></h2><p class="subtle">${esc(t.subtitle || '')}</p></div>
        <div class="pill-row">${rightHtml}</div>
      </div>`;
    }

    function renderTeam1() {
      const t = state.teams.team1;
      document.getElementById('team1').innerHTML = `
        ${teamPageTitle('team1', `<button class="btn primary" onclick="showView('overview')">Open Overview</button>`)}
        ${renderEditableSummary('team1')}
        ${renderTeam1TopAnalytics()}
        ${renderTeam1DailyTasks()}
        ${renderTeam1Concerns()}
        ${renderSystemsActivity()}
        ${renderTeam1TasksSummary()}
        ${renderSystemsOutcomes()}
        ${renderJiraSection()}
        ${renderTeamRisks('team1')}
        ${renderAvailability('team1')}
      `;
      requestAnimationFrame(() => { autoGrowAll(); polishDeleteButtons(); });
    }

    function renderEditableSummary(teamKey) {
      const t = state.teams[teamKey];
      return `<div class="grid two section">
        <div class="card">
          <div class="card-head"><h3>${labelInput(teamKey,'weeklySummaryTitle','Weekly Summary')}</h3></div>
          <textarea oninput="updateTeamField('${teamKey}','weeklySummary',this.value)">${esc(t.weeklySummary)}</textarea>
        </div>
        <div class="card">
          <div class="card-head"><h3>${labelInput(teamKey,'teamNotesTitle','Team Notes')}</h3></div>
          <textarea oninput="updateTeamField('${teamKey}','notes',this.value)">${esc(t.notes)}</textarea>
        </div>
      </div>`;
    }

    function updateTeamField(teamKey, field, value) {
      state.teams[teamKey][field] = value;
      saveState();
    }

    function renderKpis(teamKey) {
      const kpis = state.teams[teamKey].kpis || [];
      return `<div class="section">
        <div class="card-head wrap"><h3>KPI Cards</h3><button class="btn small" onclick="addKpi('${teamKey}')">Add KPI</button></div>
        <div class="grid four">
          ${kpis.map(k => `<div class="card kpi">
            <div><input class="input" value="${esc(k.label)}" oninput="updateArrayItem('${teamKey}','kpis','${k.id}','label',this.value)"></div>
            <input class="input value" value="${esc(k.value)}" oninput="updateArrayItem('${teamKey}','kpis','${k.id}','value',this.value)">
            <textarea style="min-height:54px" oninput="updateArrayItem('${teamKey}','kpis','${k.id}','detail',this.value)">${esc(k.detail)}</textarea>
            <button class="btn small danger" onclick="deleteArrayItem('${teamKey}','kpis','${k.id}')"><span class="sr-only">Delete KPI</span></button>
          </div>`).join('')}
        </div>
      </div>`;
    }

    function addKpi(teamKey) {
      state.teams[teamKey].kpis.push({ id: uid(), label: 'New KPI', value: '0', detail: 'KPI details' });
      saveState(); renderCurrentViewPreservingScroll();
    }

    function updateArrayItem(teamKey, arrayName, id, field, value) {
      const item = (state.teams[teamKey][arrayName] || []).find(x => x.id === id);
      if (!item) return;
      item[field] = value;
      if (field !== 'updatedAt') item.updatedAt = nowStamp();
      saveState();
    }

    function deleteArrayItem(teamKey, arrayName, id) {
      state.teams[teamKey][arrayName] = (state.teams[teamKey][arrayName] || []).filter(x => x.id !== id);
      saveState(); renderCurrentViewPreservingScroll();
    }



    function renderTeam1TopAnalytics() {
      return `<div class="grid two section analytics-split">
        ${renderTopChartCard('tasks')}
        ${renderTopChartCard('jira')}
      </div>`;
    }

    function renderTopChartCard(kind) {
      const t = state.teams.team1;
      const isTasks = kind === 'tasks';
      const title = isTasks ? getLabel('team1','chart.tasksTitle','Tasks Received / Recovered') : getLabel('team1','chart.jiraTitle','Jira Total / Recovered');
      const field = isTasks ? 'taskChartType' : 'jiraChartType';
      const chart = isTasks ? renderTasksReceivedRecoveredChart() : renderJiraChart();
      const legend = isTasks
        ? `<span class="legend-item"><span class="legend-line"></span>Received</span><span class="legend-item"><span class="legend-line green"></span>Recovered</span>`
        : `<span class="legend-item"><span class="legend-line warn"></span>Jira Total</span><span class="legend-item"><span class="legend-line info"></span>Jira Recovered</span>`;
      return `<div class="card top-analytics-card">
        <div class="chart-card-head">
          <div>
            ${labelInput('team1', isTasks ? 'chart.tasksTitle' : 'chart.jiraTitle', title)}
            <p class="subtle" style="margin-top:6px">Uses the selected From / To date range below. Choose chart type or expand for clearer viewing.</p>
            <div class="chart-legend" style="margin-top:8px">${legend}</div>
          </div>
          <div class="chart-tools">
            <select class="chart-type-select" onchange="state.teams.team1.${field}=this.value;saveState();renderTeam1();">
              <option value="line" ${t[field]==='line'?'selected':''}>Line</option>
              <option value="bar" ${t[field]==='bar'?'selected':''}>Bar</option>
              <option value="area" ${t[field]==='area'?'selected':''}>Area</option>
            </select>
            <button class="btn small" onclick="openChartModal('${kind}')">Bigger</button>
            ${refreshButton(kind)}
          </div>
        </div>
        <div class="chart-box">${chart}</div>
      </div>`;
    }

    function aggregateTasksReceivedByDate() {
      const t = state.teams.team1;
      const dates = dateRangeArray(t.jiraFrom, t.jiraTo);
      return dates.map(date => {
        let received = 0, recovered = 0;
        (t.tasksReceived || []).forEach(r => {
          if (r.date === date) {
            received += number(r.totalReceived);
            recovered += number(r.totalRecovered);
          }
        });
        return { date, total: received, recovered };
      });
    }

    function renderTasksReceivedRecoveredChart() {
      const type = state.teams.team1.taskChartType || 'line';
      const data = aggregateTasksReceivedByDate();
      if (!data.length) return '<div class="empty">Choose a valid From Date and To Date in the Jira Inputs section.</div>';
      if (data.every(d => d.total === 0 && d.recovered === 0)) return '<div class="empty">No task received or recovered values inside the selected date range yet.</div>';
      return renderSvgChart(data, type, 'total', 'recovered');
    }

    function openChartModal(kind) {
      const modal = document.getElementById('chartModal');
      const title = kind === 'tasks' ? getLabel('team1','chart.tasksTitle','Tasks Received / Recovered') : getLabel('team1','chart.jiraTitle','Jira Total / Recovered');
      const chart = kind === 'tasks' ? renderTasksReceivedRecoveredChart() : renderJiraChart();
      modal.innerHTML = `<div class="chart-modal-panel">
        <div class="card-head wrap" style="margin-bottom:12px"><h3>${esc(title)}</h3><button class="btn small" onclick="closeChartModal()">Close</button></div>
        <div class="chart-box large">${chart}</div>
      </div>`;
      document.body.classList.add('modal-open');
    }

    function closeChartModal() {
      const modal = document.getElementById('chartModal');
      if (modal) modal.innerHTML = '';
      document.body.classList.remove('modal-open');
    }

    function renderMultiSeriesSvgChart(data, type, series) {
      const w = 920, h = 310, left = 54, right = 24, top = 24, bottom = 50;
      const plotW = w - left - right, plotH = h - top - bottom;
      const maxY = Math.max(1, ...data.flatMap(d => series.map(s => number(d[s.key]))));
      const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW;
      const x = i => left + (data.length === 1 ? plotW / 2 : i * stepX);
      const y = val => top + plotH - (number(val) / maxY) * plotH;
      const linePath = key => data.map((d,i) => `${i===0?'M':'L'} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(' ');
      const ticks = [0,.25,.5,.75,1];
      const marks = ticks.map(t => `<line x1="${left}" y1="${top+plotH-(t*plotH)}" x2="${w-right}" y2="${top+plotH-(t*plotH)}" stroke="rgba(255,255,255,.08)"/><text x="12" y="${top+plotH-(t*plotH)+4}" fill="#9aa8c4" font-size="11">${Math.round(maxY*t)}</text>`).join('');
      const labels = data.map((d,i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 ? `<text x="${x(i)}" y="${h-18}" text-anchor="middle" fill="#9aa8c4" font-size="10">${esc(d.date.slice(5))}</text>` : '').join('');
      let body = '';
      if (type === 'bar') {
        const bw = Math.max(5, Math.min(16, plotW / Math.max(data.length,1) / (series.length + 1)));
        body = data.map((d,i) => series.map((s,si) => {
          const offset = (si - (series.length - 1) / 2) * (bw + 2);
          return `<rect x="${x(i)+offset}" y="${y(d[s.key])}" width="${bw}" height="${top+plotH-y(d[s.key])}" rx="4" fill="${s.color}" opacity=".84"/>`;
        }).join('')).join('');
      } else if (type === 'area') {
        body = series.map(s => {
          const areaPath = `${linePath(s.key)} L ${x(data.length-1).toFixed(1)} ${top+plotH} L ${x(0).toFixed(1)} ${top+plotH} Z`;
          return `<path d="${areaPath}" fill="${s.color}" opacity=".10"/><path d="${linePath(s.key)}" fill="none" stroke="${s.color}" stroke-width="2.6"/>`;
        }).join('');
      } else {
        body = series.map(s => `<path d="${linePath(s.key)}" fill="none" stroke="${s.color}" stroke-width="2.8"/>${data.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d[s.key])}" r="3.5" fill="${s.color}"/>`).join('')}`).join('');
      }
      return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Jira and task recovery analytics chart">${marks}<line x1="${left}" y1="${top+plotH}" x2="${w-right}" y2="${top+plotH}" stroke="rgba(255,255,255,.20)"/>${body}${labels}<text x="${left}" y="14" fill="#cbd5e1" font-size="12">Auto-scaled max: ${maxY}</text></svg>`;
    }

    function renderTeam1DailyTasks() {
      const dailyTasks = state.teams.team1.dailyTasks;
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput('team1','section.dailyTasks','1.1 Daily Tasks')}</h3><p class="subtle">Each day supports multiple timestamped entries.</p></div></div>
        <div class="grid day-grid">
          ${days.map(day => `<div class="card day-card">
            <div class="card-head"><h3>${esc(day)}</h3><button class="btn small" onclick="addDailyTask('${day}')">Add</button></div>
            ${(dailyTasks[day] || []).map(entry => `<div class="entry">
              <div class="entry-meta"><span>Created: ${esc(entry.createdAt)}</span>${entry.updatedAt ? `<span>Updated: ${esc(entry.updatedAt)}</span>` : ''}</div>
              <textarea class="auto-grow daily-task-textarea" oninput="updateDailyTask('${day}','${entry.id}',this.value);autoGrow(this)">${esc(entry.text)}</textarea>
              <div style="margin-top:8px"><button class="btn small danger" onclick="deleteDailyTask('${day}','${entry.id}')"><span class="sr-only">Delete</span></button></div>
            </div>`).join('') || `<div class="empty">No entries yet.</div>`}
          </div>`).join('')}
        </div>
      </div>`;
    }

    function addDailyTask(day) {
      state.teams.team1.dailyTasks[day].push({ id: uid(), text: '', createdAt: nowStamp(), updatedAt: '' });
      saveState(); renderCurrentViewPreservingScroll();
    }
    function updateDailyTask(day, id, value) {
      const entry = state.teams.team1.dailyTasks[day].find(x => x.id === id);
      if (!entry) return;
      entry.text = value;
      entry.updatedAt = nowStamp();
      saveState();
    }
    function deleteDailyTask(day, id) {
      state.teams.team1.dailyTasks[day] = state.teams.team1.dailyTasks[day].filter(x => x.id !== id);
      saveState(); renderCurrentViewPreservingScroll();
    }

    function renderTeam1Concerns() {
      const t = state.teams.team1;
      return `<div class="card section concern-card">
        <div class="card-head wrap">
          <div>
            <input class="input inline-input" value="${esc(t.concernsTitle)}" oninput="state.teams.team1.concernsTitle=this.value;saveState();">
            <p class="subtle" style="margin-top:8px">Slim one-line amber concern highlights. Add, edit, or delete each line.</p>
          </div>
          <button class="btn small" onclick="addConcern()">Add Concern</button>
        </div>
        <div class="concern-list">
          ${t.concerns.map(c => `<div class="entry concern-entry">
            <span class="concern-dot"></span>
            <input class="concern-line-input" value="${esc(c.text)}" oninput="updateConcern('${c.id}',this.value)" placeholder="Write one-line concern here...">
            <span class="concern-time">${esc(c.updatedAt ? 'Updated: ' + c.updatedAt : 'Created: ' + c.createdAt)}</span>
            <div class="concern-actions"><button class="btn small danger" onclick="deleteArrayItem('team1','concerns','${c.id}')"><span class="sr-only">Delete</span></button></div>
          </div>`).join('') || `<div class="empty">No concerns added.</div>`}
        </div>
      </div>`;
    }
    function addConcern() { state.teams.team1.concerns.push({ id: uid(), text: '', createdAt: nowStamp(), updatedAt: '' }); saveState(); renderCurrentViewPreservingScroll(); }
    function updateConcern(id, value) { const c = state.teams.team1.concerns.find(x => x.id === id); if (!c) return; c.text = value; c.updatedAt = nowStamp(); saveState(); }

    function renderSystemsActivity() {
      const rows = state.teams.team1.systemsActivity;
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput('team1','section.systemsActivity','1.3 Systems / Machines Activity')}</h3><p class="subtle">Status updates automatically from active/inactive machine counts.</p></div><button class="btn small" onclick="addSystemActivity()">Add System</button></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>${thLabel('team1','systemsActivity.systemName','System Name')}</th><th>${thLabel('team1','systemsActivity.description','Description')}</th><th>${thLabel('team1','systemsActivity.active','Machines Active')}</th><th>${thLabel('team1','systemsActivity.inactive','Machines Inactive')}</th><th>${thLabel('team1','systemsActivity.status','Status Indicator')}</th><th>${thLabel('team1','systemsActivity.action','Action')}</th></tr></thead>
            <tbody>
              ${rows.map(r => `<tr>
                <td><input class="cell-input" value="${esc(r.systemName)}" oninput="updateTeam1Array('systemsActivity','${r.id}','systemName',this.value)"></td>
                <td><input class="cell-input" value="${esc(r.description)}" oninput="updateTeam1Array('systemsActivity','${r.id}','description',this.value)"></td>
                <td><input class="cell-input cell-small" type="number" value="${esc(r.active)}" oninput="updateTeam1Array('systemsActivity','${r.id}','active',this.value,true)"></td>
                <td><input class="cell-input cell-small" type="number" value="${esc(r.inactive)}" oninput="updateTeam1Array('systemsActivity','${r.id}','inactive',this.value,true)"></td>
                <td>${machineStatusBadge(r.active, r.inactive)}</td>
                <td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('team1','systemsActivity','${r.id}')"><span class="sr-only">Delete</span></button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    }
    function machineStatusBadge(active, inactive) {
      active = number(active); inactive = number(inactive);
      if (inactive === 0 && active > 0) return `<span class="status-badge status-good"><span class="dot good"></span>All Active</span>`;
      if (inactive > 0 && active === 0) return `<span class="status-badge status-bad"><span class="dot bad"></span>Inactive</span>`;
      if (inactive > 0 && active > 0) return `<span class="status-badge status-warn"><span class="dot warn"></span>Partial</span>`;
      return `<span class="status-badge"><span class="dot"></span>No Data</span>`;
    }
    function addSystemActivity() { state.teams.team1.systemsActivity.push({ id: uid(), systemName: 'New System', description: '', active: 0, inactive: 0 }); saveState(); renderCurrentViewPreservingScroll(); }
    function updateTeam1Array(arrayName, id, field, value, numeric) { const item = state.teams.team1[arrayName].find(x => x.id === id); if (!item) return; item[field] = numeric ? number(value) : value; saveState(); if (arrayName === 'systemsActivity' && (field === 'active' || field === 'inactive')) renderTeam1PreservingScroll(); }

    function renderTeam1TasksSummary() {
      const t = state.teams.team1;
      return `<div class="card section">
        <div class="card-head wrap">
          <div><input class="input inline-input" value="${esc(t.tasksSummaryTitle)}" oninput="state.teams.team1.tasksSummaryTitle=this.value;saveState();"><p class="subtle" style="margin-top:8px">Received, ongoing, urgent and recovered task tracking.</p></div>
        </div>
        <div class="grid four section">
          <div class="card kpi"><span class="label">${labelInput('team1','summary.receivedRows','Received Rows')}</span><span class="value">${t.tasksReceived.length}</span><span class="subtle">Tasks received this week</span></div>
          <div class="card kpi"><span class="label">${labelInput('team1','summary.ongoing','Ongoing')}</span><span class="value">${t.ongoingTasks.length}</span><span class="subtle">Total ongoing tasks this week</span></div>
          <div class="card kpi"><span class="label">${labelInput('team1','summary.urgent','Urgent')}</span><span class="value">${t.urgentTasks.length}</span><span class="subtle">Highlighted deadlines</span></div>
          <div class="card kpi"><span class="label">${labelInput('team1','summary.recoveredSystems','Recovered Systems')}</span><span class="value">${t.recoveredSystems.reduce((a,b)=>a+number(b.recoveredCount),0)}</span><span class="subtle">Count + details</span></div>
        </div>
        ${renderTasksReceivedTable()}
        <div class="grid three section">
          ${renderOngoingTasks()}
          ${renderUrgentTasks()}
          ${renderRecoveredSystems()}
        </div>
      </div>`;
    }

    function renderTasksReceivedTable() {
      const t = state.teams.team1;
      const cols = t.tasksReceivedColumns || Object.keys(taskReceivedColumnMap);
      return `<div class="section">
        <div class="card-head"><h3>${labelInput('team1','section.tasksReceived','A. Tasks Received This Week')}</h3><button class="btn small" onclick="addTaskReceived()">Add Row</button></div>
        <div class="table-wrap">
          <table>
            <thead><tr>${cols.map((key, idx) => `<th><span class="th-tools">${thLabel('team1','tasksReceived.' + key, taskReceivedColumnMap[key].label)} <button class="mini" onclick="moveReceivedColumn(${idx},-1)">←</button><button class="mini" onclick="moveReceivedColumn(${idx},1)">→</button></span></th>`).join('')}<th>${thLabel('team1','tasksReceived.action','Action')}</th></tr></thead>
            <tbody>
            ${t.tasksReceived.map(row => `<tr class="${row.urgent === 'Yes' ? 'urgent-row' : ''}">
              ${cols.map(key => `<td>${renderReceivedCell(row, key)}</td>`).join('')}
              <td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('team1','tasksReceived','${row.id}')"><span class="sr-only">Delete</span></button></td>
            </tr>`).join('') || `<tr><td colspan="${cols.length + 1}"><div class="empty">No rows added.</div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;
    }

    function renderReceivedCell(row, key) {
      const col = taskReceivedColumnMap[key];
      const value = row[key] ?? '';
      const inputType = col.type === 'select' ? 'text' : col.type;
      return `<input class="cell-input" type="${inputType}" value="${esc(value)}" oninput="updateTaskReceived('${row.id}','${key}',this.value)">`;
    }
    function moveReceivedColumn(index, direction) {
      const cols = state.teams.team1.tasksReceivedColumns;
      const next = index + direction;
      if (next < 0 || next >= cols.length) return;
      [cols[index], cols[next]] = [cols[next], cols[index]];
      saveState(); renderCurrentViewPreservingScroll();
    }
    function addTaskReceived() {
      state.teams.team1.tasksReceived.push({ id: uid(), date: todayISO(), refNumber: '', caseName: '', totalReceived: 0, totalRecovered: 0, complexity: 'Medium', urgent: 'No', saifCreated: 'No', progress: 0, resultProgress: 0 });
      saveState(); renderCurrentViewPreservingScroll();
    }
    function updateTaskReceived(id, field, value) {
      const row = state.teams.team1.tasksReceived.find(x => x.id === id);
      if (!row) return;
      row[field] = ['totalReceived','totalRecovered','progress','resultProgress'].includes(field) ? number(value) : value;
      saveState();
    }

    function renderOngoingTasks() {
      const rows = state.teams.team1.ongoingTasks;
      return `<div class="card"><div class="card-head"><h3>${labelInput('team1','section.ongoingTasks','B. Ongoing Tasks')}</h3><button class="btn small" onclick="addOngoingTask()">Add</button></div>
      ${rows.map(r => `<div class="entry"><input class="input" value="${esc(r.name)}" oninput="updateTeam1Array('ongoingTasks','${r.id}','name',this.value)"><div class="grid two" style="margin-top:8px"><input class="input" value="${esc(r.owner)}" oninput="updateTeam1Array('ongoingTasks','${r.id}','owner',this.value)"><input class="input" value="${esc(r.status)}" oninput="updateTeam1Array('ongoingTasks','${r.id}','status',this.value)"></div><input class="input" style="margin-top:8px" type="number" value="${esc(r.progress)}" oninput="updateTeam1Array('ongoingTasks','${r.id}','progress',this.value,true)"><button style="margin-top:8px" class="btn small danger" onclick="deleteArrayItem('team1','ongoingTasks','${r.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No ongoing tasks.</div>'}</div>`;
    }
    function addOngoingTask() { state.teams.team1.ongoingTasks.push({ id: uid(), name: 'New ongoing task', owner: '', status: 'Open', progress: 0 }); saveState(); renderCurrentViewPreservingScroll(); }

    function renderUrgentTasks() {
      const rows = state.teams.team1.urgentTasks;
      return `<div class="card"><div class="card-head"><h3>${labelInput('team1','section.urgentTasks','C. Urgent Tasks')}</h3><button class="btn small" onclick="addUrgentTask()">Add</button></div>
      ${rows.map(r => `<div class="entry" style="border-color:rgba(239,68,68,.28)"><input class="input" value="${esc(r.name)}" oninput="updateTeam1Array('urgentTasks','${r.id}','name',this.value)"><div class="grid two" style="margin-top:8px"><input class="input" type="date" value="${esc(r.deadline)}" oninput="updateTeam1Array('urgentTasks','${r.id}','deadline',this.value)"><input class="input" value="${esc(r.owner)}" oninput="updateTeam1Array('urgentTasks','${r.id}','owner',this.value)"></div><div class="grid two" style="margin-top:8px"><input class="input" value="${esc(r.status)}" oninput="updateTeam1Array('urgentTasks','${r.id}','status',this.value)"><input class="input" type="number" value="${esc(r.progress)}" oninput="updateTeam1Array('urgentTasks','${r.id}','progress',this.value,true)"></div><button style="margin-top:8px" class="btn small danger" onclick="deleteArrayItem('team1','urgentTasks','${r.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No urgent tasks.</div>'}</div>`;
    }
    function addUrgentTask() { state.teams.team1.urgentTasks.push({ id: uid(), name: 'New urgent task', deadline: todayISO(), owner: '', status: 'Open', progress: 0 }); saveState(); renderCurrentViewPreservingScroll(); }

    function renderRecoveredSystems() {
      const rows = state.teams.team1.recoveredSystems;
      return `<div class="card"><div class="card-head"><h3>${labelInput('team1','section.recoveredSystems','D. Recovered Systems')}</h3><button class="btn small" onclick="addRecoveredSystem()">Add</button></div>
      ${rows.map(r => `<div class="entry"><input class="input" value="${esc(r.systemName)}" oninput="updateTeam1Array('recoveredSystems','${r.id}','systemName',this.value)"><div class="grid two" style="margin-top:8px"><input class="input" type="number" value="${esc(r.recoveredCount)}" oninput="updateTeam1Array('recoveredSystems','${r.id}','recoveredCount',this.value,true)"><input class="input" type="date" value="${esc(r.date)}" oninput="updateTeam1Array('recoveredSystems','${r.id}','date',this.value)"></div><textarea style="margin-top:8px;min-height:58px" oninput="updateTeam1Array('recoveredSystems','${r.id}','notes',this.value)">${esc(r.notes)}</textarea><button style="margin-top:8px" class="btn small danger" onclick="deleteArrayItem('team1','recoveredSystems','${r.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No recovered systems.</div>'}</div>`;
    }
    function addRecoveredSystem() { state.teams.team1.recoveredSystems.push({ id: uid(), systemName: 'System', recoveredCount: 0, notes: '', date: todayISO() }); saveState(); renderCurrentViewPreservingScroll(); }

    function renderSystemsOutcomes() {
      const rows = state.teams.team1.systemsOutcomes;
      return `<div class="section">
        <div class="card-head wrap"><div><h3>${labelInput('team1','section.systemsOutcomes','1.5 Systems Outcomes')}</h3><p class="subtle">System outcome cards with editable status and statistics.</p></div><button class="btn small" onclick="addSystemOutcome()">Add New System</button></div>
        <div class="grid three">
          ${rows.map(r => `<div class="card">
            <div class="card-head"><input class="input" value="${esc(r.systemName)}" oninput="updateTeam1Array('systemsOutcomes','${r.id}','systemName',this.value)"><button class="btn small danger" onclick="deleteArrayItem('team1','systemsOutcomes','${r.id}')"><span class="sr-only">Delete</span></button></div>
            <textarea style="min-height:70px" oninput="updateTeam1Array('systemsOutcomes','${r.id}','statusLine',this.value)">${esc(r.statusLine)}</textarea>
            <div class="metric-strip">
              <div class="mini-metric"><input class="input" type="number" value="${esc(r.activeTasks)}" oninput="updateTeam1Array('systemsOutcomes','${r.id}','activeTasks',this.value,true)"><span>${labelInput('team1','systemsOutcomes.activeTasks','Active Tasks')}</span></div>
              <div class="mini-metric"><input class="input" type="number" value="${esc(r.pending)}" oninput="updateTeam1Array('systemsOutcomes','${r.id}','pending',this.value,true)"><span>${labelInput('team1','systemsOutcomes.pending','Pending')}</span></div>
              <div class="mini-metric"><input class="input" type="number" value="${esc(r.completed)}" oninput="updateTeam1Array('systemsOutcomes','${r.id}','completed',this.value,true)"><span>${labelInput('team1','systemsOutcomes.completed','Completed')}</span></div>
            </div>
          </div>`).join('')}
        </div>
      </div>`;
    }
    function addSystemOutcome() { state.teams.team1.systemsOutcomes.push({ id: uid(), systemName: 'New System', statusLine: 'Status line', activeTasks: 0, pending: 0, completed: 0 }); saveState(); renderCurrentViewPreservingScroll(); }

    function renderJiraSection() {
      const t = state.teams.team1;
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput('team1','section.jiraInputs','1.6 Jira Inputs / Range Data')}</h3><p class="subtle">Keep Jira date range records here. The two top charts use this selected date range.</p></div><button class="btn small" onclick="addJiraRecord()">Add Range Data</button></div>
        <div class="grid three">
          <label class="subtle">${labelInput('team1','jiraFilter.from','From Date')}<input class="input" type="date" value="${esc(t.jiraFrom)}" oninput="state.teams.team1.jiraFrom=this.value;saveState();renderTeam1PreservingScroll();"></label>
          <label class="subtle">${labelInput('team1','jiraFilter.to','To Date')}<input class="input" type="date" value="${esc(t.jiraTo)}" oninput="state.teams.team1.jiraTo=this.value;saveState();renderTeam1PreservingScroll();"></label>
          <div class="pill-row" style="align-items:end"><span class="pill"><span class="dot"></span>Total Tasks</span><span class="pill"><span class="dot good"></span>Recovered</span></div>
        </div>
        <div class="section table-wrap">
          <table>
            <thead><tr><th>${thLabel('team1','jira.from','From Date')}</th><th>${thLabel('team1','jira.to','To Date')}</th><th>${thLabel('team1','jira.totalTasks','Total Tasks Count')}</th><th>${thLabel('team1','jira.recoveredTasks','Recovered Tasks Count')}</th><th>${thLabel('team1','jira.notes','Notes')}</th><th>${thLabel('team1','jira.action','Action')}</th></tr></thead>
            <tbody>${t.jiraRecords.map(r => `<tr><td><input class="cell-input" type="date" value="${esc(r.from)}" oninput="updateJira('${r.id}','from',this.value)"></td><td><input class="cell-input" type="date" value="${esc(r.to)}" oninput="updateJira('${r.id}','to',this.value)"></td><td><input class="cell-input" type="number" value="${esc(r.totalTasks)}" oninput="updateJira('${r.id}','totalTasks',this.value,true)"></td><td><input class="cell-input" type="number" value="${esc(r.recoveredTasks)}" oninput="updateJira('${r.id}','recoveredTasks',this.value,true)"></td><td><input class="cell-input" value="${esc(r.notes)}" oninput="updateJira('${r.id}','notes',this.value)"></td><td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('team1','jiraRecords','${r.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">No Jira records.</div></td></tr>'}</tbody>
          </table>
        </div>
      </div>`;
    }
    function addJiraRecord() { state.teams.team1.jiraRecords.push({ id: uid(), from: todayISO(), to: todayISO(), totalTasks: 0, recoveredTasks: 0, notes: '' }); saveState(); renderCurrentViewPreservingScroll(); }
    function updateJira(id, field, value, numeric) { const r = state.teams.team1.jiraRecords.find(x => x.id === id); if (!r) return; r[field] = numeric ? number(value) : value; saveState(); renderJiraOnly(); }
    function renderJiraOnly() { if (currentView === 'team1') renderTeam1PreservingScroll(); }

    function dateRangeArray(from, to) {
      const out = [];
      let start = from ? parseISODate(from) : null;
      let end = to ? parseISODate(to) : null;
      if (!start || !end || isNaN(start) || isNaN(end) || start > end) return out;
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      while (start <= end) { out.push(formatISODate(start)); start.setDate(start.getDate() + 1); }
      return out;
    }
    function aggregateJiraByDate() {
      const t = state.teams.team1;
      const dates = dateRangeArray(t.jiraFrom, t.jiraTo);
      return dates.map(date => {
        let total = 0, recovered = 0;
        t.jiraRecords.forEach(r => {
          if (r.from && r.to && date >= r.from && date <= r.to) { total += number(r.totalTasks); recovered += number(r.recoveredTasks); }
        });
        return { date, total, recovered };
      });
    }

    function renderJiraChart() {
      const type = state.teams.team1.jiraChartType || 'line';
      const data = aggregateJiraByDate();
      if (!data.length) return '<div class="empty">Choose a valid date range to show the chart.</div>';
      if (data.every(d => d.total === 0 && d.recovered === 0)) return '<div class="empty">No Jira values inside the selected date range yet.</div>';
      return renderSvgChart(data, type, 'total', 'recovered');
    }

    function renderSvgChart(data, type, keyA, keyB) {
      const w = 900, h = 300, left = 54, right = 24, top = 24, bottom = 48;
      const plotW = w - left - right, plotH = h - top - bottom;
      const maxY = Math.max(1, ...data.map(d => Math.max(number(d[keyA]), number(d[keyB]))));
      const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW;
      const x = i => left + (data.length === 1 ? plotW / 2 : i * stepX);
      const y = val => top + plotH - (number(val) / maxY) * plotH;
      const linePath = key => data.map((d,i) => `${i===0?'M':'L'} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(' ');
      const areaPath = key => `${linePath(key)} L ${x(data.length-1).toFixed(1)} ${top+plotH} L ${x(0).toFixed(1)} ${top+plotH} Z`;
      const ticks = [0,.25,.5,.75,1];
      let marks = ticks.map(t => `<line x1="${left}" y1="${top+plotH-(t*plotH)}" x2="${w-right}" y2="${top+plotH-(t*plotH)}" stroke="rgba(255,255,255,.08)"/><text x="12" y="${top+plotH-(t*plotH)+4}" fill="#9aa8c4" font-size="11">${Math.round(maxY*t)}</text>`).join('');
      let labels = data.map((d,i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 ? `<text x="${x(i)}" y="${h-18}" text-anchor="middle" fill="#9aa8c4" font-size="10">${esc(d.date.slice(5))}</text>` : '').join('');
      let body = '';
      if (type === 'bar') {
        const bw = Math.max(8, Math.min(28, plotW / Math.max(data.length,1) / 3));
        body = data.map((d,i) => `<rect x="${x(i)-bw-2}" y="${y(d[keyA])}" width="${bw}" height="${top+plotH-y(d[keyA])}" rx="4" fill="#60a5fa" opacity=".82"/><rect x="${x(i)+2}" y="${y(d[keyB])}" width="${bw}" height="${top+plotH-y(d[keyB])}" rx="4" fill="#22c55e" opacity=".82"/>`).join('');
      } else if (type === 'area') {
        body = `<path d="${areaPath(keyA)}" fill="#60a5fa" opacity=".18"/><path d="${areaPath(keyB)}" fill="#22c55e" opacity=".18"/><path d="${linePath(keyA)}" fill="none" stroke="#60a5fa" stroke-width="3"/><path d="${linePath(keyB)}" fill="none" stroke="#22c55e" stroke-width="3"/>`;
      } else {
        body = `<path d="${linePath(keyA)}" fill="none" stroke="#60a5fa" stroke-width="3"/><path d="${linePath(keyB)}" fill="none" stroke="#22c55e" stroke-width="3"/>${data.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d[keyA])}" r="4" fill="#60a5fa"/><circle cx="${x(i)}" cy="${y(d[keyB])}" r="4" fill="#22c55e"/>`).join('')}`;
      }
      return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Task analytics chart">${marks}<line x1="${left}" y1="${top+plotH}" x2="${w-right}" y2="${top+plotH}" stroke="rgba(255,255,255,.20)"/>${body}${labels}<text x="${left}" y="14" fill="#cbd5e1" font-size="12">Auto-scaled max: ${maxY}</text></svg>`;
    }

    function renderGenericTeam(teamKey) {
      const t = state.teams[teamKey];
      document.getElementById(teamKey).innerHTML = `
        ${teamPageTitle('team1', `<button class="btn primary" onclick="showView('overview')">Open Overview</button>`)}
        ${renderEditableSummary(teamKey)}
        ${renderGenericTasks(teamKey)}
        ${renderTeamRisks(teamKey)}
        ${renderAvailability(teamKey)}
      `;
    }

    function renderGenericTasks(teamKey) {
      const rows = state.teams[teamKey].genericTasks || [];
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput(teamKey,'section.taskList','Task List')}</h3><p class="subtle">Priority, owner, due date, status and progress.</p></div><button class="btn small" onclick="addGenericTask('${teamKey}')">Add Task</button></div>
        <div class="table-wrap"><table>
          <thead><tr><th>${thLabel(teamKey,'generic.task','Task')}</th><th>${thLabel(teamKey,'generic.owner','Owner')}</th><th>${thLabel(teamKey,'generic.priority','Priority')}</th><th>${thLabel(teamKey,'generic.status','Status')}</th><th>${thLabel(teamKey,'generic.due','Due Date')}</th><th>${thLabel(teamKey,'generic.progress','Progress %')}</th><th>${thLabel(teamKey,'generic.action','Action')}</th></tr></thead>
          <tbody>${rows.map(r => `<tr><td><input class="cell-input" value="${esc(r.title)}" oninput="updateArrayItem('${teamKey}','genericTasks','${r.id}','title',this.value)"></td><td><input class="cell-input" value="${esc(r.owner)}" oninput="updateArrayItem('${teamKey}','genericTasks','${r.id}','owner',this.value)"></td><td><input class="cell-input" value="${esc(r.priority)}" oninput="updateArrayItem('${teamKey}','genericTasks','${r.id}','priority',this.value)"></td><td><input class="cell-input" value="${esc(r.status)}" oninput="updateArrayItem('${teamKey}','genericTasks','${r.id}','status',this.value)"></td><td><input class="cell-input" type="date" value="${esc(r.due)}" oninput="updateArrayItem('${teamKey}','genericTasks','${r.id}','due',this.value)"></td><td><input class="cell-input" type="number" value="${esc(r.progress)}" oninput="updateArrayItem('${teamKey}','genericTasks','${r.id}','progress',this.value)"></td><td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('${teamKey}','genericTasks','${r.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || `<tr><td colspan="7"><div class="empty">No tasks yet.</div></td></tr>`}</tbody>
        </table></div>
      </div>`;
    }
    function addGenericTask(teamKey) { state.teams[teamKey].genericTasks.push({ id: uid(), title: 'New task', owner: '', priority: 'Medium', status: 'Open', due: todayISO(), progress: 0 }); saveState(); renderCurrentViewPreservingScroll(); }

    function renderTeamRisks(teamKey) {
      const rows = state.teams[teamKey].risks || [];
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput(teamKey,'section.risks','Risks / Blockers')}</h3><p class="subtle">Add risks, owners, severity, status and notes.</p></div><button class="btn small" onclick="addRisk('${teamKey}')">Add Risk</button></div>
        <div class="table-wrap"><table>
          <thead><tr><th>${thLabel(teamKey,'risks.title','Risk / Blocker')}</th><th>${thLabel(teamKey,'risks.owner','Owner')}</th><th>${thLabel(teamKey,'risks.severity','Severity')}</th><th>${thLabel(teamKey,'risks.status','Status')}</th><th>${thLabel(teamKey,'risks.due','Due')}</th><th>${thLabel(teamKey,'risks.notes','Notes')}</th><th>${thLabel(teamKey,'risks.action','Action')}</th></tr></thead>
          <tbody>${rows.map(r => `<tr><td><input class="cell-input" value="${esc(r.title)}" oninput="updateArrayItem('${teamKey}','risks','${r.id}','title',this.value)"></td><td><input class="cell-input" value="${esc(r.owner)}" oninput="updateArrayItem('${teamKey}','risks','${r.id}','owner',this.value)"></td><td><input class="cell-input" value="${esc(r.severity)}" oninput="updateArrayItem('${teamKey}','risks','${r.id}','severity',this.value)"></td><td><input class="cell-input" value="${esc(r.status)}" oninput="updateArrayItem('${teamKey}','risks','${r.id}','status',this.value)"></td><td><input class="cell-input" type="date" value="${esc(r.due)}" oninput="updateArrayItem('${teamKey}','risks','${r.id}','due',this.value)"></td><td><input class="cell-input" value="${esc(r.notes)}" oninput="updateArrayItem('${teamKey}','risks','${r.id}','notes',this.value)"></td><td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('${teamKey}','risks','${r.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || `<tr><td colspan="7"><div class="empty">No risks yet.</div></td></tr>`}</tbody>
        </table></div>
      </div>`;
    }
    function addRisk(teamKey) { state.teams[teamKey].risks.push({ id: uid(), title: 'New risk', owner: '', severity: 'Medium', status: 'Open', due: todayISO(), notes: '' }); saveState(); renderCurrentViewPreservingScroll(); }

    function renderAvailability(teamKey) {
      const rows = state.teams[teamKey].availability || [];
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput(teamKey,'section.availability','People Availability / Vacations')}</h3><p class="subtle">Track availability, days off and coverage notes.</p></div><button class="btn small" onclick="addAvailability('${teamKey}')">Add Person</button></div>
        <div class="table-wrap"><table>
          <thead><tr><th>${thLabel(teamKey,'availability.name','Name')}</th><th>${thLabel(teamKey,'availability.status','Status')}</th><th>${thLabel(teamKey,'availability.from','From')}</th><th>${thLabel(teamKey,'availability.to','To')}</th><th>${thLabel(teamKey,'availability.notes','Notes')}</th><th>${thLabel(teamKey,'availability.action','Action')}</th></tr></thead>
          <tbody>${rows.map(r => `<tr><td><input class="cell-input" value="${esc(r.name)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','name',this.value)"></td><td><input class="cell-input" value="${esc(r.status)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','status',this.value)"></td><td><input class="cell-input" type="date" value="${esc(r.from)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','from',this.value)"></td><td><input class="cell-input" type="date" value="${esc(r.to)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','to',this.value)"></td><td><input class="cell-input" value="${esc(r.notes)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','notes',this.value)"></td><td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('${teamKey}','availability','${r.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || `<tr><td colspan="6"><div class="empty">No availability records.</div></td></tr>`}</tbody>
        </table></div>
      </div>`;
    }
    function addAvailability(teamKey) { state.teams[teamKey].availability.push({ id: uid(), name: 'Team Member', status: 'Available', from: todayISO(), to: todayISO(), notes: '' }); saveState(); renderCurrentViewPreservingScroll(); }

    function renderOverview() {
      const totals = calculateOverviewTotals();
      document.getElementById('overview').innerHTML = `
        ${pageTitle('Overview', 'Aggregated executive-style view across Team 1, Team 2 and Team 3.')}
        <div class="grid four section">
          <div class="card kpi"><span class="label">Total Tasks</span><span class="value">${totals.totalTasks}</span><span class="subtle">Across all teams</span></div>
          <div class="card kpi"><span class="label">Ongoing Tasks</span><span class="value">${totals.ongoing}</span><span class="subtle">Open / In progress</span></div>
          <div class="card kpi"><span class="label">Urgent Tasks</span><span class="value">${totals.urgent}</span><span class="subtle">Highlighted by teams</span></div>
          <div class="card kpi"><span class="label">Open Risks</span><span class="value">${totals.openRisks}</span><span class="subtle">Active blockers</span></div>
        </div>
        <div class="grid two section">
          <div class="card">
            <div class="card-head"><h3>Team Comparison</h3></div>
            <div class="chart-box">${renderOverviewBarChart(totals.teamRows)}</div>
          </div>
          <div class="card">
            <div class="card-head"><h3>Team Summaries</h3></div>
            ${Object.entries(state.teams).map(([key,t]) => `<div class="entry"><div class="card-head"><h3>${esc(t.name)}</h3><button class="btn small" onclick="showView('${key}')">Open</button></div><p class="subtle">${esc(t.weeklySummary || 'No summary')}</p></div>`).join('')}
          </div>
        </div>
        <div class="grid two section">
          <div class="card">
            <div class="card-head"><h3>Important Risks and Urgent Items</h3></div>
            ${renderImportantItems()}
          </div>
          <div class="card">
            <div class="card-head"><h3>System Health / Recovery</h3></div>
            ${renderOverviewSystemHealth()}
          </div>
        </div>
        <div class="card section">
          <div class="card-head"><h3>Team 1 Jira Analytics Preview</h3></div>
          <div class="chart-box">${renderJiraChart()}</div>
        </div>
      `;
    }

    function calculateOverviewTotals() {
      const rows = [];
      let totalTasks = 0, ongoing = 0, urgent = 0, openRisks = 0;
      Object.entries(state.teams).forEach(([key, t]) => {
        const taskCount = key === 'team1' ? (t.tasksReceived.length + t.ongoingTasks.length + t.urgentTasks.length) : (t.genericTasks || []).length;
        const ongoingCount = key === 'team1' ? t.ongoingTasks.length : (t.genericTasks || []).filter(x => x.status !== 'Done').length;
        const urgentCount = key === 'team1' ? t.urgentTasks.length + t.tasksReceived.filter(x => x.urgent === 'Yes').length : (t.genericTasks || []).filter(x => x.priority === 'Critical' || x.priority === 'High').length;
        const riskCount = (t.risks || []).filter(x => x.status !== 'Closed' && x.status !== 'Mitigated').length;
        const progress = averageProgressForTeam(key);
        rows.push({ name: t.name, taskCount, urgentCount, riskCount, progress });
        totalTasks += taskCount; ongoing += ongoingCount; urgent += urgentCount; openRisks += riskCount;
      });
      return { totalTasks, ongoing, urgent, openRisks, teamRows: rows };
    }

    function averageProgressForTeam(teamKey) {
      const t = state.teams[teamKey];
      let vals = [];
      if (teamKey === 'team1') {
        vals = vals.concat(t.tasksReceived.map(x => number(x.progress)), t.ongoingTasks.map(x => number(x.progress)), t.urgentTasks.map(x => number(x.progress)));
      } else {
        vals = (t.genericTasks || []).map(x => number(x.progress));
      }
      if (!vals.length) return 0;
      return Math.round(vals.reduce((a,b)=>a+b,0) / vals.length);
    }

    function renderOverviewBarChart(rows) {
      const data = rows.map(r => ({ date: r.name, total: r.taskCount, recovered: r.progress }));
      if (!rows.length) return '<div class="empty">No overview data.</div>';
      const w = 900, h = 300, left = 54, right = 24, top = 24, bottom = 50;
      const plotW = w-left-right, plotH = h-top-bottom;
      const maxY = Math.max(1, ...rows.map(r => Math.max(r.taskCount, r.urgentCount, r.riskCount, r.progress)));
      const gap = plotW / rows.length;
      const bw = Math.min(50, gap / 5);
      const y = val => top + plotH - (number(val)/maxY)*plotH;
      const bars = rows.map((r,i) => { const cx = left + gap*i + gap/2; return `<rect x="${cx-bw*1.7}" y="${y(r.taskCount)}" width="${bw}" height="${top+plotH-y(r.taskCount)}" rx="5" fill="#60a5fa"/><rect x="${cx-bw*.5}" y="${y(r.urgentCount)}" width="${bw}" height="${top+plotH-y(r.urgentCount)}" rx="5" fill="#ef4444"/><rect x="${cx+bw*.7}" y="${y(r.progress)}" width="${bw}" height="${top+plotH-y(r.progress)}" rx="5" fill="#22c55e"/><text x="${cx}" y="${h-18}" text-anchor="middle" fill="#9aa8c4" font-size="12">${esc(r.name)}</text>`; }).join('');
      return `<svg viewBox="0 0 ${w} ${h}"><text x="${left}" y="15" fill="#cbd5e1" font-size="12">Blue: tasks / Red: urgent / Green: progress %</text><line x1="${left}" y1="${top+plotH}" x2="${w-right}" y2="${top+plotH}" stroke="rgba(255,255,255,.2)"/>${bars}</svg>`;
    }

    function renderImportantItems() {
      const items = [];
      Object.entries(state.teams).forEach(([key,t]) => {
        (t.risks || []).filter(r => r.status !== 'Closed' && r.status !== 'Mitigated').forEach(r => items.push({ team: t.name, title: r.title, meta: `${r.severity} / ${r.status}`, view: key }));
      });
      state.teams.team1.urgentTasks.forEach(r => items.push({ team: 'Team 1', title: r.name, meta: `Deadline: ${r.deadline} / ${r.status}`, view: 'team1' }));
      if (!items.length) return '<div class="empty">No urgent items or open risks.</div>';
      return items.slice(0, 12).map(i => `<div class="entry"><div class="card-head"><div><strong>${esc(i.team)}</strong><p class="subtle">${esc(i.title)} — ${esc(i.meta)}</p></div><button class="btn small" onclick="showView('${i.view}')">Open</button></div></div>`).join('');
    }

    function renderOverviewSystemHealth() {
      const t = state.teams.team1;
      const inactive = t.systemsActivity.reduce((a,b)=>a+number(b.inactive),0);
      const active = t.systemsActivity.reduce((a,b)=>a+number(b.active),0);
      const recovered = t.recoveredSystems.reduce((a,b)=>a+number(b.recoveredCount),0);
      return `<div class="grid three"><div class="mini-metric"><strong>${active}</strong><span>Machines Active</span></div><div class="mini-metric"><strong>${inactive}</strong><span>Machines Inactive</span></div><div class="mini-metric"><strong>${recovered}</strong><span>Recovered Systems</span></div></div>
      <div class="section">${t.systemsActivity.map(s => `<div class="entry"><div class="card-head"><strong>${esc(s.systemName)}</strong>${machineStatusBadge(s.active,s.inactive)}</div><p class="subtle">${esc(s.description)}</p></div>`).join('')}</div>`;
    }

    function exportJSON() {
      saveState();
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weekly-dashboard-data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function importJSON(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function() {
        try {
          const imported = JSON.parse(reader.result);
          if (!imported || !imported.teams) throw new Error('Invalid dashboard data file');
          state = migrateDashboardState(imported);
          saveState();
          render();
          alert('Dashboard data imported successfully.');
        } catch (error) {
          alert('Import failed. Please choose a valid exported dashboard JSON file.');
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    }

    function resetDemoData() {
      if (!confirm('Reset all local dashboard data to demo data? This cannot be undone unless you already exported JSON.')) return;
      state = migrateDashboardState(createDefaultState());
      saveState();
      render();
    }



    /* ===== Team 2 / Team 3 expansion and export layer ===== */
    function blankDailyObject() {
      const obj = {};
      days.forEach(day => obj[day] = []);
      return obj;
    }
    function makeFlexTable(defaultColumns, sampleRows) {
      const columns = defaultColumns.map(c => ({ id: uid(), label: c.label, type: c.type || 'text', locked: false }));
      const rows = (sampleRows || []).map(sample => {
        const values = {};
        columns.forEach((col, idx) => { values[col.id] = sample[idx] ?? ''; });
        return { id: uid(), values };
      });
      return { columns, rows };
    }
    function ensureFlexTable(obj, key, defaults, sampleRows) {
      if (!obj[key] || !Array.isArray(obj[key].columns) || !Array.isArray(obj[key].rows)) {
        obj[key] = makeFlexTable(defaults, sampleRows || []);
      }
      obj[key].columns.forEach(col => { col.type = col.type || 'text'; col.label = col.label || 'Column'; });
      obj[key].rows.forEach(row => { row.values = row.values || {}; obj[key].columns.forEach(col => { if (row.values[col.id] === undefined) row.values[col.id] = ''; }); });
      return obj[key];
    }
    function ensureDailyForTeam(teamKey) {
      const t = state.teams[teamKey];
      t.dailyTasks = t.dailyTasks || blankDailyObject();
      days.forEach(day => t.dailyTasks[day] = t.dailyTasks[day] || []);
    }
    function ensurePeopleAndTna(t) {
      ensureFlexTable(t, 'personnelTable', [
        { label: 'ID', type: 'text' }, { label: 'Name', type: 'text' }, { label: 'Role', type: 'text' }
      ], [['001','Team Member','Role']]);
      ensureFlexTable(t, 'tnaTable', [
        { label: 'ID Manual', type: 'text' }, { label: 'Date of Entry', type: 'date' }, { label: 'Total Requests', type: 'number' }, { label: 'Status', type: 'text' }, { label: 'Comment', type: 'text' }
      ], [['TNA-001', todayISO(), '0', 'Open', '']]);
    }
    function ensureTeam2(t, weekStart) {
      t.name = t.name || 'Team 2';
      t.subtitle = t.subtitle || 'Weekly tasks, requests, statistics and internal operations';
      t.weeklySummary = t.weeklySummary || `Team 2 weekly summary for ${formatShortDate(weekStart)} - ${formatShortDate(addDaysISO(weekStart, 6))}.`;
      t.notes = t.notes || '';
      t.labels = t.labels || {};
      t.dailyTasks = t.dailyTasks || blankDailyObject();
      days.forEach(day => t.dailyTasks[day] = t.dailyTasks[day] || []);
      ensureFlexTable(t, 'requestedTasksTable', [
        { label: 'Task Name', type: 'text' }, { label: 'Start Date', type: 'date' }, { label: 'End Date', type: 'date' }, { label: 'Ref Number', type: 'text' }, { label: 'Requested From', type: 'text' }, { label: 'Input 1', type: 'text' }, { label: 'Input 2', type: 'text' }
      ], [['New requested task', weekStart, addDaysISO(weekStart, 2), 'REF-001', 'Requester', '', '']]);
      t.statsChartType = t.statsChartType || 'bar';
      t.statsRows = t.statsRows || [
        { id: uid(), period: 'Mon', input1Received: 8, input1Analyzed: 5, input2Received: 6, input2Analyzed: 3 },
        { id: uid(), period: 'Tue', input1Received: 10, input1Analyzed: 7, input2Received: 5, input2Analyzed: 4 }
      ];
      t.resultsChartType = t.resultsChartType || 'horizontal';
      t.resultsModules = t.resultsModules || [
        { id: uid(), moduleName: 'Module 1', resultValue: 72 },
        { id: uid(), moduleName: 'Module 2', resultValue: 55 }
      ];
      t.systemChartType = t.systemChartType || 'bar';
      t.systemResults = t.systemResults || [
        { id: uid(), systemName: 'System 1', count: 10 },
        { id: uid(), systemName: 'System 2', count: 6 }
      ];
      ensureFlexTable(t, 'internalTaskTable', [
        { label: 'Task Name', type: 'text' }, { label: 'Tool Used', type: 'text' }, { label: 'Total', type: 'number' }, { label: 'Comments', type: 'text' }
      ], [['Internal task', 'Tool', '0', '']]);
      t.risks = t.risks || [];
      t.availability = t.availability || [];
      ensurePeopleAndTna(t);
    }
    function ensureTeam3(t, weekStart) {
      t.name = t.name || 'Team 3';
      t.subtitle = t.subtitle || 'Weekly operations, statuses, logs, maintenance and request tracking';
      t.weeklySummary = t.weeklySummary || `Team 3 weekly summary for ${formatShortDate(weekStart)} - ${formatShortDate(addDaysISO(weekStart, 6))}.`;
      t.notes = t.notes || '';
      t.labels = t.labels || {};
      t.dailyTasks = t.dailyTasks || blankDailyObject();
      days.forEach(day => t.dailyTasks[day] = t.dailyTasks[day] || []);
      t.operations = t.operations || {
        group1: [{ id: uid(), name: 'Input name', status: 'Green' }],
        group2: [{ id: uid(), name: 'Input name', status: 'Yellow' }]
      };
      t.operations.group1 = t.operations.group1 || [];
      t.operations.group2 = t.operations.group2 || [];
      ensureFlexTable(t, 'logTable', [
        { label: 'Name #', type: 'text' }, { label: 'Name Description', type: 'text' }, { label: 'Status', type: 'text' }, { label: 'Name', type: 'text' }
      ], [['001', 'Description text', 'Pending', 'Yes']]);
      t.bullets = t.bullets || [{ id: uid(), text: 'Add bullet point input here.', createdAt: nowStamp(), updatedAt: '' }];
      t.maintenanceEntries = t.maintenanceEntries || [{ id: uid(), text: 'ATM bank Mushref branch: 2/3 done - ATM bank Al Qana branch 1/1 done', createdAt: nowStamp(), updatedAt: '' }];
      ensureFlexTable(t, 'atmRequestsTable', [
        { label: 'Total Requests', type: 'number' }, { label: 'Done', type: 'number' }, { label: 'Sent to Team', type: 'number' }, { label: 'Pending', type: 'number' }
      ], [['0','0','0','0']]);
      ensureFlexTable(t, 'nameRequestsTable', [
        { label: 'Total Requests', type: 'number' }, { label: 'Done', type: 'number' }, { label: 'Pending', type: 'number' }, { label: 'Assigned To', type: 'text' }
      ], [['0','0','0','Owner']]);
      t.risks = t.risks || [];
      t.availability = t.availability || [];
      ensurePeopleAndTna(t);
    }
    function ensureTeamSchema(teams, weekStart) {
      const fresh = createEmptyWeekTeams(weekStart);
      ['team1','team2','team3'].forEach(key => { teams[key] = teams[key] || fresh[key] || {}; teams[key].labels = teams[key].labels || {}; });
      Object.keys(fresh.team1 || {}).forEach(field => { if (teams.team1[field] === undefined) teams.team1[field] = fresh.team1[field]; });
      days.forEach(day => { teams.team1.dailyTasks = teams.team1.dailyTasks || {}; teams.team1.dailyTasks[day] = teams.team1.dailyTasks[day] || []; });
      teams.team1.tasksReceivedColumns = teams.team1.tasksReceivedColumns || Object.keys(taskReceivedColumnMap);
      teams.team1.taskChartType = teams.team1.taskChartType || 'line';
      teams.team1.jiraChartType = teams.team1.jiraChartType || 'line';
      teams.team1.jiraFrom = teams.team1.jiraFrom || weekStart;
      teams.team1.jiraTo = teams.team1.jiraTo || addDaysISO(weekStart, 6);
      ensurePeopleAndTna(teams.team1);
      ensureTeam2(teams.team2, weekStart);
      ensureTeam3(teams.team3, weekStart);
      return teams;
    }
    function render() {
      applyTheme();
      renderThemeToggle();
      renderLastSaved();
      renderWeekSwitcher();
      renderNavLabels();
      renderHome();
      if (currentView === 'team1') renderTeam1();
      if (currentView === 'team2') renderTeam2();
      if (currentView === 'team3') renderTeam3();
      if (currentView === 'overview') renderOverview();
      requestAnimationFrame(() => { autoGrowAll(); polishDeleteButtons(); });
    }
    function reportButtons(target) {
      return `<div class="report-actions"><button class="btn small" onclick="exportWord('${target}')">Export Word</button><button class="btn small" onclick="printDashboard()">Export / Print PDF</button>${target !== 'overview' ? `<button class="btn small primary" onclick="showView('overview')">Open Overview</button>` : ''}</div>`;
    }
    function refreshGraphs(target = '') {
      saveState();
      if (currentView === 'team1') renderTeam1();
      else if (currentView === 'team2') renderTeam2();
      else if (currentView === 'team3') renderTeam3();
      else if (currentView === 'overview') renderOverview();
      else render();
    }
    function refreshButton(target = '') {
      return `<button type="button" class="btn small refresh-btn" onclick="refreshGraphs('${target}')" title="Refresh this graph from current data"><span class="sr-only">Refresh</span></button>`;
    }

    function polishDeleteButtons(root = document) {
      root.querySelectorAll('button.btn.danger').forEach(btn => {
        const text = (btn.textContent || '').trim().toLowerCase();
        if (!text || text.includes('delete') || text.includes('remove') || text.includes('×')) {
          btn.classList.add('trash-btn');
          btn.setAttribute('title', btn.getAttribute('title') || 'Delete');
          btn.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Delete');
          btn.innerHTML = '🗑';
        }
      });
    }

    function preserveScrollRender(renderFn) {
      const x = window.scrollX || 0;
      const y = window.scrollY || 0;
      try { renderFn(); } finally { requestAnimationFrame(() => window.scrollTo(x, y)); }
    }

    function renderTeam1PreservingScroll() { preserveScrollRender(renderTeam1); }
    function renderCurrentViewPreservingScroll() { preserveScrollRender(render); }
    function renderHome() {
      document.getElementById('home').innerHTML = `
        <div class="hero">
          <h2>Weekly command center for offline team updates.</h2>
          <p>Single HTML file, no internet, no folders, no external JavaScript. Choose a week from the top bar, update each team, export JSON, print PDF, or export a Word-compatible report.</p>
          <div class="pill-row" style="margin-top:18px">
            <span class="pill"><span class="dot good"></span>Offline ready</span>
            <span class="pill"><span class="dot"></span>Auto-save localStorage</span>
            <span class="pill"><span class="dot warn"></span>Week history</span>
            <span class="pill"><span class="dot good"></span>Word / PDF export</span>
          </div>
        </div>
        <div class="grid team-grid">
          ${homeCard(teamDisplayName('team1'),'Operational dashboard with daily tasks, concerns, systems, recovery and Jira analytics.','team1','Open ' + teamDisplayName('team1'))}
          ${homeCard(teamDisplayName('team2'),'Weekly request tracking, statistics, model/module results, system graphs and internal task table.','team2','Open ' + teamDisplayName('team2'))}
          ${homeCard(teamDisplayName('team3'),'Operations status, logs, maintenance notes, request tracking and daily updates.','team3','Open ' + teamDisplayName('team3'))}
          ${homeCard('Overview','Executive view pulling totals, risks, personnel, TNA and important status indicators.','overview','Open Overview', true)}
        </div>`;
    }
    function renderTeam1() {
      const t = state.teams.team1;
      document.getElementById('team1').innerHTML = `
        ${teamPageTitle('team1', reportButtons('team1'))}
        ${renderEditableSummary('team1')}
        ${renderTeam1TopAnalytics()}
        ${renderTeam1DailyTasks()}
        ${renderTeam1Concerns()}
        ${renderSystemsActivity()}
        ${renderTeam1TasksSummary()}
        ${renderSystemsOutcomes()}
        ${renderJiraSection()}
        ${renderTeamRisks('team1')}
        ${renderAvailability('team1')}
        ${renderTnaSection('team1')}
        ${renderPersonnelSection('team1')}
      `;
    }
    function renderTeam2() {
      const t = state.teams.team2;
      document.getElementById('team2').innerHTML = `
        ${teamPageTitle('team2', reportButtons('team2'))}
        ${renderEditableSummary('team2')}
        ${renderDailyEntries('team2', '2.1 Daily Tasks')}
        ${renderFlexTable('team2','requestedTasksTable','team2.requestedTitle','2.2 Requested Tasks Table','Flexible table. Add rows, columns, rename headers and edit all data freely.')}
        ${renderTeam2Stats()}
        ${renderTeam2Results()}
        ${renderTeam2SystemGraph()}
        ${renderFlexTable('team2','internalTaskTable','team2.internalTitle','2.6 Internal Task Table','Flexible internal task table with dynamic columns.')}
        ${renderTeamRisks('team2')}
        ${renderAvailability('team2')}
        ${renderTnaSection('team2')}
        ${renderPersonnelSection('team2')}
      `;
      requestAnimationFrame(() => { autoGrowAll(); polishDeleteButtons(); });
    }
    function renderTeam3() {
      const t = state.teams.team3;
      document.getElementById('team3').innerHTML = `
        ${teamPageTitle('team3', reportButtons('team3'))}
        ${renderEditableSummary('team3')}
        ${renderDailyEntries('team3', '3.1 Daily Tasks')}
        ${renderTeam3Operations()}
        ${renderTeam3LogMaintenance()}
        ${renderTeam3NameOperations()}
        ${renderTeamRisks('team3')}
        ${renderAvailability('team3')}
        ${renderTnaSection('team3')}
        ${renderPersonnelSection('team3')}
      `;
      requestAnimationFrame(() => { autoGrowAll(); polishDeleteButtons(); });
    }
    function renderDailyEntries(teamKey, fallbackTitle) {
      const t = state.teams[teamKey];
      ensureDailyForTeam(teamKey);
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput(teamKey,'section.dailyTasks',fallbackTitle)}</h3><p class="subtle">Each day supports many timestamped free-form entries. Text areas expand automatically.</p></div></div>
        <div class="grid day-grid">
          ${days.map(day => `<div class="card day-card">
            <div class="card-head"><h3>${esc(day)}</h3><button class="btn small" onclick="addTeamDailyEntry('${teamKey}','${day}')">Add</button></div>
            ${(t.dailyTasks[day] || []).map(entry => `<div class="entry">
              <div class="entry-meta"><span>Created: ${esc(entry.createdAt)}</span>${entry.updatedAt ? `<span>Updated: ${esc(entry.updatedAt)}</span>` : ''}</div>
              <textarea class="auto-grow daily-task-textarea" oninput="updateTeamDailyEntry('${teamKey}','${day}','${entry.id}',this.value);autoGrow(this)">${esc(entry.text)}</textarea>
              <div style="margin-top:8px"><button class="btn small danger" onclick="deleteTeamDailyEntry('${teamKey}','${day}','${entry.id}')"><span class="sr-only">Delete</span></button></div>
            </div>`).join('') || `<div class="empty">No entries yet.</div>`}
          </div>`).join('')}
        </div>
      </div>`;
    }
    function addTeamDailyEntry(teamKey, day) { ensureDailyForTeam(teamKey); state.teams[teamKey].dailyTasks[day].push({ id: uid(), text: '', createdAt: nowStamp(), updatedAt: '' }); saveState(); renderCurrentViewPreservingScroll(); }
    function updateTeamDailyEntry(teamKey, day, id, value) { const item = ((state.teams[teamKey].dailyTasks || {})[day] || []).find(x => x.id === id); if (!item) return; item.text = value; item.updatedAt = nowStamp(); saveState(); }
    function deleteTeamDailyEntry(teamKey, day, id) { state.teams[teamKey].dailyTasks[day] = (state.teams[teamKey].dailyTasks[day] || []).filter(x => x.id !== id); saveState(); renderCurrentViewPreservingScroll(); }
    function renderFlexTable(teamKey, tableKey, titleKey, fallbackTitle, subtitle) {
      const table = state.teams[teamKey][tableKey];
      return `<div class="card section">
        <div class="card-head wrap">
          <div><h3>${labelInput(teamKey,titleKey,fallbackTitle)}</h3><p class="subtle">${esc(subtitle || 'Flexible table.')}</p></div>
          <div class="section-tools"><button class="btn small" onclick="addFlexRow('${teamKey}','${tableKey}')">Add Row</button><button class="btn small" onclick="addFlexColumn('${teamKey}','${tableKey}')">Add Column</button></div>
        </div>
        <div class="table-wrap"><table>
          <thead><tr>${table.columns.map(col => `<th class="flex-th"><div class="flex-th-row"><input class="th-label-input" value="${esc(col.label)}" oninput="updateFlexColumn('${teamKey}','${tableKey}','${col.id}','label',this.value)" title="Rename column"><button class="remove-col-btn" onclick="deleteFlexColumn('${teamKey}','${tableKey}','${col.id}')" title="Remove column">×</button></div></th>`).join('')}<th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
          <tbody>${table.rows.map(row => `<tr>${table.columns.map(col => `<td>${renderFlexCell(teamKey, tableKey, row, col)}</td>`).join('')}<td class="action-col"><button class="btn small danger" onclick="deleteFlexRow('${teamKey}','${tableKey}','${row.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || `<tr><td colspan="${table.columns.length + 1}"><div class="empty">No rows yet.</div></td></tr>`}</tbody>
        </table></div>
      </div>`;
    }
    function renderFlexCell(teamKey, tableKey, row, col) {
      const value = row.values?.[col.id] ?? '';
      const type = col.type === 'date' ? 'date' : (col.type === 'number' ? 'number' : 'text');
      return `<input class="cell-input" type="${type}" value="${esc(value)}" oninput="updateFlexCell('${teamKey}','${tableKey}','${row.id}','${col.id}',this.value)">`;
    }
    function addFlexRow(teamKey, tableKey) { const table = state.teams[teamKey][tableKey]; const values = {}; table.columns.forEach(c => values[c.id] = ''); table.rows.push({ id: uid(), values }); saveState(); renderCurrentViewPreservingScroll(); }
    function deleteFlexRow(teamKey, tableKey, rowId) { const table = state.teams[teamKey][tableKey]; table.rows = table.rows.filter(r => r.id !== rowId); saveState(); renderCurrentViewPreservingScroll(); }
    function updateFlexCell(teamKey, tableKey, rowId, colId, value) { const row = state.teams[teamKey][tableKey].rows.find(r => r.id === rowId); if (!row) return; row.values = row.values || {}; row.values[colId] = value; saveState(); }
    function addFlexColumn(teamKey, tableKey) { const table = state.teams[teamKey][tableKey]; const col = { id: uid(), label: 'New Column', type: 'text' }; table.columns.push(col); table.rows.forEach(r => { r.values = r.values || {}; r.values[col.id] = ''; }); saveState(); renderCurrentViewPreservingScroll(); }
    function updateFlexColumn(teamKey, tableKey, colId, field, value) { const col = state.teams[teamKey][tableKey].columns.find(c => c.id === colId); if (!col) return; col[field] = value; saveState(); }
    function deleteFlexColumn(teamKey, tableKey, colId) { const table = state.teams[teamKey][tableKey]; if (table.columns.length <= 1) { alert('At least one column is required.'); return; } table.columns = table.columns.filter(c => c.id !== colId); table.rows.forEach(r => { if (r.values) delete r.values[colId]; }); saveState(); renderCurrentViewPreservingScroll(); }
    function renderTeam2Stats() {
      const t = state.teams.team2;
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput('team2','team2.statsTitle','2.3 Statistics - Graph')}</h3><p class="subtle">Input 1 and Input 2 each show received vs analyzed per period.</p></div><div class="section-tools"><select class="chart-type-select" onchange="state.teams.team2.statsChartType=this.value;saveState();renderTeam2()"><option value="bar" ${t.statsChartType==='bar'?'selected':''}>Grouped Bar</option><option value="line" ${t.statsChartType==='line'?'selected':''}>Line</option><option value="area" ${t.statsChartType==='area'?'selected':''}>Area</option></select><button class="btn small" onclick="openAnyChartModal('team2Stats')">Bigger</button>${refreshButton('team2Stats')}<button class="btn small" onclick="addTeam2StatsRow()">Add Period</button></div></div>
        <div class="chart-box">${renderTeam2StatsChart()}</div>
        <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>${thLabel('team2','stats.period','Period')}</th><th>${thLabel('team2','stats.i1r','Input 1 Received')}</th><th>${thLabel('team2','stats.i1a','Input 1 Analyzed')}</th><th>${thLabel('team2','stats.i2r','Input 2 Received')}</th><th>${thLabel('team2','stats.i2a','Input 2 Analyzed')}</th><th class="action-col"><span class="sr-only">Delete</span></th></tr></thead><tbody>${t.statsRows.map(r => `<tr><td><input class="cell-input" value="${esc(r.period)}" oninput="updateTeam2Stats('${r.id}','period',this.value)"></td><td><input class="cell-input" type="number" value="${esc(r.input1Received)}" oninput="updateTeam2Stats('${r.id}','input1Received',this.value)"></td><td><input class="cell-input" type="number" value="${esc(r.input1Analyzed)}" oninput="updateTeam2Stats('${r.id}','input1Analyzed',this.value)"></td><td><input class="cell-input" type="number" value="${esc(r.input2Received)}" oninput="updateTeam2Stats('${r.id}','input2Received',this.value)"></td><td><input class="cell-input" type="number" value="${esc(r.input2Analyzed)}" oninput="updateTeam2Stats('${r.id}','input2Analyzed',this.value)"></td><td class="action-col"><button class="btn small danger" onclick="deleteTeam2StatsRow('${r.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || `<tr><td colspan="6"><div class="empty">No statistics rows yet.</div></td></tr>`}</tbody></table></div>
      </div>`;
    }
    function renderTeam2StatsChart() {
      const t = state.teams.team2;
      const data = (t.statsRows || []).map(r => ({ date: r.period || '', i1r: number(r.input1Received), i1a: number(r.input1Analyzed), i2r: number(r.input2Received), i2a: number(r.input2Analyzed) }));
      if (!data.length || data.every(d => !d.i1r && !d.i1a && !d.i2r && !d.i2a)) return '<div class="empty">No statistics data yet.</div>';
      return renderMultiSeriesSvgChart(data, t.statsChartType || 'bar', [
        { key:'i1r', color:'#60a5fa' }, { key:'i1a', color:'#22c55e' }, { key:'i2r', color:'#f59e0b' }, { key:'i2a', color:'#a78bfa' }
      ]);
    }
    function addTeam2StatsRow() { state.teams.team2.statsRows.push({ id: uid(), period: 'New', input1Received: 0, input1Analyzed: 0, input2Received: 0, input2Analyzed: 0 }); saveState(); renderTeam2(); }
    function updateTeam2Stats(id, field, value) { const r = state.teams.team2.statsRows.find(x => x.id === id); if (!r) return; r[field] = field === 'period' ? value : number(value); saveState(); }
    function deleteTeam2StatsRow(id) { state.teams.team2.statsRows = state.teams.team2.statsRows.filter(x => x.id !== id); saveState(); renderTeam2(); }
    function renderTeam2Results() {
      const t = state.teams.team2;
      return `<div class="card section"><div class="card-head wrap"><div><h3>${labelInput('team2','team2.resultsTitle','2.4 Name Results - Chart')}</h3><p class="subtle">Configurable model/module result values. Switch between radar-style and horizontal chart.</p></div><div class="section-tools"><select class="chart-type-select" onchange="state.teams.team2.resultsChartType=this.value;saveState();renderTeam2()"><option value="radar" ${t.resultsChartType==='radar'?'selected':''}>Radar</option><option value="horizontal" ${t.resultsChartType==='horizontal'?'selected':''}>Horizontal</option></select><button class="btn small" onclick="openAnyChartModal('team2Results')">Bigger</button>${refreshButton('team2Results')}<button class="btn small" onclick="addTeam2Module()">Add Module</button></div></div><div class="grid two"><div class="chart-box tall">${renderTeam2ResultsChart()}</div><div>${(t.resultsModules || []).map(r => `<div class="entry"><div class="grid two"><input class="input" value="${esc(r.moduleName)}" oninput="updateSimpleListItem('team2','resultsModules','${r.id}','moduleName',this.value)"><input class="input" type="number" value="${esc(r.resultValue)}" oninput="updateSimpleListItem('team2','resultsModules','${r.id}','resultValue',this.value,true)"></div><button style="margin-top:8px" class="btn small danger" onclick="deleteSimpleListItem('team2','resultsModules','${r.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No modules yet.</div>'}</div></div></div>`;
    }
    function renderTeam2ResultsChart() {
      const rows = state.teams.team2.resultsModules || [];
      if (!rows.length) return '<div class="empty">No module data yet.</div>';
      if (state.teams.team2.resultsChartType === 'radar') return renderRadarChart(rows.map(r => ({ label: r.moduleName, value: number(r.resultValue) })));
      return renderHorizontalBarChart(rows.map(r => ({ label: r.moduleName, value: number(r.resultValue) })));
    }
    function addTeam2Module() { state.teams.team2.resultsModules.push({ id: uid(), moduleName: 'New Module', resultValue: 0 }); saveState(); renderTeam2(); }
    function renderTeam2SystemGraph() {
      const t = state.teams.team2;
      return `<div class="card section"><div class="card-head wrap"><div><h3>${labelInput('team2','team2.systemTitle','2.5 Name System - Graph')}</h3><p class="subtle">System categories and result counts.</p></div><div class="section-tools"><select class="chart-type-select" onchange="state.teams.team2.systemChartType=this.value;saveState();renderTeam2()"><option value="bar" ${t.systemChartType==='bar'?'selected':''}>Bar</option><option value="line" ${t.systemChartType==='line'?'selected':''}>Line</option><option value="area" ${t.systemChartType==='area'?'selected':''}>Area</option></select><button class="btn small" onclick="openAnyChartModal('team2System')">Bigger</button>${refreshButton('team2System')}<button class="btn small" onclick="addTeam2SystemResult()">Add System</button></div></div><div class="grid two"><div class="chart-box">${renderTeam2SystemChart()}</div><div>${(t.systemResults || []).map(r => `<div class="entry"><div class="grid two"><input class="input" value="${esc(r.systemName)}" oninput="updateSimpleListItem('team2','systemResults','${r.id}','systemName',this.value)"><input class="input" type="number" value="${esc(r.count)}" oninput="updateSimpleListItem('team2','systemResults','${r.id}','count',this.value,true)"></div><button style="margin-top:8px" class="btn small danger" onclick="deleteSimpleListItem('team2','systemResults','${r.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No systems yet.</div>'}</div></div></div>`;
    }
    function renderTeam2SystemChart() {
      const data = (state.teams.team2.systemResults || []).map(r => ({ date: r.systemName || '', total: number(r.count), recovered: 0 }));
      if (!data.length || data.every(d => !d.total)) return '<div class="empty">No system data yet.</div>';
      return renderSvgChart(data, state.teams.team2.systemChartType || 'bar', 'total', 'recovered');
    }
    function addTeam2SystemResult() { state.teams.team2.systemResults.push({ id: uid(), systemName: 'New System', count: 0 }); saveState(); renderTeam2(); }
    function updateSimpleListItem(teamKey, listName, id, field, value, numeric) { const item = (state.teams[teamKey][listName] || []).find(x => x.id === id); if (!item) return; item[field] = numeric ? number(value) : value; saveState(); }
    function deleteSimpleListItem(teamKey, listName, id) { state.teams[teamKey][listName] = (state.teams[teamKey][listName] || []).filter(x => x.id !== id); saveState(); renderCurrentViewPreservingScroll(); }
    function renderHorizontalBarChart(rows) {
      const w=900,h=Math.max(240, rows.length*44+60),left=145,right=30,top=24,bottom=30,plotW=w-left-right;
      const maxY=Math.max(1,...rows.map(r=>number(r.value)));
      const bars=rows.map((r,i)=>{ const y=top+i*42; const bw=(number(r.value)/maxY)*plotW; return `<text x="12" y="${y+22}" fill="#cbd5e1" font-size="12">${esc(String(r.label).slice(0,22))}</text><rect x="${left}" y="${y+6}" width="${bw}" height="24" rx="7" fill="#60a5fa" opacity=".86"/><text x="${left+bw+8}" y="${y+23}" fill="#e5e7eb" font-size="12">${number(r.value)}</text>`; }).join('');
      return `<svg viewBox="0 0 ${w} ${h}"><line x1="${left}" y1="${top}" x2="${left}" y2="${h-bottom}" stroke="rgba(255,255,255,.2)"/>${bars}</svg>`;
    }
    function renderRadarChart(rows) {
      const w=520,h=360,cx=260,cy=180,r=125; const maxY=Math.max(1,...rows.map(x=>number(x.value))); const n=Math.max(3,rows.length);
      const pts=rows.map((row,i)=>{ const a=(-Math.PI/2)+(i*2*Math.PI/n); const rr=(number(row.value)/maxY)*r; return { x:cx+Math.cos(a)*rr, y:cy+Math.sin(a)*rr, ax:cx+Math.cos(a)*r, ay:cy+Math.sin(a)*r, label:row.label, value:row.value }; });
      const poly=pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      const axes=pts.map(p=>`<line x1="${cx}" y1="${cy}" x2="${p.ax}" y2="${p.ay}" stroke="rgba(255,255,255,.12)"/><text x="${p.ax}" y="${p.ay}" fill="#cbd5e1" font-size="11" text-anchor="middle">${esc(String(p.label).slice(0,14))}</text>`).join('');
      return `<svg viewBox="0 0 ${w} ${h}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.13)"/><circle cx="${cx}" cy="${cy}" r="${r*.66}" fill="none" stroke="rgba(255,255,255,.08)"/><circle cx="${cx}" cy="${cy}" r="${r*.33}" fill="none" stroke="rgba(255,255,255,.08)"/>${axes}<polygon points="${poly}" fill="#60a5fa" opacity=".18" stroke="#60a5fa" stroke-width="3"/>${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4" fill="#60a5fa"/>`).join('')}<text x="18" y="26" fill="#9aa8c4" font-size="12">Max: ${maxY}</text></svg>`;
    }
    function renderTeam3Operations() {
      const t = state.teams.team3;
      return `<div class="card section"><div class="card-head wrap"><div><h3>${labelInput('team3','team3.operationsTitle','3.2 Input1 Operations - Input2 Status')}</h3><p class="subtle">Two renameable status sections with green, yellow and red indicators.</p></div></div><div class="status-grid">${renderStatusGroup('group1','team3.ops.group1','Name')}${renderStatusGroup('group2','team3.ops.group2','Name2')}</div></div>`;
    }
    function renderStatusGroup(groupKey, labelKey, fallback) {
      const rows = state.teams.team3.operations[groupKey] || [];
      return `<div class="card"><div class="card-head wrap"><h3>${labelInput('team3',labelKey,fallback)}</h3><button class="btn small" onclick="addTeam3Status('${groupKey}')">Add</button></div>${rows.map(r => {
        const current = normalizeStatus(r.status);
        return `<div class="status-row premium-status-row"><input class="input" value="${esc(r.name)}" oninput="updateTeam3Status('${groupKey}','${r.id}','name',this.value)"><div class="status-picker" title="Select status"><button type="button" class="status-dot-option green ${current==='Green'?'active':''}" onclick="event.preventDefault();event.stopPropagation();setTeam3Status('${groupKey}','${r.id}','Green');return false;" aria-label="Operational" title="Operational"></button><button type="button" class="status-dot-option yellow ${current==='Yellow'?'active':''}" onclick="event.preventDefault();event.stopPropagation();setTeam3Status('${groupKey}','${r.id}','Yellow');return false;" aria-label="Partial" title="Partial"></button><button type="button" class="status-dot-option red ${current==='Red'?'active':''}" onclick="event.preventDefault();event.stopPropagation();setTeam3Status('${groupKey}','${r.id}','Red');return false;" aria-label="Down" title="Down"></button></div><button type="button" class="status-pulse ${current.toLowerCase()}" onclick="cycleTeam3Status('${groupKey}','${r.id}')" title="Click to cycle status" aria-label="Cycle status"></button><button class="btn small danger" onclick="deleteTeam3Status('${groupKey}','${r.id}')"><span class="sr-only">Delete</span></button></div>`;
      }).join('') || '<div class="empty">No status items yet.</div>'}</div>`;
    }
    function normalizeStatus(value) {
      const v = String(value || '').toLowerCase();
      if (v.includes('red') || v.includes('down')) return 'Red';
      if (v.includes('yellow') || v.includes('partial')) return 'Yellow';
      return 'Green';
    }
    function addTeam3Status(groupKey) { state.teams.team3.operations[groupKey].push({ id: uid(), name: 'Input name', status: 'Green' }); saveState(); renderTeam3(); }
    function setTeam3Status(groupKey, id, status) {
      const item = state.teams.team3.operations[groupKey].find(x => x.id === id);
      if (!item) return;
      item.status = normalizeStatus(status);
      saveState();
      renderTeam3();
    }
    function cycleTeam3Status(groupKey, id) {
      const item = state.teams.team3.operations[groupKey].find(x => x.id === id);
      if (!item) return;
      const order = ['Green','Yellow','Red'];
      const current = normalizeStatus(item.status);
      setTeam3Status(groupKey, id, order[(order.indexOf(current) + 1) % order.length]);
    }
    function updateTeam3Status(groupKey, id, field, value) {
      if (field === 'status') { setTeam3Status(groupKey, id, value); return; }
      const item = state.teams.team3.operations[groupKey].find(x => x.id === id);
      if (!item) return;
      item[field] = value;
      saveState();
    }
    function deleteTeam3Status(groupKey, id) { state.teams.team3.operations[groupKey] = state.teams.team3.operations[groupKey].filter(x => x.id !== id); saveState(); renderTeam3(); }
    function renderTeam3LogMaintenance() {
      const t = state.teams.team3;
      return `<div class="section">${renderFlexTable('team3','logTable','team3.logTitle','3.3 Name Log Table','Editable log table with renameable headers.')}
      <div class="grid two section"><div class="card"><div class="card-head wrap"><h3>${labelInput('team3','team3.bulletTitle','Name Bullet Point List')}</h3><button class="btn small" onclick="addTeam3Bullet()">Add Input</button></div>${(t.bullets || []).map(b => `<div class="bullet-row"><textarea class="auto-grow" oninput="updateBullet('${b.id}',this.value);autoGrow(this)">${esc(b.text)}</textarea><button class="btn small danger" onclick="deleteBullet('${b.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No bullet points.</div>'}</div><div class="card"><div class="card-head wrap"><h3>${labelInput('team3','team3.maintenanceTitle','Name Maintenance')}</h3><button class="btn small" onclick="addMaintenance()">Add Maintenance</button></div>${(t.maintenanceEntries || []).map(m => `<div class="entry"><div class="entry-meta">Created: ${esc(m.createdAt)} ${m.updatedAt ? ` / Updated: ${esc(m.updatedAt)}` : ''}</div><textarea class="auto-grow" oninput="updateMaintenance('${m.id}',this.value);autoGrow(this)">${esc(m.text)}</textarea><button style="margin-top:8px" class="btn small danger" onclick="deleteMaintenance('${m.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No maintenance entries.</div>'}</div></div></div>`;
    }
    function addTeam3Bullet() { state.teams.team3.bullets.push({ id: uid(), text: '', createdAt: nowStamp(), updatedAt: '' }); saveState(); renderTeam3(); }
    function updateBullet(id, value) { const b = state.teams.team3.bullets.find(x => x.id === id); if (!b) return; b.text = value; b.updatedAt = nowStamp(); saveState(); }
    function deleteBullet(id) { state.teams.team3.bullets = state.teams.team3.bullets.filter(x => x.id !== id); saveState(); renderTeam3(); }
    function addMaintenance() { state.teams.team3.maintenanceEntries.push({ id: uid(), text: '', createdAt: nowStamp(), updatedAt: '' }); saveState(); renderTeam3(); }
    function updateMaintenance(id, value) { const m = state.teams.team3.maintenanceEntries.find(x => x.id === id); if (!m) return; m.text = value; m.updatedAt = nowStamp(); saveState(); }
    function deleteMaintenance(id) { state.teams.team3.maintenanceEntries = state.teams.team3.maintenanceEntries.filter(x => x.id !== id); saveState(); renderTeam3(); }
    function renderTeam3NameOperations() {
      return `<div class="section"><div class="card"><div class="card-head"><h3>${labelInput('team3','team3.nameOpsTitle','3.4 Name Operations')}</h3></div><p class="subtle">Both tables are fully flexible. Add rows, add columns, rename headers and edit all fields.</p></div>${renderFlexTable('team3','atmRequestsTable','team3.atmTitle','A. ATM Requests','Flexible request table.')}${renderFlexTable('team3','nameRequestsTable','team3.nameReqTitle','B. Name Requests','Flexible request table.')}</div>`;
    }
    function renderPersonnelSection(teamKey) {
      const table = state.teams[teamKey].personnelTable;
      if (!table) return '';
      const rows = table.rows || [];
      return `<div class="card section personnel-section">
        <div class="card-head wrap">
          <div><h3>${labelInput(teamKey,`${teamKey}.personnelTitle`,'4.1 Personnel / Team Members')}</h3><p class="subtle">Compact personnel cards. Create a card once; to change it later, delete it and create a new one.</p></div>
        </div>
        <div class="person-create-form">
          <input class="input" id="${teamKey}-person-id" placeholder="ID">
          <input class="input" id="${teamKey}-person-name" placeholder="Full name">
          <input class="input" id="${teamKey}-person-role" placeholder="Role">
          <button class="btn small primary" onclick="createPersonnelCard('${teamKey}')">Create Card</button>
        </div>
        <div class="person-grid">${rows.map(row => renderPersonCard(teamKey, row)).join('') || '<div class="empty">No employees yet.</div>'}</div>
      </div>`;
    }
    function renderPersonCard(teamKey, row) {
      const table = state.teams[teamKey].personnelTable;
      const cols = table.columns || [];
      const values = row.values || {};
      const nameCol = findColumn(cols, ['name'], 1);
      const roleCol = findColumn(cols, ['role'], 2);
      const idCol = findColumn(cols, ['id'], 0);
      const name = values[nameCol?.id] || 'New Employee';
      const role = values[roleCol?.id] || 'Role';
      const idValue = values[idCol?.id] || 'ID';
      const extra = cols.filter(c => ![nameCol?.id, roleCol?.id, idCol?.id].includes(c.id) && values[c.id]);
      return `<div class="person-card compact-person-card">
        <div class="person-card-top">
          <div class="person-avatar">${esc(initials(name))}</div>
          <div class="person-identity"><strong>${esc(name || 'New Employee')}</strong><span>${esc(role || 'Role')}</span><small>ID: ${esc(idValue || 'ID')}</small></div>
        </div>
        ${extra.length ? `<div class="person-extra-row">${extra.map(col => `<span class="person-extra-chip"><b>${esc(col.label)}:</b> ${esc(values[col.id])}</span>`).join('')}</div>` : ''}
        <button class="btn small danger" onclick="deleteFlexRow('${teamKey}','personnelTable','${row.id}')"><span class="sr-only">Delete</span></button>
      </div>`;
    }
    function createPersonnelCard(teamKey) {
      const table = state.teams[teamKey].personnelTable;
      const cols = table.columns || [];
      const nameCol = findColumn(cols, ['name'], 1);
      const roleCol = findColumn(cols, ['role'], 2);
      const idCol = findColumn(cols, ['id'], 0);
      const idInput = document.getElementById(`${teamKey}-person-id`);
      const nameInput = document.getElementById(`${teamKey}-person-name`);
      const roleInput = document.getElementById(`${teamKey}-person-role`);
      const name = (nameInput?.value || '').trim();
      const role = (roleInput?.value || '').trim();
      const idValue = (idInput?.value || '').trim();
      if (!name && !role && !idValue) { alert('Add at least a name, role, or ID before creating a personnel card.'); return; }
      const values = {};
      cols.forEach(c => { values[c.id] = ''; });
      if (idCol) values[idCol.id] = idValue || 'ID';
      if (nameCol) values[nameCol.id] = name || 'New Employee';
      if (roleCol) values[roleCol.id] = role || 'Role';
      table.rows.push({ id: uid(), values });
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (roleInput) roleInput.value = '';
      saveState();
      render();
    }
    function findColumn(columns, keywords, fallbackIndex) {
      return columns.find(c => keywords.some(k => String(c.label || '').toLowerCase().includes(k))) || columns[fallbackIndex] || columns[0];
    }
    function initials(name) {
      const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
      if (!parts.length) return '??';
      return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
    }
    function addPersonnelRow(teamKey) { createPersonnelCard(teamKey); }
    function renderTnaSection(teamKey) { return renderFlexTable(teamKey,'tnaTable',`${teamKey}.tnaTitle`,'4.2 TNA Table','Default columns: ID Manual, Date of Entry, Total Requests, Status, Comment.'); }
    function openAnyChartModal(kind) {
      let title = 'Chart', chart = '';
      if (kind === 'team2Stats') { title = getLabel('team2','team2.statsTitle','2.3 Statistics - Graph'); chart = renderTeam2StatsChart(); }
      if (kind === 'team2Results') { title = getLabel('team2','team2.resultsTitle','2.4 Name Results - Chart'); chart = renderTeam2ResultsChart(); }
      if (kind === 'team2System') { title = getLabel('team2','team2.systemTitle','2.5 Name System - Graph'); chart = renderTeam2SystemChart(); }
      const modal = document.getElementById('chartModal');
      modal.innerHTML = `<div class="chart-modal-panel"><div class="card-head wrap" style="margin-bottom:12px"><h3>${esc(title)}</h3><button class="btn small" onclick="closeChartModal()">Close</button></div><div class="chart-box large">${chart}</div></div>`;
      document.body.classList.add('modal-open');
    }
    function calculateOverviewTotals() {
      const rows = [];
      let totalTasks = 0, ongoing = 0, urgent = 0, openRisks = 0;
      Object.entries(state.teams).forEach(([key, t]) => {
        let taskCount = 0, ongoingCount = 0, urgentCount = 0;
        if (key === 'team1') {
          taskCount = (t.tasksReceived || []).length + (t.ongoingTasks || []).length + (t.urgentTasks || []).length;
          ongoingCount = (t.ongoingTasks || []).length;
          urgentCount = (t.urgentTasks || []).length + (t.tasksReceived || []).filter(x => String(x.urgent).toLowerCase() === 'yes').length;
        } else if (key === 'team2') {
          taskCount = (t.requestedTasksTable?.rows || []).length + (t.internalTaskTable?.rows || []).length;
          ongoingCount = taskCount;
          urgentCount = (t.risks || []).filter(x => String(x.severity).toLowerCase().includes('high') || String(x.severity).toLowerCase().includes('critical')).length;
        } else if (key === 'team3') {
          taskCount = (t.logTable?.rows || []).length + (t.atmRequestsTable?.rows || []).length + (t.nameRequestsTable?.rows || []).length;
          const down = [...(t.operations?.group1 || []), ...(t.operations?.group2 || [])].filter(x => x.status === 'Red').length;
          ongoingCount = taskCount;
          urgentCount = down;
        }
        const riskCount = (t.risks || []).filter(x => x.status !== 'Closed' && x.status !== 'Mitigated').length;
        const progress = averageProgressForTeam(key);
        rows.push({ name: t.name, taskCount, urgentCount, riskCount, progress });
        totalTasks += taskCount; ongoing += ongoingCount; urgent += urgentCount; openRisks += riskCount;
      });
      return { totalTasks, ongoing, urgent, openRisks, teamRows: rows };
    }
    function averageProgressForTeam(teamKey) {
      const t = state.teams[teamKey];
      let vals = [];
      if (teamKey === 'team1') vals = vals.concat((t.tasksReceived || []).map(x => number(x.progress)), (t.ongoingTasks || []).map(x => number(x.progress)), (t.urgentTasks || []).map(x => number(x.progress)));
      if (teamKey === 'team2') vals = vals.concat((t.statsRows || []).flatMap(x => [number(x.input1Analyzed), number(x.input2Analyzed)]), (t.resultsModules || []).map(x => number(x.resultValue)));
      if (teamKey === 'team3') { const ops = [...(t.operations?.group1 || []), ...(t.operations?.group2 || [])]; vals = ops.map(x => x.status === 'Green' ? 100 : x.status === 'Yellow' ? 50 : 0); }
      vals = vals.filter(v => Number.isFinite(v));
      if (!vals.length) return 0;
      return Math.round(vals.reduce((a,b)=>a+b,0) / vals.length);
    }
    function renderOverview() {
      const totals = calculateOverviewTotals();
      document.getElementById('overview').innerHTML = `
        ${pageTitle('Overview', `Aggregated view for selected week: ${currentWeekLabel()}`, reportButtons('overview'))}
        <div class="grid four section">
          <div class="card kpi"><span class="label">Total Tasks</span><span class="value">${totals.totalTasks}</span><span class="subtle">Across all teams</span></div>
          <div class="card kpi"><span class="label">Ongoing Items</span><span class="value">${totals.ongoing}</span><span class="subtle">Open / active records</span></div>
          <div class="card kpi"><span class="label">Urgent / Down</span><span class="value">${totals.urgent}</span><span class="subtle">Urgent tasks or red statuses</span></div>
          <div class="card kpi"><span class="label">Open Risks</span><span class="value">${totals.openRisks}</span><span class="subtle">Active blockers</span></div>
        </div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Team Comparison</h3><button class="btn small refresh-btn" onclick="refreshGraphs('overviewComparison')"><span class="sr-only">Refresh</span></button></div><div class="chart-box">${renderOverviewBarChart(totals.teamRows)}</div></div><div class="card"><div class="card-head"><h3>Team Summaries</h3></div>${Object.entries(state.teams).map(([key,t]) => `<div class="entry"><div class="card-head"><h3>${esc(t.name)}</h3><button class="btn small" onclick="showView('${key}')">Open</button></div><p class="subtle">${esc(t.weeklySummary || 'No summary')}</p></div>`).join('')}</div></div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Important Risks and Urgent Items</h3></div>${renderImportantItems()}</div><div class="card"><div class="card-head"><h3>Risks / Blockers by Team</h3></div>${renderOverviewRisksByTeam()}</div></div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Team 1 Jira Analytics Preview</h3><button class="btn small refresh-btn" onclick="refreshGraphs('overviewJira')"><span class="sr-only">Refresh</span></button></div><div class="chart-box">${renderJiraChart()}</div></div><div class="card"><div class="card-head"><h3>Team 2 Statistics Preview</h3><button class="btn small refresh-btn" onclick="refreshGraphs('overviewTeam2Stats')"><span class="sr-only">Refresh</span></button></div><div class="chart-box">${renderTeam2StatsChart()}</div></div></div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Team 3 Operations Status</h3></div>${renderOverviewTeam3Status()}</div><div class="card"><div class="card-head"><h3>System Health / Recovery</h3></div>${renderOverviewSystemHealth()}</div></div>
      `;
      requestAnimationFrame(() => { autoGrowAll(); polishDeleteButtons(); });
    }
    function renderOverviewPeopleTna() {
      return Object.entries(state.teams).map(([key,t]) => {
        const people = t.personnelTable?.rows?.length || 0;
        const tna = t.tnaTable?.rows?.length || 0;
        return `<div class="entry"><div class="card-head"><strong>${esc(t.name)}</strong><button class="btn small" onclick="showView('${key}')">Open</button></div><div class="grid two"><div class="mini-metric"><strong>${people}</strong><span>Personnel Rows</span></div><div class="mini-metric"><strong>${tna}</strong><span>TNA Rows</span></div></div></div>`;
      }).join('');
    }
    function renderOverviewRisksByTeam() {
      return Object.entries(state.teams).map(([key, t]) => {
        const risks = (t.risks || []).filter(r => String(r.status || '').toLowerCase() !== 'closed' && String(r.status || '').toLowerCase() !== 'mitigated');
        const redStatuses = key === 'team3'
          ? [...(t.operations?.group1 || []), ...(t.operations?.group2 || [])].filter(x => normalizeStatus(x.status) === 'Red').map(x => ({ title: x.name, severity: 'Down', status: 'Red', notes: 'Operations status is down.' }))
          : [];
        const urgent = key === 'team1'
          ? (t.urgentTasks || []).map(x => ({ title: x.name, severity: 'Urgent', status: x.status || 'Open', notes: `Deadline: ${x.deadline || ''}` }))
          : [];
        const all = [...risks, ...redStatuses, ...urgent];
        if (!all.length) {
          return `<div class="entry"><div class="card-head"><strong>${esc(t.name)}</strong><button class="btn small" onclick="showView('${key}')">Open</button></div><p class="subtle">No active risks or blockers recorded.</p></div>`;
        }
        return `<div class="entry overview-risk-group"><div class="card-head"><strong>${esc(t.name)}</strong><button class="btn small" onclick="showView('${key}')">Open</button></div>${all.slice(0, 8).map(r => {
          const severity = String(r.severity || '').toLowerCase();
          return `<div><strong>${esc(r.title || 'Risk / Blocker')}</strong><p class="subtle">${esc(r.severity || '')} / ${esc(r.status || '')}${r.notes ? ' — ' + esc(r.notes) : ''}</p><div class="risk-chip-row"><span class="risk-chip ${severity}">${esc(r.severity || 'Risk')}</span><span class="risk-chip">${esc(r.status || 'Open')}</span></div></div>`;
        }).join('')}</div>`;
      }).join('');
    }
    function renderOverviewTeam3Status() {
      const ops = [...(state.teams.team3.operations?.group1 || []), ...(state.teams.team3.operations?.group2 || [])];
      if (!ops.length) return '<div class="empty">No Team 3 status records.</div>';
      return ops.map(o => `<div class="entry"><div class="card-head"><strong>${esc(o.name)}</strong><span class="status-pulse ${String(o.status||'Yellow').toLowerCase()}" title="${esc(o.status || 'Yellow')}"></span></div></div>`).join('');
    }
    function renderImportantItems() {
      const items = [];
      Object.entries(state.teams).forEach(([key,t]) => {
        (t.risks || []).filter(r => r.status !== 'Closed' && r.status !== 'Mitigated').forEach(r => items.push({ team: t.name, title: r.title, meta: `${r.severity} / ${r.status}`, view: key }));
      });
      (state.teams.team1.urgentTasks || []).forEach(r => items.push({ team: 'Team 1', title: r.name, meta: `Deadline: ${r.deadline} / ${r.status}`, view: 'team1' }));
      [...(state.teams.team3.operations?.group1 || []), ...(state.teams.team3.operations?.group2 || [])].filter(x => x.status === 'Red').forEach(x => items.push({ team: 'Team 3', title: x.name, meta: 'Red / Down', view: 'team3' }));
      if (!items.length) return '<div class="empty">No urgent items, red statuses, or open risks.</div>';
      return items.slice(0, 14).map(i => `<div class="entry"><div class="card-head"><div><strong>${esc(i.team)}</strong><p class="subtle">${esc(i.title)} — ${esc(i.meta)}</p></div><button class="btn small" onclick="showView('${i.view}')">Open</button></div></div>`).join('');
    }
    function printDashboard() { window.print(); }
    function exportWord(target) {
      const title = target === 'overview' ? 'Overview' : (state.teams[target]?.name || 'Dashboard');
      const content = buildReportHtml(target);
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)} Report</title><style>body{font-family:Arial,sans-serif;color:#111827}h1,h2,h3{color:#0f172a}.card{border:1px solid #d1d5db;border-radius:12px;padding:14px;margin:12px 0}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #d1d5db;padding:7px;text-align:left}th{background:#f3f4f6}.muted{color:#6b7280}</style></head><body>${content}</body></html>`;
      const blob = new Blob(['﻿', html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-${currentWeekStart()}.doc`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }
    function buildReportHtml(target) {
      if (target === 'overview') {
        return `<h1>Weekly Dashboard Overview</h1><p class="muted">Selected week: ${esc(currentWeekLabel())}</p>${Object.entries(state.teams).map(([key,t]) => `<div class="card"><h2>${esc(t.name)}</h2><p>${esc(t.weeklySummary || '')}</p><h3>Risks / Blockers</h3>${(t.risks || []).map(r => `<p><strong>${esc(r.title || 'Risk')}</strong> — ${esc(r.severity || '')} / ${esc(r.status || '')}</p>`).join('') || '<p>No active risks recorded.</p>'}</div>`).join('')}`;
      }
      const t = state.teams[target];
      return `<h1>${esc(t.name)} Weekly Report</h1><p class="muted">Selected week: ${esc(currentWeekLabel())}</p><div class="card"><h2>Weekly Summary</h2><p>${esc(t.weeklySummary || '')}</p><h2>Team Notes</h2><p>${esc(t.notes || '')}</p></div>${reportFlexTableHtml(t.personnelTable,'Personnel / Team Members')}${reportFlexTableHtml(t.tnaTable,'TNA Table')}`;
    }
    function reportFlexTableHtml(table, title) {
      if (!table) return '';
      return `<div class="card"><h2>${esc(title)}</h2><table><thead><tr>${table.columns.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(r => `<tr>${table.columns.map(c => `<td>${esc(r.values?.[c.id] || '')}</td>`).join('')}</tr>`).join('') || '<tr><td>No rows</td></tr>'}</tbody></table></div>`;
    }


    /* --- Final user requested overrides: dropdowns, stable numeric inputs, compact tables, overview Jira --- */
    function dropdownCell(value, options, onChange, extraClass = '') {
      const current = String(value ?? '');
      const opts = options.map(opt => `<option value="${esc(opt)}" ${current.toLowerCase() === String(opt).toLowerCase() ? 'selected' : ''}>${esc(opt)}</option>`).join('');
      return `<select class="cell-select select-pill ${extraClass}" onchange="${onChange}">${opts}</select>`;
    }
    function yesNoDropdown(value, onChange) { return dropdownCell(value || 'No', ['Yes','No'], onChange); }
    function complexityDropdown(value, onChange) { return dropdownCell(value || 'Medium', ['Low','Medium','High','Critical'], onChange); }
    function severityDropdown(value, onChange) { return dropdownCell(value || 'Medium', ['Low','Medium','High','Critical'], onChange); }
    function statusDropdown(value, onChange) { return dropdownCell(value || 'Open', ['Open','In Progress','Pending','Blocked','Done','Completed','Closed','Mitigated'], onChange); }
    function availabilityStatusDropdown(value, onChange) { return dropdownCell(value || 'Available', ['Available','Vacation','Day Off','Remote','Sick Leave','Unavailable'], onChange); }
    function flexibleDropdownForColumn(label, value, onChange) {
      const l = String(label || '').toLowerCase();
      if (l.includes('urgent')) return yesNoDropdown(value, onChange);
      if (l.includes('complexity')) return complexityDropdown(value, onChange);
      if (l.includes('severity')) return severityDropdown(value, onChange);
      if (l.includes('status')) return statusDropdown(value, onChange);
      if (/yes|no/.test(l) || l === 'name') return yesNoDropdown(value, onChange);
      return '';
    }

    function renderReceivedCell(row, key) {
      const col = taskReceivedColumnMap[key] || { type: 'text' };
      const value = row[key] ?? '';
      const update = `updateTaskReceived('${row.id}','${key}',this.value)`;
      if (key === 'complexity') return complexityDropdown(value, update);
      if (key === 'urgent' || key === 'saifCreated') return yesNoDropdown(value, update);
      const inputType = col.type === 'date' ? 'date' : (col.type === 'number' ? 'number' : 'text');
      return `<input class="cell-input ${inputType === 'number' ? 'cell-small' : ''}" type="${inputType}" value="${esc(value)}" oninput="${update}">`;
    }

    function renderTasksReceivedTable() {
      const t = state.teams.team1;
      const cols = t.tasksReceivedColumns || Object.keys(taskReceivedColumnMap);
      return `<div class="section">
        <div class="card-head wrap"><h3>${labelInput('team1','section.tasksReceived','A. Tasks Received This Week')}</h3><button class="btn small" onclick="addTaskReceived()">Add Row</button></div>
        <div class="table-wrap">
          <table class="tasks-received-table compact-table">
            <thead><tr>${cols.map(key => `<th>${thLabel('team1','tasksReceived.' + key, taskReceivedColumnMap[key].label)}</th>`).join('')}<th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
            <tbody>
            ${t.tasksReceived.map(row => `<tr class="${String(row.urgent).toLowerCase() === 'yes' ? 'urgent-row' : ''}">
              ${cols.map(key => `<td>${renderReceivedCell(row, key)}</td>`).join('')}
              <td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('team1','tasksReceived','${row.id}')"><span class="sr-only">Delete</span></button></td>
            </tr>`).join('') || `<tr><td colspan="${cols.length + 1}"><div class="empty">No rows added.</div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;
    }

    function renderSystemsActivity() {
      const rows = state.teams.team1.systemsActivity;
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput('team1','section.systemsActivity','1.3 Systems / Machines Activity')}</h3><p class="subtle">Status updates from active/inactive machine counts. Number fields no longer refresh while typing.</p></div><button class="btn small" onclick="addSystemActivity()">Add System</button></div>
        <div class="table-wrap">
          <table class="compact-table">
            <thead><tr><th>${thLabel('team1','systemsActivity.systemName','System Name')}</th><th>${thLabel('team1','systemsActivity.description','Description')}</th><th>${thLabel('team1','systemsActivity.active','Machines Active')}</th><th>${thLabel('team1','systemsActivity.inactive','Machines Inactive')}</th><th>${thLabel('team1','systemsActivity.status','Status Indicator')}</th><th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
            <tbody>
              ${rows.map(r => `<tr>
                <td><input class="cell-input" value="${esc(r.systemName)}" oninput="updateTeam1Array('systemsActivity','${r.id}','systemName',this.value)"></td>
                <td><input class="cell-input" value="${esc(r.description)}" oninput="updateTeam1Array('systemsActivity','${r.id}','description',this.value)"></td>
                <td><input class="cell-input cell-small" inputmode="numeric" type="number" value="${esc(r.active)}" oninput="updateTeam1Array('systemsActivity','${r.id}','active',this.value,true)" onchange="renderTeam1PreservingScroll()"></td>
                <td><input class="cell-input cell-small" inputmode="numeric" type="number" value="${esc(r.inactive)}" oninput="updateTeam1Array('systemsActivity','${r.id}','inactive',this.value,true)" onchange="renderTeam1PreservingScroll()"></td>
                <td>${machineStatusBadge(r.active, r.inactive)}</td>
                <td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('team1','systemsActivity','${r.id}')"><span class="sr-only">Delete</span></button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    }
    function updateTeam1Array(arrayName, id, field, value, numeric) {
      const item = state.teams.team1[arrayName].find(x => x.id === id);
      if (!item) return;
      item[field] = numeric ? number(value) : value;
      saveState();
    }

    function renderJiraSection() {
      const t = state.teams.team1;
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput('team1','section.jiraInputs','1.6 Jira Inputs / Range Data')}</h3><p class="subtle">Keep Jira date range records here. The two top charts and Overview use this selected date range.</p></div><button class="btn small" onclick="addJiraRecord()">Add Range Data</button></div>
        <div class="grid two">
          <label class="subtle">${labelInput('team1','jiraFilter.from','From Date')}<input class="input" type="date" value="${esc(t.jiraFrom)}" oninput="state.teams.team1.jiraFrom=this.value;saveState();" onchange="renderTeam1PreservingScroll()"></label>
          <label class="subtle">${labelInput('team1','jiraFilter.to','To Date')}<input class="input" type="date" value="${esc(t.jiraTo)}" oninput="state.teams.team1.jiraTo=this.value;saveState();" onchange="renderTeam1PreservingScroll()"></label>
        </div>
        <div class="table-wrap" style="margin-top:12px">
          <table class="jira-table compact-table">
            <thead><tr><th>${thLabel('team1','jira.from','From Date')}</th><th>${thLabel('team1','jira.to','To Date')}</th><th>${thLabel('team1','jira.totalTasks','Total Tasks Count')}</th><th>${thLabel('team1','jira.recoveredTasks','Recovered Tasks Count')}</th><th>${thLabel('team1','jira.notes','Notes')}</th><th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
            <tbody>${t.jiraRecords.map(r => `<tr><td><input class="cell-input" type="date" value="${esc(r.from)}" oninput="updateJira('${r.id}','from',this.value)" onchange="renderTeam1PreservingScroll()"></td><td><input class="cell-input" type="date" value="${esc(r.to)}" oninput="updateJira('${r.id}','to',this.value)" onchange="renderTeam1PreservingScroll()"></td><td><input class="cell-input cell-small" type="number" inputmode="numeric" value="${esc(r.totalTasks)}" oninput="updateJira('${r.id}','totalTasks',this.value,true)" onchange="renderTeam1PreservingScroll()"></td><td><input class="cell-input cell-small" type="number" inputmode="numeric" value="${esc(r.recoveredTasks)}" oninput="updateJira('${r.id}','recoveredTasks',this.value,true)" onchange="renderTeam1PreservingScroll()"></td><td><input class="cell-input" value="${esc(r.notes)}" oninput="updateJira('${r.id}','notes',this.value)"></td><td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('team1','jiraRecords','${r.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">No Jira records.</div></td></tr>'}</tbody>
          </table>
        </div>
      </div>`;
    }
    function updateJira(id, field, value, numeric) {
      const r = state.teams.team1.jiraRecords.find(x => x.id === id);
      if (!r) return;
      r[field] = numeric ? number(value) : value;
      saveState();
    }

    function renderTeamRisks(teamKey) {
      const rows = state.teams[teamKey].risks || [];
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput(teamKey,'section.risks','Risks / Blockers')}</h3><p class="subtle">Severity and status are dropdowns for cleaner reporting.</p></div><button class="btn small" onclick="addRisk('${teamKey}')">Add Risk</button></div>
        <div class="table-wrap"><table class="compact-table">
          <thead><tr><th>${thLabel(teamKey,'risks.title','Risk / Blocker')}</th><th>${thLabel(teamKey,'risks.owner','Owner')}</th><th>${thLabel(teamKey,'risks.severity','Severity')}</th><th>${thLabel(teamKey,'risks.status','Status')}</th><th>${thLabel(teamKey,'risks.due','Due')}</th><th>${thLabel(teamKey,'risks.notes','Notes')}</th><th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
          <tbody>${rows.map(r => `<tr><td><input class="cell-input" value="${esc(r.title)}" oninput="updateArrayItem('${teamKey}','risks','${r.id}','title',this.value)"></td><td><input class="cell-input" value="${esc(r.owner)}" oninput="updateArrayItem('${teamKey}','risks','${r.id}','owner',this.value)"></td><td>${severityDropdown(r.severity, `updateArrayItem('${teamKey}','risks','${r.id}','severity',this.value)`)}</td><td>${statusDropdown(r.status, `updateArrayItem('${teamKey}','risks','${r.id}','status',this.value)`)}</td><td><input class="cell-input" type="date" value="${esc(r.due)}" oninput="updateArrayItem('${teamKey}','risks','${r.id}','due',this.value)"></td><td><input class="cell-input" value="${esc(r.notes)}" oninput="updateArrayItem('${teamKey}','risks','${r.id}','notes',this.value)"></td><td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('${teamKey}','risks','${r.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || `<tr><td colspan="7"><div class="empty">No risks yet.</div></td></tr>`}</tbody>
        </table></div>
      </div>`;
    }

    function renderAvailability(teamKey) {
      const rows = state.teams[teamKey].availability || [];
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput(teamKey,'section.availability','People Availability / Vacations')}</h3><p class="subtle">Track availability, days off and coverage notes.</p></div><button class="btn small" onclick="addAvailability('${teamKey}')">Add Person</button></div>
        <div class="table-wrap"><table class="compact-table">
          <thead><tr><th>${thLabel(teamKey,'availability.name','Name')}</th><th>${thLabel(teamKey,'availability.status','Status')}</th><th>${thLabel(teamKey,'availability.from','From')}</th><th>${thLabel(teamKey,'availability.to','To')}</th><th>${thLabel(teamKey,'availability.notes','Notes')}</th><th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
          <tbody>${rows.map(r => `<tr><td><input class="cell-input" value="${esc(r.name)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','name',this.value)"></td><td>${availabilityStatusDropdown(r.status, `updateArrayItem('${teamKey}','availability','${r.id}','status',this.value)`)}</td><td><input class="cell-input" type="date" value="${esc(r.from)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','from',this.value)"></td><td><input class="cell-input" type="date" value="${esc(r.to)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','to',this.value)"></td><td><input class="cell-input" value="${esc(r.notes)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','notes',this.value)"></td><td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('${teamKey}','availability','${r.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || `<tr><td colspan="6"><div class="empty">No availability records.</div></td></tr>`}</tbody>
        </table></div>
      </div>`;
    }

    function renderFlexCell(teamKey, tableKey, row, col) {
      const value = row.values?.[col.id] ?? '';
      const update = `updateFlexCell('${teamKey}','${tableKey}','${row.id}','${col.id}',this.value)`;
      const dropdown = flexibleDropdownForColumn(col.label, value, update);
      if (dropdown) return dropdown;
      const type = col.type === 'date' ? 'date' : (col.type === 'number' ? 'number' : 'text');
      return `<input class="cell-input ${type === 'number' ? 'cell-small' : ''}" type="${type}" value="${esc(value)}" oninput="${update}">`;
    }

    function renderOverview() {
      const totals = calculateOverviewTotals();
      document.getElementById('overview').innerHTML = `
        ${pageTitle('Overview', `Aggregated view for selected week: ${currentWeekLabel()}`, reportButtons('overview'))}
        <div class="grid four section">
          <div class="card kpi"><span class="label">Total Tasks</span><span class="value">${totals.totalTasks}</span><span class="subtle">Across all teams</span></div>
          <div class="card kpi"><span class="label">Ongoing Items</span><span class="value">${totals.ongoing}</span><span class="subtle">Open / active records</span></div>
          <div class="card kpi"><span class="label">Urgent / Down</span><span class="value">${totals.urgent}</span><span class="subtle">Urgent tasks or red statuses</span></div>
          <div class="card kpi"><span class="label">Open Risks</span><span class="value">${totals.openRisks}</span><span class="subtle">Active blockers</span></div>
        </div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Team Comparison</h3><button class="btn small refresh-btn" onclick="refreshGraphs('overviewComparison')"><span class="sr-only">Refresh</span></button></div><div class="chart-box">${renderOverviewBarChart(totals.teamRows)}</div></div><div class="card"><div class="card-head"><h3>Team Summaries</h3></div>${Object.entries(state.teams).map(([key,t]) => `<div class="entry"><div class="card-head"><h3>${esc(t.name)}</h3><button class="btn small" onclick="showView('${key}')">Open</button></div><p class="subtle">${esc(t.weeklySummary || 'No summary')}</p></div>`).join('')}</div></div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Important Risks and Urgent Items</h3></div>${renderImportantItems()}</div><div class="card"><div class="card-head"><h3>Risks / Blockers by Team</h3></div>${renderOverviewRisksByTeam()}</div></div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Team 1 Tasks Received / Recovered</h3><button class="btn small refresh-btn" onclick="refreshGraphs('overviewTeam1Tasks')"><span class="sr-only">Refresh</span></button></div><div class="chart-box">${renderTasksReceivedRecoveredChart()}</div></div><div class="card"><div class="card-head"><h3>Team 1 Jira Dashboard</h3><button class="btn small refresh-btn" onclick="refreshGraphs('overviewJira')"><span class="sr-only">Refresh</span></button></div><div class="chart-box">${renderJiraChart()}</div></div></div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Team 2 Statistics Preview</h3><button class="btn small refresh-btn" onclick="refreshGraphs('overviewTeam2Stats')"><span class="sr-only">Refresh</span></button></div><div class="chart-box">${renderTeam2StatsChart()}</div></div><div class="card"><div class="card-head"><h3>Team 3 Operations Status</h3></div>${renderOverviewTeam3Status()}</div></div>
        <div class="section"><div class="card"><div class="card-head"><h3>System Health / Recovery</h3></div>${renderOverviewSystemHealth()}</div></div>
      `;
      requestAnimationFrame(() => { autoGrowAll(); polishDeleteButtons(); });
    }



    /* --- Final fix pass: icon controls, live chart updates, stable Jira/outcome numbers --- */
    function deleteButton(onclick, title = 'Delete') {
      return `<button type="button" class="btn small danger trash-btn" onclick="${onclick}" title="${esc(title)}" aria-label="${esc(title)}"><span class="sr-only">${esc(title)}</span></button>`;
    }

    function refreshButton(target = '') {
      return `<button type="button" class="btn small refresh-btn" onclick="refreshGraphs('${target}')" title="Refresh this graph from current data" aria-label="Refresh graph"><span class="sr-only">Refresh</span></button>`;
    }

    function polishDeleteButtons(root = document) {
      root.querySelectorAll('button.btn.danger, button.trash-btn').forEach(btn => {
        btn.classList.add('trash-btn');
        btn.setAttribute('title', btn.getAttribute('title') || 'Delete');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Delete');
        if (!btn.querySelector('.sr-only')) btn.innerHTML = '<span class="sr-only">Delete</span>';
      });
      root.querySelectorAll('button.refresh-btn').forEach(btn => {
        btn.setAttribute('title', btn.getAttribute('title') || 'Refresh this graph from current data');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Refresh graph');
      });
    }

    function numericTextInput(value, oninput, className = 'cell-input cell-small') {
      return `<input class="${className}" type="text" inputmode="numeric" value="${esc(value)}" oninput="${oninput}">`;
    }

    function updateInlineGraphAreas() {
      const slots = {
        'team1-tasks': renderTasksReceivedRecoveredChart,
        'team1-jira': renderJiraChart,
        'overview-team1-tasks': renderTasksReceivedRecoveredChart,
        'overview-jira': renderJiraChart,
        'overview-team2-stats': renderTeam2StatsChart
      };
      Object.entries(slots).forEach(([slot, fn]) => {
        document.querySelectorAll(`[data-chart-slot="${slot}"]`).forEach(el => {
          try { el.innerHTML = fn(); } catch (e) { el.innerHTML = '<div class="empty">Chart refresh failed.</div>'; }
        });
      });
    }

    function refreshGraphs(target = '') {
      saveState();
      updateInlineGraphAreas();
      if (target === 'all' || currentView === 'overview') renderOverview();
      requestAnimationFrame(() => { autoGrowAll(); polishDeleteButtons(); });
    }

    function hasNonZeroSeries(data) {
      return Array.isArray(data) && data.some(d => number(d.total) !== 0 || number(d.recovered) !== 0);
    }

    function recordDateBounds(records, fromKey = 'from', toKey = 'to') {
      const vals = [];
      (records || []).forEach(r => {
        const a = r[fromKey] || r.date;
        const b = r[toKey] || r.date || a;
        if (a) vals.push(a);
        if (b) vals.push(b);
      });
      if (!vals.length) return null;
      vals.sort();
      return { from: vals[0], to: vals[vals.length - 1] };
    }

    function aggregateJiraByDate() {
      const t = state.teams.team1;
      const records = t.jiraRecords || [];
      const build = (from, to) => dateRangeArray(from, to).map(date => {
        let total = 0, recovered = 0;
        records.forEach(r => {
          if (r.from && r.to && date >= r.from && date <= r.to) {
            total += number(r.totalTasks);
            recovered += number(r.recoveredTasks);
          }
        });
        return { date, total, recovered };
      });
      let data = build(t.jiraFrom, t.jiraTo);
      if (!hasNonZeroSeries(data) && records.some(r => number(r.totalTasks) || number(r.recoveredTasks))) {
        const bounds = recordDateBounds(records, 'from', 'to');
        if (bounds) data = build(bounds.from, bounds.to);
      }
      return data;
    }

    function aggregateTasksReceivedByDate() {
      const t = state.teams.team1;
      const rows = t.tasksReceived || [];
      const build = (from, to) => dateRangeArray(from, to).map(date => {
        let received = 0, recovered = 0;
        rows.forEach(r => {
          if (r.date === date) {
            received += number(r.totalReceived);
            recovered += number(r.totalRecovered);
          }
        });
        return { date, total: received, recovered };
      });
      let data = build(t.jiraFrom, t.jiraTo);
      if (!hasNonZeroSeries(data) && rows.some(r => number(r.totalReceived) || number(r.totalRecovered))) {
        const bounds = recordDateBounds(rows, 'date', 'date');
        if (bounds) data = build(bounds.from, bounds.to);
      }
      return data;
    }

    function expandJiraFilterToRecord(r) {
      const t = state.teams.team1;
      if (!r) return;
      if (r.from && (!t.jiraFrom || r.from < t.jiraFrom)) t.jiraFrom = r.from;
      if (r.to && (!t.jiraTo || r.to > t.jiraTo)) t.jiraTo = r.to;
    }

    function updateJiraFilter(field, value) {
      state.teams.team1[field] = value;
      saveState();
      updateInlineGraphAreas();
    }

    function addJiraRecord() {
      const t = state.teams.team1;
      const from = t.jiraFrom || todayISO();
      const to = t.jiraTo || from;
      t.jiraRecords.push({ id: uid(), from, to, totalTasks: 0, recoveredTasks: 0, notes: '' });
      saveState();
      renderCurrentViewPreservingScroll();
    }

    function updateJira(id, field, value, numeric) {
      const t = state.teams.team1;
      const r = (t.jiraRecords || []).find(x => x.id === id);
      if (!r) return;
      r[field] = numeric ? number(value) : value;
      expandJiraFilterToRecord(r);
      saveState();
      updateInlineGraphAreas();
    }

    function updateTaskReceived(id, field, value) {
      const row = state.teams.team1.tasksReceived.find(x => x.id === id);
      if (!row) return;
      row[field] = ['totalReceived','totalRecovered','progress','resultProgress'].includes(field) ? number(value) : value;
      if (field === 'date' && value) {
        const t = state.teams.team1;
        if (!t.jiraFrom || value < t.jiraFrom) t.jiraFrom = value;
        if (!t.jiraTo || value > t.jiraTo) t.jiraTo = value;
      }
      saveState();
      updateInlineGraphAreas();
    }

    function renderTopChartCard(kind) {
      const t = state.teams.team1;
      const isTasks = kind === 'tasks';
      const title = isTasks ? getLabel('team1','chart.tasksTitle','Tasks Received / Recovered') : getLabel('team1','chart.jiraTitle','Jira Total / Recovered');
      const field = isTasks ? 'taskChartType' : 'jiraChartType';
      const chart = isTasks ? renderTasksReceivedRecoveredChart() : renderJiraChart();
      const slot = isTasks ? 'team1-tasks' : 'team1-jira';
      const legend = isTasks
        ? `<span class="legend-item"><span class="legend-line"></span>Received</span><span class="legend-item"><span class="legend-line green"></span>Recovered</span>`
        : `<span class="legend-item"><span class="legend-line warn"></span>Jira Total</span><span class="legend-item"><span class="legend-line info"></span>Jira Recovered</span>`;
      return `<div class="card top-analytics-card">
        <div class="chart-card-head">
          <div>
            ${labelInput('team1', isTasks ? 'chart.tasksTitle' : 'chart.jiraTitle', title)}
            <p class="subtle" style="margin-top:6px">Uses the selected From / To date range below. Choose chart type or expand for clearer viewing.</p>
            <div class="chart-legend" style="margin-top:8px">${legend}</div>
          </div>
          <div class="chart-tools">
            <select class="chart-type-select" onchange="state.teams.team1.${field}=this.value;saveState();updateInlineGraphAreas();">
              <option value="line" ${t[field]==='line'?'selected':''}>Line</option>
              <option value="bar" ${t[field]==='bar'?'selected':''}>Bar</option>
              <option value="area" ${t[field]==='area'?'selected':''}>Area</option>
            </select>
            <button class="btn small" onclick="openChartModal('${kind}')">Bigger</button>
            ${refreshButton(kind)}
          </div>
        </div>
        <div class="chart-box" data-chart-slot="${slot}">${chart}</div>
      </div>`;
    }

    function renderReceivedCell(row, key) {
      const col = taskReceivedColumnMap[key] || { type: 'text' };
      const value = row[key] ?? '';
      const update = `updateTaskReceived('${row.id}','${key}',this.value)`;
      if (key === 'complexity') return complexityDropdown(value, update);
      if (key === 'urgent' || key === 'saifCreated') return yesNoDropdown(value, update);
      if (col.type === 'date') return `<input class="cell-input" type="date" value="${esc(value)}" oninput="${update}">`;
      if (col.type === 'number') return numericTextInput(value, update);
      return `<input class="cell-input" type="text" value="${esc(value)}" oninput="${update}">`;
    }

    function renderTasksReceivedTable() {
      const t = state.teams.team1;
      const cols = t.tasksReceivedColumns || Object.keys(taskReceivedColumnMap);
      return `<div class="section">
        <div class="card-head wrap"><h3>${labelInput('team1','section.tasksReceived','A. Tasks Received This Week')}</h3><button class="btn small" onclick="addTaskReceived()">Add Row</button></div>
        <div class="table-wrap">
          <table class="tasks-received-table compact-table">
            <thead><tr>${cols.map(key => `<th>${thLabel('team1','tasksReceived.' + key, taskReceivedColumnMap[key].label)}</th>`).join('')}<th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
            <tbody>
            ${t.tasksReceived.map(row => `<tr class="${String(row.urgent).toLowerCase() === 'yes' ? 'urgent-row' : ''}">
              ${cols.map(key => `<td>${renderReceivedCell(row, key)}</td>`).join('')}
              <td class="action-col">${deleteButton(`deleteArrayItem('team1','tasksReceived','${row.id}')`)}</td>
            </tr>`).join('') || `<tr><td colspan="${cols.length + 1}"><div class="empty">No rows added.</div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;
    }

    function renderSystemsActivity() {
      const rows = state.teams.team1.systemsActivity || [];
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput('team1','section.systemsActivity','1.3 Systems / Machines Activity')}</h3><p class="subtle">Status updates from active/inactive machine counts without taking focus from the number fields.</p></div><button class="btn small" onclick="addSystemActivity()">Add System</button></div>
        <div class="table-wrap">
          <table class="compact-table">
            <thead><tr><th>${thLabel('team1','systemsActivity.systemName','System Name')}</th><th>${thLabel('team1','systemsActivity.description','Description')}</th><th>${thLabel('team1','systemsActivity.active','Machines Active')}</th><th>${thLabel('team1','systemsActivity.inactive','Machines Inactive')}</th><th>${thLabel('team1','systemsActivity.status','Status Indicator')}</th><th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
            <tbody>
              ${rows.map(r => `<tr>
                <td><input class="cell-input" value="${esc(r.systemName)}" oninput="updateTeam1Array('systemsActivity','${r.id}','systemName',this.value)"></td>
                <td><input class="cell-input" value="${esc(r.description)}" oninput="updateTeam1Array('systemsActivity','${r.id}','description',this.value)"></td>
                <td>${numericTextInput(r.active, `updateTeam1Array('systemsActivity','${r.id}','active',this.value,true)`)}</td>
                <td>${numericTextInput(r.inactive, `updateTeam1Array('systemsActivity','${r.id}','inactive',this.value,true)`)}</td>
                <td id="machine-status-${esc(r.id)}">${machineStatusBadge(r.active, r.inactive)}</td>
                <td class="action-col">${deleteButton(`deleteArrayItem('team1','systemsActivity','${r.id}')`)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    }

    function updateTeam1Array(arrayName, id, field, value, numeric) {
      const item = (state.teams.team1[arrayName] || []).find(x => x.id === id);
      if (!item) return;
      item[field] = numeric ? number(value) : value;
      saveState();
      if (arrayName === 'systemsActivity' && (field === 'active' || field === 'inactive')) {
        const cell = document.getElementById(`machine-status-${id}`);
        if (cell) cell.innerHTML = machineStatusBadge(item.active, item.inactive);
      }
      if (arrayName === 'recoveredSystems' || arrayName === 'systemsOutcomes') updateInlineGraphAreas();
    }

    function renderJiraSection() {
      const t = state.teams.team1;
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput('team1','section.jiraInputs','1.6 Jira Inputs / Range Data')}</h3><p class="subtle">Keep Jira date range records here. The top charts and Overview use this range, and auto-fit if records are outside the selected dates.</p></div><button class="btn small" onclick="addJiraRecord()">Add Range Data</button></div>
        <div class="grid two">
          <label class="subtle">${labelInput('team1','jiraFilter.from','From Date')}<input class="input" type="date" value="${esc(t.jiraFrom)}" oninput="updateJiraFilter('jiraFrom',this.value)"></label>
          <label class="subtle">${labelInput('team1','jiraFilter.to','To Date')}<input class="input" type="date" value="${esc(t.jiraTo)}" oninput="updateJiraFilter('jiraTo',this.value)"></label>
        </div>
        <div class="table-wrap" style="margin-top:12px">
          <table class="jira-table compact-table">
            <thead><tr><th>${thLabel('team1','jira.from','From Date')}</th><th>${thLabel('team1','jira.to','To Date')}</th><th>${thLabel('team1','jira.totalTasks','Total Tasks')}</th><th>${thLabel('team1','jira.recoveredTasks','Recovered')}</th><th>${thLabel('team1','jira.notes','Notes')}</th><th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
            <tbody>${(t.jiraRecords || []).map(r => `<tr><td><input class="cell-input" type="date" value="${esc(r.from)}" oninput="updateJira('${r.id}','from',this.value)"></td><td><input class="cell-input" type="date" value="${esc(r.to)}" oninput="updateJira('${r.id}','to',this.value)"></td><td>${numericTextInput(r.totalTasks, `updateJira('${r.id}','totalTasks',this.value,true)`)}</td><td>${numericTextInput(r.recoveredTasks, `updateJira('${r.id}','recoveredTasks',this.value,true)`)}</td><td><input class="cell-input" value="${esc(r.notes)}" oninput="updateJira('${r.id}','notes',this.value)"></td><td class="action-col">${deleteButton(`deleteArrayItem('team1','jiraRecords','${r.id}')`)}</td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">No Jira records.</div></td></tr>'}</tbody>
          </table>
        </div>
      </div>`;
    }

    function renderOverviewSystemHealth() {
      const t = state.teams.team1;
      const inactive = (t.systemsActivity || []).reduce((a,b)=>a+number(b.inactive),0);
      const active = (t.systemsActivity || []).reduce((a,b)=>a+number(b.active),0);
      const recovered = (t.recoveredSystems || []).reduce((a,b)=>a+number(b.recoveredCount),0);
      const outcomes = t.systemsOutcomes || [];
      const activeTasks = outcomes.reduce((a,b)=>a+number(b.activeTasks),0);
      const pending = outcomes.reduce((a,b)=>a+number(b.pending),0);
      const completed = outcomes.reduce((a,b)=>a+number(b.completed),0);
      return `<div class="grid three"><div class="mini-metric"><strong>${active}</strong><span>Machines Active</span></div><div class="mini-metric"><strong>${inactive}</strong><span>Machines Inactive</span></div><div class="mini-metric"><strong>${recovered}</strong><span>Recovered Systems</span></div></div>
      <div class="grid three section"><div class="mini-metric"><strong>${activeTasks}</strong><span>Outcome Active Tasks</span></div><div class="mini-metric"><strong>${pending}</strong><span>Outcome Pending</span></div><div class="mini-metric"><strong>${completed}</strong><span>Outcome Completed</span></div></div>
      <div class="section">${(t.systemsActivity || []).map(s => `<div class="entry"><div class="card-head"><strong>${esc(s.systemName)}</strong>${machineStatusBadge(s.active,s.inactive)}</div><p class="subtle">${esc(s.description)}</p></div>`).join('')}${outcomes.map(o => `<div class="entry"><div class="card-head"><strong>${esc(o.systemName)}</strong><span class="pill"><span class="dot good"></span>${number(o.completed)} completed</span></div><p class="subtle">${esc(o.statusLine || '')}</p></div>`).join('')}</div>`;
    }

    function renderOverview() {
      const totals = calculateOverviewTotals();
      document.getElementById('overview').innerHTML = `
        ${pageTitle('Overview', `Aggregated view for selected week: ${currentWeekLabel()}`, reportButtons('overview'))}
        <div class="grid four section">
          <div class="card kpi"><span class="label">Total Tasks</span><span class="value">${totals.totalTasks}</span><span class="subtle">Across all teams</span></div>
          <div class="card kpi"><span class="label">Ongoing Items</span><span class="value">${totals.ongoing}</span><span class="subtle">Open / active records</span></div>
          <div class="card kpi"><span class="label">Urgent / Down</span><span class="value">${totals.urgent}</span><span class="subtle">Urgent tasks or red statuses</span></div>
          <div class="card kpi"><span class="label">Open Risks</span><span class="value">${totals.openRisks}</span><span class="subtle">Active blockers</span></div>
        </div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Team Comparison</h3>${refreshButton('overviewComparison')}</div><div class="chart-box">${renderOverviewBarChart(totals.teamRows)}</div></div><div class="card"><div class="card-head"><h3>Team Summaries</h3></div>${Object.entries(state.teams).map(([key,t]) => `<div class="entry"><div class="card-head"><h3>${esc(t.name)}</h3><button class="btn small" onclick="showView('${key}')">Open</button></div><p class="subtle">${esc(t.weeklySummary || 'No summary')}</p></div>`).join('')}</div></div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Important Risks and Urgent Items</h3></div>${renderImportantItems()}</div><div class="card"><div class="card-head"><h3>Risks / Blockers by Team</h3></div>${renderOverviewRisksByTeam()}</div></div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Team 1 Tasks Received / Recovered</h3>${refreshButton('overviewTeam1Tasks')}</div><div class="chart-box" data-chart-slot="overview-team1-tasks">${renderTasksReceivedRecoveredChart()}</div></div><div class="card"><div class="card-head"><h3>Team 1 Jira Dashboard</h3>${refreshButton('overviewJira')}</div><div class="chart-box" data-chart-slot="overview-jira">${renderJiraChart()}</div></div></div>
        <div class="grid two section"><div class="card"><div class="card-head"><h3>Team 2 Statistics Preview</h3>${refreshButton('overviewTeam2Stats')}</div><div class="chart-box" data-chart-slot="overview-team2-stats">${renderTeam2StatsChart()}</div></div><div class="card"><div class="card-head"><h3>Team 3 Operations Status</h3></div>${renderOverviewTeam3Status()}</div></div>
        <div class="section"><div class="card"><div class="card-head"><h3>System Health / Recovery / Outcomes</h3>${refreshButton('overviewSystem')}</div>${renderOverviewSystemHealth()}</div></div>
      `;
      requestAnimationFrame(() => { autoGrowAll(); polishDeleteButtons(); });
    }



    /* --- Final stabilizer for System Outcomes / recovered counts --- */
    function renderRecoveredSystems() {
      const rows = state.teams.team1.recoveredSystems || [];
      return `<div class="card"><div class="card-head wrap"><h3>${labelInput('team1','summary.recoveredTitle','Recovered Systems')}</h3><button class="btn small" onclick="addRecoveredSystem()">Add</button></div><div class="kpi-mini">${rows.reduce((a,b)=>a+number(b.recoveredCount),0)} recovered</div>
      ${rows.map(r => `<div class="entry"><input class="input" value="${esc(r.systemName)}" oninput="updateTeam1Array('recoveredSystems','${r.id}','systemName',this.value)"><div class="grid two" style="margin-top:8px">${numericTextInput(r.recoveredCount, `updateTeam1Array('recoveredSystems','${r.id}','recoveredCount',this.value,true)`, 'input')}<input class="input" type="date" value="${esc(r.date)}" oninput="updateTeam1Array('recoveredSystems','${r.id}','date',this.value)"></div><textarea style="margin-top:8px;min-height:58px" oninput="updateTeam1Array('recoveredSystems','${r.id}','notes',this.value)">${esc(r.notes)}</textarea><button style="margin-top:8px" class="btn small danger" onclick="deleteArrayItem('team1','recoveredSystems','${r.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No recovered systems.</div>'}</div>`;
    }

    function renderSystemsOutcomes() {
      const rows = state.teams.team1.systemsOutcomes || [];
      return `<div class="section">
        <div class="card-head wrap"><div><h3>${labelInput('team1','section.systemsOutcomes','1.5 Systems Outcomes')}</h3><p class="subtle">System outcome cards with editable status and statistics. Counts are reflected in Overview.</p></div><button class="btn small" onclick="addSystemOutcome()">Add New System</button></div>
        <div class="grid three">
          ${rows.map(r => `<div class="card">
            <div class="card-head"><input class="input" value="${esc(r.systemName)}" oninput="updateTeam1Array('systemsOutcomes','${r.id}','systemName',this.value)"><button class="btn small danger" onclick="deleteArrayItem('team1','systemsOutcomes','${r.id}')"><span class="sr-only">Delete</span></button></div>
            <textarea style="min-height:70px" oninput="updateTeam1Array('systemsOutcomes','${r.id}','statusLine',this.value)">${esc(r.statusLine)}</textarea>
            <div class="metric-strip">
              <div class="mini-metric">${numericTextInput(r.activeTasks, `updateTeam1Array('systemsOutcomes','${r.id}','activeTasks',this.value,true)`, 'input')}<span>${labelInput('team1','systemsOutcomes.activeTasks','Active Tasks')}</span></div>
              <div class="mini-metric">${numericTextInput(r.pending, `updateTeam1Array('systemsOutcomes','${r.id}','pending',this.value,true)`, 'input')}<span>${labelInput('team1','systemsOutcomes.pending','Pending')}</span></div>
              <div class="mini-metric">${numericTextInput(r.completed, `updateTeam1Array('systemsOutcomes','${r.id}','completed',this.value,true)`, 'input')}<span>${labelInput('team1','systemsOutcomes.completed','Completed')}</span></div>
            </div>
          </div>`).join('')}
        </div>
      </div>`;
    }



    /* --- Final chart + collapse fixes: pie replaces line, working Tasks Received chart, collapsible cards --- */
    function normalizeChartType(type, fallback = 'pie') {
      const v = String(type || fallback).toLowerCase();
      if (v === 'line') return 'pie';
      if (['pie', 'bar', 'area', 'radar', 'horizontal'].includes(v)) return v;
      return fallback;
    }

    function chartTypeOptions(current, modes = ['pie','bar','area']) {
      const selected = normalizeChartType(current, modes[0]);
      const labels = { pie: 'Pie', bar: 'Bar', area: 'Area', radar: 'Radar', horizontal: 'Horizontal' };
      return modes.map(mode => `<option value="${mode}" ${selected === mode ? 'selected' : ''}>${labels[mode] || mode}</option>`).join('');
    }

    function normalizeDateValue(value) {
      const v = String(value || '').trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
      const parsed = new Date(v);
      if (!isNaN(parsed)) return formatISODate(parsed);
      return '';
    }

    function aggregateTasksReceivedByDate() {
      const t = state.teams.team1;
      const rows = (t.tasksReceived || []).map(r => ({ ...r, _date: normalizeDateValue(r.date) }));
      const build = (from, to) => dateRangeArray(normalizeDateValue(from), normalizeDateValue(to)).map(date => {
        let received = 0, recovered = 0;
        rows.forEach(r => {
          if (r._date === date) {
            received += number(r.totalReceived);
            recovered += number(r.totalRecovered);
          }
        });
        return { date, total: received, recovered };
      });
      let data = build(t.jiraFrom, t.jiraTo);
      if (!hasNonZeroSeries(data) && rows.some(r => number(r.totalReceived) || number(r.totalRecovered))) {
        const datedRows = rows.filter(r => r._date);
        if (datedRows.length) {
          const dates = datedRows.map(r => r._date).sort();
          data = build(dates[0], dates[dates.length - 1]);
        }
      }
      return data;
    }

    function renderTasksReceivedRecoveredChart() {
      const type = normalizeChartType(state.teams.team1.taskChartType, 'pie');
      const data = aggregateTasksReceivedByDate();
      if (!data.length) return '<div class="empty">Add task received rows or choose a valid date range.</div>';
      if (data.every(d => d.total === 0 && d.recovered === 0)) return '<div class="empty">No task received or recovered values yet for the selected/available dates.</div>';
      return renderSvgChart(data, type, 'total', 'recovered');
    }

    function renderJiraChart() {
      const type = normalizeChartType(state.teams.team1.jiraChartType, 'pie');
      const data = aggregateJiraByDate();
      if (!data.length) return '<div class="empty">Choose a valid date range to show the chart.</div>';
      if (data.every(d => d.total === 0 && d.recovered === 0)) return '<div class="empty">No Jira values inside the selected date range yet.</div>';
      return renderSvgChart(data, type, 'total', 'recovered');
    }

    function renderPieChartFromTotals(items, title = 'Distribution') {
      const filtered = (items || []).filter(x => number(x.value) > 0);
      const w = 900, h = 300, cx = 270, cy = 150, r = 96;
      const total = filtered.reduce((a,b)=>a+number(b.value),0);
      if (!filtered.length || total <= 0) return '<div class="empty">No values available for pie chart.</div>';
      const colors = ['#60a5fa','#22c55e','#f59e0b','#a78bfa','#38bdf8','#ef4444','#14b8a6','#f472b6'];
      let angle = -Math.PI / 2;
      const slices = filtered.map((item, index) => {
        const value = number(item.value);
        const slice = (value / total) * Math.PI * 2;
        const end = angle + slice;
        const x1 = cx + Math.cos(angle) * r;
        const y1 = cy + Math.sin(angle) * r;
        const x2 = cx + Math.cos(end) * r;
        const y2 = cy + Math.sin(end) * r;
        const large = slice > Math.PI ? 1 : 0;
        const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
        const mid = angle + slice / 2;
        const lx = cx + Math.cos(mid) * (r * 1.22);
        const ly = cy + Math.sin(mid) * (r * 1.22);
        angle = end;
        const pct = Math.round((value / total) * 100);
        return { d, color: colors[index % colors.length], label: item.label, value, pct, lx, ly };
      });
      const legend = slices.map((s,i) => {
        const y = 78 + i * 28;
        return `<rect x="520" y="${y-12}" width="12" height="12" rx="3" fill="${s.color}"/><text x="542" y="${y-2}" fill="var(--chart-text)" font-size="13">${esc(s.label)}: ${s.value} (${s.pct}%)</text>`;
      }).join('');
      const labels = slices.filter(s => s.pct >= 8).map(s => `<text x="${s.lx.toFixed(1)}" y="${s.ly.toFixed(1)}" text-anchor="middle" fill="var(--chart-text)" font-size="12" font-weight="700">${s.pct}%</text>`).join('');
      return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)} pie chart"><text x="24" y="30" fill="var(--chart-text)" font-size="13" font-weight="800">${esc(title)}</text>${slices.map(s=>`<path d="${s.d}" fill="${s.color}" opacity=".9"></path>`).join('')}<circle cx="${cx}" cy="${cy}" r="44" fill="var(--panel)" opacity=".96"></circle><text x="${cx}" y="${cy-4}" text-anchor="middle" fill="var(--chart-text)" font-size="12">Total</text><text x="${cx}" y="${cy+18}" text-anchor="middle" fill="var(--text)" font-size="22" font-weight="900">${total}</text>${labels}${legend}</svg>`;
    }

    function renderSvgChart(data, type, keyA, keyB) {
      type = normalizeChartType(type, 'pie');
      if (type === 'pie') {
        const a = (data || []).reduce((sum, d) => sum + number(d[keyA]), 0);
        const b = (data || []).reduce((sum, d) => sum + number(d[keyB]), 0);
        const labelA = keyA === 'total' ? 'Total / Received' : keyA;
        const labelB = keyB === 'recovered' ? 'Recovered' : keyB;
        return renderPieChartFromTotals([{ label: labelA, value: a }, { label: labelB, value: b }], 'Total share');
      }
      const w = 900, h = 300, left = 54, right = 24, top = 24, bottom = 48;
      const plotW = w - left - right, plotH = h - top - bottom;
      const maxY = Math.max(1, ...data.map(d => Math.max(number(d[keyA]), number(d[keyB]))));
      const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW;
      const x = i => left + (data.length === 1 ? plotW / 2 : i * stepX);
      const y = val => top + plotH - (number(val) / maxY) * plotH;
      const linePath = key => data.map((d,i) => `${i===0?'M':'L'} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(' ');
      const areaPath = key => `${linePath(key)} L ${x(data.length-1).toFixed(1)} ${top+plotH} L ${x(0).toFixed(1)} ${top+plotH} Z`;
      const ticks = [0,.25,.5,.75,1];
      const marks = ticks.map(t => `<line x1="${left}" y1="${top+plotH-(t*plotH)}" x2="${w-right}" y2="${top+plotH-(t*plotH)}" stroke="var(--chart-grid)"/><text x="12" y="${top+plotH-(t*plotH)+4}" fill="var(--chart-text)" font-size="11">${Math.round(maxY*t)}</text>`).join('');
      const labels = data.map((d,i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 ? `<text x="${x(i)}" y="${h-18}" text-anchor="middle" fill="var(--chart-text)" font-size="10">${esc(String(d.date || '').slice(5) || String(d.date || ''))}</text>` : '').join('');
      let body = '';
      if (type === 'bar') {
        const bw = Math.max(8, Math.min(28, plotW / Math.max(data.length,1) / 3));
        body = data.map((d,i) => `<rect x="${x(i)-bw-2}" y="${y(d[keyA])}" width="${bw}" height="${top+plotH-y(d[keyA])}" rx="4" fill="#60a5fa" opacity=".82"/><rect x="${x(i)+2}" y="${y(d[keyB])}" width="${bw}" height="${top+plotH-y(d[keyB])}" rx="4" fill="#22c55e" opacity=".82"/>`).join('');
      } else {
        body = `<path d="${areaPath(keyA)}" fill="#60a5fa" opacity=".18"/><path d="${areaPath(keyB)}" fill="#22c55e" opacity=".18"/><path d="${linePath(keyA)}" fill="none" stroke="#60a5fa" stroke-width="3"/><path d="${linePath(keyB)}" fill="none" stroke="#22c55e" stroke-width="3"/>`;
      }
      return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Task analytics chart">${marks}<line x1="${left}" y1="${top+plotH}" x2="${w-right}" y2="${top+plotH}" stroke="var(--chart-grid)"/>${body}${labels}<text x="${left}" y="14" fill="var(--chart-text)" font-size="12">Auto-scaled max: ${maxY}</text></svg>`;
    }

    function renderMultiSeriesSvgChart(data, type, series) {
      type = normalizeChartType(type, 'pie');
      if (type === 'pie') {
        return renderPieChartFromTotals(series.map(s => ({ label: s.label || s.key, value: (data || []).reduce((a,d)=>a+number(d[s.key]),0) })), 'Series share');
      }
      const w = 920, h = 310, left = 54, right = 24, top = 24, bottom = 50;
      const plotW = w - left - right, plotH = h - top - bottom;
      const maxY = Math.max(1, ...data.flatMap(d => series.map(s => number(d[s.key]))));
      const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW;
      const x = i => left + (data.length === 1 ? plotW / 2 : i * stepX);
      const y = val => top + plotH - (number(val) / maxY) * plotH;
      const linePath = key => data.map((d,i) => `${i===0?'M':'L'} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(' ');
      const ticks = [0,.25,.5,.75,1];
      const marks = ticks.map(t => `<line x1="${left}" y1="${top+plotH-(t*plotH)}" x2="${w-right}" y2="${top+plotH-(t*plotH)}" stroke="var(--chart-grid)"/><text x="12" y="${top+plotH-(t*plotH)+4}" fill="var(--chart-text)" font-size="11">${Math.round(maxY*t)}</text>`).join('');
      const labels = data.map((d,i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 ? `<text x="${x(i)}" y="${h-18}" text-anchor="middle" fill="var(--chart-text)" font-size="10">${esc(String(d.date || '').slice(0,12))}</text>` : '').join('');
      let body = '';
      if (type === 'bar') {
        const bw = Math.max(5, Math.min(16, plotW / Math.max(data.length,1) / (series.length + 1)));
        body = data.map((d,i) => series.map((s,si) => {
          const offset = (si - (series.length - 1) / 2) * (bw + 2);
          return `<rect x="${x(i)+offset}" y="${y(d[s.key])}" width="${bw}" height="${top+plotH-y(d[s.key])}" rx="4" fill="${s.color}" opacity=".84"/>`;
        }).join('')).join('');
      } else {
        body = series.map(s => {
          const areaPath = `${linePath(s.key)} L ${x(data.length-1).toFixed(1)} ${top+plotH} L ${x(0).toFixed(1)} ${top+plotH} Z`;
          return `<path d="${areaPath}" fill="${s.color}" opacity=".10"/><path d="${linePath(s.key)}" fill="none" stroke="${s.color}" stroke-width="2.6"/>`;
        }).join('');
      }
      return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Multi-series analytics chart">${marks}<line x1="${left}" y1="${top+plotH}" x2="${w-right}" y2="${top+plotH}" stroke="var(--chart-grid)"/>${body}${labels}<text x="${left}" y="14" fill="var(--chart-text)" font-size="12">Auto-scaled max: ${maxY}</text></svg>`;
    }

    function renderTopChartCard(kind) {
      const t = state.teams.team1;
      if (t.taskChartType === 'line') t.taskChartType = 'pie';
      if (t.jiraChartType === 'line') t.jiraChartType = 'pie';
      const isTasks = kind === 'tasks';
      const title = isTasks ? getLabel('team1','chart.tasksTitle','Tasks Received / Recovered') : getLabel('team1','chart.jiraTitle','Jira Total / Recovered');
      const field = isTasks ? 'taskChartType' : 'jiraChartType';
      const slot = isTasks ? 'team1-tasks' : 'team1-jira';
      const chart = isTasks ? renderTasksReceivedRecoveredChart() : renderJiraChart();
      const legend = isTasks
        ? `<span class="legend-item"><span class="legend-line"></span>Received</span><span class="legend-item"><span class="legend-line green"></span>Recovered</span>`
        : `<span class="legend-item"><span class="legend-line warn"></span>Jira Total</span><span class="legend-item"><span class="legend-line info"></span>Jira Recovered</span>`;
      return `<div class="card top-analytics-card">
        <div class="chart-card-head">
          <div>
            ${labelInput('team1', isTasks ? 'chart.tasksTitle' : 'chart.jiraTitle', title)}
            <p class="subtle" style="margin-top:6px">Uses the selected From / To date range below, and auto-fits if data exists outside the selected range.</p>
            <div class="chart-legend" style="margin-top:8px">${legend}</div>
          </div>
          <div class="chart-tools">
            <select class="chart-type-select" onchange="state.teams.team1.${field}=this.value;saveState();updateInlineGraphAreas();renderTeam1PreservingScroll();">
              ${chartTypeOptions(t[field], ['pie','bar','area'])}
            </select>
            <button class="btn small" onclick="openChartModal('${kind}')">Bigger</button>
            ${refreshButton(kind)}
          </div>
        </div>
        <div class="chart-box" data-chart-slot="${slot}">${chart}</div>
      </div>`;
    }

    function renderTeam2Stats() {
      const t = state.teams.team2;
      if (t.statsChartType === 'line') t.statsChartType = 'pie';
      return `<div class="card section">
        <div class="card-head wrap"><div><h3>${labelInput('team2','team2.statsTitle','2.3 Statistics - Graph')}</h3><p class="subtle">Input 1 and Input 2 each show received vs analyzed per period.</p></div><div class="section-tools"><select class="chart-type-select" onchange="state.teams.team2.statsChartType=this.value;saveState();renderTeam2()">${chartTypeOptions(t.statsChartType, ['pie','bar','area'])}</select><button class="btn small" onclick="openAnyChartModal('team2Stats')">Bigger</button>${refreshButton('team2Stats')}<button class="btn small" onclick="addTeam2StatsRow()">Add Period</button></div></div>
        <div class="chart-box">${renderTeam2StatsChart()}</div>
        <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>${thLabel('team2','stats.period','Period')}</th><th>${thLabel('team2','stats.i1r','Input 1 Received')}</th><th>${thLabel('team2','stats.i1a','Input 1 Analyzed')}</th><th>${thLabel('team2','stats.i2r','Input 2 Received')}</th><th>${thLabel('team2','stats.i2a','Input 2 Analyzed')}</th><th class="action-col"><span class="sr-only">Delete</span></th></tr></thead><tbody>${t.statsRows.map(r => `<tr><td><input class="cell-input" value="${esc(r.period)}" oninput="updateTeam2Stats('${r.id}','period',this.value)"></td><td>${numericTextInput(r.input1Received, `updateTeam2Stats('${r.id}','input1Received',this.value,true)`)}</td><td>${numericTextInput(r.input1Analyzed, `updateTeam2Stats('${r.id}','input1Analyzed',this.value,true)`)}</td><td>${numericTextInput(r.input2Received, `updateTeam2Stats('${r.id}','input2Received',this.value,true)`)}</td><td>${numericTextInput(r.input2Analyzed, `updateTeam2Stats('${r.id}','input2Analyzed',this.value,true)`)}</td><td class="action-col">${deleteButton(`deleteTeam2StatsRow('${r.id}')`)}</td></tr>`).join('') || `<tr><td colspan="6"><div class="empty">No statistics rows yet.</div></td></tr>`}</tbody></table></div>
      </div>`;
    }

    function renderTeam2SystemGraph() {
      const t = state.teams.team2;
      if (t.systemChartType === 'line') t.systemChartType = 'pie';
      return `<div class="card section"><div class="card-head wrap"><div><h3>${labelInput('team2','team2.systemTitle','2.5 Name System - Graph')}</h3><p class="subtle">System categories and result counts.</p></div><div class="section-tools"><select class="chart-type-select" onchange="state.teams.team2.systemChartType=this.value;saveState();renderTeam2()">${chartTypeOptions(t.systemChartType, ['pie','bar','area'])}</select><button class="btn small" onclick="openAnyChartModal('team2System')">Bigger</button>${refreshButton('team2System')}<button class="btn small" onclick="addTeam2SystemResult()">Add System</button></div></div><div class="grid two"><div class="chart-box">${renderTeam2SystemChart()}</div><div>${(t.systemResults || []).map(r => `<div class="entry"><div class="grid two"><input class="input" value="${esc(r.systemName)}" oninput="updateSimpleListItem('team2','systemResults','${r.id}','systemName',this.value)">${numericTextInput(r.count, `updateSimpleListItem('team2','systemResults','${r.id}','count',this.value,true)`, 'input')}</div><button style="margin-top:8px" class="btn small danger" onclick="deleteSimpleListItem('team2','systemResults','${r.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No systems yet.</div>'}</div></div></div>`;
    }

    function enableCollapseControls(root = document) {
      root.querySelectorAll('.card').forEach((card, index) => {
        if (card.classList.contains('kpi') || card.classList.contains('team-card') || card.classList.contains('chart-modal-panel')) return;
        const head = Array.from(card.children).find(el => el.classList && el.classList.contains('card-head'));
        if (!head || head.querySelector(':scope > .collapse-btn')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'collapse-btn';
        btn.title = 'Collapse / expand section';
        btn.setAttribute('aria-label', 'Collapse / expand section');
        btn.textContent = '−';
        btn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          card.classList.toggle('is-collapsed');
          btn.textContent = card.classList.contains('is-collapsed') ? '+' : '−';
        });
        head.appendChild(btn);
      });
    }

    function polishDeleteButtons(root = document) {
      root.querySelectorAll('button.btn.danger, button.trash-btn').forEach(btn => {
        btn.classList.add('trash-btn');
        btn.setAttribute('title', btn.getAttribute('title') || 'Delete');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Delete');
        if (!btn.querySelector('.sr-only')) btn.innerHTML = '<span class="sr-only">Delete</span>';
      });
      root.querySelectorAll('button.refresh-btn').forEach(btn => {
        btn.setAttribute('title', btn.getAttribute('title') || 'Refresh this graph from current data');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Refresh graph');
      });
      enableCollapseControls(root);
    }



    /* --- Final user-requested fixes: named Team 2 pie labels, reliable area charts, compact UI hooks --- */
    function plainLabel(teamKey, key, fallback) {
      return String(getLabel(teamKey, key, fallback) || fallback || '').trim();
    }

    function renderTeam2StatsChart() {
      const t = state.teams.team2;
      const data = (t.statsRows || []).map(r => ({
        date: r.period || '',
        i1r: number(r.input1Received),
        i1a: number(r.input1Analyzed),
        i2r: number(r.input2Received),
        i2a: number(r.input2Analyzed)
      }));
      if (!data.length || data.every(d => !d.i1r && !d.i1a && !d.i2r && !d.i2a)) return '<div class="empty">No statistics data yet.</div>';
      return renderMultiSeriesSvgChart(data, normalizeChartType(t.statsChartType || 'pie', 'pie'), [
        { key:'i1r', label: plainLabel('team2','stats.i1r','Input 1 Received'), color:'#60a5fa' },
        { key:'i1a', label: plainLabel('team2','stats.i1a','Input 1 Analyzed'), color:'#22c55e' },
        { key:'i2r', label: plainLabel('team2','stats.i2r','Input 2 Received'), color:'#f59e0b' },
        { key:'i2a', label: plainLabel('team2','stats.i2a','Input 2 Analyzed'), color:'#a78bfa' }
      ]);
    }

    function renderPieChartFromTotals(items, title = 'Distribution') {
      const filtered = (items || []).filter(x => number(x.value) > 0);
      const w = 900, h = 300, cx = 265, cy = 150, r = 90;
      const total = filtered.reduce((a,b)=>a+number(b.value),0);
      if (!filtered.length || total <= 0) return '<div class="empty">No values available for pie chart.</div>';
      const colors = ['#60a5fa','#22c55e','#f59e0b','#a78bfa','#38bdf8','#ef4444','#14b8a6','#f472b6'];
      let angle = -Math.PI / 2;
      const slices = filtered.map((item, index) => {
        const value = number(item.value);
        const slice = (value / total) * Math.PI * 2;
        const end = angle + slice;
        const x1 = cx + Math.cos(angle) * r;
        const y1 = cy + Math.sin(angle) * r;
        const x2 = cx + Math.cos(end) * r;
        const y2 = cy + Math.sin(end) * r;
        const large = slice > Math.PI ? 1 : 0;
        const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
        const mid = angle + slice / 2;
        const lx = cx + Math.cos(mid) * (r * 1.20);
        const ly = cy + Math.sin(mid) * (r * 1.20);
        angle = end;
        const pct = Math.round((value / total) * 100);
        return { d, color: colors[index % colors.length], label: String(item.label || 'Value'), value, pct, lx, ly };
      });
      const legend = slices.map((s,i) => {
        const y = 76 + i * 27;
        return `<rect x="505" y="${y-12}" width="12" height="12" rx="3" fill="${s.color}"/><text x="526" y="${y-2}" fill="var(--chart-text)" font-size="12">${esc(s.label)}: ${s.value} (${s.pct}%)</text>`;
      }).join('');
      const labels = slices.filter(s => s.pct >= 8).map(s => `<text x="${s.lx.toFixed(1)}" y="${s.ly.toFixed(1)}" text-anchor="middle" fill="var(--chart-text)" font-size="11" font-weight="700">${s.pct}%</text>`).join('');
      return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)} pie chart"><text x="24" y="28" fill="var(--chart-text)" font-size="12" font-weight="800">${esc(title)}</text>${slices.map(s=>`<path d="${s.d}" fill="${s.color}" opacity=".9"></path>`).join('')}<circle cx="${cx}" cy="${cy}" r="40" fill="var(--panel)" opacity=".96"></circle><text x="${cx}" y="${cy-4}" text-anchor="middle" fill="var(--chart-text)" font-size="11">Total</text><text x="${cx}" y="${cy+17}" text-anchor="middle" fill="var(--text)" font-size="20" font-weight="900">${total}</text>${labels}${legend}</svg>`;
    }

    function renderSvgChart(data, type, keyA, keyB) {
      type = normalizeChartType(type, 'pie');
      if (type === 'pie') {
        const a = (data || []).reduce((sum, d) => sum + number(d[keyA]), 0);
        const b = (data || []).reduce((sum, d) => sum + number(d[keyB]), 0);
        const labelA = keyA === 'total' ? 'Total / Received' : keyA;
        const labelB = keyB === 'recovered' ? 'Recovered' : keyB;
        return renderPieChartFromTotals([{ label: labelA, value: a }, { label: labelB, value: b }], 'Total share');
      }
      const w = 900, h = 300, left = 54, right = 24, top = 24, bottom = 48;
      const plotW = w - left - right, plotH = h - top - bottom;
      const maxY = Math.max(1, ...data.map(d => Math.max(number(d[keyA]), number(d[keyB]))));
      const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW;
      const x = i => left + (data.length === 1 ? plotW / 2 : i * stepX);
      const y = val => top + plotH - (number(val) / maxY) * plotH;
      const linePath = key => data.map((d,i) => `${i===0?'M':'L'} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(' ');
      const areaPath = key => `${linePath(key)} L ${x(data.length-1).toFixed(1)} ${top+plotH} L ${x(0).toFixed(1)} ${top+plotH} Z`;
      const ticks = [0,.25,.5,.75,1];
      const marks = ticks.map(t => `<line x1="${left}" y1="${top+plotH-(t*plotH)}" x2="${w-right}" y2="${top+plotH-(t*plotH)}" stroke="var(--chart-grid)"/><text x="12" y="${top+plotH-(t*plotH)+4}" fill="var(--chart-text)" font-size="10">${Math.round(maxY*t)}</text>`).join('');
      const labels = data.map((d,i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 ? `<text x="${x(i)}" y="${h-18}" text-anchor="middle" fill="var(--chart-text)" font-size="10">${esc(String(d.date || '').slice(5) || String(d.date || ''))}</text>` : '').join('');
      let body = '';
      if (type === 'bar') {
        const bw = Math.max(8, Math.min(28, plotW / Math.max(data.length,1) / 3));
        body = data.map((d,i) => `<rect x="${x(i)-bw-2}" y="${y(d[keyA])}" width="${bw}" height="${top+plotH-y(d[keyA])}" rx="4" fill="#60a5fa" opacity=".82"/><rect x="${x(i)+2}" y="${y(d[keyB])}" width="${bw}" height="${top+plotH-y(d[keyB])}" rx="4" fill="#22c55e" opacity=".82"/>`).join('');
      } else if (type === 'area') {
        body = `<path d="${areaPath(keyA)}" fill="#60a5fa" opacity=".18"/><path d="${areaPath(keyB)}" fill="#22c55e" opacity=".18"/><path d="${linePath(keyA)}" fill="none" stroke="#60a5fa" stroke-width="3"/><path d="${linePath(keyB)}" fill="none" stroke="#22c55e" stroke-width="3"/>`;
      } else {
        body = `<path d="${linePath(keyA)}" fill="none" stroke="#60a5fa" stroke-width="3"/><path d="${linePath(keyB)}" fill="none" stroke="#22c55e" stroke-width="3"/>`;
      }
      return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Task analytics chart">${marks}<line x1="${left}" y1="${top+plotH}" x2="${w-right}" y2="${top+plotH}" stroke="var(--chart-grid)"/>${body}${labels}<text x="${left}" y="14" fill="var(--chart-text)" font-size="11">Auto-scaled max: ${maxY}</text></svg>`;
    }

    function renderMultiSeriesSvgChart(data, type, series) {
      type = normalizeChartType(type, 'pie');
      if (type === 'pie') {
        return renderPieChartFromTotals(series.map(s => ({ label: s.label || s.key, value: (data || []).reduce((a,d)=>a+number(d[s.key]),0) })), 'Series share');
      }
      const w = 920, h = 310, left = 54, right = 24, top = 24, bottom = 50;
      const plotW = w - left - right, plotH = h - top - bottom;
      const maxY = Math.max(1, ...data.flatMap(d => series.map(s => number(d[s.key]))));
      const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW;
      const x = i => left + (data.length === 1 ? plotW / 2 : i * stepX);
      const y = val => top + plotH - (number(val) / maxY) * plotH;
      const linePath = key => data.map((d,i) => `${i===0?'M':'L'} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(' ');
      const ticks = [0,.25,.5,.75,1];
      const marks = ticks.map(t => `<line x1="${left}" y1="${top+plotH-(t*plotH)}" x2="${w-right}" y2="${top+plotH-(t*plotH)}" stroke="var(--chart-grid)"/><text x="12" y="${top+plotH-(t*plotH)+4}" fill="var(--chart-text)" font-size="10">${Math.round(maxY*t)}</text>`).join('');
      const labels = data.map((d,i) => i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 ? `<text x="${x(i)}" y="${h-18}" text-anchor="middle" fill="var(--chart-text)" font-size="10">${esc(String(d.date || '').slice(0,12))}</text>` : '').join('');
      let body = '';
      if (type === 'bar') {
        const bw = Math.max(5, Math.min(16, plotW / Math.max(data.length,1) / (series.length + 1)));
        body = data.map((d,i) => series.map((s,si) => {
          const offset = (si - (series.length - 1) / 2) * (bw + 2);
          return `<rect x="${x(i)+offset}" y="${y(d[s.key])}" width="${bw}" height="${top+plotH-y(d[s.key])}" rx="4" fill="${s.color}" opacity=".84"/>`;
        }).join('')).join('');
      } else if (type === 'area') {
        body = series.map(s => {
          const areaPath = `${linePath(s.key)} L ${x(data.length-1).toFixed(1)} ${top+plotH} L ${x(0).toFixed(1)} ${top+plotH} Z`;
          return `<path d="${areaPath}" fill="${s.color}" opacity=".10"/><path d="${linePath(s.key)}" fill="none" stroke="${s.color}" stroke-width="2.6"/>`;
        }).join('');
      } else {
        body = series.map(s => `<path d="${linePath(s.key)}" fill="none" stroke="${s.color}" stroke-width="2.6"/>`).join('');
      }
      return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Multi-series analytics chart">${marks}<line x1="${left}" y1="${top+plotH}" x2="${w-right}" y2="${top+plotH}" stroke="var(--chart-grid)"/>${body}${labels}<text x="${left}" y="14" fill="var(--chart-text)" font-size="11">Auto-scaled max: ${maxY}</text></svg>`;
    }



    /* --- Final patch: instant collapse buttons, Task Received chart modes, EN/AR dictionary --- */
    const DASHBOARD_I18N = {
      ar: {
        'Offline Weekly Dashboard': 'لوحة المتابعة الأسبوعية بدون إنترنت',
        'Ready offline': 'جاهز للعمل بدون إنترنت',
        'Start': 'البداية',
        'Team 1': 'الفريق 1',
        'Team 2': 'الفريق 2',
        'Team 3': 'الفريق 3',
        'Overview': 'نظرة عامة',
        'Export JSON': 'تصدير JSON',
        'Import JSON': 'استيراد JSON',
        'Light Theme': 'الوضع الفاتح',
        'Dark Theme': 'الوضع الداكن',
        'English': 'English',
        'Arabic': 'العربية',
        'Previous': 'السابق',
        'Next': 'التالي',
        'This Week': 'هذا الأسبوع',
        'Selected Week': 'الأسبوع المحدد',
        'Open Overview': 'فتح النظرة العامة',
        'Export Word': 'تصدير Word',
        'Export / Print PDF': 'تصدير / طباعة PDF',
        'Weekly Summary': 'الملخص الأسبوعي',
        'Team Notes': 'ملاحظات الفريق',
        'Daily Tasks': 'المهام اليومية',
        'Add': 'إضافة',
        'Add Row': 'إضافة صف',
        'Add Column': 'إضافة عمود',
        'Add Period': 'إضافة فترة',
        'Add System': 'إضافة نظام',
        'Add Range Data': 'إضافة بيانات نطاق',
        'Add Risk': 'إضافة مخاطرة',
        'Bigger': 'تكبير',
        'Close': 'إغلاق',
        'Refresh': 'تحديث',
        'Delete': 'حذف',
        'Save': 'حفظ',
        'Cancel': 'إلغاء',
        'Pie': 'دائري',
        'Bar': 'أعمدة',
        'Area': 'مساحة',
        'Grouped Bar': 'أعمدة مجمعة',
        'Horizontal': 'أفقي',
        'Radar': 'رادار',
        'Date': 'التاريخ',
        'From Date': 'من تاريخ',
        'To Date': 'إلى تاريخ',
        'Ref Number': 'رقم المرجع',
        'Case Name': 'اسم الحالة',
        'Total Received': 'إجمالي المستلم',
        'Total Recovered': 'إجمالي المسترجع',
        'Total Tasks Count': 'إجمالي عدد المهام',
        'Recovered Tasks Count': 'عدد المهام المسترجعة',
        'Complexity': 'التعقيد',
        'Urgent': 'عاجل',
        'Status': 'الحالة',
        'Severity': 'الخطورة',
        'Owner': 'المسؤول',
        'Due Date': 'تاريخ الاستحقاق',
        'Notes': 'ملاحظات',
        'Progress %': 'نسبة التقدم %',
        'Result Progress %': 'نسبة تقدم النتائج %',
        'Low': 'منخفض',
        'Medium': 'متوسط',
        'High': 'مرتفع',
        'Critical': 'حرج',
        'Yes': 'نعم',
        'No': 'لا',
        'Open': 'مفتوح',
        'Closed': 'مغلق',
        'In Progress': 'قيد التنفيذ',
        'Pending': 'معلق',
        'Done': 'منجز',
        'Completed': 'مكتمل',
        'Risks / Blockers': 'المخاطر / العوائق',
        'TNA': 'جدول TNA',
        'Personnel': 'الموظفون',
        'People Availability / Vacations': 'توفر الأشخاص / الإجازات',
        'Track availability, days off and coverage notes.': 'متابعة التوفر والإجازات وملاحظات التغطية.',
        'Tasks Received / Recovered': 'المهام المستلمة / المسترجعة',
        'Jira Total / Recovered': 'إجمالي Jira / المسترجع',
        'Received': 'المستلم',
        'Recovered': 'المسترجع',
        'Jira Total': 'إجمالي Jira',
        'Jira Recovered': 'Jira المسترجع',
        'No rows yet.': 'لا توجد صفوف بعد.',
        'No risks yet.': 'لا توجد مخاطر بعد.',
        'No entries yet.': 'لا توجد إدخالات بعد.',
        'No concerns yet.': 'لا توجد ملاحظات بعد.',
        'No systems yet.': 'لا توجد أنظمة بعد.',
        'No statistics data yet.': 'لا توجد بيانات إحصائية بعد.',
        'No task received or recovered values inside the selected date range yet.': 'لا توجد قيم مهام مستلمة أو مسترجعة ضمن نطاق التاريخ المحدد.',
        'Choose a valid From Date and To Date in the Jira Inputs section.': 'اختر تاريخ بداية ونهاية صحيحين في قسم مدخلات Jira.',
        'No Jira values inside the selected date range yet.': 'لا توجد قيم Jira ضمن نطاق التاريخ المحدد.',
        'Auto-scaled max:': 'الحد الأقصى التلقائي:',
        'Total': 'الإجمالي',
        'Total share': 'نسبة الإجمالي',
        'Series share': 'نسبة السلاسل',
        'Distribution': 'التوزيع',
        'Collapse / expand section': 'طي / توسيع القسم',
        'Refresh this graph from current data': 'تحديث الرسم من البيانات الحالية'
      }
    };

    function currentLanguage() {
      state.meta = state.meta || {};
      state.meta.lang = state.meta.lang || 'en';
      return state.meta.lang === 'ar' ? 'ar' : 'en';
    }

    function dictionaryFor(lang) {
      const ar = DASHBOARD_I18N.ar;
      if (lang === 'ar') return ar;
      const rev = {};
      Object.keys(ar).forEach(en => { rev[ar[en]] = en; });
      return rev;
    }

    function translateText(raw, lang = currentLanguage()) {
      const text = String(raw ?? '');
      const trimmed = text.trim();
      if (!trimmed) return text;
      const dict = dictionaryFor(lang);
      let out = dict[trimmed];
      if (!out && trimmed.startsWith('Auto-saved locally:')) {
        out = lang === 'ar' ? trimmed.replace('Auto-saved locally:', 'تم الحفظ محلياً:') : trimmed.replace('تم الحفظ محلياً:', 'Auto-saved locally:');
      }
      if (!out && trimmed.startsWith('Open ')) {
        out = lang === 'ar' ? trimmed.replace('Open ', 'فتح ') : trimmed.replace('فتح ', 'Open ');
      }
      if (!out) return text;
      const leading = text.match(/^\s*/)?.[0] || '';
      const trailing = text.match(/\s*$/)?.[0] || '';
      return leading + out + trailing;
    }

    function localizeVisibleText(root = document.body) {
      const lang = currentLanguage();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          if (['SCRIPT','STYLE','TEXTAREA'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
          if (p.closest('.chart-box svg')) return NodeFilter.FILTER_REJECT;
          if (p.closest('input')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const next = translateText(node.nodeValue, lang);
        if (next !== node.nodeValue) node.nodeValue = next;
      });
      document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.body.classList.toggle('lang-ar', lang === 'ar');
      document.body.classList.toggle('lang-en', lang !== 'ar');
    }

    function renderLanguageToggle() {
      const actions = document.querySelector('.actions');
      if (!actions) return;
      let btn = document.getElementById('languageToggleBtn');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'languageToggleBtn';
        btn.type = 'button';
        btn.className = 'btn small language-btn';
        btn.onclick = toggleLanguage;
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn && themeBtn.parentNode === actions) actions.insertBefore(btn, themeBtn.nextSibling);
        else actions.appendChild(btn);
      }
      btn.textContent = currentLanguage() === 'ar' ? 'English' : 'العربية';
      btn.title = currentLanguage() === 'ar' ? 'Switch to English' : 'التبديل إلى العربية';
    }

    function toggleLanguage() {
      state.meta = state.meta || {};
      state.meta.lang = currentLanguage() === 'ar' ? 'en' : 'ar';
      saveState();
      render();
    }

    function postRenderUiPatch() {
      try {
        enableCollapseControls(document);
        polishDeleteButtons(document);
        renderLanguageToggle();
        localizeVisibleText(document.body);
      } catch (error) {
        console.warn('Post-render UI patch failed:', error);
      }
    }

    const baseRenderDashboard = render;
    render = function() {
      baseRenderDashboard();
      postRenderUiPatch();
      requestAnimationFrame(postRenderUiPatch);
    };

    const baseRenderTeam1Dashboard = renderTeam1;
    renderTeam1 = function() { baseRenderTeam1Dashboard(); postRenderUiPatch(); requestAnimationFrame(postRenderUiPatch); };
    const baseRenderTeam2Dashboard = renderTeam2;
    renderTeam2 = function() { baseRenderTeam2Dashboard(); postRenderUiPatch(); requestAnimationFrame(postRenderUiPatch); };
    const baseRenderTeam3Dashboard = renderTeam3;
    renderTeam3 = function() { baseRenderTeam3Dashboard(); postRenderUiPatch(); requestAnimationFrame(postRenderUiPatch); };
    const baseRenderOverviewDashboard = renderOverview;
    renderOverview = function() { baseRenderOverviewDashboard(); postRenderUiPatch(); requestAnimationFrame(postRenderUiPatch); };

    const baseRenderTopChartCard = renderTopChartCard;
    renderTopChartCard = function(kind) {
      const t = state.teams.team1;
      const isTasks = kind === 'tasks';
      const field = isTasks ? 'taskChartType' : 'jiraChartType';
      if (isTasks && t[field] === 'area') t[field] = 'pie';
      const html = baseRenderTopChartCard(kind);
      if (!isTasks) return html;
      return html.replace(/<option value="area"[\s\S]*?<\/option>/, '');
    };

    const baseRenderTasksReceivedRecoveredChart = renderTasksReceivedRecoveredChart;
    renderTasksReceivedRecoveredChart = function() {
      if (state.teams.team1.taskChartType === 'area') state.teams.team1.taskChartType = 'pie';
      return baseRenderTasksReceivedRecoveredChart();
    };

    const baseChartTypeOptions = chartTypeOptions;
    chartTypeOptions = function(current, modes = ['pie','bar','area']) {
      return baseChartTypeOptions(current, modes);
    };

    const mutationTarget = document.querySelector('main');
    if (mutationTarget && !window.__sxxiifDashboardObserver) {
      let patchTimer = null;
      window.__sxxiifDashboardObserver = new MutationObserver(() => {
        clearTimeout(patchTimer);
        patchTimer = setTimeout(postRenderUiPatch, 30);
      });
      window.__sxxiifDashboardObserver.observe(mutationTarget, { childList: true, subtree: true });
    }


    state.teams.team1.taskChartType = normalizeChartType(state.teams.team1.taskChartType, 'pie');
    state.teams.team1.jiraChartType = normalizeChartType(state.teams.team1.jiraChartType, 'pie');
    if (state.teams.team2) {
      state.teams.team2.statsChartType = normalizeChartType(state.teams.team2.statsChartType, 'bar');
      state.teams.team2.systemChartType = normalizeChartType(state.teams.team2.systemChartType, 'bar');
    }

    // Initial render.
    saveState();
    render();


/* --- Requested latest-dashboard patch: no risks, no dropdowns, permanent labels, Team 3 daily inputs --- */
(function(){
  const TEAM_KEYS = ['team1','team2','team3'];
  const FLEX_TABLE_KEYS = {
    team1: ['personnelTable','tnaTable'],
    team2: ['requestedTasksTable','internalTaskTable','personnelTable','tnaTable'],
    team3: ['logTable','atmRequestsTable','nameRequestsTable','personnelTable','tnaTable']
  };

  function exportDateStamp() { return formatISODate(new Date()); }
  function defaultTeamName(teamKey) { return ({ team1: 'Team 1', team2: 'Team 2', team3: 'Team 3' })[teamKey] || teamKey; }

  window.sxxiifRequestedPatch = true;

  function ensureGlobalSettings() {
    state.global = state.global || {};
    state.global.teamNames = state.global.teamNames || {};
    state.global.labels = state.global.labels || {};
    state.global.flexTableSchemas = state.global.flexTableSchemas || {};
    state.global.taskReceivedColumns = state.global.taskReceivedColumns || (state.teams?.team1?.tasksReceivedColumns || Object.keys(taskReceivedColumnMap));

    TEAM_KEYS.forEach(teamKey => {
      const team = state.teams?.[teamKey];
      state.global.teamNames[teamKey] = state.global.teamNames[teamKey] || team?.name || defaultTeamName(teamKey);
      state.global.labels[teamKey] = state.global.labels[teamKey] || {};
      if (team?.labels) Object.assign(state.global.labels[teamKey], team.labels);
      state.global.flexTableSchemas[teamKey] = state.global.flexTableSchemas[teamKey] || {};
      (FLEX_TABLE_KEYS[teamKey] || []).forEach(tableKey => {
        const table = team?.[tableKey];
        if (table?.columns?.length && !state.global.flexTableSchemas[teamKey][tableKey]) {
          state.global.flexTableSchemas[teamKey][tableKey] = table.columns.map(col => ({ label: col.label || 'Column', type: col.type || 'text' }));
        }
      });
    });
  }

  function syncGlobalFlexSchemaFromCurrent(teamKey, tableKey) {
    ensureGlobalSettings();
    const table = state.teams?.[teamKey]?.[tableKey];
    if (!table?.columns) return;
    state.global.flexTableSchemas[teamKey] = state.global.flexTableSchemas[teamKey] || {};
    state.global.flexTableSchemas[teamKey][tableKey] = table.columns.map(col => ({ label: col.label || 'Column', type: col.type || 'text' }));
  }

  function applyFlexSchemaToTable(table, schema) {
    if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows) || !Array.isArray(schema)) return;
    while (table.columns.length < schema.length) {
      const s = schema[table.columns.length] || {};
      const newCol = { id: uid(), label: s.label || 'New Column', type: s.type || 'text', locked: false };
      table.columns.push(newCol);
      table.rows.forEach(row => {
        row.values = row.values || {};
        row.values[newCol.id] = '';
      });
    }
    table.columns.forEach((col, index) => {
      const s = schema[index];
      if (!s) return;
      col.label = s.label || col.label || 'Column';
      col.type = s.type || col.type || 'text';
    });
    table.rows.forEach(row => {
      row.values = row.values || {};
      table.columns.forEach(col => { if (row.values[col.id] === undefined) row.values[col.id] = ''; });
    });
  }

  function applyGlobalSettingsToCurrentWeek() {
    ensureGlobalSettings();
    TEAM_KEYS.forEach(teamKey => {
      const team = state.teams?.[teamKey];
      if (!team) return;
      team.name = state.global.teamNames[teamKey] || team.name || defaultTeamName(teamKey);
      team.labels = { ...(team.labels || {}), ...(state.global.labels[teamKey] || {}) };
      (FLEX_TABLE_KEYS[teamKey] || []).forEach(tableKey => {
        const schema = state.global.flexTableSchemas?.[teamKey]?.[tableKey];
        applyFlexSchemaToTable(team[tableKey], schema);
      });
    });
    if (state.teams?.team1) {
      state.teams.team1.tasksReceivedColumns = state.global.taskReceivedColumns || state.teams.team1.tasksReceivedColumns || Object.keys(taskReceivedColumnMap);
    }
  }

  const originalSaveStateRequestedPatch = saveState;
  saveState = function() {
    ensureGlobalSettings();
    applyGlobalSettingsToCurrentWeek();
    state.meta = state.meta || {};
    state.meta.currentWeekStart = state.meta.currentWeekStart || startOfWeekISO(todayISO());
    state.meta.lastSaved = nowStamp();
    saveCurrentWeekSnapshot();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderLastSaved();
    renderWeekSwitcher();
  };

  getLabel = function(teamKey, key, fallback) {
    ensureGlobalSettings();
    const labels = state.global.labels?.[teamKey] || {};
    return labels[key] !== undefined ? labels[key] : fallback;
  };

  updateLabel = function(teamKey, key, value) {
    ensureGlobalSettings();
    state.global.labels[teamKey] = state.global.labels[teamKey] || {};
    state.global.labels[teamKey][key] = value;
    if (state.teams?.[teamKey]) {
      state.teams[teamKey].labels = state.teams[teamKey].labels || {};
      state.teams[teamKey].labels[key] = value;
    }
    Object.values(state.weeks || {}).forEach(week => {
      if (week?.teams?.[teamKey]) {
        week.teams[teamKey].labels = week.teams[teamKey].labels || {};
        week.teams[teamKey].labels[key] = value;
      }
    });
    saveState();
  };

  teamDisplayName = function(teamKey) {
    ensureGlobalSettings();
    return state.global.teamNames?.[teamKey] || state.teams?.[teamKey]?.name || defaultTeamName(teamKey);
  };

  updateTeamName = function(teamKey, value) {
    ensureGlobalSettings();
    const clean = value && value.trim() ? value.trim() : defaultTeamName(teamKey);
    state.global.teamNames[teamKey] = clean;
    if (state.teams?.[teamKey]) state.teams[teamKey].name = clean;
    Object.values(state.weeks || {}).forEach(week => {
      if (week?.teams?.[teamKey]) week.teams[teamKey].name = clean;
    });
    saveState();
    renderNavLabels();
  };

  openWeek = function(weekStart) {
    if (!weekStart) return;
    saveCurrentWeekSnapshot();
    ensureGlobalSettings();
    state.meta.currentWeekStart = startOfWeekISO(weekStart);
    const wk = state.meta.currentWeekStart;
    state.weeks = state.weeks || {};
    if (!state.weeks[wk]) state.weeks[wk] = { createdAt: nowStamp(), updatedAt: '', teams: createEmptyWeekTeams(wk) };
    state.weeks[wk].teams = ensureTeamSchema(state.weeks[wk].teams, wk);
    state.teams = state.weeks[wk].teams;
    applyGlobalSettingsToCurrentWeek();
    saveState();
    render();
  };

  updateFlexColumn = function(teamKey, tableKey, colId, field, value) {
    const table = state.teams?.[teamKey]?.[tableKey];
    const index = table?.columns?.findIndex(c => c.id === colId);
    if (index === undefined || index < 0) return;
    table.columns[index][field] = value;
    syncGlobalFlexSchemaFromCurrent(teamKey, tableKey);
    Object.values(state.weeks || {}).forEach(week => {
      const wTable = week?.teams?.[teamKey]?.[tableKey];
      if (wTable?.columns?.[index]) wTable.columns[index][field] = value;
    });
    saveState();
  };

  addFlexColumn = function(teamKey, tableKey) {
    const table = state.teams[teamKey][tableKey];
    const col = { id: uid(), label: 'New Column', type: 'text' };
    table.columns.push(col);
    table.rows.forEach(r => { r.values = r.values || {}; r.values[col.id] = ''; });
    syncGlobalFlexSchemaFromCurrent(teamKey, tableKey);
    Object.values(state.weeks || {}).forEach(week => {
      const wTable = week?.teams?.[teamKey]?.[tableKey];
      if (!wTable || wTable === table) return;
      const newCol = { id: uid(), label: col.label, type: col.type };
      wTable.columns.push(newCol);
      wTable.rows.forEach(r => { r.values = r.values || {}; r.values[newCol.id] = ''; });
    });
    saveState();
    renderCurrentViewPreservingScroll();
  };

  deleteFlexColumn = function(teamKey, tableKey, colId) {
    const table = state.teams[teamKey][tableKey];
    const index = table.columns.findIndex(c => c.id === colId);
    if (index < 0) return;
    if (table.columns.length <= 1) { alert('At least one column is required.'); return; }
    const removed = table.columns.splice(index, 1)[0];
    table.rows.forEach(r => { if (r.values) delete r.values[removed.id]; });
    syncGlobalFlexSchemaFromCurrent(teamKey, tableKey);
    Object.values(state.weeks || {}).forEach(week => {
      const wTable = week?.teams?.[teamKey]?.[tableKey];
      if (!wTable || wTable === table || !wTable.columns?.[index]) return;
      const wRemoved = wTable.columns.splice(index, 1)[0];
      wTable.rows.forEach(r => { if (r.values) delete r.values[wRemoved.id]; });
    });
    saveState();
    renderCurrentViewPreservingScroll();
  };

  moveReceivedColumn = function(index, direction) {
    const cols = state.teams.team1.tasksReceivedColumns;
    const next = index + direction;
    if (next < 0 || next >= cols.length) return;
    [cols[index], cols[next]] = [cols[next], cols[index]];
    ensureGlobalSettings();
    state.global.taskReceivedColumns = [...cols];
    Object.values(state.weeks || {}).forEach(week => {
      if (week?.teams?.team1) week.teams.team1.tasksReceivedColumns = [...cols];
    });
    saveState();
    renderCurrentViewPreservingScroll();
  };

  renderReceivedCell = function(row, key) {
    const col = taskReceivedColumnMap[key] || { type: 'text' };
    const value = row[key] ?? '';
    const inputType = col.type === 'date' ? 'date' : (col.type === 'number' ? 'number' : 'text');
    return `<input class="cell-input ${inputType === 'number' ? 'cell-small' : ''}" type="${inputType}" value="${esc(value)}" oninput="updateTaskReceived('${row.id}','${key}',this.value)">`;
  };

  renderTopChartCard = function(kind) {
    const isTasks = kind === 'tasks';
    const title = isTasks ? getLabel('team1','chart.tasksTitle','Tasks Received / Recovered') : getLabel('team1','chart.jiraTitle','Jira Total / Recovered');
    const chart = isTasks ? renderTasksReceivedRecoveredChart() : renderJiraChart();
    const legend = isTasks
      ? `<span class="legend-item"><span class="legend-line"></span>Received</span><span class="legend-item"><span class="legend-line green"></span>Recovered</span>`
      : `<span class="legend-item"><span class="legend-line warn"></span>Jira Total</span><span class="legend-item"><span class="legend-line info"></span>Jira Recovered</span>`;
    return `<div class="card top-analytics-card">
      <div class="chart-card-head"><div>${labelInput('team1', isTasks ? 'chart.tasksTitle' : 'chart.jiraTitle', title)}<p class="subtle" style="margin-top:6px">Chart uses current dashboard data. Labels are shown in full where space allows.</p><div class="chart-legend" style="margin-top:8px">${legend}</div></div>
      <div class="chart-tools"><button class="btn small" onclick="openChartModal('${kind}')">Bigger</button>${refreshButton(kind)}</div></div>
      <div class="chart-box" data-chart-slot="${isTasks ? 'team1-tasks' : 'team1-jira'}">${chart}</div>
    </div>`;
  };

  renderTeam1 = function() {
    document.getElementById('team1').innerHTML = `
      ${teamPageTitle('team1', reportButtons('team1'))}
      ${renderEditableSummary('team1')}
      ${renderTeam1TopAnalytics()}
      ${renderTeam1DailyTasks()}
      ${renderTeam1Concerns()}
      ${renderSystemsActivity()}
      ${renderTeam1TasksSummary()}
      ${renderSystemsOutcomes()}
      ${renderJiraSection()}
      ${renderAvailability('team1')}
      ${renderTnaSection('team1')}
      ${renderPersonnelSection('team1')}
    `;
    requestAnimationFrame(() => { autoGrowAll(); postRenderUiPatch(); });
  };

  renderTeam2 = function() {
    document.getElementById('team2').innerHTML = `
      ${teamPageTitle('team2', reportButtons('team2'))}
      ${renderEditableSummary('team2')}
      ${renderDailyEntries('team2', '2.1 Daily Tasks')}
      ${renderFlexTable('team2','requestedTasksTable','team2.requestedTitle','2.2 Requested Tasks Table','Flexible table. Add rows, columns, rename headers and edit all data freely.')}
      ${renderTeam2Stats()}
      ${renderTeam2Results()}
      ${renderTeam2SystemGraph()}
      ${renderFlexTable('team2','internalTaskTable','team2.internalTitle','2.6 Internal Task Table','Flexible internal task table with dynamic columns.')}
      ${renderAvailability('team2')}
      ${renderTnaSection('team2')}
      ${renderPersonnelSection('team2')}
    `;
    requestAnimationFrame(() => { autoGrowAll(); postRenderUiPatch(); });
  };

  function renderTeam3DailyInputs() {
    const t = state.teams.team3;
    t.bullets = t.bullets || [];
    return `<div class="card section concern-card team3-daily-inputs">
      <div class="card-head wrap"><div><h3>${labelInput('team3','team3.bulletTitle','3.1 Daily Inputs')}</h3><p class="subtle" style="margin-top:8px">Routine daily input list for Team 3. Entries stay under each other instead of weekday cards.</p></div><button class="btn small" onclick="addTeam3Bullet()">Add Input</button></div>
      <div class="concern-list">
        ${(t.bullets || []).map(b => `<div class="entry concern-entry"><span class="concern-dot"></span><textarea class="auto-grow concern-line-input" oninput="updateBullet('${b.id}',this.value);autoGrow(this)" placeholder="Write Team 3 daily input here...">${esc(b.text)}</textarea><span class="concern-time">${esc(b.updatedAt ? 'Updated: ' + b.updatedAt : 'Created: ' + b.createdAt)}</span><div class="concern-actions"><button class="btn small danger" onclick="deleteBullet('${b.id}')"><span class="sr-only">Delete</span></button></div></div>`).join('') || '<div class="empty">No daily inputs yet.</div>'}
      </div>
    </div>`;
  }

  renderTeam3LogMaintenance = function() {
    const t = state.teams.team3;
    return `<div class="section">${renderFlexTable('team3','logTable','team3.logTitle','3.2 Name Log Table','Editable log table with renameable headers.')}
      <div class="card section"><div class="card-head wrap"><h3>${labelInput('team3','team3.maintenanceTitle','3.3 Name Maintenance')}</h3><button class="btn small" onclick="addMaintenance()">Add Maintenance</button></div>${(t.maintenanceEntries || []).map(m => `<div class="entry"><div class="entry-meta">Created: ${esc(m.createdAt)} ${m.updatedAt ? ` / Updated: ${esc(m.updatedAt)}` : ''}</div><textarea class="auto-grow" oninput="updateMaintenance('${m.id}',this.value);autoGrow(this)">${esc(m.text)}</textarea><button style="margin-top:8px" class="btn small danger" onclick="deleteMaintenance('${m.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No maintenance entries.</div>'}</div></div>`;
  };

  renderTeam3NameOperations = function() {
    return `<div class="section"><div class="card"><div class="card-head"><h3>${labelInput('team3','team3.nameOpsTitle','3.4 Name Operations')}</h3></div><p class="subtle">Both tables are fully flexible. Add rows, add columns, rename headers and edit all fields.</p></div>${renderFlexTable('team3','atmRequestsTable','team3.atmTitle','A. ATM Requests','Flexible request table.')}${renderFlexTable('team3','nameRequestsTable','team3.nameReqTitle','B. Name Requests','Flexible request table.')}</div>`;
  };

  renderTeam3 = function() {
    document.getElementById('team3').innerHTML = `
      ${teamPageTitle('team3', reportButtons('team3'))}
      ${renderTeam3DailyInputs()}
      ${renderEditableSummary('team3')}
      ${renderTeam3Operations()}
      ${renderTeam3LogMaintenance()}
      ${renderTeam3NameOperations()}
      ${renderAvailability('team3')}
      ${renderTnaSection('team3')}
      ${renderPersonnelSection('team3')}
    `;
    requestAnimationFrame(() => { autoGrowAll(); postRenderUiPatch(); });
  };

  renderTeam2Stats = function() {
    const t = state.teams.team2;
    return `<div class="card section"><div class="card-head wrap"><div><h3>${labelInput('team2','team2.statsTitle','2.3 Statistics - Graph')}</h3><p class="subtle">Input 1 and Input 2 each show received vs analyzed per period.</p></div><div class="section-tools"><button class="btn small" onclick="openAnyChartModal('team2Stats')">Bigger</button>${refreshButton('team2Stats')}<button class="btn small" onclick="addTeam2StatsRow()">Add Period</button></div></div><div class="chart-box">${renderTeam2StatsChart()}</div><div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>${thLabel('team2','stats.period','Period')}</th><th>${thLabel('team2','stats.i1r','Input 1 Received')}</th><th>${thLabel('team2','stats.i1a','Input 1 Analyzed')}</th><th>${thLabel('team2','stats.i2r','Input 2 Received')}</th><th>${thLabel('team2','stats.i2a','Input 2 Analyzed')}</th><th class="action-col"><span class="sr-only">Delete</span></th></tr></thead><tbody>${(t.statsRows || []).map(r => `<tr><td><input class="cell-input" value="${esc(r.period)}" oninput="updateTeam2Stats('${r.id}','period',this.value)"></td><td>${numericTextInput(r.input1Received, `updateTeam2Stats('${r.id}','input1Received',this.value,true)`)}</td><td>${numericTextInput(r.input1Analyzed, `updateTeam2Stats('${r.id}','input1Analyzed',this.value,true)`)}</td><td>${numericTextInput(r.input2Received, `updateTeam2Stats('${r.id}','input2Received',this.value,true)`)}</td><td>${numericTextInput(r.input2Analyzed, `updateTeam2Stats('${r.id}','input2Analyzed',this.value,true)`)}</td><td class="action-col">${deleteButton(`deleteTeam2StatsRow('${r.id}')`)}</td></tr>`).join('') || `<tr><td colspan="6"><div class="empty">No statistics rows yet.</div></td></tr>`}</tbody></table></div></div>`;
  };

  renderTeam2Results = function() {
    const t = state.teams.team2;
    return `<div class="card section"><div class="card-head wrap"><div><h3>${labelInput('team2','team2.resultsTitle','2.4 Name Results - Chart')}</h3><p class="subtle">Configurable model/module result values.</p></div><div class="section-tools"><button class="btn small" onclick="openAnyChartModal('team2Results')">Bigger</button>${refreshButton('team2Results')}<button class="btn small" onclick="addTeam2Module()">Add Module</button></div></div><div class="grid two"><div class="chart-box tall">${renderTeam2ResultsChart()}</div><div>${(t.resultsModules || []).map(r => `<div class="entry"><div class="grid two"><input class="input" value="${esc(r.moduleName)}" oninput="updateSimpleListItem('team2','resultsModules','${r.id}','moduleName',this.value)"><input class="input" type="number" value="${esc(r.resultValue)}" oninput="updateSimpleListItem('team2','resultsModules','${r.id}','resultValue',this.value,true)"></div><button style="margin-top:8px" class="btn small danger" onclick="deleteSimpleListItem('team2','resultsModules','${r.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No modules yet.</div>'}</div></div></div>`;
  };

  renderTeam2SystemGraph = function() {
    const t = state.teams.team2;
    return `<div class="card section"><div class="card-head wrap"><div><h3>${labelInput('team2','team2.systemTitle','2.5 Name System - Graph')}</h3><p class="subtle">System categories and result counts.</p></div><div class="section-tools"><button class="btn small" onclick="openAnyChartModal('team2System')">Bigger</button>${refreshButton('team2System')}<button class="btn small" onclick="addTeam2SystemResult()">Add System</button></div></div><div class="grid two"><div class="chart-box">${renderTeam2SystemChart()}</div><div>${(t.systemResults || []).map(r => `<div class="entry"><div class="grid two"><input class="input" value="${esc(r.systemName)}" oninput="updateSimpleListItem('team2','systemResults','${r.id}','systemName',this.value)">${numericTextInput(r.count, `updateSimpleListItem('team2','systemResults','${r.id}','count',this.value,true)`, 'input')}</div><button style="margin-top:8px" class="btn small danger" onclick="deleteSimpleListItem('team2','systemResults','${r.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No systems yet.</div>'}</div></div></div>`;
  };

  calculateOverviewTotals = function() {
    const rows = [];
    let totalTasks = 0, ongoing = 0, urgent = 0;
    Object.entries(state.teams).forEach(([key, t]) => {
      let taskCount = 0, ongoingCount = 0, urgentCount = 0;
      if (key === 'team1') {
        taskCount = (t.tasksReceived || []).length + (t.ongoingTasks || []).length + (t.urgentTasks || []).length;
        ongoingCount = (t.ongoingTasks || []).length;
        urgentCount = (t.urgentTasks || []).length + (t.tasksReceived || []).filter(x => String(x.urgent).toLowerCase() === 'yes').length;
      } else if (key === 'team2') {
        taskCount = (t.requestedTasksTable?.rows || []).length + (t.internalTaskTable?.rows || []).length;
        ongoingCount = taskCount;
      } else if (key === 'team3') {
        taskCount = (t.logTable?.rows || []).length + (t.atmRequestsTable?.rows || []).length + (t.nameRequestsTable?.rows || []).length + (t.bullets || []).length;
        const down = [...(t.operations?.group1 || []), ...(t.operations?.group2 || [])].filter(x => normalizeStatus(x.status) === 'Red').length;
        ongoingCount = taskCount;
        urgentCount = down;
      }
      const progress = averageProgressForTeam(key);
      rows.push({ name: t.name, taskCount, urgentCount, progress });
      totalTasks += taskCount;
      ongoing += ongoingCount;
      urgent += urgentCount;
    });
    return { totalTasks, ongoing, urgent, teamRows: rows };
  };

  renderOverviewBarChart = function(rows) {
    if (!rows.length) return '<div class="empty">No overview data.</div>';
    const w = 980, h = 340, left = 64, right = 24, top = 28, bottom = 78;
    const plotW = w-left-right, plotH = h-top-bottom;
    const maxY = Math.max(1, ...rows.map(r => Math.max(number(r.taskCount), number(r.urgentCount), number(r.progress))));
    const gap = plotW / rows.length;
    const bw = Math.min(52, gap / 4.5);
    const y = val => top + plotH - (number(val)/maxY)*plotH;
    const bars = rows.map((r,i) => {
      const cx = left + gap*i + gap/2;
      return `<rect x="${cx-bw*1.35}" y="${y(r.taskCount)}" width="${bw}" height="${top+plotH-y(r.taskCount)}" rx="5" fill="#60a5fa"/><rect x="${cx-bw*.15}" y="${y(r.urgentCount)}" width="${bw}" height="${top+plotH-y(r.urgentCount)}" rx="5" fill="#ef4444"/><rect x="${cx+bw*1.05}" y="${y(r.progress)}" width="${bw}" height="${top+plotH-y(r.progress)}" rx="5" fill="#22c55e"/><text x="${cx}" y="${h-46}" text-anchor="middle" fill="var(--chart-text)" font-size="12"><title>${esc(r.name)}</title>${esc(r.name)}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${w} ${h}"><text x="${left}" y="15" fill="var(--chart-text)" font-size="12">Blue: tasks / Red: urgent or down / Green: progress %</text><line x1="${left}" y1="${top+plotH}" x2="${w-right}" y2="${top+plotH}" stroke="var(--chart-grid)"/>${bars}</svg>`;
  };

  renderHorizontalBarChart = function(rows) {
    const w=980,h=Math.max(260, rows.length*50+70),left=260,right=55,top=28,bottom=30,plotW=w-left-right;
    const maxY=Math.max(1,...rows.map(r=>number(r.value)));
    const bars=rows.map((r,i)=>{ const y=top+i*48; const bw=(number(r.value)/maxY)*plotW; return `<text x="14" y="${y+24}" fill="var(--chart-text)" font-size="12"><title>${esc(r.label)}</title>${esc(r.label)}</text><rect x="${left}" y="${y+7}" width="${bw}" height="25" rx="7" fill="#60a5fa" opacity=".86"/><text x="${Math.min(left+bw+8,w-40)}" y="${y+25}" fill="var(--chart-text)" font-size="12">${number(r.value)}</text>`; }).join('');
    return `<svg viewBox="0 0 ${w} ${h}"><line x1="${left}" y1="${top}" x2="${left}" y2="${h-bottom}" stroke="var(--chart-grid)"/>${bars}</svg>`;
  };

  function tnaRowIsUpdated(teamKey, row) {
    const table = state.teams?.[teamKey]?.tnaTable;
    const cols = table?.columns || [];
    const values = cols.map(c => String(row.values?.[c.id] ?? '').trim());
    const joined = values.join(' ').toLowerCase();
    if (!joined) return false;
    const defaultish = ['tna-001', todayISO(), '0', 'open', ''];
    return values.some(v => v && !defaultish.includes(v.toLowerCase()));
  }

  function renderOverviewTnaUpdates() {
    const rows = [];
    TEAM_KEYS.forEach(teamKey => {
      const table = state.teams?.[teamKey]?.tnaTable;
      if (!table) return;
      (table.rows || []).filter(row => tnaRowIsUpdated(teamKey, row)).forEach(row => {
        const text = (table.columns || []).map(col => {
          const val = String(row.values?.[col.id] ?? '').trim();
          return val ? `${col.label}: ${val}` : '';
        }).filter(Boolean).join(' | ');
        if (text) rows.push(text);
      });
    });
    if (!rows.length) return '<div class="empty">No TNA updates entered yet.</div>';
    return rows.map(text => `<div class="entry"><p class="subtle">${esc(text)}</p></div>`).join('');
  }

  function isAbsenceRow(row) {
    const status = String(row.status || '').toLowerCase();
    const notes = String(row.notes || '').toLowerCase();
    const text = `${status} ${notes}`;
    if (!String(row.name || '').trim()) return false;
    if (!status || status === 'available') return /(vacation|leave|day off|off|sick|absence|unavailable|absent)/.test(notes);
    return /(vacation|leave|day off|off|sick|absence|unavailable|absent|remote)/.test(text) || status !== 'available';
  }

  function renderOverviewAbsences() {
    const rows = [];
    TEAM_KEYS.forEach(teamKey => {
      const team = state.teams?.[teamKey];
      (team?.availability || []).filter(isAbsenceRow).forEach(r => rows.push(r));
    });
    if (!rows.length) return '<div class="empty">No absence people recorded.</div>';
    return rows.map(r => `<div class="entry"><div class="card-head"><strong>${esc(r.name || 'Person')}</strong><span class="pill">${esc(r.status || 'Absence')}</span></div><p class="subtle">${esc(r.from || '')}${r.to ? ' - ' + esc(r.to) : ''}${r.notes ? ' | ' + esc(r.notes) : ''}</p></div>`).join('');
  }

  function renderUrgentAndRedItems() {
    const items = [];
    (state.teams.team1.urgentTasks || []).forEach(r => items.push({ team: state.teams.team1.name, title: r.name, meta: `Deadline: ${r.deadline || ''} / ${r.status || ''}`, view: 'team1' }));
    [...(state.teams.team3.operations?.group1 || []), ...(state.teams.team3.operations?.group2 || [])]
      .filter(x => normalizeStatus(x.status) === 'Red')
      .forEach(x => items.push({ team: state.teams.team3.name, title: x.name, meta: 'Red / Down', view: 'team3' }));
    if (!items.length) return '<div class="empty">No urgent tasks or red statuses.</div>';
    return items.slice(0, 12).map(i => `<div class="entry"><div class="card-head"><div><strong>${esc(i.team)}</strong><p class="subtle">${esc(i.title)} — ${esc(i.meta)}</p></div><button class="btn small" onclick="showView('${i.view}')">Open</button></div></div>`).join('');
  }

  renderOverview = function() {
    const totals = calculateOverviewTotals();
    document.getElementById('overview').innerHTML = `
      ${pageTitle('Overview', `Aggregated view for selected week: ${currentWeekLabel()}`, reportButtons('overview'))}
      <div class="grid three section">
        <div class="card kpi"><span class="label">Total Tasks</span><span class="value">${totals.totalTasks}</span><span class="subtle">Across all teams</span></div>
        <div class="card kpi"><span class="label">Ongoing Items</span><span class="value">${totals.ongoing}</span><span class="subtle">Open / active records</span></div>
        <div class="card kpi"><span class="label">Urgent / Down</span><span class="value">${totals.urgent}</span><span class="subtle">Urgent tasks or red statuses</span></div>
      </div>
      <div class="grid two section"><div class="card"><div class="card-head"><h3>Team Comparison</h3>${refreshButton('overviewComparison')}</div><div class="chart-box">${renderOverviewBarChart(totals.teamRows)}</div></div><div class="card"><div class="card-head"><h3>Team Summaries</h3></div>${Object.entries(state.teams).map(([key,t]) => `<div class="entry"><div class="card-head"><h3>${esc(t.name)}</h3><button class="btn small" onclick="showView('${key}')">Open</button></div><p class="subtle">${esc(t.weeklySummary || 'No summary')}</p></div>`).join('')}</div></div>
      <div class="grid two section"><div class="card"><div class="card-head"><h3>TNA Updates</h3></div>${renderOverviewTnaUpdates()}</div><div class="card"><div class="card-head"><h3>Absence People</h3></div>${renderOverviewAbsences()}</div></div>
      <div class="grid two section"><div class="card"><div class="card-head"><h3>Urgent and Red Status Items</h3></div>${renderUrgentAndRedItems()}</div><div class="card"><div class="card-head"><h3>Team 3 Operations Status</h3></div>${renderOverviewTeam3Status()}</div></div>
      <div class="grid two section"><div class="card"><div class="card-head"><h3>Team 1 Tasks Received / Recovered</h3>${refreshButton('overviewTeam1Tasks')}</div><div class="chart-box" data-chart-slot="overview-team1-tasks">${renderTasksReceivedRecoveredChart()}</div></div><div class="card"><div class="card-head"><h3>Team 1 Jira Dashboard</h3>${refreshButton('overviewJira')}</div><div class="chart-box" data-chart-slot="overview-jira">${renderJiraChart()}</div></div></div>
      <div class="grid two section"><div class="card"><div class="card-head"><h3>Team 2 Statistics Preview</h3>${refreshButton('overviewTeam2Stats')}</div><div class="chart-box" data-chart-slot="overview-team2-stats">${renderTeam2StatsChart()}</div></div><div class="card"><div class="card-head"><h3>System Health / Recovery / Outcomes</h3>${refreshButton('overviewSystem')}</div>${renderOverviewSystemHealth()}</div></div>
    `;
    requestAnimationFrame(() => { autoGrowAll(); postRenderUiPatch(); });
  };

  exportJSON = function() {
    saveState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-dashboard-export-${exportDateStamp()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  exportWord = function(target) {
    const title = target === 'overview' ? 'Overview' : (state.teams[target]?.name || 'Dashboard');
    const content = buildReportHtml(target);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)} Report</title><style>body{font-family:Arial,sans-serif;color:#111827}h1,h2,h3{color:#0f172a}.card{border:1px solid #d1d5db;border-radius:12px;padding:14px;margin:12px 0}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #d1d5db;padding:7px;text-align:left}th{background:#f3f4f6}.muted{color:#6b7280}</style></head><body>${content}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-export-${exportDateStamp()}.doc`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  buildReportHtml = function(target) {
    if (target === 'overview') {
      return `<h1>Weekly Dashboard Overview</h1><p class="muted">Selected week: ${esc(currentWeekLabel())}</p><div class="card"><h2>TNA Updates</h2>${renderOverviewTnaUpdates()}</div><div class="card"><h2>Absence People</h2>${renderOverviewAbsences()}</div>${Object.entries(state.teams).map(([key,t]) => `<div class="card"><h2>${esc(t.name)}</h2><p>${esc(t.weeklySummary || '')}</p></div>`).join('')}`;
    }
    const t = state.teams[target];
    return `<h1>${esc(t.name)} Weekly Report</h1><p class="muted">Selected week: ${esc(currentWeekLabel())}</p><div class="card"><h2>Weekly Summary</h2><p>${esc(t.weeklySummary || '')}</p><h2>Team Notes</h2><p>${esc(t.notes || '')}</p></div>${reportFlexTableHtml(t.personnelTable,'Personnel / Team Members')}${reportFlexTableHtml(t.tnaTable,'TNA Table')}`;
  };

  enableCollapseControls = function(root = document) {
    root.querySelectorAll('.card').forEach(card => {
      if (card.classList.contains('kpi') || card.classList.contains('team-card') || card.classList.contains('chart-modal-panel')) return;
      const head = Array.from(card.children || []).find(el => el.classList && el.classList.contains('card-head'));
      if (!head) return;
      let btn = head.querySelector(':scope > .collapse-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'collapse-btn';
        btn.title = 'Collapse / expand section';
        btn.setAttribute('aria-label', 'Collapse / expand section');
        btn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          card.classList.toggle('is-collapsed');
        });
        head.appendChild(btn);
      }
      btn.className = 'collapse-btn';
      btn.textContent = '';
    });
  };

  ensureGlobalSettings();
  applyGlobalSettingsToCurrentWeek();
  saveState();
  render();
})();

/* --- Requested patch continuation: force all editable section dropdowns into manual inputs --- */
(function(){
  renderFlexCell = function(teamKey, tableKey, row, col) {
    const value = row.values?.[col.id] ?? '';
    const type = col.type === 'date' ? 'date' : (col.type === 'number' ? 'number' : 'text');
    return `<input class="cell-input ${type === 'number' ? 'cell-small' : ''}" type="${type}" value="${esc(value)}" oninput="updateFlexCell('${teamKey}','${tableKey}','${row.id}','${col.id}',this.value)">`;
  };

  renderAvailability = function(teamKey) {
    const rows = state.teams[teamKey].availability || [];
    return `<div class="card section">
      <div class="card-head wrap"><div><h3>${labelInput(teamKey,'section.availability','People Availability / Vacations')}</h3><p class="subtle">Track availability, absence, days off and coverage notes. All fields are manual typing.</p></div><button class="btn small" onclick="addAvailability('${teamKey}')">Add Person</button></div>
      <div class="table-wrap"><table class="compact-table">
        <thead><tr><th>${thLabel(teamKey,'availability.name','Name')}</th><th>${thLabel(teamKey,'availability.status','Status')}</th><th>${thLabel(teamKey,'availability.from','From')}</th><th>${thLabel(teamKey,'availability.to','To')}</th><th>${thLabel(teamKey,'availability.notes','Notes')}</th><th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
        <tbody>${rows.map(r => `<tr><td><input class="cell-input" value="${esc(r.name)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','name',this.value)"></td><td><input class="cell-input" value="${esc(r.status)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','status',this.value)" placeholder="Available / Vacation / Day Off / Sick..."></td><td><input class="cell-input" type="date" value="${esc(r.from)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','from',this.value)"></td><td><input class="cell-input" type="date" value="${esc(r.to)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','to',this.value)"></td><td><input class="cell-input" value="${esc(r.notes)}" oninput="updateArrayItem('${teamKey}','availability','${r.id}','notes',this.value)"></td><td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('${teamKey}','availability','${r.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || `<tr><td colspan="6"><div class="empty">No availability records.</div></td></tr>`}</tbody>
      </table></div>
    </div>`;
  };

  saveState();
  render();
})();

/* --- Requested patch continuation: remove risk wording from home card --- */
(function(){
  renderHome = function() {
    document.getElementById('home').innerHTML = `
      <div class="hero">
        <h2>Weekly command center for offline team updates.</h2>
        <p>Offline dashboard running from local HTML and app.js files. Choose a week from the top bar, update each team, export JSON, print PDF, or export a Word-compatible report.</p>
        <div class="pill-row" style="margin-top:18px">
          <span class="pill"><span class="dot good"></span>Offline ready</span>
          <span class="pill"><span class="dot"></span>Auto-save localStorage</span>
          <span class="pill"><span class="dot warn"></span>Week history</span>
          <span class="pill"><span class="dot good"></span>Word / PDF export</span>
        </div>
      </div>
      <div class="grid team-grid">
        ${homeCard(teamDisplayName('team1'),'Operational dashboard with daily tasks, concerns, systems, recovery and Jira analytics.','team1','Open ' + teamDisplayName('team1'))}
        ${homeCard(teamDisplayName('team2'),'Weekly request tracking, statistics, model/module results, system graphs and internal task table.','team2','Open ' + teamDisplayName('team2'))}
        ${homeCard(teamDisplayName('team3'),'Routine daily inputs, operations status, logs, maintenance notes and request tracking.','team3','Open ' + teamDisplayName('team3'))}
        ${homeCard('Overview','Executive view pulling totals, personnel, TNA, absence people and important status indicators.','overview','Open Overview', true)}
      </div>`;
  };
  render();
})();


/* --- Targeted fix patch: latest dashboard columns, Team 2 system chart, Team 3 daily inputs, remove Name Operations --- */
(function(){
  function fullHeaderTextarea(value, onInputJs, title) {
    const safeValue = esc(value);
    return `<textarea class="th-label-input th-label-textarea auto-grow" rows="1" title="${esc(title || 'Rename column label')}" oninput="${onInputJs};autoGrow(this)">${safeValue}</textarea>`;
  }

  thLabel = function(teamKey, key, fallback) {
    const k = String(key || '').toLowerCase();
    const f = String(fallback || '').toLowerCase();
    if (k.includes('action') || f === 'action') return '<span class="sr-only">Delete</span>';
    const value = getLabel(teamKey, key, fallback);
    return fullHeaderTextarea(value, `updateLabel('${teamKey}','${key}',this.value)`, 'Rename column label');
  };

  renderFlexTable = function(teamKey, tableKey, titleKey, fallbackTitle, subtitle) {
    const table = state.teams[teamKey][tableKey];
    const columns = table.columns || [];
    return `<div class="card section wide-table-card">
      <div class="card-head wrap">
        <div><h3>${labelInput(teamKey,titleKey,fallbackTitle)}</h3><p class="subtle">${esc(subtitle || 'Flexible table.')}</p></div>
        <div class="section-tools"><button class="btn small add-btn" onclick="addFlexRow('${teamKey}','${tableKey}')"><span class="sr-only">Add Row</span></button><button class="btn small" onclick="addFlexColumn('${teamKey}','${tableKey}')">Add Column</button></div>
      </div>
      <div class="table-wrap comfort-table-wrap"><table class="comfort-table flexible-wide-table">
        <thead><tr>${columns.map(col => `<th class="flex-th"><div class="flex-th-row">${fullHeaderTextarea(col.label, `updateFlexColumn('${teamKey}','${tableKey}','${col.id}','label',this.value)`, 'Rename column')}<button class="remove-col-btn" onclick="deleteFlexColumn('${teamKey}','${tableKey}','${col.id}')" title="Remove column">×</button></div></th>`).join('')}<th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
        <tbody>${(table.rows || []).map(row => `<tr>${columns.map(col => `<td>${renderFlexCell(teamKey, tableKey, row, col)}</td>`).join('')}<td class="action-col"><button class="btn small danger" onclick="deleteFlexRow('${teamKey}','${tableKey}','${row.id}')"><span class="sr-only">Delete</span></button></td></tr>`).join('') || `<tr><td colspan="${columns.length + 1}"><div class="empty">No rows yet.</div></td></tr>`}</tbody>
      </table></div>
    </div>`;
  };

  renderTasksReceivedTable = function() {
    const t = state.teams.team1;
    const cols = t.tasksReceivedColumns || Object.keys(taskReceivedColumnMap);
    return `<div class="section">
      <div class="card-head wrap"><h3>${labelInput('team1','section.tasksReceived','A. Tasks Received This Week')}</h3><button class="btn small add-btn" onclick="addTaskReceived()"><span class="sr-only">Add Row</span></button></div>
      <div class="table-wrap comfort-table-wrap">
        <table class="tasks-received-table compact-table comfort-table">
          <thead><tr>${cols.map(key => `<th>${thLabel('team1','tasksReceived.' + key, (taskReceivedColumnMap[key] || {}).label || key)}</th>`).join('')}<th class="action-col"><span class="sr-only">Delete</span></th></tr></thead>
          <tbody>
          ${(t.tasksReceived || []).map(row => `<tr class="${String(row.urgent).toLowerCase() === 'yes' ? 'urgent-row' : ''}">
            ${cols.map(key => `<td>${renderReceivedCell(row, key)}</td>`).join('')}
            <td class="action-col"><button class="btn small danger" onclick="deleteArrayItem('team1','tasksReceived','${row.id}')"><span class="sr-only">Delete</span></button></td>
          </tr>`).join('') || `<tr><td colspan="${cols.length + 1}"><div class="empty">No rows added.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
  };

  renderWideBarList = function(rows, emptyMessage) {
    const cleanRows = (rows || []).map(r => ({ label: String(r.label || '').trim() || 'Unnamed', value: number(r.value) }));
    if (!cleanRows.length) return `<div class="empty">${esc(emptyMessage || 'No chart data yet.')}</div>`;
    const max = Math.max(1, ...cleanRows.map(r => r.value));
    return `<div class="wide-name-chart" role="img" aria-label="System counts chart with full names">
      <div class="wide-name-chart-head"><span>Full name</span><span>Count</span></div>
      ${cleanRows.map(r => {
        const pct = Math.max(2, Math.min(100, (r.value / max) * 100));
        return `<div class="wide-name-row">
          <div class="wide-name-label" title="${esc(r.label)}">${esc(r.label)}</div>
          <div class="wide-name-track"><div class="wide-name-fill" style="width:${pct.toFixed(2)}%"></div></div>
          <div class="wide-name-value">${esc(r.value)}</div>
        </div>`;
      }).join('')}
    </div>`;
  };

  renderHorizontalBarChart = function(rows) {
    return renderWideBarList(rows, 'No module data yet.');
  };

  renderTeam2ResultsChart = function() {
    const rows = (state.teams.team2.resultsModules || []).map(r => ({ label: r.moduleName, value: number(r.resultValue) }));
    return renderWideBarList(rows, 'No module data yet.');
  };

  renderTeam2SystemChart = function() {
    const rows = (state.teams.team2.systemResults || []).map(r => ({ label: r.systemName, value: number(r.count) }));
    return renderWideBarList(rows, 'No system data yet.');
  };

  renderTeam2SystemGraph = function() {
    const t = state.teams.team2;
    return `<div class="card section">
      <div class="card-head wrap"><div><h3>${labelInput('team2','team2.systemTitle','2.5 Name System - Graph')}</h3><p class="subtle">System categories and result counts. Full names are displayed in the chart below.</p></div><div class="section-tools"><button class="btn small" onclick="openAnyChartModal('team2System')">Bigger</button>${refreshButton('team2System')}<button class="btn small add-btn" onclick="addTeam2SystemResult()"><span class="sr-only">Add System</span></button></div></div>
      <div class="grid two team2-system-layout"><div class="chart-box wide-name-chart-box">${renderTeam2SystemChart()}</div><div>${(t.systemResults || []).map(r => `<div class="entry"><div class="grid two"><input class="input" value="${esc(r.systemName)}" oninput="updateSimpleListItem('team2','systemResults','${r.id}','systemName',this.value)">${numericTextInput(r.count, `updateSimpleListItem('team2','systemResults','${r.id}','count',this.value,true)`, 'input')}</div><button style="margin-top:8px" class="btn small danger" onclick="deleteSimpleListItem('team2','systemResults','${r.id}')"><span class="sr-only">Delete</span></button></div>`).join('') || '<div class="empty">No systems yet.</div>'}</div></div>
    </div>`;
  };

  renderTeam3DailyInputs = function() {
    const t = state.teams.team3;
    t.bullets = t.bullets || [];
    return `<div class="card section team3-routine-card team3-daily-inputs">
      <div class="card-head wrap"><div><h3>${labelInput('team3','team3.bulletTitle','3.1 Daily Inputs')}</h3><p class="subtle" style="margin-top:8px">Routine daily inputs for Team 3. This is not a concern section.</p></div><button class="btn small add-btn" onclick="addTeam3Bullet()"><span class="sr-only">Add Input</span></button></div>
      <div class="routine-list">
        ${(t.bullets || []).map(b => `<div class="entry routine-entry"><span class="routine-dot"></span><textarea class="auto-grow routine-line-input" oninput="updateBullet('${b.id}',this.value);autoGrow(this)" placeholder="Write Team 3 routine daily input here...">${esc(b.text)}</textarea><span class="routine-time">${esc(b.updatedAt ? 'Updated: ' + b.updatedAt : 'Created: ' + b.createdAt)}</span><div class="routine-actions"><button class="btn small danger" onclick="deleteBullet('${b.id}')"><span class="sr-only">Delete</span></button></div></div>`).join('') || '<div class="empty">No daily inputs yet.</div>'}
      </div>
    </div>`;
  };

  renderTeam3NameOperations = function() { return ''; };

  renderTeam3 = function() {
    document.getElementById('team3').innerHTML = `
      ${teamPageTitle('team3', reportButtons('team3'))}
      ${renderTeam3DailyInputs()}
      ${renderEditableSummary('team3')}
      ${renderTeam3Operations()}
      ${renderTeam3LogMaintenance()}
      ${renderAvailability('team3')}
      ${renderTnaSection('team3')}
      ${renderPersonnelSection('team3')}
    `;
    requestAnimationFrame(() => { autoGrowAll(); postRenderUiPatch(); });
  };

  renderHome = function() {
    document.getElementById('home').innerHTML = `
      <div class="hero">
        <h2>Weekly command center for offline team updates.</h2>
        <p>Offline dashboard running from local HTML and app.js files. Choose a week from the top bar, update each team, export JSON, print PDF, or export a Word-compatible report.</p>
        <div class="pill-row" style="margin-top:18px">
          <span class="pill"><span class="dot good"></span>Offline ready</span>
          <span class="pill"><span class="dot"></span>Auto-save localStorage</span>
          <span class="pill"><span class="dot warn"></span>Week history</span>
          <span class="pill"><span class="dot good"></span>Word / PDF export</span>
        </div>
      </div>
      <div class="grid team-grid">
        ${homeCard(teamDisplayName('team1'),'Operational dashboard with daily tasks, concerns, systems, recovery and Jira analytics.','team1','Open ' + teamDisplayName('team1'))}
        ${homeCard(teamDisplayName('team2'),'Weekly request tracking, statistics, module results, system counts and internal task table.','team2','Open ' + teamDisplayName('team2'))}
        ${homeCard(teamDisplayName('team3'),'Routine daily inputs, operations status, logs and maintenance notes.','team3','Open ' + teamDisplayName('team3'))}
        ${homeCard('Overview','Executive view pulling totals, personnel, TNA, absence people and important status indicators.','overview','Open Overview', true)}
      </div>`;
  };

  if (typeof render === 'function') render();
})();
