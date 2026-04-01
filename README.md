# lw.comm-server

> **Actively maintained fork** of [LaserWeb/lw.comm-server](https://github.com/LaserWeb/lw.comm-server), which is no longer maintained. Issues and pull requests welcome here.

**lw.comm-server** is the unified communications server for LaserWeb4 (and compatible frontends). It acts as the gateway between your machine controller and the browser-based UI, handling all interface and firmware-specific protocol details so the frontend doesn't have to.

[![Build and Release](https://github.com/colintrachte/lw.comm-server/actions/workflows/ci.yml/badge.svg)](https://github.com/colintrachte/lw.comm-server/actions/workflows/ci.yml)

---

## What's different in this fork

- **Node.js 18 LTS** — updated from the abandoned Node 12 baseline
- **GrblHAL support** — firmware detection now handles `grblHAL 1.1` in addition to standard `Grbl 1.1`
- **jogCancel command** — real-time jog cancellation for all supported firmwares (grbl `0x85`, TinyG feed hold + queue flush, Smoothie halt, Marlin queue clear)
- **Server-side settings persistence** — UI settings saved to `lw.settings.json` on the server, synced to all connected clients automatically
- **GitHub Actions CI** — replaces the dead Travis CI config with working multi-platform builds and semantic versioning
- **Systemd service fix** — corrected `WEB_PORT` env var name in the sample service file

---

## Communication structure

[![Communication diagram](https://github.com/LaserWeb/lw.comm-server/raw/master/doc/communications-diagram.jpg)](https://github.com/LaserWeb/lw.comm-server/blob/master/doc/communications-diagram.jpg)

The frontend communicates with the server over WebSockets. The server supports multiple machine interfaces simultaneously and abstracts firmware differences away from the UI.

---

## Supported interfaces

| Interface | Status |
|---|---|
| Serial over USB | ✅ Working |
| WebSocket to ESP8266 (WLAN-to-serial gateway) | ✅ Working |
| Telnet over network / WLAN | ✅ Working |

---

## Supported firmwares

| Firmware | Status |
|---|---|
| Grbl (ATmega328) | ✅ Full support |
| GrblHAL | ✅ Full support (added in this fork) |
| Grbl MEGA / RAMPS (Arduino Mega 2560) | ✅ Full support |
| Grbl-LPC (Smoothieboard, MKS SBASE, Azteeg, C3D) | ✅ Full support |
| Smoothieware | ✅ Full support |
| TinyG / g2core | ✅ Full support |
| Marlin | ⚠️ Partial |
| MarlinKimbra | ⚠️ Partial |
| RepRapFirmware | ⚠️ Partial |

---

## Installation

**Requirements:** Node.js 18 LTS, npm 8+

```bash
# Clone this fork
git clone https://github.com/colintrachte/lw.comm-server.git
cd lw.comm-server

# Install dependencies
npm install

# Start the server
npm start
```

The server will print its local URL on startup. Open that address in your browser to connect the LaserWeb4 UI.

### Running as a systemd service (Linux / Raspberry Pi)

A sample service file is included. Edit `lw.comm-server.service` to set your username and install path, then:

```bash
sudo ln -s $(pwd)/lw.comm-server.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now lw.comm-server
```

### Running with Docker

```bash
docker build -t lw.comm-server .
docker run --privileged -p 8000:8000 lw.comm-server
```

The `--privileged` flag is required for USB serial device access inside the container.

---

## Configuration

Copy `conf.env` to `.env` and edit as needed. Key settings:

| Variable | Default | Description |
|---|---|---|
| `WEB_PORT` | `8000` | Port the web UI and WebSocket server listens on |
| `NODE_ENV` | `production` | Set to `development` for verbose logging |

---

## Socket API

The frontend communicates with the server via WebSocket events.

### Commands (client → server)

| Command | Description |
|---|---|
| `firstLoad` | Request initial config and settings on connect |
| `getSettings` | Request persisted UI settings |
| `saveSettings(data)` | Persist UI settings; broadcasts update to all clients |
| `connectTo(iface, port, baud)` | Connect to a machine |
| `runJob(gcode)` | Send and run a gcode file |
| `runCommand(line)` | Send a single gcode line |
| `jog(axis, dist, feed)` | Execute a single-axis jog move |
| `jogTo(axes, feed)` | Execute a multi-axis jog move |
| `jogCancel` | Cancel an in-progress jog (real-time, firmware-specific) |
| `pause` | Pause the running job |
| `unpause` | Resume from pause |
| `stop` | Stop the running job immediately |
| `home(axis)` | Home one or all axes |
| `setZero(axis)` | Zero one or all axes |
| `gotoZero(axis)` | Fast move to zero |
| `feedOverride(value)` | Adjust feed rate override |
| `spindleOverride(value)` | Adjust spindle/laser power override |
| `laserTest(power, duration)` | Fire laser for test |
| `resetMachine` | Reset the controller |
| `clearAlarm` | Clear controller alarm state |
| `closePort` | Disconnect from machine |

### Events (server → client)

| Event | Description |
|---|---|
| `settingsData` | Persisted UI settings object |
| `serverConfig` | Server configuration |
| `interfaces` | List of supported connection interfaces |
| `ports` | List of available serial ports |
| `activePort` | Currently connected port |
| `connectStatus` | Connection state changes |
| `firmware` | Detected firmware name and version |
| `data` | Raw data from machine (positions, responses) |
| `wPos` | Work coordinate position |
| `mPos` | Machine coordinate position |
| `runStatus` | Job run state (run / hold / idle) |
| `qCount` | Server-side queue depth |
| `error` | Server error message |

---

## Releases

Releases are built automatically from `master` via GitHub Actions using semantic versioning derived from conventional commits. Each release includes portable archives for Linux, macOS, and Windows — no installer required.

- `feat:` commits increment the minor version
- `fix:` / other commits increment the patch version  
- `BREAKING CHANGE` or `feat!:` increments the major version

Download the latest release from the [Releases page](https://github.com/colintrachte/lw.comm-server/releases).

---

## Contributing

PRs are welcome. Please use [conventional commit](https://www.conventionalcommits.org/) messages so the changelog and version bumps work correctly:

```
feat: add support for XYZ firmware
fix: correct baud rate detection on reconnect
docs: update installation instructions
```

---

## License

GPL-3.0 — see [LICENSE](LICENSE).

Original project by [Claudio Prezzi](https://github.com/cprezzi) and the LaserWeb contributors.