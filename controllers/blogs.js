const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/blogs", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post("/blogs", async (request, response) => {
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
  });
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete("/blogs/:id", async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

blogsRouter.put("/blogs/:id", async (request, response) => {
  const { body } = request;

  if (!body.likes) {
    return response.status(400).json({
      error: 'content missing',
    });
  }

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    returnOriginal: false,
    runValidators: true,
    context: "query",
  });
  
  if (updatedBlog) {
    response.json(updatedBlog);
  } else {
    return response.status(404).json({
      error: "blog already deleted",
    });
  }
});

module.exports = blogsRouter;
