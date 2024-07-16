import {Prisma} from ".prisma/client";

export const PRISMA_LOGGING_SETTINGS: Prisma.Subset<Prisma.PrismaClientOptions, Prisma.PrismaClientOptions> = {
    log: ['warn', 'error']
};