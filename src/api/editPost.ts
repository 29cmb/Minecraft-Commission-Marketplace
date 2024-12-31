import { Express } from 'express'
import { getPost, getUser, updatePost, userExists } from '../modules/database'
export default (app: Express) => {
    app.post("/api/v1/editPost", async (req, res) => {
        const { id, newPostData } = req.body
        const auth = req.headers.authorization

        if(!id || !newPostData || typeof id !== "string" || typeof newPostData !== "object") {
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }

        const post = await getPost(id)
        if(!post){
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        if(!auth || !userExists(auth)){
            res.status(401).json({ success: false, message: "User cannot invoke method" })
            return
        }

        const user = await getUser(auth)
        if(user.$id !== post.author){
            res.status(403).json({ success: false, message: "User cannot edit post" })
            return
        }

        updatePost(id, newPostData).then(() => {
            res.status(200).json({ success: true, message: "Post updated successfully" })
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to update post" })
        })
    })

    return {
        method: "POST",
        route: "/api/v1/editPost",
    }
}