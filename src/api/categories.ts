import { Express } from 'express';
import { getCategories } from '../modules/database';
export default (app: Express) => {
    app.get("/api/v1/categories", (req, res) => {
        getCategories().then((categories) => {
            res.status(200).json({ success: true, categories });
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to get categories" })
        })
    })
    return {
        method: "GET",
        route: "/api/v1/categories",
    }
}