const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
  },
];
// const loggedInUserForToken = {
//     username: "lakshay",
//     //some random id
//     id: "617c13127b31603ced525532",
//   }

//   const token = jwt.sign(loggedInUserForToken, process.env.SECRET)

//   console.log("token: ", token);

const username = {
    username: "root",
    name: "Super duper user",
};

beforeEach(async () => {
  await Blog.deleteMany({});
  console.log("test db cleared");

  const blogObjects = initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  console.log("inital blogs loaded");

  await Promise.all(promiseArray);

  await User.deleteMany({});
  console.log("test user db cleared");

  const passwordHash = await bcrypt.hash("salainen", 10);

  const user = new User({...username, passwordHash});

  await user.save();

  console.log(user);

});

describe("fetching a blog", () => {
  test("Blogs are returned as json", async () => {
    console.log("entered test");
    const loginResponse = await api.post("/api/login").send({
      username: "root",
      password: "salainen",
  })
    console.log("loginResponse is: ", loginResponse)
    const responseToken = loginResponse.body
    console.log({responseToken})
    const token = `bearer ${responseToken.token}`
    console.log(token);
    
    await api
      .get("/api/blogs")
      .set("Authorization", token)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs").set("Authorization", token);
    expect(response.body).toHaveLength(initialBlogs.length);
  });

  test("unique identifier of a blog post is named id", async () => {
    console.log("entered a test");

    const loginResponse = await api.post("/api/login").send({
      username: "root",
      password: "salainen",
    })
    // console.log("loginResponse is: ", loginResponse)
    const responseToken = loginResponse.body
    // console.log({responseToken})
    const token = `bearer ${responseToken.token}`

    const response = await api.get("/api/blogs").set("Authorization", token);
    expect(response.body[0].id).toBeDefined();
  });
});

describe("addition of a blog", () => {
  test("a valid blog can be added", async () => {
    
    const loginResponse = await api.post("/api/login").send({
      username: "root",
      password: "salainen",
    })
    // console.log("loginResponse is: ", loginResponse)
    const responseToken = loginResponse.body
    // console.log({responseToken})
    const token = `bearer ${responseToken.token}`

    const newBlog = {
      title: "6 - Way more changes",
      author: "Mahela Jayawardene",
      url: "www.abcd.com",
      likes: "101",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", token)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs").set("Authorization", token);

    const titles = response.body.map((r) => r.title);

    expect(response.body).toHaveLength(initialBlogs.length + 1);
    expect(titles).toContain("6 - Way more changes");
  });

  test("blog without title or url is not added", async () => {
    const loginResponse = await api.post("/api/login").send({
      username: "root",
      password: "salainen",
    })
    // console.log("loginResponse is: ", loginResponse)
    const responseToken = loginResponse.body
    // console.log({responseToken})
    const token = `bearer ${responseToken.token}`

    const newBlog = {
      author: "Mahela Jayawardene",
      likes: "101",
    };

    await api.post("/api/blogs").set("Authorization", token).send(newBlog).expect(400);

    const response = await api.get("/api/blogs").set("Authorization", token);

    expect(response.body).toHaveLength(initialBlogs.length);
  }, 15000);

  test("adding a blog fails if a token is not provided", async() => {
    const loginResponse = await api.post("/api/login").send({
      username: "root",
      password: "salainen",
    })
    // console.log("loginResponse is: ", loginResponse)
    const responseToken = loginResponse.body
    // console.log({responseToken})
    const token = `bearer ${responseToken.token}`

    const newBlog = {
      title: "6 - Way more changes",
      author: "Mahela Jayawardene",
      url: "www.abcd.com",
      likes: "101",
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs").set("Authorization", token);

    const titles = response.body.map((r) => r.title);

    expect(response.body).toHaveLength(initialBlogs.length);
    expect(titles).not.toContain("6 - Way more changes");
  })

  test("blog without likes will have likes set to 0", async () => {
    const loginResponse = await api.post("/api/login").send({
      username: "root",
      password: "salainen",
    })
    // console.log("loginResponse is: ", loginResponse)
    const responseToken = loginResponse.body
    // console.log({responseToken})
    const token = `bearer ${responseToken.token}`

    const newBlog = {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
    };
    await api.post("/api/blogs").set("Authorization", token).send(newBlog).expect(201);

    const response = await api.get("/api/blogs").set("Authorization", token);
    const addedBlogArray = response.body.filter(
      (blog) => blog.title === "React patterns" && blog.likes === 0
    );
    const [addedBlog] = addedBlogArray;
    console.log("timepass: ", addedBlog);
    expect(addedBlog.likes).toBe(0);
  });
});

describe("deletion of a blog", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const loginResponse = await api.post("/api/login").send({
      username: "root",
      password: "salainen",
    })
    // console.log("loginResponse is: ", loginResponse)
    const responseToken = loginResponse.body
    // console.log({responseToken})
    const token = `bearer ${responseToken.token}`

    const newBlog = {
      title: "The Perks of being a Wallflower",
      author: "Stephen Chbosky",
      url: "https://g.co/kgs/1MhdEo",
      likes: 42,
    };

    await api.post('/api/blogs').send(newBlog).set("Authorization", token).expect(201)

    const blogsFromDb = await Blog.find({})
    const allBlogs = blogsFromDb.map(blog => blog.toJSON())

    const blogToDelete = allBlogs.find(blog => blog.title === newBlog.title)
    // console.log(blogToDelete.id)

    await api.delete(`/api/blogs/${blogToDelete.id}`).set("Authorization", token).expect(204);

    const blogs = await Blog.find({});
    const blogsAtEnd = blogs.map((blog) => blog.toJSON());

    expect(blogsAtEnd).toHaveLength(initialBlogs.length);

    const titles = blogsAtEnd.map((r) => r.title);

    expect(titles).not.toContain(blogToDelete.title);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
