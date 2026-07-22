import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiErrors.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")?.trim();

        if(!token){
            return res.status(401).json({ message: "Unauthorized Request" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            return res.status(401).json({ message: "Invalid Access Token Request" });
        }

        req.user = user;
        next();
    }
    catch (error) {
        throw new apiError(401, "Unauthorized Request", error?.message || error);
    }
})