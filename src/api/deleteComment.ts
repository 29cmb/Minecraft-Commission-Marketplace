import { Express } from 'express'
import { commentExists, deleteComment, getComment, getUser, userExists } from '../modules/database'
export default (app: Express) => {
    app.post("/api/v1/delete-comment", async (req, res) => {
        if(!req.body){ 
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return 
        }
        const { id } = req.body
        if(!id || typeof id !== "string"){
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }
        
        const auth = req.headers.authorization

        if(!auth || !await userExists(auth)){
            res.status(403).json({ success: false, message: "User cannot invoke method" })
            return
        }

        if(!commentExists(id)){
            res.status(404).json({ success: false, message: "Comment not found" })
            return
        }

        const comment = await getComment(id)
        const user = await getUser(auth)

        if(comment.author !== user.$id){
            res.status(403).json({ success: false, message: "User cannot delete comment" })
            return
        }

        deleteComment(id).then(() => {
            res.status(200).json({ success: true, message: "Comment deleted successfully" })
            return
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message })
            return
        })
    })

    return {
        method: "POST",
        route: "/api/v1/delete-comment",
    }
}