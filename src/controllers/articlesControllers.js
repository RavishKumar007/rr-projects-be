const Articles = require('../models/articlesModel');
const pool = require('../config/database');
const validateArticle = require('../validators/articleValidator')
const { uploadToS3, deleteFromS3 } = require('../utils/uploadToS3')
const getImageUrl = require('../utils/getImageUrl');

const getArticles = async (req, res) => {
    try {
        //console.log("articles accessing")
        const body = req.body;
        const { limit, offset, search } = body;
        console.log("val ",limit, offset, search)
        const { articles, counts } = await Articles.getAllArticales(limit,offset,search);
        //    const published = articles.articles.filter((val,i)=>val.status == 'published');
        //    const drafted = articles.articles.filter((val)=> val.status == 'draft');
        
        const formattedArticles = articles.map(article => ({
            ...article,
            cover_image: getImageUrl(article.cover_image)
        }));
        
        res.status(200).json({
            status: 200,
            articles: formattedArticles,
            counts: counts
        })
    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: 500,
            message: "Failed to fetch articles"
        });

    }
}

const getArticleById = async (req, res) => {
    try {
        const { id } = req.body;
        console.log("id : ",id)
        const article = await Articles.getArticleById(id);
        if (!article) {
            return res.status(404).json({
                status: 404,
                message: "Article not found"
            });
        }

        res.status(200).json({
            status: 200,
            data: {
                ...article,
                cover_image: getImageUrl(article.cover_image)
            }
        });

    } catch (error) {
        //console.log(error)
        res.status(500).json({
            status: 500,
            message: "Failed to fetch article"
        });
    }
}

const getArticle = async (req, res) => {
    try {
        const { slug } = req.params;
        const article = await Articles.getArticleBySlug(slug);
        if (!article) {
            return res.status(404).json({
                status: 404,
                message: "Article not found"
            });
        }

        res.status(200).json({
            status: 200,
            data:  {
                ...article,
                cover_image: getImageUrl(article.cover_image)
            }
        });

    } catch (error) {
        //console.log(error)
        res.status(500).json({
            status: 500,
            message: "Failed to fetch article"
        });
    }
}

const createArticle = async (req, res) => {
    try {
        console.log(req.body); // Text fields
        console.log(req.file); // Uploaded file
        const error = await validateArticle(req.body, pool);

        if (error) {
            return res.status(400).json({
                status: 400,
                message: error
            });
        }
        // 2. Upload cover image to S3
        let coverImage = null;
        if (req.file) {
            coverImage = await uploadToS3(req.file, {
                width: 1600,
                quality: 80
            });
        }
        // 3. Save article and S3 image key in PostgreSQL
        const article = await Articles.createArticle({
            ...req.body,
            cover_image: coverImage,
            status: req.body.status ?? "draft",
            category_id: Number(req.body.category_id)
        });

        res.status(201).json({
            status: 201,
            data: {
                ...article,
                cover_image: getImageUrl(article.cover_image)
            }
        });

    } catch (error) {
        console.error(error);

                // Remove uploaded image if article creation fails
        if (coverImage) {
            await deleteFromS3(coverImage).catch(console.error);
        }

        // PostgreSQL unique constraint violation
        if (error.code === "23505") {
            return res.status(409).json({
                status: 409,
                message: "An article with this slug already exists"
            });
        }

        return res.status(500).json({
            status: 500,
            message: "Failed to create article"
        });
    }
};

const updateArticle = async (req, res) => {
    let newImageKey = null;

    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                status: 400,
                message: "Invalid article ID"
            });
        }

        const error = await validateArticle(req.body, pool);

        if (error) {
            return res.status(400).json({
                status: 400,
                message: error
            });
        }
        const existingArticle = await Articles.getArticleById(req.params.id);
        if (!existingArticle) {
            return res.status(404).json({
                message: 'Article not found'
            });
        }

        // Upload replacement image, if provided
        if (req.file) {
            newImageKey = await uploadToS3(req.file, {
                width: 1600,
                quality: 80
            });
        }

        const article = await Articles.updateArticle(id, {
            ...req.body,
            cover_image: newImageKey ?? existingArticle.cover_image,
            category_id: Number(req.body.category_id)
        });

        if (!article) {
            return res.status(404).json({
                status: 404,
                message: "Article not found"
            });
        }

        // Delete old image only after successful DB update
        if (newImageKey && existingArticle.cover_image) {
            await deleteFromS3(existingArticle.cover_image);
        }

        res.status(200).json({
            status: 200,
            data: {
                ...article,
                cover_image: getImageUrl(article.cover_image)
            }
        });
    } catch (error) {
        // Clean up newly uploaded image if the DB update fails
        if (newImageKey) {
            await deleteFromS3(newImageKey).catch(console.error);
        }

        console.error(error);

        return res.status(500).json({
            message: 'Failed to update article'
        });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const article = await Articles.getArticleById(req.params.id);

        if (!article) {
            return res.status(404).json({
                message: 'Article not found'
            });
        }

        await Articles.deleteArticle(req.params.id);

        if (article.cover_image) {
            await deleteFromS3(article.cover_image);
        }

        return res.status(200).json({
            status: 200,
            message: 'Article deleted successfully'
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to delete article'
        });
    }
};

module.exports = {
    getArticles,
    getArticleById,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle
}