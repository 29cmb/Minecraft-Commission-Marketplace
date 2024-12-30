import { Express } from 'express'
import { isStaff, setApproved, userExists } from '../modules/database'
export default (app: Express) => {
    app.post("/api/v1/approve", async (req, res) => {
        const { id } = req.body
        if(!id || typeof id !== "string") {
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }

        const auth = req.headers.authorization?.substring(7);

        if(!auth || !await userExists(auth) || !await isStaff(auth)){
            res.status(400).json({ success: false, message: "User cannot invoke method" })
            return
        }
        
        setApproved(id, true).then(() => {
            res.status(200).json({ success: true, message: "Approved successfully" })
            return
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message })
            return
        })
    })
    return {
        method: "POST",
        route: "/api/v1/approve",
    }
}