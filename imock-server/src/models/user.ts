
import prisma from './db'

export async function findAllUsers() {
    const allUsers = await prisma.user.findMany()
    return allUsers
}

export async function findUserByEmail(email: string) {
    const user = await prisma.user.findFirst({
        where: {
            email
        }
    })

    return user
}

export async function updateUserEmail(userId: string, email: string) {
    const user = await prisma.user.update({
        where: {
            userId
        },
        data: {
            email
        }
    })

    return user
}

export async function createOrUpdateUserByEmail(email: string, password?: string) {
    const user = await findUserByEmail(email)

    if (!user) {
        const userId = await generateUserId()
        const newUser = await prisma.user.create({
            data: {
                email,
                userId,
                nickname: email,
                password,
            }
        })

        return newUser
    }

    return user
}


export async function updateUserPassword(userId: string, password: string) {
    const user = await prisma.user.update({
        where: {
            userId
        },
        data: {
            password
        }
    })

    return user
}

// implement a function that generates a unique id of 12 numbers
export async function generateUserId() {
    let id = ''
    while(id.length < 8) {
        id += Math.floor(Math.random() * 100000000).toString()
    }
    id = id.slice(0, 8)

    const user = await prisma.user.findUnique({
        where: {
            userId: id
        }
    })

    return user ? generateUserId() : id
}
