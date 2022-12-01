import pkg from 'mongoose';
const { model, models, Schema, Types } = pkg

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
    gender: {
        type: String,
    },
    profilePic: {
        type: String,
    },
    followers: [
        {
            type: Types.ObjectId,
            ref: 'Users'
        }
    ],
    following: [
        {
            type: Types.ObjectId,
            ref: 'Users'
        }
    ],
    saved: [{
        type: Types.ObjectId,
        ref: 'user'
    }],
    isActive: {
        type: Boolean,
        default: false,
    },
    token: {
        type: String,
    },
    expiredDate: {
        type: Date,
        expires: 3600, // expire in 1 hour
        default: Date.now
    }
});

const Users = models.Users || model('Users', userSchema);

export default Users;