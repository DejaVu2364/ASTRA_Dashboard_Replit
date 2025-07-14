import streamlit as st
import pandas as pd
import glob
import plotly.express as px
import os
from dateutil.relativedelta import relativedelta

# --- 1. CONFIGURATION ---
# REFACTOR: Move hardcoded values to a config dictionary for easy updates.
CONFIG = {
    "client_name": "Dr. Prabha Mallikarjun",
    "summary_data_folder": "monthly_reports",
    "comment_data_folder": "enriched_data",
    "ai_reports_folder": "monthly_reports",
}

# --- 2. PAGE CONFIGURATION ---
st.set_page_config(page_title="Astra Intelligence Dashboard", page_icon="📊", layout="wide")

# --- 3. DATA LOADING & CACHING FUNCTIONS ---
@st.cache_data
def load_and_process_data(folder_path, file_prefix):
    """
    REFACTOR: A single, reusable function to load and process all data files from a given folder.
    This function replaces the previous two separate loading functions.
    """
    path_pattern = os.path.join(folder_path, f"{file_prefix}_*.csv")
    files = glob.glob(path_pattern)
    if not files:
        return pd.DataFrame()

    df_list = []
    for f in files:
        try:
            # Extract YYYY-MM from filename for robust date creation
            month_str = os.path.basename(f).replace(f'{file_prefix}_', '').replace('.csv', '')
            df_month = pd.read_csv(f, dtype={'post_id': str})
            # The 'month' column represents the first day of the analysis month.
            df_month['month'] = pd.to_datetime(month_str, format='%Y-%m')
            df_list.append(df_month)
        except Exception as e:
            st.error(f"Failed to load or process file {f}: {e}")
            continue

    if not df_list:
        return pd.DataFrame()

    full_df = pd.concat(df_list, ignore_index=True)

    # Clean up known text columns by filling missing values.
    text_cols = [
        'most_positive_comment', 'original_positive_context', 'most_negative_comment',
        'original_negative_context', 'post_caption', 'main_topic', 'content_type',
        'original_comment_for_context', 'text_for_analysis', 'topic'
    ]
    for col in text_cols:
        if col in full_df.columns:
            full_df[col] = full_df[col].fillna("N/A")

    return full_df.sort_values('month', ignore_index=True)

