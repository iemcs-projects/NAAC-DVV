import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Sequelize from "sequelize";
import { v4 as uuidv4 } from 'uuid';
const User = db.users;
const IQAC = db.iqac_supervision;



const generateAccessandRefreshToken = async (userId)=>{

    const checkUser = await IQAC.findOne({ where: { id: userId } });
    if (!checkUser) {
        throw new apiError(404, "User not found");
    }
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_TOKEN, {
        expiresIn: "1h"
      });
      const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d"
      });
      console.log("Access Token: ", accessToken);
      console.log("Refresh Token: ", refreshToken);
      return { accessToken, refreshToken };
}
/**
 * @route POST /api/v1/auth/iqacRegister
 * @description Register a new IQAC supervisor
 * @requestbody {string} name, email, password, institutionName, institutionType, aisheId, institutionalEmail, phoneNumber
 * @since 1.0.0
 * @access Public
 */
const iqacRegister = asyncHandler(async (req, res) => {

    console.log("Routeeeeeeeeeeeeeee")
    const {
        name,
        email,
        password,
        institutionName,
        institutionType, // should be validated against allowed values
        aisheId,
        institutionalEmail,
        phoneNumber
      } = req.body;

      console.log(name,email,password, institutionName, institutionType, aisheId, institutionalEmail, phoneNumber)

      if (!name || !email || !password || !institutionName || !institutionType || !aisheId || !institutionalEmail || !phoneNumber) {
        throw new apiError(400, "Missing required fields");
      }

      if(institutionType !== "autonomous" && institutionType !== "affiliated UG" && institutionType !== "affiliated PG" && institutionType !== "university") {
        throw new apiError(400, "Invalid institution type");
      }

      const formattedInstitutionType = institutionType.toLowerCase().replace(/\s+/g, "_");
      console.log("Formatted Institution Type: ", formattedInstitutionType);
      console.log("type: ", typeof formattedInstitutionType);
      const user = await IQAC.findOne({ where: { email } });
      console.log(user)
      if (user) {
        throw new apiError(400, "User already exists");
      }
      const createdUUID = uuidv4();
      const hashedPassword = bcrypt.hashSync(password, 10);
      console.log("Hashed Password: ", hashedPassword);
      console.log("IQAC: ", IQAC);

      const refreshToken = jwt.sign({ id: createdUUID }, process.env.JWT_REFRESH_TOKEN, {
        expiresIn: "7d"
      });

      const accessToken = jwt.sign({ id: createdUUID }, process.env.JWT_ACCESS_TOKEN, {
        expiresIn: "1h"
      });

      console.log(accessToken)
      console.log(refreshToken)
  try {
    
        const iqac = await IQAC.create({
          uuid: createdUUID,
          name: name,
          email: email,
          password_hash: hashedPassword,
          institution_name: institutionName,
          institution_type: formattedInstitutionType,
          aishe_id: aisheId,
          institutional_email: institutionalEmail,
          phone_number: phoneNumber,
          refresh_token: refreshToken
          });
          res
          .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 1000 // 1 hour
          })
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          })
          .status(201).json(
            new apiResponse(201, {iqac,accessToken,refreshToken}, "User registered successfully")
          );
    
  } 
  catch (error) {
    console.log(error)
    throw new apiError(500, "Failed to create user"); 
  }
})

const userRegister = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body;
  console.log(req.body);

  if (!name || !email || !password || !role) {
    throw new apiError(400, "Missing required fields");
  }

  const allowedRoles = ["faculty", "college_admin", "mentor"];
  if (!allowedRoles.includes(role)) {
    throw new apiError(400, "Invalid role");
  }

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new apiError(400, "User already exists");
  }

  const createdUUID = uuidv4();
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const user = await User.create({
      uuid: createdUUID,
      name,
      email,
      password_hash: hashedPassword,
      role,
      department: department || null,
      is_invited: false, // locked until approved
      refresh_token: null
    });

    res
      .status(201)
      .json(
        new apiResponse(
          201,
          { 
            user: {
              id: user.id,
              uuid: user.uuid,
              name: user.name,
              email: user.email,
              role: user.role,
              department: user.department,
              is_invited: user.is_invited
            }
          },
          "User registered successfully. Pending approval"
        )
      );
  } catch (error) {
    console.error(error);
    throw new apiError(500, "Failed to create user");
  }
});


