declare module WebdriverIO {
  interface Config {
    screenshots?: import('..').ScreenshotOptions
    videos?: import('..').VideoOptions
  }
}
