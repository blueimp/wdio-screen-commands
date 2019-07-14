type BrowserObject = {
  capabilities: {
    browserName: string
    browserVersion?: string
    platformVersion?: string
    version?: string
    platformName?: string
    platform?: string
    deviceName?: string
  }
  config: any
  sessionId: string
  saveScreenshot: Function
  pause: Function
}

declare var browser: BrowserObject
