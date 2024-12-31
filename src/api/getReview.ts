import { Express } from 'express'
import { getReviewQueue, getUser, isStaff, userExists } from '../modules/database';
export default (app: Express) => {
    app.get("/api/v1/review", async (req, res) => {
        const auth = req.headers.authorization;

        if(!auth || !await userExists(auth) || !await isStaff(auth)){
            res.status(403).json({ success: false, message: "User cannot invoke method" })
            return
        }

        getReviewQueue().then((queue) => {
            res.status(200).json({ success: true, queue });
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to get review queue" });
        });
    })
    return {
        method: "GET",
        route: "/api/v1/review",
    }
}