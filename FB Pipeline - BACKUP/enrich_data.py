# enrich_data.py
import pandas as pd
from transformers import pipeline
import os
import argparse
import torch

def enrich_for_month(month_str):
    INPUT_CSV = f"processed_data/analysis_ready_{month_str}.csv"
    OUTPUT_DIR = "enriched_data"
    OUTPUT_CSV = f"{OUTPUT_DIR}/enriched_data_{month_str}.csv"
    CANDIDATE_TOPICS = ['Economy', 'Healthcare', 'Public Safety', 'Environment', 'Foreign Policy', 'Education', 'Praise', 'Criticism', 'Infrastructure']
    BATCH_SIZE = 64

    print(f"\n--- [Step 3] Enriching Data for {month_str} ---")

    try:
        df = pd.read_csv(INPUT_CSV)
        df_to_process = df.dropna(subset=['text_for_analysis']).copy()
        print(f"Found {len(df_to_process)} non-empty comments to analyze.")
    except FileNotFoundError:
        print(f"--> ERROR: Input file '{INPUT_CSV}' not found."); exit(1)

    if df_to_process.empty:
        print("No data to process. Skipping enrichment.")
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        df['sentiment_score'] = None
        df['topic'] = None
        df.to_csv(OUTPUT_CSV, index=False)
        return

    print("Loading AI models...")
    device = 0 if torch.cuda.is_available() else -1
    sentiment_pipeline = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest", device=device)
    topic_pipeline = pipeline("zero-shot-classification", model="MoritzLaurer/mDeBERTa-v3-base-mnli-xnli", device=device)

    all_sentiments, all_topics = [], []
    texts = df_to_process['text_for_analysis'].astype(str).tolist()

    for i in range(0, len(texts), BATCH_SIZE):
        batch_texts = texts[i:i + BATCH_SIZE]
        print(f"  -> Processing batch {i//BATCH_SIZE + 1}/{(len(texts) - 1)//BATCH_SIZE + 1}")
        try:
            sentiment_results = sentiment_pipeline(batch_texts, truncation=True, max_length=512)
            sentiment_map = {'positive': 1, 'neutral': 0, 'negative': -1}
            all_sentiments.extend([sentiment_map.get(res['label'], 0) for res in sentiment_results])
        except Exception:
            all_sentiments.extend([0] * len(batch_texts))
        try:
            topic_results = topic_pipeline(batch_texts, candidate_labels=CANDIDATE_TOPICS, multi_label=False, truncation=True)
            all_topics.extend([res['labels'][0] for res in topic_results])
        except Exception:
            all_topics.extend(['Uncategorized'] * len(batch_texts))

    df_to_process['sentiment_score'] = all_sentiments
    df_to_process['topic'] = all_topics
    df_final = df.merge(df_to_process[['sentiment_score', 'topic']], left_index=True, right_index=True, how='left')

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df_final.to_csv(OUTPUT_CSV, index=False)
    print(f"Enrichment complete! Saved to {OUTPUT_CSV}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Enrich data with sentiment and topics.")
    parser.add_argument("month", type=str, help="The month to process in YYYY-MM format.")
    args = parser.parse_args()
    enrich_for_month(args.month)
