import streamlit as st
import pandas as pd
import glob
import plotly.express as px
import os
import numpy as np
from dateutil.relativedelta import relativedelta

# --- 1. PAGE CONFIGURATION ---
st.set_page_config(page_title="Astra Intelligence Dashboard", page_icon="📊", layout="wide")

# --- 2. DATA LOADING & CACHING FUNCTIONS ---
@st.cache_data
def load_all_summary_data():
    """Loads and cleans all post-summary CSVs into a single dataframe."""
    summary_path_pattern = os.path.join("monthly_reports", "post_summary_*.csv")
    summary_files = glob.glob(summary_path_pattern)
    if not summary_files:
        return pd.DataFrame()

    df_list = []
    for f in summary_files:
        try:
            month_str = os.path.basename(f).replace('post_summary_', '').replace('.csv', '')
            df_month = pd.read_csv(f, dtype={'post_id': str})
            df_month['month'] = pd.to_datetime(month_str, format='%Y-%m')
            df_list.append(df_month)
        except Exception as e:
            st.error(f"Failed to load or process summary file {f}: {e}")
            continue

    if not df_list:
        return pd.DataFrame()

    full_df = pd.concat(df_list, ignore_index=True)
    full_df.dropna(subset=['month'], inplace=True)

    text_cols = ['most_positive_comment', 'original_positive_context', 'most_negative_comment', 'original_negative_context', 'post_caption', 'main_topic', 'content_type']
    for col in text_cols:
        if col in full_df.columns:
            full_df[col] = full_df[col].fillna("N/A")

    return full_df.sort_values('month')

@st.cache_data
def load_all_comment_data():
    """Loads and cleans all enriched comment CSVs."""
    comment_files = glob.glob("enriched_data/enriched_data_*.csv")
    if not comment_files: return pd.DataFrame()
    
    df_list = []
    for f in comment_files:
        try:
            month_str = os.path.basename(f).replace('enriched_data_', '').replace('.csv', '')
            df_month = pd.read_csv(f, dtype={'post_id': str})
            df_month['month'] = pd.to_datetime(month_str, format='%Y-%m')
            df_list.append(df_month)
        except Exception:
            continue
            
    if not df_list: return pd.DataFrame()

    full_df = pd.concat(df_list, ignore_index=True)
    full_df.dropna(subset=['month'], inplace=True)

    text_cols = ['post_caption', 'original_comment_for_context', 'text_for_analysis', 'topic']
    for col in text_cols:
        if col in full_df.columns:
            full_df[col] = full_df[col].fillna("N/A")

    return full_df

@st.cache_data
def load_gemini_report(month_str):
    """Loads a specific monthly AI report."""
    report_path = os.path.join("monthly_reports", f"report-{month_str}.md")
    try:
        with open(report_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return ""

# --- 3. LOAD INITIAL DATA ---
df_full_summary = load_all_summary_data()
df_full_comments = load_all_comment_data()

if df_full_summary.empty:
    st.error("No Summary Data Found!", icon="🚨")
    st.info("Please ensure that `post_summary_*.csv` files exist in the `monthly_reports` folder and that they are not empty.")
    st.stop()

# --- 4. SIDEBAR FILTERS ---
st.sidebar.title("Dashboard Controls")
st.sidebar.header("Analysis Period")
min_date = df_full_summary['month'].min().date()
max_date = df_full_summary['month'].max().date()

# --- THIS IS THE FIX ---
# Calculate the default start date, but ensure it's not before the minimum available date.
default_start_calculated = max_date - relativedelta(months=2)
default_start = max([min_date, default_start_calculated])
# ---------------------

primary_start, primary_end = st.sidebar.date_input("Select Date Range:", value=(default_start, max_date), min_value=min_date, max_value=max_date)
primary_start, primary_end = pd.to_datetime(primary_start), pd.to_datetime(primary_end)

st.sidebar.header("Comparison Period")
comparison_option = st.sidebar.selectbox("Compare to:", ("Previous Period", "Previous 3 Months", "Previous 6 Months", "None"), index=0)

st.sidebar.header("Content Filters")
all_topics = sorted(df_full_summary[df_full_summary['main_topic'] != "N/A"]['main_topic'].unique())
selected_topics = st.sidebar.multiselect("Filter by Topic:", options=all_topics, default=all_topics)
search_term = st.sidebar.text_input("Search in Post Caption:")

# --- 5. DYNAMIC DATA FILTERING ---
comp_start_date, comp_end_date = None, None
if comparison_option != "None":
    if comparison_option == "Previous Period":
        primary_period_days = (primary_end - primary_start).days
        comp_end_date = primary_start - pd.Timedelta(days=1)
        comp_start_date = comp_end_date - pd.Timedelta(days=primary_period_days)
    elif comparison_option == "Previous 3 Months":
        comp_end_date = primary_start - pd.Timedelta(days=1)
        comp_start_date = comp_end_date - relativedelta(months=3)
    elif comparison_option == "Previous 6 Months":
        comp_end_date = primary_start - pd.Timedelta(days=1)
        comp_start_date = comp_end_date - relativedelta(months=6)

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
    
# --- 6. MAIN DASHBOARD LAYOUT ---
st.title("Astra Intelligence: Social Media Analysis Platform")
st.markdown(f"**Client:** Dr. Prabha Mallikarjun | **Period Analyzed:** {primary_start.strftime('%B %d, %Y')} to {primary_end.strftime('%B %d, %Y')}")

if df_primary_summary.empty:
    st.warning("No data matches your current filter selection.")
    st.stop()

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
        if 'content_type' not in df_primary_summary.columns:
            st.warning("The 'content_type' column is missing. Please re-run the full pipeline to enable this chart.")
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
    report_files = sorted(glob.glob("monthly_reports/report-*.md"), reverse=True)
    report_months = [os.path.basename(f).replace('report-', '').replace('.md', '') for f in report_files]
    if not report_months:
        st.warning("No AI reports found. Run the pipeline with the `--generate-reports` flag.")
        st.code("python run_pipeline.py --generate-reports")
    else:
        selected_report_month = st.selectbox("Select a report to view:", options=report_months)
        if selected_report_month:
            report_text = load_gemini_report(selected_report_month)
            st.markdown(report_text, unsafe_allow_html=True)