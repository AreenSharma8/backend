import { Router } from "express";
import { getWatchHistory, getUserChannelProfile, updateCoverImage, updateUserAvatar, updateAccountDetails, getCurrentUser ,changeCurrentPassword ,refreshAccessToken, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar", 
            maxCount: 1
        },
        {
            name: "coverimage", 
            maxCount: 5
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refreshToken").post(refreshAccessToken);

router.route("/changepassword").post(verifyJWT, changeCurrentPassword);

router.route("/currentuser").get(verifyJWT, getCurrentUser);

router.route("/updateaccountdetails").patch(verifyJWT, updateAccountDetails);

router.route("/updateavatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router.route("/updatecoverimage").patch(verifyJWT, upload.single("coverimage"), updateCoverImage);

router.route("/getuserchannelprofile/:username").get(verifyJWT, getUserChannelProfile);

router.route("/getwatchhistory").get(verifyJWT, getWatchHistory);

export default router;