// ─── TOAST SYSTEM ─────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { info: '💡', success: '✅', error: '❌', warning: '⚠️' };
  toast.innerHTML = `<span>${icons[type] || '💡'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── CONFIG ──────────────────────────────────────────────
function getDefaultConfig() {
  return {
    username: 'user', password: '1234',
    totalAllowance: 150000, savings: 10000,
    periodNum: 28, periodUnit: 'days', periodDays: 28,
    budgets: { food: 70000, data: 24500, personal: 8000, school: 10000, repairs: 5000, other: 5000 },
    theme: 'light', navPosition: 'bottom', cardStyle: 'soft', animationStyle: 'smooth'
  };
}
function loadConfig() { const raw = localStorage.getItem('kb_config'); return raw ? JSON.parse(raw) : getDefaultConfig(); }
function saveConfig(cfg) { localStorage.setItem('kb_config', JSON.stringify(cfg)); }

let config = loadConfig();
let isLoggedIn = sessionStorage.getItem('kb_logged_in') === 'true';

// ─── APPLY SETTINGS ──────────────────────────────────────
function applySettings() {
  document.body.classList.toggle('dark-theme', config.theme === 'dark');
  document.getElementById('meta-theme').content = config.theme === 'dark' ? '#10141C' : '#faf7ec';
  document.body.classList.toggle('nav-bottom', config.navPosition === 'bottom');
  document.body.classList.toggle('card-soft', config.cardStyle === 'soft');
  document.body.classList.toggle('anim-playful', config.animationStyle === 'playful');
}

// ─── AUTH ─────────────────────────────────────────────────
function showRegister() { document.getElementById('login-form').style.display = 'none'; document.getElementById('register-form').style.display = 'block'; }
function showLogin() { document.getElementById('login-form').style.display = 'block'; document.getElementById('register-form').style.display = 'none'; }

function handleLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value.trim();
  const msg = document.getElementById('login-msg');
  if (!u || !p) { msg.textContent = 'Please fill in all fields.'; return; }
  if (u !== config.username || p !== config.password) { msg.textContent = 'Wrong username or password.'; return; }
  msg.textContent = '';
  sessionStorage.setItem('kb_logged_in', 'true'); isLoggedIn = true; fadeOutLogin();
}

function handleRegister() {
  const u = document.getElementById('reg-user').value.trim();
  const p = document.getElementById('reg-pass').value.trim();
  const p2 = document.getElementById('reg-pass2').value.trim();
  if (!u || !p || !p2) { showToast('Fill all auth fields.', 'error'); return; }
  if (p !== p2) { showToast('Passwords do not match.', 'error'); return; }
  const total = parseFloat(document.getElementById('reg-total').value) || 150000;
  const savings = parseFloat(document.getElementById('reg-savings').value) || 10000;
  const periodNum = parseFloat(document.getElementById('reg-period-num').value) || 28;
  const periodUnit = document.getElementById('reg-period-unit').value;
  const periodDays = periodToDays(periodNum, periodUnit);
  const budgets = {
    food: parseFloat(document.getElementById('reg-food').value) || 70000,
    data: parseFloat(document.getElementById('reg-data').value) || 24500,
    personal: parseFloat(document.getElementById('reg-personal').value) || 8000,
    school: parseFloat(document.getElementById('reg-school').value) || 10000,
    repairs: parseFloat(document.getElementById('reg-repairs').value) || 5000,
    other: parseFloat(document.getElementById('reg-other').value) || 5000
  };
  const newConfig = { username: u, password: p, totalAllowance: total, savings, periodNum, periodUnit, periodDays, budgets, theme: 'light', navPosition: 'bottom', cardStyle: 'soft', animationStyle: 'smooth' };
  saveConfig(newConfig); config = newConfig; sessionStorage.setItem('kb_logged_in', 'true'); isLoggedIn = true; fadeOutLogin();
}

function fadeOutLogin() {
  const loginPage = document.getElementById('page-login');
  loginPage.classList.add('fade-out');
  setTimeout(() => {
    loginPage.classList.remove('active', 'fade-out');
    loginPage.style.display = 'none'; // fully remove from layout, not just hidden via opacity
    document.getElementById('main-nav').style.display = 'flex';
    applySettings(); initApp(); showToast('Welcome back, ' + config.username + '!', 'success');
  }, 400);
}

function handleLogout() {
  sessionStorage.removeItem('kb_logged_in'); isLoggedIn = false;
  document.getElementById('main-nav').style.display = 'none';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const loginPage = document.getElementById('page-login');
  loginPage.style.display = 'flex'; // restore layout for the login screen
  loginPage.classList.add('active'); loginPage.classList.remove('fade-out');
}

// ─── DYNAMIC CONSTANTS ───────────────────────────────────
const TOTAL = () => config.totalAllowance;
const SAVINGS = () => config.savings;
const BUDGETS = () => ({
  food: { label:'Food', emoji:'🍛', color:'#C97D4F', monthly:config.budgets.food },
  data: { label:'Data & Water', emoji:'📶', color:'#4E86A2', monthly:config.budgets.data },
  personal: { label:'Personal', emoji:'🧴', color:'#8B6BA8', monthly:config.budgets.personal },
  school: { label:'School', emoji:'📚', color:'#5E9484', monthly:config.budgets.school },
  repairs: { label:'Repairs', emoji:'🔧', color:'#C9A227', monthly:config.budgets.repairs },
  other: { label:'Other', emoji:'📦', color:'#8C8672', monthly:config.budgets.other },
});
const DAILY_FOOD_BUDGET = () => config.budgets.food / (config.periodDays || 28);
function periodToDays(num, unit) {
  const n = parseFloat(num) || 28;
  return unit === 'months' ? Math.round(n * 30) : Math.max(1, Math.round(n));
}
function periodLabel() {
  if (config.periodUnit === 'months') return `${config.periodNum} month${config.periodNum == 1 ? '' : 's'}`;
  const d = config.periodDays;
  if (d % 7 === 0) return `${d / 7} week${d / 7 == 1 ? '' : 's'}`;
  return `${d} day${d == 1 ? '' : 's'}`;
}
function setPeriodPreset(prefix, num, unit) {
  document.getElementById(prefix + '-period-num').value = num;
  document.getElementById(prefix + '-period-unit').value = unit;
}

// ─── STATE ────────────────────────────────────────────────
let entries = JSON.parse(localStorage.getItem('kb2_entries') || '[]');
let selectedCat = 'food';
const startDate = localStorage.getItem('kb2_start') || new Date().toISOString().slice(0,10);
if (!localStorage.getItem('kb2_start')) localStorage.setItem('kb2_start', startDate);

// ─── UTILS ────────────────────────────────────────────────
const fmt = n => '₦' + Math.round(n).toLocaleString();
const today = () => new Date().toISOString().slice(0,10);
const catColor = c => BUDGETS()[c]?.color || '#8C8672';
function totalBycat() {
  const t = {}; Object.keys(BUDGETS()).forEach(k => t[k] = 0);
  entries.forEach(e => { if (t[e.cat] !== undefined) t[e.cat] += e.amt; else t['other'] += e.amt; });
  return t;
}
function todayEntries() { return entries.filter(e => e.date === today()); }
function last7Days() {
  const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().slice(0,10)); } return days;
}

// ─── NAV ──────────────────────────────────────────────────
function goTo(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active'); btn.classList.add('active');
  if (page === 'charts') renderCharts(); if (page === 'overview') renderOverview();
  if (page === 'tracker') renderTracker(); if (page === 'plan') renderPlan();
  if (page === 'menu') renderMenu(); if (page === 'goals') renderGoals(); if (page === 'reminders') renderReminders();
}

// ─── CAT SELECT ───────────────────────────────────────────
function selectCat(cat) {
  selectedCat = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.className = 'cat-btn');
  const btn = document.getElementById('cat-' + cat);
  if (btn) btn.classList.add('active-' + cat);
}

// ─── ADD / DELETE ENTRIES ────────────────────────────────
function addEntry() {
  const name = document.getElementById('spend-name').value.trim();
  const amt = parseFloat(document.getElementById('spend-amt').value);
  if (!name || !amt || amt <= 0) { showToast('Enter valid name and amount.', 'error'); return; }
  entries.push({ id: Date.now(), name, amt, cat: selectedCat, date: today() });
  localStorage.setItem('kb2_entries', JSON.stringify(entries));
  document.getElementById('spend-name').value = ''; document.getElementById('spend-amt').value = '';
  renderTracker(); renderOverview(); showToast(`Added "${name}" for ${fmt(amt)}`, 'success');
}
function quickAddFromMenu(name, amt) {
  selectedCat = 'food';
  entries.push({ id: Date.now(), name, amt, cat: 'food', date: today() });
  localStorage.setItem('kb2_entries', JSON.stringify(entries));
  renderTracker(); renderOverview(); renderMenu(); showToast(`Added "${name}" from menu`, 'success');
}
function quickAddChip(name, amt, cat) {
  entries.push({ id: Date.now(), name, amt, cat, date: today() });
  localStorage.setItem('kb2_entries', JSON.stringify(entries));
  renderTracker(); renderOverview(); showToast(`Added "${name}" for ${fmt(amt)}`, 'success');
}
function deleteEntry(id) {
  entries = entries.filter(e => e.id !== id);
  localStorage.setItem('kb2_entries', JSON.stringify(entries)); renderTracker(); renderOverview();
}

// ─── QUICK-ADD: RECENT / FREQUENT ─────────────────────────
function renderQuickAdd() {
  const el = document.getElementById('quickadd-row');
  if (!el) return;
  if (entries.length === 0) { el.innerHTML = '<span class="chip-empty">Your frequent expenses will show up here after you log a few.</span>'; return; }
  const freq = {};
  entries.forEach(e => {
    const key = e.name.trim().toLowerCase();
    if (!freq[key]) freq[key] = { name: e.name, amt: e.amt, cat: e.cat, count: 0, last: e.id };
    freq[key].count += 1; if (e.id > freq[key].last) { freq[key].last = e.id; freq[key].amt = e.amt; freq[key].cat = e.cat; }
  });
  const top = Object.values(freq).sort((a,b) => b.count - a.count || b.last - a.last).slice(0, 6);
  el.innerHTML = top.map(item =>
    `<button class="chip" onclick="quickAddChip('${item.name.replace(/'/g,"\\'")}', ${item.amt}, '${item.cat}')">${BUDGETS()[item.cat]?.emoji || '📦'} ${item.name} <span class="chip-amt">${fmt(item.amt)}</span></button>`
  ).join('');
}

