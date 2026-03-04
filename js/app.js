// Populate minute and second selects
(function populateSelects() {
    const minSelect = document.getElementById('run-minutes');
    const secSelect = document.getElementById('run-seconds');
    for (let i = 0; i <= 59; i++) {
        const minOpt = document.createElement('option');
        minOpt.value = i;
        minOpt.textContent = `${i} min`;
        if (i === 0) minOpt.selected = true;
        minSelect.appendChild(minOpt);

        const secOpt = document.createElement('option');
        secOpt.value = i;
        secOpt.textContent = `${i} s`;
        if (i === 0) secOpt.selected = true;
        secSelect.appendChild(secOpt);
    }
})();

// Distance preset dropdown
const distPreset = document.getElementById('run-distance-preset');
const distCustom = document.getElementById('run-distance');

distPreset.addEventListener('change', () => {
    if (distPreset.value === 'custom') {
        distCustom.style.display = 'block';
        distCustom.required = true;
        distCustom.focus();
    } else if (distPreset.value) {
        distCustom.style.display = 'none';
        distCustom.required = false;
        distCustom.value = distPreset.value;
    } else {
        distCustom.style.display = 'none';
        distCustom.value = '';
    }
    updatePacePreview();
});

// Navigation
document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.page).classList.add('active');

        if (btn.dataset.page === 'page-history') renderHistory();
        if (btn.dataset.page === 'page-stats') renderStats();
    });
});

// Set default date
document.getElementById('run-date').valueAsDate = new Date();

// Live pace calculation
['run-distance-preset', 'run-distance', 'run-hours', 'run-minutes', 'run-seconds'].forEach(id => {
    document.getElementById(id).addEventListener('change', updatePacePreview);
    document.getElementById(id).addEventListener('input', updatePacePreview);
});

function getDistance() {
    if (distPreset.value === 'custom') {
        return parseFloat(distCustom.value) || 0;
    }
    return parseFloat(distPreset.value) || 0;
}

function updatePacePreview() {
    const dist = getDistance();
    const h = parseInt(document.getElementById('run-hours').value) || 0;
    const m = parseInt(document.getElementById('run-minutes').value) || 0;
    const s = parseInt(document.getElementById('run-seconds').value) || 0;
    const total = h * 3600 + m * 60 + s;
    const paceEl = document.getElementById('pace-display');

    if (dist > 0 && total > 0) {
        const pace = calcPace(dist, total);
        paceEl.textContent = `Vauhti: ${pace.display}`;
        paceEl.style.display = 'block';
    } else {
        paceEl.style.display = 'none';
    }
}

// Form submit
document.getElementById('run-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const date = document.getElementById('run-date').value;
    const distance = getDistance();
    const hours = parseInt(document.getElementById('run-hours').value) || 0;
    const minutes = parseInt(document.getElementById('run-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('run-seconds').value) || 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (distance <= 0) {
        showToast('Valitse matka');
        return;
    }
    if (totalSeconds <= 0) {
        showToast('Aseta kesto');
        return;
    }

    const run = {
        id: Date.now(),
        date,
        distance,
        totalSeconds
    };

    const runs = getRuns();
    runs.push(run);
    saveRuns(runs);

    showToast('Juoksu tallennettu!');

    // Reset form
    distPreset.value = '';
    distCustom.value = '';
    distCustom.style.display = 'none';
    document.getElementById('run-hours').value = '0';
    document.getElementById('run-minutes').value = '0';
    document.getElementById('run-seconds').value = '0';
    document.getElementById('run-date').valueAsDate = new Date();
    document.getElementById('pace-display').style.display = 'none';
});

// History
function renderHistory() {
    const runs = getRuns().sort((a, b) => b.date.localeCompare(a.date));
    const list = document.getElementById('run-list');

    if (runs.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="13 2 13 9 20 9"/></svg>
                <p>Ei vielä juoksuja.<br>Lisää ensimmäinen!</p>
            </div>`;
        return;
    }

    list.innerHTML = runs.map(run => {
        const pace = calcPace(run.distance, run.totalSeconds);
        const dateStr = new Date(run.date).toLocaleDateString('fi-FI', {
            weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric'
        });
        return `
            <div class="run-item">
                <div class="run-info">
                    <h3>${run.distance.toFixed(2)} km — ${formatDuration(run.totalSeconds)}</h3>
                    <p>${dateStr} · ${pace ? pace.display : ''}</p>
                </div>
                <button class="run-delete" onclick="deleteRun(${run.id})" title="Poista">&#x2715;</button>
            </div>`;
    }).join('');
}

function deleteRun(id) {
    if (!confirm('Poistetaanko juoksu?')) return;
    const runs = getRuns().filter(r => r.id !== id);
    saveRuns(runs);
    renderHistory();
    showToast('Juoksu poistettu');
}

// Stats
function renderStats() {
    const runs = getRuns();

    const totalKm = runs.reduce((s, r) => s + r.distance, 0);
    const totalTime = runs.reduce((s, r) => s + r.totalSeconds, 0);
    const avgPace = runs.length > 0 ? calcPace(totalKm, totalTime) : null;

    const now = new Date();
    const thisMonth = runs.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthKm = thisMonth.reduce((s, r) => s + r.distance, 0);

    document.getElementById('stats-summary').innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalKm.toFixed(1)}</div>
            <div class="stat-label">km yhteensä</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${runs.length}</div>
            <div class="stat-label">juoksua</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${monthKm.toFixed(1)}</div>
            <div class="stat-label">km tässä kuussa</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${avgPace ? avgPace.display.replace(' min/km', '') : '-'}</div>
            <div class="stat-label">keskim. min/km</div>
        </div>
    `;

    const activePeriod = document.querySelector('.period-btn.active')?.dataset.period || 'week';
    renderCharts(runs, activePeriod);
}

document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderStats();
    });
});

// Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}
