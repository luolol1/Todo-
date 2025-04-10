const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  // 获取屏幕尺寸
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // 创建浏览器窗口 - 更小、更轻量，放置在更明显的位置
  mainWindow = new BrowserWindow({
    width: 350,
    height: 600,
    x: Math.floor(width / 2) - 175, // 窗口居中
    y: Math.floor(height / 2) - 300, // 窗口居中
    frame: false, // 无边框窗口
    transparent: true, // 透明背景
    alwaysOnTop: false, // 关闭窗口置顶，让应用像桌面摆件一样
    resizable: true, // 可调整大小
    skipTaskbar: false, // 在任务栏显示，方便找到
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
  });

  // 加载应用
  const startUrl = isDev 
    ? 'http://localhost:3001' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  // 禁用菜单栏
  mainWindow.setMenu(null);
  
  // 取消窗口总是在顶层的设置
  mainWindow.setAlwaysOnTop(false);

  // 仅在开发模式下打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // 注册窗口事件
  ipcMain.on('minimize-app', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('close-app', () => {
    app.quit();
  });
  
  // 添加一个控制置顶状态的事件，方便用户在菜单中切换
  ipcMain.on('toggle-always-on-top', () => {
    const isAlwaysOnTop = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isAlwaysOnTop);
  });
}

// 当 Electron 完成初始化时创建窗口
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 