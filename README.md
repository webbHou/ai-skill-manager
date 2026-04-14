# AI Skill Manager CLI

命令行工具，用于管理和同步多种 AI 工具（Claude、GitHub Copilot、Cursor 等）的 skill 配置。

## 功能特性

- **多平台支持**: Claude、GitHub Copilot、Cursor
- **Skill 管理**: 添加、删除、更新、列出 skill
- **导入导出**: 支持在文件间导入导出 skill 配置
- **同步功能**: 支持 push/pull 以及软链接同步
- **备份恢复**: 一键备份和恢复所有 skill

## 安装

```bash
npm install -g
```

或直接运行：

```bash
npx skill-cli --help
```

## 使用方法

### 初始化

```bash
skill-cli init
```

### 列出所有 skill

```bash
skill-cli list
skill-cli list --platform claude
```

### 添加 skill

```bash
skill-cli add my-skill --platform claude --file ./skill.json
skill-cli add my-skill --platform claude --inline '{"name": "my-skill"}'
```

### 删除 skill

```bash
skill-cli remove my-skill
```

### 更新 skill

```bash
skill-cli update my-skill --file ./new-skill.json
skill-cli update my-skill --description "New description"
```

### 导出 skill

```bash
skill-cli export my-skill --output ./backup/my-skill.json
```

### 导入 skill

```bash
skill-cli import ./backup/my-skill.json
```

### 同步

```bash
# 推送到平台
skill-cli sync claude --push

# 从平台拉取
skill-cli sync claude --pull

# 使用软链接同步
skill-cli sync claude --link

# 预览模式
skill-cli sync claude --push --dry-run
```

### 验证

```bash
skill-cli validate my-skill
skill-cli validate --all
```

### 备份和恢复

```bash
skill-cli backup ./backup
skill-cli restore ./backup
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 构建
npm run build
```

## 技术栈

- TypeScript
- Commander.js
- Vitest
