# File: process_facebook_data.py
import pandas as pd
import json
import os
import argparse

def process_data_for_month(month_str):
    POSTS_JSON_FILE = "fb_posts_data.json"
    COMMENTS_JSON_FILE = f"monthly_data/{month_str}.json"
    OUTPUT_DIR = "processed_data"
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    OUTPUT_CSV = os.path.join(OUTPUT_DIR, f"processed_comments_{month_str}.csv")

    print(f"--- [Step 1] Processing Raw Data for {month_str} ---")
    posts_map = {}
    try:
        with open(POSTS_JSON_FILE, 'r', encoding='utf-8') as f:
            posts_data = json.load(f)
            for post in posts_data:
                if post_id := post.get('postId'):
                    posts_map[str(post_id).strip()] = {"post_caption": post.get('text', ''), "total_likes": post.get('likes', 0), "num_shares": post.get('shares', 0), "content_type": post.get('type', 'Unknown')}
        print(f"Successfully loaded {len(posts_map)} posts into the map.")
    except FileNotFoundError:
        print(f"--> ERROR: '{POSTS_JSON_FILE}' not found."); exit(1)

    all_comments_data = []
    try:
        with open(COMMENTS_JSON_FILE, 'r', encoding='utf-8') as f:
            comments_data = json.load(f)
    except FileNotFoundError:
        print(f"--> ERROR: '{COMMENTS_JSON_FILE}' not found."); exit(1)

    for comment in comments_data:
        if post_id_from_comment := comment.get('facebookId'):
            key_to_lookup = str(post_id_from_comment).strip()
            if post_info := posts_map.get(key_to_lookup):
                all_comments_data.append({"post_id": key_to_lookup, "post_caption": post_info['post_caption'], "content_type": post_info['content_type'], "total_likes": post_info['total_likes'], "num_shares": post_info['num_shares'], "comment_text": comment.get('text', ''), "comment_likes": comment.get('likesCount', 0)})

    df = pd.DataFrame(all_comments_data)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"Successfully created: '{OUTPUT_CSV}' with {len(df)} rows.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process Facebook data for a specific month.")
    parser.add_argument("month", type=str, help="The month to process in YYYY-MM format.")
    args = parser.parse_args()
    process_data_for_month(args.month)