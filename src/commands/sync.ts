import { Command } from 'commander';
import chalk from 'chalk';
import { RegistryManager, SyncEngine } from '../core/index.js';
import { getSupportedPlatforms } from '../adapters/index.js';

export function createSyncCommand(): Command {
  return new Command('sync')
    .description('Sync skills with a target platform')
    .argument('<platform>', 'Target platform')
    .option('--push', 'Push local skills to platform')
    .option('--pull', 'Pull skills from platform to local')
    .option('--link', 'Create symbolic links to local skills')
    .option('--dry-run', 'Show what would be done without making changes')
    .action(async (platform: string, options: { push?: boolean; pull?: boolean; link?: boolean; dryRun?: boolean }) => {
      try {
        const supportedPlatforms = getSupportedPlatforms();
        if (!supportedPlatforms.includes(platform.toLowerCase())) {
          console.error(chalk.red(`Error: Platform "${platform}" is not supported.`));
          console.log(`Supported platforms: ${supportedPlatforms.join(', ')}`);
          process.exit(1);
        }

        let mode: 'push' | 'pull' | 'link';
        if (options.push) {
          mode = 'push';
        } else if (options.pull) {
          mode = 'pull';
        } else if (options.link) {
          mode = 'link';
        } else {
          console.error(chalk.red('Error: Must specify one of --push, --pull, or --link'));
          process.exit(1);
        }

        const registryManager = new RegistryManager();
        const syncEngine = new SyncEngine(registryManager);

        const result = await syncEngine.sync({
          platform,
          mode,
          dryRun: options.dryRun,
        });

        console.log(chalk.green(`\nSync completed!`));
        if (result.pushed > 0) console.log(chalk.gray(`  Pushed: ${result.pushed}`));
        if (result.pulled > 0) console.log(chalk.gray(`  Pulled: ${result.pulled}`));
        if (result.linked > 0) console.log(chalk.gray(`  Linked: ${result.linked}`));
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AppError') {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
    });
}
