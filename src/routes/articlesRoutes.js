const express = require("express");

const {
    getArticles,
    getArticleBySlug,
    createArticle,
    updateArticle,
    deleteArticle
    
} = require("../controllers/articlesControllers");

const router = express.Router();


router.post("/", getArticles);
router.get("/:slug",getArticleBySlug);
router.post('/',createArticle);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);


module.exports = router;