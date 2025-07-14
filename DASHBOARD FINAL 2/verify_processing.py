# File: verify_processing.py (Enhanced with Schema Check)
import pandas as pd
import json
import argparse
from collections import Counter

def run_reconciliation_report(month_str):
    print(f"\n--- [VERIFY] Data Reconciliation & Schema Report for {month_str} ---")
    
    processed_file = f"processed_data/processed_comments_{month_str}.csv"
    posts_file = "fb_posts_data.json"
    comments_file = f"monthly_data/{month_str}.json"
    
    # --- Schema Check ---
    print("1. Verifying output schema...")
    try:
        df_processed = pd.read_csv(processed_file)
        REQUIRED_COLUMNS = {'post_id', 'post_caption', 'content_type', 'total_likes', 'num_shares', 'comment_text'}
        missing_cols = REQUIRED_COLUMNS - set(df_processed.columns)
        if not missing_cols:
            print("[PASSED] Schema verification successful. All required columns exist.")
        else:
            print(f"[FAILED] SCHEMA FAILED: The following required columns are missing: {list(missing_cols)}")
            exit(1)
    except FileNotFoundError:
        print(f"[FAILED] File not found: '{processed_file}'. Cannot perform verification."); exit(1)
    except Exception as e:
        print(f"[FAILED] An error occurred during schema verification: {e}"); exit(1)

    # --- Data Loss Check ---
    print("\n2. Verifying data loss...")
    try:
        with open(posts_file, 'r', encoding='utf-8') as f: posts_data = json.load(f)
        with open(comments_file, 'r', encoding='utf-8') as f: comments_data = json.load(f)
    except FileNotFoundError as e:
        print(f"[FAILED] Could not find a required source file for data loss check. {e}"); exit(1)

    valid_post_ids = {str(p.get('postId')).strip() for p in posts_data if p.get('postId')}
    total_source_comments = len(comments_data)
    unmapped_post_ids = [str(c.get('facebookId')).strip() for c in comments_data if c.get('facebookId') and str(c.get('facebookId')).strip() not in valid_post_ids]
    
    print(f"Total Comments in Source File: {total_source_comments}")
    print(f"Total Comments in Processed File: {len(df_processed)}")
    
    actual_discarded = len(unmapped_post_ids)
    
    if actual_discarded == 0:
        print("[PASSED] Data loss verification successful. All source comments were processed.")
    else:
        percentage_discarded = (actual_discarded / total_source_comments) * 100 if total_source_comments > 0 else 0
        print(f"[FAILED] DATA LOSS FAILED: {actual_discarded} comments were discarded ({percentage_discarded:.2f}%).")
        post_id_counts = Counter(unmapped_post_ids)
        print("\nTop Missing Post IDs causing discards:")
        for post_id, count in post_id_counts.most_common(5):
            print(f"  - Post ID: {post_id} (Caused {count} discards)")
        print("\nACTION REQUIRED: Update `fb_posts_data.json` with these missing posts."); exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run a data reconciliation report on the processing step.")
    parser.add_argument("month", type=str, help="The month to verify in YYYY-MM format.")
    args = parser.parse_args()
    run_reconciliation_report(args.month)