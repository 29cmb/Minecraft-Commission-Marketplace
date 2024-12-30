import { Express } from 'express';
import { getPostsInSubcategory } from '../modules/database';
export default (app: Express) => {
    app.get("/api/v1/:sub/posts", (req, res) => {
        const { sub } = req.params;
        getPostsInSubcategory(sub).then((posts) => {
            res.status(200).json({ success: true, posts });
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to get posts" });
        })
    })
    return {
        method: "GET",
        route: "/api/v1/:sub/posts",
    }
}