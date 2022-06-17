import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

import { User } from '../user.entity'
import { UsersService } from '../users.service'

declare global {
  namespace Express {
    interface Request {
      CurrentUser?: User
    }
  }
}

@Injectable()
export class CurrectUserMiddleware implements NestMiddleware {

  constructor(private usersService: UsersService) { }

  async use(request: Request, response: Response, next: NextFunction) {

    const { userId } = request.session || {}

    if (userId) {
      const user = await this.usersService.findOne(userId)
      request.CurrentUser = user
    }
    next()
  }
}