import { Command } from 'commander';
import chalk from 'chalk';
import { RegistryManager } from '../core/index.js';

export function createBackupCommand(): Command {
  return new Command('backup')
    .description('Backup all skills to a directory')
    .argument('<path>', 'Backup directory path')
    .action(async (path: string) => {
      try {
        const registryManager = new RegistryManager();
        const result = await registryManager.backupAll(path);
        
        console.log(chalk.green(`Backup completed successfully!`));
        console.log(chalk.gray(`  Skills backed up: ${result.count}`));
        console.log(chalk.gray(`  Location: ${result.path}`));
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AppError') {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
    });
}