// ─── STREAK TRACKER ─────────────────────────────────────────
function computeStreak() {
  const dailyBudget = DAILY_FOOD_BUDGET();
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0,10);
    if (ds < startDate) break;
    const spentThatDay = entries.filter(e => e.date === ds && e.cat === 'food').reduce((s,e) => s+e.amt, 0);
    if (i === 0 && spentThatDay === 0) continue; // today not logged yet doesn't break streak
    if (spentThatDay <= dailyBudget) streak++; else break;
  }
  return streak;
}
function renderStreak() {
  const el = document.getElementById('streak-card');
  if (!el) return;
  const streak = computeStreak();
  document.getElementById('streak-num').textContent = streak;
  document.getElementById('streak-label').textContent = streak === 1 ? 'day staying within your food budget' : 'days staying within your food budget';
  document.getElementById('streak-emoji').textContent = streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '🌱';
}

// ─── SMART TIP BANNER ────────────────────────────────────
function renderTipBanner() {
  const el = document.getElementById('tip-banner');
  if (!el) return;
  const totals = totalBycat();
  const daysElapsed = Math.max(1, Math.round((new Date() - new Date(startDate)) / 86400000) + 1);
  const timeFrac = Math.min(daysElapsed / (config.periodDays || 28), 1);
  const budgets = BUDGETS();
  let worst = null;
  Object.entries(budgets).forEach(([k,v]) => {
    if (v.monthly <= 0) return;
    const spendFrac = totals[k] / v.monthly;
    const overBy = spendFrac - timeFrac;
    if (!worst || overBy > worst.overBy) worst = { key:k, label:v.label, emoji:v.emoji, spendFrac, overBy };
  });
  if (!worst || worst.overBy < 0.12) {
    el.className = 'tip-banner';
    el.innerHTML = `<span class="tip-icon">✅</span><span class="tip-text">You're pacing well — <b>${daysElapsed} days</b> into your ${periodLabel()} budget and no category is running ahead of schedule.</span>`;
    return;
  }
  const level = worst.overBy > 0.3 ? 'danger' : 'warn';
  const icon = level === 'danger' ? '🚨' : '⚠️';
  el.className = 'tip-banner ' + level;
  el.innerHTML = `<span class="tip-icon">${icon}</span><span class="tip-text"><b>${worst.emoji} ${worst.label}</b> is at ${Math.round(worst.spendFrac*100)}% spent, but you're only ${Math.round(timeFrac*100)}% through your ${periodLabel()} budget. Ease off this category for a few days to get back on track.</span>`;
}

