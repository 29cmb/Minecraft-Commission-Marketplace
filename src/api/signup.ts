import { Express } from "express"
import { signup } from "../modules/database"
export default (app: Express) => {
    app.post("/api/v1/signup", (req, res) => {
        if(!req.body){ 
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return 
        }
        const { email, username, password } = req.body
        if (
            !email 
            || !username 
            || !password 
            || typeof email !== "string"
            || typeof username !== "string"
            || typeof password !== "string"
        ) {
            res.status(400).json({ success: false, message: "Required fields not provided or not formatted properly" })
            return;
        }

        if(username.length < 3 || username.length > 32) {
            res.status(400).json({ success: false, message: "Username must be at least 3 characters long and must not be over 32 characters" })
            return;
        }

        if(password.length < 6) {
            res.status(400).json({ success: false, message: "Password must be at least 6 characters long" })
            return;
        }

        signup(email, username, password).then(() => {
            res.status(200).json({ success: true, message: "Signed up successfully" })
            return;
        }).catch((error) => {
            res.status(400).json({ success: false, message: error.response.message })
            return;
        })
    })
    return {
        method: "POST",
        route: "/api/v1/signup",
    }
}