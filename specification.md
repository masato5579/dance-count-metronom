# ダンスカウント・メトロノーム 仕様書

## 1. 概要

BPMを設定し、ダンスのカウント（1〜8）をメトロノームのように再生するWebアプリケーション。
ブラウザ上で完結し、Vercelにデプロイする。

---

## 2. 機能要件

### 2.1 カウント再生

- **通常モード**: 1(One) → 2(Two) → ... → 8(Eight) の8カウントを1セットとして無限ループ再生
- **エンドありモード**: 1(One) And → 2(Two) And → ... → 8(Eight) And（表拍=数字、裏拍=And）
- カウント音声は**英語**（One, Two, Three, Four, Five, Six, Seven, Eight）
- **ボイス切り替え**: Male（男性） / Female（女性） を選択可能
- 「And」の音声は数字カウントと**同等の音量・トーン**
- 1カウント目に特別なアクセントは付けない（全カウント均一）

### 2.2 音声生成方式

**方式: 事前生成した音声ファイル + Web Audio API（方式A）**

- 音声ファイル（MP3）を**TTSまたはプログラムで事前生成**し、`public/sounds/` に同梱する
- `AudioBufferSourceNode` + `AudioContext.currentTime` によるサンプル精度のスケジューリング
- 初回ページロード時にファイルを取得し `AudioBuffer` にデコード。以降はメモリ上のバッファを即時再生

**選定理由:**
- **リアルタイム性**: Web Audio API のスケジューリングはサンプル精度（マイクロ秒レベル）で最も正確
- **サーバ通信**: 初回ロード以降はサーバ通信なし（ブラウザキャッシュ有効）
- **ファイルサイズ**: 短い単語の音声は1ファイル数KB〜数十KB、全18ファイル（男女各9）で合計250KB以下

### 2.3 BPM 設定

| 項目 | 値 |
|------|-----|
| 最小 | 60 |
| 最大 | 200 |
| デフォルト | 120 |
| 調整単位 | 1 BPM |

- 入力方法: **数値入力フィールド + レンジスライダー** の併用
- 再生中のBPM変更は**即座に反映**する

### 2.4 再生コントロール

| 操作 | 動作 |
|------|------|
| **Start** | カウント1から再生開始 |
| **Stop（一時停止）** | 現在位置で一時停止 |
| **再開** | **停止した位置から**再開 |
| **Reset** | 停止してカウント1に戻る |

- Start/Stop は同一ボタンでトグル動作
- Reset は別ボタン

---

## 3. UI / デザイン

### 3.1 レイアウト構成

```
┌─────────────────────────────────┐
│     Dance Count Metronome       │
├─────────────────────────────────┤
│                                 │
│    [ ビジュアルインジケーター ]    │
│    ● ● ● ● ◉ ○ ○ ○            │
│                                 │
│    現在のカウント: 5             │
│                                 │
│    BPM: [ 120 ] ◄━━━━━━━►      │
│                                 │
│    Voice: [ Male ▼ ]            │
│    ☑ With And                   │
│                                 │
│    [ ▶ Start/Stop ] [ ↺ Reset ] │
│                                 │
└─────────────────────────────────┘
```

### 3.2 デザイン要件

- **ダークテーマ** ベース
- レスポンシブ対応（モバイル / デスクトップ）
- 現在再生中のカウント位置を**ドットインジケーター**で視覚表示（8つのドットが順に光る）
- スタート/ストップ時にスムーズなアニメーション
- モダンで洗練されたUI（グラデーション、micro-animation）

---

## 4. 技術スタック

| 項目 | 選定 | 理由 |
|------|------|------|
| フレームワーク | **Next.js (App Router)** | Vercelデプロイ最適化、SSG対応 |
| 言語 | **TypeScript** | 型安全性 |
| 音声制御 | **Web Audio API** | 正確なタイミングスケジューリング |
| 音声ファイル | **MP3** | ブラウザ互換性 |
| スタイリング | **CSS Modules** | コンポーネントスコープ、依存少 |
| デプロイ | **Vercel** | 指定 |

### 4.1 バックエンド

- **不要** — すべてフロントエンドで完結
- 音声ファイルは `public/sounds/` ディレクトリに配置

### 4.2 開発環境（Docker）

- **すべての開発作業はDockerコンテナ内で行う**（ホストにライブラリをインストールしない）
- `Dockerfile`: Node.js 20 + espeak-ng（TTS） + ffmpeg（音声変換）
- `docker-compose.yml`: ボリュームマウントによるライブリロード開発
- 音声ファイル生成スクリプト: `scripts/generate-sounds.sh`（コンテナ内で実行）

---

## 5. 音声ファイル一覧

`scripts/generate-sounds.sh` をDockerコンテナ内で実行して自動生成する。
**espeak-ng**（TTS）で WAV を生成後、**ffmpeg** で loudnorm フィルター付きMP3に変換。
男性（`en-us`）・女性（`en-us+f3`）の2パターンをそれぞれサブディレクトリに格納。

| ディレクトリ | ボイス | espeak-ng voice |
|-------------|--------|----------------|
| `sounds/male/` | 男性 | `en-us` |
| `sounds/female/` | 女性 | `en-us+f3` |

各ディレクトリに以下の9ファイルを格納:

| ファイル名 | 内容 |
|-----------|------|
| `one.mp3` | "One" |
| `two.mp3` | "Two" |
| `three.mp3` | "Three" |
| `four.mp3` | "Four" |
| `five.mp3` | "Five" |
| `six.mp3` | "Six" |
| `seven.mp3` | "Seven" |
| `eight.mp3` | "Eight" |
| `and.mp3` | "And" |

全18ファイル（9 × 2ボイス）。全カウント均一の音量・トーンで生成する（loudnorm: I=-16, TP=-1.5）。

---

## 6. ブラウザ対応

- Chrome（最新版）
- Safari（最新版）
- Firefox（最新版）
- モバイルブラウザ（iOS Safari, Android Chrome）

> **注意**: iOS Safari では `AudioContext` の初回起動にユーザーインタラクションが必要。Start ボタンのクリック時に resume する。

---

## 7. ファイル構成（想定）

```
dance-count-metronom/
├── Dockerfile                   # 開発環境定義
├── docker-compose.yml           # コンテナ構成
├── scripts/
│   └── generate-sounds.sh       # 音声ファイル自動生成
├── public/
│   └── sounds/                  # 生成された音声ファイル
│       ├── male/               # 男性ボイス
│       │   ├── one.mp3
│       │   ├── ...
│       │   └── and.mp3
│       └── female/             # 女性ボイス
│           ├── one.mp3
│           ├── ...
│           └── and.mp3
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Metronome.tsx        # メインコンポーネント
│   │   ├── BpmControl.tsx       # BPM入力/スライダー
│   │   ├── VoiceSelect.tsx      # ボイス切り替え（Male/Female）
│   │   ├── PlaybackControls.tsx # Start/Stop/Reset
│   │   └── CountDisplay.tsx     # カウント表示/インジケーター
│   ├── hooks/
│   │   └── useMetronome.ts      # 音声再生ロジック
│   └── lib/
│       └── audioEngine.ts       # Web Audio API 制御
├── package.json
├── tsconfig.json
└── next.config.js
```
