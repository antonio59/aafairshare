import { pingDatabase } from '../src/utils/keepAlive';

async function main() {
  try {
    await pingDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Keep-alive script failed:', error);
    process.exit(1);
  }
}

main();
