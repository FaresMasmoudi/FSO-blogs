const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({})

		const passwordHash = await bcrypt.hash('sekret', 10)
		const user = new User({ username: 'root', passwordHash })

		await user.save()
	})

	test('creation succeeds with a fresh username and valid password', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'samara',
			name: 'Samara Vitti',
			password: 'sama1234',
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map(u => u.username)
		expect(usernames).toContain(newUser.username)
	})

	test('creation fails with proper statuscode and message if username already taken even with valid password', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'root',
			name: 'Superuser',
			password: 'samsoum',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('expected `username` to be unique')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})

	test('creation fails with proper statuscode and message if password is invalid even with new username', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'hammouda',
			name: 'hamma elghali',
			password: '12',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(401)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('invalid password')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})

	test('creation fails with proper statuscode and message if username is < 3 char long', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'gi',
			name: 'gigina',
			password: '12345678',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		console.log(result.body.error)
		expect(result.body.error).toContain('minimum allowed length (3)')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})