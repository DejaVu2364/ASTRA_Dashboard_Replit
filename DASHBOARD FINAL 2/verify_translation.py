# File: verify_translation.py (Definitive Final Version)
import pandas as pd
import argparse
import re
import string
import sys
import codecs

# --- Configure system to handle Unicode for printing ---
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

FAILURE_THRESHOLD_PERCENT = 2.0

def is_mostly_non_latin(text, threshold=0.5):
    """Checks if a string contains a high percentage of non-Latin characters."""
    if not text or not isinstance(text, str):
        return False
    # Use a raw string r'...' to avoid SyntaxWarning
    cleaned_text = re.sub(r'[{re.escape(string.punctuation)}\s\d]', '', text)
    if not cleaned_text:
        return False
    
    non_latin_chars = len(re.findall(r'[^\x00-\x7F]', cleaned_text)) # More robust check for non-ASCII
    if len(cleaned_text) == 0:
        return False
        
    return (non_latin_chars / len(cleaned_text)) > threshold

def verify_translation_step(month_str):
    """Verifies the output of the translation step for schema and quality."""
    INPUT_CSV = f"processed_data/analysis_ready_{month_str}.csv"
    print(f"\n--- [VERIFY] Translation Quality & Schema Report for {month_str} ---")

    try:
        df = pd.read_csv(INPUT_CSV).fillna('')
    except FileNotFoundError:
        print(f"--> [FAILED] VERIFICATION ERROR: Input file '{INPUT_CSV}' not found."); exit(1)

    # --- Schema Check ---
    print("1. Verifying output schema...")
    REQUIRED_COLUMNS = {'post_id', 'content_type', 'text_for_analysis', 'original_language'}
    missing_cols = REQUIRED_COLUMNS - set(df.columns)
    if not missing_cols:
        print("[PASSED] Schema verification successful. 'content_type' column was passed through correctly.")
    else:
        print(f"[FAILED] SCHEMA FAILED: Missing columns: {list(missing_cols)}"); exit(1)
    
    # --- Translation Quality Check ---
    print("\n2. Verifying translation quality...")
    total_rows = len(df)
    if total_rows == 0:
        print("[PASSED] Input file is empty. Verification skipped."); return

    failed_translations_df = df[
        (df['original_language'] != 'en') & 
        (df['original_language'] != '') & 
        (df['original_language'] != 'error') & # Also check for our explicit error flag
        (df['text_for_analysis'].apply(is_mostly_non_latin))
    ]
    failed_translations = len(failed_translations_df)
    failure_rate = (failed_translations / total_rows) * 100 if total_rows > 0 else 0
    
    print(f"Total Comments Analyzed: {total_rows}")
    print(f"Suspected Translation Failures: {failed_translations} ({failure_rate:.2f}%)")
    
    if failure_rate > FAILURE_THRESHOLD_PERCENT:
        print(f"[FAILED] QUALITY FAILED: Failure rate ({failure_rate:.2f}%) is above the {FAILURE_THRESHOLD_PERCENT:.2f}% threshold.")
        print("\n--- Examples of Failed Translations ---")
        # --- ROBUST PRINTING LOGIC ---
        for index, row in failed_translations_df.head(5).iterrows():
            try:
                print(f"Lang: {row['original_language']}, Original: {row['original_comment_for_context'][:70]}..., Translated: {row['text_for_analysis'][:70]}...")
            except Exception as e:
                print(f"Could not print row {index} due to encoding issue: {e}")
        # ---------------------------
        exit(1)
    else:
        print(f"[PASSED] Translation quality is within acceptable limits.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify the output of the translation step.")
    parser.add_argument("month", type=str, help="The month to verify in YYYY-MM format.")
    args = parser.parse_args()
    verify_translation_step(args.month)