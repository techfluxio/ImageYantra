# ImageYantra Backend

Node.js + Express + Nodemailer backend for the contact form.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Gmail credentials
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3001) |
| `GMAIL_USER` | Your Gmail address (e.g. contact@imageyantra.in) |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not your main password) |
| `CONTACT_EMAIL` | Where general messages are sent |
| `BUSINESS_EMAIL` | Where business inquiries are sent |
| `ALLOWED_ORIGIN` | Frontend URL for CORS (e.g. https://imageyantra.in) |

## Gmail App Password

1. Go to [Google Account → Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to **App Passwords**
4. Generate a password for "Mail" → "Other (custom name)"
5. Copy the 16-character password into `GMAIL_APP_PASSWORD`

## Deploy to Render (free)

1. Push the `backend/` folder to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add all environment variables from `.env.example`
5. Copy the Render URL (e.g. `https://imageyantra-backend.onrender.com`)

## Connect Frontend

In `contact/index.html`, the form currently uses Web3Forms as a fallback.  
To switch to this backend, update the fetch URL:

```js
const res = await fetch('https://YOUR-RENDER-URL.onrender.com/api/contact', { ... });
```

## API

### POST /api/contact

**Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "messageType": "General Question",
  "message": "Hello there!"
}
```

**Success:**
```json
{ "success": true, "message": "Your message has been sent successfully." }
```

**Error:**
```json
{ "success": false, "errors": ["Name must be at least 2 characters."] }
```

### GET /health

Returns server status.
