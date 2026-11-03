const Category = require('../models/categoriesModel');
const validateCategory = require("../validators/categoriesValidator");

const getCategories = async (req,res)=> {
    try {
        const data = await Category.getCategories();

        res.status(200).json({
            status : 200,
            data : data
        })

    } catch(err) {
        //console.log(err);
                res.status(500).json({
            status: 500,
            message: "Failed to fetch categories"
        });
    }
}


const getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.getCategoryBySlug(req.params.slug);

        if (!category) {
            return res.status(404).json({
                status: 404,
                message: "Category not found"
            });
        }

        res.status(200).json({
            status: 200,
            data: category
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to fetch category"
        });
    }
};


const getArticlesByCategory = async (req, res) => {
    try {
        const articles = await Category.getArticlesByCategorySlug(
            req.params.slug
        );

        res.status(200).json({
            status: 200,
            data: articles
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to fetch articles in category"
        });
    }
};


const createCategory = async (req, res) => {
    try {
        const { name, slug, description } = req.body;

        if (!name?.trim() || !slug?.trim()) {
            return res.status(400).json({
                status: 400,
                message: "Name and slug are required"
            });
        }

        const category = await Category.createCategory({
            name: name.trim(),
            slug: slug.trim(),
            description
        });

        res.status(201).json({
            status: 201,
            data: category
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                status: 409,
                message: "Category slug already exists"
            });
        }

        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to create category"
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, slug, description } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                status: 400,
                message: "Invalid category ID"
            });
        }

        if (!name?.trim() || !slug?.trim()) {
            return res.status(400).json({
                status: 400,
                message: "Name and slug are required"
            });
        }

        const category = await Category.updateCategory(id, {
            name: name.trim(),
            slug: slug.trim(),
            description
        });

        if (!category) {
            return res.status(404).json({
                status: 404,
                message: "Category not found"
            });
        }

        res.status(200).json({
            status: 200,
            data: category
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                status: 409,
                message: "Category slug already exists"
            });
        }

        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to update category"
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                status: 400,
                message: "Invalid category ID"
            });
        }

        const category = await Category.deleteCategory(id);

        if (!category) {
            return res.status(404).json({
                status: 404,
                message: "Category not found"
            });
        }

        res.status(200).json({
            status: 200,
            message: "Category deleted successfully"
        });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({
                status: 409,
                message: "Cannot delete a category that has articles"
            });
        }

        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to delete category"
        });
    }
};

module.exports = {
    getCategories,
    getCategoryBySlug,
    getArticlesByCategory,
    createCategory,
    updateCategory,
    deleteCategory
}