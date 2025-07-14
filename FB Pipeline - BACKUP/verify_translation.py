import pandas as pd
import argparse
import re
import os
import string

# We consider the translation a failure if more than 2% of comments are bad.
FAILURE_THRESHOLD_PERCENT = 2.0

def is_mostly_non_latin(text, threshold=0.5):
    if not text or not isinstance(text, str): return False
    punctuation_to_remove = string.punctuation
    cleaned_text = re.sub(f'[{re.escape(punctuation_to_remove)}\s\d]', '', text)
    if not cleaned_text: return False
    non_latin_chars = len(re.findall(r'[^a-zA-Z]', cleaned_text))
    if len(cleaned_text) == 0: return False
    return (non_latin_chars / len(cleaned_text)) > threshold

def verify_translation_step(month_str):
    INPUT_CSV = f"processed_data/analysis_ready_{month_str}.csv"
    print(f"\n--- [VERIFY] Translation Quality Report for {month_str} ---")

    try:
        df = pd.read_csv(INPUT_CSV).fillna('')
    except FileNotFoundError:
        print(f"--> VERIFICATION ERROR: Input file '{INPUT_CSV}' not found."); exit(1)

    total_rows = len(df)
    if total_rows == 0:
        print("Input file is empty. Verification skipped and passed."); return

    failed_translations = 0
    failure_examples = []
    for _, row in df.iterrows():
        lang = row['original_language']
        analysis_text = row['text_for_analysis']
        if (lang not in ['en', ''] and is_mostly_non_latin(analysis_text)) or \
           (lang == 'en' and is_mostly_non_latin(analysis_text)):
            failed_translations += 1
            failure_examples.append(row)

    print("\n" + "="*50)
    print("           TRANSLATION QUALITY REPORT")
    print("="*50)
    
    failure_rate = (failed_translations / total_rows) * 100
    print(f"Total Comments Analyzed: {total_rows}")
    print(f"Suspected Translation Failures: {failed_translations} ({failure_rate:.2f}%)")
    
    if failure_rate > FAILURE_THRESHOLD_PERCENT:
        print(f"❌ VERIFICATION FAILED: Failure rate ({failure_rate:.2f}%) is above the {FAILURE_THRESHOLD_PERCENT:.2f}% threshold.")
        print("\n--- Examples of Failed Translations ---")
        df_failures = pd.DataFrame(failure_examples)
        with pd.option_context('display.max_rows', 5, 'display.max_colwidth', 50):
            print(df_failures[['original_language', 'original_comment_for_context', 'text_for_analysis']])
        print("\nACTION REQUIRED: Translation quality is too low to proceed.")
        print("="*50)
        exit(1) # <<-- CRITICAL: Signal failure to the pipeline orchestrator
    else:
        print(f"✅ VERIFICATION PASSED: Failure rate ({failure_rate:.2f}%) is within acceptable limits.")

    print("="*50)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify the output of the translation step.")
    parser.add_argument("month", type=str, help="The month to verify in YYYY-MM format.")
    args = parser.parse_args()
    verify_translation_step(args.month)