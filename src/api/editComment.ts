import { Express } from 'express'
import { commentExists, editComment, getComment, getUser, userExists } from '../modules/database';
export default (app: Express) => {
    app.post("/api/v1/edit-comment", async (req, res) => {
        const { id, content } = req.body;
        if(!id || !content || typeof id !== "string" || typeof content !== "string"){
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }

        const auth = req.headers.authorization;
        if(!auth || !await userExists(auth)){
            res.status(401).json({ success: false, message: "User cannot invoke method" })
            return
        }
        
        if(!await commentExists(id)){
            res.status(404).json({ success: false, message: "Comment not found" })
            return
        }

        const user = await getUser(auth)
        const comment = await getComment(id)

        if(comment.author !== user.$id){
            res.status(403).json({ success: false, message: "User cannot edit comment" })
            return
        }

        editComment(id, content).then(() => {
            res.status(200).json({ success: true, message: "Comment updated successfully" })
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to update comment" })
        })
    })
    return {
        method: "POST",
        route: "/api/v1/edit-comment",
    }
}