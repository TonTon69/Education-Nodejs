const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");
const User = require("../models/User");

class BlogController {
    // [GET]/blog/:slug
    async show(req, res, next) {
        try {
            const category = await BlogCategory.find({});
            const blog = await Blog.findOne({ slug: req.params.slug });
            const user = await User.findOne({ id: blog.userID });

            const blogRelated = await Blog.find({ bcID: blog.bcID })
                .sort({
                    view: -1,
                })
                .limit(5);
            const blogRelatedUserIdArray = blogRelated.map(
                ({ userID }) => userID
            );
            const users = await User.find({
                id: { $in: blogRelatedUserIdArray },
            });

            res.render("blog/show", {
                blog,
                category,
                user,
                blogRelated,
                users,
            });
        } catch (err) {
            res.render("error");
        }
    }
}

module.exports = new BlogController();
