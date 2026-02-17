import ffmpeg from 'fluent-ffmpeg';
import { createLogger } from '@sym/fnd-logger';
import { ExternalServiceError } from '@sym/fnd-errors';

const log = createLogger('media');

/**
 * Transcode a video file.
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {Object} [options]
 * @param {string} [options.format='mp4']
 * @param {string} [options.videoCodec='libx264']
 * @param {string} [options.audioCodec='aac']
 * @param {string} [options.resolution]
 * @param {Function} [onProgress]
 * @returns {Promise<string>}
 */
export function transcodeVideo(inputPath, outputPath, options = {}, onProgress) {
    const { format = 'mp4', videoCodec = 'libx264', audioCodec = 'aac', resolution } = options;

    return new Promise((resolve, reject) => {
        let command = ffmpeg(inputPath).outputFormat(format).videoCodec(videoCodec).audioCodec(audioCodec);

        if (resolution) {
            command = command.size(resolution);
        }

        command
            .on('start', (cmd) => log.info('FFmpeg started', { command: cmd }))
            .on('progress', (progress) => {
                if (onProgress) onProgress(progress);
            })
            .on('end', () => {
                log.info('Transcode complete', { outputPath });
                resolve(outputPath);
            })
            .on('error', (err) => {
                log.error('Transcode error', { error: err.message });
                reject(new ExternalServiceError('FFmpeg', err.message));
            })
            .save(outputPath);
    });
}

/**
 * Generate a thumbnail from a video.
 * @param {string} inputPath
 * @param {string} outputDir
 * @param {Object} [options]
 * @param {number} [options.timestamp=1] - Seconds into video
 * @param {string} [options.size='320x240']
 * @param {string} [options.filename='thumbnail.png']
 * @returns {Promise<string>}
 */
export function generateThumbnail(inputPath, outputDir, options = {}) {
    const { timestamp = 1, size = '320x240', filename = 'thumbnail.png' } = options;

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .screenshots({
                timestamps: [timestamp],
                filename,
                folder: outputDir,
                size,
            })
            .on('end', () => {
                const outputPath = `${outputDir}/${filename}`;
                log.info('Thumbnail generated', { outputPath });
                resolve(outputPath);
            })
            .on('error', (err) => {
                log.error('Thumbnail error', { error: err.message });
                reject(new ExternalServiceError('FFmpeg', err.message));
            });
    });
}

/**
 * Get media file metadata (duration, resolution, codecs, etc.).
 * @param {string} inputPath
 * @returns {Promise<Object>}
 */
export function getMediaInfo(inputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                reject(new ExternalServiceError('FFmpeg', err.message));
                return;
            }
            resolve({
                duration: metadata.format.duration,
                size: metadata.format.size,
                bitrate: metadata.format.bit_rate,
                format: metadata.format.format_name,
                streams: metadata.streams.map((s) => ({
                    type: s.codec_type,
                    codec: s.codec_name,
                    width: s.width,
                    height: s.height,
                    fps: s.r_frame_rate,
                })),
            });
        });
    });
}
