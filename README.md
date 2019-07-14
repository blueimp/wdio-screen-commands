# WebdriverIO Screen Commands

[WebdriverIO](https://webdriver.io/) commands to capture and record browser
screens.

## Contents

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
    const ssim = browser.saveAndDiffScreenshot('save and diff screenshot')
    if (ssim && ssim.All < 1) {
      // Screenshot differs from previous run
      // See also: https://github.com/blueimp/node-ffmpeg-image-diff
    }
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
    // imageDiff options - see https://github.com/blueimp/node-ffmpeg-image-diff
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
    port: 5555,             // Server/device port, defaults to 9000 for ffmpeg
    // ffmpeg options - see https://github.com/blueimp/record-screen
    loglevel: undefined,    // Log level, defaults to "info"
    inputFormat: 'x11grab', // Input format, use 'mjpeg' for an MJPEG stream
    resolution: undefined,  // Display resolution (WIDTHxHEIGHT)
    fps: 15,                // Frames per second to record from input
    videoCodec: undefined,  // Video codec, defaults to libx264 for mp4 output
    pixelFormat: 'yuv420p', // Output pixel format
    rotate: undefined,      // Rotate metadata, set to 90 to rotate left by 90°
    display: '0',           // X11 server display, only used for x11grab
    protocol: 'http',       // Server protocol
    username: undefined,    // Basic auth username
    password: undefined,    // Basic auth password
    pathname: undefined,    // URL pathname component
    search: undefined       // URL query parameter
    // adb options - see https://github.com/blueimp/adb-record-screen
    serial: undefined,      // Use device with given serial
    transportID: undefined, // Use device with given transport ID
    waitTimeout: 5000,      // Device wait timeout (ms), 0 disables the wait
    bugreport: undefined,   // Set to `true` to add additional info to the video
    size: undefined,        // WIDTHxHEIGHT, defaults to native resolution
    bitRate: 4000000,       // Bits per second, default is 4Mbps
    timeLimit: 180,         // Time limit (s), maximum is 180 (3 mins)
    pullDelay: 200          // Delay (ms) before pulling the video file
  }
}
```

## License

Released under the [MIT license](https://opensource.org/licenses/MIT).

## Author

[Sebastian Tschan](https://blueimp.net/)
