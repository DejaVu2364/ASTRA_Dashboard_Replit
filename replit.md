# Astra Intelligence Pipeline

## Overview

The Astra Intelligence Pipeline is a sophisticated full-stack application designed as a futuristic political intelligence dashboard. It combines a React frontend with an Express backend, focused on ingesting, analyzing, and visualizing social media data for political strategy purposes. The system follows a "Trust but Verify" philosophy with automated quality gates and data integrity verification.

## User Preferences

Preferred communication style: Simple, everyday language.

## Dashboard Enhancement Status (January 2025)

✓ **Phase 1 Complete**: Executive Performance Cockpit with sentiment gauge and donut charts
✓ **Phase 2 Complete**: Advanced Analytics Suite with Content Strategy and Period Comparison
✓ **Phase 3 Complete**: Enhanced Data Explorer with filtering capabilities
✓ **Phase 4 Complete**: AI Briefing Library with narrative and Gemini reports
✓ **Phase 5 Complete**: Next-Generation Intelligence Features
✓ **Phase 6 Complete**: Full AI Integration with Gemini API
✓ **Phase 7 Complete**: Dashboard Optimization & UX Enhancement
→ **Phase 8 Current**: MVP Blocks Integration & Executive Overview Enhancement

**Phase 6 Implementation includes:**
- **Real-time AI Insights**: Live AI-powered analysis using Gemini API
- **AI Service Architecture**: Comprehensive AI service with content analysis and strategic reports
- **Dynamic AI Insights Hub**: Real-time intelligence generation with confidence scoring
- **AI Narrative Analysis**: Advanced narrative pattern recognition with strategic recommendations
- **Content Analysis API**: AI-powered content evaluation and optimization suggestions
- **Strategic Report Generation**: AI-generated comprehensive intelligence reports

**Phase 7 Implementation includes:**
- **Dashboard Optimization**: Reduced tabs from 13 to 8 for better UX (38% reduction)
- **Component Consolidation**: Merged related features for cleaner interface
- **Enhanced Login Form**: Fixed text visibility issues with improved contrast
- **Streamlined Navigation**: Grouped related functionalities for logical flow
- **Comprehensive Analysis**: Created detailed dashboard report card (8.2/10 rating)
- **UX Improvements**: Reduced cognitive load while maintaining functionality

