import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";
const JWT_SECRET = process.env.JWT_SECRET || "defaultSecret";
export const createToken = (id, email, expiresIn) => {
    const payload = { id, email };
    const options = { expiresIn: expiresIn }; // ✅ cast to correct type
    return jwt.sign(payload, JWT_SECRET, options);
};
export const verifyToken = (req, res, next) => {
    const token = req.signedCookies[`${COOKIE_NAME}`];
    if (!token || token.trim() === "") {
        return res.status(401).json({ message: "Token Not Received" });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token Expired" });
        }
        res.locals.jwtData = decoded;
        return next();
    });
};
//# sourceMappingURL=token-manager.js.map