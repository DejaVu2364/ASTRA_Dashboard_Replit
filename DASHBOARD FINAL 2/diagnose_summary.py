# File: diagnose_summary.py (New Diagnostic Tool)
import pandas as pd
import argparse

def diagnose_file(month_str):
    summary_file = f"monthly_reports/post_summary_{month_str}.csv"
    print(f"\n--- DIAGNOSING FILE: {summary_file} ---\n")

    try:
        # Load the file exactly as the verifier does, keeping all values as strings
        df = pd.read_csv(summary_file, keep_default_na=False, na_values=[''])
    except FileNotFoundError:
        print(f"File not found. Cannot diagnose.")
        return

    text_cols = ['original_positive_context', 'original_negative_context']
    
    # Find rows where the specified columns have null values
    problem_rows = df[df[text_cols].isnull().any(axis=1)]

    if problem_rows.empty:
        print("No rows with null values found in the key columns. The file appears clean.")
    else:
        print("!!! FOUND ROWS WITH NULL/NAN VALUES !!!")
        print("The following rows are causing the verification to fail:")
        
        # Print the relevant columns of the problem rows
        print(problem_rows[['post_id', 'most_positive_comment', 'original_positive_context', 'most_negative_comment', 'original_negative_context']])

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Diagnose a post_summary.csv file for null values.")
    parser.add_argument("month", type=str, help="The month to diagnose in YYYY-MM format.")
    args = parser.parse_args()
    diagnose_file(args.month)