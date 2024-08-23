import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { User } from './interfaces/user.interface';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: Prisma.UserCreateInput): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, updateUserDto: Prisma.UserUpdateInput): Promise<User>;
    remove(telegramId: string): Promise<Prisma.BatchPayload>;
}