// ─── RENDER: OVERVIEW ─────────────────────────────────────
function renderOverview() {
  document.getElementById('start-date').textContent = new Date(startDate).toLocaleDateString('en-NG', {day:'numeric',month:'short'});
  document.getElementById('home-total').textContent = fmt(TOTAL());
  document.getElementById('hero-period').textContent = periodLabel();
  const totals = totalBycat(); const totalSpent = Object.values(totals).reduce((a,b)=>a+b,0); const balance = TOTAL() - totalSpent;
  document.getElementById('balance-left').textContent = fmt(balance);
  document.getElementById('days-left-count').textContent = Math.max(0, Math.round(balance / DAILY_FOOD_BUDGET())) + ' days';
  document.getElementById('alloc-grid').innerHTML = Object.entries(BUDGETS()).map(([k,v]) => {
    const spent = totals[k]; const pct = Math.min((spent / v.monthly) * 100, 100);
    return `<div class="alloc-card" style="--cat-color:${v.color}"><div class="a-label"><div class="a-dot" style="background:${v.color}"></div>${v.emoji} ${v.label}</div><div class="a-budget" style="color:${v.color}">${fmt(v.monthly)}</div><div class="a-spent">${fmt(spent)} spent</div><div class="mini-bar"><div class="mini-fill" style="width:${pct}%;background:${v.color}"></div></div></div>`;
  }).join('');
  const er = document.getElementById('estimate-rows');
  const totalBudgeted = Object.values(BUDGETS()).reduce((s,v)=>s+v.monthly,0) + SAVINGS(); const surplus = TOTAL() - totalBudgeted;
  er.innerHTML = Object.entries(BUDGETS()).map(([k,v]) => `<div class="est-row"><span class="e-cat"><span class="e-dot" style="background:${v.color}"></span>${v.emoji} ${v.label}</span><span class="e-val">${fmt(v.monthly)}</span></div>`).join('') +
    `<div class="est-row"><span class="e-cat"><span class="e-dot" style="background:#5E9484"></span>💾 Savings</span><span class="e-val">${fmt(SAVINGS())}</span></div><div class="est-row grand"><span class="e-cat">📊 Total estimate</span><span class="e-val">${fmt(totalBudgeted)}</span></div><div class="est-row surplus"><span class="e-cat">✅ Buffer / flex</span><span class="e-val">${fmt(surplus)}</span></div>`;
  renderStreak(); renderTipBanner();
}

