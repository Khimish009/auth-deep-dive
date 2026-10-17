import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}
}
