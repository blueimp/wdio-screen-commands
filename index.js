'use strict'

/*
 * Webdriver.io commands to capture and record browser screens.
 *
 * Copyright 2019, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global browser */

const fs = require('fs')
const path = require('path')
const logger = require('@wdio/logger').default
const imageDiff = require('ffmpeg-image-diff')
const recordScreen = require('record-screen')
const screenRecordings = new Map()

function sanitizeBaseName (str) {
  // Remove non-word characters from the start and end of the string.
  // Replace everything but word characters, dots and spaces with a dash.
  return str.replace(/^\W+|\W+$/g, '').replace(/[^\w. -]+/g, '-')
}

function createFileName (name, ext, baseDir = 'reports') {
  const caps = browser.capabilities
  const dir = path.join(
    baseDir,
    sanitizeBaseName(
      [
        caps.browserName,
        (caps.browserVersion || caps.version || '')
          .split('.')
          .slice(0, 2)
          .join('.'),
        caps.platformName || caps.platform,
        (caps.platformVersion || '')
          .split('.')
          .slice(0, 2)
          .join('.'),
        caps.deviceName
      ]
        .filter(s => s) // Remove empty ('', undefined, null, 0) values
        .join(' ')
    )
  )
  fs.mkdirSync(dir, { recursive: true })
  return path.format({
    dir,
    name: sanitizeBaseName(name),
    ext
  })
}

function saveScreenshotByName (name) {
  const options = Object.assign(
    { dir: 'reports/screenshots' },
    browser.config.screenshots
  )
  const fileName = createFileName(name, '.png', options.dir)
  browser.saveScreenshot(fileName)
}

function saveScreenshotByTest (test) {
  const options = browser.config.screenshots || {}
  if (test.passed) {
    if (options.saveOnPass) saveScreenshotByName(test.fullTitle + ' PASSED')
  } else {
    if (options.saveOnFail) saveScreenshotByName(test.fullTitle + ' FAILED')
  }
}

async function saveAndDiffScreenshot (name) {
  const options = Object.assign(
    { dir: 'reports/screenshots' },
    browser.config.screenshots
  )
  const fileName = createFileName(name, '.png', options.dir)
  if (fs.existsSync(fileName)) {
    const fileNameOriginal = createFileName(
      name + ' original',
      '.png',
      options.dir
    )
    const fileNameDifference = createFileName(
      name + ' diff',
      '.png',
      options.dir
    )
    fs.renameSync(fileName, fileNameOriginal)
    browser.saveScreenshot(fileName)
    const ssim = await imageDiff(
      fileNameOriginal,
      fileName,
      fileNameDifference,
      options.imageDiff
    ).catch(err => logger('image-diff').error(err))
    if (!ssim) return
    if (ssim.All < 1) {
      logger('image-diff').warn(name, ssim)
    } else {
      fs.unlinkSync(fileNameOriginal)
      fs.unlinkSync(fileNameDifference)
    }
  } else {
    browser.saveScreenshot(fileName)
  }
}

function startScreenRecording (test) {
  const options = Object.assign(
    { dir: 'reports/videos', hostname: browser.config.hostname },
    browser.config.videos
  )
  if (!options.enabled) return
  const videoKey = browser.sessionId + ' ' + test.fullTitle
  const fileName = createFileName(test.fullTitle, '.mp4', options.dir)
  const recording = recordScreen(fileName, options)
  if (options.deleteOnPass) recording.deleteOnPass = fileName
  screenRecordings.set(videoKey, recording)
  recording.promise.catch(err => logger('screen-recording').error(err))
}

async function stopScreenRecording (test) {
  const videoKey = browser.sessionId + ' ' + test.fullTitle
  const recording = screenRecordings.get(videoKey)
  if (recording) {
    screenRecordings.delete(videoKey)
    recording.stop()
    await recording.promise.catch(_ => {}) // Handled by start function
    if (test.passed && recording.deleteOnPass) {
      fs.unlinkSync(recording.deleteOnPass)
    }
  }
}

module.exports = {
  saveScreenshotByName,
  saveScreenshotByTest,
  saveAndDiffScreenshot,
  startScreenRecording,
  stopScreenRecording
}
