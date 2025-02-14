import { Express } from 'express'
import { deletePost, getPost, getUser, postExists, userExists } from '../modules/database'
import { PostData } from '../Types'
export default (app: Express) => {
    app.post("/api/v1/deletePost", async(req, res) => {
        if(!req.body || !req.headers){ 
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return 
        }
        const { id } = req.body
        if(!id || typeof id !== "string") {
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }

        const auth = req.headers.authorization

        if(!auth || !await userExists(auth)){
            res.status(403).json({ success: false, message: "User cannot invoke method" })
            return
        }

        if(!await postExists(id)){
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        const user = await getUser(auth);
        const post: PostData = await getPost(id);

        if(post.author !== user.$id){
            res.status(403).json({ success: false, message: "User cannot delete post" })
            return
        }

        deletePost(id).then(() => {
            res.status(200).json({ success: true, message: "Post deleted successfully" })
            return
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message })
            return
        })
    })
    return {
        method: "POST",
        route: "/api/v1/deletePost",
    }
}