import { PrismaClient } from '@prisma/client'
import { YooCheckout } from '@a2seven/yoo-checkout'
import { mockDeep, DeepMockProxy, mock } from 'jest-mock-extended'

export type Context = {
  prisma: PrismaClient
  yooCheckout: YooCheckout
}

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>
  yooCheckout: DeepMockProxy<YooCheckout>
}

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
    yooCheckout: mockDeep<YooCheckout>()
  }
}