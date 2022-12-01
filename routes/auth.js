import { Router } from 'express'
import authController from "../controllers/auth.js"
import registerMiddleware from "../middlewares/signup.js"

const authRoute = Router()

authRoute.post('/register', registerMiddleware, authController.register);
authRoute.post('/login', authController.login)
authRoute.post('/logout', authController.logout)
authRoute.post('/refresh_token', authController.generateAccessToken)

authRoute.get("/verify/:token", authController.verifyUser)

export default authRoute;