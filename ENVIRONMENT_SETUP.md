# Environment Variables Setup

## Required Supabase Environment Variables

The application is failing because required Supabase environment variables are missing. You need to configure these in your `.env` file:

### 1. Get Your Supabase Credentials

Go to your Supabase project dashboard:
1. Navigate to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API

### 2. Required Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Where to Find the Values

- **NEXT_PUBLIC_SUPABASE_URL**: Found in Project Settings → API → Project URL
- **SUPABASE_SERVICE_ROLE_KEY**: Found in Project Settings → API → service_role (secret)
- **SUPABASE_ANON_KEY**: Found in Project Settings → API → anon (public)

### 4. Setup Instructions

1. Create/update your `.env` file in the project root
2. Add the variables above with your actual Supabase values
3. Restart your development server (`npm run dev`)
4. The admin APIs should now work correctly

### 5. Security Notes

- Never commit `.env` files to version control
- The `SUPABASE_SERVICE_ROLE_KEY` is highly sensitive - keep it secure
- The `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_ANON_KEY` are safe for client-side use

### 6. Testing the Setup

After configuring, test with:
```bash
npm run dev
```

Then try accessing the admin panel to verify the APIs work.

### 7. Common Issues

- **Missing variables**: Ensure all three variables are present
- **Incorrect URL**: Make sure the URL includes `https://` and ends with `.supabase.co`
- **Wrong keys**: Double-check you're using the correct keys from the right project

### 8. Production Deployment

For production (Vercel, etc.), add these environment variables in your deployment platform's settings, not in the codebase.
