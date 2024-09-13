import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.chain.upsert({
    where: { name: 'ethereum' },
    update: {
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.API_KEY_INFURA}`,
    },
    create: {
      name: 'ethereum',
      rpcUrl: `https://mainnet.infura.io/v3/${process.env.API_KEY_INFURA}`,
    },
  });

  await prisma.chain.upsert({
    where: { name: 'bsc' },
    update: { rpcUrl: 'https://bsc-dataseed.binance.org/' },
    create: {
      name: 'bsc',
      rpcUrl: 'https://bsc-dataseed.binance.org/',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
