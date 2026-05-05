function writeApiDetail(message) {
  const detailEl = document.getElementById('api-detail');
  const ts = new Date().toISOString();
  detailEl.textContent = `[#${ts}] ${message}\n` + detailEl.textContent;
}

async function fetchSummary() {
  const url = '/api/summary';
  writeApiDetail(`GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    writeApiDetail(`ERROR ${res.status} ${res.statusText}`);
    throw new Error('Failed to fetch summary');
  }
  const payload = await res.json();
  writeApiDetail(`OK summary ${Object.keys(payload).join(', ')}`);
  return payload;
}

async function fetchTop(limit = 10) {
  const url = `/api/top?n=${limit}`;
  writeApiDetail(`GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    writeApiDetail(`ERROR ${res.status} ${res.statusText}`);
    throw new Error('Failed to fetch top performers');
  }
  const payload = await res.json();
  writeApiDetail(`OK top rows ${payload.length}`);
  return payload;
}

async function fetchEmployees(limit = 100) {
  const url = `/api/employees?limit=${limit}`;
  writeApiDetail(`GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    writeApiDetail(`ERROR ${res.status} ${res.statusText}`);
    throw new Error('Failed to fetch employee records');
  }
  const payload = await res.json();
  writeApiDetail(`OK employees rows ${payload.length}`);
  return payload;
}

async function fetchBeforeEvaluation(limit = 50) {
  const url = `/api/before?limit=${limit}`;
  writeApiDetail(`GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    writeApiDetail(`ERROR ${res.status} ${res.statusText}`);
    throw new Error('Failed to fetch before evaluation data');
  }
  const payload = await res.json();
  writeApiDetail(`OK before evaluation rows ${payload.length}`);
  return payload;
}

async function fetchAfterEvaluation(limit = 50) {
  const url = `/api/after?limit=${limit}`;
  writeApiDetail(`GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    writeApiDetail(`ERROR ${res.status} ${res.statusText}`);
    throw new Error('Failed to fetch after evaluation data');
  }
  const payload = await res.json();
  writeApiDetail(`OK after evaluation rows ${payload.length}`);
  return payload;
}

function setActiveView(view) {
  const panels = {
    summary: document.getElementById('summary'),
    before: document.getElementById('before'),
    after: document.getElementById('after'),
    top: document.getElementById('table'),
    employees: document.getElementById('employees'),
  };
  const buttons = {
    summary: document.getElementById('btn-summary'),
    before: document.getElementById('btn-before'),
    after: document.getElementById('btn-after'),
    top: document.getElementById('btn-top'),
    employees: document.getElementById('btn-employees'),
  };

  Object.values(panels).forEach(panel => panel.classList.add('hidden'));
  Object.values(buttons).forEach(btn => btn.classList.remove('active'));

  panels[view].classList.remove('hidden');
  buttons[view].classList.add('active');

  const title = document.getElementById('content-title');
  const titles = {
    summary: 'Overview',
    before: 'Before Evaluation',
    after: 'After Evaluation',
    top: 'Top Performers',
    employees: 'Employee List'
  };
  title.textContent = titles[view] || 'Overview';

  const controls = document.querySelector('.controls');
  if (view === 'top') {
    controls.style.display = 'flex';
  } else {
    controls.style.display = 'none';
  }
}

function renderSummary(stats) {
  const container = document.getElementById('stats');
  container.innerHTML = '';

  if (!stats || !stats.total_rows) {
    container.innerText = 'No summary data available';
    return;
  }

  const snippets = [
    { label: 'Total Records', value: stats.total_rows },
  ];

  Object.entries(stats).forEach(([key, value]) => {
    if (key === 'total_rows') return;
    if (value.mean !== undefined) {
      snippets.push({ label: `${key.replace(/_/g, ' ')} (avg)`, value: value.mean.toFixed(2) });
      snippets.push({ label: `${key.replace(/_/g, ' ')} (max)`, value: value.max.toFixed(2) });
    }
  });

  snippets.forEach(item => {
    const stat = document.createElement('div');
    stat.className = 'stat';
    stat.innerHTML = `<strong>${item.value}</strong><span>${item.label}</span>`;
    container.appendChild(stat);
  });
}

function renderTable(rows, tableId) {
  const thead = document.querySelector(`#${tableId} thead`);
  const tbody = document.querySelector(`#${tableId} tbody`);
  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (!rows || !rows.length) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 1;
    emptyCell.textContent = 'No rows available';
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
    return;
  }

  const headers = Object.keys(rows[0]);
  const headRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header.replace(/_/g, ' ');
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);

  rows.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header] ?? '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function wireListeners() {
  document.getElementById('btn-summary').addEventListener('click', () => setActiveView('summary'));
  document.getElementById('btn-before').addEventListener('click', () => setActiveView('before'));
  document.getElementById('btn-after').addEventListener('click', () => setActiveView('after'));
  document.getElementById('btn-top').addEventListener('click', () => setActiveView('top'));
  document.getElementById('btn-employees').addEventListener('click', () => setActiveView('employees'));
  document.getElementById('btn-refresh').addEventListener('click', async () => {
    await loadData();
    const activeBtn = document.querySelector('.menu button.active');
    const view = activeBtn ? activeBtn.id.replace('btn-', '') : 'summary';
    setActiveView(view);
  });

  // Hamburger menu toggle
  const hamburger = document.getElementById('hamburger');
  const sidePanel = document.getElementById('side-panel');
  hamburger.addEventListener('click', () => {
    sidePanel.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 980 && !sidePanel.contains(e.target) && !hamburger.contains(e.target)) {
      sidePanel.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });
}

async function loadData() {
  try {
    const [stats, beforeData, afterData, topData, employees] = await Promise.all([
      fetchSummary(),
      fetchBeforeEvaluation(200),
      fetchAfterEvaluation(200),
      fetchTop(Number(document.getElementById('input-top-n').value)),
      fetchEmployees(100)
    ]);
    renderSummary(stats);
    renderTable(beforeData, 'before-table');
    renderTable(afterData, 'after-table');
    renderTable(topData, 'data-table');
    renderTable(employees, 'all-table');
  } catch (err) {
    console.error(err);
    const content = document.querySelector('.content');
    content.innerText = 'Could not load data. Check server connection.';
  }
}

async function init() {
  wireListeners();
  setActiveView('summary');
  await loadData();
}

init();
