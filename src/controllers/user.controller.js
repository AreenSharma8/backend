import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        return {accessToken, refreshToken}
    }
    catch (error) {
        throw new apiError(500, "Something went wrong while generating tokens", error.message)
    }
}

const registerUser = asyncHandler(async (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    // get user details from frontend
    // validation of user details
    // check if user already exists - using username and email
    // check for images, check for avatar - upload to cloudinary
    // creates user object - create entry in db
    // check for user creation success - send response to frontend
    // remove password and refresh token from the response

    // 1. get or collect user details from frontend
    const { username, fullname, email, password } = req.body ?? {};
    
    // 2. validation of user details
    if(fullname === "" || username === "" || email === "" || password === ""){
        // return res.status(400).json({
        //     success: false,
        //     message: "All fields are required"
        // })
        throw new apiError(400, "All fields are required")
    }

    // 3. check if user already exists - using username and email
    const existedUser = await User.findOne({
        $or : [{username}, {email}]
    })

    if(existedUser){
        throw new apiError(409, "User already exists with this username or email")

        // return res.status(409).json({
        //     success: false,
        //     message: "User already exists with this username or email"
        // })
    }

    // 4. check for images, check for avatar - upload to cloudinary
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverimage?.[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar is required")
    }

    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    
    if(!avatarResponse){
        throw new apiError(400, "Avatar upload failed")
    }
    // ------------------------------------------------------------------------------------
    const coverImageResponse = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if(coverImageLocalPath && !coverImageResponse){
        throw new apiError(400, "Cover image upload failed")
    }

    // 5. creates user object - create entry in db
    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatarResponse.url,
        coverimage: coverImageResponse?.url
    })

    // 6. remove password and refresh token from the response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    if(!createdUser){
        throw new apiError(500, "Something went wrong while creating user")
    }

    // 7. check for user creation success - send response to frontend
    return res.status(201).json(
        new apiResponse(201, createdUser, "User created successfully")
    )
})

const loginUser = asyncHandler( async (req, res) => {

    // req body -> data
    // username or email with password
    // find the user
    // check the password
    // generate access token and refresh token
    // send cookie

    // 1. req body -> data
    const {email, username, password} = req.body 

    // 2. username or email with password
    if(!email && !username){
        throw new apiError(400, "Email or username is required")
    }

    const user = await User.findOne({
        $or: [{email},{username}]
    })

    // 3. find the user
    if(!user){
        throw new apiError(404, "User not found")
    }

    // 4. check the password
    const isPasswordValid = await user.comparePassword(password)

    if(!isPasswordValid){
        throw new apiError(401, "Invalid credentials")
    }

    // 5. generate access token and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    // 6. send cookie
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "User logged in successfully")
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    )  

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    )  

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(200, {}, "User logged out successfully")
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new apiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new apiError(401, "Unauthorized Request")
        }

        if(incomingRefreshToken !== user.refreshToken){
            throw new apiError(401, "Refresh token is expired or invalid")
        }

        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)

       return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", newrefreshToken, option)
        .json(
            new apiResponse(200, {user, accessToken, refreshToken: newrefreshToken}, "Access token refreshed successfully")
        )
    }
    catch (error) {
        throw new apiError(401, "Unauthorized Request", error?.message || error)
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {currentPassword, newPassword} = req.body

    const user = await User.findById(req.body.user._id)
    const isPasswordCorrect = await user.comparePassword(currentPassword)

    if(!isPasswordCorrect){
        throw new apiError(400, "Current password is incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new apiResponse(200, {}, "Password changed successfully")
    )
})

export {registerUser, loginUser, logoutUser, refreshAccessToken};