import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthService } from './auth.service'
import { User } from './user.entity'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

describe('UsersController', () => {
  let controller: UsersController
  let fakeUsersService: Partial<UsersService>
  let fakeAuthService: Partial<AuthService>

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'asd@asd.com',
          password: 'asd'
        } as User)
      },
      find: (email: string) => {
        return Promise.resolve([{
          id: 1,
          email: 'asd@asd.com',
          password: 'asd'
        } as User])
      },
      // remove: () => { },
      // update: () => { }
    }

    fakeAuthService = {
      // signup: () => { },
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User)
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile()

    controller = module.get<UsersController>(UsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('asd@asd.com')
    expect(users.length).toEqual(1)
    expect(users[0].email).toEqual('asd@asd.com')
  })


  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findAllUsers('1')
    expect(user).toBeDefined()
  })


  it('findUser throws an error if the user with the given id is not found', async () => {
    expect.assertions(1)
    fakeUsersService.findOne = () => null
    try {
      await controller.findUser('1')
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  it('signin updates session object and returns user', async () => {
    const session = { userId: -1 }
    const user = await controller.signin(
      {
        email: 'asd@asd.com',
        password: '123456'
      },
      session
    )
    expect(user.id).toEqual(1)
    expect(session.userId).toEqual(1)
  })

  // it('',async() => {

  // })
})
