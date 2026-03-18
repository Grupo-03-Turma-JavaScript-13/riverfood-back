import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    sub: {
      id: number;
      usuario: string; // e-mail do restaurante
    };
  };
}