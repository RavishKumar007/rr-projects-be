const pool = require("../config/database");

const Articles = {
    async getAllPublishedArticales(limit){
        const { rows } = await pool.query(
            `SELECT 
                a.id,
                a.slug,
                a.title,
                a.excerpt,
                a.content,
                a.cover_image,
                a.read_time,
                a.published_at,
                c.name AS category_name,
                c.slug AS category_slug
            FROM articles AS a
            LEFT JOIN categories AS c
                ON a.category_id = c.id
            WHERE a.status = 'published'
            ORDER BY 
                a.published_at DESC NULLS LAST,
                a.created_at DESC
            LIMIT $1`,
            [limit]
            );

        return rows;
    },
     async getAllArticales(limit,offset,search){
        let query = '';
        if(search){
            query = ` WHERE a.title ILIKE $3`;
        }
        const [article, count] = await Promise.all([
            pool.query(
            `SELECT 
                a.id,
                a.status,
                a.slug,
                a.title,
                a.excerpt,
                a.content,
                a.cover_image,
                a.read_time,
                a.published_at,
                c.name AS category_name,
                c.slug AS category_slug
            FROM articles AS a
            LEFT JOIN categories AS c
                ON a.category_id = c.id
            ${query}
            ORDER BY 
                a.created_at DESC
            LIMIT $1 OFFSET $2`,
            search ? [limit, offset, `%${search}%`] : [limit, offset]

            ),
            pool.query(
                `SELECT
        COUNT(*) FILTER (WHERE status = 'published') AS published,
        COUNT(*) FILTER (WHERE status = 'draft') AS drafted,
        COUNT(*) AS total
    FROM articles`
            )
        ]);

        return {
            articles: article.rows,
            counts: count.rows[0]
        };
    },

    
    async getArticleBySlug(slug) {
        const { rows } = await pool.query(
            `SELECT
                a.id,
                a.title,
                a.slug,
                a.excerpt,
                a.content,
                a.cover_image,
                a.published_at,
                a.created_at,
                c.name AS category_name,
                c.slug AS category_slug
            FROM articles AS a
            LEFT JOIN categories AS c
                ON a.category_id = c.id
            WHERE a.slug = $1
            AND a.status = 'published'
            LIMIT 1`,
            [slug]
        );

        return rows[0] || null;
    },

      
    async getArticleById(id) {
        const { rows } = await pool.query(
            `SELECT
                a.id,
                a.title,
                a.status,
                a.slug,
                a.excerpt,
                a.content,
                a.cover_image,
                a.published_at,
                a.created_at,
                c.name AS category_name,
                c.slug AS category_slug,
                c.id AS category_id
            FROM articles AS a
            LEFT JOIN categories AS c
                ON a.category_id = c.id
            WHERE a.id = $1
            LIMIT 1`,
            [id]
        );

        return rows[0] || null;
    },
        
    async createArticle(article) {
        const {
            title,
            slug,
            excerpt,
            content,
            cover_image,
            category_id,
            status
        } = article;

        const { rows } = await pool.query(
            `INSERT INTO articles (
                title,
                slug,
                excerpt,
                content,
                cover_image,
                category_id,
                status,
                published_at
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7,
                CASE
                    WHEN $7::VARCHAR = 'published'
                    THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END
            )
            RETURNING *`,
            [
                title,
                slug,
                excerpt ?? null,
                content,
                cover_image ?? null,
                category_id,
                status
            ]
        );

        return rows[0];
    },

            

    async updateArticle(id, article) {
        const {
            title,
            slug,
            excerpt,
            content,
            cover_image,
            category_id,
            status
        } = article;

        const { rows } = await pool.query(
            `UPDATE articles
            SET
                title = $1,
                slug = $2,
                excerpt = $3,
                content = $4,
                cover_image = $5,
                category_id = $6,
                status = $7,
                published_at = CASE
                    WHEN $7::VARCHAR = 'published'
                        AND published_at IS NULL
                        THEN CURRENT_TIMESTAMP
                    WHEN $7::VARCHAR = 'draft'
                        THEN NULL
                    ELSE published_at
                END
            WHERE id = $8
            RETURNING *`,
            [
                title,
                slug,
                excerpt ?? null,
                content,
                cover_image ?? null,
                category_id,
                status,
                id
            ]
        );

        return rows[0] || null;
    },

    async deleteArticle(id) {
        const { rows } = await pool.query(
            `DELETE FROM articles
            WHERE id = $1
            RETURNING id`,
            [id]
        );

        return rows[0] || null;
    }





};



module.exports = Articles;