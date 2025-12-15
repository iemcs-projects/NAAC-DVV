import jwt from "jsonwebtoken";
import db from "../models/index.js";

const IQAC = db.iqac_supervision;
const User = db.users;
const verifyToken = async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No authentication token provided"
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again."
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid or malformed token"
      });
    }

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      });
    }

    // Locate user (IQAC first, then Users)
    let user =
      (await IQAC.findOne({ where: { uuid: decoded.id } })) ||
      (await User.findOne({
        where: { uuid: decoded.id },
        attributes: { exclude: ["password_hash", "refresh_token"] }
      }));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("verifyToken Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication"
    });
  }
};


// const verifyRole = (criteriaCode) => {
//   return async (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized" 
//       });
//     }

//     const role = req.user.role;

//     // Role not registered in the RBAC map
//     if (!role || !roleCriteriaAccess[role]) {
//       return res.status(403).json({ 
//         success: false,
//         message: "Forbidden: Role not allowed" 
//       });
//     }

//     const allowedCriteria = roleCriteriaAccess[role];

//     // Criteria not permitted for this role
//     if (!allowedCriteria.includes(criteriaCode)) {
//       return res.status(403).json({
//         success: false,
//         message: `Forbidden: Role '${role}' cannot access criteria '${criteriaCode}'`
//       });
//     }

//     next();
//   };
// };

export default verifyToken;
// export { verifyRole };
