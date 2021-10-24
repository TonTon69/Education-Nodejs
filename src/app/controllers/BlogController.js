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
            const userBlog = await User.findOne({ _id: blog.userID });

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
                { $limit: 5 },
            ]);

            res.render("blog/show", {
                blog,
                userBlog,
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
            ]);

            res.render("helper/blog", { blogs });
        } catch (error) {
            req.flash("error", "Không tìm thấy kết quả!");
        }
    }

    async create(req, res, next) {
        const categories = await BlogCategory.find({});
        res.render("blog/create", {
            categories,
        });
    }
    async listBlog(req, res, next) {
        try {
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
            ]);
            res.render("blog/list-blog", {
                success: req.flash("success"),
                errors: req.flash("error"),
                blogs,
                categories,
            });
        } catch (err) {
            res.render("error");
        }
    }
    //Post /blog/post
    postBlog(req, res, next) {
        const formDate = req.body;
        formDate.userID = req.signedCookies.userId;
        const blog = new Blog(formDate);

        blog.save()
            .then(() => {
                req.flash("success", "Đã thêm 1 bài viết mới thành công!");
                res.redirect("/blog/list-blog");
            })
            .catch((error) => {});
    }
    // [POST]/blog/list-blog
    async searchFilter(req, res) {
        try {
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
        } catch (error) {
            console.log(error);
            req.flash("error", "Không tìm thấy kết quả!");
        }
    }
    // [GET]/blog/:id/update
    async update(req, res) {
        var blog = await Blog.findOne({ _id: req.params.id });
        const categories = await BlogCategory.find({});
        res.render("blog/update", {
            categories,
            blog,
        });
    }
    // [PUT]/blog/:id/update
    async putUpdate(req, res, next) {
        Blog.updateOne({ _id: req.params.id }, req.body)
            .then(() => {
                req.flash("success", "Cập nhật bài viết thành công!");
                res.redirect("/blog/list-blog");
            })
            .catch(next);
        // var blog= await Blog.findOne({ _id: req.params.id});
        // console.log(req.params.id);
        // console.log(blog);
        // const categories = await BlogCategory.find({});
        // res.render("blog/update",{
        //     categories,
        //     blog
        // });
    }

    async deleteBlog(req, res, next) {
        // code deleteblog in here
        Blog.deleteOne({ _id: req.params.id })
            .then(() => {
                req.flash("success", "Xóa bài viết thành công!");
                res.redirect("back");
            })
            .catch(next);
    }

    async addCategory(req, res, next) {
        const formDate = req.body;
        // console.log(req.body.category);
        const category = new BlogCategory(formDate);
        category
            .save()
            .then(() => {
                req.flash("success", "Đã thêm 1 thể loại!");
                res.redirect("back");
            })
            .catch((error) => {});
    }
    async listCategory(req, res, next) {
        const categories = await BlogCategory.find({});
        res.render("blog/list-category", {
            categories,
        });
    }

    async deleteCategory(req, res, next) {
        BlogCategory.deleteOne({ _id: req.params.id })
            .then(() => {
                res.redirect("back");
            })
            .catch(next);
    }
}

module.exports = new BlogController();
