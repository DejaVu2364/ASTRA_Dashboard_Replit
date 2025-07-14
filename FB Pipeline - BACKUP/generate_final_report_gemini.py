# generate_final_report_gemini.py
import pandas as pd
import google.generativeai as genai
import os
import argparse
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def generate_report_for_month(month_str):
    INPUT_SUMMARY_CSV = f"monthly_summaries/post_summary_{month_str}.csv"
    TARGET_PROFILE = "Dr. Prabha Mallikarjun"
    FOLLOWER_COUNT = 88000

    print(f"\n--- [Step 5] Generating Final Strategic Report for {month_str} ---")

    try:
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key: raise ValueError("GOOGLE_API_KEY not found in .env file.")
        genai.configure(api_key=api_key)
    except Exception as e:
        print(f"--> API Key Error: {e}"); exit(1)

    try:
        with open(INPUT_SUMMARY_CSV, 'r', encoding='utf-8') as f:
            data_context = f.read()
    except FileNotFoundError:
        print(f"--> ERROR: '{INPUT_SUMMARY_CSV}' not found. Run the full pipeline first."); exit(1)

    if not data_context.strip():
        print(f"Input file '{INPUT_SUMMARY_CSV}' is empty. No report to generate.")
        return

    analysis_period = datetime.strptime(month_str, '%Y-%m').strftime('%B %Y')

    final_prompt = f"""
    You are Astra, an elite AI-powered political intelligence analyst. Your primary function is to transform raw social media data into a high-value, hard-hitting strategic report for a political client. Your tone should be authoritative, insightful, and focused on actionable intelligence.

    I have provided you with a dataset, which is the contents of a post_summary.csv file. This file contains an aggregated summary of '{TARGET_PROFILE}'s Facebook page activity for the period of **{analysis_period}**.

    Your Task:
    Based on your analysis of this entire dataset, generate two distinct, comprehensive reports for the client, {TARGET_PROFILE}. For every key finding, you must include a "Hard Evidence" subsection, citing specific data from the CSV (e.g., post_id, avg_sentiment_score, or direct quotes).

    Report 1: Confidential Political Intelligence Brief
    - Section 1: Executive Summary
    - Section 2: Threat Analysis & Key Narratives
    - Section 3: Strategic Recommendations

    Report 2: Social Media Performance & Reach Analysis
    - Section 1: Executive Summary
    - Section 2: Performance Analysis (Use the Weighted Engagement Rate formula: (total_likes + comment_count + 2*num_shares) / {FOLLOWER_COUNT})
    - Section 3: Actionable Recommendations for Growth

    --- RAW DATA SUMMARY for {analysis_period} ---
    {data_context}
    --- END OF RAW DATA ---
    """

    print("Connecting to Google Gemini to generate the Astra reports...")
    try:
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        response = model.generate_content(final_prompt)
        print("\n\n" + "="*30 + f" ASTRA STRATEGIC REPORT: {analysis_period} " + "="*25)
        print(f"Analysis for: {TARGET_PROFILE}\n")
        print(response.text)
        print("="*82)
    except Exception as e:
        print(f"--> ERROR generating report with Gemini: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Gemini report for a specific month's summary.")
    parser.add_argument("month", type=str, help="The month to generate a report for (YYYY-MM).")
    args = parser.parse_args()
    generate_report_for_month(args.month)
