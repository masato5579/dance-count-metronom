#!/bin/bash
# 音声ファイル生成スクリプト
# espeak-ng + ffmpeg を使用してカウント音声をMP3で生成する
# 男性・女性の2パターンを生成
# 全ファイルのRMSを統一するため、2段階で処理:
#   1. espeak-ngでWAV生成
#   2. ffmpegでピークノーマライズ → RMS測定 → ゲイン調整

set -euo pipefail

OUTPUT_DIR="public/sounds"
mkdir -p "$OUTPUT_DIR/male" "$OUTPUT_DIR/female"

# カウント音声の定義
COUNT_WORDS=("one" "two" "three" "four" "five" "six" "seven" "eight")
AND_WORD="and"
ALL_WORDS=("${COUNT_WORDS[@]}" "$AND_WORD")

# 音声設定
MALE_VOICE="en-us"
FEMALE_VOICE="en-us+f3"
SPEED=160
AMPLITUDE=200

# ターゲットRMS（dBFS）
TARGET_RMS="-18"
# "and" の追加減衰（dB）
AND_ATTENUATION="6"

measure_rms() {
  ffmpeg -i "$1" -af "astats=metadata=1:reset=0" -f null /dev/null 2>&1 \
    | grep "RMS level dB" | tail -1 | sed 's/.*RMS level dB: //' | tr -d ' '
}

generate_voice() {
  local voice="$1"
  local label="$2"
  local out_dir="$3"

  echo ""
  echo "--- ${label} ---"

  # Step 1: espeak-ng → WAV → ピークノーマライズ済みWAV
  for word in "${ALL_WORDS[@]}"; do
    raw="/tmp/${word}_${label}_raw.wav"
    peak="/tmp/${word}_${label}_peak.wav"
    espeak-ng -v "$voice" -s "$SPEED" -a "$AMPLITUDE" -w "$raw" "$word"
    # ピークノーマライズ + フィルタ
    ffmpeg -y -i "$raw" \
      -af "highpass=f=80,lowpass=f=8000,dynaudnorm=p=0.95:m=10" \
      -ar 44100 -ac 1 "$peak" 2>/dev/null
    rm -f "$raw"
  done

  # Step 2: 全カウントファイルのRMSを測定
  echo "  RMS測定:"
  declare -A rms_values
  for word in "${ALL_WORDS[@]}"; do
    peak="/tmp/${word}_${label}_peak.wav"
    rms=$(measure_rms "$peak")
    rms_values[$word]="$rms"
    echo "    ${word}: ${rms} dBFS"
  done

  # Step 3: ゲイン計算＆適用＆MP3変換
  echo "  ゲイン調整:"
  for word in "${ALL_WORDS[@]}"; do
    peak="/tmp/${word}_${label}_peak.wav"
    mp3="${out_dir}/${word}.mp3"
    current="${rms_values[$word]}"

    # ゲイン = ターゲット - 現在値
    gain=$(awk "BEGIN {printf \"%.2f\", ${TARGET_RMS} - (${current})}")

    # "and" は追加減衰
    if [ "$word" = "$AND_WORD" ]; then
      gain=$(awk "BEGIN {printf \"%.2f\", ${gain} - ${AND_ATTENUATION}}")
      echo "    ${word}: gain=${gain}dB (includes -${AND_ATTENUATION}dB)"
    else
      echo "    ${word}: gain=${gain}dB"
    fi

    ffmpeg -y -i "$peak" \
      -af "volume=${gain}dB" \
      -ar 44100 -ac 1 -b:a 128k "$mp3" 2>/dev/null
    rm -f "$peak"
  done

  echo "  -> ${out_dir}/ 完了"
}

echo "=== 音声ファイル生成（RMSノーマライズ）==="

generate_voice "$MALE_VOICE" "male" "$OUTPUT_DIR/male"
generate_voice "$FEMALE_VOICE" "female" "$OUTPUT_DIR/female"

echo ""
echo "=== 最終検証 ==="
echo "Male:"
for f in "${OUTPUT_DIR}/male/"*.mp3; do
  echo "  $(basename "$f"): $(measure_rms "$f") dBFS"
done
echo "Female:"
for f in "${OUTPUT_DIR}/female/"*.mp3; do
  echo "  $(basename "$f"): $(measure_rms "$f") dBFS"
done
