const {
    PutObjectCommand,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3');

const sharp = require('sharp');
const crypto = require('crypto');

const s3 = require('../config/s3');

// Upload and optimize image
const uploadToS3 = async (file, options = {}) => {
    const {
        width = 1600,
        quality = 80
    } = options;

    // Resize and convert image to WebP
    const optimizedBuffer = await sharp(file.buffer)
        .rotate()
        .resize({
            width,
            withoutEnlargement: true
        })
        .webp({
            quality
        })
        .toBuffer();

    // Generate unique S3 object key
    const key = `articles/${crypto.randomUUID()}.webp`;

    // Upload optimized image to S3
    await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable'
    }));

    return key;
};


// Delete image from S3
const deleteFromS3 = async (key) => {
    if (!key) return;

    await s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    }));
};


module.exports = {
    uploadToS3,
    deleteFromS3
};