// ─── RENDER: TRACKER ──────────────────────────────────────
function renderTracker() {
  const te = todayEntries(); const foodToday = te.filter(e => e.cat === 'food').reduce((s,e) => s+e.amt, 0);
  const otherToday = te.filter(e => e.cat !== 'food').reduce((s,e) => s+e.amt, 0);
  const dailyBudget = DAILY_FOOD_BUDGET(); const pct = Math.min((foodToday / dailyBudget) * 100, 100);
  document.getElementById('daily-food-budget-label').textContent = fmt(dailyBudget);
  const fill = document.getElementById('food-prog');
  fill.style.width = pct + '%'; fill.style.background = pct >= 100 ? 'var(--danger)' : pct >= 75 ? 'var(--warn)' : 'var(--food)';
  document.getElementById('food-today').textContent = fmt(foodToday); document.getElementById('other-today').textContent = fmt(otherToday);
  const list = document.getElementById('log-list'); const all = [...entries].reverse();
  if (all.length === 0) { list.innerHTML = '<div class="empty">No entries yet. Log your first expense above.</div>'; }
  else {
    list.innerHTML = all.map(e => `<div class="log-item" style="--cat-color:${catColor(e.cat)}"><div class="log-left"><div class="log-dot" style="background:${catColor(e.cat)}"></div><div><div class="log-name">${e.name}</div><div class="log-cat">${BUDGETS()[e.cat]?.emoji || '📦'} ${BUDGETS()[e.cat]?.label || 'Other'} · ${e.date}</div></div></div><div class="log-right"><span class="log-amt" style="color:${catColor(e.cat)}">-${fmt(e.amt)}</span><button class="log-del" onclick="deleteEntry(${e.id})">✕</button></div></div>`).join('');
  }
  renderQuickAdd();
}

// ─── RENDER: PLAN ─────────────────────────────────────────
function renderPlan() {
  const table = document.getElementById('plan-table');
  const totalBudgeted = Object.values(BUDGETS()).reduce((s,v)=>s+v.monthly,0) + SAVINGS();
  table.innerHTML = Object.entries(BUDGETS()).map(([k,v]) => `<div class="plan-row"><div class="p-cat"><span class="p-dot" style="background:${v.color}"></span>${v.emoji} ${v.label}</div><div class="p-nums"><div class="p-total">${fmt(v.monthly)}</div><div class="p-daily">${fmt(v.monthly/config.periodDays)}/day avg</div></div></div>`).join('') +
    `<div class="plan-row"><div class="p-cat"><span class="p-dot" style="background:#5E9484"></span>💾 Savings</div><div class="p-nums"><div class="p-total">${fmt(SAVINGS())}</div><div class="p-daily">set aside immediately</div></div></div><div class="plan-row highlight"><div class="p-cat">📊 Total allocated</div><div class="p-nums"><div class="p-total">${fmt(totalBudgeted)}</div></div></div>`;
}

