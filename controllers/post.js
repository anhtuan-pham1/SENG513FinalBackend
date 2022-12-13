import Posts from "../models/post.js";
import Comments from "../models/comment.js";
import Users from "../models/user.js";

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const postController = {
  createPost: async (req, res) => {
    try {
      const { content, image } = req.body;

      if (image.length === 0)
        return res.status(400).json({ message: "Please add your photo." });

      const newPost = new Posts({
        content,
        image,
        user: req.user._id,
      });
      await newPost.save();

      res.json({
        message: "Created Post!",
        newPost: {
          ...newPost._doc,
          user: req.user,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getPosts: async (req, res) => {
    try {
      const user = await Users.findById(req.user._id, "_id following");

      const features = new APIfeatures(
        Posts.find({
          user: [...user.following, user._id],
        }),
        req.query
      ).paginating();

      const posts = await features.query
        .sort("-createdAt")
        .populate("user likes", "avatar username fullname followers")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });

      res.json({
        message: "Success!",
        result: posts.length,
        posts,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { content, image } = req.body;

      const post = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        {
          content,
          image,
        }
      )
        .populate("user likes", "profilePic fullname username")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });

      res.json({
        message: "Updated Post!",
        newPost: {
          ...post._doc,
          content,
          image,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  likePost: async (req, res) => {
    try {
      const post = await Posts.find({
        _id: req.params.id,
        likes: req.user._id,
      });
      if (post.length > 0)
        return res.status(400).json({ message: "You liked this post." });

      const like = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { likes: req.user._id },
        },
        { new: true }
      );

      if (!like)
        return res.status(400).json({ message: "This post does not exist." });

      res.json({ message: "Liked Post!" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  unLikePost: async (req, res) => {
    try {
      const like = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { likes: req.user._id },
        },
        { new: true }
      );

      if (!like)
        return res.status(400).json({ message: "This post does not exist." });

      res.json({ message: "UnLiked Post!" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getUserPosts: async (req, res) => {
    try {
      const features = new APIfeatures(
        Posts.find({ user: req.params.id }),
        req.query
      ).paginating();
      const posts = await features.query.sort("-createdAt");

      res.json({
        posts,
        result: posts.length,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Posts.findById(req.params.id)
        .populate("user likes", "profilePic username fullname followers")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });

      if (!post)
        return res.status(400).json({ message: "This post does not exist." });

      res.json({
        post,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getPostsDicover: async (req, res) => {
    try {
      const user = await Users.findById(req.user, "_id following");
      const newArr = [...user.following, user._id];

      const num = req.query.num || 20;

      const posts = await Posts.aggregate([
        { $match: { user: { $nin: newArr } } },
        { $sample: { size: Number(num) } },
      ]);

      return res.json({
        message: "Success!",
        result: posts.length,
        posts,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  deletePost: async (req, res) => {
    try {
      console.log(req.user);
      console.log(req.params);
      let post;
      post = await Posts.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });
      const admin = await Users.findById(req.user._id);
      if (admin.role == "admin") {
        post = await Posts.findByIdAndDelete({ _id: req.params.id });
      }

      await Comments.deleteMany({ _id: { $in: post.comments } });

      res.json({
        message: "Deleted Post!",
        newPost: {
          ...post,
          user: req.user,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  savePost: async (req, res) => {
    try {
      const user = await Users.find({
        _id: req.user._id,
        saved: req.params.id,
      });
      if (user.length > 0)
        return res.status(400).json({ message: "You saved this post." });

      const save = await Users.findOneAndUpdate(
        { _id: req.user._id },
        {
          $push: { saved: req.params.id },
        },
        { new: true }
      );

      if (!save)
        return res.status(400).json({ message: "This user does not exist." });

      res.json({ message: "Saved Post!" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  unSavePost: async (req, res) => {
    try {
      const save = await Users.findOneAndUpdate(
        { _id: req.user._id },
        {
          $pull: { saved: req.params.id },
        },
        { new: true }
      );

      if (!save)
        return res.status(400).json({ message: "This user does not exist." });

      res.json({ message: "unSaved Post!" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getSavePosts: async (req, res) => {
    try {
      const features = new APIfeatures(
        Posts.find({
          _id: { $in: req.user.saved },
        }),
        req.query
      ).paginating();

      const savePosts = await features.query.sort("-createdAt");

      res.json({
        savePosts,
        result: savePosts.length,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
};

export default postController;
