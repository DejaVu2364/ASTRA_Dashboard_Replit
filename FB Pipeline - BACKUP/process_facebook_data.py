# process_facebook_data.py (Corrected to use the 'facebookId' field)

import pandas as pd
import json
import os
import argparse

def process_data_for_month(month_str):
    POSTS_JSON_FILE = "fb_posts_data.json"
    COMMENTS_JSON_FILE = f"monthly_data/{month_str}.json"
    OUTPUT_DIR = "processed_data"
    OUTPUT_CSV = f"{OUTPUT_DIR}/processed_comments_{month_str}.csv"

    print(f"--- [Step 1] Processing Raw Data for {month_str} ---")
    
    posts_map = {}
    try:
        with open(POSTS_JSON_FILE, 'r', encoding='utf-8') as f:
            posts_data = json.load(f)
            for post in posts_data:
                post_id_from_file = post.get('postId')
                if post_id_from_file:
                    # Force the key in our dictionary to be a string for safe matching
                    key = str(post_id_from_file).strip()
                    posts_map[key] = {
                        "post_caption": post.get('text', ''),
                        "total_likes": post.get('likes', 0),
                        "num_shares": post.get('shares', 0),
                    }
        print(f"Successfully loaded {len(posts_map)} posts into the map.")
    except FileNotFoundError:
        print(f"--> ERROR: The file '{POSTS_JSON_FILE}' was not found."); exit(1)

    all_comments_data = []
    try:
        with open(COMMENTS_JSON_FILE, 'r', encoding='utf-8') as f:
            comments_data = json.load(f)
    except FileNotFoundError:
        print(f"--> ERROR: The file '{COMMENTS_JSON_FILE}' was not found."); exit(1)

    # <<-- THE FIX IS HERE: We now read the 'facebookId' field directly -->>
    # This is much more reliable than parsing URLs.

    for comment in comments_data:
        # Get the clean post ID directly from the dedicated field.
        post_id_from_comment = comment.get('facebookId')

        # If for some reason a comment is missing this field, we skip it.
        if not post_id_from_comment:
            print(f"Warning: Comment found without a 'facebookId' field. Skipping.")
            continue
        
        # Force it to be a string to match the keys in our map.
        key_to_lookup = str(post_id_from_comment).strip()
        
        # Now we check if this clean ID is in our map of posts.
        if key_to_lookup in posts_map:
            post_info = posts_map[key_to_lookup]
            all_comments_data.append({
                "post_id": key_to_lookup, 
                "post_caption": post_info['post_caption'],
                "post_title": comment.get('postTitle', ''), 
                "total_likes": post_info['total_likes'],
                "num_shares": post_info['num_shares'], 
                "comment_text": comment.get('text', ''),
                "comment_likes": comment.get('likesCount', 0)
            })
        else:
            # The warning now tells us exactly which ID from the data failed to match.
            print(f"Warning: Post ID '{key_to_lookup}' from comment's 'facebookId' field not found in posts data. Skipping.")

    df = pd.DataFrame(all_comments_data)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"Successfully created: '{OUTPUT_CSV}' with {len(df)} rows.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process Facebook data for a specific month.")
    parser.add_argument("month", type=str, help="The month to process in YYYY-MM format.")
    args = parser.parse_args()
    process_data_for_month(args.month)