const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (previous, current) => {
    return previous + current.likes;
  };
  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const reducer = (previous, current) => {
    return previous.likes > current.likes ? previous : current;
  };
  return blogs.reduce(reducer);
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return;
  }
  // Updates an Object with keys as author names and values as the frequency of author's occurance.
  // For each blog, blog.author (author's name) is added to the frequency object if its not a part of the object already.
  // If, blog.author has been a part of the frequency object already, its value is updated by +1
  const reducer = (frequency, blog) => {
    frequency[blog.author] = (frequency[blog.author] || 0) + 1;
    // console.log(frequency)
    return frequency;
  }

  //The reducer variable is passed on to the Array.reduce method which takes an empty object as the initial value
  let authorFreqArray = blogs.reduce(reducer, {});
  let maxAuthorCount = Math.max(...Object.values(authorFreqArray));
  let mostFrequent = Object.keys(authorFreqArray).filter(
    (author) => authorFreqArray[author] === maxAuthorCount
  );
  console.log(mostFrequent);
  return {
    author: mostFrequent[0],
    blogs: maxAuthorCount,
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return;
  }

  //Same explanation as mostBlogs function except that the value of likes is updated by the value of current blog's likes
  const reducer = (likesCount, blog) => {
    likesCount[blog.author] = (likesCount[blog.author] || 0) + blog.likes;
    return likesCount;
  };

  let likesCountArray = blogs.reduce(reducer, {});
  console.log(likesCountArray);
  let maxLikeCount = Math.max(...Object.values(likesCountArray));
  let mostLiked = Object.keys(likesCountArray).filter(
    (author) => likesCountArray[author] === maxLikeCount
  );
  return {
    author: mostLiked[0],
    likes: maxLikeCount,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
