import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_new_features(page: Page):
    """
    This script verifies the two new features: Controversy Detection and Topic Trends.
    It logs in, navigates to each feature, and takes a screenshot.
    """
    print("Navigating to the application...")
    page.goto("http://localhost:5000/")

    print("Logging in...")
    page.get_by_label("Username").fill("admin")
    page.get_by_label("Password").fill("password123")
    page.get_by_role("button", name="Access Intelligence Center").click()

    print("Waiting for main dashboard to load...")
    # The intro screen might take a moment, and then the command center appears.
    # We'll wait for the main header of the command center.
    expect(page.get_by_role("heading", name="Astra Intelligence")).to_be_visible(timeout=20000)
    print("Dashboard loaded.")

    # --- Verify Controversy Detection Feature ---
    print("Navigating to Engagement Analytics tab...")
    page.get_by_role("button", name="Engagement Analytics").click()

    print("Checking for Controversy Hotspot component...")
    controversy_header = page.get_by_role("heading", name="Controversy Hotspot")
    expect(controversy_header).to_be_visible()
    print("Controversy feature found. Taking screenshot...")
    page.screenshot(path="jules-scratch/verification/controversy_feature.png")

    # --- Verify Topic & Sentiment Trend Feature ---
    print("Navigating to Performance Trends tab...")
    page.get_by_role("button", name="Performance Trends").click()

    print("Checking for Topic & Sentiment Trends component...")
    trends_header = page.get_by_role("heading", name="Topic & Sentiment Trends")
    expect(trends_header).to_be_visible()
    print("Trends feature found. Taking screenshot...")
    page.screenshot(path="jules-scratch/verification/trends_feature.png")

    # --- Verify toggle on Topic & Sentiment Trend Feature ---
    print("Clicking on Sentiment toggle button...")
    page.get_by_role("button", name="Sentiment").click()
    print("Taking screenshot of the sentiment view...")
    page.screenshot(path="jules-scratch/verification/trends_feature_sentiment.png")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_new_features(page)
            print("\nVerification script completed successfully!")
        except Exception as e:
            print(f"\nAn error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
            print("An error screenshot has been saved to jules-scratch/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    main()
