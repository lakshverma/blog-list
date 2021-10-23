const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
    const reducer = (previous, current) => {
        return previous + current.likes
    }
    return blogs.reduce(reducer,0)
}

const favoriteBlog = (blogs) => {
    const reducer = (previous, current) => {
        return previous.likes > current.likes 
        ? previous
        : current
    }
    return blogs.reduce(reducer)

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
};
