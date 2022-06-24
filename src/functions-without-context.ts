import prisma from '../client'

interface CreateUser {
  name: string
  email: string
  acceptTermsAndConditions: boolean
}

export async function createUser(user: CreateUser) {
  if (user.acceptTermsAndConditions) {
    const result =  await prisma.user.create({
      data: user,
    })
    
    return {
      id: result.id,
      name: result.name,
      email: result.email,
    }
  } else {
    return new Error('User must accept terms!')
  }
}

interface UpdateUser {
  id: number
  name: string
  email: string
}

export async function updateUsername(user: UpdateUser) {
  const result = await prisma.user.update({
    where: { id: user.id },
    data: user,
  })

  return {
    id: result.id,
    name: result.name,
    email: result.email,
  }
}