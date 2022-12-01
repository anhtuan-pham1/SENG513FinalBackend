import Router from 'express'
import auth from '../middlewares/auth.js'
import commentController from '../controllers/comment.js'

const commentRoute = Router()
commentRoute.post('/comment', auth, commentController.createComment)

commentRoute.patch('/comment/:id', auth, commentController.updateComment)

commentRoute.patch('/comment/:id/like', auth, commentController.likeComment)

commentRoute.patch('/comment/:id/unlike', auth, commentController.unLikeComment)

commentRoute.delete('/comment/:id', auth, commentController.deleteComment)

export default commentRoute;