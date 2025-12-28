from playwright.sync_api import sync_playwright, expect

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the local server
        page.goto("http://localhost:8787")

        # Wait for the main elements to load
        # We expect the title "QuickSend"
        expect(page).to_have_title("QuickSend | Hyper-Fast Transfer")

        # Wait for the "Nearby Devices" list to appear (even if empty)
        page.wait_for_selector(".sidebar")

        # Check if "Nearby Devices" header exists
        expect(page.get_by_text("Nearby Devices")).to_be_visible()

        # Check if the "Send" button exists (it's hidden until user selection usually, but let's check basic structure)
        # Actually, the drop zone should be visible
        expect(page.locator(".drop-zone")).to_be_visible()

        # We can also check if the canvas background is present
        expect(page.locator("#canvas-bg")).to_be_visible()

        # Take a screenshot
        page.screenshot(path="verification/frontend_verif.png")

        print("Verification successful, screenshot taken.")
        browser.close()

if __name__ == "__main__":
    verify_frontend()
