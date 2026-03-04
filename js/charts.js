let distanceChart = null;
let paceChart = null;

function renderCharts(runs, period) {
    const sortedRuns = [...runs].sort((a, b) => a.date.localeCompare(b.date));

    let labels, distData, paceData;

    if (period === 'week') {
        const weeks = {};
        sortedRuns.forEach(run => {
            const d = new Date(run.date);
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay() + 1);
            const key = weekStart.toISOString().slice(0, 10);
            if (!weeks[key]) weeks[key] = { km: 0, seconds: 0 };
            weeks[key].km += run.distance;
            weeks[key].seconds += run.totalSeconds;
        });

        const allWeeks = Object.keys(weeks).sort().slice(-8);
        labels = allWeeks.map(w => {
            const d = new Date(w);
            return `${d.getDate()}.${d.getMonth() + 1}.`;
        });
        distData = allWeeks.map(w => parseFloat(weeks[w].km.toFixed(1)));
        paceData = allWeeks.map(w => {
            const pace = weeks[w].km > 0 ? (weeks[w].seconds / 60) / weeks[w].km : 0;
            return parseFloat(pace.toFixed(2));
        });
    } else {
        const months = {};
        sortedRuns.forEach(run => {
            const key = run.date.slice(0, 7);
            if (!months[key]) months[key] = { km: 0, seconds: 0 };
            months[key].km += run.distance;
            months[key].seconds += run.totalSeconds;
        });

        const monthNames = ['tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kesä', 'heinä', 'elo', 'syys', 'loka', 'marras', 'joulu'];
        const allMonths = Object.keys(months).sort().slice(-6);
        labels = allMonths.map(m => monthNames[parseInt(m.split('-')[1]) - 1]);
        distData = allMonths.map(m => parseFloat(months[m].km.toFixed(1)));
        paceData = allMonths.map(m => {
            const pace = months[m].km > 0 ? (months[m].seconds / 60) / months[m].km : 0;
            return parseFloat(pace.toFixed(2));
        });
    }

    if (distanceChart) distanceChart.destroy();
    distanceChart = new Chart(document.getElementById('distance-chart'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: distData,
                backgroundColor: '#2563eb',
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'km' } }
            }
        }
    });

    if (paceChart) paceChart.destroy();
    paceChart = new Chart(document.getElementById('pace-chart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data: paceData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#2563eb',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    reverse: true,
                    title: { display: true, text: 'min/km' }
                }
            }
        }
    });
}
