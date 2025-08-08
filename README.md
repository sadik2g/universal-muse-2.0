# Model Contest Platform - Documentation

## Overview

This is a modern, highly animated, and interactive public-facing website for a photo-based online model contest platform. The application allows users to view ongoing contests, vote for models, explore leaderboards, and understand how the platform works. The platform is built with a full-stack architecture using modern web technologies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React-based single-page application with Vite as the build tool
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for smooth, interactive animations
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite with HMR support
- **Animation Library**: Framer Motion for page transitions and interactive elements

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with proper error handling
- **Session Management**: Express sessions with PostgreSQL store

### Database Schema
The application uses a relational database with the following main entities:
- **Models**: User profiles with voting statistics
- **Contests**: Competition events with timing and prize information
- **Contest Entries**: Junction table linking models to contests
- **Votes**: Individual vote records with IP tracking and vote types
- **Vote Packages**: Purchasable voting credits with different tiers
- **Contact Submissions**: Contact form submissions

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **Server Processing**: Express routes handle requests and interact with the database
3. **Database Operations**: Drizzle ORM manages type-safe database queries
4. **Response Handling**: JSON responses with proper error handling and validation
5. **State Updates**: TanStack Query manages caching and state synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **wouter**: Lightweight routing
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Headless UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: CSS utility for component variants
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution for server development

## Deployment Strategy

### Development Environment
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite development server with HMR
- **Database**: Neon Database with connection pooling
- **Build**: Separate build processes for client and server

### Production Build
- **Client Build**: Vite builds static assets to `dist/public`
- **Server Build**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves client build in production
- **Environment Variables**: DATABASE_URL required for database connection

### Key Features
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Animation System**: Comprehensive animation library with reusable motion variants
- **Form Handling**: React Hook Form with Zod validation
- **Error Handling**: Centralized error handling with user-friendly messages
- **Performance**: Optimized with code splitting and lazy loading
- **Accessibility**: ARIA compliance through Radix UI primitives

The application is designed to be highly interactive with smooth animations, providing an engaging user experience for voting on model contests while maintaining clean, maintainable code architecture.

## Recent Changes (January 2025)

### Mobile Responsiveness Improvements
- Fixed mobile navbar with hamburger menu using Sheet component
- Made participate button responsive: hidden on mobile, shown in mobile menu
- Improved button touch targets (44px minimum) for mobile devices
- Added mobile-specific CSS for better spacing and typography
- Enhanced hero section responsiveness across screen sizes

### Session Management Fix
- Fixed PostgreSQL session store index conflict by setting `createTableIfMissing: false`
- Session table and index already exist from Drizzle schema definition
- Resolved "IDX_session_expire already exists" error in connect-pg-simple

### Dashboard and Profile Management System (July 2025)
- Implemented complete model authentication with automatic dashboard redirect after login
- Created comprehensive "My Submissions" page showing contest entries with status tracking
- Built full "Profile Settings" page with editable profile information and functional signout
- Added smart routing that redirects authenticated users to dashboard instead of public home
- Enhanced backend API with profile update endpoints and submission fetching
- Fixed authentication interface with proper TypeScript typing and error handling
- Added sample contest submission data for testing dashboard functionality

### Authentication and Navigation Fixes (July 2025)
- Fixed infinite authentication loop after user logout that caused endless loading screens
- Resolved nested anchor tag warnings by replacing Link-wrapped Button components with div elements
- Updated authentication hook to handle 401 responses gracefully instead of throwing errors
- Fixed JSX tag mismatch errors in profile settings component
- Improved navigation system with proper separation between public and authenticated routing
- All navigation links now work correctly in both public and dashboard interfaces

### Complete Admin Panel Implementation (July 2025)
- Built comprehensive admin panel with 6 main sections: Dashboard, Contests, Moderate, Analytics, Complaints, Settings
- Implemented admin-specific routing with role-based access control (admin vs model user types)
- Created fully animated admin interface with interactive charts, approval workflows, and statistics
- Added admin authentication middleware and backend API endpoints for all admin functionality
- Established admin navigation sidebar with responsive mobile menu and proper logout handling
- Extended database schema with complaints table and admin-specific data structures
- Created test admin account (admin@photocontest.com / password) for development testing
- Added sample pending submissions and contest data for admin panel testing and functionality

### Admin Interface Styling Revert (July 23, 2025)
- Reverted elaborate admin interface styling changes made earlier today
- Simplified admin navigation component to use basic styling instead of complex gradients and animations
- Removed excessive Framer Motion animations and elaborate visual effects from admin dashboard
- Restored admin panel to clean, functional design with standard Tailwind CSS classes
- Maintained all functionality while reducing visual complexity for better usability

### Photo Submission Modal Redesign (July 23, 2025)
- Completely redesigned photo submission modal with clean, simple interface
- Removed URL input field to simplify workflow - now upload-only
- Enhanced visual feedback with upload states (uploading, success, error)
- Improved user experience with better upload area design and file validation
- Fixed authentication issues in contest entry submission endpoint
- Streamlined submission process: upload photo → add title/description → submit for admin approval

