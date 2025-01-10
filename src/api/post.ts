import { Express } from 'express';
import { getUser, isStaff, postToQueue, userExists } from '../modules/database';
export default (app: Express) => {
    app.post("/api/v1/post", async(req, res) => {
        if(!req.body || !req.headers){ 
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return 
        }

        const { 
            title, 
            short_description, 
            long_description, 
            comments_enabled, 
            tags, 
            discord_contact, 
            portfolio_link, 
            payment, 
            post_category, 
            subcategory
        } = req.body

        const auth = req.headers.authorization;

        if(!auth || !await userExists(auth)){
            res.status(401).json({ success: false, message: "User cannot invoke method" })
            return
        }

        const user = await getUser(auth);

        // oh no I have to type check all of these don't I

        if(
            !title
            || !short_description
            || !long_description
            || !comments_enabled
            || !post_category
            || !subcategory
            || !discord_contact
            || typeof title !== "string"
            || typeof short_description !== "string"
            || typeof long_description !== "string"
            || typeof comments_enabled !== "boolean"
            || typeof discord_contact !== "string"
            || (tags && !Array.isArray(tags) && tags.some((tag: any) => typeof tag !== "string") && tags.length > 6)
            || (portfolio_link && (typeof portfolio_link !== "string" || !portfolio_link.startsWith("http")))
            || (payment && typeof payment !== "number")
            || typeof post_category !== "string"
            || typeof subcategory !== "string"
            || (payment && payment < 0)
        ){
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return
        }

        if(post_category == "announcement" && !await isStaff(auth)){
            res.status(403).json({ success: false, message: "User cannot create announcements" })
            return
        }

        postToQueue({title, short_description,long_description,comments_enabled,tags,discord_contact,portfolio_link,payment,post_category,subcategory,author: user.$id}, await isStaff(auth)).then(() => {
            res.status(200).json({ success: true, message: "Post submitted to the review queue successfully!" });
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.message || "Failed to submit post" });
        })
    })
    return {
        method: "POST",
        route: "/api/v1/post",
    }
}