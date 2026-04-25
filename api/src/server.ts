import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import { routes } from './routes'

dotenv.config()

const app = fastify({ logger: true })

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret'
})

app.register(routes)

app.listen({ port: Number(process.env.PORT) || 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})
