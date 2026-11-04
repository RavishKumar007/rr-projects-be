const getImageUrl = (key) => {
    if (!key) return null;

    return `${process.env.CLOUDFRONT_URL}/${key}`;
};

module.exports = getImageUrl;