import { Express } from 'express';
import { getUser, userExists } from '../modules/database';
export default (app: Express) => {
    app.get("/api/v1/user", (req, res) => {
        const auth = req.headers.authorization;
        if(!auth || !userExists(auth)){
            res.status(401).json({ success: false, message: "User cannot invoke method" })
            return
        }

        getUser(auth).then((user) => {
            res.status(200).json({ success: true, message: "User is authenticated", user })
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message })
        })
    })
    return {
        method: "GET",
        route: "/api/v1/user"
    }
}