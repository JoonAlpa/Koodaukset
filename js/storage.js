function getRuns() {
    return JSON.parse(localStorage.getItem('runs') || '[]');
}

function saveRuns(runs) {
    localStorage.setItem('runs', JSON.stringify(runs));
}
