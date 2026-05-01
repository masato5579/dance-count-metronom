#!/bin/bash
# 音声ファイル生成スクリプト
# espeak-ng + ffmpeg を使用してカウント音声をMP3で生成する
# 男性・女性の2パターンを生成

set -euo pipefail

OUTPUT_DIR="public/sounds"
mkdir -p "$OUTPUT_DIR/male" "$OUTPUT_DIR/female"

# カウント音声の定義
WORDS=("one" "two" "three" "four" "five" "six" "seven" "eight" "and")

# 音声設定
MALE_VOICE="en-us"           # 男性（American English）
FEMALE_VOICE="en-us+f3"       # 女性（American English female variant）
SPEED=160                    # 話速（wpm）
AMPLITUDE=200                # 音量

# ffmpeg フィルター設定（音量正規化）
FFMPEG_FILTER="loudnorm=I=-16:TP=-1.5:LRA=11,highpass=f=80,lowpass=f=8000"

generate_voice() {
  local voice="$1"
  local label="$2"
  local out_dir="$3"

  echo ""
  echo "--- Generating ${label} voice ---"

  for word in "${WORDS[@]}"; do
    wav_file="/tmp/${word}_${label}.wav"
    mp3_file="${out_dir}/${word}.mp3"

    echo "  ${word}.mp3 (\"${word}\")"

    # espeak-ng で WAV 生成
    espeak-ng -v "$voice" -s "$SPEED" -a "$AMPLITUDE" -w "$wav_file" "$word"

    # ffmpeg で MP3 に変換（ノーマライズ付き）
    ffmpeg -y -i "$wav_file" \
      -af "$FFMPEG_FILTER" \
      -ar 44100 -ac 1 -b:a 128k \
      "$mp3_file" 2>/dev/null

    rm -f "$wav_file"
  done

  echo "  -> ${out_dir}/ に出力完了"
}

echo "=== 音声ファイル生成開始 ==="

generate_voice "$MALE_VOICE" "male" "$OUTPUT_DIR/male"
generate_voice "$FEMALE_VOICE" "female" "$OUTPUT_DIR/female"

echo ""
echo "=== 生成完了 ==="
echo ""
echo "Male:"
ls -la "${OUTPUT_DIR}/male/"
echo ""
echo "Female:"
ls -la "${OUTPUT_DIR}/female/"
