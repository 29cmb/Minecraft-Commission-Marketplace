import { Express } from 'express'
import { createVerification, getUser, userExists } from '../modules/database';
export default (app: Express) => {
    app.post("/api/v1/verify-request", async (req, res) => {
        if(!req.body || !req.headers){ 
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return 
        }
        const auth = req.headers.authorization;

        if(!auth || !await userExists(auth)){
            res.status(401).json({ success: false, message: "User cannot invoke method" })
            return
        }
        createVerification(auth).then(() => {
            res.status(200).json({ success: true, message: "Verification request created" })
            return
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to create verification request" })
            return
        })
    })
    return {
        method: "POST",
        route: "/api/v1/verify-request",
    }
}