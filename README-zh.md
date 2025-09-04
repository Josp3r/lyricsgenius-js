# lyricsgenius-js

一个用于访问 Genius.com API 的 Node.js 客户端 🎶🎤

**[English README](./README.md)**

这是流行的 Python [lyricsgenius](https://github.com/johnwmillr/LyricsGenius) 库的 Node.js 移植版，提供对 Genius.com 歌词、艺术家信息和专辑的访问。

## 快速开始

### 安装包

```bash
npm install lyricsgenius-js

# 或全局安装以使用 CLI 命令
npm install -g lyricsgenius-js
```

### 设置 API Token

1. 从 [Genius API](https://genius.com/api-clients) 获取你的 token
2. 使用 CLI 配置：

```bash
lyricsgenius init
```

## CLI 使用

该包包含一个功能强大的 CLI 工具，支持多个命令和便捷的别名：

### 初始化配置

```bash
lyricsgenius init
```

设置你的 API token 并保存到 `~/.lyricsgenius/config.json`

### 交互式搜索和下载

```bash
# 交互式搜索，支持歌曲选择和下载
lyricsgenius search "Shape of You"
lyricsgenius s "Shape of You"  # 简短别名

# 自定义结果数量
lyricsgenius search "Hello" -l 20
```

**交互式体验：**

1. 🔍 搜索显示歌曲列表
2. 📋 从交互菜单中选择歌曲
3. 📁 选择下载目录
4. 📄 选择格式（txt 或 json）
5. 🎉 自动下载并创建有序的文件夹结构

### 直接下载

```bash
# 通过 ID 下载指定歌曲
lyricsgenius download 1234567
lyricsgenius dl 1234567  # 简短别名

# 下载到自定义目录
lyricsgenius download 1234567 -o ~/Music/

# 下载为 JSON 格式
lyricsgenius download 1234567 -f json
```

### 诊断工具

```bash
lyricsgenius doctor
lyricsgenius doc  # 简短别名
```

运行全面的测试，包括：

- 🔌 API 连接测试
- 🔍 搜索功能验证
- 🌐 代理配置测试
- 🩺 完整系统诊断

### 命令别名

所有 CLI 命令都支持便捷的短别名，以便更快地输入：

| 命令 | 别名 | 描述 |
|------|------|------|
| `search` | `s` | 交互式搜索和下载 |
| `download` | `dl` | 通过 ID 直接下载歌曲 |
| `doctor` | `doc` | 运行诊断测试 |
| `init` | - | 初始化配置 |

```bash
# 这些命令是等效的
lyricsgenius search "hello world"
lyricsgenius s "hello world"

# 这些命令是等效的  
lyricsgenius download 12345
lyricsgenius dl 12345

# 这些命令是等效的
lyricsgenius doctor
lyricsgenius doc
```

## API Token 设置

你可以通过多种方法设置 API token：

**CLI 配置（推荐）：**

```bash
lyricsgenius init
```

**环境变量：**

```bash
export GENIUS_ACCESS_TOKEN="your_token_here"
```

**程序化设置：**

```javascript
const genius = new Genius({ accessToken: 'your_token_here' });
```

## 编程使用

### 基础用法

```javascript
import { Genius } from 'lyricsgenius-js';
// 或者: const { Genius } = require('lyricsgenius-js');

// 使用访问 token 初始化
const genius = new Genius({ accessToken: 'your_access_token_here' });

// 或使用环境变量 GENIUS_ACCESS_TOKEN
const genius = new Genius();
```

### 搜索歌曲

```javascript
// 搜索指定歌曲
const song = await genius.searchSong('Song Title', 'Artist Name');
if (song) {
  console.log(song.title);
  console.log(song.artist);
  console.log(song.lyrics);
}
```

### 搜索艺术家

```javascript
// 搜索艺术家并获取他们的歌曲
const artist = await genius.searchArtist('Artist Name', 5); // 最多获取 5 首歌
if (artist) {
  console.log(`找到 ${artist.numSongs} 首 ${artist.name} 的歌曲`);
  for (const song of artist.songs) {
    console.log(`- ${song.title}`);
  }
}
```

### 搜索专辑

```javascript
// 通过 ID 搜索专辑（API 不再支持专辑名搜索）
const album = await genius.searchAlbum(12345);
if (album) {
  console.log(`专辑：${album.name} - ${album.artistName}`);
  console.log(`曲目数：${album.numTracks}`);
  
  // 将专辑数据保存为 JSON 文件
  album.saveLyrics();
}
```

### 配置选项

```javascript
const genius = new Genius({
  accessToken: 'your_token',
  verbose: false,                    // 关闭状态信息
  removeSectionHeaders: true,        // 从歌词中移除 [副歌]、[主歌] 等标记
  skipNonSongs: false,              // 包含非歌曲结果
  excludedTerms: ['Remix', 'Live'], // 跳过包含这些词汇的歌曲
  timeout: 10000,                   // 请求超时时间（毫秒）
  retries: 2                        // 失败时重试次数
});
```

## 开发

```bash
npm install          # 安装依赖
npm run build       # 编译 TypeScript
npm run dev         # 开发模式监视
npm run doctor      # 运行诊断工具
```

## 示例

运行包含的示例：

```bash
# 基础歌曲搜索
npm run example:basic

# 艺术家搜索（多首歌曲）
npm run example:artist

# 代理配置示例
npm run example:proxy
```

或查看 `examples/` 目录中的代码示例。

## 功能特性

- **交互式 CLI**：现代命令行界面，支持交互菜单和快捷键
- **TypeScript 支持**：为 TypeScript 项目提供完整的类型定义
- **基于 Promise 的 API**：现代 async/await 语法
- **可配置**：广泛的选项用于自定义行为
- **速率限制**：内置请求节流和重试逻辑
- **OAuth2 支持**：完整的 OAuth2 流程实现
- **网页抓取**：从 Genius 网页提取歌词
- **命令别名**：短别名以便更快的 CLI 使用

## API 参考

### 主要类

- `Genius` - 与 Genius API 交互的主要客户端类
- `Song` - 表示包含歌词和元数据的歌曲
- `Artist` - 表示艺术家及其歌曲
- `Album` - 表示包含曲目的专辑
- `OAuth2` - OAuth2 认证助手

## 许可证

MIT

## 贡献

这是 Python lyricsgenius 库的 Node.js 移植版。欢迎提交 Issues 和 Pull Requests！

## 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解详细的变更历史和新功能。