### Contest Display Enhancement (July 23, 2025)
- Updated public contest pages to display approved photo submissions instead of model profiles
- Created new PhotoSubmissionCard component showing submitted photos with titles and descriptions
- Enhanced search functionality to include photo titles and descriptions
- Fixed admin dashboard filtering for pending/approved/rejected photos
- Improved ranking system with visual badges and vote counts
- Models' approved photos now properly appear on public contest pages for voting

### Comprehensive Voting System Implementation (July 23, 2025)
- Implemented strict one-vote-per-contest restriction: users can only vote for one model per contest
- Added vote status tracking with IP-based voter identification to prevent duplicate voting
- Created vote status API endpoint to check if user has voted and for which model
- Enhanced vote button component with dynamic states: Vote/Voted/Already Voted/Disabled
- Implemented automatic vote count calculation and leaderboard ranking updates
- Added proper visual feedback showing which model user voted for with green "Voted" button
- Disabled voting buttons for other models once user has cast their vote in a contest
- Updated leaderboard to calculate rankings based on actual contest votes and entries
- Fixed admin moderate page array handling to prevent filter errors on submissions data

### Enhanced Active Contest Leaderboard (July 23, 2025)
- Created new active contest leaderboard showing only top 3 positions from current active contests
- Built dedicated API endpoint `/api/leaderboard/active` for real-time active contest rankings
- Updated leaderboard frontend to focus exclusively on active contest participants with votes
- Added informational section explaining how active contest leaderboard works
- Enhanced ranking display with model stage names and contest-specific vote counts
- Removed timeframe filters to focus purely on current active contest performance

### Photo Submission Workflow Fix (July 23, 2025)
- Fixed critical submission workflow issue where photos weren't appearing on admin dashboard
- Resolved array handling errors in admin moderate page with proper data validation
- Enhanced photo submission process: models can now submit photos that properly appear for admin review
- Fixed approved photo display on contest detail pages for public voting
- Cleaned up duplicate function implementations in storage.ts that were causing LSP errors
- Added comprehensive logging for submission creation and approval debugging
- Submissions now flow correctly: submit → admin review → approval → public contest display

### Single Active Contest Restriction (July 23, 2025)
- Implemented restriction to allow only one active contest at any given time
- Enhanced createContest and updateContest methods to automatically deactivate other active contests
- Added deactivateAllContests helper method with optional contest exclusion functionality
- Updated API routes to provide clear messaging when activating contests and deactivating others
- Added informational notice on admin contests page explaining single active contest policy
- System now ensures focused voting experience by preventing multiple simultaneous active contests

### Integrated Contact Form and Complaints System (July 23, 2025)
- Modified contact form submissions to create complaints instead of separate contact entities
- Integrated contact form queries directly into the complaints management system
- Implemented comprehensive pagination system with 10 items per page for complaints
- Enhanced admin complaints dashboard with unified interface for all user queries and complaints
- Added proper database methods for complaint creation, updating, and paginated retrieval
- Streamlined admin workflow by consolidating all user communications into single complaints interface
- Contact form submissions now appear as "other" type complaints with "medium" priority
- Removed separate contact forms tab in favor of unified complaints management

### Complete Prize Request System Implementation (July 24, 2025)
- Built comprehensive prize request database schema with status tracking (pending, processing, completed, rejected)
- Created backend API endpoints for prize request CRUD operations with proper authentication
- Enhanced winner congratulations modal with integrated prize request form for direct prize claims
- Built admin prize requests management page (/admin/prize-requests) with status filtering and workflow management
- Added prize request navigation to admin panel menu with Gift icon for easy access
- Implemented winner detection system that shows congratulations modal to contest winners
- Added proper validation to prevent duplicate prize requests per contest per model
- Created complete prize request workflow: winner modal → form submission → admin processing → completion
- Set up test data with Ahmed (ahmed.model@gmail.com/password) as winner of Summer Beauty Contest with $500 USD prize
- Replaced automatic modal popup with integrated "My Prizes" navigation section for better UX control

### Navigation-Based Prize System (July 24, 2025)
- Integrated prize notifications directly into the main navigation bar as "My Prizes" section
- Prize navigation item appears for ALL models, showing different content based on winner status
- Winners see yellow text with gift icon and animated red notification badge for prize claims
- Non-winners see gray text without badge, showing "No Prize Yet" message when clicked
- Clicking "My Prizes" opens appropriate modal: congratulations for winners, encouragement for non-winners
- Works seamlessly on both desktop and mobile navigation menus
- Provides better user control over when to view prize information compared to automatic popups
- Created NoPrizesModal component with tips and encouragement for models without winnings

