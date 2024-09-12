import { Bot as GrammyBot } from 'grammy';

export function createBot(token: string) {
  const bot = new GrammyBot(token);

  return bot;
}

// export type Bot = ReturnType<typeof createBot>;
