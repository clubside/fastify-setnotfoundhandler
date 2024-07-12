'use strict'

const fs = require('node:fs')
const path = require('node:path')
const fastify = require('fastify')
const fastifyRequestLogger = require('@mgcrea/fastify-request-logger')
// eslint-disable-next-line no-unused-vars
const prettifier = require('@mgcrea/pino-pretty-compact')
const fastifySecureSession = require('@fastify/secure-session')
const fastifyFormBody = require('@fastify/formbody')
const fastifyStatic = require('@fastify/static')
const { returnPage, returnNotFound, returnForbidden } = require('./generator.js')

const app = fastify({
	logger: {
		level: 'debug',
		transport: {
			target: '@mgcrea/pino-pretty-compact',
			options: { translateTime: 'SYS:mm/dd/yy HH:MM:ss', ignore: 'pid,hostname' }
		}
	},
	disableRequestLogging: true
})

app.register(async function (app) {
	app.register(fastifyRequestLogger)
	app.register(fastifySecureSession, {
		key: fs.readFileSync(path.join(__dirname, 'secret-key')),
		cookie: {
			path: '/'
		}
	})
	app.register(fastifyFormBody)

	app.setNotFoundHandler(async (request, reply) => {
		// console.log({ notFoundUser: request })
		returnNotFound(request, reply)
	})

	app.get('/profile', async (request, reply) => {
		if (request.session.user) {
			const contents = {
				paragraph: 'Hey, it\'s you!',
				logout: true
			}
			returnPage(request, reply, 'Profile', contents)
		} else {
			returnForbidden(request, reply)
		}
	})

	app.get('/logout', (request, reply) => {
		request.session.delete()
		reply.redirect('/')
	})

	app.post('/login', (request, reply) => {
		console.log(request.body)
		const loginInfo = request.body
		if (loginInfo.username === 'test' && loginInfo.password === 'Abstains-Encounters-Pityingly-Swearwords-Occupancy') {
			request.session.set('user', {
				username: 'test',
				role: 'user'
			})
			reply.redirect('/profile')
		} else {
			const contents = {
				paragraph: 'Uh-oh, I don\'t recognize you.',
				loginForm: true
			}
			returnPage(request, reply, 'Login', contents)
		}
	})

	app.get('/login', (request, reply) => {
		const contents = {
			paragraph: 'The fields are set but have fun if you want 😛.',
			loginForm: true
		}
		returnPage(request, reply, 'Login', contents)
	})

	app.get('/about', async (request, reply) => {
		const contents = {
			paragraph: 'Trying to figure out why <pre>fastify.setNotFoundHandler()</pre> doesn\'t work with sessions.'
		}
		returnPage(request, reply, 'About', contents)
	})

	app.get('/', async (request, reply) => {
		const contents = {
			paragraph: 'This is my home page. There are many like it but this one is mine.'
		}
		returnPage(request, reply, 'Home', contents)
	})
})

// static file server
app.register(fastifyStatic, {
	root: path.join(__dirname, 'public')
})

app.listen({ port: 3600 }, (err, address) => {
	if (err) throw err
})
