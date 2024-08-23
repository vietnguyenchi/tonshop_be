export interface User {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  hash: string;
  authDate: Date;
}
