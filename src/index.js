import "dotenv/config";
import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.error("Connection Failed !", err);
    throw err;
})

// import dotenv from "dotenv";
// import { fileURLToPath } from "url";
// import { resolve, dirname } from "path";
// import connectDB from "./db/index.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// dotenv.config({ path: resolve(__dirname, "../.env") });

// connectDB()
// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`Server is running on port ${process.env.PORT || 8000}`);
//     });
// })

// .catch((err) => {
//     console.error("ERROR: ", err);
//     throw err;
// })   



// import express from 'express';
// const app = express();

// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//         app.on("error", (err) => {
//             console.error("ERROR: ",err);
//             throw err;
//         });

//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });   
//     }
//     catch(err){
//         console.error("ERROR: ",err);
//         throw err;
//     }
// })()