**Phase 8 Implementation includes:**
- **Pipeline Data Focus**: Optimized for existing data pipeline instead of real-time streaming
- **UI Simplification**: Removed left sidebar navigation and unnecessary elements
- **Full-Width Layout**: Expanded main content area to use entire screen width
- **Performance Enhancement**: Improved dashboard loading and responsiveness
- **Data Integration**: Better utilization of existing DASHBOARD FINAL 2 data
- **User Experience**: Focused on clean, efficient interface without distractions
- **Professional Typography**: Implemented three-font system for minimalistic design
- **Black Background Design**: Pure black (#000000) background with MVPBlocks-inspired clean styling
- **MVP Blocks Integration**: Applied MVP Blocks design patterns and components throughout dashboard
- **Executive Overview**: New first tab with strategic insights and performance metrics
- **Enhanced Navigation**: Improved tab system with MVP Blocks styling and better UX

**Enhanced AI Features:**
- **Narrative Navigator**: Advanced content narrative analysis with AI-powered insights
- **Engagement Analytics**: Deep engagement pattern insights with volatility tracking
- **AI Insights Hub**: Centralized AI-powered intelligence with live Gemini integration
- **Data Discovery Zone**: Advanced data exploration with filtering and search
- **Multi-Month Sentiment Trend**: Historical sentiment analysis with strategic recommendations
- **Enhanced Content Performance Quadrant**: Comprehensive content strategy optimization

The platform now features 8 optimized analytical views with full AI integration, transforming the original Streamlit dashboard into a flagship political intelligence platform with:
- Executive Performance Snapshot with sentiment gauge and donut charts
- Core metrics with period-over-period comparisons
- Top performing and controversial post highlights
- Performance trends over time
- Content strategy analysis with quadrant charts
- Data explorer with filtering capabilities
- AI briefing library with monthly reports
- **AI-POWERED**: Real-time narrative trend tracking and strategic recommendations
- **AI-POWERED**: Deep engagement analytics with pattern recognition
- **AI-POWERED**: Live AI insights with confidence scoring and refresh capabilities
- **AI-POWERED**: Advanced data discovery and exploration tools
- **AI-POWERED**: Multi-month sentiment analysis with volatility tracking

All phases have been deployed with enhanced tabbed navigation and full AI integration for seamless user experience across all intelligence modules.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Styling**: Tailwind CSS with custom "Liquid Obsidian" theme featuring dark backgrounds and electric blue accents
- **UI Components**: Radix UI components via shadcn/ui for consistent, accessible interface elements
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Animation**: Framer Motion for smooth transitions and futuristic visual effects
- **Routing**: Wouter for lightweight client-side routing
- **Typography**: Professional three-font system for minimalistic, futuristic design:
  - **Primary Headers**: Orbitron (weights 400, 700) for H1-H2 headings
  - **Body Text**: Roboto Mono (weights 400, 500) for body text and data displays
  - **Accents**: Source Sans Pro (weights 400, 600) for buttons and interactive elements

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for schema management
- **Session Management**: PostgreSQL sessions with connect-pg-simple
- **Build System**: ESBuild for server bundling, Vite for client bundling

### Key Design Decisions
- **Monorepo Structure**: Client, server, and shared code organized in separate directories
- **TypeScript**: Full type safety across the entire stack
- **Modern Build Tools**: Vite for fast development and hot module replacement
- **Component Architecture**: Modular UI components with consistent theming

## Key Components

### Frontend Components
- **IntroScreen**: Animated loading screen with holographic "ASTRA" branding
- **CommandCenter**: Main dashboard with real-time data visualization and enhanced pulse cards
- **DataExplorer**: Advanced filtering and visualization tool for deep intelligence analysis
- **ChatWithAstra**: AI-powered chat interface for real-time intelligence queries
- **InsightsChallenge**: Competitive analysis platform with gamified intelligence tasks
- **Simplified Navigation**: Removed redundant left sidebar in favor of top-level tab navigation
- **KPICard**: Animated metric cards with counting animations
- **PulseCard**: Real-time status cards with scanning animations and pulse effects
- **Charts**: Data visualization components using Recharts (TopicChart, SentimentChart)
- **PostTable**: Table component for displaying analyzed social media posts
- **ParticleBackground**: Enhanced animated background with cyber grid and data streams

### Backend Components
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Route Registration**: Centralized route management system
- **Vite Integration**: Development server with hot module replacement

### Shared Components
- **Schema**: Drizzle ORM schemas for database tables
- **Type Definitions**: Shared TypeScript interfaces

## Data Flow

### Current Implementation
1. **Mock Data**: Frontend currently uses mock data for demonstration
2. **Component Rendering**: React components fetch and display data using React Query
3. **User Interaction**: Navigation handled by Wouter routing
4. **Animation**: Framer Motion provides smooth transitions and loading states

### Planned Data Flow
1. **Data Ingestion**: Backend will ingest social media data
2. **Data Processing**: Cleaning, enrichment, and verification pipeline
3. **API Endpoints**: RESTful API for frontend data consumption
4. **Real-time Updates**: Live data streaming to dashboard
5. **Quality Gates**: Automated verification and integrity checks

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL) for data persistence
- **UI Framework**: Radix UI components for accessible interface elements
- **Animation**: Framer Motion for smooth animations
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom theme configuration

### Development Dependencies
- **Build Tools**: Vite, ESBuild, TypeScript
- **Database Tools**: Drizzle Kit for migrations
- **Development Server**: Express with Vite middleware

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds client code to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle Kit handles schema migrations

### Environment Configuration
- **Database**: Configured via `DATABASE_URL` environment variable
- **Development**: Hot reload with Vite middleware
- **Production**: Optimized builds with static asset serving

### Key Features for Deployment
- **Static Asset Serving**: Express serves built frontend files
- **Database Migrations**: Automated schema updates via Drizzle
- **Environment-specific Builds**: Different configurations for dev/prod
- **Error Handling**: Comprehensive error boundaries and logging

The application is designed to be a sophisticated intelligence dashboard with real-time data processing capabilities, featuring a modern, futuristic interface that emphasizes data integrity and traceability.