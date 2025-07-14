# aggregate_data.py
import pandas as pd
import os
import argparse

def get_most_extreme_comment(group, sentiment_col='sentiment_score', text_col='text_for_analysis', find_min=True):
    valid_group = group.dropna(subset=[sentiment_col])
    if valid_group.empty: return "N/A"
    idx = valid_group[sentiment_col].idxmin() if find_min else valid_group[sentiment_col].idxmax()
    return group.loc[idx, text_col]

def aggregate_for_month(month_str):
    INPUT_CSV = f"enriched_data/enriched_data_{month_str}.csv"
    OUTPUT_DIR = "monthly_summaries"
    OUTPUT_SUMMARY_CSV = f"{OUTPUT_DIR}/post_summary_{month_str}.csv"
    FOLLOWER_COUNT = 88000

    print(f"\n--- [Step 4] Aggregating Data for {month_str} ---")
    try:
        df = pd.read_csv(INPUT_CSV)
    except FileNotFoundError:
        print(f"--> ERROR: Input file '{INPUT_CSV}' not found."); exit(1)

    if df.empty:
        print("Input file is empty. Skipping aggregation.")
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        pd.DataFrame().to_csv(OUTPUT_SUMMARY_CSV, index=False)
        return

    post_summary = df.groupby('post_id').agg(
        post_caption=('post_caption', 'first'),
        total_likes=('total_likes', 'first'),
        num_shares=('num_shares', 'first'),
        comment_count=('original_comment_for_context', 'count'),
        avg_sentiment_score=('sentiment_score', 'mean'),
        sentiment_variance=('sentiment_score', 'var'),
        negative_comment_ratio=('sentiment_score', lambda s: (s.dropna() < 0).sum() / s.count() if s.count() > 0 else 0),
        main_topic=('topic', lambda x: x.mode()[0] if not x.mode().empty else 'N/A')
    ).reset_index()

    post_summary['weighted_engagement_rate'] = (post_summary['total_likes'] + post_summary['comment_count'] + 2 * post_summary['num_shares']) / FOLLOWER_COUNT
    post_summary['sentiment_variance'] = post_summary['sentiment_variance'].fillna(0)

    most_negative = df.groupby('post_id').apply(get_most_extreme_comment, find_min=True).rename('most_negative_comment').reset_index()
    most_positive = df.groupby('post_id').apply(get_most_extreme_comment, find_min=False).rename('most_positive_comment').reset_index()
    original_neg_context = df.groupby('post_id').apply(get_most_extreme_comment, text_col='original_comment_for_context', find_min=True).rename('original_negative_context').reset_index()
    original_pos_context = df.groupby('post_id').apply(get_most_extreme_comment, text_col='original_comment_for_context', find_min=False).rename('original_positive_context').reset_index()

    final_summary = pd.merge(post_summary, most_negative, on='post_id', how='left')
    final_summary = pd.merge(final_summary, most_positive, on='post_id', how='left')
    final_summary = pd.merge(final_summary, original_neg_context, on='post_id', how='left')
    final_summary = pd.merge(final_summary, original_pos_context, on='post_id', how='left')

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    final_summary.to_csv(OUTPUT_SUMMARY_CSV, index=False)
    print(f"Aggregation complete! Saved enhanced post summaries to {OUTPUT_SUMMARY_CSV}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aggregate enriched data for a specific month.")
    parser.add_argument("month", type=str, help="The month to process in YYYY-MM format.")
    args = parser.parse_args()
    aggregate_for_month(args.month)
