import * as fs from 'fs/promises';
import * as path from 'path';
import * as fsExtra from 'fs-extra';

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const tempFile = filePath + '.tmp';
  await fs.writeFile(tempFile, content, 'utf-8');
  await fs.rename(tempFile, filePath);
}

export async function copyFile(src: string, dest: string): Promise<void> {
  await ensureDir(path.dirname(dest));
  await fsExtra.copy(src, dest);
}

export async function removeFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath);
  return JSON.parse(content) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await writeFile(filePath, content);
}

export async function createSymlink(target: string, linkPath: string): Promise<void> {
  await ensureDir(path.dirname(linkPath));
  try {
    await fs.unlink(linkPath);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
  await fs.symlink(target, linkPath, 'file');
}

export async function isSymlink(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.lstat(filePath);
    return stats.isSymbolicLink();
  } catch {
    return false;
  }
}

export async function readDir(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function stat(filePath: string): Promise<{ isDirectory(): boolean; isFile(): boolean; size: number }> {
  return fs.stat(filePath);
}
