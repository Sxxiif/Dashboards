(() => {
  'use strict';

  const STORE_KEY = 'soc_weekly_ops_console_v4';
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const TEAMS = [
    { id: 'team1', label: 'Team 1', icon: 'T1' },
    { id: 'team2', label: 'Team 2', icon: 'T2' },
    { id: 'team3', label: 'Team 3', icon: 'T3' }
  ];
  const COLORS = ['#39d0ff','#7c5cff','#22c55e','#d97706','#ef4444','#14b8a6','#f43f5e','#a3e635'];

  const SCHEMAS = {
    risks: [
      { key:'title', label:'Risk / Blocker', type:'text', cls:'wideCol' },
      { key:'owner', label:'Owner', type:'text' },
      { key:'severity', label:'Severity', type:'severity' },
      { key:'status', label:'Status', type:'status' },
      { key:'notes', label:'Notes', type:'textarea', cls:'wideCol' }
    ],
    tna: [
      { key:'idManual', label:'ID Manual', type:'text' },
      { key:'date', label:'Date of Entry', type:'date', cls:'dateCol' },
      { key:'totalRequests', label:'Total Requests', type:'number' },
      { key:'status', label:'Status', type:'status' },
      { key:'comment', label:'Comment', type:'textarea', cls:'wideCol' }
    ],
    machines: [
      { key:'system', label:'System Name', type:'text', cls:'wideCol' },
      { key:'description', label:'Description', type:'textarea', cls:'wideCol' },
      { key:'active', label:'Machines Active', type:'number' },
      { key:'inactive', label:'Machines Inactive', type:'number' },
      { key:'indicator', label:'Status', type:'machineStatus' }
    ],
    tasksReceived: [
      { key:'date', label:'Date', type:'date', cls:'dateCol' },
      { key:'ref', label:'Ref Number', type:'text' },
      { key:'caseName', label:'Case Name', type:'text', cls:'wideCol' },
      { key:'received', label:'Total Received', type:'number' },
      { key:'recovered', label:'Total Recovered', type:'number' },
      { key:'complexity', label:'Complexity', type:'complexity' },
      { key:'urgent', label:'Urgent', type:'urgent' },
      { key:'saifCreated', label:'Saif Created', type:'text' },
      { key:'progress', label:'Progress %', type:'number' },
      { key:'resultProgress', label:'Result Progress %', type:'number' }
    ],
    ongoing: [
      { key:'task', label:'Task', type:'text', cls:'wideCol' },
      { key:'owner', label:'Owner', type:'text' },
      { key:'status', label:'Status', type:'status' },
      { key:'progress', label:'Progress %', type:'number' }
    ],
    urgentTasks: [
      { key:'task', label:'Task', type:'text', cls:'wideCol' },
      { key:'deadline', label:'Deadline', type:'date', cls:'dateCol' },
      { key:'owner', label:'Owner', type:'text' },
      { key:'status', label:'Status', type:'status' },
      { key:'progress', label:'Progress %', type:'number' }
    ],
    recoveredSystems: [
      { key:'system', label:'System', type:'text' },
      { key:'count', label:'Recovered Count', type:'number' },
      { key:'date', label:'Date', type:'date', cls:'dateCol' },
      { key:'notes', label:'Notes', type:'textarea', cls:'wideCol' }
    ],
    systemOutcomes: [
      { key:'system', label:'System', type:'text' },
      { key:'statusLine', label:'Status Line', type:'textarea', cls:'wideCol' },
      { key:'active', label:'Active Tasks', type:'number' },
      { key:'pending', label:'Pending', type:'number' },
      { key:'completed', label:'Completed', type:'number' }
    ],
    jira: [
      { key:'from', label:'From Date', type:'date', cls:'dateCol' },
      { key:'to', label:'To Date', type:'date', cls:'dateCol' },
      { key:'total', label:'Total Tasks Count', type:'number' },
      { key:'recovered', label:'Recovered Tasks Count', type:'number' },
      { key:'notes', label:'Notes', type:'textarea', cls:'wideCol' }
    ],
    team2Stats: [
      { key:'period', label:'Period', type:'text' },
      { key:'i1Received', label:'Input 1 Received', type:'number' },
      { key:'i1Analyzed', label:'Input 1 Analyzed', type:'number' },
      { key:'i2Received', label:'Input 2 Received', type:'number' },
      { key:'i2Analyzed', label:'Input 2 Analyzed', type:'number' }
    ],
    team2Modules: [
      { key:'module', label:'Module Name', type:'text', cls:'wideCol' },
      { key:'value', label:'Result Value', type:'number' }
    ],
    team2Systems: [
      { key:'system', label:'System Name', type:'text', cls:'wideCol' },
      { key:'count', label:'Count', type:'number' }
    ],
    team3Status: [
      { key:'name', label:'Input Name', type:'text', cls:'wideCol' },
      { key:'status', label:'Status', type:'statusDot' }
    ],
    team3Log: [
      { key:'num', label:'Name #', type:'text' },
      { key:'description', label:'Name Description', type:'textarea', cls:'wideCol' },
      { key:'status', label:'Status', type:'status' },
      { key:'flag', label:'Name', type:'urgent' }
    ],
    team3Atm: [
      { key:'total', label:'Total Requests', type:'number' },
      { key:'done', label:'Done', type:'number' },
      { key:'sent', label:'Sent to Team', type:'number' },
      { key:'pending', label:'Pending', type:'number' }
    ],
    team3NameReq: [
      { key:'total', label:'Total Requests', type:'number' },
      { key:'done', label:'Done', type:'number' },
      { key:'pending', label:'Pending', type:'number' },
      { key:'assignedTo', label:'Assigned To', type:'text' }
    ],
    flexibleDefault: []
  };

  const FLEX_DEFAULTS = {
    'team2.requested': [
      { key:'taskName', label:'Task Name', type:'text' }, { key:'startDate', label:'Start Date', type:'date' },
      { key:'endDate', label:'End Date', type:'date' }, { key:'ref', label:'Ref Number', type:'text' },
      { key:'requestedFrom', label:'Requested From', type:'text' }, { key:'input1', label:'Input 1', type:'text' }, { key:'input2', label:'Input 2', type:'text' }
    ],
    'team2.internal': [
      { key:'taskName', label:'Task Name', type:'text' }, { key:'toolUsed', label:'Tool Used', type:'text' },
      { key:'total', label:'Total', type:'number' }, { key:'comments', label:'Comments', type:'textarea' }
    ]
  };

  function todayISO(){ return new Date().toISOString().slice(0,10); }
  function weekStartISO(date = new Date()){
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return d.toISOString().slice(0,10);
  }
  function addDaysISO(iso, days){ const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
  function escapeHtml(v){ return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function uid(){ return Math.random().toString(36).slice(2,9); }
  function num(v){ const n = Number(v); return Number.isFinite(n) ? n : 0; }

  function createTeamBase(){
    const daily = {}; DAYS.forEach(d => daily[d] = []);
    return {
      daily,
      risks: [],
      tna: [],
      personnel: [],
      chartTypes: {},
      labels: {}
    };
  }
  function flexibleTable(cols){ return { columns: cols.map(c => ({...c})), rows: [] }; }
  function createWeek(){
    const t1 = createTeamBase();
    Object.assign(t1, {
      concerns: [], machines: [], tasksReceived: [], ongoing: [], urgentTasks: [], recoveredSystems: [], systemOutcomes: [], jira: [],
      chartTypes: { tasksReceived: 'bar', jira: 'bar' }
    });
    const t2 = createTeamBase();
    Object.assign(t2, {
      requested: flexibleTable(FLEX_DEFAULTS['team2.requested']),
      statsLabels: { input1: 'Input 1', input2: 'Input 2' }, stats: [], modules: [], systems: [], internal: flexibleTable(FLEX_DEFAULTS['team2.internal']),
      chartTypes: { stats: 'bar', modules: 'bar', systems: 'bar' },
      labels: { resultsTitle:'Name Results', systemTitle:'Name System' }
    });
    const t3 = createTeamBase();
    Object.assign(t3, {
      opsTitle: 'Input1 Operations - Input2 Status', statusAName: 'Name', statusBName: 'Name2', statusA: [], statusB: [],
      logTitle: 'Name', log: [], bullets: [], maintenanceTitle: 'Name Maintenance', maintenance: [],
      operationsTitle: 'Name Operations', atm: [], nameReq: []
    });
    return { team1:t1, team2:t2, team3:t3 };
  }

  let state = loadState();

  function loadState(){
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return migrate(parsed);
      }
    } catch (_) {}
    return migrate({ view:'home', theme:'dark', week: weekStartISO(), collapsed:{}, weeks:{} });
  }
  function migrate(s){
    s.view = s.view || 'home';
    s.theme = s.theme || 'dark';
    s.week = s.week || weekStartISO();
    s.collapsed = s.collapsed || {};
    s.weeks = s.weeks || {};
    if (!s.weeks[s.week]) s.weeks[s.week] = createWeek();
    Object.keys(s.weeks).forEach(w => {
      const base = createWeek();
      s.weeks[w] = deepMerge(base, s.weeks[w]);
    });
    return s;
  }
  function deepMerge(target, src){
    if (!src || typeof src !== 'object') return target;
    Object.keys(src).forEach(k => {
      if (Array.isArray(src[k])) target[k] = src[k];
      else if (src[k] && typeof src[k] === 'object') target[k] = deepMerge(target[k] || {}, src[k]);
      else target[k] = src[k];
    });
    return target;
  }
  function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  function week(){ if(!state.weeks[state.week]) state.weeks[state.week] = createWeek(); return state.weeks[state.week]; }
  function getPath(path){ return path.split('.').reduce((o,k) => o ? o[k] : undefined, week()); }
  function setPath(path, value){ const parts = path.split('.'); let obj = week(); while(parts.length > 1){ const p = parts.shift(); if(!obj[p]) obj[p] = {}; obj = obj[p]; } obj[parts[0]] = value; save(); }

  function render(){
    document.body.dataset.theme = state.theme;
    const app = document.getElementById('app');
    app.innerHTML = shell(renderPage());
    autoResizeTextareas();
  }
  function shell(pageHtml){
    return `<div class="app">
      <aside class="rail">
        <div class="logoBox" title="Logo area">SOC</div>
        <nav class="railNav">
          ${navButton('home','⌂','Home')}
          ${navButton('overview','◆','Overview')}
          ${navButton('team1','1','Team 1')}
          ${navButton('team2','2','Team 2')}
          ${navButton('team3','3','Team 3')}
        </nav>
      </aside>
      <header class="top">
        <div class="titleBlock">
          <h1>Weekly Operations Console</h1>
          <p>Offline SOC / Cyber dashboard · Week of ${escapeHtml(state.week)}</p>
        </div>
        <div class="topControls">
          <button class="iconBtn" data-action="prev-week" title="Previous week">‹</button>
          <button class="chipBtn" data-action="this-week">This Week</button>
          <button class="iconBtn" data-action="next-week" title="Next week">›</button>
          <input class="dateInput" type="date" data-action="jump-week" value="${state.week}">
          <button class="chipBtn" data-action="toggle-theme">${state.theme === 'dark' ? 'Light' : 'Dark'}</button>
          <button class="chipBtn" data-action="export-json">Export JSON</button>
          <button class="chipBtn" data-action="trigger-import">Import JSON</button>
          <button class="chipBtn" data-action="export-word">Word</button>
          <button class="chipBtn" data-action="print">PDF</button>
        </div>
      </header>
      <main class="main">${pageHtml}<div class="footer">Built by sxxiif</div></main>
    </div>`;
  }
  function navButton(view, ico, label){ return `<button class="navBtn ${state.view===view?'active':''}" data-action="view" data-view="${view}"><span class="ico">${ico}</span><span>${label}</span></button>`; }
  function renderPage(){
    if (state.view === 'home') return renderHome();
    if (state.view === 'overview') return renderOverview();
    if (state.view === 'team1') return renderTeam1();
    if (state.view === 'team2') return renderTeam2();
    if (state.view === 'team3') return renderTeam3();
    return renderHome();
  }

  function renderHome(){
    const m = overallMetrics();
    return `<div class="page">
      <div class="hero">
        <div class="heroMain"><div class="eyebrow">Command start</div><h2>Select operational workspace</h2><p>This version is rebuilt from scratch with a command-console layout. Team names remain Team 1, Team 2, Team 3, and Overview. All data is saved locally by week.</p></div>
        ${metric('Tasks', m.tasks, '')}${metric('Risks', m.risks, 'warn')}${metric('Urgent', m.urgent, 'bad')}${metric('Personnel', m.personnel, 'good')}
      </div>
      <div class="homeGrid">
        ${homeCard('overview','◆','Overview','Executive mission view with team risks, Jira outcomes, systems status, and weekly task movement.')}
        ${homeCard('team1','1','Team 1','Daily operations, machines, Tasks Received / Recovered, system outcomes, and Jira records.')}
        ${homeCard('team2','2','Team 2','Requested tasks, statistics, result modules, system counts, and internal tasks.')}
        ${homeCard('team3','3','Team 3','Operations status wall, logs, maintenance notes, ATM/name requests, and status indicators.')}
      </div>
    </div>`;
  }
  function homeCard(view, ico, title, text){ return `<div class="homeCard"><div class="eyebrow">${ico}</div><h3>${title}</h3><p>${text}</p><button class="chipBtn open" data-action="view" data-view="${view}">Open</button></div>`; }
  function metric(label, value, cls=''){ return `<div class="metric ${cls}"><div class="num">${value}</div><div class="lbl">${label}</div></div>`; }

  function renderOverview(){
    const m = overallMetrics();
    const w = week();
    return `<div class="page">
      <div class="hero">
        <div class="heroMain"><div class="eyebrow">Overview</div><h2>Mission control summary</h2><p>Read-only command view for the selected week. Personnel and TNA are intentionally not shown here.</p></div>
        ${metric('Total Tasks', m.tasks)}${metric('Open Risks', m.risks,'warn')}${metric('Urgent', m.urgent,'bad')}${metric('Systems', w.team1.systemOutcomes.length,'good')}
      </div>
      <div class="chartGrid">
        ${chartSection('ov-jira','Team 1 Jira Dashboard','overviewJira','bar','overview.jira')}
        ${chartSection('ov-tasks','Tasks Received / Recovered','overviewTasks','bar','overview.tasks')}
      </div>
      <div class="teamLayout">
        <div class="leftStack">
          ${section('ov-risks','Risks / Blockers by Team', risksByTeam(), 'ALERTS')}
        </div>
        <div class="centerStack">
          ${section('ov-systems','Team 1 System Outcomes', simpleOutcomeCards(w.team1.systemOutcomes), 'SYSTEMS')}
          ${section('ov-team2','Team 2 Signals', team2Overview(), 'ANALYTICS')}
        </div>
        <div class="rightStack">
          ${section('ov-team3','Team 3 Status Wall', team3StatusOverview(), 'STATUS')}
          ${section('ov-links','Quick Links', `<div class="opsGrid">${TEAMS.map(t=>`<div class="opsItem"><strong>${t.label}</strong><button class="chipBtn" data-action="view" data-view="${t.id}">Open</button></div>`).join('')}</div>`, 'NAV')}
        </div>
      </div>
    </div>`;
  }

  function renderTeam1(){
    const t = week().team1;
    return `<div class="page">
      <div class="hero">
        <div class="heroMain"><div class="eyebrow">Team 1</div><h2>Operational recovery workspace</h2><p>Daily updates, concerns, machines, received/recovered tasks, system outcomes, and Jira range tracking.</p></div>
        ${metric('Received', sum(t.tasksReceived,'received'))}${metric('Recovered', sum(t.tasksReceived,'recovered'),'good')}${metric('Jira Total', sum(t.jira,'total'))}${metric('Risks', t.risks.length,'warn')}
      </div>
      <div class="chartGrid">
        ${chartSection('t1-chart-tasks','Tasks Received / Recovered','t1Tasks', t.chartTypes.tasksReceived || 'bar', 'team1.chartTypes.tasksReceived', ['bar','pie'])}
        ${chartSection('t1-chart-jira','Jira Total / Recovered','t1Jira', t.chartTypes.jira || 'bar', 'team1.chartTypes.jira', ['bar','pie','area'])}
      </div>
      <div class="teamLayout">
        <div class="leftStack">
          ${dailySection('team1')}
          ${concernsSection()}
          ${tableSection('t1-machines','Systems / Machines Activity','team1.machines','machines','SYSTEMS')}
          ${commonRisksSection('team1')}
        </div>
        <div class="centerStack">
          ${tableSection('t1-received','Tasks Received This Week','team1.tasksReceived','tasksReceived','TASKS')}
          ${tableSection('t1-ongoing','Total Ongoing Tasks This Week','team1.ongoing','ongoing','ONGOING')}
          ${tableSection('t1-urgent','Urgent Tasks','team1.urgentTasks','urgentTasks','URGENT')}
          ${tableSection('t1-jira','Jira List / Date Range Inputs','team1.jira','jira','JIRA')}
        </div>
        <div class="rightStack">
          ${tableSection('t1-recovered','Recovered Systems','team1.recoveredSystems','recoveredSystems','RECOVERY')}
          ${tableSection('t1-outcomes','Systems Outcomes','team1.systemOutcomes','systemOutcomes','OUTCOMES')}
          ${commonTnaSection('team1')}
          ${personnelSection('team1')}
        </div>
      </div>
    </div>`;
  }

  function renderTeam2(){
    const t = week().team2;
    return `<div class="page">
      <div class="hero">
        <div class="heroMain"><div class="eyebrow">Team 2</div><h2>Task intelligence workspace</h2><p>Requested tasks, statistics, results, systems analysis, internal tasks, risks, TNA, and personnel.</p></div>
        ${metric('Requested', t.requested.rows.length)}${metric('Stats Rows', t.stats.length)}${metric('Modules', t.modules.length,'good')}${metric('Risks', t.risks.length,'warn')}
      </div>
      <div class="chartGrid">
        ${chartSection('t2-stat-chart','2.3 Statistics','t2Stats', t.chartTypes.stats || 'bar', 'team2.chartTypes.stats', ['bar','pie','area'])}
        ${chartSection('t2-results-chart', escapeHtml(t.labels.resultsTitle || 'Name Results'),'t2Modules', t.chartTypes.modules || 'bar', 'team2.chartTypes.modules', ['bar','pie','area'])}
        ${chartSection('t2-system-chart', escapeHtml(t.labels.systemTitle || 'Name System'),'t2Systems', t.chartTypes.systems || 'bar', 'team2.chartTypes.systems', ['bar','pie','area'])}
      </div>
      <div class="teamLayout">
        <div class="leftStack">
          ${dailySection('team2')}
          ${team2LabelsSection()}
          ${commonRisksSection('team2')}
        </div>
        <div class="centerStack">
          ${flexTableSection('t2-requested','Requested Tasks Table','team2.requested','REQUESTS')}
          ${tableSection('t2-stats','Statistics Data','team2.stats','team2Stats','STATISTICS')}
          ${tableSection('t2-modules','Results Modules','team2.modules','team2Modules','RESULTS')}
          ${tableSection('t2-systems','System Graph Data','team2.systems','team2Systems','SYSTEMS')}
          ${flexTableSection('t2-internal','Internal Task Table','team2.internal','INTERNAL')}
        </div>
        <div class="rightStack">
          ${commonTnaSection('team2')}
          ${personnelSection('team2')}
        </div>
      </div>
    </div>`;
  }

  function renderTeam3(){
    const t = week().team3;
    return `<div class="page">
      <div class="hero">
        <div class="heroMain"><div class="eyebrow">Team 3</div><h2>Operations status workspace</h2><p>Free-form daily updates, operational status indicators, logs, maintenance, request tracking, risks, TNA, and personnel.</p></div>
        ${metric('Status Items', t.statusA.length + t.statusB.length)}${metric('Logs', t.log.length)}${metric('Requests', sum(t.atm,'total') + sum(t.nameReq,'total'))}${metric('Risks', t.risks.length,'warn')}
      </div>
      <div class="teamLayout">
        <div class="leftStack">
          ${dailySection('team3')}
          ${team3StatusSection()}
          ${commonRisksSection('team3')}
        </div>
        <div class="centerStack">
          ${team3LogSection()}
          ${tableSection('t3-atm','ATM Requests','team3.atm','team3Atm','ATM')}
          ${tableSection('t3-namereq','Name Requests','team3.nameReq','team3NameReq','REQUESTS')}
        </div>
        <div class="rightStack">
          ${commonTnaSection('team3')}
          ${personnelSection('team3')}
        </div>
      </div>
    </div>`;
  }

  function section(key, title, body, tag='SECTION', actions=''){
    const isCollapsed = !!state.collapsed[key];
    return `<section class="section ${isCollapsed?'collapsed':''}" data-section="${key}">
      <div class="sectionHead">
        <div class="sectionTitle"><span class="tag">${tag}</span><h3>${title}</h3></div>
        <div class="sectionActions">${actions}<button class="iconBtn collapseBtn" data-action="collapse" data-key="${key}" title="Collapse / expand">▾</button></div>
      </div>
      <div class="sectionBody">${body}</div>
    </section>`;
  }
  function chartSection(key, title, chartId, type, typePath, options=['bar','pie','area']){
    const actions = `<select class="select" data-action="chart-type" data-path="${typePath}">${options.map(o=>`<option value="${o}" ${o===type?'selected':''}>${cap(o)}</option>`).join('')}</select><button class="iconBtn" data-action="refresh" title="Refresh">⟳</button><button class="iconBtn" data-action="expand-chart" data-chart="${chartId}" data-title="${escapeHtml(title)}" title="Bigger">⛶</button>`;
    return section(key, title, `<div class="chartCanvas" data-chart="${chartId}">${renderChart(chartId, type)}</div>`, 'CHART', actions);
  }
  function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

  function dailySection(team){
    const t = week()[team];
    const body = `<div class="dayList">${DAYS.map(day => `<div class="dayBox"><div class="dayTop"><strong>${day}</strong><button class="iconBtn add" data-action="add-daily" data-team="${team}" data-day="${day}" title="Add entry">+</button></div>${t.daily[day].map((e,i)=>entryHtml(e, {action:'del-daily', team, day, index:i}, `${team}.daily.${day}.${i}.text`)).join('')}</div>`).join('')}</div>`;
    return section(`${team}-daily`, 'Daily Tasks', body, 'DAILY');
  }
  function entryHtml(e, delData, bindPath){
    return `<div class="entry"><div class="entryMeta"><span>${escapeHtml(e.ts || '')}</span><button class="iconBtn danger" ${attrs(delData)} title="Delete">🗑</button></div><textarea data-bind="${bindPath}" placeholder="What was done today?">${escapeHtml(e.text || '')}</textarea></div>`;
  }
  function attrs(obj){ return Object.entries(obj).map(([k,v]) => `data-${k.replace(/[A-Z]/g, m=>'-'+m.toLowerCase())}="${escapeHtml(v)}"`).join(' '); }

  function concernsSection(){
    const rows = week().team1.concerns;
    const body = `<div class="inputRow"><input class="grow" data-new="concern" placeholder="Write a concern"><button class="iconBtn add" data-action="add-concern" title="Add concern">+</button></div>${rows.map((c,i)=>`<div class="concern"><span>●</span><input data-bind="team1.concerns.${i}.text" value="${escapeHtml(c.text)}"><button class="iconBtn danger" data-action="del-concern" data-index="${i}" title="Delete">🗑</button></div>`).join('')}`;
    return section('team1-concerns', 'Team 1 Concerns', body, 'CONCERN');
  }

  function commonRisksSection(team){ return tableSection(`${team}-risks`, 'Risks / Blockers', `${team}.risks`, 'risks', 'ALERTS'); }
  function commonTnaSection(team){ return tableSection(`${team}-tna`, 'TNA', `${team}.tna`, 'tna', 'TNA'); }

  function personnelSection(team){
    const t = week()[team];
    const form = `<div class="fieldGrid"><div class="field"><label>Name</label><input data-new-person="name" data-team="${team}" placeholder="Saif Alketbi"></div><div class="field"><label>Role</label><input data-new-person="role" data-team="${team}" placeholder="Analyst"></div><div class="field"><label>ID</label><input data-new-person="id" data-team="${team}" placeholder="001"></div><div class="field"><label>&nbsp;</label><button class="iconBtn add" data-action="add-person" data-team="${team}" title="Add person">+</button></div></div>`;
    const cards = `<div class="operatorGrid">${t.personnel.map((p,i)=>`<div class="operator"><div class="avatar">${initials(p.name)}</div><div><h4>${escapeHtml(p.name)}</h4><p>${escapeHtml(p.role)}</p><div class="id">ID: ${escapeHtml(p.id)}</div></div><button class="iconBtn danger" data-action="del-person" data-team="${team}" data-index="${i}" title="Delete">🗑</button></div>`).join('') || `<div class="empty">No personnel cards yet.</div>`}</div>`;
    return section(`${team}-personnel`, 'Personnel Cards', `${form}<br>${cards}`, 'PEOPLE');
  }
  function initials(name){ const parts = String(name||'').trim().split(/\s+/).filter(Boolean); return ((parts[0]?.[0]||'?') + (parts[1]?.[0]||'')).toUpperCase(); }

  function tableSection(key, title, path, schemaKey, tag){
    const rows = getPath(path) || [];
    const schema = SCHEMAS[schemaKey];
    const body = `<div class="tableWrap">${renderTable(path, rows, schema, schemaKey)}</div>`;
    const actions = `<button class="iconBtn add" data-action="add-row" data-path="${path}" data-schema="${schemaKey}" title="Add row">+</button>`;
    return section(key, title, body, tag, actions);
  }
  function renderTable(path, rows, schema, schemaKey){
    return `<table class="dataTable"><thead><tr>${schema.map(c=>`<th class="${c.cls||''}">${escapeHtml(c.label)}</th>`).join('')}<th class="tinyCol"> </th></tr></thead><tbody>${rows.map((row,ri)=>`<tr>${schema.map(c=>`<td class="${c.cls||''}">${cell(path, ri, c, row, schemaKey)}</td>`).join('')}<td class="tinyCol"><button class="iconBtn danger" data-action="del-row" data-path="${path}" data-index="${ri}" title="Delete">🗑</button></td></tr>`).join('') || `<tr><td colspan="${schema.length+1}"><div class="empty">No rows yet.</div></td></tr>`}</tbody></table>`;
  }
  function cell(path, ri, col, row, schemaKey){
    const bind = `${path}.${ri}.${col.key}`;
    const val = row[col.key] ?? '';
    if (col.type === 'textarea') return `<textarea data-bind="${bind}">${escapeHtml(val)}</textarea>`;
    if (col.type === 'date') return `<input type="date" data-bind="${bind}" value="${escapeHtml(val)}">`;
    if (col.type === 'number') return `<input inputmode="decimal" data-bind="${bind}" value="${escapeHtml(val)}" placeholder="0">`;
    if (col.type === 'severity') return selectCell(bind, val, ['Low','Medium','High','Critical']);
    if (col.type === 'status') return selectCell(bind, val, ['Not Started','In Progress','Pending','Completed','Blocked','Done']);
    if (col.type === 'complexity') return selectCell(bind, val, ['Low','Medium','High','Critical']);
    if (col.type === 'urgent') return selectCell(bind, val, ['No','Yes']);
    if (col.type === 'machineStatus') return machineIndicator(row);
    if (col.type === 'statusDot') return statusDotButton(path, ri, row.status || 'Operational');
    return `<input data-bind="${bind}" value="${escapeHtml(val)}">`;
  }
  function selectCell(bind, val, opts){ return `<select data-bind="${bind}">${opts.map(o=>`<option value="${o}" ${String(val||opts[0])===o?'selected':''}>${o}</option>`).join('')}</select>`; }
  function machineIndicator(row){
    const active = num(row.active), inactive = num(row.inactive);
    const cls = inactive === 0 ? 's-good' : (active === 0 ? 's-bad' : 's-warn');
    return `<span class="statusPill"><span class="statusDot ${cls}"></span></span>`;
  }
  function statusDotButton(path, ri, status){
    const cls = status === 'Down' ? 's-bad' : (status === 'Partial' ? 's-warn' : 's-good');
    return `<button class="statusPill" data-action="cycle-status" data-path="${path}" data-index="${ri}" title="${escapeHtml(status)}"><span class="statusDot ${cls}"></span></button>`;
  }

  function flexTableSection(key, title, path, tag){
    const table = getPath(path);
    const actions = `<button class="iconBtn add" data-action="add-flex-row" data-path="${path}" title="Add row">+</button><button class="iconBtn" data-action="add-flex-col" data-path="${path}" title="Add column">＋</button>`;
    return section(key, title, `<div class="tableWrap">${renderFlexTable(path, table)}</div>`, tag, actions);
  }
  function renderFlexTable(path, table){
    const cols = table.columns || [];
    const rows = table.rows || [];
    return `<table class="dataTable"><thead><tr>${cols.map((c,ci)=>`<th><div class="inputRow"><input class="denseInput" data-bind="${path}.columns.${ci}.label" value="${escapeHtml(c.label)}"><button class="iconBtn danger" data-action="del-flex-col" data-path="${path}" data-index="${ci}" title="Delete column">🗑</button></div></th>`).join('')}<th class="tinyCol"></th></tr></thead><tbody>${rows.map((r,ri)=>`<tr>${cols.map(c=>`<td>${flexCell(path, ri, c, r[c.key])}</td>`).join('')}<td class="tinyCol"><button class="iconBtn danger" data-action="del-flex-row" data-path="${path}" data-index="${ri}" title="Delete">🗑</button></td></tr>`).join('') || `<tr><td colspan="${cols.length+1}"><div class="empty">No rows yet.</div></td></tr>`}</tbody></table>`;
  }
  function flexCell(path, ri, col, val){
    const bind = `${path}.rows.${ri}.${col.key}`;
    if (col.type === 'date') return `<input type="date" data-bind="${bind}" value="${escapeHtml(val||'')}">`;
    if (col.type === 'number') return `<input inputmode="decimal" data-bind="${bind}" value="${escapeHtml(val||'')}">`;
    if (col.type === 'textarea') return `<textarea data-bind="${bind}">${escapeHtml(val||'')}</textarea>`;
    return `<input data-bind="${bind}" value="${escapeHtml(val||'')}">`;
  }

  function team2LabelsSection(){
    const t = week().team2;
    const body = `<div class="fieldGrid">
      <div class="field"><label>Input 1 label</label><input data-bind="team2.statsLabels.input1" value="${escapeHtml(t.statsLabels.input1)}"></div>
      <div class="field"><label>Input 2 label</label><input data-bind="team2.statsLabels.input2" value="${escapeHtml(t.statsLabels.input2)}"></div>
      <div class="field"><label>Results title</label><input data-bind="team2.labels.resultsTitle" value="${escapeHtml(t.labels.resultsTitle)}"></div>
      <div class="field"><label>System title</label><input data-bind="team2.labels.systemTitle" value="${escapeHtml(t.labels.systemTitle)}"></div>
    </div>`;
    return section('team2-labels','Renameable Labels', body, 'LABELS');
  }
  function team3StatusSection(){
    const t = week().team3;
    const body = `<div class="field"><label>Section Title</label><input data-bind="team3.opsTitle" value="${escapeHtml(t.opsTitle)}"></div><br>
      <div class="field"><label>Subsection A</label><input data-bind="team3.statusAName" value="${escapeHtml(t.statusAName)}"></div><br>${tableSectionInner('team3.statusA','team3Status')}
      <br><div class="field"><label>Subsection B</label><input data-bind="team3.statusBName" value="${escapeHtml(t.statusBName)}"></div><br>${tableSectionInner('team3.statusB','team3Status')}`;
    const actions = `<button class="iconBtn add" data-action="add-row" data-path="team3.statusA" data-schema="team3Status" title="Add status A">+</button><button class="iconBtn add" data-action="add-row" data-path="team3.statusB" data-schema="team3Status" title="Add status B">+</button>`;
    return section('team3-status', escapeHtml(t.opsTitle), body, 'STATUS', actions);
  }
  function tableSectionInner(path, schemaKey){ return `<div class="tableWrap">${renderTable(path, getPath(path)||[], SCHEMAS[schemaKey], schemaKey)}</div>`; }
  function team3LogSection(){
    const t = week().team3;
    const bulletHtml = `<div class="inputRow"><input class="grow" data-new="team3Bullet" placeholder="Add bullet point"><button class="iconBtn add" data-action="add-bullet" title="Add bullet">+</button></div>${t.bullets.map((b,i)=>`<div class="concern"><span>•</span><input data-bind="team3.bullets.${i}.text" value="${escapeHtml(b.text)}"><button class="iconBtn danger" data-action="del-bullet" data-index="${i}" title="Delete">🗑</button></div>`).join('')}`;
    const maint = `<div class="inputRow"><input class="grow" data-new="maintenance" placeholder="ATM bank Mushref branch: 2/3 done"><button class="iconBtn add" data-action="add-maintenance" title="Add maintenance">+</button></div>${t.maintenance.map((m,i)=>entryHtml(m,{action:'del-maintenance', index:i},`team3.maintenance.${i}.text`)).join('')}`;
    const body = `<div class="field"><label>Section Title</label><input data-bind="team3.logTitle" value="${escapeHtml(t.logTitle)}"></div><br>${tableSectionInner('team3.log','team3Log')}<br>${section('team3-bullets-inner','Bullet Point List',bulletHtml,'LIST')}<br><div class="field"><label>Maintenance Title</label><input data-bind="team3.maintenanceTitle" value="${escapeHtml(t.maintenanceTitle)}"></div><br>${maint}`;
    const actions = `<button class="iconBtn add" data-action="add-row" data-path="team3.log" data-schema="team3Log" title="Add log row">+</button>`;
    return section('team3-log', escapeHtml(t.logTitle), body, 'LOG', actions);
  }

  function defaultRow(schemaKey){
    const row = {};
    (SCHEMAS[schemaKey] || []).forEach(c => {
      if (c.type === 'date') row[c.key] = todayISO();
      else if (c.type === 'number') row[c.key] = '';
      else if (c.type === 'severity') row[c.key] = 'Medium';
      else if (c.type === 'status') row[c.key] = 'In Progress';
      else if (c.type === 'complexity') row[c.key] = 'Medium';
      else if (c.type === 'urgent') row[c.key] = 'No';
      else if (c.type === 'statusDot') row[c.key] = 'Operational';
      else if (c.key !== 'indicator') row[c.key] = '';
    });
    return row;
  }

  function renderChart(id, type){
    let data = [];
    if (id === 't1Tasks' || id === 'overviewTasks') data = tasksReceivedData();
    if (id === 't1Jira' || id === 'overviewJira') data = jiraData();
    if (id === 't2Stats') data = team2StatsData();
    if (id === 't2Modules') data = week().team2.modules.map(r => ({label:r.module || 'Module', a:num(r.value)}));
    if (id === 't2Systems') data = week().team2.systems.map(r => ({label:r.system || 'System', a:num(r.count)}));
    if (!data.length || data.every(d => num(d.a)+num(d.b) === 0)) return `<div class="empty">No chart data yet.</div>`;
    if (type === 'pie') return pieSvg(data);
    if (type === 'area') return areaSvg(data);
    return barSvg(data);
  }
  function tasksReceivedData(){
    const rows = week().team1.tasksReceived || [];
    const map = new Map();
    rows.forEach(r => {
      const label = r.date || 'No date';
      if(!map.has(label)) map.set(label, {label, a:0, b:0});
      const item = map.get(label); item.a += num(r.received); item.b += num(r.recovered);
    });
    return Array.from(map.values());
  }
  function jiraData(){
    return (week().team1.jira || []).map(r => ({label: `${r.from || '?'}→${r.to || '?'}`, a:num(r.total), b:num(r.recovered)}));
  }
  function team2StatsData(){
    const labels = week().team2.statsLabels;
    return (week().team2.stats || []).flatMap(r => [
      { label:`${r.period || 'Period'} ${labels.input1} Received`, a:num(r.i1Received) },
      { label:`${r.period || 'Period'} ${labels.input1} Analyzed`, a:num(r.i1Analyzed) },
      { label:`${r.period || 'Period'} ${labels.input2} Received`, a:num(r.i2Received) },
      { label:`${r.period || 'Period'} ${labels.input2} Analyzed`, a:num(r.i2Analyzed) }
    ]);
  }
  function barSvg(data){
    const w=760,h=230,p=30,max=Math.max(1,...data.map(d=>Math.max(num(d.a),num(d.b))));
    const group=(w-p*2)/data.length;
    const barW=Math.max(8,Math.min(28,group/3));
    const bars=data.map((d,i)=>{
      const x=p+i*group+group/2; const ha=(h-p*2)*num(d.a)/max; const hb=(h-p*2)*num(d.b)/max;
      return `<rect x="${x-barW-2}" y="${h-p-ha}" width="${barW}" height="${ha}" rx="4" fill="${COLORS[0]}"></rect><rect x="${x+2}" y="${h-p-hb}" width="${barW}" height="${hb}" rx="4" fill="${COLORS[1]}"></rect><text x="${x}" y="${h-8}" text-anchor="middle" fill="currentColor" font-size="10">${escapeHtml(short(d.label,14))}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${w} ${h}" role="img"><line x1="${p}" y1="${h-p}" x2="${w-p}" y2="${h-p}" stroke="currentColor" opacity=".25"/><line x1="${p}" y1="${p}" x2="${p}" y2="${h-p}" stroke="currentColor" opacity=".25"/>${bars}</svg>${legend(['Total/Received','Recovered/Analyzed'])}`;
  }
  function areaSvg(data){
    const w=760,h=230,p=30,max=Math.max(1,...data.map(d=>Math.max(num(d.a),num(d.b))));
    const step=(w-p*2)/Math.max(1,data.length-1);
    const ptsA=data.map((d,i)=>[p+i*step,h-p-(h-p*2)*num(d.a)/max]);
    const ptsB=data.map((d,i)=>[p+i*step,h-p-(h-p*2)*num(d.b)/max]);
    const path = pts => pts.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join(' ');
    const area = pts => `${path(pts)} L ${p+(data.length-1)*step},${h-p} L ${p},${h-p} Z`;
    const labels = data.map((d,i)=>`<text x="${p+i*step}" y="${h-8}" text-anchor="middle" fill="currentColor" font-size="10">${escapeHtml(short(d.label,12))}</text>`).join('');
    return `<svg viewBox="0 0 ${w} ${h}"><line x1="${p}" y1="${h-p}" x2="${w-p}" y2="${h-p}" stroke="currentColor" opacity=".25"/><path d="${area(ptsA)}" fill="${COLORS[0]}" opacity=".25"></path><path d="${area(ptsB)}" fill="${COLORS[1]}" opacity=".20"></path><path d="${path(ptsA)}" fill="none" stroke="${COLORS[0]}" stroke-width="3"></path><path d="${path(ptsB)}" fill="none" stroke="${COLORS[1]}" stroke-width="3"></path>${labels}</svg>${legend(['Total/Received','Recovered/Analyzed'])}`;
  }
  function pieSvg(data){
    const totals = [];
    data.forEach(d => { totals.push({label:`${d.label} A`, value:num(d.a)}); if ('b' in d) totals.push({label:`${d.label} B`, value:num(d.b)}); });
    const filtered = totals.filter(d=>d.value>0).slice(0,12);
    const total = filtered.reduce((a,b)=>a+b.value,0) || 1;
    let angle = -Math.PI/2;
    const cx=380,cy=112,r=82;
    const paths = filtered.map((d,i)=>{
      const next = angle + (d.value/total)*Math.PI*2; const large = next-angle > Math.PI ? 1:0;
      const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle), x2=cx+r*Math.cos(next), y2=cy+r*Math.sin(next);
      const path=`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
      angle=next; return `<path d="${path}" fill="${COLORS[i%COLORS.length]}"></path>`;
    }).join('');
    const leg = filtered.slice(0,8).map((d,i)=>`<span><i class="swatch" style="background:${COLORS[i%COLORS.length]}"></i>${escapeHtml(short(d.label,20))}: ${d.value}</span>`).join('');
    return `<svg viewBox="0 0 760 230"><circle cx="${cx}" cy="${cy}" r="86" fill="none" stroke="currentColor" opacity=".18"/>${paths}</svg><div class="legend">${leg}</div>`;
  }
  function legend(labels){ return `<div class="legend">${labels.map((l,i)=>`<span><i class="swatch" style="background:${COLORS[i]}"></i>${l}</span>`).join('')}</div>`; }
  function short(s,n){ s=String(s||''); return s.length>n ? s.slice(0,n-1)+'…' : s; }

  function simpleOutcomeCards(rows){
    if(!rows.length) return `<div class="empty">No system outcomes yet.</div>`;
    return `<div class="opsGrid">${rows.map(r=>`<div class="opsItem"><div><strong>${escapeHtml(r.system||'System')}</strong><div class="smallMuted">A:${num(r.active)} · P:${num(r.pending)} · C:${num(r.completed)}</div></div><span class="statusDot ${num(r.pending)>0?'s-warn':'s-good'}"></span></div>`).join('')}</div>`;
  }
  function risksByTeam(){
    const w = week();
    const html = TEAMS.map(t => {
      const risks = w[t.id].risks || [];
      return `<div class="riskTicket"><h4>${t.label}</h4>${risks.length ? risks.map(r=>`<p><strong>${escapeHtml(r.severity||'Medium')}</strong> · ${escapeHtml(r.title||'Risk')} · ${escapeHtml(r.status||'')}</p>`).join('') : '<p>No risks recorded.</p>'}</div>`;
    }).join('');
    return `<div class="riskList">${html}</div>`;
  }
  function team2Overview(){
    const t = week().team2;
    return `<div class="opsGrid"><div class="opsItem"><strong>Requested</strong><span>${t.requested.rows.length}</span></div><div class="opsItem"><strong>Stats</strong><span>${t.stats.length}</span></div><div class="opsItem"><strong>Modules</strong><span>${t.modules.length}</span></div><div class="opsItem"><strong>Systems</strong><span>${t.systems.length}</span></div></div>`;
  }
  function team3StatusOverview(){
    const t = week().team3; const rows = [...t.statusA, ...t.statusB];
    if(!rows.length) return `<div class="empty">No operation status yet.</div>`;
    return `<div class="opsGrid">${rows.map(r=>`<div class="opsItem"><strong>${escapeHtml(r.name||'Input')}</strong>${statusDotButton('team3.statusA',0,r.status||'Operational').replace(/data-action="cycle-status"[^>]*>/,'>')}</div>`).join('')}</div>`;
  }

  function overallMetrics(){
    const w = week();
    const tasks = w.team1.tasksReceived.length + w.team1.ongoing.length + w.team1.urgentTasks.length + w.team2.requested.rows.length + w.team2.internal.rows.length + w.team3.atm.length + w.team3.nameReq.length;
    const risks = w.team1.risks.length + w.team2.risks.length + w.team3.risks.length;
    const urgent = w.team1.tasksReceived.filter(r=>r.urgent==='Yes').length + w.team1.urgentTasks.length;
    const personnel = w.team1.personnel.length + w.team2.personnel.length + w.team3.personnel.length;
    return { tasks, risks, urgent, personnel };
  }
  function sum(rows, key){ return (rows||[]).reduce((a,r)=>a+num(r[key]),0); }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]'); if(!btn) return;
    const a = btn.dataset.action;
    const y = window.scrollY;
    if (a === 'view') { state.view = btn.dataset.view; save(); render(); return; }
    if (a === 'toggle-theme') { state.theme = state.theme === 'dark' ? 'light' : 'dark'; save(); render(); return; }
    if (a === 'prev-week') { state.week = addDaysISO(state.week,-7); if(!state.weeks[state.week]) state.weeks[state.week]=createWeek(); save(); render(); return; }
    if (a === 'next-week') { state.week = addDaysISO(state.week,7); if(!state.weeks[state.week]) state.weeks[state.week]=createWeek(); save(); render(); return; }
    if (a === 'this-week') { state.week = weekStartISO(); if(!state.weeks[state.week]) state.weeks[state.week]=createWeek(); save(); render(); return; }
    if (a === 'collapse') { state.collapsed[btn.dataset.key] = !state.collapsed[btn.dataset.key]; save(); render(); window.scrollTo(0,y); return; }
    if (a === 'add-daily') { week()[btn.dataset.team].daily[btn.dataset.day].push({ts:new Date().toLocaleString(), text:''}); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'del-daily') { week()[btn.dataset.team].daily[btn.dataset.day].splice(Number(btn.dataset.index),1); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'add-concern') { const inp=document.querySelector('[data-new="concern"]'); week().team1.concerns.push({ts:new Date().toLocaleString(), text: inp?.value || ''}); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'del-concern') { week().team1.concerns.splice(Number(btn.dataset.index),1); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'add-row') { const rows = getPath(btn.dataset.path); rows.push(defaultRow(btn.dataset.schema)); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'del-row') { getPath(btn.dataset.path).splice(Number(btn.dataset.index),1); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'add-flex-row') { const table=getPath(btn.dataset.path); const row={}; table.columns.forEach(c=>row[c.key]=''); table.rows.push(row); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'del-flex-row') { getPath(btn.dataset.path).rows.splice(Number(btn.dataset.index),1); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'add-flex-col') { const table=getPath(btn.dataset.path); const key='c_'+uid(); table.columns.push({key,label:'New Column',type:'text'}); table.rows.forEach(r=>r[key]=''); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'del-flex-col') { const table=getPath(btn.dataset.path); const col=table.columns[Number(btn.dataset.index)]; if(col){ table.columns.splice(Number(btn.dataset.index),1); table.rows.forEach(r=>delete r[col.key]); } save(); render(); window.scrollTo(0,y); return; }
    if (a === 'cycle-status') { const rows=getPath(btn.dataset.path); const r=rows[Number(btn.dataset.index)]; const order=['Operational','Partial','Down']; r.status = order[(order.indexOf(r.status)+1)%order.length] || 'Operational'; save(); render(); window.scrollTo(0,y); return; }
    if (a === 'add-bullet') { const inp=document.querySelector('[data-new="team3Bullet"]'); week().team3.bullets.push({ts:new Date().toLocaleString(), text:inp?.value||''}); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'del-bullet') { week().team3.bullets.splice(Number(btn.dataset.index),1); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'add-maintenance') { const inp=document.querySelector('[data-new="maintenance"]'); week().team3.maintenance.push({ts:new Date().toLocaleString(), text:inp?.value||''}); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'del-maintenance') { week().team3.maintenance.splice(Number(btn.dataset.index),1); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'add-person') { addPerson(btn.dataset.team); render(); window.scrollTo(0,y); return; }
    if (a === 'del-person') { week()[btn.dataset.team].personnel.splice(Number(btn.dataset.index),1); save(); render(); window.scrollTo(0,y); return; }
    if (a === 'chart-type') return;
    if (a === 'refresh') { render(); window.scrollTo(0,y); toast('Refreshed'); return; }
    if (a === 'expand-chart') { openChart(btn.dataset.chart, btn.dataset.title); return; }
    if (a === 'export-json') { exportJSON(); return; }
    if (a === 'trigger-import') { document.getElementById('importFile').click(); return; }
    if (a === 'export-word') { exportWord(); return; }
    if (a === 'print') { window.print(); return; }
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.matches('textarea')) resizeTextarea(el);
    if (el.dataset.bind) setPath(el.dataset.bind, el.value);
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.bind) { setPath(el.dataset.bind, el.value); render(); }
    if (el.dataset.action === 'jump-week') { state.week = weekStartISO(new Date(el.value+'T00:00:00')); if(!state.weeks[state.week]) state.weeks[state.week]=createWeek(); save(); render(); }
    if (el.dataset.action === 'chart-type') { setPath(el.dataset.path, el.value); render(); }
  });
  document.getElementById('importFile').addEventListener('change', (e)=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{ try{ state=migrate(JSON.parse(reader.result)); save(); render(); toast('Import complete'); } catch(err){ alert('Import failed: invalid JSON'); } };
    reader.readAsText(file); e.target.value='';
  });

  function addPerson(team){
    const inputs = [...document.querySelectorAll(`[data-new-person][data-team="${team}"]`)];
    const p = { name:'', role:'', id:'' };
    inputs.forEach(i=>p[i.dataset.newPerson]=i.value.trim());
    if(!p.name && !p.role && !p.id) return;
    week()[team].personnel.push(p); save();
  }
  function openChart(chart, title){
    const typeMap={t1Tasks:week().team1.chartTypes.tasksReceived,t1Jira:week().team1.chartTypes.jira,t2Stats:week().team2.chartTypes.stats,t2Modules:week().team2.chartTypes.modules,t2Systems:week().team2.chartTypes.systems,overviewJira:'bar',overviewTasks:'bar'};
    const modal=document.getElementById('modal');
    modal.innerHTML=`<div class="modalCard"><div class="modalHead"><strong>${escapeHtml(title||'Chart')}</strong><button class="iconBtn" data-close-modal title="Close">×</button></div><div class="modalBody"><div class="chartCanvas">${renderChart(chart,typeMap[chart]||'bar')}</div></div></div>`;
    modal.classList.add('open');
  }
  document.addEventListener('click', e=>{ if(e.target.matches('[data-close-modal]') || e.target.id==='modal') document.getElementById('modal').classList.remove('open'); });

  function exportJSON(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
    download(blob, `soc-dashboard-${state.week}.json`);
  }
  function exportWord(){
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Weekly Report</title></head><body>${document.querySelector('.main')?.innerHTML || ''}</body></html>`;
    download(new Blob([html],{type:'application/msword'}), `soc-dashboard-${state.week}.doc`);
  }
  function download(blob, name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
  function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1600); }
  function autoResizeTextareas(){ document.querySelectorAll('textarea').forEach(resizeTextarea); }
  function resizeTextarea(el){ el.style.height='auto'; el.style.height=Math.max(34, el.scrollHeight)+'px'; }

  render();
})();
