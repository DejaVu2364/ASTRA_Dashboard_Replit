import streamlit as st
import pandas as pd
import glob
import plotly.express as px
import plotly.graph_objects as go
import os
from dateutil.relativedelta import relativedelta
from wordcloud import WordCloud
import matplotlib.pyplot as plt

# --- 1. CONFIGURATION ---
# Central hub for easy updates to dashboard parameters.
CONFIG = {
    "client_name": "Dr. Prabha Mallikarjun",
    "summary_data_folder": "monthly_reports",
    "comment_data_folder": "enriched_data",
    "ai_reports_folder": "monthly_reports",
    "red_flag_comment_threshold": 3, # A post needs at least this many comments to be a red flag
    "red_flag_ratio_threshold": 0.3 # At least 30% of comments must be negative to be a red flag
}

# --- 2. PAGE CONFIGURATION ---
st.set_page_config(page_title="Astra Strategic Dashboard", page_icon="🎯", layout="wide")

# --- 3. DATA LOADING & CACHING FUNCTIONS ---
@st.cache_data
def load_and_process_data(folder_path, file_prefix):
    """A single, reusable function to load and process all data files from a given folder."""
    path_pattern = os.path.join(folder_path, f"{file_prefix}_*.csv")
    files = glob.glob(path_pattern)
    if not files: return pd.DataFrame()

    df_list = []
    for f in files:
        try:
            month_str = os.path.basename(f).replace(f'{file_prefix}_', '').replace('.csv', '')
            df_month = pd.read_csv(f, dtype={'post_id': str})
            df_month['month'] = pd.to_datetime(month_str, format='%Y-%m')
            df_list.append(df_month)
        except Exception as e:
            st.error(f"Failed to load or process file {f}: {e}")
            continue

    if not df_list: return pd.DataFrame()
    full_df = pd.concat(df_list, ignore_index=True)
    
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

@st.cache_data
def create_wordcloud(text_series):
    """Generates a word cloud figure from a pandas series of text."""
    if text_series.empty or text_series.isnull().all():
        return None
    text = " ".join(comment for comment in text_series.astype(str) if comment != "N/A")
    if not text:
        return None
        
    wordcloud = WordCloud(width=800, height=400, background_color='white', colormap='viridis', min_font_size=10).generate(text)
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.imshow(wordcloud, interpolation='bilinear')
    ax.axis("off")
    plt.tight_layout(pad=0)
    return fig

# --- 4. LOAD INITIAL DATA ---
df_full_summary = load_and_process_data(CONFIG["summary_data_folder"], "post_summary")
df_full_comments = load_and_process_data(CONFIG["comment_data_folder"], "enriched_data")

if df_full_summary.empty:
    st.error("No Summary Data Found!", icon="🚨")
    st.info(f"Please ensure `post_summary_*.csv` files exist in `{CONFIG['summary_data_folder']}`.")
    st.stop()

# --- 5. SIDEBAR FILTERS ---
st.sidebar.title("Dashboard Controls")
st.sidebar.header("Analysis Period")

min_date = df_full_summary['month'].min().date()
max_date = df_full_summary['month'].max().date()
default_start_calculated = max_date - relativedelta(months=2)
default_start = max([min_date, default_start_calculated])

date_selection = st.sidebar.date_input("Select Date Range:", value=(default_start, max_date), min_value=min_date, max_value=max_date)

if isinstance(date_selection, tuple) and len(date_selection) == 2:
    selected_start_date, selected_end_date = date_selection
else:
    selected_start_date = selected_end_date = date_selection[0] if isinstance(date_selection, tuple) else date_selection

