const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");
const User = require("../models/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
class BlogController {
    // [GET]/blog/:slug
    async show(req, res) {
        try {
            const blog = await Blog.findOne({ slug: req.params.slug });
            await Blog.findByIdAndUpdate(blog._id, { $inc: { view: 1 } });

            const blogCategory = await BlogCategory.findById(blog.bcID);
            const userBlog = await User.findOne({ _id: blog.userID });

            let blogRelated = await Blog.aggregate([
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
                { $limit: 7 },
            ]);

            blogRelated.forEach((item, index) => {
                if (item.slug === req.params.slug) {
                    blogRelated.splice(index, 1);
                }
            });

            res.render("blog/show", {
                blog,
                userBlog,
                blogRelated,
                blogCategory,
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
            ]);

            res.render("helper/blog", { blogs });
        } catch (error) {
            req.flash("error", "Không tìm thấy kết quả!");
        }
    }

    async create(req, res) {
        const categories = await BlogCategory.find({});
        res.render("blog/create", {
            categories,
            success: req.flash("success"),
            errors: req.flash("error"),
        });
    }

    //Post /blog/post
    async postBlog(req, res) {
        const formDate = req.body;
        formDate.userID = req.signedCookies.userId;
        const blog = new Blog(formDate);
        await blog.save();
        req.flash("success", "Đã thêm 1 bài viết mới thành công!");
        res.redirect("back");
    }

    // [POST]/blog/list-blog
    async searchFilter(req, res) {
        const searchString = req.body.query;
        const option = req.body.option;
        const categories = await BlogCategory.find({});
        let blogs = [];
        if (searchString) {
            blogs = await Blog.aggregate([
                {
                    $match: {
                        title: { $regex: searchString, $options: "$i" },
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
                {
                    $lookup: {
                        from: "blog-categories",
                        localField: "bcID",
                        foreignField: "_id",
                        as: "BlogCategory",
                    },
                },
            ]);
        } else if (option) {
            blogs = await Blog.aggregate([
                {
                    $match: {
                        bcID: ObjectId(option),
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
                {
                    $lookup: {
                        from: "blog-categories",
                        localField: "bcID",
                        foreignField: "_id",
                        as: "BlogCategory",
                    },
                },
            ]);
        } else {
            blogs = await Blog.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userID",
                        foreignField: "_id",
                        as: "User",
                    },
                },
                {
                    $lookup: {
                        from: "blog-categories",
                        localField: "bcID",
                        foreignField: "_id",
                        as: "BlogCategory",
                    },
                },
                { $sort: { view: -1 } },
            ]);
        }
        res.render("helper/table-blog", { blogs, categories });
    }
    // [GET]/blog/:id/update
    async update(req, res) {
        const blog = await Blog.findOne({ _id: req.params.id });
        const categories = await BlogCategory.find({});
        res.render("blog/update", {
            success: req.flash("success"),
            errors: req.flash("error"),
            categories,
            blog,
        });
    }

    // [PUT]/blog/:id/update
    async putUpdate(req, res) {
        await Blog.updateOne({ _id: req.params.id }, req.body);
        req.flash("success", "Cập nhật bài viết thành công!");
        res.redirect("back");
    }

    async deleteBlog(req, res) {
        await Blog.deleteOne({ _id: req.params.id });
        req.flash("success", "Xóa bài viết thành công!");
        res.redirect("back");
    }

    async addCategory(req, res) {
        const formDate = req.body;
        const category = new BlogCategory(formDate);
        await category.save();
        req.flash("success", "Đã thêm 1 thể loại!");
        res.redirect("/blog/list-category");
    }

    async listCategory(req, res) {
        const categories = await BlogCategory.find({});
        res.render("blog/list-category", {
            success: req.flash("success"),
            errors: req.flash("error"),
            categories,
        });
    }

    async deleteCategory(req, res, next) {
        await BlogCategory.deleteOne({ _id: req.params.id });
        req.flash("success", "Đã xóa thành công!");
        res.redirect("back");
    }

    async listBlog(req, res) {
        let perPage = 3;
        let page = req.params.page || 1;
        const categories = await BlogCategory.find({});
        const blogs = await Blog.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "User",
                },
            },
            {
                $lookup: {
                    from: "blog-categories",
                    localField: "bcID",
                    foreignField: "_id",
                    as: "BlogCategory",
                },
            },
            { $sort: { view: -1 } },
            { $skip: perPage * page - perPage },
            { $limit: perPage },
        ]);

        const blogsCount = await Blog.countDocuments();
        res.render("blog/list-blog", {
            success: req.flash("success"),
            errors: req.flash("error"),
            blogs,
            categories,
            current: page,
            pages: Math.ceil(blogsCount / perPage),
        });
    }

    // [GET]/blog/list/:page
    async pagination(req, res) {
        try {
            let perPage = 3;
            let page = req.params.page || 1;
            const categories = await BlogCategory.find({});
            const blogs = await Blog.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userID",
                        foreignField: "_id",
                        as: "User",
                    },
                },
                {
                    $lookup: {
                        from: "blog-categories",
                        localField: "bcID",
                        foreignField: "_id",
                        as: "BlogCategory",
                    },
                },
                { $sort: { view: -1 } },
                { $skip: perPage * page - perPage },
                { $limit: perPage },
            ]);

            const blogsCount = await Blog.countDocuments();
            res.render("blog/list-blog", {
                success: req.flash("success"),
                errors: req.flash("error"),
                blogs,
                categories,
                current: page,
                pages: Math.ceil(blogsCount / perPage),
            });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new BlogController();
