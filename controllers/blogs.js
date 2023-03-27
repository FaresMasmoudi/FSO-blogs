const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
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
		const blog = new Blog(body)
		const savedBlog = await blog.save()
		response.status(201).json(savedBlog)
	}

})

blogsRouter.delete('/:id', async (request, response) => {
	const blog = await Blog.findById(request.params.id)
	if(blog) {
		await Blog.findByIdAndRemove(request.params.id)
		response.status(204).end()
	} else {
		response.status(404).end()
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