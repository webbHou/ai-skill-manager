# 需求文档

## 引言

本项目旨在开发一个名为 `ai-skill-manager` 的命令行工具，用于管理和同步多种 AI 工具（如 Claude、GitHub Copilot、Cursor 等）的 skill 配置。该工具允许用户在本地文件系统中存储、查看、添加、删除和更新 skill 配置，并支持在不同 AI 工具平台间同步和导入导出 skill 数据。

## 词汇表

- **Skill**：AI 工具的功能扩展或配置单元，定义工具的行为和能力
- **Skill 配置**：以结构化格式（JSON/YAML）存储的 skill 定义
- **本地注册表**：本地文件系统中的 skill 存储位置
- **目标平台**：支持 skill 管理的 AI 工具（如 Claude、Copilot、Cursor）
- **同步**：将本地 skill 配置与应用层 skill 定义进行双向转换
- **软链接同步**：通过符号链接（symbolic link）引用而非真实文件复制的同步方式
- **Skill 备份**：将所有 skill 配置完整导出到指定目录进行归档

## 需求

### 需求 1：Skill 注册表管理

**用户故事：** 作为用户，我希望将 skill 配置存储在本地文件系统中，以便我可以查看和管理我的所有 skill 配置。

#### Acceptance Criteria

1. WHEN 用户执行 `skill init` 命令，系统 SHALL 在当前目录或指定路径创建一个 skill 注册表
2. WHEN 用户执行 `skill list` 命令，系统 SHALL 显示注册表中所有已注册的 skill
3. WHEN 用户执行 `skill list --platform <name>` 命令，系统 SHALL 仅显示指定平台的 skill
4. WHEN 注册表不存在时，系统 SHALL 创建一个空的注册表文件

---

### 需求 2：Skill 的添加、删除和更新

**用户故事：** 作为用户，我希望能够添加新的 skill、删除不需要的 skill 以及更新现有 skill 的配置，以便我能够灵活管理我的 skill 集合。

#### Acceptance Criteria

1. WHEN 用户执行 `skill add <name> --platform <platform> --file <path>` 命令，系统 SHALL 将指定的 skill 配置文件添加到注册表
2. WHEN 用户执行 `skill add <name> --platform <platform> --inline <content>` 命令，系统 SHALL 将内联 JSON 内容解析并添加到注册表
3. WHEN 用户执行 `skill remove <name>` 命令，系统 SHALL 从注册表中删除指定名称的 skill
4. WHEN 用户执行 `skill update <name> --file <path>` 命令，系统 SHALL 使用新内容替换注册表中对应 skill 的配置
5. IF 用户尝试添加一个已存在的 skill 名称，系统 SHALL 返回错误并提示用户使用 update 命令

---

### 需求 3：Skill 导出和备份功能

**用户故事：** 作为用户，我希望能够将 skill 导出为独立文件，以及备份所有 skill 配置，以便我可以与其他工具或平台共享或归档。

#### Acceptance Criteria

1. WHEN 用户执行 `skill export <name> --output <path>` 命令，系统 SHALL 将指定 skill 的配置导出到目标路径
2. WHEN 用户执行 `skill export --all --output <directory>` 命令，系统 SHALL 将所有 skill 导出到目标目录，每个 skill 单独一个文件
3. WHEN 导出路径的父目录不存在，系统 SHALL 自动创建该目录结构
4. WHEN 导出成功时，系统 SHALL 向用户显示导出文件的路径列表
5. WHEN 用户执行 `skill backup <path>` 命令，系统 SHALL 将注册表中所有 skill 完整备份到指定目录
6. WHEN 用户执行 `skill restore <path>` 命令，系统 SHALL 从指定备份目录恢复所有 skill 到注册表
7. WHEN 备份目录不存在，系统 SHALL 自动创建该目录结构
8. WHEN 备份成功时，系统 SHALL 向用户显示备份的 skill 数量和文件大小

---

### 需求 4：Skill 导入功能

**用户故事：** 作为用户，我希望能够从外部文件或目录导入 skill 配置，以便我可以快速恢复或共享 skill。

#### Acceptance Criteria

1. WHEN 用户执行 `skill import <path>` 命令，系统 SHALL 从指定文件导入单个 skill 到注册表
2. WHEN 用户执行 `skill import <directory>` 命令，系统 SHALL 从指定目录导入所有符合格式的 skill 文件
3. WHEN 导入的文件格式不被支持，系统 SHALL 返回错误并列出支持的文件格式
4. WHEN 导入的 skill 与现有 skill 名称冲突，系统 SHALL 询问用户是覆盖、跳过还是重命名
5. WHEN 导入成功时，系统 SHALL 向用户显示成功导入的 skill 数量

---

### 需求 5：Skill 同步功能

**用户故事：** 作为用户，我希望能够将本地 skill 配置与指定 AI 工具平台的格式进行同步，以便我可以快速部署 skill 到目标平台。我还希望通过软链接的方式引用 skill，避免真实复制造成的数据冗余。

#### Acceptance Criteria

1. WHEN 用户执行 `skill sync <platform> --dry-run` 命令，系统 SHALL 显示将要执行的同步操作但不实际修改任何文件
2. WHEN 用户执行 `skill sync <platform> --push` 命令，系统 SHALL 将本地 skill 转换为目标平台的格式并写入对应配置路径
3. WHEN 用户执行 `skill sync <platform> --pull` 命令，系统 SHALL 从目标平台的配置路径读取并转换为本地注册表格式
4. WHEN 目标平台的配置文件格式不被识别，系统 SHALL 向用户报告错误并提供详细信息
5. WHEN 同步操作涉及多个文件时，系统 SHALL 显示同步进度
6. WHEN 用户执行 `skill sync <platform> --link` 命令，系统 SHALL 在目标平台的配置目录中创建指向本地 skill 文件的符号链接，而非真实复制
7. WHEN 软链接目标路径已存在且为真实文件，系统 SHALL 提示用户并询问是转换为链接还是跳过
8. WHEN 软链接创建成功后，系统 SHALL 向用户显示创建的链接路径列表
9. IF 目标平台不支持符号链接，系统 SHALL 向用户警告并回退到真实复制方式

---

### 需求 6：Skill 格式验证

**用户故事：** 作为用户，我希望系统能够验证 skill 配置的格式是否正确，以便我能够及时发现配置错误。

#### Acceptance Criteria

1. WHEN 用户执行 `skill validate <name>` 命令，系统 SHALL 验证指定 skill 的 JSON/YAML 格式是否有效
2. WHEN 用户执行 `skill validate --all` 命令，系统 SHALL 验证注册表中所有 skill 的格式
3. WHEN 验证失败时，系统 SHALL 显示具体的错误位置和错误描述
4. WHEN 验证成功时，系统 SHALL 显示验证通过的 skill 数量

---

### 需求 7：帮助和版本信息

**用户故事：** 作为用户，我希望能够查看命令的帮助信息和工具版本，以便我能够正确使用工具。

#### Acceptance Criteria

1. WHEN 用户执行 `skill --help` 命令，系统 SHALL 显示所有可用命令的列表和简要说明
2. WHEN 用户执行 `skill <command> --help` 命令，系统 SHALL 显示指定命令的详细帮助信息
3. WHEN 用户执行 `skill --version` 命令，系统 SHALL 显示工具的版本号
