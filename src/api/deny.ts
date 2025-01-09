import { Express } from 'express'
import { isStaff, postExists, setApproved, userExists } from '../modules/database'
export default (app: Express) => {
    app.post("/api/v1/deny", async (req, res) => {
        if(!req.body){ 
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return 
        }
        const { id } = req.body
        if(!id || typeof id !== "string") {
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }

        const auth = req.headers.authorization;

        if(!await postExists(id)){
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        if(!auth || !await userExists(auth) || !await isStaff(auth)){
            res.status(403).json({ success: false, message: "User cannot invoke method" })
            return
        }
        
        setApproved(id, false).then(() => {
            res.status(200).json({ success: true, message: "Denied successfully" })
            return
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message })
            return
        })
    })
    return {
        method: "POST",
        route: "/api/v1/deny",
    }
}