### Enhanced Prize Management with Status Tracking (July 24, 2025)
- Added comprehensive "My Prizes" section directly in the dashboard showing all winnings with status
- Enhanced backend to include prize request status in winnings data (pending, processing, completed, rejected)
- Implemented smart freezing functionality: prize sections become non-clickable once request is submitted
- Visual status indicators: blue for pending, orange for processing, green for completed, red for rejected
- Added second prize for Ahmed: "Winter Elegance Contest" with $750 USD prize for testing
- Prize cards show appropriate status badges and disable interaction based on request status
- Only allows new prize requests for unclaimed prizes or rejected requests
- Created intuitive golden prize cards with clear call-to-action buttons and status feedback

### Dashboard Cleanup - Photo Submissions Removal (July 24, 2025)
- Removed "Recent Submissions" section from model dashboard as requested by user
- Cleaned up unused ModelSubmission interface and related query code
- Simplified dashboard layout to focus on key sections: stats, prizes, and active contests
- Dashboard now shows: welcome header, stats cards, prize management, and active contests only

### Contest Detail Page Cleanup and Home Page Enhancement (July 24, 2025)
- Removed "Photo Submissions" section from contest detail pages when models are logged in
- Enhanced home page "Top Performing Models" section to show top 10 models instead of 5
- Removed vote buttons from home page model cards for cleaner presentation
- Updated grid layout to accommodate 10 models with responsive design (2-5 columns based on screen size)
- Contest detail pages now hide photo submissions for authenticated models while keeping them visible for public users

### Smart Contest Filtering for Home Page (July 25, 2025)
- Implemented intelligent contest filtering to show only active or upcoming contests on home page
- Added date-based logic to exclude ended contests from featured contest section
- Created sorting algorithm to prioritize active contests over upcoming ones
- Added "No Active Contests" message section when all contests have ended
- Enhanced user experience by showing only relevant, current contest information

### Profile Picture File Upload System (July 28, 2025)
- Replaced URL input field with modern drag-and-drop file upload interface in profile settings
- Added comprehensive file validation (image types, 5MB size limit) with user-friendly error messages
- Created visual upload states: uploading spinner, success checkmark, error indicators with automatic timeouts
- Implemented drag-and-drop functionality with hover effects and visual feedback
- Added profile picture preview and remove functionality for better user control
- Created backend API endpoint `/api/upload/profile` for handling profile picture uploads
- Enhanced UI with consistent styling matching the site's purple/pink gradient theme

### Contest-Specific Vote Purchasing System (July 28, 2025)
- Implemented contest-participation-based vote purchasing: only models actively participating in ongoing contests can buy votes
- Enhanced vote package system where purchased votes are added directly to model's contest entry votes, not general balance
- Added backend validation checking for active contest entries before allowing purchases (getModelActiveContestEntry method)
- Created informative "No Active Contest" screen with step-by-step instructions for vote package access
- Updated purchase flow to show active contest information and vote transfer details
- Modified success messages to specify which contest received the votes and new contest vote totals
- Built comprehensive vote packages UI with 5 tiers: Bronze ($9.99/55 votes), Silver ($19.99/135 votes), Gold ($39.99/350 votes), Diamond ($79.99/900 votes), Platinum ($149.99/1900 votes)
- Enhanced error handling with specific messages for contest participation requirements
- Contest entry votes are updated immediately, affecting contest rankings in real-time

### Comprehensive Winners Management System (July 25, 2025)
- Built complete admin Winners Management section with table-based display of all contest winners
- Implemented winner details modal showing comprehensive contact information, contest details, and prize information
- Added winner record deletion functionality with confirmation dialogs for admin control
- Created backend API endpoints for fetching and managing winner data with proper authentication
- Enhanced admin navigation with dedicated Winners section using Crown icon for easy access
- Built responsive table layout with search functionality across winners, contests, and email addresses
- Added pagination system for efficient handling of large winner datasets (10 per page)
- Implemented statistics dashboard showing total winners, prize money distributed, and active contests
- Created detailed winner profile views with contact details, bio, Instagram handles, and location information
- Added proper winner data fetching from contests table joined with models and users for complete information

### Admin Interface Updates (July 25, 2025)
- Removed "Set Winner" button from contest listing to simplify admin workflow
- Implemented functional admin settings with profile information and password update sections
- Created comprehensive admin profile management with name, email, bio, and phone fields
- Added secure password change functionality with current password verification
- Removed notification preferences section as requested by user
- Enhanced admin settings with proper form validation and error handling
- Integrated backend API endpoints for profile updates and password changes with authentication

### System Cleanup and Contest Display Fix (July 26, 2025)
- Performed comprehensive data cleanup removing all contests, models, users (except admin), votes, and submissions
- Fixed admin authentication by updating password hash for admin@photocontest.com/password
- Added missing 'ne' import to fix admin stats query error
- Updated admin stats to exclude admin users from total user count (now shows 0 users after cleanup)
- Fixed contest display issue on home page where contests with past end dates were being filtered out
- Home page now properly shows active contests created by admin
- Contest filtering logic correctly prioritizes active contests over upcoming ones