// ─── RENDER: CHARTS ───────────────────────────────────────
let donutChart, lineChart, barChart;
function renderCharts() {
  const totals = totalBycat(); const totalSpent = Object.values(totals).reduce((a,b)=>a+b,0);
  const gridColor = config.theme === 'dark' ? '#2A3340' : '#E4DFCE';
  const tickColor = config.theme === 'dark' ? '#8791A0' : '#8A8570';
  const dCtx = document.getElementById('donut-chart').getContext('2d'); if (donutChart) donutChart.destroy();
  const cats = Object.keys(BUDGETS()); const vals = cats.map(k => totals[k]); const colors = cats.map(k => BUDGETS()[k].color);
  document.getElementById('donut-total').textContent = fmt(totalSpent);
  document.getElementById('donut-legend').innerHTML = cats.map(k => `<div class="legend-item"><div class="legend-dot" style="background:${BUDGETS()[k].color}"></div>${BUDGETS()[k].emoji} ${BUDGETS()[k].label}</div>`).join('');
  donutChart = new Chart(dCtx, { type:'doughnut', data:{ labels:cats.map(k=>BUDGETS()[k].label), datasets:[{ data: vals.length && vals.some(v=>v>0) ? vals : [1], backgroundColor: vals.some(v=>v>0) ? colors : ['#E4DFCE'], borderWidth:0, hoverOffset:4 }] }, options:{ cutout:'70%', plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>` ${fmt(ctx.raw)}`}} }, animation:{duration:500} } });
  const days = last7Days(); const foodLine = days.map(d => entries.filter(e=>e.date===d&&e.cat==='food').reduce((s,e)=>s+e.amt,0)); const otherLine = days.map(d => entries.filter(e=>e.date===d&&e.cat!=='food').reduce((s,e)=>s+e.amt,0));
  const lCtx = document.getElementById('line-chart').getContext('2d'); if (lineChart) lineChart.destroy();
  lineChart = new Chart(lCtx, { type:'line', data:{ labels: days.map(d=>{const dt=new Date(d); return dt.toLocaleDateString('en',{weekday:'short'});}), datasets:[{ label:'Food', data:foodLine, borderColor:'#C97D4F', backgroundColor:'#C97D4F20', tension:0.4, fill:true, pointRadius:4 },{ label:'Other', data:otherLine, borderColor:'#4E86A2', backgroundColor:'#4E86A220', tension:0.4, fill:true, pointRadius:4 }] }, options:{ plugins:{ legend:{ labels:{ color:tickColor, font:{family:'DM Sans', size:11}}}}, scales:{ x:{ ticks:{ color:tickColor, font:{size:10}}, grid:{ color:gridColor}}, y:{ ticks:{ color:tickColor, font:{size:10}, callback:v=>'₦'+v.toLocaleString()}, grid:{ color:gridColor}}}, animation:{duration:400}}});
  const bCtx = document.getElementById('bar-chart').getContext('2d'); if (barChart) barChart.destroy();
  barChart = new Chart(bCtx, { type:'bar', data:{ labels:cats.map(k=>BUDGETS()[k].label), datasets:[{ label:'Spent', data:cats.map(k=>totals[k]), backgroundColor:cats.map(k=>BUDGETS()[k].color+'cc') },{ label:'Budget', data:cats.map(k=>BUDGETS()[k].monthly), backgroundColor:gridColor }] }, options:{ plugins:{ legend:{ labels:{ color:tickColor, font:{family:'DM Sans', size:11}}}}, scales:{ x:{ ticks:{ color:tickColor, font:{size:9}}, grid:{ color:gridColor}}, y:{ ticks:{ color:tickColor, font:{size:10}, callback:v=>'₦'+v.toLocaleString()}, grid:{ color:gridColor}}}, animation:{duration:400}}});
  const avgDaily = entries.length > 0 ? (totalSpent / Math.max(1, new Set(entries.map(e=>e.date)).size)) : 0; const projected = avgDaily * (config.periodDays || 28);
  document.getElementById('stat-grid').innerHTML = [{ label:'Total spent', val:fmt(totalSpent), sub:'all categories', color:'var(--danger)' }, { label:'Remaining', val:fmt(TOTAL()-totalSpent), sub:'of '+fmt(TOTAL()), color:'var(--safe)' }, { label:'Daily avg', val:fmt(avgDaily), sub:'per active day', color:'var(--food)' }, { label:'Projected total', val:fmt(projected), sub:'at current rate', color: projected > TOTAL() ? 'var(--danger)' : 'var(--personal)' }].map(s => `<div class="stat-card"><div class="s-label">${s.label}</div><div class="s-val" style="color:${s.color}">${s.val}</div><div class="s-sub">${s.sub}</div></div>`).join('');
}

