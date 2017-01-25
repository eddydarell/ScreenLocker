'use strict';

const {
    ipcRenderer
} = require('electron');

const {
    app,
    Menu,
    Tray,
    fs
} = require('electron').remote;

const cryptoJS = require('crypto-js');

var settingsOpened = false;
var configuration = require('./../../../configuration.js');

//=======================
//    Ipc channel
//=======================
ipcRenderer.on('settings-window-loaded', (event, arg) => {
    //configuration = arg;
});

//=======================
//        Jquery
//=======================
$(document).ready(function() {
    //Top password field
    var btnUnlockSave = $('#btn-unlock');
    var confirmForm = $('form[class="form-inline"]');

    //Other Variables
    var confirmPwdHasBeenFocused = false; //Checks if the field has gotten the focus FIRST THEN has lost it
    //containers
    var settingsBanner = $('.settings-banner');
    var settingsBody = $('.settings-body');

    //Elements
    var versionSpan = $('span#app-version');
    var tabs = $('div.tab-content');
    var applicationForm = $('div#application>form');
    var appearanceForm = $('div#appearance>form');
    var securityForm = $('div#security>form');

    //Inputs
    var inputsidePaneUrl = $('input[id="side-pane-url"]');
    var inputAutoStart = $('input[id="autostart"]');
    var inputEnableChameleon = $('input[id="enable-chameleon"]');
    var inputChameleonColors = $('input[id^="chameleon-theme-color"]');
    var inputUniqueColor = $('input[id="unique-color"]');

    //New settings variable
    var newSettings = {
        autostart: true,
        sidePaneUrl: '',
        enableChameleon: true,
        chameleonColors: [],
        uniqueColor: '',
        newPassword: '',
        newPasswordHint: '',
    };

    //First, assigns the saved values to the actual fields
    configuration.readSettings('auto-start') ? inputAutoStart.attr('checked', 'checked') : inputAutoStart.removeAttr('checked');
    inputsidePaneUrl.val(configuration.readSettings('side-pane-url'));
    console.log(inputEnableChameleon)
    inputUniqueColor.attr('value', configuration.readSettings('unique-color'));
    configuration.readSettings('enable-chameleon') ? inputEnableChameleon.attr('checked', 'checked') : inputEnableChameleon.removeAttr('checked');
    inputChameleonColors.each((index, color) => {
        $(color).attr('value', configuration.readSettings('chameleon-colors')[index]);
    });

    //Confirming changes to setting and save
    confirmForm.submit((e) => {
        e.preventDefault();
        var oldPwdField = $('input[id="password"]');
        if (oldPwdField.val() !== 'eddy') {
            oldPwdField.clearQueue().effect('pulsate');
            return;
        } else {
            ipcRenderer.send('settings-changed', newSettings);
            console.log('Send new settings: ');
            console.log(newSettings);
            settingsBody.fadeOut(500);
            setTimeout(_ => {
                settingsBanner.animate({
                    height: '100%'
                }, {
                    duration: 1500,
                    queue: true
                });

                confirmForm.fadeOut(500);

                $('div.settings-banner>div:first-child').animate({
                    'margin-top': '190px'
                }, {
                    duration: 1500,
                    queue: false
                });

                var confirmMessage = '<h1 style="margin-top: 10px;margin-left: 17px;"><i class="fa fa-check-circle" aria-hidden="true" style="margin-right: 20px;"></i>Saved!</h1>';
                setTimeout( _ => {
                    $(confirmMessage).hide().appendTo(settingsBanner).fadeIn(501);
                }, 500);
            }, 300);
        }
    });

    btnUnlockSave.click((e) => {
        if (!settingsOpened) {
            //settingsBanner.addClass('animation-open-settings');
            settingsBanner.animate({
                height: '180px'
            }, {
                duration: 1500,
                queue: false
            });


            $('div.settings-banner>div:first-child').animate({
                'margin-top': '10px'
            }, {
                duration: 1500,
                queue: false
            });
            setTimeout(_ => {
                settingsBody.fadeIn(500);
                $(e.target).html('');
                setTimeout(_ => {
                    $(e.target).html('<i class="fa fa-floppy-o" aria-hidden="true"></i>');
                    $('input[id="password"]').attr('placeholder', 'Save Settings');
                    $('input[id="password"]+div').css({
                        "background": "rgb(89, 156, 53)",
                        "color": "#fff"
                    });
                }, 1);
            }, 1200);
            settingsOpened = true;
        } else {
            confirmForm.submit();
        }
    });

    //Toggle Chameleon settings
    if ($('#enable-chameleon').is(':checked')) {
        $('#chameleon-color-selector-container').show();
        $('#unique-color-selector-container').hide();
    } else {
        $('#chameleon-color-selector-container').hide();
        $('#unique-color-selector-container').show();
    }

    $('#enable-chameleon').on('change', _ => {
        if ($('#enable-chameleon').is(':checked')) {
            $('#chameleon-color-selector-container').show();
            $('#unique-color-selector-container').hide();
        } else {
            $('#chameleon-color-selector-container').hide();
            $('#unique-color-selector-container').show();
        }
    });

    securityForm.submit((e) => {
        e.preventDefault();
        var feedback = '';
        var regex = /^(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        var newPwd = $('input[id="new-password"]').val().trim();
        var confirmNewPwd = $('input[id="confirm-new-password"]').val().trim();

        if (!regex.test(newPwd)) {
            feedback += '<h5><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Alert</h5>';
            feedback += '<small>Password <b>MUST</b> contains at least one digit (0 - 9), one capital letter (A - Z) and be at least 8 characters long.</small>';

            $('div[id="security"]>form+div').removeClass().addClass('alert alert-danger');
            $('div[id="security"]>form+div').html(feedback);
        } else if (newPwd !== confirmNewPwd) {
            feedback += '<h5><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Passwords Mismatch</h5>';
            feedback += '<small>Passwords don\'t match.</small>';

            $('div[id="security"]>form+div').removeClass().addClass('alert alert-danger');
            $('div[id="security"]>form+div').html(feedback);
        } else {
            newSettings.newPassword = newPwd;
            newSettings.passwordChanged = true;
            newSettings.newPasswordHint = $('input[id="new-pwd-hint"]').val().trim();
            feedback = '<h5><i class="fa fa-check-circle" aria-hidden="true"></i> Saved</h5>';
            feedback += 'Password changed!<br/> For this to take effect, you need to type in your old password above and click the " <b title="Save And Change"><i class="fa fa-floppy-o" aria-hidden="true"></i></b> " button.';
            $('div[id="security"]>form+div').removeClass().addClass('alert alert-success');
            $('div[id="security"]>form+div').html(feedback);
        }
    });

    //Appearance form submission
    appearanceForm.submit((e) => {
        e.preventDefault();
        if ($('input[id="enable-chameleon"]').is(':checked')) {
            var chameleonColors = [];
            var colorsInputs = $('input[id^="chameleon-theme-color"]');
            colorsInputs.each((index, colorInput) => {
                chameleonColors.push($(colorInput).val());
            });
            newSettings.chameleonColors = chameleonColors;
        } else {
            newSettings.enableChameleon = false;
            newSettings.uniqueColor = $('input[id="unique-theme-color"]').val();
        }
    });

    //Application form submission
    applicationForm.submit((e) => {
        e.preventDefault();
        var info;
        var sidePaneUrl = $('#side-pane-url').val();
        var autostart = true;
        if (sidePaneUrl.trim() === '' || sidePaneUrl === undefined) {
            info = '<div class="alert alert-warning">'
            info += '<p><i class="fa fa-exclamation-circle" aria-hidden="true"></i> No URL has been specified. Google.com will be used as default.</p>';
            info += '</div>';
        }
        if (!$('#autostart').is(':checked')) autostart = false;

        //Send the configuration settings to the main process
        newSettings.autostart = autostart;
        newSettings.sidePaneUrl = sidePaneUrl;
        //configuration,saveSettings();
        console.log(autostart);
        //Print the feedback
        if (info !== undefined) {
            $('div#application').append(info);
        }
    });


    //Tab switching
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        var target = $(e.target).attr("href") // activated tab
    });

    versionSpan.html(app.getVersion());

    //=========================
    //     Functions
    //=========================
    $('p').attr('uselectable', 'on').css('user-select', 'none').on('selectstart', false);
    $('span').attr('uselectable', 'on').css('user-select', 'none').on('selectstart', false);
    $('img').attr('uselectable', 'on').css('user-select', 'none').on('selectstart', false);
    $('div').attr('uselectable', 'on').css('user-select', 'none').on('selectstart', false);
});
