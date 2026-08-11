# OmniStack Assets - System Architecture & Product Blueprint

> **PROJECT STATUS & EXECUTION CONTEXT FOR AI:**

> - **Current State:** Active prototype. A portion of the frontend UI, Supabase tables, and Next.js App Router structure has already been built.

> - **Primary Objective:** Audit existing code against this blueprint, refactor/clean messy components, and complete missing features iteratively.

> - **Instruction for AI:** Do NOT assume a blank repository. Always inspect `@Codebase` before creating new files or modifying existing routes to avoid duplication and breaking existing working state.

---

## 1. System Overview & Core Technical Requirements

* **App Name & Identity:** OmniStack ("Dark Ops" multi-asset control center).

* **Design Language:** Goldfolio-inspired, high-density, mobile-first financial control panel. Prioritizes clear financial metrics, high-contrast typography, and readable asset lists over decorative clutter.

* **Architecture & Framework:** Custom Next.js (App Router) build created without opinionated starter templates to prevent middleware lock-in, caching bugs, or redirect loops.

* **Backend & Database:** Supabase PostgreSQL with built-in Auth, Row Level Security (RLS), and automated database-level triggers.

* **Deployment & Accessibility:** Published and hosted live on Vercel so it is accessible via a public URL for cross-platform desktop and mobile usage outside the local network.

* **Global Formatting Standards:**

  * **Currency:** Primary spot calculations in Australian Dollars `$AUD`), with multi-currency user settings.

  * **Date Format:** Uniform `dd/mm/yyyy` across all input fields, tables, and date pickers.

  * **Spot Valuation Baseline:** Core precious metals holdings valued strictly at pure spot benchmarks (e.g., ~$29k AUD baseline), deliberately excluding retail, collectible, or secondary market markups for conservative net worth tracking.

---

## 2. Security, Authentication & Session Architecture

### User Access & Isolation

* **Supabase Auth Integration:** Email/password authentication, registration, and password management.

* **Biometric Support:** Passkey / WebAuthn integration for Face ID and Touch ID support on mobile devices.

* **Multi-Tenant Isolation:** Database enforced via PostgreSQL Row Level Security (RLS) with strict `user_id = auth.uid()` bindings across all asset tables.

* **Database Triggers:** Automated trigger on `auth.users` creation to instantly insert corresponding `public.profiles` records, avoiding orphaned user data.

* **Automatic User ID Fallback:** Default `auth.uid()` set at database column levels so manual backend inserts automatically bind to the logged-in session.

* **Role Hierarchy:** `user_roles` structure establishing background administrative privileges.

### UX & Session Security

* **Themed Auth Views:** Custom OmniStack dark-mode styled Login, Sign-Up, and Password Reset screens.

* **Polite Logout Splash Screen:** Dedicated confirmation view upon signing out instead of abrupt redirects.

* **Active Ledger Session Drawer:** Active session status indicator, quick links to Account Preferences, Settings, and Security Compliance logs, and clean log-off button.

---

## 3. Dashboard Layout & UI Architecture

### Header & Navigation

* **Branding:** Custom OmniStack SVG logo alongside a "Dark Ops" multi-asset status badge.

* **Live Ticker Header:** Continuous horizontally scrolling ticker bar displaying troy ounce `ozt`) spot prices for Gold, Silver, Platinum, tracked ASX ETFs/Shares, and the Gold-to-Silver Ratio (GSR) in the user's localized currency.

* **Hamburger Mobile Drawer:** Slide-out navigation drawer containing theme toggles, session settings, and FAQ sections.

### Workspace Controls & UX

* **Independent View Toggles:** On/off visibility switches for individual portfolio modules (e.g., Bullion Manager, Pearler/ASX Tracker).

* **Seamless Layout Resizing:** Hiding a component causes remaining UI widgets to shift upward fluidly without dead space.

* **Theme Engine:** Smooth transition support between dark and light modes.

* **Instant Revalidation:** Server Action and Form submission handling paired with `revalidatePath` and `router.refresh` to update UI tables instantly without requiring manual browser reloads.

---

## 4. Bullion & Physical Asset Manager

### Granular Asset Specifications

