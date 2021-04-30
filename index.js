require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const server = require('http').createServer(app)
const socket_io = require('socket.io')
const io = socket_io(server)
const morgan = require('morgan')
const BlockList = require('./services/Blockbook')

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', "*");
	req.io = io
	return next()
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

server.listen(process.env.PORT || 3000, () => {
	console.log(`Server running on port ${process.env.PORT}`)
})

io.on('connection', socket => {
	console.log(`socket connected ${socket.id}`)
})
app.use(morgan('dev'))
app.get('/healthcheck', async (request, response) => {
	try {
		const responseBlockBook = await BlockList.healthcheck()
		if (responseBlockBook.error) {
			return response.status(responseBlockBook.error.response.status).send({ message: responseBlockBook.error.response.data.error })
		}
		return response.status(200).send({ response: 'Ok Server Running' })
	} catch (err) {
		return response.status(400).send({ message: "ops, something went wrong!" })
	}
})
app.post('/balance/:address', async (request, response) => {
	try {
		const { address } = request.params
		let total_confirmed = 0
		let total_unconfirmed = 0

		const responseBlockBook = await BlockList.view(address)
		if (responseBlockBook.error) {
			return response.status(responseBlockBook.error.response.status).send({ message: responseBlockBook.error.response.data.error })
		}
		const addresses = responseBlockBook.data
		for (let item of addresses) {
			if (item.confirmations < 2) {
				total_unconfirmed += parseInt(item.value)
				request.io.emit('new_unconfirmed', total_unconfirmed)
			}
			if (item.confirmations >= 2) {
				total_confirmed += parseInt(item.value)
				request.io.emit('new_confirmed', total_confirmed)
			}
		}

		return response.status(200).send({ response: responseBlockBook.data, confirmed: total_confirmed, unconfirmed: total_unconfirmed })
	} catch (err) {
		return response.status(400).send({ message: "ops, something went wrong!", error: err })
	}
})