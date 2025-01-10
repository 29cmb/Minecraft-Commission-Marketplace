import { Express } from 'express';
import { getPost, getUser, isStaff, userExists, postComment, postExists } from '../modules/database';
import { CommentData } from '../Types';
export default (app: Express) => {
    app.post("/api/v1/comment", async(req, res) => {
        if(!req.body || !req.headers){ 
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return 
        }
        const { id, comment } = req.body
        if(!id || typeof id !== "string" || !comment || typeof comment !== "string") {
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }
        const auth = req.headers.authorization;
        if(!auth || !await userExists(auth)){
            res.status(401).json({ success: false, message: "User cannot invoke method" })
            return
        }

        if(!await postExists(id)){
            res.status(404).json({ success: false, message: "Post not found" })
            return
        }

        const user = await getUser(auth);
        const post = await getPost(id);

        if(post.comments_enabled === false && !await isStaff(auth)){
            res.status(403).json({ success: false, message: "Comments are disabled for this post" })
            return
        }

        const data: CommentData = {
            post_id: id,
            content: comment,
            author: user.$id
        }

        postComment(data).then(() => {
            res.status(200).json({ success: true, message: "Comment posted successfully" })
            return
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message })
            return
        })
    })
    return {
        method: "POST",
        route: "/api/v1/comment",
    }
}