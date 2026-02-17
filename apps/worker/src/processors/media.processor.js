import { createLogger } from '@sym/fnd-logger';
import { transcodeVideo, generateThumbnail } from '@sym/backend-media';

const log = createLogger('media-processor');

/**
 * Process a media transcoding job.
 * @param {Object} job
 * @param {Object} job.data - { inputPath, outputPath, options, generateThumb }
 */
export async function processMediaJob(job) {
    const { inputPath, outputPath, options = {}, generateThumb = false } = job.data;
    const startTime = Date.now();

    log.info('Processing media job', { inputPath, outputPath });

    try {
        // Transcode video
        await transcodeVideo(inputPath, outputPath, options);

        // Optionally generate thumbnail
        let thumbnailPath = null;
        if (generateThumb) {
            const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'));
            thumbnailPath = await generateThumbnail(inputPath, outputDir);
        }

        const duration = Date.now() - startTime;
        log.info('Media job completed', { outputPath, duration: `${duration}ms` });

        return { outputPath, thumbnailPath, duration };
    } catch (err) {
        log.error('Media job failed', { inputPath, error: err.message });
        throw err;
    }
}