@st.cache_data
def load_gemini_report(month_str):
    """Loads a specific monthly AI report from the filesystem."""
    report_path = os.path.join(CONFIG["ai_reports_folder"], f"report-{month_str}.md")
    try:
        with open(report_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return ""

# --- 4. LOAD INITIAL DATA ---
# Use the new, refactored loading function
df_full_summary = load_and_process_data(CONFIG["summary_data_folder"], "post_summary")
df_full_comments = load_and_process_data(CONFIG["comment_data_folder"], "enriched_data")

if df_full_summary.empty:
    st.error("No Summary Data Found!", icon="🚨")
    st.info(f"Please ensure that `post_summary_*.csv` files exist in the `{CONFIG['summary_data_folder']}` folder and are not empty.")
    st.stop()

# --- 5. SIDEBAR FILTERS ---
st.sidebar.title("Dashboard Controls")
st.sidebar.header("Analysis Period")
min_date = df_full_summary['month'].min().date()
max_date = df_full_summary['month'].max().date()

default_start_calculated = max_date - relativedelta(months=2)
default_start = max([min_date, default_start_calculated])

# The date_input selects specific days, but our data is monthly. We'll adjust the selection
# to cover the full months selected.
selected_start_date, selected_end_date = st.sidebar.date_input(
    "Select Date Range:",
    value=(default_start, max_date),
    min_value=min_date,
    max_value=max_date
)

# CLARIFY DATE FILTERING: Adjust selection to the start of the first month and end of the last month.
primary_start = pd.to_datetime(selected_start_date).to_period('M').to_timestamp()
primary_end = (pd.to_datetime(selected_end_date).to_period('M') + 1).to_timestamp() - pd.Timedelta(days=1)
st.sidebar.info(f"Filtering from {primary_start.strftime('%Y-%m-01')} to {primary_end.strftime('%Y-%m-%d')}")

st.sidebar.header("Comparison Period")
comparison_option = st.sidebar.selectbox("Compare to:", ("Previous Period", "Previous 3 Months", "Previous 6 Months", "None"), index=0)

st.sidebar.header("Content Filters")
all_topics = sorted(df_full_summary[df_full_summary['main_topic'] != "N/A"]['main_topic'].unique())
selected_topics = st.sidebar.multiselect("Filter by Topic:", options=all_topics, default=all_topics)
search_term = st.sidebar.text_input("Search in Post Caption:")

# --- 6. DYNAMIC DATA FILTERING ---
comp_start_date, comp_end_date = None, None
if comparison_option != "None":
    period_length_months = relativedelta(months=len(pd.date_range(primary_start, primary_end, freq='M')))
    if comparison_option == "Previous Period":
        comp_end_date = primary_start - pd.Timedelta(days=1)
        comp_start_date = primary_start - period_length_months
    elif comparison_option == "Previous 3 Months":
        comp_end_date = primary_start - pd.Timedelta(days=1)
        comp_start_date = primary_start - relativedelta(months=3)
    elif comparison_option == "Previous 6 Months":
        comp_end_date = primary_start - pd.Timedelta(days=1)
        comp_start_date = primary_start - relativedelta(months=6)

# Main filtering logic now correctly compares the 'month' column with the adjusted date range
common_mask = (df_full_summary['main_topic'].isin(selected_topics)) & (df_full_summary['post_caption'].str.contains(search_term, case=False, na=False))
df_primary_summary = df_full_summary[common_mask & (df_full_summary['month'] >= primary_start) & (df_full_summary['month'] <= primary_end)]

df_comparison_summary = pd.DataFrame()
if comp_start_date and comp_end_date:
    df_comparison_summary = df_full_summary[common_mask & (df_full_summary['month'] >= comp_start_date) & (df_full_summary['month'] <= comp_end_date)]

if not df_full_comments.empty:
    common_mask_comments = (df_full_comments['topic'].isin(selected_topics)) & (df_full_comments['post_caption'].str.contains(search_term, case=False, na=False))
    df_filtered_comments = df_full_comments[common_mask_comments & (df_full_comments['month'] >= primary_start) & (df_full_comments['month'] <= primary_end)]
else:
    df_filtered_comments = pd.DataFrame()

# --- 7. MAIN DASHBOARD LAYOUT ---
st.title("Astra Intelligence: Social Media Analysis Platform")
st.markdown(f"**Client:** {CONFIG['client_name']} | **Period Analyzed:** {primary_start.strftime('%B %Y')} to {primary_end.strftime('%B %Y')}")

if df_primary_summary.empty:
    st.warning("No data matches your current filter selection.")
    st.stop()

# (The rest of the UI code for tabs remains the same, as it was already excellent)
overview_tab, analysis_tab, explorer_tab, reports_tab = st.tabs(["Executive Overview", "Trend & Content Analysis", "Data Explorer", "AI Briefing Library"])

with overview_tab:
    st.header("Performance Cockpit")
    tab1, tab2 = st.tabs(["Key Performance Indicators", "Period Highlights & Red Flags"])
    with tab1:
        kpi1, kpi2, kpi3, kpi4 = st.columns(4)
        primary_sentiment = df_primary_summary['avg_sentiment_score'].mean()
        primary_engagement = df_primary_summary['weighted_engagement_rate'].mean()
        comp_sentiment = df_comparison_summary['avg_sentiment_score'].mean() if not df_comparison_summary.empty else 0
        comp_engagement = df_comparison_summary['weighted_engagement_rate'].mean() if not df_comparison_summary.empty else 0
        kpi1.metric("Total Posts Analyzed", f"{df_primary_summary['post_id'].nunique():,}")
        kpi2.metric("Total Comments Analyzed", f"{df_primary_summary['comment_count'].sum():,}")
        kpi3.metric("Average Sentiment Score", f"{primary_sentiment:.2f}", f"{primary_sentiment - comp_sentiment:.2f}" if comparison_option != "None" else None, help="Change vs. comparison period")
        kpi4.metric("Average Engagement Rate", f"{primary_engagement:.3%}", f"{primary_engagement - comp_engagement:.3%}" if comparison_option != "None" else None, help="Change vs. comparison period")
    with tab2:
        hl1, hl2, hl3 = st.columns(3)
        top_engagement_post = df_primary_summary.loc[df_primary_summary['weighted_engagement_rate'].idxmax()]
        hl1.metric("Highest Engagement Post", f"{top_engagement_post['weighted_engagement_rate']:.3%}", help=f"Topic: {top_engagement_post['main_topic']}")
        top_sentiment_post = df_primary_summary.loc[df_primary_summary['avg_sentiment_score'].idxmax()]
        hl2.metric("Most Positive Post", f"{top_sentiment_post['avg_sentiment_score']:.2f}", help=f"Topic: {top_sentiment_post['main_topic']}")
        most_negative_post = df_primary_summary.loc[df_primary_summary['negative_comment_ratio'].idxmax()]
        hl3.metric("Highest Negative Ratio Post", f"{most_negative_post['negative_comment_ratio']:.1%}", help=f"Topic: {most_negative_post['main_topic']}")

with analysis_tab:
    st.header("Performance & Content Analysis")
    tab1, tab2, tab3 = st.tabs(["Performance Trends", "Content Strategy", "Period-over-Period Comparison"])
    with tab1:
        st.subheader("Performance Over Time (Primary Period)")
        df_monthly = df_primary_summary.groupby(df_primary_summary['month'].dt.to_period('M')).agg(avg_sentiment_score=('avg_sentiment_score', 'mean'), weighted_engagement_rate=('weighted_engagement_rate', 'mean')).reset_index()
        df_monthly['month'] = df_monthly['month'].dt.to_timestamp()
        fig_time = px.line(df_monthly, x='month', y=['avg_sentiment_score', 'weighted_engagement_rate'], markers=True, labels={"value": "Score / Rate", "month": "Month", "variable": "Metric"})
        st.plotly_chart(fig_time, use_container_width=True)
    with tab2:
        st.subheader("Performance by Content Type")
        if 'content_type' not in df_primary_summary.columns or df_primary_summary['content_type'].nunique() <= 1:
            st.info("The 'content_type' column is missing or has only one value. Please re-run the pipeline with varied content types to enable this chart.")
        else:
            content_performance = df_primary_summary.groupby('content_type').agg(avg_engagement=('weighted_engagement_rate', 'mean'), avg_sentiment=('avg_sentiment_score', 'mean'), post_count=('post_id', 'nunique')).reset_index()
            fig_quadrant = px.scatter(content_performance, x='avg_engagement', y='avg_sentiment', size='post_count', color='content_type', text='content_type', labels={"avg_engagement": "Average Engagement Rate", "avg_sentiment": "Average Sentiment Score"}, title="Content Type Performance Quadrant")
            fig_quadrant.update_traces(textposition='top center')
            st.plotly_chart(fig_quadrant, use_container_width=True)
    with tab3:
        st.subheader("Sentiment Trend Comparison")
        if df_comparison_summary.empty or comparison_option == "None":
            st.info("Select a comparison period from the sidebar to view trend comparison.")
        else:
            primary_monthly = df_primary_summary.groupby(df_primary_summary['month'].dt.to_period('M')).agg(avg_sentiment_score=('avg_sentiment_score', 'mean')).reset_index()
            primary_monthly['Period'] = 'Primary'
            comp_monthly = df_comparison_summary.groupby(df_comparison_summary['month'].dt.to_period('M')).agg(avg_sentiment_score=('avg_sentiment_score', 'mean')).reset_index()
            primary_monthly['day_num'] = (primary_monthly['month'].dt.to_timestamp() - primary_monthly['month'].dt.to_timestamp().min()).dt.days
            comp_monthly['day_num'] = (comp_monthly['month'].dt.to_timestamp() - comp_monthly['month'].dt.to_timestamp().min()).dt.days
            comparison_df = pd.concat([primary_monthly, comp_monthly])
            fig_comp = px.line(comparison_df, x='day_num', y='avg_sentiment_score', color='Period', markers=True, labels={"day_num": "Days into Period", "avg_sentiment_score": "Average Sentiment Score"}, title="Sentiment Trend: Primary vs. Comparison Period")
            st.plotly_chart(fig_comp, use_container_width=True)

with explorer_tab:
    st.header("Data Explorer")
    st.subheader("Post-Level Summary")
    st.markdown("A high-level summary of all posts that match the current filter selection.")
    columns_to_display = ['post_id', 'post_caption', 'avg_sentiment_score', 'negative_comment_ratio', 'main_topic', 'most_positive_comment', 'most_negative_comment']
    st.data_editor(df_primary_summary[columns_to_display],
        column_config={
            "post_caption": st.column_config.TextColumn("Post Caption", width="medium"),
            "most_positive_comment": st.column_config.TextColumn("Most Positive Comment", width="large"),
            "most_negative_comment": st.column_config.TextColumn("Most Negative Comment", width="large"),
            "avg_sentiment_score": st.column_config.NumberColumn("Avg. Sentiment", format="%.2f"),
            "negative_comment_ratio": st.column_config.ProgressColumn("Negative Ratio", format="%.1f%%", min_value=0, max_value=1),
        }, use_container_width=True, hide_index=True)
    st.markdown("---")
    st.subheader("Individual Comment Explorer")
    st.markdown("A detailed view of all individual comments that match the current filter selection.")
    if df_filtered_comments.empty:
        st.warning("No individual comments match your current filter selection.")
    else:
        st.info(f"Displaying **{len(df_filtered_comments)}** individual comments.")
        st.data_editor(df_filtered_comments[['post_id', 'original_comment_for_context', 'text_for_analysis', 'sentiment_score', 'topic']],
            column_config={
                "original_comment_for_context": st.column_config.TextColumn("Original Comment", width="large"),
                "text_for_analysis": st.column_config.TextColumn("Cleaned & Translated", width="large"),
                "sentiment_score": st.column_config.NumberColumn("Sentiment", format="%.2f"),
            }, use_container_width=True, hide_index=True, num_rows="dynamic")

with reports_tab:
    st.header("AI Strategic Briefing Library")
    st.markdown("Browse all automatically generated comparative intelligence reports.")
    report_files = sorted(glob.glob(os.path.join(CONFIG["ai_reports_folder"], "report-*.md")), reverse=True)
    report_months = [os.path.basename(f).replace('report-', '').replace('.md', '') for f in report_files]
    if not report_months:
        st.warning("No AI reports found. Run the pipeline with the `--generate-reports` flag.")
        st.code("python run_pipeline.py --generate-reports")
    else:
        selected_report_month = st.selectbox("Select a report to view:", options=report_months)
        if selected_report_month:
            report_text = load_gemini_report(selected_report_month)
            st.markdown(report_text, unsafe_allow_html=True)