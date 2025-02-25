# AA FairShare - Expense Sharing Application

[![Security Scan](https://github.com/antonio59/aafairshare/actions/workflows/security-scan.yml/badge.svg)](https://github.com/antonio59/aafairshare/actions/workflows/security-scan.yml)
[![Performance Score](https://img.shields.io/badge/performance-optimized-brightgreen)]
[![PWA Ready](https://img.shields.io/badge/pwa-ready-blue)]

AA FairShare is a modern, secure, and high-performance expense sharing application built with React and Vite. It helps users track, manage, and split expenses with friends and family, featuring real-time updates, PDF exports, and comprehensive notification systems. The application is optimized for performance, offline capabilities, and user experience.

## Features

- 🔐 Secure authentication with Supabase
- 💰 Expense tracking and management
- 📊 Interactive charts and analytics
- 📱 Responsive design for all devices
- 📄 PDF report generation
- 🔔 Customizable notification system
- 🌐 Real-time updates
- 🎨 Modern UI with dark/light mode
- ⚡ Optimized performance with code splitting
- 📦 Smart bundle optimization
- 🔄 Progressive Web App (PWA) support
- 📴 Offline functionality
- 🖼️ Optimized image loading
- 📊 Performance monitoring

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite with advanced code splitting
- **State Management**: Zustand with optimized store management
- **Authentication**: Supabase Auth
- **Database**: Supabase with offline support
- **Styling**: TailwindCSS
- **Charts**: Chart.js with react-chartjs-2 (lazy loaded)
- **PDF Generation**: pdfmake (dynamically imported)
- **Testing**: Jest and React Testing Library
- **Security**: CSP headers, strict CORS, and secure build configurations
- **Performance**: Web Vitals monitoring, optimized assets
- **PWA**: Service Worker with advanced caching strategies
- **Image Optimization**: WebP format, responsive loading

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/antonio59/aafairshare.git
cd aafairshare
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Security Features

- Content Security Policy (CSP) headers
- Strict CORS configuration
- Secure WebSocket connections
- File system access restrictions
- Comprehensive permission policies
- Regular security scans and updates

## Testing

```bash
# Run all tests
npm test

# Run security scan
npm run security:full

# Run type checking
npm run typecheck
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Performance Optimizations

### Code Splitting
- Route-based code splitting with React.lazy
- Dynamic imports for heavy components
- Optimized chunk strategy for vendor modules

### Performance Monitoring
- Real-time Web Vitals tracking
- Custom performance metrics
- User timing measurements
- Automated performance reporting

### Image Optimization
- WebP format with fallbacks
- Responsive images with srcset
- Lazy loading implementation
- Optimized image sizing

### State Management
- Selective store subscriptions
- Persistent state handling
- Optimized store updates
- Memory leak prevention

### Offline Support
- Service Worker implementation
- Smart caching strategies
- Background sync
- Offline-first architecture

## Project Structure

```
aafairshare/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── store/         # Zustand store configurations
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── supabase.ts    # Supabase client configuration
├── public/           # Static assets
├── tests/            # Test files
└── vite.config.ts    # Vite configuration
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [pdfmake](http://pdfmake.org/)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
