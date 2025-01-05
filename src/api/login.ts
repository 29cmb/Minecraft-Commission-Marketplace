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

        login(username, password)
            .then((response) => {
                res.status(200).json({ success: true, message: "Logged in successfully", secret: response.secret });
            })
            .catch((error) => {
                res.status(400).json({ success: false, message: error.message.replace("email", "username") || "Login failed" });
            });
    })
    return {
        method: "POST",
        route: "/api/v1/login",
    }
}