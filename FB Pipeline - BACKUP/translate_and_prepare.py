# translate_and_prepare.py (Using Application Default Credentials)

import pandas as pd
from google.cloud import translate_v2 as translate
import os
import argparse
import re

# We no longer need dotenv for this script
# from dotenv import load_dotenv
# load_dotenv()

def clean_text(text):
    if not isinstance(text, str) or not text.strip(): return ""
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'@\w+', '', text)
    text = text.replace('#', '')
    emoji_pattern = re.compile(
        "["
        u"\U0001F600-\U0001F64F" u"\U0001F300-\U0001F5FF" u"\U0001F680-\U0001F6FF"
        u"\U0001F1E0-\U0001F1FF" u"\U00002702-\U000027B0" u"\U000024C2-\U0001F251"
        "]+",
        flags=re.UNICODE,
    )
    text = emoji_pattern.sub(r'', text)
    text = ' '.join(text.split())
    return text.strip()

def translate_for_month(month_str):
    INPUT_CSV = f"processed_data/processed_comments_{month_str}.csv"
    OUTPUT_CSV = f"processed_data/analysis_ready_{month_str}.csv"
    BATCH_SIZE = 100 

    print(f"\n--- [Step 2] Translating & Cleaning Comments for {month_str} via Google Translate ---")

    if not os.path.exists(INPUT_CSV) or os.path.getsize(INPUT_CSV) == 0:
        print(f"Input file '{INPUT_CSV}' is empty or not found. Skipping.")
        # ... (rest of empty file logic is the same)
        return

    try:
        # <<-- THE FIX IS HERE -->>
        # We initialize the client with NO arguments. It will automatically find
        # the Application Default Credentials you just created.
        translate_client = translate.Client()
        
        print("Google Translate client initialized successfully.")
    except Exception as e:
        print(f"--> ERROR: Could not initialize Google Translate client: {e}"); exit(1)

    df = pd.read_csv(INPUT_CSV, dtype={'comment_text': str}).fillna({'comment_text': ''})
    # ... (the rest of the script is the same as before) ...
    df['original_comment_for_context'] = df['comment_text']
    df['cleaned_comment'] = df['comment_text'].apply(clean_text)
    df['translated_text'] = None
    df['original_language'] = 'en'
    
    rows_to_translate = df[df['cleaned_comment'] != ''].copy()
    
    if not rows_to_translate.empty:
        print(f"Found {len(rows_to_translate)} comments with meaningful text to process.")
        texts_to_translate = rows_to_translate['cleaned_comment'].tolist()
        
        all_translated_results = []
        try:
            total_batches = (len(texts_to_translate) - 1) // BATCH_SIZE + 1
            for i in range(0, len(texts_to_translate), BATCH_SIZE):
                batch_texts = texts_to_translate[i:i + BATCH_SIZE]
                current_batch_num = (i // BATCH_SIZE) + 1
                
                print(f"  -> Sending batch {current_batch_num}/{total_batches} to Google Translate...")
                results = translate_client.translate(batch_texts, target_language='en')
                all_translated_results.extend(results)

            rows_to_translate['translated_text'] = [res['translatedText'] for res in all_translated_results]
            rows_to_translate['original_language'] = [res.get('detectedSourceLanguage', 'en') for res in all_translated_results]
            df.update(rows_to_translate)

        except Exception as e:
            print(f"--> ERROR during batch translation with Google: {e}")
            df['original_language'] = 'error'

    df['text_for_analysis'] = df['translated_text'].fillna(df['cleaned_comment'])
    
    final_columns = [ 'post_id', 'post_caption', 'total_likes', 'num_shares', 'comment_likes', 'original_comment_for_context', 'original_language', 'text_for_analysis' ]
    for col in final_columns:
        if col not in df.columns: df[col] = None
    
    df_final = df[final_columns]
    os.makedirs("processed_data", exist_ok=True)
    df_final.to_csv(OUTPUT_CSV, index=False)
    print(f"Translation and cleaning complete! Saved to '{OUTPUT_CSV}'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Translate and clean comments using Google Cloud Translate API.")
    parser.add_argument("month", type=str, help="The month to process in YYYY-MM format.")
    args = parser.parse_args()
    translate_for_month(args.month)