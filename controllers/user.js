import Users from '../models/user.js'

const userController = {
    searchUser: async (req, res) => {
        try {
            const users = await Users.find({ username: { $regex: `${req.query.username}` } }, "username profilePic")
                .limit(10)
            res.json({ users })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.params.id).select('-password')
                .populate("followers following", "-password")
            if (!user) return res.status(400).json({ message: "User does not exist." })

            res.json({ user })
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
    updateUser: async (req, res) => {
        try {
            const { profilePic, username, gender } = req.body

            const uname = await Users.findOne({ username: username })
            if (uname != null) return res.status(400).json({ message: "The username already exists." })

            await Users.findOneAndUpdate({ _id: req.user._id }, {
                profilePic, username, gender
            })

            res.json({ message: "Update Success!" })

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
    follow: async (req, res) => {
        try {
            const user = await Users.find({ _id: req.params.id, followers: req.user._id })
            if (user.length > 0) return res.status(500).json({ message: "You followed this user." })

            const newUser = await Users.findOneAndUpdate({ _id: req.params.id }, {
                $push: { followers: req.user._id }
            }, { new: true }).populate("followers following", "-password")

            await Users.findOneAndUpdate({ _id: req.user._id }, {
                $push: { following: req.params.id }
            }, { new: true })

            res.json({ newUser })

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
    unfollow: async (req, res) => {
        try {

            const newUser = await Users.findOneAndUpdate({ _id: req.params.id }, {
                $pull: { followers: req.user._id }
            }, { new: true }).populate("followers following", "-password")

            await Users.findOneAndUpdate({ _id: req.user._id }, {
                $pull: { following: req.params.id }
            }, { new: true })

            res.json({ newUser })

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
    suggestionsUser: async (req, res) => {
        try {
            const user = await Users.findById(req.user._id)
            const newArr = [...user.following, user._id]
            const num = req.query.num || 10

            const users = await Users.aggregate([
                { $match: { _id: { $nin: newArr } } },
                { $sample: { size: Number(num) } },
                { $lookup: { from: 'users', localField: 'followers', foreignField: '_id', as: 'followers' } },
                { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'following' } },
            ]).project("-password")

            return res.json({
                users,
                result: users.length
            })

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
}

export default userController