const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')


const mongoUrl = config.MONGODB_URI;
logger.info('connecting to', mongoUrl)

mongoose.connect(mongoUrl)
    .then((result) => {
        logger.info('connected to MongoDB');
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message);
    });

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/blogs', middleware.userExtractor, blogsRouter)

if (process.env.NODE_ENV === 'test') {
    const testingRouter = require('./controllers/testing')
    app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app