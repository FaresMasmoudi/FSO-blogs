const _ = require('lodash')

const dummy = (blogs) => 1

const totalLikes = (blogs) => {
	const reducer = (sum, item) => {
		return sum + item.likes
	}
	return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
	return blogs.find(blog => blog.likes === Math.max(...blogs.map(blog => blog.likes)))
}

const mostBlogs = (blogs) => {
	const authorsWithBlogs = _.countBy(blogs.map(blog => blog.author), blogs.author)
	const valArr = Object.values(authorsWithBlogs)
	const max = Math.max(...valArr)
	const authorWithMostBlogs = {
		'author': Object.keys(authorsWithBlogs)[valArr.indexOf(max)],
		'blogs': max
	}
	return authorWithMostBlogs
}

const mostLikes = (blogs) => {
	const authorsWithLikesArr = blogs.map(blog => ({ 'author':blog.author, 'likes': blog.likes }))
	const reducedArr = authorsWithLikesArr.reduce((acc, curr) => {
		const index = acc.findIndex(item => item.author === curr.author)
		index > -1 ? acc[index].likes += curr.likes : acc.push({
			'author': curr.author,
			'likes': curr.likes
		})
		return acc
	}, [])
	console.log(reducedArr)
	const authorWithMostLikes = reducedArr.reduce((prev, current) => prev.likes > current.likes ? prev : current)
	return authorWithMostLikes
}

module.exports = {
	dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}