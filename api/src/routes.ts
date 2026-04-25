import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function routes(app: FastifyInstance) {
  // --- AUTH MIDDLEWARE ---
  async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  }

  // --- USERS & AUTH ---
  app.post('/users', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
    })

    const { name, email, password } = createUserSchema.parse(request.body)

    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) {
      return reply.status(400).send({ message: 'User already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 6)
    await prisma.user.create({
      data: { name, email, password: passwordHash },
    })

    return reply.status(201).send()
  })

  app.post('/sessions', async (request, reply) => {
    const createSessionSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = createSessionSchema.parse(request.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.status(400).send({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return reply.status(400).send({ message: 'Invalid credentials' })
    }

    const token = app.jwt.sign({ name: user.name }, { sub: user.id, expiresIn: '7d' })

    return reply.status(200).send({ token, user: { id: user.id, name: user.name, email: user.email } })
  })

  app.get('/me', { preHandler: [verifyJwt] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
      select: { id: true, name: true, email: true }
    })
    return reply.status(200).send({ user })
  })

  // --- CLIENTS ---
  app.post('/clients', { preHandler: [verifyJwt] }, async (request, reply) => {
    const createClientSchema = z.object({
      name: z.string().min(1),
      phone: z.string().min(1),
    })

    const { name, phone } = createClientSchema.parse(request.body)

    const client = await prisma.client.create({
      data: {
        name,
        phone,
        userId: request.user.sub,
      },
    })

    return reply.status(201).send(client)
  })

  app.get('/clients', { preHandler: [verifyJwt] }, async (request, reply) => {
    const clients = await prisma.client.findMany({
      where: { userId: request.user.sub },
      orderBy: { createdAt: 'desc' }
    })
    return reply.status(200).send(clients)
  })

  app.put('/clients/:id', { preHandler: [verifyJwt] }, async (request, reply) => {
    const updateClientParamsSchema = z.object({ id: z.string() })
    const updateClientSchema = z.object({
      name: z.string().min(1),
      phone: z.string().min(1),
    })

    const { id } = updateClientParamsSchema.parse(request.params)
    const { name, phone } = updateClientSchema.parse(request.body)

    const client = await prisma.client.findUnique({ where: { id } })
    if (!client || client.userId !== request.user.sub) {
      return reply.status(404).send({ message: 'Client not found' })
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: { name, phone },
    })

    return reply.status(200).send(updatedClient)
  })

  app.delete('/clients/:id', { preHandler: [verifyJwt] }, async (request, reply) => {
    const deleteClientParamsSchema = z.object({ id: z.string() })
    const { id } = deleteClientParamsSchema.parse(request.params)

    const client = await prisma.client.findUnique({ where: { id } })
    if (!client || client.userId !== request.user.sub) {
      return reply.status(404).send({ message: 'Client not found' })
    }

    await prisma.client.delete({ where: { id } })
    return reply.status(204).send()
  })

  // --- CHARGES ---
  app.post('/charges', { preHandler: [verifyJwt] }, async (request, reply) => {
    const createChargeSchema = z.object({
      amount: z.number().positive(),
      description: z.string().min(1),
      dueDate: z.string().transform((str) => new Date(str)),
      clientId: z.string().uuid(),
    })

    const { amount, description, dueDate, clientId } = createChargeSchema.parse(request.body)

    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client || client.userId !== request.user.sub) {
      return reply.status(404).send({ message: 'Client not found' })
    }

    const charge = await prisma.charge.create({
      data: {
        amount,
        description,
        dueDate,
        clientId,
        userId: request.user.sub,
      },
    })

    return reply.status(201).send(charge)
  })

  app.get('/charges', { preHandler: [verifyJwt] }, async (request, reply) => {
    const charges = await prisma.charge.findMany({
      where: { userId: request.user.sub },
      include: { client: true },
      orderBy: { dueDate: 'asc' }
    })
    return reply.status(200).send(charges)
  })

  app.patch('/charges/:id/status', { preHandler: [verifyJwt] }, async (request, reply) => {
    const updateChargeParamsSchema = z.object({ id: z.string() })
    const updateChargeSchema = z.object({ status: z.enum(['PENDING', 'PAID']) })

    const { id } = updateChargeParamsSchema.parse(request.params)
    const { status } = updateChargeSchema.parse(request.body)

    const charge = await prisma.charge.findUnique({ where: { id } })
    if (!charge || charge.userId !== request.user.sub) {
      return reply.status(404).send({ message: 'Charge not found' })
    }

    const updatedCharge = await prisma.charge.update({
      where: { id },
      data: { status },
    })

    return reply.status(200).send(updatedCharge)
  })

  // --- DASHBOARD ---
  app.get('/dashboard', { preHandler: [verifyJwt] }, async (request, reply) => {
    const userId = request.user.sub

    const charges = await prisma.charge.findMany({
      where: { userId }
    })

    const now = new Date()

    const totalReceived = charges
      .filter(c => c.status === 'PAID')
      .reduce((acc, c) => acc + c.amount, 0)

    const totalPending = charges
      .filter(c => c.status === 'PENDING' && c.dueDate >= now)
      .reduce((acc, c) => acc + c.amount, 0)

    const totalOverdue = charges
      .filter(c => c.status === 'PENDING' && c.dueDate < now)
      .reduce((acc, c) => acc + c.amount, 0)

    return reply.status(200).send({
      totalReceived,
      totalPending,
      totalOverdue,
    })
  })
}
