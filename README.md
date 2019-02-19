# WebdriverIO Screen Commands
[WebdriverIO](https://webdriver.io/) commands to capture and record browser
screens.

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
    dir: 'reports/screenshots', // screenshots directory
    saveOnFail: true,           // automatically save screenshots on test fail
    saveOnPass: true,           // automatically save screenshots on test pass
    imageDiff: {                // see github.com/blueimp/node-ffmpeg-image-diff
      ssim: true,               // false or true
      similarity: 0.01,         // 1.0 - 0.01
      blend: 1.0,               // 1.0 - 0.0
      opacity: 0.1,             // 1.0 - 0.0
      color: 'magenta'          // magenta, yellow, cyan, red, green, blue or ''
    }
  },
  videos: {                     // see github.com/blueimp/record-screen
    enabled: true,              // enable screen recordings
    deleteOnPass: false         // keep screen recordings when tests pass
    dir: 'reports/videos',      // videos directory
    resolution: '1440x900',     // Display resolution
    fps: 15,                    // Frames per second
    hostname: 'localhost',      // X11 server hostname, default: config.hostname
    display: '0',               // X11 server display
    pixelFormat: 'yuv420p'      // Output pixel format
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

## License
Released under the [MIT license](https://opensource.org/licenses/MIT).

## Author
[Sebastian Tschan](https://blueimp.net/)
