# GitHub Download Counter

[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://obott9.github.io/github-download-counter/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

GitHub Releases API を使用して、任意のユーザーのリポジトリ別ダウンロード数をリアルタイムで取得・可視化する Web アプリケーションです。

> **Live Demo**: [https://obott9.github.io/github-download-counter/](https://obott9.github.io/github-download-counter/)

## Features

- 🔍 GitHub ユーザー名を入力して、全リポジトリのリリースダウンロード数を一括取得
- 📊 ダウンロード数のサマリー表示（総ダウンロード数、リポジトリ数、リリース数）
- 📦 リポジトリごとのリリース詳細（バージョン、アセット、ファイルサイズ）を展開表示
- 📈 ダウンロード数の視覚的なバーグラフ
- ⚡ `Promise.all` による並列 API コールで高速取得
- 🎯 Rate Limit 表示（API 使用状況のモニタリング）
- 📱 レスポンシブデザイン

## Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18 |
| Build    | Vite 5 |
| API      | GitHub REST API v3 |
| Deploy   | GitHub Pages (gh-pages) |
| Language | JavaScript (ES2022+) |

## API Endpoints Used

```
GET /users/{username}/repos?per_page=100&sort=updated
GET /repos/{owner}/{repo}/releases?per_page=100
```

- **認証なし**: 60 リクエスト/時間
- **トークン認証**: 5,000 リクエスト/時間

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/obott9/github-download-counter.git
cd github-download-counter
npm install
```

### Development

```bash
npm run dev
```

ブラウザで `http://localhost:5173/github-download-counter/` を開きます。

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## How It Works

1. **リポジトリ取得**: `/users/:user/repos` で全公開リポジトリを取得
2. **並列リリース取得**: `Promise.all` で各リポジトリの `/repos/:owner/:repo/releases` を同時に呼び出し
3. **集計・可視化**: アセットごとの `download_count` を集計し、ソート・表示
4. **Rate Limit 監視**: レスポンスヘッダー `x-ratelimit-*` から残りリクエスト数を表示

```javascript
// 並列API呼び出しの例
const results = await Promise.all(
  repos.map(async (repo) => {
    const res = await fetch(`${API}/repos/${user}/${repo.name}/releases`);
    return res.ok ? res.json() : [];
  })
);
```

## Project Structure

```
github-download-counter/
├── index.html           # エントリーポイント
├── vite.config.js       # Vite設定（GitHub Pages base path）
├── package.json
├── LICENSE
└── src/
    ├── main.jsx         # React マウント
    └── App.jsx          # メインコンポーネント（全ロジック）
```

## License

MIT License - See [LICENSE](LICENSE) for details.

## Author

**obott9** — Senior Software Engineer  
35+ years of cross-platform development experience (Swift/macOS, C#/.NET/Windows)

- GitHub: [@obott9](https://github.com/obott9)
- LinkedIn: [obott9](https://www.linkedin.com/in/obott9/)
