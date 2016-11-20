'use strict';

var nconf = require('nconf').file({file: getUserHome() + '/screenlocker-config.json'});

/**
 * Save the settings for the app to function
 * @param  {[string]} settingKey   [the name of the settingKey]
 * @param  {[string/int]} settingValue [the value of the setting]
 * @return
 */
function saveSettings(settingKey, settingValue) {
    nconf.set(settingKey, settingValue);
    nconf.save();
}

/**
 * Returns the savec configuration
 * @param  {[string]} settingKey [the setting name]
 * @return {[type]}            [description]
 */
function readSettings(settingKey) {
    nconf.load();
    return nconf.get(settingKey);
}

/**
 * Returns the users root directory
 * @return {[type]} [description]
 */
function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = {
    saveSettings: saveSettings,
    readSettings: readSettings
};
