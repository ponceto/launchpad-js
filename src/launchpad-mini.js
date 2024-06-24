/*
 * launchpad-mini.js - Copyright (c) 2023-2024 - Olivier Poncet
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// ---------------------------------------------------------------------------
// MIDI constants
// ---------------------------------------------------------------------------

const CHANNEL_01_NOTE_OFF          = 0x80;
const CHANNEL_02_NOTE_OFF          = 0x81;
const CHANNEL_03_NOTE_OFF          = 0x82;
const CHANNEL_04_NOTE_OFF          = 0x83;
const CHANNEL_05_NOTE_OFF          = 0x84;
const CHANNEL_06_NOTE_OFF          = 0x85;
const CHANNEL_07_NOTE_OFF          = 0x86;
const CHANNEL_08_NOTE_OFF          = 0x87;
const CHANNEL_09_NOTE_OFF          = 0x88;
const CHANNEL_10_NOTE_OFF          = 0x89;
const CHANNEL_11_NOTE_OFF          = 0x8a;
const CHANNEL_12_NOTE_OFF          = 0x8b;
const CHANNEL_13_NOTE_OFF          = 0x8c;
const CHANNEL_14_NOTE_OFF          = 0x8d;
const CHANNEL_15_NOTE_OFF          = 0x8e;
const CHANNEL_16_NOTE_OFF          = 0x8f;

const CHANNEL_01_NOTE_ON           = 0x90;
const CHANNEL_02_NOTE_ON           = 0x91;
const CHANNEL_03_NOTE_ON           = 0x92;
const CHANNEL_04_NOTE_ON           = 0x93;
const CHANNEL_05_NOTE_ON           = 0x94;
const CHANNEL_06_NOTE_ON           = 0x95;
const CHANNEL_07_NOTE_ON           = 0x96;
const CHANNEL_08_NOTE_ON           = 0x97;
const CHANNEL_09_NOTE_ON           = 0x98;
const CHANNEL_10_NOTE_ON           = 0x99;
const CHANNEL_11_NOTE_ON           = 0x9a;
const CHANNEL_12_NOTE_ON           = 0x9b;
const CHANNEL_13_NOTE_ON           = 0x9c;
const CHANNEL_14_NOTE_ON           = 0x9d;
const CHANNEL_15_NOTE_ON           = 0x9e;
const CHANNEL_16_NOTE_ON           = 0x9f;

const CHANNEL_01_CONTROL_CHANGE    = 0xb0;
const CHANNEL_02_CONTROL_CHANGE    = 0xb1;
const CHANNEL_03_CONTROL_CHANGE    = 0xb2;
const CHANNEL_04_CONTROL_CHANGE    = 0xb3;
const CHANNEL_05_CONTROL_CHANGE    = 0xb4;
const CHANNEL_06_CONTROL_CHANGE    = 0xb5;
const CHANNEL_07_CONTROL_CHANGE    = 0xb6;
const CHANNEL_08_CONTROL_CHANGE    = 0xb7;
const CHANNEL_09_CONTROL_CHANGE    = 0xb8;
const CHANNEL_10_CONTROL_CHANGE    = 0xb9;
const CHANNEL_11_CONTROL_CHANGE    = 0xba;
const CHANNEL_12_CONTROL_CHANGE    = 0xbb;
const CHANNEL_13_CONTROL_CHANGE    = 0xbc;
const CHANNEL_14_CONTROL_CHANGE    = 0xbd;
const CHANNEL_15_CONTROL_CHANGE    = 0xbe;
const CHANNEL_16_CONTROL_CHANGE    = 0xbf;

const CONTROLLER_BANK_SELECT       = 0x00;
const CONTROLLER_MODULATION_WHEEL  = 0x01;
const CONTROLLER_BREATH_CONTROLLER = 0x02;
const CONTROLLER_FOOT_CONTROLLER   = 0x04;
const CONTROLLER_PORTAMENTO_TIME   = 0x05;
const CONTROLLER_DATA_ENTRY_SLIDER = 0x06;
const CONTROLLER_MAIN_VOLUME       = 0x07;
const CONTROLLER_BALANCE           = 0x08;
const CONTROLLER_PAN               = 0x0a;
const CONTROLLER_EXPRESSION        = 0x0b;
const CONTROLLER_EFFECT1           = 0x0c;
const CONTROLLER_EFFECT2           = 0x0d;

const COMMAND_RESET_BOARD          = 0x00;
const COMMAND_GRID_LAYOUT          = 0x01;
const COMMAND_DRUM_LAYOUT          = 0x02;

// ---------------------------------------------------------------------------
// LaunchpadMini
// ---------------------------------------------------------------------------

class LaunchpadMini {
    constructor(controller) {
        this.controller = controller;
        this.name       = 'Launchpad Mini';
        this.input      = null;
        this.output     = null;
    }

    start() {
        navigator.requestMIDIAccess().then(
            (midi) => {
                this.controller.print('MIDI status: success');
                midi.inputs.forEach((input) => {
                    if(input.name.startsWith(this.name)) {
                        this.controller.print('MIDI-In found: ' + input.name);
                        this.input = input;
                    }
                });
                midi.outputs.forEach((output) => {
                    if(output.name.startsWith(this.name)) {
                        this.controller.print('MIDI-Out found: ' + output.name);
                        this.output = output;
                    }
                });
                if(this.input != null) {
                    this.input.onmidimessage = (message) => {
                        const data = message.data;
                        switch(data[0] >> 4) {
                            case 0x8:
                                this.controller.onNoteOff(data);
                                break;
                            case 0x9:
                                this.controller.onNoteOn(data);
                                break;
                            case 0xa:
                                this.controller.onAftertouch(data);
                                break;
                            case 0xb:
                                this.controller.onControlChange(data);
                                break;
                            case 0xc:
                                this.controller.onProgramChange(data);
                                break;
                            case 0xd:
                                this.controller.onChannelPressure(data);
                                break;
                            case 0xe:
                                this.controller.onPitchBend(data);
                                break;
                            case 0xf:
                                this.controller.onSystemControl(data);
                                break;
                            default:
                                break;
                        }
                    };
                }
            },
            (midi) => {
                this.controller.print('MIDI status: failure');
            }
        );
    }

    reset() {
        const channel    = CHANNEL_01_CONTROL_CHANGE;
        const controller = CONTROLLER_BANK_SELECT;
        const value      = COMMAND_RESET_BOARD;
        const message    = [channel, controller, value];

        this.send(message);
    }

    check() {
        for(let row = 0; row < 8; ++row) {
            for(let col = 0; col < 8; ++col) {
                this.setPad(row, col, this.color((row >> 1), (col >> 1)));
            }
        }
    }

    color(r, g) {
        const clamp = (val, min, max) => {
            if(val < min) return min;
            if(val > max) return max;
            return val;
        };
        return (clamp(g, 0, 3) << 4)
             | (clamp(r, 0, 3) << 0)
             ;
    }

    setPad(row, col, color) {
        const channel  = CHANNEL_01_NOTE_ON;
        const note     = ((16 * row) + col);
        const velocity = color;
        const message  = [channel, note, velocity];

        this.send(message);
    }

    resetPad(row, col) {
        const channel  = CHANNEL_01_NOTE_OFF;
        const note     = ((16 * row) + col);
        const velocity = 0;
        const message  = [channel, note, velocity];

        this.send(message);
    }

    setupGridLayout() {
        const channel    = CHANNEL_01_CONTROL_CHANGE;
        const controller = CONTROLLER_BANK_SELECT;
        const value      = COMMAND_GRID_LAYOUT;
        const message    = [channel, controller, value];

        this.send(message);
    }

    setupDrumLayout() {
        const channel    = CHANNEL_01_CONTROL_CHANGE;
        const controller = CONTROLLER_BANK_SELECT;
        const value      = COMMAND_DRUM_LAYOUT;
        const message    = [channel, controller, value];

        this.send(message);
    }

    send(message) {
        if(this.output != null) {
            this.output.send(message);
        }
    }
}

// ---------------------------------------------------------------------------
// LaunchpadMiniController
// ---------------------------------------------------------------------------

class LaunchpadMiniController {
    constructor() {
        const $ = (identifier) => {
            const selector = identifier.charAt(0);
            if(selector == '#') {
                return document.getElementById(identifier.substring(1));
            }
            if(selector == '.') {
                return document.getElementsByClassName(identifier.substring(1));
            }
            return document.getElementsByName(identifier);
        };

        this.lp_start   = $('#lp-start');
        this.lp_reset   = $('#lp-reset');
        this.lp_check   = $('#lp-check');
        this.lp_clear   = $('#lp-clear');
        this.lp_console = $('#lp-console');
        this.launchpad  = new LaunchpadMini(this);

        this.lp_start.addEventListener('click', () => { this.start(); });
        this.lp_reset.addEventListener('click', () => { this.reset(); });
        this.lp_check.addEventListener('click', () => { this.check(); });
        this.lp_clear.addEventListener('click', () => { this.clear(); });

        this.clear();
    }

    start() {
        this.print('start button clicked!');
        this.launchpad.start();
    }

    reset() {
        this.print('reset button clicked!');
        this.launchpad.reset();
    }

    check() {
        this.print('check button clicked!');
        this.launchpad.check();
    }

    clear() {
        this.lp_console.value = '';
        this.print('Launchpad Mini Controller');
    }

    print(text) {
        this.lp_console.value += text + '\n';
        const length = this.lp_console.value.length;
        this.lp_console.setSelectionRange(length, length);
    }

    onNoteOff(message) {
        const channel  = (message[0] & 0x0f);
        const note     = (message[1] & 0xff);
        const velocity = (message[2] & 0xff);
        this.print('NoteOff' + ', channel=' + channel + ', note=' + note + ', velocity=' + velocity);
        message[0] &= 0xf0;
        message[1] &= 0xff;
        message[2] &= 0x00;
        this.launchpad.send(message);
    }

    onNoteOn(message) {
        const channel  = (message[0] & 0x0f);
        const note     = (message[1] & 0xff);
        const velocity = (message[2] & 0xff);
        this.print('NoteOn' + ', channel=' + channel + ', note=' + note + ', velocity=' + velocity);
        message[0] &= 0xf0;
        message[1] &= 0xff;
        message[2]  = this.launchpad.color(((velocity >> 5) & 3), ((velocity >> 3) & 3));
        this.launchpad.send(message);
    }

    onAftertouch(message) {
        this.print('Aftertouch');
    }

    onControlChange(message) {
        this.print('ControlChange');
    }

    onProgramChange(message) {
        this.print('ProgramChange');
    }

    onChannelPressure(message) {
        this.print('ChannelPressure');
    }

    onPitchBend(message) {
        this.print('PitchBend');
    }

    onSystemControl(message) {
        this.print('SystemControl');
    }
}

// ---------------------------------------------------------------------------
// let's go!
// ---------------------------------------------------------------------------

const controller = new LaunchpadMiniController();

// ---------------------------------------------------------------------------
// End-Of-File
// ---------------------------------------------------------------------------
