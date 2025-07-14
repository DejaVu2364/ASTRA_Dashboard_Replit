
# partition_by_month.py
import json
import os
from datetime import datetime

def partition_json_by_month(input_file_path='fb_comments_data.json', date_key='date', output_folder='monthly_data'):
    print("--- [Pre-Step] Partitioning Master Data by Month ---")
    try:
        with open(input_file_path, 'r', encoding='utf-8') as f:
            all_data = json.load(f)
    except FileNotFoundError:
        print(f"--> ERROR: Input file '{input_file_path}' not found.")
        return

    os.makedirs(output_folder, exist_ok=True)
    monthly_data = {}
    
    for item in all_data:
        date_str = item.get(date_key)
        if not date_str: continue
        try:
            dt_object = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            month_year_key = dt_object.strftime('%Y-%m')
            if month_year_key not in monthly_data:
                monthly_data[month_year_key] = []
            monthly_data[month_year_key].append(item)
        except (ValueError, TypeError): continue

    for month_key, data_list in monthly_data.items():
        output_file_path = os.path.join(output_folder, f"{month_key}.json")
        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(data_list, f, indent=4, ensure_ascii=False)
        print(f"Saved {len(data_list)} items to '{output_file_path}'")
    print("\nPartitioning complete.")

if __name__ == "__main__":
    partition_json_by_month()

