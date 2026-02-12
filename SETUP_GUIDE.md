# セットアップ手順書
## GitHub リポジトリ → GitHub Pages → Upwork 提案

---

## STEP 1: GitHub リポジトリの作成

### ターミナルで実行:

```bash
# 1. プロジェクトフォルダに移動
cd github-download-counter

# 2. Git 初期化
git init
git add .
git commit -m "Initial commit: GitHub Download Counter"

# 3. GitHub にリポジトリ作成（GitHub CLI を使う場合）
gh repo create github-download-counter --public --source=. --push

# GitHub CLI がない場合は、GitHub.com で手動作成してから:
git remote add origin https://github.com/obott9/github-download-counter.git
git branch -M main
git push -u origin main
```

---

## STEP 2: GitHub Pages にデプロイ

### 初回セットアップ:

```bash
# 1. 依存関係インストール
npm install

# 2. ビルド & デプロイ（gh-pages ブランチに自動プッシュ）
npm run deploy
```

### GitHub Pages 設定（ブラウザ）:

1. リポジトリページ → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / **(root)**
4. **Save**

### デプロイ確認:

数分待ってから以下にアクセス:
```
https://obott9.github.io/github-download-counter/
```

### 更新するとき:

```bash
# コード修正後
npm run deploy
```

---

## STEP 3: Upwork 提案での活用

### プロフィールに追加:

Upwork プロフィールの Portfolio セクションに以下を追加:

- **Title**: GitHub Download Counter — React + REST API Sample
- **URL**: https://obott9.github.io/github-download-counter/
- **Description** (英文):

```
A web application that fetches and visualizes download statistics
from GitHub Releases API. Built with React 18 + Vite, featuring
parallel API calls with Promise.all, rate limit monitoring,
and responsive design. Demonstrates REST API integration,
async data fetching, and modern frontend development skills.
```

- **Description** (和文):

```
GitHub Releases API からダウンロード統計を取得・可視化する
Webアプリケーション。React 18 + Vite で構築し、Promise.all に
よる並列APIコール、レート制限モニタリング、レスポンシブデザイン
を実装。REST API連携、非同期データ取得、モダンフロントエンド
開発スキルを実証するサンプルです。
```

### 提案文でのリンク方法:

```
I've built a working demo that showcases my API integration skills:
🔗 https://obott9.github.io/github-download-counter/
📂 https://github.com/obott9/github-download-counter

This sample demonstrates:
- REST API integration (GitHub API v3)
- Parallel async operations (Promise.all)
- Clean, responsive UI with React
- Error handling and rate limit monitoring
```

### Loom デモ動画の撮り方:

1. Loom を開いて画面録画開始
2. デモサイトにアクセス
3. 以下を操作しながら英語で簡単に説明:
   - ユーザー名入力 → データ取得
   - サマリーカードの説明
   - リポジトリ展開 → アセット詳細
   - 別ユーザー名（例: `microsoft`）で検索
4. 30秒〜1分で終了
5. Loom リンクを提案文に貼る

---

## 技術的なアピールポイント（面接・提案用）

### 日本語:

- GitHub REST API v3 のエンドポイントを組み合わせたデータ集約
- Promise.all による並列非同期処理で、N個のリポジトリを同時にfetch
- Rate Limit ヘッダーの取得と残リクエスト数の可視化
- エラーハンドリング（404, 403, ネットワークエラー）
- React Hooks (useState, useEffect, useCallback) による状態管理
- CSS-in-JS によるコンポーネントスタイリング
- Vite + gh-pages による CI/CD パイプライン

### English:

- Combined multiple GitHub REST API v3 endpoints for data aggregation
- Parallel async operations with Promise.all for fetching N repositories simultaneously
- Rate limit header extraction and remaining request visualization
- Comprehensive error handling (404, 403, network errors)
- State management with React Hooks (useState, useEffect, useCallback)
- CSS-in-JS component styling approach
- CI/CD pipeline with Vite build + gh-pages deployment
