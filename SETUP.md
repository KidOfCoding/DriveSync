# RideShare Application Setup

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bXV0dWFsLWNveW90ZS05LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# ImageKit Configuration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=kHXCO0kOSBg8l1yth9lBkM4n+eI=
IMAGEKIT_PRIVATE_KEY=A4UqkOlCKp75DeYHnm/AuACHQRE=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/YOUR_IMAGEKIT_ID

# Appwrite Configuration (Optional - will use localStorage if not configured)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_DRIVERS_COLLECTION_ID=your_drivers_collection_id
NEXT_PUBLIC_APPWRITE_OWNERS_COLLECTION_ID=your_owners_collection_id
```

### Getting Your Keys:

1. **Clerk Secret Key**: 
   - Go to your Clerk Dashboard
   - Navigate to API Keys
   - Copy the Secret Key (starts with `sk_test_` or `sk_live_`)

2. **ImageKit URL Endpoint**:
   - Log in to your ImageKit dashboard
   - Go to Settings > URL Endpoints
   - Copy your URL Endpoint (format: `https://ik.imagekit.io/your_imagekit_id`)

3. **Appwrite Credentials** (Optional):
   - Create a project in Appwrite
   - Create a database
   - Create two collections: `drivers` and `owners`
   - Copy the IDs from your Appwrite dashboard
   - If not configured, the app will use localStorage for demo purposes

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Configure Clerk:
   - Enable Google OAuth in Clerk Dashboard
   - Go to User & Authentication → Social Connections
   - Enable Google and configure OAuth credentials

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Flow

1. **Role Selection**: User first selects Driver or Owner
2. **Sign Up/Sign In**: User signs up or signs in with Google OAuth
3. **Profile Completion**: First-time users complete their profile
4. **Data Storage**: 
   - Saves to Clerk user metadata
   - Syncs to Appwrite (if configured)
   - Falls back to localStorage if Appwrite is not configured

## Features

### Authentication
- Role selection (Driver/Owner) before sign-up
- Google OAuth authentication via Clerk
- One-time profile completion after first sign-in
- Profile completion check on home page

### Driver Profile
- Full Name
- Mobile Number (pre-filled if signed up with phone)
- Home Address (with map location picker)
- Profile Photo upload (ImageKit)

### Owner Profile
- Full Name
- Phone Number
- Business Name
- Business Address (with map location)
- Business Type (optional)
- Business Description (optional)
- Photo/Logo upload (ImageKit)

### Data Storage
- **Primary**: Clerk user metadata
- **Secondary**: Appwrite (if configured)
- **Fallback**: localStorage (for demo/testing)

## Important Notes

- The app works with just Clerk credentials (uses localStorage for data)
- Appwrite is optional - add credentials to enable cloud storage
- ImageKit is required for photo uploads
- Profile completion is checked on every page load
- Role is stored in localStorage and persists across sessions
