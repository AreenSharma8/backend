import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";

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

// const loginUser = asyncHandler( async (req, res) => {

//     return res.status(200).json({
//         success: true,
//         message: "User logged in successfully"
//     });

// })


export {registerUser};