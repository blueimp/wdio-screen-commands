export type ADBOptions = {
    serial?: string;
    transportID?: string;
    hostname?: string;
    port?: number;
    waitTimeout?: number;
    bugreport?: boolean;
    size?: string;
    bitRate?: number;
    timeLimit?: number;
    pullDelay?: number;
};
export type FFmpegOptions = {
    loglevel?: string;
    inputFormat?: string;
    resolution?: string;
    fps?: number;
    videoFilter?: string;
    videoCodec?: string;
    pixelFormat?: string;
    rotate?: number;
    hostname?: string;
    display?: string;
    protocol?: string;
    username?: string;
    password?: string;
    port?: number;
    pathname?: string;
    search?: string;
};
export type Recording = {
    promise: Promise<import("record-screen").Result>;
    stop: Function;
};
export type RecordingResult = {
    stdout: string;
    stderr: string;
};
export type ImageDiffOptions = {
    ssim?: boolean;
    similarity?: number;
    blend?: number;
    opacity?: number;
    color?: string;
};
export type ImageDiffResult = {
    R?: number;
    G?: number;
    B?: number;
    All?: number;
};
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
    imageDiff?: import("ffmpeg-image-diff").Options;
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
export type VideoOptions = import("record-screen").Options & import("adb-record-screen").Options & RecordingOptions;
/**
 * Saves a screenshot for the given name.
 *
 * @param {string} name Screenshot name
 */
export function saveScreenshotByName(name: string): Promise<void>;
/**
 * Saves a screenshot for the given test.
 *
 * @param {WebdriverIO.Test} test WebdriverIO Test
 */
export function saveScreenshotByTest(test: WebdriverIO.Test): Promise<void>;
/**
 * Saves and diffs a screenshot for the given name.
 *
 * @param {string} name Screenshot name
 * @returns {Promise<ImageDiffResult>} Resolves with the image diff results
 */
export function saveAndDiffScreenshot(name: string): Promise<import("ffmpeg-image-diff").Result>;
/**
 * Starts a streen recording for the given test.
 *
 * @param {WebdriverIO.Test} test WebdriverIO Test
 */
export function startScreenRecording(test: WebdriverIO.Test): Promise<void>;
/**
 * Stops the screen recording for the given test.
 *
 * @param {WebdriverIO.Test} test WebdriverIO Test
 * @returns {Promise<RecordingResult>} Resolves with the recording result
 */
export function stopScreenRecording(test: WebdriverIO.Test): Promise<import("record-screen").Result>;
