import { Express } from 'express';
import { getPost, getPostComments, postExists } from '../modules/database';
import { CommentData } from '../Types';

export default (app: Express) => {
    app.get("/api/v1/post/:id", async (req, res) => {
        const { id } = req.params;
        if (!id || typeof id !== "string") {
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" });
            return;
        }

        if (!await postExists(id)) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }

        const post = await getPost(id);
        const commentsResponse = await getPostComments(id);
        post.comments = commentsResponse.documents || [];
        res.status(200).json({ success: true, post });
        console.log("GET /api/v1/post/:id success");
    });

    return {
        method: "GET",
        route: "/api/v1/post/:id",
    };
}