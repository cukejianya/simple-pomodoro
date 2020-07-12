const { menubar } = require('menubar');
const path = require('path');

const mb = menubar({
  index: path.join('file://', __dirname, 'dist/index.html'),
  browserWindow: {
    width: 250,
    height: 350,
    titleBarStyle: 'hidden',
    resizable: false,
    maximizable: false,
  },
});
