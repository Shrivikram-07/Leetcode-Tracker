const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        // Check if Authorization header exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Check Bearer format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid token format"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store user info
        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        next();

    } catch (error) {

        console.log("Auth Error: - authMiddleware.js:44", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });
    }
};

module.exports = authMiddleware;