import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Taken from https://www.prisma.io/docs/concepts/components/prisma-client/middleware/soft-delete-middleware
/***********************************/
/* SOFT DELETE MIDDLEWARE */
/***********************************/
prisma.$use(async (params, next) => {
// Check incoming query type
if (params.model == 'Post') {
    if (params.action == 'delete') {
    // Delete queries
    // Change action to an update
    params.action = 'update'
    params.args['data'] = { deleted: true }
    }
    if (params.action == 'deleteMany') {
    // Delete many queries
    params.action = 'updateMany'
    if (params.args.data != undefined) {
        params.args.data['deleted'] = true
    } else {
        params.args['data'] = { deleted: true }
    }
    }
}
return next(params)
})




export default prisma