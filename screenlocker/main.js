'use strict';
//Electron components
const {
    app,
    BrowserWindow,
    ipcMain,
    Tray,
    Menu,
    globalShortcut
} = require('electron');

const autoLaunch = require('auto-launch');

//Variables
let win;
var configuration = require('./configuration');
var icon = __dirname + '/app/assets/lock_icon.png';
var platform = process.platform;

//===========================================
//      ipc section channel handling
//===========================================
ipcMain.on('unlock', (event, arg) => {
    setTimeout(function() {
        win.close();
    }, 1000);
});

//======================================
//         Auto launch
//======================================

var screenLockerAL = new autoLaunch({
    name: 'Screen Locker',
    path: '/Applications/scrennlocker.app',
});

//screenLockerAL.enable();

screenLockerAL.disable();


screenLockerAL.isEnabled()
    .then(function(isEnabled) {
        if (isEnabled) {
            return;
        }
        screenLockerAL.enable();
    })
    .catch(function(err) {
        // handle error
    });
//=======================================
//     Functions declaration
//=======================================

/**
 * [createWindow description]
 * @param  int posX Splash previous position
 * @param  int posY splash previous position
 * @return
 */
function createWindow() {
    win = new BrowserWindow({
        //frame: false, //To-Do: make the window frame less
        width: 900, //Main window size 680
        height: 900, //main windox size 730
        //fullscreenable: true,
        //fullscreen: true,
        //resizable: false
    });

    // and load the index.html of the app.
    win.loadURL(`file://${__dirname}/app/index.html`)
    win.setIcon(icon);
    win.once('ready-to-show', () => {
        win.show();
    });
    // Open the DevTools.
    //TODO: take this away in production
    win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });
}

/**
 * Creates the settings window
 * @param  {[int]} posX [start position for the window]
 * @param  {[int]} posY [description]
 * @return {[type]}      [description]
 */
function createSettingsWindow() {
    // Create the browser window.
    settingsWindow = new BrowserWindow({
        width: 500, //Main window size 680
        height: 725, //main windox size 730
        resizable: false,
    })

    settingsWindow.loadURL(`file://${__dirname}/app/src/html/settings.html`)
    settingsWindow.setIcon(icon);
    settingsWindow.once('ready-to-show', () => {
        settingsWindow.show();
    });
    //To-Do: take this away in production
    settingsWindow.on('closed', () => {
        settingsWindow = null
    })
}

//======================================
//            App behaviour
//======================================

//ensure the app only allows a single instance
var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
        if (win.isMinimized()) win.restore();
    } else {
        createWindow();
    }
    win.focus();
});

if (shouldQuit) {
    app.quit();
    return;
}

//Adds an icon in the notification region
app.on('ready', () => {
    //Loads the settings
    globalShortcut.register('CommandOrControl+Alt+L', () => {
        createWindow();
    });

    createWindow();
});

app.on('window-all-closed', () => {
    // On linux, quit on all visible windows closed
    //if (process.platform === 'linux') {
    app.quit()
        //}
})

app.on('activate', () => {
    createWindow();
});
