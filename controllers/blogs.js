const blogsRouter = require("express").Router();
// const User = require("../models/user");
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  // From userExtractor Middleware
  const user = request.user;
  console.log("inside post route", user);
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
    user: user._id,
  });
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  // From userExtractor Middleware
  const user = request.user;

  const blogToDelete = await Blog.findById(request.params.id);
  const blogCreator = blogToDelete.user.toString()

  if (blogCreator === user.id) {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  }
  return response.status(403).json({ error: " blog can be deleted only by the user who added the blog" })
});

blogsRouter.put("/:id", async (request, response) => {
  const { body } = request;

  if (!body.likes) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true }).populate("user", { username: 1, name: 1 });

  if (updatedBlog) {
    response.json(updatedBlog);
  } else {
    return response.status(404).json({
      error: "blog already deleted",
    });
  }
});

module.exports = blogsRouter;
