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
var os = require('os');
var attempts = 5;
var cooldownTimer;

const happy = '-webkit-radial-gradient(circle, rgb(222, 227, 0), rgb(222, 166, 0), rgb(232, 121, 6), rgb(150, 72, 0))';
/*
const webcam = require('node-webcam');
const configuration = require('../configuration');
*/


$(document).ready(function() {
    var btnUnlock = $('#btn-unlock');
    var password = $('#password');
    var username = $('#user');
    var uptime = $('#uptime');
    var batteryIcon = $('#battery-icon');
    var batteryLevel = $('#battery-level');
    var avatarContainer = $('.avatar');
    var avatarImage = $('#avatar-img');
    var form = $('form');
    var avatarSwitchTimer;

    password.focus();

    //initializes the icon indicators
    username.html(os.userInfo().username);
    setBatteryLevel(); //Set the battery icon ad level
    setInterval(function() {
        var ut = formatTime();
        uptime.html(ut);
    });

    setInterval(function() {
        clock();
    }, 1000);


    btnUnlock.click(function() {
        form.submit();
    });

    //Prevent the form to reset the page and emits an event to the main process
    form.submit(function(e) {
        e.preventDefault();
        clearTimeout(avatarSwitchTimer);
        var pwd = password.val();
        if (pwd === 'eddy') {
            ipcRenderer.send('unlock');
            attempts = 5;
        } else {
            attempts--;
            watchAttempts(attempts);

            password.effect('pulsate');
        }

        ipcRenderer.send('form-submitted', attempts); //Emit the event that will trigger the camera
    });

    password.keypress(function(e) {
        if (isCapsLockOn(e)){
            password.css({
                'background-image': "url('../../assets/icons/orange-warning-icon20x20.png')",
                'padding-left': '35px'
            });
        } else {
            password.css({
                'background-image': "url('')",
                'padding-left': '10px'
            });
        }
    });

    function setAvatar(attempt) {

    }

    function setBatteryLevel() {

        navigator.getBattery().then(function(bm) {
            var level = bm.level * 100;

            if (bm.charging) {
                batteryLevel.html('<i class="fa fa-bolt" aria-hidden="true"></i> ' + level + ' %')
            } else {
                batteryLevel.html(level + ' %')
            }

            if (level > 95) {
                batteryIcon.html('<i class="fa fa-battery-full" aria-hidden="true"></i>');
            } else if (level < 95 && level > 60) {
                batteryIcon.html('<i class="fa fa-battery-three-quarters" aria-hidden="true"></i>');
            } else if (level < 60 && level > 40) {
                batteryIcon.html('<i class="fa fa-battery-half" aria-hidden="true"></i>');
            } else if (level < 40 && level > 15) {
                batteryIcon.html('<i class="fa fa-battery-quarter" aria-hidden="true"></i>');
            } else {
                batteryIcon.html('<i class="fa fa-battery-empty" aria-hidden="true"></i>');
            }
        });

        setTimeout(function() {
            setBatteryLevel();
        }, 2000);
    }

    /**
     * checks if the caplock key is on
     * @param  {[type]}  e [description]
     * @return {Boolean}   [description]
     */
    function isCapsLockOn(e) {
        var keyCode = e.keyCode ? e.keyCode : e.which;
        var shiftKey = e.shiftKey ? e.shiftKey : ((keyCode == 16) ? true : false);
        return (((keyCode >= 65 && keyCode <= 90) && !shiftKey) || ((keyCode >= 97 && keyCode <= 122) && shiftKey))
    }


    /**
     * Watches the nimber of missed attempts and reacts accordingly
     * @return {[type]} [description]
     */
    function watchAttempts(a) {
        var aCount = $('.attempts > span:first-of-type');
        var label = $('.attempts > span:last-child');
        var hint = $('.attempts > p');
        var fadeAway = true;
        var cooldown = 10;
        aCount.html(a);

        if (a < 3 && a > 1) {
            hint.css({
                'visibility': 'visible'
            }).hide().fadeIn(750);
        } else if (a == 1) {
            label.html('attempt left.');
        } else if (a <= 0) {
            fadeAway = false;
            aCount.html('<i class="fa fa-exclamation-circle" aria-hidden="true"></i>');
            label.html('Warning! You have entered the wrong passeword one too many times.<br/> A picture of you and a copy of the passeword have been sent to the owner.');
            password.val('');
            password.prop('disabled', true);
            btnUnlock.off('click');

            ipcRenderer.send('all-attempts-used');
        }

        if (fadeAway) {
            aCount.stop().fadeIn(100).fadeOut(1000);
            label.stop().fadeIn(100).fadeOut(1000);
        } else {
            aCount.stop().fadeIn(100);
            label.stop().fadeIn(100);
        }
    }


    /**
     * [formatTime description]
     * @return {[type]} [description]
     */
    function formatTime() {
        var weeks;
        var days;
        var hours;
        var minutes;
        var seconds;
        var remain;

        weeks = Math.floor(os.uptime() / 604800);
        remain = os.uptime() % 604800;
        days = Math.floor(remain / 86400);
        remain = remain % 86400;
        hours = Math.floor(remain / 3600);
        remain = remain % 3600;
        minutes = Math.floor(remain / 60);
        seconds = Math.round(remain % 60);

        if (minutes == 60) minutes = 0;
        if (seconds == 60) seconds = 0;
        if (hours == 24) hours = 0;
        if (days == 7) days = 0;

        return weeks + ' week(s), ' + days + ' day(s) ' + addPrecedingZero(hours) + ':' + addPrecedingZero(minutes) + ':' + addPrecedingZero(seconds);
    }

    /**
     * Adds the preceding 0 if it misses
     * @param {[int/string]} datePart [description]
     */
    function addPrecedingZero(datePart) {
        return (Number(datePart) < 10) ? '0' + datePart : datePart;
    }

    /**
     * [clock description]
     * @return {[type]} [description]
     */
    function clock() {
        var time = new Date();
        var clockBox = $('#time');
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];

        var hours = time.getHours() + '';
        if (hours.length < 2) hours = '0' + hours;

        var minutes = time.getMinutes() + '';
        if (minutes.length < 2) minutes = '0' + minutes;

        var seconds = time.getSeconds() + '';
        if (seconds.length < 2) seconds = '0' + seconds;

        var year = time.getFullYear() + '';
        var month = time.getMonth();
        var date = time.getDate() + '';

        clockBox.text(hours + ":" + minutes);
        //dateBox.text(year + '-' + months[month] + '-' + date);
    }

    //Extension behavior
    $('*').click(function() {
        password.focus();
    })
});
