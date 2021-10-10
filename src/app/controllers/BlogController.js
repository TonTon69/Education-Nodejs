const Blog = require("../models/Blog");
const User = require("../models/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class BlogController {
    // [GET]/blog/:slug
    async show(req, res, next) {
        try {
            // const category = await BlogCategory.find({});
            const blog = await Blog.findOne({ slug: req.params.slug });
            const user = await User.findOne({ id: blog.userID });

            const blogRelated = await Blog.aggregate([
                {
                    $match: {
                        bcID: ObjectId(blog.bcID),
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userID",
                        foreignField: "_id",
                        as: "User",
                    },
                },
                { $sort: { view: -1 } },
                {
                    $limit: 5,
                },
            ]);

            res.render("blog/show", {
                blog,
                user,
                blogRelated,
            });
        } catch (err) {
            res.render("error");
        }
    }
}

module.exports = new BlogController();
