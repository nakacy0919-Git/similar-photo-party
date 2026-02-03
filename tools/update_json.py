import os
import json
import re

# 設定
IMAGE_DIR = '../assets/images'
JSON_FILE = '../data/content.json'

def update_json_by_group():
    # 1. 現在のJSONを読み込む
    current_data = []
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            try:
                current_data = json.load(f)
            except json.JSONDecodeError:
                current_data = []

    # 既に登録済みのファイル名リスト
    existing_filenames = {item['filename'] for item in current_data}
    
    # 2. 画像フォルダをスキャンして整理する
    if not os.path.exists(IMAGE_DIR):
        print(f"エラー: 画像フォルダが見つかりません: {IMAGE_DIR}")
        return

    files = sorted(os.listdir(IMAGE_DIR))
    
    # グループごとにファイルをまとめる辞書
    # 例: { "party": ["party_1.webp", "party_2.webp"...] }
    potential_groups = {}

    # 正規表現: "名前_番号.拡張子" にマッチさせる (例: dog_1.webp)
    pattern = re.compile(r'(.+)_([0-9]+)\.(webp|jpg|jpeg|png)$', re.IGNORECASE)

    for filename in files:
        # すでにJSONにあるファイルは無視
        if filename in existing_filenames:
            continue

        match = pattern.match(filename)
        if match:
            group_name = match.group(1)  # "dog" の部分
            if group_name not in potential_groups:
                potential_groups[group_name] = []
            potential_groups[group_name].append(filename)

    # 3. 4枚そろっているグループだけをJSONに追加
    added_groups_count = 0
    
    for group_name, filenames in potential_groups.items():
        # ファイル数が4枚未満、または4枚より多い場合は警告を出してスキップ
        if len(filenames) != 4:
            print(f"⚠️ スキップ: '{group_name}' グループは画像が {len(filenames)} 枚しかありません（4枚必要です）。")
            continue

        print(f"✨ 新規グループ追加: {group_name} (4枚セット)")
        
        # 4枚のデータを生成
        for filename in filenames:
            # 拡張子を除いたファイル名をIDにする
            file_id = os.path.splitext(filename)[0]
            
            new_item = {
                "id": file_id,
                "filename": filename,
                "group": group_name,  # 自動でグループ名を設定！
                "title": f"{group_name} Image",
                "key_phrase": "Please edit English text.",
                "translation": "日本語のテキストを編集してください。"
            }
            current_data.append(new_item)
        
        added_groups_count += 1

    # 4. JSONに書き込み保存
    if added_groups_count > 0:
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(current_data, f, indent=2, ensure_ascii=False)
        print(f"\n✅ 完了: {added_groups_count} セット（計 {added_groups_count * 4} 枚）を追加しました！")
    else:
        print("\n✨ 追加できる4枚セットの画像は見つかりませんでした。")

if __name__ == '__main__':
    # スクリプトの場所をカレントディレクトリにする
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    update_json_by_group()