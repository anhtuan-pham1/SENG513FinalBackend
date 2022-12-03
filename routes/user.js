import Router from 'express'
import auth from '../middlewares/auth.js'
import userController from '../controllers/user.js'

const userRoute = Router()

userRoute.get('/search', auth, userController.searchUser)

userRoute.get('/user/:id', auth, userController.getUser)

userRoute.patch('/user', auth, userController.updateUser)

userRoute.patch('/user/:id/follow', auth, userController.follow)
userRoute.patch('/user/:id/unfollow', auth, userController.unfollow)

userRoute.get('/suggestionsUser', auth, userController.suggestionsUser)

userRoute.delete('/user/:id', auth, userController.deleteUser)


export default userRoute