# Use 'M' for .to_period() as required by this function, which is older.
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
    # Use 'ME' for pd.date_range() to address the FutureWarning.
    period_length_months = relativedelta(months=len(pd.date_range(primary_start, primary_end, freq='ME')))
    if comparison_option == "Previous Period":
        comp_end_date = primary_start - pd.Timedelta(days=1)
        comp_start_date = primary_start - period_length_months
    elif comparison_option == "Previous 3 Months":
        comp_end_date = primary_start - pd.Timedelta(days=1)
        comp_start_date = primary_start - relativedelta(months=3)
    elif comparison_option == "Previous 6 Months":
        comp_end_date = primary_start - pd.Timedelta(days=1)
        comp_start_date = primary_start - relativedelta(months=6)

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
st.title("Astra Strategic Command Center")
st.markdown(f"**Client:** {CONFIG['client_name']} | **Period Analyzed:** {primary_start.strftime('%B %Y')} to {primary_end.strftime('%B %Y')}")

if df_primary_summary.empty:
    st.warning("No data matches your current filter selection.")
    st.stop()

overview_tab, strategy_tab, explorer_tab, reports_tab = st.tabs(["🎯 Executive Overview", "💡 Strategic Intelligence", "🔍 Data Explorer", "📚 AI Briefing Library"])

with overview_tab:
    st.header("Performance Cockpit")
    col1, col2 = st.columns([1.5, 2])
    
    with col1:
        st.subheader("Key Performance Metrics")
        primary_engagement = df_primary_summary['weighted_engagement_rate'].mean()
        comp_engagement = df_comparison_summary['weighted_engagement_rate'].mean() if not df_comparison_summary.empty else 0
        primary_sentiment = df_primary_summary['avg_sentiment_score'].mean()
        comp_sentiment = df_comparison_summary['avg_sentiment_score'].mean() if not df_comparison_summary.empty else 0
        
        st.metric("Average Engagement Rate", f"{primary_engagement:.3%}", f"{primary_engagement - comp_engagement:.3%}" if comparison_option != "None" else None, help="Engagement score per follower")
        st.metric("Average Sentiment Score", f"{primary_sentiment:.2f}", f"{primary_sentiment - comp_sentiment:.2f}" if comparison_option != "None" else None, help="From -1 (Negative) to +1 (Positive)")
        st.metric("Total Posts", f"{df_primary_summary['post_id'].nunique():,}")
        st.metric("Total Comments", f"{df_primary_summary['comment_count'].sum():,}")

    with col2:
        st.subheader("Narrative Sentiment Scoreboard")
        st.markdown("Average sentiment for each key discussion topic.")
        topic_sentiment = df_primary_summary.groupby('main_topic')['avg_sentiment_score'].mean().sort_values(ascending=False)
        fig = px.bar(topic_sentiment, orientation='h', labels={'value': 'Average Sentiment Score', 'main_topic': 'Topic / Narrative'}, color=topic_sentiment.values, color_continuous_scale='RdYlGn', range_color=[-1,1])
        fig.update_layout(showlegend=False, height=350, margin=dict(l=10, r=10, t=10, b=10))
        st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")
    st.header("Threat Intelligence: Red Flag Posts")
    st.markdown(f"Posts with a high ratio of negative comments and a meaningful number of total comments (Threshold: > {CONFIG['red_flag_ratio_threshold']:.0%} negative and > {CONFIG['red_flag_comment_threshold']} comments).")
    
    red_flag_df = df_primary_summary[
        (df_primary_summary['negative_comment_ratio'] > CONFIG['red_flag_ratio_threshold']) &
        (df_primary_summary['comment_count'] > CONFIG['red_flag_comment_threshold'])
    ].sort_values('negative_comment_ratio', ascending=False)

    if red_flag_df.empty:
        st.success("No significant red flags detected in this period based on current thresholds.")
    else:
        st.warning(f"Found {len(red_flag_df)} posts matching Red Flag criteria.")
        for _, row in red_flag_df.head(3).iterrows():
            with st.container(border=True):
                st.error(f"**Negative Ratio: {row['negative_comment_ratio']:.1%}** on topic: **{row['main_topic']}** ({row['comment_count']} comments)")
                st.write(f"_{row['post_caption'][:250]}..._")
                with st.expander("Show Most Negative Comment (Translated)"):
                    st.write(row['most_negative_comment'])

