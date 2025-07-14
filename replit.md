# Astra Intelligence Pipeline

## Overview

The Astra Intelligence Pipeline is a sophisticated full-stack application designed as a futuristic political intelligence dashboard. It combines a React frontend with an Express backend, focused on ingesting, analyzing, and visualizing social media data for political strategy purposes. The system follows a "Trust but Verify" philosophy with automated quality gates and data integrity verification.

## User Preferences

Preferred communication style: Simple, everyday language.

## Streamlit Dashboard Analysis (January 2025)

The user provided their original Streamlit dashboard implementation which includes:
- Executive Performance Snapshot with sentiment gauge and donut charts
- Core metrics with period-over-period comparisons
- Top performing and controversial post highlights
- Performance trends over time
- Content strategy analysis with quadrant charts
- Data explorer with filtering capabilities
- AI briefing library with monthly reports

This serves as the blueprint for enhancing the current React dashboard with similar sophisticated analytics and visualization capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Styling**: Tailwind CSS with custom "Liquid Obsidian" theme featuring dark backgrounds and electric blue accents
- **UI Components**: Radix UI components via shadcn/ui for consistent, accessible interface elements
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Animation**: Framer Motion for smooth transitions and futuristic visual effects
- **Routing**: Wouter for lightweight client-side routing
- **Typography**: Inter for body text, Orbitron for headings to create a sci-fi aesthetic

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
- **Sidebar**: Navigation component with futuristic styling and expanded menu options
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