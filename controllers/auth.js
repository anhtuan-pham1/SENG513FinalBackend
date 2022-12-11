import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Users from "../models/user.js"
import sendConfirmationEmail from "../config/nodemailer.js"

const authController = {
    register: async (req, res) => {
        try {
            const { fullname, username, email, password, gender } = req.body
            // hash the password
            const passwordHash = await bcrypt.hash(password, 12)

            let newUser = new Users({
                fullname,
                username,
                email,
                password: passwordHash,
                gender,
                token: createToken({ email: email }),
                role: email.includes('@ucalgary.ca') ? "admin" : "student",
            })


            const accessToken = createAccessToken({ id: newUser._id })
            const refreshToken = createRefreshToken({ id: newUser._id })

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            })

            await newUser.save((err, user) => {
                if (err) {
                    return res.status(500).send(err)
                }

                sendConfirmationEmail(
                    user.username,
                    user.email,
                    user.token
                )

                return res.status(200).send({
                    message: 'Register Success!',
                    accessToken,
                    user: {
                        ...newUser._doc,
                        password: ''
                    }
                })
            })

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body

            const user = await Users.findOne({ email: email })
                .populate("followers following", "avatar username fullname followers following")

            if (!user) return res.status(400).json({ message: "This email does not exist." })

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return res.status(400).json({ message: "Password is incorrect." })

            if (user.isActive == false) return res.status(400).json({ message: "The account has not been activated yet!" })
            // create new accessToken when login
            const refreshToken = createRefreshToken({ id: user._id })
            const accessToken = createAccessToken({ id: user._id })

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            })


            res.json({
                message: 'Login Success!',
                accessToken,
                user: {
                    ...user._doc,
                    password: ''
                }
            })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/api/refresh_token' })
            return res.json({ message: "Logged out!" })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
    verifyUser: async (req, res) => {
        try {
            const user = await Users.findOne({ token: req.params.token })
            if (!user) return res.status(400).json({ message: "The token has been expired" })

            user.isActive = true
            user.expiredDate = null
            await user.save()

            res.json({
                message: "Verify successfully!"
            })

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
    generateAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if (!rf_token) return res.status(400).json({ message: "Please login now." })

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async (err, result) => {
                if (err) return res.status(400).json({ message: "Please login now." })

                const user = await Users.findById(result.id).select("-password")
                    .populate('followers following', 'avatar username fullname followers following')

                if (!user) return res.status(400).json({ message: "This user does not exist." })

                const access_token = createAccessToken({ id: result.id })

                res.json({
                    access_token,
                    user
                })
            })

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
}

const createToken = (payload) => {
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1h' })
}

export default authController