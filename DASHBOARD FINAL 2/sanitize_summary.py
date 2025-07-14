# File: sanitize_summary.py (New File)
import pandas as pd
import argparse
import os
import numpy as np

def sanitize_summary_file(month_str):
    """
    Reads a summary CSV, aggressively removes any possible null/NaN values from text columns,
    and overwrites the file with a guaranteed clean version.
    This is a brute-force approach to fix persistent data integrity issues.
    """
    summary_file = f"monthly_reports/post_summary_{month_str}.csv"
    print(f"\n--- [SANITIZE] Sanitizing Final Summary File for {month_str} ---")

    try:
        # Load the CSV, allowing pandas to detect its standard missing values.
        df = pd.read_csv(summary_file)
    except FileNotFoundError:
        print(f"--> ERROR: Cannot sanitize. File not found: {summary_file}"); exit(1)
    except Exception as e:
        print(f"--> ERROR: Could not read file {summary_file}. Error: {e}"); exit(1)

    # Define all columns that should ONLY contain text.
    text_cols = [
        'post_caption', 'content_type', 'main_topic', 
        'most_positive_comment', 'original_positive_context',
        'most_negative_comment', 'original_negative_context'
    ]

    # This loop is the core of the sanitizer.
    for col in text_cols:
        if col in df.columns:
            # For each text column, convert EVERYTHING to a string first.
            # Then, replace any string that says "nan" or "None" with "N/A".
            # Finally, fill any remaining actual nulls. This is hyper-defensive.
            df[col] = df[col].astype(str).replace({'nan': 'N/A', 'None': 'N/A'}).fillna('N/A')

    try:
        # Overwrite the original file with the sanitized dataframe.
        df.to_csv(summary_file, index=False)
        print(f"[SUCCESS] File '{summary_file}' has been sanitized and overwritten.")
    except Exception as e:
        print(f"--> ERROR: Could not save sanitized file. Error: {e}"); exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sanitize a post_summary.csv file to remove all nulls from text columns.")
    parser.add_argument("month", type=str, help="The month to sanitize in YYYY-MM format.")
    args = parser.parse_args()
    sanitize_summary_file(args.month)