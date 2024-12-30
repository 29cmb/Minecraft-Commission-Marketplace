import { Express } from "express"
import { login } from "../modules/database"
export default (app: Express) => {
    app.post("/api/v1/login", (req, res) => {
        const { username, password } = req.body
        if (
            !username 
            || !password 
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

        login(username, password)
            .then((response) => {
                res.status(200).json({ success: true, message: "Logged in successfully", secret: response.secret });
            })
            .catch((error) => {
                res.status(400).json({ success: false, message: error.message || "Login failed" });
            });
    })
    return {
        method: "POST",
        route: "/api/v1/login",
    }
}