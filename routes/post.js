import Router from 'express'
import postController from '../controllers/post.js'
import auth from "../middlewares/auth.js"
const postRoute = Router()

postRoute.route('/posts')
    .post(auth, postController.createPost)
    .get(auth, postController.getPosts)

postRoute.route('/post/:id')
    .patch(auth, postController.updatePost)
    .get(auth, postController.getPost)
    .delete(auth, postController.deletePost)

postRoute.patch('/post/:id/like', auth, postController.likePost)

postRoute.patch('/post/:id/unlike', auth, postController.unLikePost)

postRoute.get('/user_posts/:id', auth, postController.getUserPosts)

postRoute.get('/post_discover', auth, postController.getPostsDicover)

postRoute.patch('/save_post/:id', auth, postController.savePost)

postRoute.patch('/unsave_post/:id', auth, postController.unSavePost)

postRoute.get('/get_save_posts', auth, postController.getSavePosts)


export default postRoute;