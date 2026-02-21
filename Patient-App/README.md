# Medical Booking App (Pixel Perfect Clone)

This project contains a Next.js Web Application and a React Native Booking Screen that matches the provided design 1:1.

## 🚀 Getting Started (Web)

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Database Setup** (Optional for UI demo, but required for full functionality)
    -   Create a `.env` file with your Postgres Database URL (Supabase recommended):
        ```env
        DATABASE_URL="postgresql://user:password@host:5432/db"
        ```
    -   Run migrations:
        ```bash
        npx prisma db push
        ```
    -   Seed the database with the Doctor profile:
        ```bash
        npx tsx prisma/seed.ts
        ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **View the Page**
    Open [http://localhost:3000/doctors/doctor-mustafa/book](http://localhost:3000/doctors/doctor-mustafa/book)

## 📱 Mobile App (React Native)

The React Native source code is located in `mobile/DoctorBookingScreen.tsx`.
To run it:

1.  Create a new Expo app (if you haven't):
    ```bash
    npx create-expo-app my-app
    ```
2.  Copy `mobile/DoctorBookingScreen.tsx` to your app.
3.  Install strict dependencies:
    ```bash
    npm install expo-linear-gradient expo-blur @expo/vector-icons
    ```

## 🎨 Design Notes

-   **Glassmorphism**: Hand-crafted CSS using `backdrop-filter: blur(20px)` and semi-transparent Slate colors.
-   **RTL/LTR**: The page is RTL (Arabic), but the Calendar component is forced to LTR structure internally to match the reference image exactly (Days SA -> SU).
-   **Fonts**: "Tajawal" font is configured via `next/font/google`.
-   **Icons**: standard `lucide-react` for Web and `@expo/vector-icons` for Mobile.

## 🛠 Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Styling**: Tailwind CSS + Shadcn UI
-   **Database**: Prisma ORM + Supabase (PostgreSQL)
-   **Mobile**: React Native (Expo)
