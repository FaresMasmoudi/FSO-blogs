const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
	await Blog.deleteMany({})

	const blogObjects = helper.initialBlogs
		.map(blog => new Blog(blog))
	const promiseArray = blogObjects.map(blog => blog.save())
	await Promise.all(promiseArray)
})

test('blogs are returned as json and blogs number', async () => {
	const response = await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)
	expect(response.body).toHaveLength(6)
})

test('verify that id property is named id', async () => {
	const response = await api.get('/api/blogs')
	expect(response.body[0].id).toBeDefined()
})

test('a valid blog can be added', async () => {
	const response = await api
		.post('/api/login')
		.send({ username: 'root', password: 'sekret' })

	const token = response.body.token

	const newBlog = {
		title: 'JavaScript Belfalle9i',
		author: 'Hsan Directeur',
		url: 'http://www.hsouna.lem3allem.com.tn/hsounajavascript',
		likes: 19
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.set('Authorization', `Bearer ${token}`)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

	const titles = blogsAtEnd.map(r => r.title)
	expect(titles).toContain(
		'JavaScript Belfalle9i'
	)
})

test('checks if the likes property is missing 0 is affected to likes', async () => {
	const loginResponse = await api
		.post('/api/login')
		.send({ username: 'root', password: 'sekret' })

	const token = loginResponse.body.token
	const newBlog = {
		title: 'NodeJs is Special',
		author: 'Reb3i Mouleha',
		url: 'http://www.reb3i.moulaelmoul.com.tn/reb3iNodeJS'
	}

	const response = await api
		.post('/api/blogs')
		.send(newBlog)
		.set('Authorization', `Bearer ${token}`)
		.expect(201)
		.expect('Content-Type', /application\/json/)
	expect(response.body.likes).toBeDefined()

	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

	const titles = blogsAtEnd.map(r => r.title)
	expect(titles).toContain(
		'NodeJs is Special'
	)
})

test('checks if the url is missing request 400 is sent', async () => {
	const newBlog = {
		title: 'NodeJs is Special',
		author: 'Reb3i Mouleha'
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400)
})

test('checks if the title is missing request 400 is sent', async () => {
	const newBlog = {
		author: 'Reb3i Mouleha',
		url: 'http://www.reb3i.moulaelmoul.com.tn/reb3iNodeJS'
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400)
})

test('deleting an existing resource. succeeds with status code 204 if id is valid', async () => {
	const blogsAtStart = await helper.blogsInDb()
	const blogToDelete = blogsAtStart[0]

	await api
		.delete(`/api/blogs/${blogToDelete.id}`)
		.expect(204)

	const blogsAtEnd = await helper.blogsInDb()

	expect(blogsAtEnd).toHaveLength(
		helper.initialBlogs.length - 1
	)

	const titles = blogsAtEnd.map(r => r.title)

	expect(titles).not.toContain(blogsAtEnd.title)
})

test('updating likes on a blog', async () => {
	const blogsAtStart = await helper.blogsInDb()
	const blogToUpdate = blogsAtStart[0]
	const newBlog = { ...blogToUpdate, likes: 25 }
	await api
		.put(`/api/blogs/${blogToUpdate.id}`)
		.send(newBlog)
		.expect(200)

	const blogsAtEnd = await helper.blogsInDb()

	expect(blogsAtEnd[0].likes).toBe(25)
})

afterAll(async () => {
	await mongoose.connection.close()
})