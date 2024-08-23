import { DatabaseService } from './../database/database.service';
import { Prisma } from '@prisma/client';
export declare class UserService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    create(createUserDto: Prisma.UserCreateInput): Prisma.Prisma__UserClient<{
        id: string;
        telegramId: string;
        username: string;
        firstName: string;
        lastName: string;
        hash: string;
        authDate: Date;
        photoUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): Prisma.PrismaPromise<{
        id: string;
        telegramId: string;
        username: string;
        firstName: string;
        lastName: string;
        hash: string;
        authDate: Date;
        photoUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Prisma.Prisma__UserClient<{
        id: string;
        telegramId: string;
        username: string;
        firstName: string;
        lastName: string;
        hash: string;
        authDate: Date;
        photoUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateUserDto: Prisma.UserUpdateInput): Prisma.Prisma__UserClient<{
        id: string;
        telegramId: string;
        username: string;
        firstName: string;
        lastName: string;
        hash: string;
        authDate: Date;
        photoUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(telegramId: string): Prisma.PrismaPromise<Prisma.BatchPayload>;
}
