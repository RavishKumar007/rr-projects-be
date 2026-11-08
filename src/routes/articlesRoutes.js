const express = require("express");

const {
    getAllPublishedArticales,
    getArticleBySlug,
    createArticle,
    updateArticle,
    deleteArticle
    
} = require("../controllers/articlesControllers");

const router = express.Router();


router.post("/", getAllPublishedArticales);
router.get("/:slug",getArticleBySlug);
router.post('/',createArticle);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);


module.exports = router;