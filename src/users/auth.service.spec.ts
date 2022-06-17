import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { AuthService } from './auth.service'
import { User } from './user.entity'
import { UsersService } from './users.service'

describe('AuthService', () => {

  let service: AuthService
  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    //Create a fake copy of the users service
    const users: User[] = []
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email)
        return Promise.resolve(filteredUsers)
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password
        } as User
        users.push(user)
        return Promise.resolve(user)
      }
    }

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        }
      ]
    }).compile()

    service = module.get(AuthService)
  })


  it('can create an instace of auth service', async () => {
    expect(service).toBeDefined()
  })

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test10@test.com', '123456')
    expect(user.password).not.toEqual('123456')
    const [salt, hash] = user.password.split('.')
    expect(salt).toBeDefined()
    expect(hash).toBeDefined()
  })

  it('throws an error if user signs up with email that is in use', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'test10@test.com', password: '123456' } as User,
      ])

    expect.assertions(2)

    try {
      await service.signup('test11@test.com', '123456')
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException)
      expect(err.message).toBe('Email in use')
    }
  })

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asd@asd.com', 'pass')
    try {
      await service.signup('a@a.pl', 'pass')
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException)
      expect(err.message).toBe('Email in use')
    }
  })

  it('throws if signin is called with an unused email', async () => {
    try {
      await service.signin('asdflkj@asdlfkj.com', 'passdflkj')
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException)
      expect(err.message).toBe('User not found')
    }
  })

  it('throws if an invalid password is provided', async () => {
    await service.signup('asd@asd.com', '123456')

    try {
      await service.signin('asd@asd.com', '123456d')
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException)
      expect(err.message).toBe('Bad password')
    }
  })

  it('returns an user if correct password is provided', async () => {
    await service.signup('asd@asd.com', '123456')

    const user = await service.signin('asd@asd.com', '123456')

    expect(user).toBeDefined()
  })

  // it('', async () => {
  // })

})

