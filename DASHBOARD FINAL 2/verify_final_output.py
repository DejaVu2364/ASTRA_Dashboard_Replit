# File: verify_final_output.py (The Corrected, Simplified Final Version)
import pandas as pd
import argparse
import os

def verify_final_outputs(month_str):
    print(f"\n--- [VERIFY] Final Output Verification for {month_str} ---")
    
    enriched_file = f"enriched_data/enriched_data_{month_str}.csv"
    summary_file = f"monthly_reports/post_summary_{month_str}.csv"

    # --- 1. Verify Enrichment Output (No changes needed here) ---
    print(f"\n1. Verifying Enrichment File: '{enriched_file}'")
    try:
        df_enriched = pd.read_csv(enriched_file)
        if not {'sentiment_score', 'topic'}.issubset(df_enriched.columns):
            print(f"[FAILED] Enrichment schema invalid."); exit(1)
        print("[PASSED] Enrichment schema is valid.")
    except Exception as e:
        print(f"[FAILED] Error during enrichment verification: {e}"); exit(1)

    # --- 2. Verify Final Summary Output (NEW SIMPLIFIED LOGIC) ---
    print(f"\n2. Verifying Final Summary File: '{summary_file}'")
    try:
        # Step A: Just try to read the file. If it fails, the file is corrupted.
        df_summary = pd.read_csv(summary_file)
        print("[PASSED] Final summary file is readable and well-formed.")

        # Step B: Check for required columns.
        REQUIRED_SUMMARY_COLS = {'post_id', 'most_positive_comment', 'most_negative_comment', 'original_positive_context', 'original_negative_context'}
        if not REQUIRED_SUMMARY_COLS.issubset(df_summary.columns):
            print(f"[FAILED] Final summary schema invalid. Missing columns."); exit(1)
        print("[PASSED] Final summary schema is valid.")

        # Step C: Check for any nulls in the critical text columns.
        # This is a more direct and reliable check.
        text_cols = ['most_positive_comment', 'original_positive_context', 'most_negative_comment', 'original_negative_context']
        for col in text_cols:
            # Check if any value in the column is actually null (a missing value object)
            if df_summary[col].hasnans:
                print(f"[FAILED] Data integrity issue: Column '{col}' contains hard null/NaN values.")
                # Optional: print the offending rows for debugging
                # print(df_summary[df_summary[col].isnull()])
                exit(1)
        
        print("[PASSED] Data integrity check successful. No null values found in key text columns.")

    except FileNotFoundError:
        print(f"[FAILED] File not found: '{summary_file}'"); exit(1)
    except Exception as e:
        print(f"[FAILED] Error during final summary verification: {e}"); exit(1)
        
    print("\n[SUCCESS] All final output verifications passed!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify the final outputs of the pipeline.")
    parser.add_argument("month", type=str, help="The month to verify (YYYY-MM).")
    args = parser.parse_args()
    verify_final_outputs(args.month)