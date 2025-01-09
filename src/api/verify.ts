import { Express } from 'express'
import { updateVerification, userExists } from '../modules/database'
export default (app: Express) => {
    app.post("/api/v1/verify", async (req, res) => {
        if(!req.body){ 
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return 
        }
        const { secret, uid } = req.body
        const auth = req.headers.authorization;

        if (!secret || !uid || typeof secret !== "string" || typeof uid !== "string") {
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }

        if(!auth || !await userExists(auth)){
            res.status(403).json({ success: false, message: "User cannot invoke method" })
            return
        }

        updateVerification(uid, secret, auth).then(() => {
            res.status(200).json({ success: true, message: "Account verified successfully" })
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to verify account" })
        })
    })

    return {
        method: "POST",
        route: "/api/v1/verify",
    }
}