// ─── MENU DATA ────────────────────────────────────────────
const MENU_DATA = [
  { category: "🍚 Main Meals", items: [ { name:"Jollof Rice", price:1000 }, { name:"Fried Rice", price:1000 }, { name:"White Rice & Stew/Sauce/Banga", price:1000 }, { name:"Rice & Beans", price:1200 }, { name:"Beef Rice", price:1500 }, { name:"Chicken Rice", price:1500 }, { name:"Porridge Beans", price:1000 }, { name:"Yam & Egg Sauce", price:1500 }, { name:"Native Rice", price:1200 }, { name:"Suya Rice", price:1500 }, { name:"Dirty Rice", price:1500 }, { name:"Chinese Rice", price:1500 }, { name:"Coconut Rice", price:1500 }, { name:"Macaroni", price:1500 }, { name:"Plantain Rice", price:1500 }, { name:"Potato Frittata", price:1500 }, { name:"Spaghetti Bolognese", price:1000 }, { name:"Stir-fry Spaghetti", price:1500 }, { name:"Beef Pepper Soup", price:1000 }, { name:"Chicken Pepper Soup", price:1000 }, { name:"Jambalaya Rice", price:2000 }, { name:"Ukwa", price:2000 } ] },
  { category: "🍲 Soups & Swallows", items: [ { name:"Afang Soup & Semo", price:2000 }, { name:"Afang Soup & Fufu", price:2000 }, { name:"Afang Soup & Eba", price:2000 }, { name:"Bitterleaf Soup & Semo", price:1500 }, { name:"Bitterleaf Soup & Fufu", price:1500 }, { name:"Bitterleaf Soup & Eba", price:1500 }, { name:"Egusi Soup & Semo", price:1500 }, { name:"Egusi Soup & Fufu", price:1500 }, { name:"Egusi Soup & Eba", price:1500 }, { name:"Ogbono Soup & Semo", price:1500 }, { name:"Ogbono Soup & Fufu", price:1500 }, { name:"Ogbono Soup & Eba", price:1500 }, { name:"Oha Soup & Semo", price:1500 }, { name:"Oha Soup & Fufu", price:1500 }, { name:"Oha Soup & Eba", price:1500 }, { name:"Vegetable Soup & Semo", price:2000 }, { name:"Vegetable Soup & Fufu", price:2000 }, { name:"Vegetable Soup & Eba", price:2000 }, { name:"Okro Soup & Semo", price:1500 }, { name:"Okro Soup & Fufu", price:1500 }, { name:"Okro Soup & Eba", price:1500 } ] },
  { category: "🍽️ Other Foods", items: [ { name:"White Rice", price:1000 }, { name:"Jollof Rice", price:1000 }, { name:"Fried Rice", price:1000 }, { name:"Rice with Banga Stew", price:1000 }, { name:"Bean Porridge", price:1000 }, { name:"Porridge Yam", price:1200 }, { name:"Rice & Beans", price:1000 }, { name:"Beefy Rice", price:1500 }, { name:"Native Rice", price:1500 }, { name:"Chinese Rice", price:1500 }, { name:"Brown Rice", price:1200 }, { name:"Moi-Moi", price:500 }, { name:"Salad", price:500 } ] },
  { category: "🥤 Drinks", items: [ { name:"Coke", price:500 }, { name:"Fanta", price:500 }, { name:"Sprite", price:500 }, { name:"Mirinda", price:500 }, { name:"RC Apple", price:500 }, { name:"RC Cola", price:500 }, { name:"RC Orange", price:500 }, { name:"RC Lime", price:500 }, { name:"Team Soda", price:500 }, { name:"Lacasera", price:350 }, { name:"Smoov", price:350 }, { name:"Small 7UP", price:350 }, { name:"Capri-Sun", price:300 }, { name:"Nutri Choco", price:900 }, { name:"Ribena", price:1000 }, { name:"Fresh Yo", price:700 }, { name:"Nutri-Yo", price:800 }, { name:"Nutri-Milk", price:700 }, { name:"Fearless", price:600 }, { name:"Baked Yoghurt", price:900 }, { name:"Dudu Yoghurt", price:600 }, { name:"Predator", price:600 }, { name:"Chivita", price:900 }, { name:"Viju Apple Fruit Milk", price:800 }, { name:"Small Solive", price:700 }, { name:"Small Sosa", price:500 }, { name:"Big Sosa", price:1300 }, { name:"Berry Blast", price:1600 }, { name:"5-Alive", price:1600 } ] }
];

function renderMenu() {
  const search = document.getElementById('menu-search').value.toLowerCase().trim();
  const te = todayEntries(); const foodToday = te.filter(e => e.cat === 'food').reduce((s,e) => s+e.amt, 0);
  const dailyBudget = DAILY_FOOD_BUDGET(); const pct = Math.min((foodToday / dailyBudget) * 100, 100);
  document.getElementById('menu-food-used').textContent = fmt(foodToday); document.getElementById('menu-daily-budget').textContent = fmt(dailyBudget);
  const prog = document.getElementById('menu-food-prog'); prog.style.width = pct + '%'; prog.style.background = pct >= 100 ? 'var(--danger)' : pct >= 75 ? 'var(--warn)' : 'var(--food)';
  let html = ''; MENU_DATA.forEach(cat => {
    let filteredItems = cat.items; if (search) filteredItems = cat.items.filter(item => item.name.toLowerCase().includes(search));
    if (filteredItems.length === 0) return;
    html += `<div class="menu-category"><h4>${cat.category}</h4>`;
    filteredItems.forEach(item => { html += `<div class="menu-item"><span class="m-name">${item.name}</span><div><span class="m-price">${fmt(item.price)}</span><button class="m-add" onclick="quickAddFromMenu('${item.name.replace(/'/g, "\\'")}', ${item.price})">+ Add</button></div></div>`; });
    html += `</div>`;
  });
  document.getElementById('menu-list').innerHTML = html ? html : `<div class="menu-not-found">No items found matching "<strong>${search}</strong>"</div>`;
  updateComparison();
}
function updateComparison() {
  const idx = parseInt(document.getElementById('compare-cat').value); const cat = MENU_DATA[idx];
  if (!cat || cat.items.length === 0) { document.getElementById('cheapest-result').textContent = 'No items'; return; }
  let cheapest = cat.items[0]; cat.items.forEach(item => { if (item.price < cheapest.price) cheapest = item; });
  document.getElementById('cheapest-result').textContent = `${cheapest.name} — ${fmt(cheapest.price)}`;
}

