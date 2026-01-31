# Overview

This is a full-stack cryptocurrency mining dashboard application built with React, Express.js, and TypeScript. The application provides real-time monitoring and management of cryptocurrency mining operations, portfolio tracking, exchange integrations, and profitability calculations. It features a modern dark-themed UI with WebSocket connectivity for live data updates.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern component patterns
- **Vite** as the build tool and development server for fast hot module replacement
- **TanStack Query** for server state management, caching, and data fetching
- **Wouter** for lightweight client-side routing
- **Tailwind CSS** with shadcn/ui component library for consistent styling
- **WebSocket integration** for real-time price updates and mining statistics
- Component-based architecture with separate UI components in `/client/src/components`

## Backend Architecture
- **Express.js** server with TypeScript for API endpoints and WebSocket handling
- **In-memory storage** using Maps for development (production-ready for database integration)
- **RESTful API design** with proper HTTP status codes and error handling
- **WebSocket server** for broadcasting real-time updates to connected clients
- **Modular route structure** with separated business logic in storage layer

## Database Design
- **Drizzle ORM** configured for PostgreSQL with schema definitions in `/shared/schema.ts`
- **Neon Database** integration via `@neondatabase/serverless` for serverless PostgreSQL
- **Schema includes**: users, mining rigs, portfolio balances, mining transactions, and exchange connections
- **Database migrations** managed through Drizzle Kit with configuration in `drizzle.config.ts`

## Real-time Features
- **WebSocket implementation** for live price updates from CoinGecko API
- **Mining statistics broadcasting** with real-time hash rate and earnings data
- **Portfolio balance updates** pushed to all connected clients
- **Connection status monitoring** with visual indicators in the UI

## Authentication & Security
- **Replit Auth** for user authentication supporting X (Twitter), Google, GitHub, Apple, and email login
- **Session-based authentication** with PostgreSQL session storage
- **User isolation** with user-specific data access patterns via `req.user.claims.sub`
- **Input validation** using Zod schemas for type-safe API requests
- **Environment variable configuration** for database and API credentials
- **Protected routes** require authentication via `isAuthenticated` middleware

## External Integrations
- **CoinGecko API** for real-time cryptocurrency price data
- **Exchange API preparation** with support for Coinbase and Binance connections
- **Automated selling features** with configurable settings per exchange
- **Price tracking** with 24-hour change calculations

# External Dependencies

## Core Framework Dependencies
- **React 18**: Frontend framework with hooks and modern patterns
- **Express.js**: Backend web server framework
- **TypeScript**: Type safety across the entire application
- **Vite**: Build tool and development server

## Database & ORM
- **Drizzle ORM**: Type-safe database toolkit
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **PostgreSQL**: Primary database (configured but not yet connected)

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component primitives
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

## State Management & Data Fetching
- **TanStack Query**: Server state management
- **WebSocket (ws)**: Real-time communication

## External APIs
- **CoinGecko API**: Cryptocurrency price data
- **Exchange APIs**: Coinbase and Binance integration (prepared)

## Development Tools
- **ESBuild**: Fast JavaScript bundler
- **PostCSS**: CSS processing
- **Replit plugins**: Development environment integration