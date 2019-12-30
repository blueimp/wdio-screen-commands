/*
 * Webdriver.io commands to capture and record browser screens.
 *
 * Copyright 2019, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

'use strict'

/* global browser, WebdriverIO */

/**
 * @typedef {import('adb-record-screen').Options} ADBOptions
 * @typedef {import('record-screen').Options} FFmpegOptions
 * @typedef {import('record-screen').Recording} Recording
 * @typedef {import('record-screen').Result} RecordingResult
 * @typedef {import('ffmpeg-image-diff').Options} ImageDiffOptions
 * @typedef {import('ffmpeg-image-diff').Result} ImageDiffResult
 */

/**
 * @typedef {object} ScreenshotOptions Screenshot options
 * @property {string} [dir=reports/screenshots] Screenshots directory
 * @property {boolean} [saveOnFail] Automatically save screenshots on test fail
 * @property {boolean} [saveOnPass] Automatically save screenshots on test pass
 * @property {ImageDiffOptions} [imageDiff] Image diffing options
 */

/**
 * @typedef {object} RecordingOptions Video recording options
 * @property {string} [dir=reports/videos] Videos directory
 * @property {boolean} [enabled] Set to true to enable video recordings
 * @property {boolean} [deleteOnPass] Deletes screen recordings on pass if true
 * @property {number} [startDelay] Delay in ms after starting the recording
 * @property {number} [stopDelay] Delay in ms before stopping the recording
 */

/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {FFmpegOptions & ADBOptions & RecordingOptions} VideoOptions
 */
/* eslint-enable jsdoc/valid-types */

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const mkdir = promisify(fs.mkdir)
const rename = promisify(fs.rename)
const unlink = promisify(fs.unlink)
const logger = require('@wdio/logger').default
const imageDiffLogger = logger('image-diff')
const screenRecordingLogger = logger('screen-recording')
const imageDiff = require('ffmpeg-image-diff')
const ffmpegRecordScreen = require('record-screen')
const adbRecordScreen = require('adb-record-screen')
const screenRecordings = new Map()

/**
 * Starts a screen recording via ffmpeg or adb shell screenrecord.
 *
 * @param {string} fileName Output file name
 * @param {VideoOptions} [options] Screen recording options
 * @returns {Recording} Recording object
 */
function recordScreen(fileName, options) {
  // The ffmpeg version requires either inputFormat or resolution to be set,
  // neither of which are options for the adb version:
  if (options.inputFormat || options.resolution) {
    return ffmpegRecordScreen(fileName, options)
  }
  return adbRecordScreen(fileName, options)
}

/**
 * Sanitizes the basename of a file path.
 *
 * @param {string} str Input string
 * @returns {string} Sanitized string
 */
function sanitizeBaseName(str) {
  // Remove non-word characters from the start and end of the string.
  // Replace everything but word characters, dots and spaces with a dash.
  return str.replace(/^\W+|\W+$/g, '').replace(/[^\w. -]+/g, '-')
}

/**
 * Creates a sanitized file path with browser info as directory.
 *
 * @param {string} name Base filename
 * @param {string} ext File extension
 * @param {string} [baseDir=reports] Base directory
 * @returns {Promise<string>} Resolves with the file path
 */
async function createFileName(name, ext, baseDir = 'reports') {
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
  await mkdir(dir, { recursive: true })
  return path.format({
    dir,
    name: sanitizeBaseName(name),
    ext
  })
}

/**
 * Saves a screenshot for the given name.
 *
 * @param {string} name Screenshot name
 */
async function saveScreenshotByName(name) {
  const options = Object.assign(
    { dir: 'reports/screenshots' },
    browser.config.screenshots
  )
  const fileName = await createFileName(name, '.png', options.dir)
  await browser.saveScreenshot(fileName)
}

/**
 * Saves a screenshot for the given test.
 *
 * @param {WebdriverIO.Test} test WebdriverIO Test
 */
async function saveScreenshotByTest(test) {
  const options = browser.config.screenshots || {}
  const fullTitle = test.fullTitle
  if (test.passed) {
    if (options.saveOnPass) await saveScreenshotByName(fullTitle + ' PASSED')
  } else {
    if (options.saveOnFail) await saveScreenshotByName(fullTitle + ' FAILED')
  }
}

/**
 * Saves and diffs a screenshot for the given name.
 *
 * @param {string} name Screenshot name
 * @returns {Promise<ImageDiffResult>} Resolves with the image diff results
 */
async function saveAndDiffScreenshot(name) {
  const options = Object.assign(
    { dir: 'reports/screenshots' },
    browser.config.screenshots
  )
  const fileName = await createFileName(name, '.png', options.dir)
  if (fs.existsSync(fileName)) {
    const [fileNameOriginal, fileNameDifference] = await Promise.all([
      createFileName(name + ' original', '.png', options.dir),
      createFileName(name + ' diff', '.png', options.dir)
    ])
    await rename(fileName, fileNameOriginal)
    await browser.saveScreenshot(fileName)
    const ssim = await imageDiff(
      fileNameOriginal,
      fileName,
      fileNameDifference,
      options.imageDiff
    ).catch(err => imageDiffLogger.error(err))
    if (!ssim) return
    if (ssim.All < 1) {
      imageDiffLogger.warn(name, ssim)
    } else {
      await Promise.all([unlink(fileNameOriginal), unlink(fileNameDifference)])
    }
    return ssim
  }
  await browser.saveScreenshot(fileName)
}

/**
 * Starts a streen recording for the given test.
 *
 * @param {WebdriverIO.Test} test WebdriverIO Test
 */
async function startScreenRecording(test) {
  const options = Object.assign(
    { dir: 'reports/videos', hostname: browser.config.hostname },
    browser.config.videos
  )
  if (!options.enabled) return
  const videoKey = browser.sessionId + ' ' + test.fullTitle
  const fileName = await createFileName(test.fullTitle, '.mp4', options.dir)
  const recording = recordScreen(fileName, options)
  screenRecordings.set(videoKey, { options, recording, fileName })
  recording.promise.catch(err => screenRecordingLogger.error(err))
  if (options.startDelay) await browser.pause(options.startDelay)
}

/**
 * Stops the screen recording for the given test.
 *
 * @param {WebdriverIO.Test} test WebdriverIO Test
 * @returns {Promise<RecordingResult>} Resolves with the recording result
 */
async function stopScreenRecording(test) {
  const videoKey = browser.sessionId + ' ' + test.fullTitle
  const currentRecording = screenRecordings.get(videoKey)
  if (currentRecording) {
    const { options, recording, fileName } = currentRecording
    screenRecordings.delete(videoKey)
    if (options.stopDelay) await browser.pause(options.stopDelay)
    recording.stop()
    await recording.promise.catch(() => {}) // Handled by start function
    if (test.passed && options.deleteOnPass) {
      await unlink(fileName)
    }
    return recording.promise
  }
}

module.exports = {
  saveScreenshotByName,
  saveScreenshotByTest,
  saveAndDiffScreenshot,
  startScreenRecording,
  stopScreenRecording
}
