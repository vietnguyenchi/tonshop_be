import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { DatabaseService } from './../database/database.service';
export declare class AuthService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    login(loginDto: LoginDto): Promise<User>;
}
