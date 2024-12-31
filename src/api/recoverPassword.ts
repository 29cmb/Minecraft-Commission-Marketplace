import { Express } from 'express'
import { createRecovery } from '../modules/database'
export default (app: Express) => {
    app.post("/api/v1/reset-password", (req, res) => {
        const { email } = req.body
        if(!email || typeof email !== "string"){
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }

        createRecovery(email).then(() => {
            res.status(200).json({ success: true, message: "Recovery email sent" })
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to send recovery email" })
        })
    })
    return {
        method: "POST",
        route: "/api/v1/reset-password",
    }
}