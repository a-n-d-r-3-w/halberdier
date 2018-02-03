const electron = require('electron')
const {ipcMain} = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const fs = require('fs');
const crypto = require('crypto');

const {dialog} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function encrypt(string) {
  const cipher = crypto.createCipher('aes192', 'a password');
  let encrypted = cipher.update(string, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(string, masterPassword) {
  try {
    const decipher = crypto.createDecipher('aes192', masterPassword);
    let decrypted = decipher.update(string, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return '{ "error": true }';
  }
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  ipcMain.on('get-passwords', (event, masterPassword) => {
    console.log(`masterPassword: ${masterPassword}`);
    const fromFile = fs.readFileSync(path.join(__dirname, "passwords.json"), 'utf8');
    // const decrypted = decrypt(fromFile);
    const decrypted = decrypt(fromFile, masterPassword);
    event.sender.send('passwords', JSON.parse(decrypted))
  });

  ipcMain.on('save-changes', (event, state) => {
    const string = JSON.stringify(state);
    const encrypted = encrypt(string);
    fs.writeFileSync(path.join(__dirname, "passwords.json"), encrypted);
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