// ─── GOALS ────────────────────────────────────────────────
let goals = JSON.parse(localStorage.getItem('kb_goals') || '[]');
function addGoal() {
  const name = document.getElementById('goal-name').value.trim(); const target = parseFloat(document.getElementById('goal-target').value); const saved = parseFloat(document.getElementById('goal-saved').value) || 0;
  if (!name || !target || target <= 0) { showToast('Fill in valid goal & target.', 'error'); return; }
  goals.push({ id: Date.now(), name, target, saved }); localStorage.setItem('kb_goals', JSON.stringify(goals));
  document.getElementById('goal-name').value = ''; document.getElementById('goal-target').value = ''; document.getElementById('goal-saved').value = '';
  renderGoals(); showToast(`Goal "${name}" added!`, 'success');
}
function deleteGoal(id) { goals = goals.filter(g => g.id !== id); localStorage.setItem('kb_goals', JSON.stringify(goals)); renderGoals(); }
function renderGoals() {
  const container = document.getElementById('goals-list');
  if (goals.length === 0) { container.innerHTML = '<div class="empty">No savings goals yet. Add your first goal above!</div>'; return; }
  container.innerHTML = goals.map(g => {
    const pct = Math.min((g.saved / g.target) * 100, 100); const remaining = g.target - g.saved;
    return `<div class="goal-card"><div class="goal-header"><span class="goal-name">${g.name}</span><span class="goal-numbers">${fmt(g.saved)} / ${fmt(g.target)}</span></div><div class="goal-prog"><div class="goal-fill" style="width:${pct}%"></div></div><div style="display:flex; justify-content:space-between; margin-top:6px; font-size:11px; color:var(--dim);"><span>${pct.toFixed(0)}% complete</span><span>${fmt(remaining)} left</span><button class="goal-del" onclick="deleteGoal(${g.id})">✕</button></div></div>`;
  }).join('');
}

// ─── REMINDERS ────────────────────────────────────────────
let reminders = JSON.parse(localStorage.getItem('kb_reminders') || '[]');
function addReminder() {
  const desc = document.getElementById('reminder-desc').value.trim(); const amt = parseFloat(document.getElementById('reminder-amt').value); const date = document.getElementById('reminder-date').value;
  if (!desc || !amt || !date) { showToast('Fill in description, amount, and date.', 'error'); return; }
  reminders.push({ id: Date.now(), desc, amt, date, paid: false }); localStorage.setItem('kb_reminders', JSON.stringify(reminders));
  document.getElementById('reminder-desc').value = ''; document.getElementById('reminder-amt').value = ''; document.getElementById('reminder-date').value = '';
  renderReminders(); checkReminderNotifications(); showToast(`Reminder "${desc}" added!`, 'success');
}
function deleteReminder(id) { reminders = reminders.filter(r => r.id !== id); localStorage.setItem('kb_reminders', JSON.stringify(reminders)); renderReminders(); }
function markPaid(id) { reminders = reminders.map(r => r.id === id ? { ...r, paid: true } : r); localStorage.setItem('kb_reminders', JSON.stringify(reminders)); renderReminders(); showToast('Marked as paid! 🎉', 'success'); }
function renderReminders() {
  const container = document.getElementById('reminders-list');
  if (reminders.length === 0) { container.innerHTML = '<div class="empty">No reminders. Add your first bill or fee above!</div>'; return; }
  container.innerHTML = reminders.map(r => {
    const due = new Date(r.date); const now = new Date(); now.setHours(0,0,0,0); const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    let statusClass = 'upcoming'; let statusText = `${diffDays} days left`;
    if (r.paid) { statusClass = 'paid'; statusText = '✅ Paid'; }
    else if (diffDays < 0) { statusClass = 'due'; statusText = '⚠️ OVERDUE!'; }
    else if (diffDays === 0) { statusClass = 'due'; statusText = '🔴 DUE TODAY!'; }
    return `<div class="reminder-card"><div class="r-left"><div class="r-desc">${r.desc}</div><div class="r-amt">${fmt(r.amt)}</div><div class="r-date">📅 ${new Date(r.date).toLocaleDateString('en-NG')}</div></div><div class="r-actions"><span class="r-status ${statusClass}">${statusText}</span>${!r.paid ? `<button class="r-pay" onclick="markPaid(${r.id})">Mark Paid</button>` : ''}<button class="r-del" onclick="deleteReminder(${r.id})">✕</button></div></div>`;
  }).join('');
}
function checkReminderNotifications() { if (!("Notification" in window)) return; if (Notification.permission === "granted") triggerDueNotifications(); else if (Notification.permission !== "denied") Notification.requestPermission().then(perm => { if (perm === "granted") triggerDueNotifications(); }); }
function triggerDueNotifications() {
  const now = new Date().toISOString().slice(0,10); const dueToday = reminders.filter(r => r.date === now && !r.paid);
  dueToday.forEach(r => { new Notification("🔔 SFC Reminder", { body: `⚠️ "${r.desc}" (${fmt(r.amt)}) is due TODAY!`, icon: "./icon-192.png" }); });
}

