import Users from "../models/user.js"

const registerMiddleware = (async (req, res, next) => {
    const { username, email } = req.body
    // check whether the username exists
    let newUserName = username.toLowerCase().replace(/ /g, '')

    const userName = await Users.findOne({ username: newUserName })
    if (userName) return res.status(400).json({ message: "This username already exists." })

    // check whether the email exists
    const userEmail = await Users.findOne({ email })
    if (userEmail) return res.status(400).json({ message: "This email already exists." })
    next()
})

export default registerMiddleware;