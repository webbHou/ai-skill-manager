import { Command } from 'commander';
import chalk from 'chalk';
import { RegistryManager } from '../core/index.js';

export function createInitCommand(): Command {
  return new Command('init')
    .description('Initialize a new skill registry')
    .argument('[path]', 'Path to registry file', '.skill-registry.json')
    .option('-f, --force', 'Force initialization, overwrite if exists')
    .action(async (path: string, options: { force?: boolean }) => {
      try {
        const registryManager = new RegistryManager(path);
        await registryManager.createRegistry(options.force);
        console.log(chalk.green(`Registry initialized at ${path}`));
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AppError') {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
    });
}
