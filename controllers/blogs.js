const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog
		.find({}).populate('user', { username: 1, name: 1 })

	response.json(blogs)
})


blogsRouter.post('/', async (request, response) => {
	const body = request.body
	if(!('likes' in body)){
		body.likes = 0
	}
	if(!body.title || !body.url)
	{
		response.status(400).json({ error: 'likes or url missing' })
	} else {
		const RequestUser = request.user
		if (!RequestUser) {
			return response.status(401).json({ error: 'token invalid' })
		}
		const user = await User.findById(RequestUser)

		const blog = new Blog( {
			title: body.title,
			author: body.author,
			url: body.url,
			likes: body.likes,
			user: user.id
		} )

		const savedBlog = await blog.save()

		user.blogs = user.blogs.concat(savedBlog._id)
		await user.save()

		response.status(201).json(savedBlog)
	}

})

blogsRouter.delete('/:id', async (request, response) => {
	const RequestUser = request.user
	const blog = await Blog.findById(request.params.id)
	if(RequestUser.toString() === blog.user.toString() && blog)
	{
		await Blog.findByIdAndRemove(request.params.id)
		response.status(204).end()
	} else {
		response.status(401).json({ error: 'unauthorized attempt' })
	}
})

blogsRouter.put('/:id', async (request, response) => {
	const body = request.body
	console.log(body)
	const blog = {
		'title': body.title,
		'author': body.author,
		'url': body.url,
		'likes': body.likes
	}
	const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
	response.status(200).json(updatedBlog)
})

module.exports = blogsRouter