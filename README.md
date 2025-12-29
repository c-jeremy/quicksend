# QuickSend

QuickSend is a public, ephemeral file sharing and text messaging web application designed for speed and simplicity. It allows users to instantly transfer files and messages between devices on the same network (or anywhere, as it uses a shared presence room) without creating accounts or installing apps.

## Features

-   **Instant File Transfer:** Drag and drop files to send them directly to other connected devices.
-   **Text Messaging:** Send text snippets or URLs instantly.
-   **Device Discovery:** Automatically sees other users currently on the site (using Supabase Presence).
-   **Cross-Platform:** Works on iOS, Android, Windows, macOS, and Linux.
-   **Visual Feedback:** "Shockwave" and shake effects provide immediate visual confirmation of incoming transfers.
-   **Ephemeral & Private:** No database tables for history. Files are stored in Cloudflare R2 and can be configured with lifecycle rules for auto-deletion. No sign-up required.

## Architecture

QuickSend runs entirely on the edge, leveraging modern serverless technologies:

-   **Host:** [Cloudflare Workers](https://workers.cloudflare.com/) serves the application and handles API requests.
-   **Storage:** [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) provides S3-compatible object storage for file transfers.
    -   *Note:* The application uses presigned URLs, allowing the client to upload directly to R2, bypassing the Worker's execution limits.
-   **Signaling & Presence:** [Supabase Realtime](https://supabase.com/docs/guides/realtime) manages user presence (who is online) and signaling (notifying peers of transfers) via ephemeral broadcast channels.
-   **Frontend:** A single, lightweight HTML file served by the Worker, powered by [Alpine.js](https://alpinejs.dev/) for reactivity.

## Prerequisites

-   A [Cloudflare](https://dash.cloudflare.com/) account.
-   A [Supabase](https://supabase.com/) account.
-   [Node.js](https://nodejs.org/) and `npm` installed.

## Setup Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd quicksend
npm install
```

### 2. Configure Cloudflare R2

1.  Log in to the Cloudflare Dashboard and navigate to **R2**.
2.  Create a new bucket (e.g., `quicksend-files`).
3.  **CORS Configuration:**
    The application will attempt to automatically configure CORS on the bucket when the homepage is loaded. However, you can also set it manually in the Cloudflare dashboard settings for the bucket to allow `PUT` and `GET` from your domain (or `*` for development).
4.  **Lifecycle Rules (Optional but Recommended):**
    Set up a lifecycle rule to delete objects after 24 hours to keep the bucket clean and maintain the "ephemeral" nature of the app.

### 3. Configure Supabase

1.  Create a new project in Supabase.
2.  Go to **Project Settings > API**.
3.  Copy the `Project URL` and `anon` public key.
4.  **Realtime Settings:**
    Ensure Realtime is enabled. Since this app uses Broadcast and Presence (which are ephemeral), you do not need to create any database tables.

### 4. Environment Variables

Updates the `wrangler.toml` file with your configuration.

You can either edit `wrangler.toml` directly (not recommended for secrets) or use `wrangler secret put` for sensitive values.

**Required Variables in `wrangler.toml`:**

```toml
[vars]
# Your R2 Bucket Name
R2_BUCKET_NAME = "quicksend-files"

# Your R2 Endpoint (from Cloudflare Dash > R2 > Bucket > Settings > Bucket Details)
# Format: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ENDPOINT = "https://your-account-id.r2.cloudflarestorage.com"

# Supabase Configuration
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "your-anon-key-here"

# R2 Access Keys (It is safer to set these via `wrangler secret put`)
R2_ACCESS_KEY_ID = "your-access-key-id"
R2_SECRET_ACCESS_KEY = "your-secret-access-key"
```

**Setting Secrets via CLI (Recommended):**

```bash
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put SUPABASE_ANON_KEY
```

### 5. Development

To run the application locally:

```bash
npm run dev
```

This starts the local Cloudflare Workers development server (usually at `http://localhost:8787`).

### 6. Deployment

1.  **Authenticate with Cloudflare:**

    If you haven't already, log in to your Cloudflare account via Wrangler:

    ```bash
    npx wrangler login
    ```

    A browser window will open asking you to authorize Wrangler.

2.  **Deploy:**

    Once authenticated, publish your worker:

    ```bash
    npm run deploy
    ```

    Wrangler will package your application and deploy it to the Cloudflare network. It will output the URL where your application is live (e.g., `https://quicksend.<your-subdomain>.workers.dev`).

## How It Works

1.  **User Joins:** When the page loads, the client connects to a Supabase Realtime channel (`quicksend-room`). It broadcasts its presence, user ID, and platform information.
2.  **Discovery:** The client listens for `presence` events to build a list of other online users.
3.  **Sending a File:**
    -   The sender selects a user and chooses a file.
    -   The client requests a presigned Upload URL from the Worker API (`/api/upload-url`).
    -   The Worker uses `aws4fetch` to generate an S3-compatible PUT URL for the R2 bucket.
    -   The client uploads the file directly to R2 using this URL.
    -   Once uploaded, the client sends a "signal" via Supabase Broadcast containing the download URL to the target user.
4.  **Receiving:**
    -   The target user receives the signal.
    -   A "Shockwave" visual effect triggers.
    -   A modal appears allowing the user to download the file or copy the content.

## License

MIT
