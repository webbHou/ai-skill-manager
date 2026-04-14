import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import { RegistryManager } from '../core/index.js';
import { getAdapter, getSupportedPlatforms } from '../adapters/index.js';
import { readFile, fileExists } from '../utils/file.js';

export function createAddCommand(): Command {
  return new Command('add')
    .description('Add a new skill to the registry')
    .argument('<name>', 'Skill name')
    .requiredOption('-p, --platform <platform>', 'Target platform')
    .option('-f, --file <path>', 'Path to skill config file')
    .option('-i, --inline <content>', 'Inline JSON content')
    .option('-d, --description <desc>', 'Skill description')
    .option('-t, --tags <tags...>', 'Skill tags')
    .action(async (name: string, options: {
      platform?: string;
      file?: string;
      inline?: string;
      description?: string;
      tags?: string[];
    }) => {
      try {
        if (!options.platform) {
          console.error(chalk.red('Error: --platform is required'));
          process.exit(1);
        }

        const supportedPlatforms = getSupportedPlatforms();
        if (!supportedPlatforms.includes(options.platform.toLowerCase())) {
          console.error(chalk.red(`Error: Platform "${options.platform}" is not supported.`));
          console.log(`Supported platforms: ${supportedPlatforms.join(', ')}`);
          process.exit(1);
        }

        const registryManager = new RegistryManager();
        const adapter = getAdapter(options.platform)!;

        let configPath: string;

        if (options.file) {
          const filePath = path.resolve(options.file);
          if (!(await fileExists(filePath))) {
            console.error(chalk.red(`Error: File not found: ${filePath}`));
            process.exit(1);
          }
          configPath = options.file;
        } else if (options.inline) {
          const tempPath = path.join('.skill-temp', `${name}.json`);
          await import('fs/promises').then(fs => fs.writeFile(tempPath, options.inline!, 'utf-8'));
          configPath = tempPath;
        } else {
          console.error(chalk.red('Error: Either --file or --inline is required'));
          process.exit(1);
        }

        const skill = await registryManager.addSkill({
          name,
          platform: options.platform,
          configPath,
          metadata: {
            description: options.description,
            tags: options.tags,
          },
        });

        console.log(chalk.green(`Skill "${name}" added successfully!`));
        console.log(chalk.gray(`  ID: ${skill.id}`));
        console.log(chalk.gray(`  Platform: ${skill.platform}`));
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AppError') {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
    });
}
