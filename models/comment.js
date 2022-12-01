import pkg from 'mongoose';
const { model, models, Schema, Types } = pkg

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    tag: Object,
    reply: Types.ObjectId,
    likes: [{
        type: Types.ObjectId,
        ref: 'user'
    }],
    user: {
        type: Types.ObjectId,
        ref: 'user'
    },
    postId: Types.ObjectId,
    postUserId: Types.ObjectId
}, {
    timestamps: true
})

const Comments = models.Comments || model('Comments', commentSchema);

export default Comments