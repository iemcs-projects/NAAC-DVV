import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const User = db.users;
const IQAC = db.iqac_supervision;

// ---------- Token Generator ----------
const generateAccessandRefreshToken = async (uuid) => {
  const checkUser =
    (await IQAC.findOne({ where: { uuid } })) ||
    (await User.findOne({ where: { uuid } }));

  if (!checkUser) {
    throw new apiError(404, "User not found");
  }

  const accessToken = jwt.sign({ id: uuid }, process.env.JWT_ACCESS_TOKEN, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ id: uuid }, process.env.JWT_REFRESH_TOKEN, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// ---------- IQAC Register ----------
const iqacRegister = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    institutionName,
    institutionType,
    aisheId,
    institutionalEmail,
    phoneNumber,
  } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !institutionName ||
    !institutionType ||
    !aisheId ||
    !institutionalEmail ||
    !phoneNumber
  ) {
    throw new apiError(400, "Missing required fields");
  }

  const allowedTypes = ["autonomous", "affiliated ug", "affiliated pg", "university"];
  if (!allowedTypes.includes(institutionType.toLowerCase())) {
    throw new apiError(400, "Invalid institution type");
  }

  const existing = await IQAC.findOne({ where: { email } });
  if (existing) throw new apiError(400, "User already exists");

  const createdUUID = uuidv4();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(createdUUID);

  const iqac = await IQAC.create({
    uuid: createdUUID,
    name,
    email,
    password_hash: hashedPassword,
    institution_name: institutionName,
    institution_type: institutionType.toLowerCase().replace(/\s+/g, "_"),
    aishe_id: aisheId,
    institutional_email: institutionalEmail,
    phone_number: phoneNumber,
    refresh_token: refreshToken,
  });

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
      path: "/",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })
    .status(201)
    .json(new apiResponse(201, { iqac, accessToken, refreshToken }, "IQAC registered"));
});

// ---------- User Register ----------
const userRegister = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password || !role) {
    throw new apiError(400, "Missing required fields");
  }

  const allowedRoles = ["faculty", "college_admin", "mentor", "college_authority"];
  if (!allowedRoles.includes(role)) {
    throw new apiError(400, `Invalid role. Allowed: ${allowedRoles.join(", ")}`);
  }

  const exists = await User.findOne({ where: { email } });
  if (exists) throw new apiError(400, "User already exists");

  const createdUUID = uuidv4();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = await User.create({
    uuid: createdUUID,
    name,
    email,
    password_hash: hashedPassword,
    role,
    department: department || null,
    is_invited: false,
    refresh_token: null,
  });

  res.status(201).json(
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
          is_invited: user.is_invited,
        },
      },
      "User registered. Pending approval"
    )
  );
});

// ---------- Pending / Approved ----------
const getPendingUsers = asyncHandler(async (req, res) => {
  const pending = await User.findAll({
    where: { is_invited: false },
    attributes: { exclude: ["password_hash", "refresh_token"] },
  });
  res.json(new apiResponse(200, pending, "Pending users"));
});

const getApprovedUsers = asyncHandler(async (req, res) => {
  const approved = await User.findAll({
    where: { is_invited: true },
    attributes: { exclude: ["password_hash", "refresh_token"] },
  });
  res.json(new apiResponse(200, approved, "Approved users"));
});

const approveUser = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const user = await User.findOne({ where: { uuid } });
  if (!user) throw new apiError(404, "User not found");

  user.is_invited = true;
  await user.save();

  res.json(new apiResponse(200, user, "User approved"));
});

const rejectUser = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const user = await User.findOne({ where: { uuid } });
  if (!user) throw new apiError(404, "User not found");

  await user.destroy();
  res.json(new apiResponse(200, {}, "User rejected & removed"));
});

// ---------- Login ----------
const userLogin = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) throw new apiError(400, "Missing fields");

  const formattedRole = role.toLowerCase();
  let userModel = formattedRole === "iqac" ? IQAC : User;

  const user = await userModel.findOne({ where: { email } });
  if (!user) throw new apiError(404, "User not found");

  if (formattedRole !== "iqac" && user.is_invited === false) {
    throw new apiError(403, "User not approved");
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) throw new apiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(user.uuid);

  user.refresh_token = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
      path: "/",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })
    .json(
      new apiResponse(
        200,
        {
          user: {
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            role: [user.role || formattedRole],
            institution_name: user.institution_name,
          },
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
});

// ---------- Refresh ----------
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new apiError(401, "Refresh token required");

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
  const { accessToken } = await generateAccessandRefreshToken(decoded.id);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
    path: "/",
  });

  res.json({ success: true, data: { accessToken }, message: "Token refreshed" });
});

// ---------- Auth Status ----------
const getAuthStatus = asyncHandler(async (req, res) => {
  let token = req.cookies?.accessToken || req.headers.authorization?.split("Bearer ")[1];
  if (!token) throw new apiError(401, "No token");

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
  const user =
    (await IQAC.findOne({ where: { uuid: decoded.id } })) ||
    (await User.findOne({ where: { uuid: decoded.id } }));

  if (!user) throw new apiError(404, "User not found");

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role || "iqac",
        institution_name: user.institution_name,
      },
    },
  });
});

// ---------- Logout ----------
const logout = asyncHandler(async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.json({ success: true, message: "Logged out" });
});

export {
  iqacRegister,
  userRegister,
  userLogin,
  refreshAccessToken,
  getAuthStatus,
  logout,
  getPendingUsers,
  getApprovedUsers,
  approveUser,
  rejectUser,
};