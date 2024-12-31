import { Express } from 'express'
import { getLikes, userExists } from '../modules/database';
export default (app: Express) => {
    app.get("/api/v1/likes", async (req, res) => {
        const auth = req.headers.authorization;
        if(!auth || !await userExists(auth)){
            res.status(401).json({ success: false, message: "User cannot invoke method" })
            return
        }

        getLikes(auth).then((likes) => {
            res.status(200).json({ success: true, likes });
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to get likes" });
        });
    })
    return {
        method: "GET",
        route: "/api/v1/likes",
    }
}