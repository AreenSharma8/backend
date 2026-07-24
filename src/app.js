import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true 
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({ extended: true, limit:"16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import userRoutes from "./routes/user.routes.js"

// routes
app.use("/api/v1/users", userRoutes)

// centralized error handler — must be defined LAST, and must have exactly 4 params
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    })
})

export default app