// ─── BACKUP / RESTORE ──────────────────────────────────────
function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: 'SFC - Student Financial Companion',
    config, entries, goals, reminders, startDate
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `sfc-backup-${today()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast('Backup downloaded!', 'success');
}
function triggerImport() { document.getElementById('import-file').click(); }
function importData(fileInput) {
  const file = fileInput.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.config || !Array.isArray(data.entries)) throw new Error('Invalid backup file.');
      localStorage.setItem('kb_config', JSON.stringify(data.config));
      localStorage.setItem('kb2_entries', JSON.stringify(data.entries || []));
      localStorage.setItem('kb_goals', JSON.stringify(data.goals || []));
      localStorage.setItem('kb_reminders', JSON.stringify(data.reminders || []));
      if (data.startDate) localStorage.setItem('kb2_start', data.startDate);
      showToast('Backup restored! Reloading...', 'success');
      setTimeout(() => location.reload(), 900);
    } catch (err) {
      showToast('Could not read that backup file.', 'error');
    }
  };
  reader.readAsText(file);
  fileInput.value = '';
}

// ─── SETTINGS SAVE ────────────────────────────────────────
function loadSettingsIntoForm() {
  document.getElementById('set-total').value = config.totalAllowance; document.getElementById('set-savings').value = config.savings;
  document.getElementById('set-period-num').value = config.periodNum; document.getElementById('set-period-unit').value = config.periodUnit;
  document.getElementById('set-food').value = config.budgets.food; document.getElementById('set-data').value = config.budgets.data;
  document.getElementById('set-personal').value = config.budgets.personal; document.getElementById('set-school').value = config.budgets.school;
  document.getElementById('set-repairs').value = config.budgets.repairs; document.getElementById('set-other').value = config.budgets.other;
  document.getElementById('set-theme').value = config.theme; document.getElementById('set-nav').value = config.navPosition;
  document.getElementById('set-card').value = config.cardStyle; document.getElementById('set-anim').value = config.animationStyle;
}
function saveSettings() {
  config.totalAllowance = parseFloat(document.getElementById('set-total').value) || 150000;
  config.savings = parseFloat(document.getElementById('set-savings').value) || 10000;
  config.periodNum = parseFloat(document.getElementById('set-period-num').value) || 28;
  config.periodUnit = document.getElementById('set-period-unit').value;
  config.periodDays = periodToDays(config.periodNum, config.periodUnit);
  config.budgets.food = parseFloat(document.getElementById('set-food').value) || 70000;
  config.budgets.data = parseFloat(document.getElementById('set-data').value) || 24500;
  config.budgets.personal = parseFloat(document.getElementById('set-personal').value) || 8000;
  config.budgets.school = parseFloat(document.getElementById('set-school').value) || 10000;
  config.budgets.repairs = parseFloat(document.getElementById('set-repairs').value) || 5000;
  config.budgets.other = parseFloat(document.getElementById('set-other').value) || 5000;
  config.theme = document.getElementById('set-theme').value; config.navPosition = document.getElementById('set-nav').value;
  config.cardStyle = document.getElementById('set-card').value; config.animationStyle = document.getElementById('set-anim').value;
  saveConfig(config); applySettings(); renderOverview(); renderTracker(); renderPlan(); renderMenu(); renderGoals(); renderReminders();
  if (document.getElementById('page-charts').classList.contains('active')) renderCharts();
  showToast('Settings & preferences saved!', 'success');
}

// ─── INIT ──────────────────────────────────────────────────
function initApp() {
  loadSettingsIntoForm(); applySettings(); renderOverview(); renderTracker(); renderPlan(); renderMenu(); renderGoals(); renderReminders(); selectCat('food');
  if (document.getElementById('page-charts').classList.contains('active')) renderCharts(); checkReminderNotifications();
}
if (isLoggedIn) {
  const loginPage = document.getElementById('page-login');
  loginPage.classList.remove('active'); loginPage.style.display = 'none';
  document.getElementById('main-nav').style.display = 'flex'; applySettings(); initApp();
} else { document.getElementById('page-login').classList.add('active'); applySettings(); }
