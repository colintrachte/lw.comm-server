'use strict';

const fs   = require('fs');
const path = require('path');

// Settings are persisted as a single JSON file alongside the server.
// The UI can store anything it wants in this blob — the server treats
// it as opaque data and never validates the contents.
const SETTINGS_PATH = path.join(__dirname, 'lw.settings.json');

function load() {
    try {
        if (fs.existsSync(SETTINGS_PATH)) {
            const raw = fs.readFileSync(SETTINGS_PATH, 'utf8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.error('Settings: failed to load:', err.message);
    }
    return {};  // return empty object if file missing or corrupt
}

function save(data) {
    try {
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Settings: failed to save:', err.message);
        return false;
    }
}

module.exports = { load, save, SETTINGS_PATH };