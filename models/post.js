import pkg from 'mongoose';
const { model, models, Schema, Types } = pkg

const userSchema = new Schema({
    content: {
        type: String,
    },
    image: {
        type: Array,
        required: true,
    },
    likes: [{
        type: Types.ObjectId,
        ref: 'Users'
    }],
    comments: [{
        type: Types.ObjectId,
        ref: 'Comments'
    }],
    user: {
        type: Types.ObjectId,
        ref: 'Users'
    }
});

const Posts = models.Posts || model('Posts', userSchema);

export default Posts