const express = require("express");

const {signup,login, logout} = require("../controllers/auth");
const userAuth = require("../middleware/authroute");
const { getUserDetail } = require("../controllers/userControllers");
const upload = require('../middleware/upload');
const { getArticles, getArticleById, createArticle, updateArticle } = require('../controllers/articlesControllers');
const { getCategories } = require("../controllers/categoriesController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// user related api call 
router.get('/userdetails',userAuth,getUserDetail);
router.post('/getarticles',userAuth,getArticles);
router.post('/getarticlebyid', (req, res, next) => {
    console.log('getarticlebyid route matched');
    next();
},userAuth,getArticleById);
router.post('/getcategories',userAuth,getCategories);

router.post('/createarticle',userAuth,upload.single('cover_image'),createArticle);
router.post('/updatearticle/:id',userAuth,upload.single('cover_image'),updateArticle);
module.exports = router;