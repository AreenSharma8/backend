import mongoose, {Schema} from 'mongoose';

const LikeSchema = new mongoose.Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        tweets: {
            type: Schema.Types.ObjectId,
            ref: "Tweets"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    },{timestamps:true}
)

export const Like = mongoose.model('Like', LikeSchema);