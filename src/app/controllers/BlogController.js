const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");
const User = require("../models/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class BlogController {
    // [GET]/blog/:slug
    async show(req, res, next) {
        try {
            const blog = await Blog.findOne({ slug: req.params.slug });
            const user = await User.findOne({ _id: blog.userID });

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

    // [GET]/blog/filter
    async filter(req, res) {
        try {
            const option = req.body.option;
            const category = await BlogCategory.findOne({ category: option });
            const blogs = await Blog.aggregate([
                {
                    $match: {
                        bcID: ObjectId(category.id),
                    },
                },
                {
                    $lookup: {
                        from: "blog-categories",
                        localField: "bcID",
                        foreignField: "_id",
                        as: "Cate",
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
            ]);

            res.render("helper/blog", { blogs });
        } catch (error) {
            req.flash("error", "Không tìm thấy kết quả!");
        }
    }
}

module.exports = new BlogController();
