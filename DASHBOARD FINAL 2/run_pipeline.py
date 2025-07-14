# File: run_pipeline.py (Streamlined Final Version)
import os
import re
import subprocess
import argparse

def run_command(command):
    command_str = ' '.join(command)
    print(f"\n>>> EXECUTING: {command_str}")
    try:
        result = subprocess.run(command, check=True, text=True, capture_output=True, encoding='utf-8')
        print(result.stdout)
        print(f">>> SUCCESS: {command_str}")
    except subprocess.CalledProcessError as e:
        print(f"\n---!!! ERROR: Command failed with exit code {e.returncode} !!!---")
        print(f"--- FAILED COMMAND: {command_str} ---")
        print(f"\n--- STDOUT from failed script: ---\n{e.stdout}")
        print(f"\n--- STDERR from failed script: ---\n{e.stderr}")
        raise

def main(generate_reports_flag):
    print("--- Starting Astra Intelligence [Automated Trust & Verify] Pipeline ---")
    
    try:
        print("\n" + "="*20 + " PRE-STEP: PARTITIONING DATA " + "="*20)
        run_command(['python', 'partition_by_month.py'])
    except Exception:
        print("\n---!!! FATAL ERROR: Partitioning failed. !!!---"); return

    MONTHLY_DATA_FOLDER = 'monthly_data'
    try:
        files = os.listdir(MONTHLY_DATA_FOLDER)
        month_regex = re.compile(r"(\d{4}-\d{2})\.json")
        months_to_process = sorted([match.group(1) for f in files if (match := month_regex.match(f))])
        if not months_to_process:
            print("No monthly data files found."); return
        print(f"\nFound {len(months_to_process)} months to process: {months_to_process}")
    except FileNotFoundError:
        print(f"--> FATAL ERROR: Directory '{MONTHLY_DATA_FOLDER}' not found."); return
    
    successful_months, failed_months = [], []
    for month in months_to_process:
        print(f"\n{'='*20} PROCESSING MONTH: {month} {'='*20}")
        try:
            # --- The New Streamlined Workflow ---
            run_command(['python', 'process_facebook_data.py', month])
            run_command(['python', 'verify_processing.py', month])
            
            run_command(['python', 'translate_and_prepare.py', month])
            run_command(['python', 'verify_translation.py', month])
            
            run_command(['python', 'enrich_data.py', month])
            
            # The new aggregate script does it all: aggregates, sanitizes, and self-verifies.
            run_command(['python', 'aggregate_data.py', month])
            
            if generate_reports_flag:
                run_command(['python', 'generate_final_report_gemini.py', month])
            
            successful_months.append(month)
            print(f"\n[SUCCESS] Pipeline for month {month} completed successfully!")
        except Exception:
            print(f"\n---!!! PIPELINE HALTED for month {month}. !!!---")
            print("--- Continuing to the next available month... ---")
            failed_months.append(month)
            continue
    
    print("\n" + "="*60 + "\n--- Astra Intelligence Pipeline Finished ---\n" + "="*60)
    print(f"[SUCCESS] Successfully processed {len(successful_months)} months: {successful_months}")
    if failed_months:
        print(f"[FAIL] Failed to process {len(failed_months)} months: {failed_months}")
    print("\nNext Step: Launch the dashboard with `streamlit run dashboard.py`")
    print("="*60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the Astra Intelligence data pipeline.")
    parser.add_argument('--generate-reports', action='store_true', help="If set, also generate AI reports.")
    args = parser.parse_args()
    main(args.generate_reports)