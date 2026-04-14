import { Command } from 'commander';
import chalk from 'chalk';
import { RegistryManager } from '../core/index.js';

export function createRestoreCommand(): Command {
  return new Command('restore')
    .description('Restore skills from a backup directory')
    .argument('<path>', 'Backup directory path')
    .action(async (path: string) => {
      try {
        const registryManager = new RegistryManager();
        const result = await registryManager.restoreAll(path);
        
        console.log(chalk.green(`Restore completed successfully!`));
        console.log(chalk.gray(`  Skills restored: ${result.count}`));
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AppError') {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
    });
}
