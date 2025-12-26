# AI Financial Analysis - Next.js App

Server-first Next.js application for displaying financial analysis data from Firebase.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Configure Firebase credentials in `.env.local`:
- Get credentials from Firebase Console → Project Settings → Service Accounts
- Add your project ID, client email, and private key

4. Set the Python pipeline path in `.env.local`:
```
PYTHON_PIPELINE_PATH=/path/to/ai-fin4
```

5. Run development server:
```bash
npm run dev
```

## Architecture

- **Server Components** - Default for all data fetching
- **Client Components** - Only for charts (Recharts) and interactive forms
- **Firebase Admin SDK** - Server-side Firestore access
- **Adaptive Charts** - Auto-select best visualization based on signal data

## Project Structure

```
app/
├── page.tsx                    # Home page with analysis list
├── analysis/[symbol]/page.tsx  # Individual analysis page
├── actions/analysis.ts         # Server actions
└── api/                        # API routes

components/
├── analysis/                   # Server components
├── charts/                     # Client components ('use client')
├── forms/                      # Client components
└── skeletons/                  # Loading states

lib/
├── firebase-admin.ts           # Firebase singleton
├── types/                      # TypeScript types
├── repositories/               # Data access layer
├── services/                   # Business logic
└── charts/                     # Chart configuration
```

## Generating Data

Run the Python pipeline to populate Firebase:
```bash
cd /path/to/ai-fin4
python main.py NVDA AAPL MSFT --ai --export firebase
python firebase_upload.py --batch
```
