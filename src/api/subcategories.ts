import { Express } from 'express';
import { getSubcategories } from '../modules/database';
export default (app: Express) => {
    app.get("/api/v1/subcategories", (req, res) => {
        getSubcategories().then((subcategories) => {
            res.status(200).json({ success: true, subcategories });
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to get subcategories" });
        })
    })
    return {
        method: "GET",
        route: "/api/v1/subcategories",
    }
}