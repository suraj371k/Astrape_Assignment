import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  let token;

  // 1. Try to get token from cookie first
  token = req.cookies?.token;

  // 2. If no cookie, try Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  // 3. If still no token, reject
  if (!token) {
    return res.status(401).json({ 
      message: "No token provided, authorization denied.",
      debug: {
        cookieExists: !!req.cookies?.token,
        authHeaderExists: !!req.headers.authorization,
        cookies: req.cookies // Remove this in production
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(401).json({ 
      message: "Token is not valid.",
      error: err.message // Remove this in production
    });
  }
};

export default authenticate;