// IQAC: Get all pending users
const getPendingUsers = asyncHandler(async (req, res) => {
  const pendingUsers = await User.findAll({ where: { is_invited: false } });
  res.status(200).json(new apiResponse(200, pendingUsers, "Pending users fetched"));
});


// IQAC: Approve user
const approveUser = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const user = await User.findOne({ where: { uuid } });
  if (!user) throw new apiError(404, "User not found");

  user.is_invited = true;
  await user.save();

  res.status(200).json(new apiResponse(200, user, "User approved successfully"));
});


// IQAC: Reject/Delete user
const rejectUser = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const user = await Users.findOne({ where: { uuid } });
  if (!user) throw new apiError(404, "User not found");

  await user.destroy();

  res.status(200).json(new apiResponse(200, {}, "User rejected and removed"));
});


const userLogin = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    throw new apiError(400, "Missing required fields");
  }

  const formattedRole = role.toLowerCase();

  // Role-based model selection
  let userModel;
  switch (formattedRole) {
    case "iqac":
      userModel = IQAC;
      break;
    case "faculty":
    case "hod":
    case "admin":
    case "mentor":
      userModel = User;
      break;
    default:
      throw new apiError(400, "Invalid role");
  }

  const user = await userModel.findOne({ where: { email } });
  if (!user) throw new apiError(404, "User not found");

  // IQAC approval check (only for non-IQAC roles)
  if (formattedRole !== "iqac" && user.is_invited === false) {
    throw new apiError(403, "User not approved by IQAC");
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
  if (!isPasswordValid) throw new apiError(401, "Invalid credentials");

  if (!process.env.JWT_ACCESS_TOKEN || !process.env.JWT_REFRESH_TOKEN) {
    throw new apiError(500, "Server configuration error");
  }

  const accessToken = jwt.sign(
    { id: user.uuid, role: formattedRole, type: "access" },
    process.env.JWT_ACCESS_TOKEN,
    { expiresIn: "1h", algorithm: "HS256" }
  );

  const refreshToken = jwt.sign(
    { id: user.uuid, role: formattedRole, type: "refresh" },
    process.env.JWT_REFRESH_TOKEN,
    { expiresIn: "7d", algorithm: "HS256" }
  );

  // Save refresh token in DB if needed
  user.refresh_token = refreshToken;
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1h
    path: "/",
  };

  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  };

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .status(200)
    .json(
      new apiResponse(
        200,
        {
          user: {
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            role: user.role || formattedRole,
            institution_name: user.institution_name,
          },
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
});



const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new apiError(401, 'Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded.id) {
      throw new apiError(401, 'Invalid refresh token');
    }

    // Generate new access and refresh tokens
    const { accessToken } = await generateAccessandRefreshToken(decoded.id);

    // Set access token in cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/'
    });

    // Respond with token
    return res.status(200).json({
      success: true,
      data: { accessToken },
      message: 'Access token refreshed'
    });

  } catch (err) {
    console.error('Error refreshing token:', err.message);
    throw new apiError(401, 'Invalid or expired refresh token');
  }
});

/**
 * @route GET /api/v1/auth/me
 * @description Get current user information
 * @since 1.0.0
 * @access Protected
 */
const getAuthStatus = asyncHandler(async (req, res) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.accessToken || req.headers.authorization?.split('Bearer ')[1];
    console.log('Token:', token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    if (!decoded.id) {
      throw new apiError(401, 'Invalid token');
    }

    // Get user by UUID
    const user = await IQAC.findOne({ where: { uuid: decoded.id } });
    if (!user) {
      throw new apiError(404, 'User not found');
    }

    // Return user data
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'iqac',
      institution_name: user.institution_name,
      institution_type: user.institution_type
    };

    res.json({
      success: true,
      data: { user: userData }
    });
  } catch (error) {
    throw new apiError(401, error.message);
  }
});



const logout = asyncHandler(async (req, res) => {
  console.log("Logout route hit");
  console.log("Cookies before clear:", req.cookies);

  // Ensure these flags match exactly how the cookies were set during login/register
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // should match how you set it
    sameSite: 'lax',
    path: '/',
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  console.log("Cookies cleared");

  res.json({
    success: true,
    message: 'User logged out successfully'
  });
});


export {
    iqacRegister,
    userLogin,
    refreshAccessToken,
    getAuthStatus,
    logout,
    rejectUser,
    approveUser,
    getPendingUsers,
    userRegister
}