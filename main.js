const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let backendProcess;

// Resolve backend path — works both in dev and when packaged
function getBackendPath() {
  if (app.isPackaged) {
    // In packaged app, resources are in process.resourcesPath
    return path.join(process.resourcesPath, 'backend', 'index.js');
  }
  return path.join(__dirname, 'backend', 'index.js');
}

function startBackend() {
  const backendPath = getBackendPath();
  console.log('[ADIS] Starting engine at:', backendPath);

  // Use node_modules from __dirname when in dev, from resourcesPath when packaged
  const execPath = process.execPath; // Electron's node binary
  
  backendProcess = fork(backendPath, [], {
    env: { ...process.env, PORT: '5000' },
    stdio: 'inherit',
    execPath: process.platform === 'win32' ? undefined : execPath
  });

  backendProcess.on('error', (err) => {
    console.error('[ADIS] Backend process error:', err);
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0) console.error('[ADIS] Backend exited with code:', code);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'frontend', 'public', 'favicon.png'),
    title: 'ADIS — Adversarial Digital Identity Simulator',
    autoHideMenuBar: true,
    backgroundColor: '#020204',
    show: false, // Don't flash before ready
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Show gracefully once ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in browser, not in electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  // Small delay to allow the Express server to bind its port
  setTimeout(createWindow, 1200);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
  }
});
