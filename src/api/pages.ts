import { Express } from 'express'
import { subcategoryPages } from '../modules/database'
export default (app: Express) => {
    app.get("/api/v1/pages/:sub", (req, res) => {
        const { sub } = req.params
        subcategoryPages(sub).then((pages) => {
            res.status(200).json({ success: true, pages })
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to get pages" })
        })
    })
    return {
        method: "GET",
        route: "/api/v1/pages",
    }
}