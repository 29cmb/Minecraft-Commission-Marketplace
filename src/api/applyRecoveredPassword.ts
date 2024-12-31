import { Express } from 'express'
import { updateRecovery } from '../modules/database'

export default (app: Express) => {
    app.post("/api/v1/apply-recover", (req, res) => {
        const { uid, secret, password } = req.body
        if(!uid || !secret || typeof uid !== "string" || typeof secret !== "string" || !password || typeof password !== "string"){
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }

        updateRecovery(uid, secret, password).then(() => {
            res.status(200).json({ success: true, message: "Password reset successfully" })
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to reset password" })
        })
    })
    return {
        method: "POST",
        route: "/api/v1/apply-recover"
    }
}