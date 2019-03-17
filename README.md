# WebdriverIO Screen Commands
[WebdriverIO](https://webdriver.io/) commands to capture and record browser
screens.

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [License](#license)
- [Author](#author)

## Requirements
The screenshot diffing and screen recording functionality requires
[ffmpeg](https://www.ffmpeg.org/) to be installed and available in the `PATH`.  
Screen recording for Android devices requires
[adb](https://developer.android.com/studio/command-line/adb) to be installed and
available in the `PATH`.

## Installation

```sh
npm install wdio-screen-commands
```

## Usage
Add the following to your WebdriverIO config:

```js
const cmds = require('wdio-screen-commands')

module.exports = {
  screenshots: {
    saveOnFail: true
  },
  videos: {
    enabled: true,
    resolution: '1440x900'
  },
  before: () => {
    browser.addCommand('saveScreenshotByName', cmds.saveScreenshotByName)
    browser.addCommand('saveAndDiffScreenshot', cmds.saveAndDiffScreenshot)
  },
  beforeTest: test => {
    cmds.startScreenRecording(test)
  },
  afterTest: async test => {
    await cmds.stopScreenRecording(test)
    cmds.saveScreenshotByTest(test)
  }
}
```

To save and diff screenshots in your tests:

```js
describe('screenshots', () => {
  it('should save and diff screenshots', () => {
    // Save screenshot by name, into a browser-specific sub-directory:
    browser.saveScreenshotByName('save screenshot by name')
    // Save screenshot and compare with same file from previous run:
    browser.saveAndDiffScreenshot('save and diff screenshot')
  })
})
```

See [blueimp/wdio](https://github.com/blueimp/wdio) for a complete setup
example.

## Options

```js
const defaultOptions = {
  screenshots: {
    dir: 'reports/screenshots', // Screenshots directory
    saveOnFail: false,          // Automatically save screenshots on test fail
    saveOnPass: false,          // Automatically save screenshots on test pass
    // see github.com/blueimp/node-ffmpeg-image-diff
    imageDiff: {
      ssim: true,               // false or true
      similarity: 0.01,         // 1.0 - 0.01
      blend: 1.0,               // 1.0 - 0.0
      opacity: 0.1,             // 1.0 - 0.0
      color: 'magenta'          // magenta, yellow, cyan, red, green, blue or ''
    }
  },
  videos: {
    // shared options
    enabled: false,         // Enable screen recordings
    deleteOnPass: false,    // Keep screen recordings when tests pass
    startDelay: undefined,  // Seconds, execution delay after recording start
    stopDelay: undefined,   // Seconds, execution delay before recording stop
    hostname: 'localhost',  // Server/device hostname
    port: 5555,             // Server/device port, defaults to 9100 for ffmpeg
    // ffmpeg options - see github.com/blueimp/record-screen
    inputFormat: 'x11grab', // Input format, use 'mjpeg' for an MJPEG stream
    resolution: undefined,  // Display resolution (WIDTHxHEIGHT)
    fps: 15,                // Frames per second to record from input
    videoCodec: undefined,  // Video codec, defaults to libx264 for mp4 output
    pixelFormat: 'yuv420p', // Output pixel format
    display: '0',           // X11 server display, only used for x11grab
    protocol: 'http',       // Server protocol
    username: undefined,    // URL username property
    password: undefined,    // URL password property
    pathname: undefined,    // URL pathname property
    search: undefined       // URL search property
    // adb options - see github.com/blueimp/adb-record-screen
    serial: undefined,      // Use device with given serial
    transportID: undefined, // Use device with given transport ID
    bugreport: undefined,   // Set to `true` to add additional info to the video
    size: undefined,        // WIDTHxHEIGHT, defaults to native resolution
    bitRate: undefined,     // Bits per second, default value is 4000000 (4Mbps)
    timeLimit: undefined,   // Seconds, default + maximum value is 180 (3 mins)
    pullDelay: 200          // Milliseconds, delay before pulling the video file
  }
}
```

## License
Released under the [MIT license](https://opensource.org/licenses/MIT).

## Author
[Sebastian Tschan](https://blueimp.net/)
