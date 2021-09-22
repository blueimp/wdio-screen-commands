export type ADBOptions = import('adb-record-screen').Options;
export type FFmpegOptions = import('record-screen').Options;
export type Recording = import('record-screen').Recording;
export type RecordingResult = import('record-screen').Result;
export type ImageDiffOptions = import('ffmpeg-image-diff').Options;
export type ImageDiffResult = import('ffmpeg-image-diff').Result;
export type WebdriverIOTest = import('@wdio/types').Frameworks.Test;
export type WebdriverIOTestResult = import('@wdio/types').Frameworks.TestResult;
/**
 * Screenshot options
 */
export type ScreenshotOptions = {
    /**
     * Screenshots directory
     */
    dir?: string;
    /**
     * Automatically save screenshots on test fail
     */
    saveOnFail?: boolean;
    /**
     * Automatically save screenshots on test pass
     */
    saveOnPass?: boolean;
    /**
     * Image diffing options
     */
    imageDiff?: ImageDiffOptions;
};
/**
 * Video recording options
 */
export type RecordingOptions = {
    /**
     * Videos directory
     */
    dir?: string;
    /**
     * Set to true to enable video recordings
     */
    enabled?: boolean;
    /**
     * Deletes screen recordings on pass if true
     */
    deleteOnPass?: boolean;
    /**
     * Delay in ms after starting the recording
     */
    startDelay?: number;
    /**
     * Delay in ms before stopping the recording
     */
    stopDelay?: number;
};
export type VideoOptions = FFmpegOptions & ADBOptions & RecordingOptions;
/**
 * Saves a screenshot for the given name.
 *
 * @param {string} name Screenshot name
 */
export function saveScreenshotByName(name: string): Promise<void>;
/**
 * Saves a screenshot for the given test.
 *
 * @param {WebdriverIOTest} test WebdriverIO Test
 * @param {WebdriverIOTestResult} result WebdriverIO Test result
 */
export function saveScreenshotByTest(test: WebdriverIOTest, result: WebdriverIOTestResult): Promise<void>;
/**
 * Saves and diffs a screenshot for the given name.
 *
 * @param {string} name Screenshot name
 * @returns {Promise<ImageDiffResult>} Resolves with the image diff results
 */
export function saveAndDiffScreenshot(name: string): Promise<ImageDiffResult>;
/**
 * Starts a streen recording for the given test.
 *
 * @param {WebdriverIOTest} test WebdriverIO Test
 */
export function startScreenRecording(test: WebdriverIOTest): Promise<void>;
/**
 * Stops the screen recording for the given test.
 *
 * @param {WebdriverIOTest} test WebdriverIO Test
 * @param {WebdriverIOTestResult} result WebdriverIO Test result
 * @returns {Promise<RecordingResult>} Resolves with the recording result
 */
export function stopScreenRecording(test: WebdriverIOTest, result: WebdriverIOTestResult): Promise<RecordingResult>;
