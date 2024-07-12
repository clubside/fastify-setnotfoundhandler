'use strict'

const fs = require('node:fs')
const { smartify, addIndent } = require('./clubside-utils.js')

const pages = [
	{ name: 'About', link: '/about' }
]

let object

function drawPageLinks() {
	let returnBlock = ''
	for (const page of pages) {
		if (object.title === page.name) {
			returnBlock += `\t\t\t\t<li class="current-page">${page.name}</li>\n`
		} else {
			returnBlock += `\t\t\t\t<li><a href="${page.link}">${page.name}</a></li>\n`
		}
	}
	return returnBlock
}

function handleReplacements(match) {
	const templateItem = match.substring(4, match.length - 3).trim()
	// console.log(templateItem)
	let directive
	let param
	if (templateItem.indexOf(':') > -1) {
		directive = templateItem.substring(0, templateItem.indexOf(':'))
		param = templateItem.substring(templateItem.indexOf(':') + 1)
	} else {
		directive = templateItem
	}
	if (param && param[0] === '{') {
		param = JSON.parse(param)
	}
	// console.log(directive, param)
	switch (directive) {
		case 'var':
			if (object[param]) {
				return smartify(object[param])
			} else {
				return ''
			}
		case 'header': {
			let returnBlock = ''
			returnBlock += '\t<header>\n\n'
			returnBlock += '\t\t<nav>\n'
			returnBlock += '\t\t\t<div class="home">\n'
			returnBlock += '\t\t\t\t<a href="/"><img src="/img/fastify.png"></a>\n'
			returnBlock += '\t\t\t</div>\n'
			returnBlock += `\t\t\t<ul>\n${drawPageLinks()}\t\t\t</ul>\n`
			returnBlock += '\t\t\t<div class="account">\n'
			if (object.user) {
				const userAvatar = `/img/${object.user}.png`
				returnBlock += `\t\t\t\t<a class="logged-in" href="/profile">\n\t\t\t\t<img src="${userAvatar}" class="avatar">\n\t\t\t</a>\n`
			} else {
				returnBlock += '\t\t\t\t<a class="login-button" href="/login">Login</a>\n'
			}
			returnBlock += '\t\t\t</div>\n'
			returnBlock += '\t\t</nav>\n\n'
			returnBlock += '\t</header>\n'
			return returnBlock
		}
		case 'loginform': {
			if (object.loginForm) {
				let returnBlock = ''
				returnBlock += '<form id="login-form" name="login-form" method="post" action="/login">\n'
				returnBlock += '\t<label>\n'
				returnBlock += '\t\t<span>Username</span>\n'
				returnBlock += '\t\t<input id="username" name="username" type="text" placeholder="Enter your username" value="test">\n'
				returnBlock += '\t</label>\n'
				returnBlock += '\t<label>\n'
				returnBlock += '\t\t<span>Password</span>\n'
				returnBlock += '\t\t<input id="password" name="password" type="password" placeholder="Enter your password" value="Abstains-Encounters-Pityingly-Swearwords-Occupancy">\n'
				returnBlock += '\t</label>\n'
				returnBlock += '\t<div><button type="submit">Login</button></div>\n'
				returnBlock += '</form>\n'
				returnBlock = `\n\n${addIndent(returnBlock, 2)}\n`
				return returnBlock
			} else {
				return ''
			}
		}
		case 'logout': {
			if (object.logout) {
				let returnBlock = ''
				returnBlock += '<div class="user-logout">\n'
				returnBlock += '\t<a href="/logout">Logout</a>\n'
				returnBlock += '</div>\n'
				returnBlock = addIndent(returnBlock, 3)
				return returnBlock
			} else {
				return ''
			}
		}
		default:
			return ''
	}
}

async function generatePage() {
	console.log(object)
	const templateFile = fs.readFileSync('public/template.html')
	let templateHtml = templateFile.toString('utf-8')
	// console.log(templateHtml)
	templateHtml = templateHtml.replace(/<!--([\s\S]*?)-->/img, handleReplacements)
	// console.log(templateHtml)
	return templateHtml
}

function buildPageInfo(request, title) {
	const pageInfo = {
		title,
		role: 'guest'
	}
	try {
		console.log({ pageInfoUser: request.session.user })
		if (request.session.user) {
			pageInfo.role = request.session.user.role
			pageInfo.user = request.session.user.username
		}
	} catch (error) {
		console.log({ debug: 'buildPageInfo', session: request.session, error })
	}
	return pageInfo
}

exports.returnPage = async (request, reply, title, contents) => {
	object = buildPageInfo(request, title)
	object = { ...object, ...contents }
	reply.code(200)
	reply.header('Content-Type', 'text/html; charset=utf-8')
	reply.type('text/html')
	reply.send(await generatePage())
}

exports.returnNotFound = async (request, reply) => {
	object = buildPageInfo(request, '404')
	object.paragraph = 'This is not the page you are looking for.'
	reply.code(404)
	reply.header('Content-Type', 'text/html; charset=utf-8')
	reply.type('text/html')
	reply.send(await generatePage())
}

exports.returnForbidden = async (request, reply) => {
	object = buildPageInfo(request, '403')
	object.paragraph = 'Whoops!'
	reply.code(403)
	reply.header('Content-Type', 'text/html; charset=utf-8')
	reply.type('text/html')
	reply.send(await generatePage())
}
