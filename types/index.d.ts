declare namespace WebdriverIO {
  interface Config {
    screenshots?: import('..').ScreenshotOptions
    videos?: import('..').VideoOptions
  }

  interface Browser {
    config: Config
    capabilities: WebDriver.DesiredCapabilities
  }
}
