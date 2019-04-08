// WebdriverIO does not expose all required properties,
// so we're redefining the interfaces and globals here for development

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

declare namespace WebdriverIO {
  interface Suite {
    fullTitle?: string // @wdio/mocha-framework
    fullName?: string // @wdio/jasmine-framework
  }

  interface Test extends Suite {
    passed: boolean
  }
}
