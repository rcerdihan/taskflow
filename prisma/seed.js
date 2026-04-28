const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  })

  // Check if board already exists
  const existingBoard = await prisma.board.findFirst({
    where: { userId: user.id }
  })

  if (!existingBoard) {
    const board = await prisma.board.create({
      data: {
        title: 'Project Roadmap',
        userId: user.id,
        columns: {
          create: [
            {
              title: 'To Do',
              order: 0,
              tasks: {
                create: [
                  { title: 'Research competitors', order: 0 },
                  { title: 'Design system', order: 1 }
                ]
              }
            },
            {
              title: 'In Progress',
              order: 1,
              tasks: {
                create: [
                  { title: 'Setup project repository', order: 0 }
                ]
              }
            },
            {
              title: 'Done',
              order: 2,
            }
          ]
        }
      }
    })
    console.log({ user, board })
  } else {
    console.log('Seed data already exists for this user.')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
