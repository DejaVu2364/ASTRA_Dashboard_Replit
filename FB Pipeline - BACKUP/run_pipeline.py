import os
import re
import subprocess

def run_command(command):
    print(f"\n>>> EXECUTING: {' '.join(command)}")
    try:
        subprocess.run(command, check=True, text=True, capture_output=True)
        print(f">>> SUCCESS: {' '.join(command)}")
    except subprocess.CalledProcessError as e:
        print(f"---!!! ERROR: Command failed with exit code {e.returncode} !!!---")
        print(f"--- STDOUT from failed script: ---\n{e.stdout}")
        print(f"--- STDERR from failed script: ---\n{e.stderr}")
        raise

def main():
    print("--- Starting Astra Intelligence [Trust & Verify] Pipeline ---")
    MONTHLY_DATA_FOLDER = 'monthly_data'
    
    try:
        files = os.listdir(MONTHLY_DATA_FOLDER)
    except FileNotFoundError:
        print(f"--> FATAL ERROR: The directory '{MONTHLY_DATA_FOLDER}' was not found."); return

    month_regex = re.compile(r"(\d{4}-\d{2})\.json")
    months_to_process = sorted([match.group(1) for f in files if (match := month_regex.match(f))])
    
    if not months_to_process: print(f"No monthly data files found."); return

    print(f"Found {len(months_to_process)} months to process: {months_to_process}")
    
    successful_months, failed_months = [], []
    for month in months_to_process:
        print(f"\n{'='*20} PROCESSING MONTH: {month} {'='*20}")
        try:
            # The new, verified sequence of operations
            run_command(['python', 'process_facebook_data.py', month])
            run_command(['python', 'verify_processing.py', month])
            
            run_command(['python', 'translate_and_prepare.py', month])
            run_command(['python', 'verify_translation.py', month])
            
            run_command(['python', 'enrich_data.py', month])
            run_command(['python', 'aggregate_data.py', month])
            
            successful_months.append(month)
        except Exception:
            print(f"\n---!!! PIPELINE HALTED for month {month} due to processing or verification failure. !!!---")
            print("--- Continuing to the next month... ---")
            failed_months.append(month)
            continue
    
    print("\n" + "="*60)
    print("--- Astra Intelligence Pipeline Finished ---")
    print(f"✅ Successfully processed and verified {len(successful_months)} months: {successful_months}")
    if failed_months:
        print(f"❌ Failed to process {len(failed_months)} months: {failed_months}")
    else:
        print("All months processed without any errors!")
    print("\nNext Step: Manually generate a report for a specific successful month using:")
    print("python generate_final_report_gemini.py YYYY-MM")
    print("="*60)

if __name__ == "__main__":
    main()