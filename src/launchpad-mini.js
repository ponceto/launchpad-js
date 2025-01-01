/*
 * launchpad-mini.js - Copyright (c) 2001-2025 - Olivier Poncet
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

const MIDI_NOTE_OFF                     = 0x80;
const MIDI_NOTE_ON                      = 0x90;
const MIDI_AFTERTOUCH                   = 0xa0;
const MIDI_CONTROL_CHANGE               = 0xb0;
const MIDI_PROGRAM_CHANGE               = 0xc0;
const MIDI_CHANNEL_AFTERTOUCH           = 0xd0;
const MIDI_PITCH_BEND                   = 0xe0;
const MIDI_SYSTEM_CONTROL               = 0xf0;
const MIDI_CHANNEL01                    = 0x00;
const MIDI_CHANNEL02                    = 0x01;
const MIDI_CHANNEL03                    = 0x02;
const MIDI_CHANNEL04                    = 0x03;
const MIDI_CHANNEL05                    = 0x04;
const MIDI_CHANNEL06                    = 0x05;
const MIDI_CHANNEL07                    = 0x06;
const MIDI_CHANNEL08                    = 0x07;
const MIDI_CHANNEL09                    = 0x08;
const MIDI_CHANNEL10                    = 0x09;
const MIDI_CHANNEL11                    = 0x0a;
const MIDI_CHANNEL12                    = 0x0b;
const MIDI_CHANNEL13                    = 0x0c;
const MIDI_CHANNEL14                    = 0x0d;
const MIDI_CHANNEL15                    = 0x0e;
const MIDI_CHANNEL16                    = 0x0f;
const MIDI_CONTROLLER_BANK_SELECT       = 0x00;
const MIDI_CONTROLLER_MODULATION_WHEEL  = 0x01;
const MIDI_CONTROLLER_BREATH_CONTROLLER = 0x02;
const MIDI_CONTROLLER_UNDEFINED1        = 0x03;
const MIDI_CONTROLLER_FOOT_PEDAL        = 0x04;
const MIDI_CONTROLLER_PORTAMENTO_TIME   = 0x05;
const MIDI_CONTROLLER_DATA_ENTRY        = 0x06;
const MIDI_CONTROLLER_VOLUME            = 0x07;
const MIDI_CONTROLLER_BALANCE           = 0x08;
const MIDI_CONTROLLER_UNDEFINED2        = 0x09;
const MIDI_CONTROLLER_PAN               = 0x0a;
const MIDI_CONTROLLER_EXPRESSION        = 0x0b;
const MIDI_CONTROLLER_EFFECT1           = 0x0c;
const MIDI_CONTROLLER_EFFECT2           = 0x0d;
const MIDI_CONTROLLER_UNDEFINED3        = 0x0e;
const MIDI_CONTROLLER_UNDEFINED4        = 0x0f;
const LAUNCHPAD_RESET_BOARD             = 0x00;
const LAUNCHPAD_GRID_LAYOUT             = 0x01;
const LAUNCHPAD_DRUM_LAYOUT             = 0x02;
const LAUNCHPAD_CONTROL1                = 0x68;
const LAUNCHPAD_CONTROL2                = 0x69;
const LAUNCHPAD_CONTROL3                = 0x6a;
const LAUNCHPAD_CONTROL4                = 0x6b;
const LAUNCHPAD_CONTROL5                = 0x6c;
const LAUNCHPAD_CONTROL6                = 0x6d;
const LAUNCHPAD_CONTROL7                = 0x6e;
const LAUNCHPAD_CONTROL8                = 0x6f;

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
        const controller = this.controller;
        navigator.requestMIDIAccess({ sysex: true }).then(
            (midi) => {
                controller.print('MIDI access has been granted');
                midi.inputs.forEach((input) => {
                    if(input.name.startsWith(this.name)) {
                        this.input = input;
                    }
                });
                midi.outputs.forEach((output) => {
                    if(output.name.startsWith(this.name)) {
                        this.output = output;
                    }
                });
                if(this.input != null) {
                    controller.print('MIDI input was found for <' + this.name + '>');
                    this.input.onmidimessage = (message) => {
                        const data = message.data;
                        switch(data[0] >> 4) {
                            case 0x8:
                                controller.onNoteOff(data);
                                break;
                            case 0x9:
                                controller.onNoteOn(data);
                                break;
                            case 0xa:
                                controller.onAftertouch(data);
                                break;
                            case 0xb:
                                controller.onControlChange(data);
                                break;
                            case 0xc:
                                controller.onProgramChange(data);
                                break;
                            case 0xd:
                                controller.onChannelPressure(data);
                                break;
                            case 0xe:
                                controller.onPitchBend(data);
                                break;
                            case 0xf:
                                controller.onSystemControl(data);
                                break;
                            default:
                                break;
                        }
                    };
                }
                else {
                    controller.print('MIDI input was not found for <' + this.name + '>');
                }
                if(this.output != null) {
                    controller.print('MIDI output was found for <' + this.name + '>');
                }
                else {
                    controller.print('MIDI output was not found for <' + this.name + '>');
                }
            },
            (midi) => {
                controller.print('MIDI access has been denied');
            }
        );
    }

    reset() {
        this.sendControlChange(MIDI_CONTROLLER_BANK_SELECT, LAUNCHPAD_RESET_BOARD);
    }

    check() {
        for(let row = 0; row < 8; ++row) {
            for(let col = 0; col < 8; ++col) {
                this.setPadOn(row, col, this.color((row >> 1), (col >> 1)));
            }
        }
    }

    clear() {
        for(let row = 0; row < 8; ++row) {
            for(let col = 0; col < 8; ++col) {
                this.setPadOff(row, col);
            }
        }
    }

    color(r, g) {
        const clamp = (val, min, max) => {
            if(val <= min) return min;
            if(val >= max) return max;
            return val;
        };
        return (clamp(g, 0, 3) << 4)
             | (clamp(r, 0, 3) << 0)
             ;
    }

    setPadOn(row, col, color) {
        const note     = ((16 * (row & 15)) + (col & 15));
        const velocity = color;
        this.sendNoteOn(note, velocity);
    }

    setPadOff(row, col) {
        const note     = ((16 * (row & 15)) + (col & 15));
        const velocity = 0;
        this.sendNoteOff(note, velocity);
    }

    setGridLayout() {
        this.sendControlChange(MIDI_CONTROLLER_BANK_SELECT, LAUNCHPAD_GRID_LAYOUT);
    }

    setDrumLayout() {
        this.sendControlChange(MIDI_CONTROLLER_BANK_SELECT, LAUNCHPAD_DRUM_LAYOUT);
    }

    sendMessage(message) {
        if(this.output != null) {
            this.output.send(message);
        }
    }

    sendCommand(command, channel, data1, data2) {
        this.sendMessage([(command | channel), data1, data2]);
    }

    sendNoteOn(note, velocity) {
        this.sendCommand(MIDI_NOTE_ON, MIDI_CHANNEL01, note, velocity);
    }

    sendNoteOff(note, velocity) {
        this.sendCommand(MIDI_NOTE_OFF, MIDI_CHANNEL01, note, velocity);
    }

    sendControlChange(controller, data) {
        this.sendCommand(MIDI_CONTROL_CHANGE, MIDI_CHANNEL01, controller, data);
    }
}

// ---------------------------------------------------------------------------
// LaunchpadMiniGameOfLife
// ---------------------------------------------------------------------------

const GOL_IS_EMPTY  = 0;
const GOL_IS_ALIVE  = 5;
const GOL_MIN_ALIVE = 2;
const GOL_MAX_ALIVE = 3;

class LaunchpadMiniGameOfLife {
    constructor(launchpad) {
        this.launchpad  = launchpad;
        this.rows       = 8;
        this.cols       = 8;
        this.state      = new Uint8Array(this.rows * this.cols);
        this.interval   = null;
        this.timeout    = 250;
        this.palette    = new Uint8Array(GOL_IS_ALIVE + 1);
        this.palette[0] = launchpad.color(0, 0);
        this.palette[1] = launchpad.color(1, 0);
        this.palette[2] = launchpad.color(2, 0);
        this.palette[3] = launchpad.color(3, 0);
        this.palette[4] = launchpad.color(3, 3);
        this.palette[5] = launchpad.color(0, 3);
        this.reset();
    }

    set(row, col, value) {
        if(value < GOL_IS_EMPTY) value = GOL_IS_EMPTY;
        if(value > GOL_IS_ALIVE) value = GOL_IS_ALIVE;
        this.state[((this.cols * row) + col)] = value;
        this.launchpad.setPadOn(row, col, this.palette[value]);
    }

    reset() {
        this.state.forEach((value, index, table) => {
            const row = ((index / this.cols) | 0);
            const col = ((index % this.cols) | 0);
            const rnd = Math.random();
            if(rnd >= 0.50) {
                this.set(row, col, GOL_IS_ALIVE);
            }
            else {
                this.set(row, col, GOL_IS_EMPTY);
            }
        });
    }

    update() {
        const state = [...this.state];
        const get = (row, col) => {
            row = ((row + this.rows) % this.rows);
            col = ((col + this.cols) % this.cols);
            return state[((this.cols * row) + col)];
        };
        const count = (row, col) => {
            let neighbors = 0;
            neighbors += (get((row - 1), (col - 1)) == GOL_IS_ALIVE ? 1 : 0);
            neighbors += (get((row - 1), (col | 0)) == GOL_IS_ALIVE ? 1 : 0);
            neighbors += (get((row - 1), (col + 1)) == GOL_IS_ALIVE ? 1 : 0);
            neighbors += (get((row | 0), (col - 1)) == GOL_IS_ALIVE ? 1 : 0);
            neighbors += (get((row | 0), (col + 1)) == GOL_IS_ALIVE ? 1 : 0);
            neighbors += (get((row + 1), (col - 1)) == GOL_IS_ALIVE ? 1 : 0);
            neighbors += (get((row + 1), (col | 0)) == GOL_IS_ALIVE ? 1 : 0);
            neighbors += (get((row + 1), (col + 1)) == GOL_IS_ALIVE ? 1 : 0);
            return neighbors;
        };
        let updated = false;
        this.state.forEach((value, index, table) => {
            const row = ((index / this.cols) | 0);
            const col = ((index % this.cols) | 0);
            const neighbors = count(row, col);
            if(value == GOL_IS_ALIVE) {
                if((neighbors >= GOL_MIN_ALIVE) && (neighbors <= GOL_MAX_ALIVE)) {
                    this.set(row, col, GOL_IS_ALIVE);
                }
                else {
                    this.set(row, col, (value - 1));
                }
            }
            else {
                if(neighbors == GOL_MAX_ALIVE) {
                    this.set(row, col, GOL_IS_ALIVE);
                }
                else {
                    this.set(row, col, (value - 1));
                }
            }
            if(table[index] != state[index]) {
                updated = true;
            }
        });
        if(updated == false) {
            this.reset();
        }
    }

    play() {
        if(this.interval == null) {
            this.interval = setInterval(() => { this.update(); }, this.timeout);
        }
        this.reset();
    }

    stop() {
        if(this.interval != null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

// ---------------------------------------------------------------------------
// LaunchpadMiniView
// ---------------------------------------------------------------------------

class LaunchpadMiniView {
    constructor(controller) {
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

        this.controller = controller;
        this.lp_start   = $('#lp-start');
        this.lp_reset   = $('#lp-reset');
        this.lp_check   = $('#lp-check');
        this.lp_clear   = $('#lp-clear');
        this.gol_play   = $('#gol-play');
        this.gol_stop   = $('#gol-stop');
        this.log_flush  = $('#log-flush');
        this.log_panel  = $('#log-panel');

        this.lp_start.addEventListener ('click', () => { controller.onStart(); });
        this.lp_reset.addEventListener ('click', () => { controller.onReset(); });
        this.lp_check.addEventListener ('click', () => { controller.onCheck(); });
        this.lp_clear.addEventListener ('click', () => { controller.onClear(); });
        this.gol_play.addEventListener ('click', () => { controller.onPlay();  });
        this.gol_stop.addEventListener ('click', () => { controller.onStop();  });
        this.log_flush.addEventListener('click', () => { controller.onFlush(); });
    }
}

// ---------------------------------------------------------------------------
// LaunchpadMiniApp
// ---------------------------------------------------------------------------

class LaunchpadMiniApp {
    constructor() {
        this.launchpad = new LaunchpadMini(this);
        this.view      = new LaunchpadMiniView(this);
        this.game      = new LaunchpadMiniGameOfLife(this.launchpad);
        this.onFlush();
    }

    print(text) {
        const log_panel = this.view.log_panel;
        log_panel.value += text + '\n';
        const length = log_panel.value.length;
        log_panel.setSelectionRange(length, length);
    }

    onStart() {
        this.launchpad.start();
    }

    onReset() {
        this.launchpad.reset();
    }

    onCheck() {
        this.launchpad.check();
    }

    onClear() {
        this.launchpad.clear();
    }

    onPlay() {
        this.game.play();
    }

    onStop() {
        this.game.stop();
    }

    onFlush() {
        this.view.log_panel.value = '';
        this.print('Welcome to the Launchpad Mini controller');
    }

    onNoteOff(message) {
        const launchpad = this.launchpad;
        const channel   = (message[0] & 0x0f);
        const note      = (message[1] & 0x7f);
        const velocity  = (message[2] & 0x7f);
        const red       = ((velocity >> 5) & 3);
        const green     = ((velocity >> 3) & 3);
        const color     = launchpad.color(red, green);
        this.print('Message: ' + 'NoteOff' + ', channel=' + channel + ', note=' + note + ', velocity=' + velocity);
        launchpad.sendNoteOff(note, color);
    }

    onNoteOn(message) {
        const launchpad = this.launchpad;
        const channel   = (message[0] & 0x0f);
        const note      = (message[1] & 0x7f);
        const velocity  = (message[2] & 0x7f);
        const red       = ((velocity >> 5) & 3);
        const green     = ((velocity >> 3) & 3);
        const color     = launchpad.color(red, green);
        this.print('Message: ' + 'NoteOn' + ', channel=' + channel + ', note=' + note + ', velocity=' + velocity);
        launchpad.sendNoteOn(note, color);
    }

    onAftertouch(message) {
        this.print('Message: ' + 'Aftertouch');
    }

    onControlChange(message) {
        const launchpad  = this.launchpad;
        const channel    = (message[0] & 0x0f);
        const controller = (message[1] & 0xff);
        const data       = (message[2] & 0xff);
        const red        = ((data >> 5) & 3);
        const green      = ((data >> 3) & 3);
        const color      = launchpad.color(red, green);
        this.print('Message: ' + 'ControlChange' + ', channel=' + channel + ', controller=0x' + controller.toString(16) + ', data=0x' + data.toString(16));
        launchpad.sendControlChange(controller, data);
    }

    onProgramChange(message) {
        this.print('Message: ' + 'ProgramChange');
    }

    onChannelPressure(message) {
        this.print('Message: ' + 'ChannelPressure');
    }

    onPitchBend(message) {
        this.print('Message: ' + 'PitchBend');
    }

    onSystemControl(message) {
        this.print('Message: ' + 'SystemControl');
    }
}

// ---------------------------------------------------------------------------
// let's go!
// ---------------------------------------------------------------------------

const application = new LaunchpadMiniApp();

// ---------------------------------------------------------------------------
// End-Of-File
// ---------------------------------------------------------------------------
