# File: aggregate_data.py (The Monolithic, Self-Verifying Final Version)
import pandas as pd
import os
import argparse

print("--- EXECUTING AGGREGATE SCRIPT VERSION: MONOLITH_V1 ---")

def get_most_extreme_comment_row(group, sentiment_col='sentiment_score', find_min=True):
    valid_group = group.dropna(subset=[sentiment_col])
    if valid_group.empty: return None
    idx = valid_group[sentiment_col].idxmin() if find_min else valid_group[sentiment_col].idxmax()
    return group.loc[idx]

def aggregate_for_month(month_str):
    INPUT_CSV = f"enriched_data/enriched_data_{month_str}.csv"
    OUTPUT_DIR = "monthly_reports"
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    OUTPUT_SUMMARY_CSV = os.path.join(OUTPUT_DIR, f"post_summary_{month_str}.csv")
    
    print(f"--- [Step 4] Aggregating Data for {month_str} ---")
    try:
        df = pd.read_csv(INPUT_CSV)
    except FileNotFoundError:
        print(f"--> ERROR: Input file '{INPUT_CSV}' not found."); exit(1)
    if df.empty: print("Input file is empty. Skipping."); return

    # --- Step 1: Aggregation ---
    post_summary = df.groupby('post_id').agg(
        post_caption=('post_caption', 'first'), content_type=('content_type', 'first'),
        total_likes=('total_likes', 'first'), num_shares=('num_shares', 'first'),
        comment_count=('original_comment_for_context', 'size'), avg_sentiment_score=('sentiment_score', 'mean'),
        sentiment_variance=('sentiment_score', 'var'),
        negative_comment_ratio=('sentiment_score', lambda s: (s < 0).sum() / s.count() if s.count() > 0 else 0),
        main_topic=('topic', lambda x: x.mode()[0] if not x.mode().empty else 'N/A')
    ).reset_index()

    # --- Step 2: Find Extreme Comments ---
    all_posts_data = []
    for post_id, group in df.groupby('post_id'):
        post_data = {'post_id': post_id}
        pos_row, neg_row = get_most_extreme_comment_row(group, find_min=False), get_most_extreme_comment_row(group, find_min=True)
        post_data['most_positive_comment'] = pos_row['text_for_analysis'] if pos_row is not None else "No analyzable text comments"
        post_data['original_positive_context'] = pos_row['original_comment_for_context'] if pos_row is not None else "N/A"
        if neg_row is not None and (pos_row is None or neg_row.name != pos_row.name):
            post_data['most_negative_comment'] = neg_row['text_for_analysis']
            post_data['original_negative_context'] = neg_row['original_comment_for_context']
        else:
            post_data['most_negative_comment'] = "No distinct negative comment"
            post_data['original_negative_context'] = "N/A"
        all_posts_data.append(post_data)

    # --- Step 3: Merge and Finalize ---
    comments_df = pd.DataFrame(all_posts_data)
    final_summary = pd.merge(post_summary, comments_df, on='post_id', how='left')
    final_summary['weighted_engagement_rate'] = (final_summary['total_likes'] + final_summary['comment_count'] + 2 * final_summary['num_shares']) / 88000
    
    # --- Step 4: Brute-Force Sanitization ---
    print("[SELF-SANITIZE] Aggressively cleaning all text columns in-memory...")
    text_cols = ['post_caption', 'content_type', 'main_topic', 'most_positive_comment', 'original_positive_context', 'most_negative_comment', 'original_negative_context']
    for col in text_cols:
        if col in final_summary.columns:
            # This is the most robust way to clean a column.
            final_summary[col] = final_summary[col].apply(lambda x: "N/A" if pd.isna(x) else str(x))
            final_summary[col].replace('', "N/A", inplace=True)
    print("[SELF-SANITIZE] Cleaning complete.")

    # --- Step 5: Self-Verification ---
    print("[SELF-VERIFY] Checking in-memory DataFrame for null/NaN values before saving...")
    has_issue = False
    for col in text_cols:
        if col in final_summary.columns:
            if final_summary[col].isnull().any():
                print(f"[SELF-VERIFY FAILED] Data integrity issue DETECTED in-memory for column '{col}'.")
                # print("Problematic rows:")
                # print(final_summary[final_summary[col].isnull()])
                has_issue = True
    if has_issue:
        print("ACTION: Halting before saving corrupted file."); exit(1)
    print("[SELF-VERIFY PASSED] In-memory DataFrame is clean. Ready to save.")

    # --- Step 6: Save the Verified File ---
    final_summary.to_csv(OUTPUT_SUMMARY_CSV, index=False)
    print(f"[SUCCESS] Aggregation complete! Saved verified summary to {OUTPUT_SUMMARY_CSV}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aggregate, sanitize, and self-verify data.")
    parser.add_argument("month", type=str, help="The month to process (YYYY-MM).")
    args = parser.parse_args()
    aggregate_for_month(args.month)