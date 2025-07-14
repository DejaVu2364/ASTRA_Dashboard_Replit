import pandas as pd
import google.generativeai as genai
import os
import argparse
from datetime import datetime
from dotenv import load_dotenv
from dateutil.relativedelta import relativedelta

load_dotenv()

def generate_comparative_report(month_str):
    """
    Generates a high-value, comparative strategic report using Google Gemini,
    comparing the target month to the previous month.
    """
    print(f"\n--- [AI Report Generation] for {month_str} ---")
    
    # --- 1. DEFINE FILE PATHS ---
    current_month = pd.to_datetime(month_str)
    prev_month_str = (current_month - relativedelta(months=1)).strftime('%Y-%m')
    
    current_summary_file = f"monthly_reports/post_summary_{month_str}.csv"
    prev_summary_file = f"monthly_reports/post_summary_{prev_month_str}.csv"
    output_report_file = f"monthly_reports/report-{month_str}.md"

    TARGET_PROFILE = "Dr. Prabha Mallikarjun"
    
    # --- 2. CHECK IF REPORT ALREADY EXISTS TO SAVE API CALLS ---
    if os.path.exists(output_report_file):
        print(f"--> Report for {month_str} already exists. Skipping generation.")
        return True # Indicate success as it already exists

    # --- 3. LOAD DATA & HANDLE MISSING PREVIOUS MONTH ---
    try:
        df_current = pd.read_csv(current_summary_file)
        current_context = df_current.to_csv(index=False)
    except FileNotFoundError:
        print(f"--> ERROR: Cannot generate report. Summary file not found: {current_summary_file}"); return False
        
    prev_context = "No data available for the previous month for comparison."
    try:
        df_prev = pd.read_csv(prev_summary_file)
        prev_context = df_prev.to_csv(index=False)
    except FileNotFoundError:
        print(f"--> INFO: Previous month's summary ({prev_summary_file}) not found. Generating a standard (non-comparative) report.")

    # --- 4. CONFIGURE API ---
    try:
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key: raise ValueError("GOOGLE_API_KEY not found in .env file.")
        genai.configure(api_key=api_key)
    except Exception as e:
        print(f"--> API Key Error: {e}"); return False

    # --- 5. THE "10/10" PROMPT ---
    analysis_period = current_month.strftime('%B %Y')
    prev_period_name = (current_month - relativedelta(months=1)).strftime('%B %Y')

    final_prompt = f"""
    You are Astra, an elite AI-powered political intelligence analyst. Your primary function is to synthesize social media data into a high-value, hard-hitting strategic report for a political client. Your tone is authoritative, insightful, and focused on actionable intelligence. Never break character.

    You have been provided with two datasets:
    1.  **Current Month Data ({analysis_period}):** The primary data for this report.
    2.  **Previous Month Data ({prev_period_name}):** Data for comparison to identify trends and momentum.

    YOUR TASK:
    Generate a comprehensive strategic intelligence report for {TARGET_PROFILE}. You MUST structure your report using the following format precisely. For every key finding, you MUST include a "Hard Evidence" subsection, citing specific data from the CSVs (e.g., post_id, avg_sentiment_score) to prove your assertions.

    ---
    # Astra Intelligence Report: {analysis_period}

    ## 1. Executive Summary & Key Performance Indicators (KPIs)
    -   Provide a top-level summary of the month's performance.
    -   **Crucially, compare this month's KPIs (Avg. Sentiment, Avg. Engagement Rate) to the previous month's data.** State clearly if performance is up, down, or flat.
    -   Mention the most dominant positive and negative topics of conversation.

    ## 2. Thematic Deep Dive: Sentiment by Topic
    -   Analyze the sentiment associated with the key topics discussed this month (e.g., 'Healthcare', 'Infrastructure').
    -   Identify "Positive Strongholds": Topics where sentiment is consistently high.
    -   Identify "Negative Vulnerabilities": Topics that are driving negative engagement and require attention.
    -   For each, provide "Hard Evidence" with post_ids and example comments.

    ## 3. Threat Analysis & Emerging Narratives
    -   Identify the most significant threats or negative narratives from the comments.
    -   Are these new threats this month, or are they continuing from the previous month? Use the comparison data to determine this.
    -   Provide specific examples of comments that exemplify these threats.

    ## 4. Strategic Recommendations
    -   Based on your entire analysis, provide a set of clear, actionable recommendations.
    -   **Amplify:** What's working and should be done more?
    -   **Mitigate:** How to counter the negative narratives and address vulnerabilities?
    -   **Opportunity:** What new opportunities for engagement or messaging does the data reveal?
    ---

    **Current Month Data ({analysis_period}):**
    ```csv
    {current_context}
    ```

    **Previous Month Data ({prev_period_name}):**
    ```csv
    {prev_context}
    ```
    """

    print(f"Connecting to Google Gemini for comparative analysis of {month_str}...")
    try:
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        response = model.generate_content(final_prompt)
        
        with open(output_report_file, "w", encoding="utf-8") as f:
            f.write(response.text)
        
        # --- THIS IS THE CORRECTED LINE ---
        # The emoji has been removed to ensure compatibility with all terminals.
        print(f"[SUCCESS] AI Report for {month_str} successfully generated and saved.")
        return True
    except Exception as e:
        print(f"--> ERROR generating report with Gemini: {e}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a comparative Gemini report for a specific month.")
    parser.add_argument("month", type=str, help="The month to generate a report for (YYYY-MM).")
    args = parser.parse_args()
    generate_comparative_report(args.month)