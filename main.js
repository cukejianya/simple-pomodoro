const { app, BrowserWindow, Menu, Tray } = require('electron');

function createWindow() {
  let win = new BrowserWindow({
    width: 250,
    height: 350,
    titleBarStyle: 'hidden',
    resizable: false,
    maximizable: false,
  });

  win.loadFile('index.html');
}

app.on('ready', createWindow)
