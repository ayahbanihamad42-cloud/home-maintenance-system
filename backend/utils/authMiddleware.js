// Import jsonwebtoken library to handle JWT authentication
import jwt from "jsonwebtoken";

// Authentication middleware function
const auth = (req, res, next) => {

  // Get the Authorization header from the request
  const authHeader = req.headers.authorization;

  // Check if the Authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization header missing or malformed"
    });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using the secret key
    // If valid, decoded user data will be attached to req.user
    req.user = jwt.verify(token, process.env.JWT_SECRET);

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Log error if token verification fails
    console.error("JWT verification failed:", err);

    // Send forbidden response if token is invalid or expired
    res.status(403).json({
      message: "Invalid or expired token"
    });
  }
};

// Export the authentication middleware
export default auth;
