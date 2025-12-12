import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientBalanceException extends HttpException {
  constructor(required: number, available: number) {
    super(
      {
        error: 'InsufficientBalance',
        message: `Insufficient balance. Required: ${required}, Available: ${available}`,
        statusCode: HttpStatus.PAYMENT_REQUIRED,
      },
      HttpStatus.PAYMENT_REQUIRED
    );
  }
}

export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(
      {
        error: 'UserNotFound',
        message: `User ${userId} not found`,
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class BattleNotFoundException extends HttpException {
  constructor(battleId: string) {
    super(
      {
        error: 'BattleNotFound',
        message: `Battle ${battleId} not found`,
        statusCode: HttpStatus.NOT_FOUND,
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class InvalidTransactionException extends HttpException {
  constructor(reason: string) {
    super(
      {
        error: 'InvalidTransaction',
        message: `Transaction failed: ${reason}`,
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(reason?: string) {
    super(
      {
        error: 'Unauthorized',
        message: reason || 'Unauthorized access',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class DuplicateUserException extends HttpException {
  constructor(identifier: string) {
    super(
      {
        error: 'DuplicateUser',
        message: `User with identifier ${identifier} already exists`,
        statusCode: HttpStatus.CONFLICT,
      },
      HttpStatus.CONFLICT
    );
  }
}

export class InvalidGameStateException extends HttpException {
  constructor(currentState: string, requiredState: string) {
    super(
      {
        error: 'InvalidGameState',
        message: `Invalid game state. Current: ${currentState}, Required: ${requiredState}`,
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class BattleFullException extends HttpException {
  constructor(battleId: string, maxPlayers: number) {
    super(
      {
        error: 'BattleFull',
        message: `Battle ${battleId} is full (${maxPlayers} players)`,
        statusCode: HttpStatus.CONFLICT,
      },
      HttpStatus.CONFLICT
    );
  }
}

export class CheatingDetectedException extends HttpException {
  constructor(reason: string, userId?: string) {
    super(
      {
        error: 'CheatingDetected',
        message: `Cheating detected: ${reason}`,
        userId,
        statusCode: HttpStatus.FORBIDDEN,
      },
      HttpStatus.FORBIDDEN
    );
  }
}
