/*
 * Webdriver.io commands to capture and record browser screens.
 *
 * Copyright 2019, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

// @ts-check
'use strict'

/* global browser */

const fs = require('fs')
const path = require('path')
const logger = require('@wdio/logger').default
const imageDiffLogger = logger('image-diff')
const screenRecordingLogger = logger('screen-recording')
const imageDiff = require('ffmpeg-image-diff')
const ffmpegRecordScreen = require('record-screen')
const adbRecordScreen = require('adb-record-screen')
const screenRecordings = new Map()

/**
 * @typedef {Object} Result
 * @property {string} stdout Screen recording standard output
 * @property {string} stderr Screen recording error output
 */

/**
 * @typedef {Object} Recording
 * @property {Promise<Result>} promise Promise for the active screen recording
 * @property {function} stop Function to stop the screen recording
 */

/**
 * @typedef {Object} Options Screen recording options
 * @property {string} [hostname=localhost] Server hostname
 * @property {number} [port=5555] Server port, defaults to 9000 for ffmpeg
 * @property {string} [loglevel=info] Log verbosity level
 * @property {string} [inputFormat=x11grab] Input format
 * @property {string} [resolution] Display resolution (WIDTHxHEIGHT)
 * @property {number} [fps=15] Frames per second to record from input
 * @property {string} [videoCodec] Video codec
 * @property {string} [pixelFormat=yuv420p] Output pixel format
 * @property {number} [rotate] Rotate metadata, set to 90 to rotate left by 90°
 * @property {string} [display=0] X11 server display
 * @property {string} [protocol=http] Server protocol
 * @property {string} [username] Basic auth username
 * @property {string} [password] Basic auth password
 * @property {string} [pathname] URL path component
 * @property {string} [search] URL query parameter
 * @property {string} [serial] Use device with given serial
 * @property {string} [transportID] Use device with given transport ID
 * @property {number} [waitTimeout=5000] Device wait timeout (ms)
 * @property {boolean} [bugreport] If `true` adds additional info to the video
 * @property {string} [size] WIDTHxHEIGHT, defaults to native device resolution
 * @property {number} [bitRate=4000000] Bits per second, default is 4Mbps
 * @property {number} [timeLimit=180] Time limit (s), maximum is 180 (3 mins)
 * @property {number} [pullDelay=200] Delay (ms) before pulling the video file
 */

/**
 * Starts a screen recording via ffmpeg or adb shell screenrecord.
 * @param {string} fileName Output file name
 * @param {Options} [options] Screen recording options
 * @returns {Recording}
 */
function recordScreen (fileName, options) {
  // The ffmpeg version requires either inputFormat or resolution to be set,
  // neither of which are options for the adb version:
  if (options.inputFormat || options.resolution) {
    return ffmpegRecordScreen(fileName, options)
  }
  return adbRecordScreen(fileName, options)
}

/**
 * Sanitizes the basename of a file path.
 * @param {string} str Input string
 * @returns {string}
 */
function sanitizeBaseName (str) {
  // Remove non-word characters from the start and end of the string.
  // Replace everything but word characters, dots and spaces with a dash.
  return str.replace(/^\W+|\W+$/g, '').replace(/[^\w. -]+/g, '-')
}

/**
 * Creates a sanitized file path with browser info as directory.
 * @param {string} name Base filename
 * @param {string} ext File extension
 * @param {string} [baseDir=reports] Base directory
 * @returns {string}
 */
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

/**
 * Saves a screenshot for the given name.
 * @param {string} name Screenshot name
 */
function saveScreenshotByName (name) {
  const options = Object.assign(
    { dir: 'reports/screenshots' },
    browser.config.screenshots
  )
  const fileName = createFileName(name, '.png', options.dir)
  browser.saveScreenshot(fileName)
}

/**
 * Saves a screenshot for the given test.
 * @param {WebdriverIO.Test} test WebdriverIO Test
 */
function saveScreenshotByTest (test) {
  const options = browser.config.screenshots || {}
  const fullTitle = test.fullTitle || test.fullName
  if (test.passed) {
    if (options.saveOnPass) saveScreenshotByName(fullTitle + ' PASSED')
  } else {
    if (options.saveOnFail) saveScreenshotByName(fullTitle + ' FAILED')
  }
}

/**
 * @typedef ImageDiffResult
 * @property {number} [R] Red color differences
 * @property {number} [G] Green color differences
 * @property {number} [B] blue color differences
 * @property {number} [All] All color differences
 */

/**
 * Saves and diffs a screenshot for the given name.
 * @param {string} name Screenshot name
 * @returns {Promise<ImageDiffResult>}
 */
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
      // @ts-ignore ignore error function not being declared
    ).catch(err => imageDiffLogger.error(err))
    if (!ssim) return
    if (ssim.All < 1) {
      // @ts-ignore ignore warn function not being declared
      imageDiffLogger.warn(name, ssim)
    } else {
      fs.unlinkSync(fileNameOriginal)
      fs.unlinkSync(fileNameDifference)
    }
    return ssim
  } else {
    browser.saveScreenshot(fileName)
  }
}

/**
 * Starts a streen recording for the given test.
 * @param {WebdriverIO.Test} test WebdriverIO Test
 */
function startScreenRecording (test) {
  const options = Object.assign(
    { dir: 'reports/videos', hostname: browser.config.hostname },
    browser.config.videos
  )
  if (!options.enabled) return
  const fullTitle = test.fullTitle || test.fullName
  const videoKey = browser.sessionId + ' ' + fullTitle
  const fileName = createFileName(fullTitle, '.mp4', options.dir)
  const recording = recordScreen(fileName, options)
  options.recording = recording
  options.fileName = fileName
  screenRecordings.set(videoKey, options)
  // @ts-ignore ignore error function not being declared
  recording.promise.catch(err => screenRecordingLogger.error(err))
  if (options.startDelay) browser.pause(options.startDelay)
}

/**
 * Stops the screen recording for the given test.
 * @param {WebdriverIO.Test} test WebdriverIO Test
 * @returns {Promise<Result>}
 */
async function stopScreenRecording (test) {
  const videoKey = browser.sessionId + ' ' + (test.fullTitle || test.fullName)
  const options = screenRecordings.get(videoKey)
  if (options) {
    const recording = options.recording
    screenRecordings.delete(videoKey)
    if (options.stopDelay) browser.pause(options.stopDelay)
    recording.stop()
    await recording.promise.catch(_ => {}) // Handled by start function
    if (test.passed && options.deleteOnPass) {
      fs.unlinkSync(options.fileName)
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
