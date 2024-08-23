"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_service_1 = require("./../database/database.service");
const common_1 = require("@nestjs/common");
let UserService = class UserService {
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    create(createUserDto) {
        return this.databaseService.user.create({ data: createUserDto });
    }
    findAll() {
        return this.databaseService.user.findMany();
    }
    findOne(id) {
        return this.databaseService.user.findUnique({ where: { id } });
    }
    update(id, updateUserDto) {
        return this.databaseService.user.update({
            where: { id },
            data: updateUserDto,
        });
    }
    remove(telegramId) {
        return this.databaseService.user.deleteMany({ where: { telegramId } });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], UserService);
//# sourceMappingURL=user.service.js.map