function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function formatDuration(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}min ${s}s`;
    return `${m}min ${s}s`;
}

function calcPace(distanceKm, totalSeconds) {
    if (distanceKm <= 0) return null;
    const paceSeconds = totalSeconds / distanceKm;
    const min = Math.floor(paceSeconds / 60);
    const sec = Math.round(paceSeconds % 60);
    return { min, sec, display: `${min}:${sec.toString().padStart(2, '0')} min/km` };
}
