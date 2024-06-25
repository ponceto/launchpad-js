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
        navigator.requestMIDIAccess().then(
            (midi) => {
                this.controller.print('MIDI access has been granted');
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
                    this.controller.print('MIDI input was found for <' + this.name + '>');
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
                else {
                    this.controller.print('MIDI input was not found for <' + this.name + '>');
                }
                if(this.output != null) {
                    this.controller.print('MIDI output was found for <' + this.name + '>');
                }
                else {
                    this.controller.print('MIDI output was not found for <' + this.name + '>');
                }
            },
            (midi) => {
                this.controller.print('MIDI access has been denied');
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
        this.sendNoteOn(((16 * (row & 15)) + (col & 15)), color);
    }

    setPadOff(row, col) {
        this.sendNoteOff(((16 * (row & 15)) + (col & 15)), 0);
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

const GOL_EMPTY = 0;
const GOL_ALIVE = 4;

class LaunchpadMiniGameOfLife {
    constructor(launchpad) {
        this.launchpad  = launchpad;
        this.rows       = 8;
        this.cols       = 8;
        this.state      = new Uint8Array(this.rows * this.cols);
        this.interval   = null;
        this.timeout    = 250;
        this.colors     = [];
        this.colors[0]  = launchpad.color(0, 0);
        this.colors[1]  = launchpad.color(1, 0);
        this.colors[2]  = launchpad.color(2, 0);
        this.colors[3]  = launchpad.color(3, 0);
        this.colors[4]  = launchpad.color(0, 3);
        this.reset();
    }

    set(row, col, value) {
        this.launchpad.setPadOn(row, col, this.colors[value]);
    }

    reset() {
        this.state.forEach((value, index, table) => {
            const row = ((index / this.cols) | 0);
            const col = ((index % this.cols) | 0);
            const rnd = Math.random();
            if(rnd >= 0.5) {
                table[index] = (value = GOL_ALIVE);
            }
            else {
                table[index] = (value = GOL_EMPTY);
            }
            this.set(row, col, value);
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
            neighbors += (get((row - 1), (col - 1)) == GOL_ALIVE ? 1 : 0);
            neighbors += (get((row - 1), (col | 0)) == GOL_ALIVE ? 1 : 0);
            neighbors += (get((row - 1), (col + 1)) == GOL_ALIVE ? 1 : 0);
            neighbors += (get((row | 0), (col - 1)) == GOL_ALIVE ? 1 : 0);
            neighbors += (get((row | 0), (col | 0)) == GOL_ALIVE ? 1 : 0);
            neighbors += (get((row | 0), (col + 1)) == GOL_ALIVE ? 1 : 0);
            neighbors += (get((row + 1), (col - 1)) == GOL_ALIVE ? 1 : 0);
            neighbors += (get((row + 1), (col | 0)) == GOL_ALIVE ? 1 : 0);
            neighbors += (get((row + 1), (col + 1)) == GOL_ALIVE ? 1 : 0);
            return neighbors;
        };
        this.state.forEach((value, index, table) => {
            const row = ((index / this.cols) | 0);
            const col = ((index % this.cols) | 0);
            const neighbors = count(row, col);
            if(value == GOL_ALIVE) {
                if((neighbors == 2) || (neighbors == 3)) {
                    table[index] = (value = GOL_ALIVE);
                }
                else {
                    if(--value < 0) {
                        value = 0;
                    }
                    table[index] = value;
                }
            }
            else {
                if(neighbors == 3) {
                    table[index] = (value = GOL_ALIVE);
                }
                else {
                    if(--value < 0) {
                        value = 0;
                    }
                    table[index] = value;
                }
            }
            this.set(row, col, value);
        });
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

        this.controls = {};
        this.controls.start    = $('#lp-start');
        this.controls.reset    = $('#lp-reset');
        this.controls.check    = $('#lp-check');
        this.controls.clear    = $('#lp-clear');
        this.controls.play     = $('#gol-play');
        this.controls.stop     = $('#gol-stop');
        this.controls.flush    = $('#con-flush');
        this.controls.textarea = $('#con-textarea');
        this.launchpad         = new LaunchpadMini(this);
        this.gameoflife        = new LaunchpadMiniGameOfLife(this.launchpad);

        this.controls.start.addEventListener('click', () => { this.launchpad.start(); });
        this.controls.reset.addEventListener('click', () => { this.launchpad.reset(); });
        this.controls.check.addEventListener('click', () => { this.launchpad.check(); });
        this.controls.clear.addEventListener('click', () => { this.launchpad.clear(); });
        this.controls.play.addEventListener('click', () => { this.gameoflife.play(); });
        this.controls.stop.addEventListener('click', () => { this.gameoflife.stop(); });
        this.controls.flush.addEventListener('click', () => { this.flush(); });

        this.flush();
        this.gameoflife.reset();
    }

    flush() {
        this.controls.textarea.value = '';
        this.print('Launchpad Mini Controller');
    }

    print(text) {
        this.controls.textarea.value += text + '\n';
        const length = this.controls.textarea.value.length;
        this.controls.textarea.setSelectionRange(length, length);
    }

    onNoteOff(message) {
        const channel  = (message[0] & 0x0f);
        const note     = (message[1] & 0x7f);
        const velocity = (message[2] & 0x7f);
        const red      = ((velocity >> 5) & 3);
        const green    = ((velocity >> 3) & 3);
        const color    = this.launchpad.color(red, green);
        this.print('NoteOff' + ', channel=' + channel + ', note=' + note + ', velocity=' + velocity);
        this.launchpad.sendNoteOff(note, color);
    }

    onNoteOn(message) {
        const channel  = (message[0] & 0x0f);
        const note     = (message[1] & 0x7f);
        const velocity = (message[2] & 0x7f);
        const red      = ((velocity >> 5) & 3);
        const green    = ((velocity >> 3) & 3);
        const color    = this.launchpad.color(red, green);
        this.print('NoteOn' + ', channel=' + channel + ', note=' + note + ', velocity=' + velocity);
        this.launchpad.sendNoteOn(note, color);
    }

    onAftertouch(message) {
        this.print('Aftertouch');
    }

    onControlChange(message) {
        const channel    = (message[0] & 0x0f);
        const controller = (message[1] & 0xff);
        const data       = (message[2] & 0xff);
        const red        = ((data >> 5) & 3);
        const green      = ((data >> 3) & 3);
        const color      = this.launchpad.color(red, green);
        this.print('ControlChange' + ', channel=' + channel + ', controller=0x' + controller.toString(16) + ', data=0x' + data.toString(16));
        this.launchpad.sendControlChange(controller, data);
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
