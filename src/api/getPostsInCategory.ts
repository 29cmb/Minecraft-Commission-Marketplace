import { Express } from 'express'
import { categoryExists, getPostsInCategory } from '../modules/database'
export default (app: Express) => {
    app.get("/api/v1/posts/category/:category", (req, res) => {
        const category = req.params.category

        if(!category || typeof category !== "string") {
            res.status(400).json({ success: false, message: "Invalid category" })
            return
        }

        if(!categoryExists(category)) {
            res.status(404).json({ success: false, message: "Category does not exist" })
        }

        getPostsInCategory(category).then((posts) => {
            res.status(200).json({ success: true, posts })
        }).catch(err => {
            res.status(400).json({ success: false, message: err.message || "Failed to get posts in category" })
        })
    })
    return {
        method: "GET",
        route: "/api/v1/posts/category/:category",
    }
}