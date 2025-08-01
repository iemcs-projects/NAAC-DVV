import jwt from "jsonwebtoken";
import db from "../models/index.js";

const IQAC = db.iqac_supervision;
const verifyToken = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token;
        
        // Check cookies if they exist
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
            console.log('Token found in cookies');
        } 
        // Check Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token found in Authorization header');
        }
        
        console.log('Token received:', token);
        
        if (!token) {
            console.log('No token provided in request');
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized: No authentication token provided' 
            });
        }

        try {
            console.log('Verifying token with secret:', process.env.JWT_ACCESS_TOKEN ? 'Secret exists' : 'No secret found');
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
            console.log('Decoded token:', decoded);
            
            if (!decoded.id) {
                console.log('Token missing user ID');
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid token: Missing user identification' 
                });
            }

            const user = await IQAC.findOne({ where: { uuid: decoded.id } });
            console.log('User found in database:', user ? 'Yes' : 'No');
            
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    message: 'User not found' 
                });
            }
            
            // Attach user to request object
            req.user = user;
            next();
            
        } catch (jwtError) {
            console.error('JWT Verification Error:', jwtError);
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Session expired. Please log in again.' 
                });
            }
            
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid token. Please log in again.' 
                });
            }
            
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized, token failed' 
            });
        }
    } catch (error) {
        console.error('Authentication Middleware Error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error during authentication' 
        });
    }
};

export default verifyToken;
