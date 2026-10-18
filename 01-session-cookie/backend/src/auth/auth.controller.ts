import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
