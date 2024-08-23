export class LoginDto {
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  hash: string;
  authDate: Date;
}
