import pandas as pd
import json
import argparse
from collections import Counter
import os

def run_reconciliation_report(month_str):
    print(f"\n--- [VERIFY] Data Reconciliation Report for {month_str} ---")
    
    processed_file = f"processed_data/processed_comments_{month_str}.csv"
    posts_file = "fb_posts_data.json"
    comments_file = f"monthly_data/{month_str}.json"

    try:
        df_processed = pd.read_csv(processed_file)
        with open(posts_file, 'r', encoding='utf-8') as f:
            posts_data = json.load(f)
        with open(comments_file, 'r', encoding='utf-8') as f:
            comments_data = json.load(f)
    except FileNotFoundError as e:
        print(f"--> VERIFICATION ERROR: Could not find a required file. {e}"); exit(1)

    valid_post_ids = {str(p.get('postId')).strip() for p in posts_data if p.get('postId')}
    total_source_comments = len(comments_data)
    unmapped_post_ids = []
    
    for comment in comments_data:
        post_id_from_comment = comment.get('facebookId')
        if not post_id_from_comment: continue
        key_to_lookup = str(post_id_from_comment).strip()
        if key_to_lookup not in valid_post_ids:
            unmapped_post_ids.append(key_to_lookup)

    print("\n" + "="*50)
    print("           DATA RECONCILIATION SUMMARY")
    print("="*50)
    print(f"Total Comments in Source File: {total_source_comments}")
    print(f"Total Comments in Processed File: {len(df_processed)}")
    print("-" * 50)
    
    actual_discarded = len(unmapped_post_ids)
    
    if actual_discarded == 0:
        print("✅ VERIFICATION PASSED: All source comments were processed successfully!")
    else:
        percentage_discarded = (actual_discarded / total_source_comments) * 100
        print(f"❌ VERIFICATION FAILED: {actual_discarded} comments were discarded ({percentage_discarded:.2f}%).")
        
        post_id_counts = Counter(unmapped_post_ids)
        print("\nTop Missing Post IDs causing discards:")
        for post_id, count in post_id_counts.most_common(5):
            print(f"  - Post ID: {post_id} (Caused {count} discards)")
            
        print("\nACTION REQUIRED: Update `fb_posts_data.json` with these missing posts.")
        print("="*50)
        exit(1) # <<-- CRITICAL: Signal failure to the pipeline orchestrator

    print("="*50)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run a data reconciliation report on the processing step.")
    parser.add_argument("month", type=str, help="The month to verify in YYYY-MM format.")
    args = parser.parse_args()
    run_reconciliation_report(args.month)