import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SessionsModule } from '../sessions/sessions.module.js';

@Module({
  imports: [UsersModule, SessionsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
