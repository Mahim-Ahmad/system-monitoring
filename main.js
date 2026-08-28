const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const si = require('systeminformation');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 480,
    height: 720,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---- System info gathering ----
// Every 1.5 second e system er data collect kore renderer process e pathano hocche
async function getSystemStats() {
  try {
    const [cpuLoad, mem, fsSize, cpuTemp, osInfo] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.cpuTemperature(),
      si.osInfo()
    ]);

    const totalDisk = fsSize.reduce((acc, d) => acc + d.size, 0);
    const usedDisk = fsSize.reduce((acc, d) => acc + d.used, 0);

    return {
      cpu: {
        load: cpuLoad.currentLoad, // percentage
        temp: cpuTemp.main || null
      },
      memory: {
        total: mem.total,
        used: mem.active,
        percent: (mem.active / mem.total) * 100
      },
      disk: {
        total: totalDisk,
        used: usedDisk,
        percent: totalDisk > 0 ? (usedDisk / totalDisk) * 100 : 0
      },
      os: `${osInfo.distro} ${osInfo.release}`
    };
  } catch (err) {
    return { error: err.message };
  }
}

ipcMain.handle('get-stats', async () => {
  return await getSystemStats();
});