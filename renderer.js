// ---- Elements ----
const cpuPercent = document.getElementById('cpuPercent');
const cpuBar = document.getElementById('cpuBar');
const cpuTemp = document.getElementById('cpuTemp');

const memPercent = document.getElementById('memPercent');
const memBar = document.getElementById('memBar');
const memText = document.getElementById('memText');

const diskPercent = document.getElementById('diskPercent');
const diskBar = document.getElementById('diskBar');
const diskText = document.getElementById('diskText');

const osInfoEl = document.getElementById('osInfo');

function bytesToGB(bytes) {
  return (bytes / (1024 ** 3)).toFixed(1);
}

// ---- Chart.js setup for live CPU graph ----
const ctx = document.getElementById('cpuChart').getContext('2d');
const maxPoints = 20;
const cpuChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: Array(maxPoints).fill(''),
    datasets: [{
      label: 'CPU %',
      data: Array(maxPoints).fill(0),
      borderColor: '#ff9f0a',
      backgroundColor: 'rgba(255,159,10,0.15)',
      fill: true,
      tension: 0.3,
      pointRadius: 0
    }]
  },
  options: {
    animation: false,
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#9a9ab0' }, grid: { color: '#2b2b3d' } },
      x: { display: false }
    },
    plugins: { legend: { display: false } }
  }
});

function updateChart(value) {
  cpuChart.data.datasets[0].data.push(value);
  cpuChart.data.datasets[0].data.shift();
  cpuChart.update();
}

// ---- Main update loop ----
async function refreshStats() {
  const stats = await window.api.getStats();
  if (stats.error) {
    osInfoEl.textContent = 'Error: ' + stats.error;
    return;
  }

  // CPU
  const cpuLoad = stats.cpu.load.toFixed(1);
  cpuPercent.textContent = cpuLoad + '%';
  cpuBar.style.width = cpuLoad + '%';
  cpuTemp.textContent = stats.cpu.temp ? `Temp: ${stats.cpu.temp}°C` : 'Temp: N/A (VM/unsupported)';
  updateChart(parseFloat(cpuLoad));

  // Memory
  const memPct = stats.memory.percent.toFixed(1);
  memPercent.textContent = memPct + '%';
  memBar.style.width = memPct + '%';
  memText.textContent = `${bytesToGB(stats.memory.used)} GB / ${bytesToGB(stats.memory.total)} GB`;

  // Disk
  const diskPct = stats.disk.percent.toFixed(1);
  diskPercent.textContent = diskPct + '%';
  diskBar.style.width = diskPct + '%';
  diskText.textContent = `${bytesToGB(stats.disk.used)} GB / ${bytesToGB(stats.disk.total)} GB`;

  osInfoEl.textContent = stats.os;
}

// প্রতি ১.৫ সেকেন্ডে data refresh হবে
refreshStats();
setInterval(refreshStats, 1500);