with strategy_tab:
    st.header("Message Resonance Analysis")
    st.markdown("Understand the exact language used by supporters and detractors to refine your messaging.")
    
    positive_comments = df_filtered_comments[df_filtered_comments['sentiment_score'] == 1]['text_for_analysis']
    negative_comments = df_filtered_comments[df_filtered_comments['sentiment_score'] == -1]['text_for_analysis']

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Supporter Language")
        with st.spinner("Generating supporter word cloud..."):
            pos_wordcloud = create_wordcloud(positive_comments)
        if pos_wordcloud:
            st.pyplot(pos_wordcloud)
        else:
            st.info("Not enough positive comment data to generate a word cloud for the selected period.")
    
    with col2:
        st.subheader("Detractor Language")
        with st.spinner("Generating detractor word cloud..."):
            neg_wordcloud = create_wordcloud(negative_comments)
        if neg_wordcloud:
            st.pyplot(neg_wordcloud)
        else:
            st.info("Not enough negative comment data to generate a word cloud for the selected period.")
            
    st.markdown("---")
    st.header("Content Strategy Quadrant")
    st.markdown("Identify which content formats drive the most engagement and positive sentiment.")
    
    if 'content_type' not in df_primary_summary.columns or df_primary_summary['content_type'].nunique() <= 1:
        st.info("Enable this chart by adding a 'content_type' column with varied types (e.g., Photo, Video) to your source data and re-running the pipeline.")
    else:
        content_performance = df_primary_summary.groupby('content_type').agg(
            avg_engagement=('weighted_engagement_rate', 'mean'), 
            avg_sentiment=('avg_sentiment_score', 'mean'), 
            post_count=('post_id', 'nunique')
        ).reset_index()
        fig_quadrant = px.scatter(
            content_performance, x='avg_engagement', y='avg_sentiment', size='post_count', 
            color='content_type', text='content_type', 
            labels={"avg_engagement": "Average Engagement Rate", "avg_sentiment": "Average Sentiment Score"}, 
            title="Content Type Performance: Engagement vs. Sentiment"
        )
        fig_quadrant.update_traces(textposition='top center')
        st.plotly_chart(fig_quadrant, use_container_width=True)

with explorer_tab:
    st.header("Data Explorer")
    st.subheader("Post-Level Summary")
    columns_to_display = ['post_id', 'post_caption', 'avg_sentiment_score', 'negative_comment_ratio', 'main_topic', 'most_positive_comment', 'most_negative_comment']
    st.data_editor(df_primary_summary[columns_to_display],
        column_config={"post_caption": st.column_config.TextColumn("Post Caption", width="medium"),"most_positive_comment": st.column_config.TextColumn("Most Positive Comment", width="large"),"most_negative_comment": st.column_config.TextColumn("Most Negative Comment", width="large"),"avg_sentiment_score": st.column_config.NumberColumn("Avg. Sentiment", format="%.2f"),"negative_comment_ratio": st.column_config.ProgressColumn("Negative Ratio", format="%.1f%%", min_value=0, max_value=1),}, use_container_width=True, hide_index=True)
    
    st.subheader("Individual Comment Explorer")
    if df_filtered_comments.empty:
        st.warning("No individual comments match your current filter selection.")
    else:
        st.info(f"Displaying **{len(df_filtered_comments)}** individual comments.")
        st.data_editor(df_filtered_comments[['post_id', 'original_comment_for_context', 'text_for_analysis', 'sentiment_score', 'topic']],
            column_config={"original_comment_for_context": st.column_config.TextColumn("Original Comment", width="large"),"text_for_analysis": st.column_config.TextColumn("Cleaned & Translated", width="large"),"sentiment_score": st.column_config.NumberColumn("Sentiment", format="%.2f"),}, use_container_width=True, hide_index=True, num_rows="dynamic")

with reports_tab:
    st.header("AI Strategic Briefing Library")
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