* **Supported Metals & Categories:** Gold, Silver, Platinum. Formats include cast bars, minted bars, fractional rounds, pre-decimal coins, numismatic collectibles, and fractional currency notes.

* **Specialized Collection & Numismatic Tracking:**

  * Perth Mint series (e.g., 2026 Gold Lunar Horse).

  * Multi-coin sets (e.g., 6-coin TMNT character set with cityscape backdrop, 2oz pizza coin).

  * Movie memorabilia coins (e.g., Back to the Future DeLorean coins).

  * Proof & Commemorative sets (e.g., colorized Lucky Cat proof sets, 2015 Centenary of the Gallipoli Landing gold coins).

  * Fractional currency notes (e.g., Goldbacks in 1/2, 1, 2, and 5 denominations).

* **Measurement & Units:** Stored and aggregated in troy ounces `ozt`), with input converters for grams and standard ounces.

* **Acquisition & Sales Fields:** Purchase date `dd/mm/yyyy`), purchase cost ($AUD), supplier/vendor source, and trading/sales logs to accurately compute realized P&L.

* **Visual Documentation:** Media upload support for attaching images of items, certificates of authenticity (COAs), or receipts to individual inventory rows.

* **CRUD Safety:** Full edit and delete permissions on all inventory rows, guarded by a confirmation prompt before executing deletions.

### Financial Calculations & Rebalancing Engine

* **Pure Spot Valuation Engine:** Calculates live valuation strictly against spot metals prices, excluding retail premiums.

* **Gold-to-Silver Ratio (GSR) Rule:** Configurable target threshold set to **50:1**. System raises alerts when ratio targets are crossed to signal rebalancing opportunities between gold and silver.

* **Cost Basis & ROI:** Real-time calculation of average purchase cost per troy ounce ($/oz), unrealized profit/loss ($AUD), and return on investment percentage (ROI %).

### Market Data & API Protection `goldapi.io`)

* **Quota Management:** Built-in tracker to enforce a maximum of 100 external API requests per month.

* **Rate Limit Failover:** If the quota limit is reached or the API fails, the application automatically catches the exception, serves cached historical prices, and displays a prominent warning banner:

  > `⚠️ Market Data Offline: API limit reached. Showing last known historical prices`

### Data Portability

* **CSV Import Engine:** Standardized, downloadable CSV template for batch inventory imports via file selection or drag-and-drop.

* **CSV Export Engine:** Configurable export tool in Settings allowing users to select specific asset categories and export backup files.

---

## 5. Equities Integration

* **ASX Integration:** Integration with live market data feeds to track Australian Stock Exchange (ASX) equities, ETFs, and overall portfolio values.

* **Dollar-Cost Averaging (DCA) Automation:** Configurable recurring contribution schedules (e.g., $250 fortnightly) and cash balance triggers (e.g., auto-investing when unallocated cash hits $1,000). Includes manual override inputs for one-off deposits.

* **Target-Weight Rebalancing:** Dynamic allocation model evaluating current holdings against user-defined target percentages, directing incoming cash toward the most underweight asset class.

* **Unified Net Worth Engine:** Consolidates spot bullion valuations, equity portfolios, and cash balances into a single real-time portfolio balance.

---

## 6. Analytics, Reporting & Settings

### Visual Reporting

* **Interactive Charts:** Dashboard charts (Pie, Line, Bar) illustrating total net worth, asset class distribution, and performance over time.

* **Timeframe Filters:** Custom performance evaluation intervals (1 Day, 1 Month, 6 Months, 1 Year, All-Time).

* **Category Focus Mode:** Ability to isolate specific asset categories (e.g., display Bullion performance only).

### Settings & User Preferences

* **Localization:** Onboarding country selector establishing local currency display standards.

* **Profile Management:** Update account details, display names, email addresses, and security credentials.

* **Categorized FAQs & Compliance Portal:**

  * **Operation FAQs:** Step-by-step instructions for manual bullion entry, CSV uploading, image management, and tracking trades.

  * **Security & Compliance FAQs:** Transparent architecture documentation highlighting backend security features (SOC2 Type II, ISO 27001 compliance standards provided by Supabase, Vercel, and GitHub infrastructure).