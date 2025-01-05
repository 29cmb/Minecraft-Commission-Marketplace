import { Express } from 'express'
import { isStaff, userExists } from '../modules/database';
export default (app: Express) => {
    app.get("/api/v1/staff", async(req, res) => {
        const auth = req.headers.authorization;
        if(!auth || !userExists(auth)){
            res.status(401).json({ success: false, message: "User cannot invoke method", staff: false })
            return
        }

        const staff = await isStaff(auth);

        res.status(200).json({ staff })
    })

    return {
        method: "GET",
        route: "/api/v1/staff"
    }
}