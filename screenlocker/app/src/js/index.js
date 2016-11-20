'use strict';
const {
    ipcRenderer
} = require('electron');
const {
    app,
    Menu,
    Tray,
    fs
} = require('electron').remote; //Using remotely main components
const path = require('path');
const sysDialog = require('electron').remote.dialog;
const fileSystem = require('fs');
const webcam = require('node-webcam');
const configuration = require('../configuration');
const webview = document.getElementById('login_form');
var os = require('os');

navigator.getBattery().then(function(bat){
    console.log(bat)
});

$(document).ready(function() {

    webview.addEventListener('console-message', (e) => {
        console.log('Login wv logged:', e.message)
    })

    $('body').click(function() {
        console.log('clicked');
        var opts = {

            width: 1280,

            height: 720,

            delay: 0,

            quality: 100,

            output: "jpeg",

            verbose: true

        };

        var Webcam = webcam.create(opts);


        //Will automatically append location output type

        //Webcam.capture(app.getAppPath()+"/test_picture");
        Webcam.getLastShot(function(img) {
            console.log(app.getAppPath());
            console.log(img);
        });
    });
});
