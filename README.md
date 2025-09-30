# ilsimperia Marketing Portal

A comprehensive Next.js frontend application for managing leads, sales, and admissions in the ed-tech sector. Built with modern technologies and best practices for scalability and maintainability.

## 🚀 Features

### 📊 Dashboard
- **Key Metrics Overview**: Real-time display of leads, sales, and revenue metrics
- **Interactive Charts**: Visual representation of leads vs conversions using Recharts
- **Recent Activity Feed**: Latest updates from your marketing team
- **Quick Actions**: Fast navigation to key sections

### 👥 Leads Management
- **Comprehensive Lead Tracking**: Full lead lifecycle management
- **Advanced Filtering**: Search by name, email, course interest, and status
- **Status Management**: Track leads through New → Contacted → Nurturing → Qualified → Lost
- **Lead Creation**: Easy-to-use forms for adding new leads
- **Detailed Lead Profiles**: Complete interaction history and contact information

### 💰 Sales Pipeline
- **Kanban Board Interface**: Visual pipeline with drag-and-drop functionality
- **Pipeline Stages**: Qualified Lead → Contacted → Proposal Sent → Follow-up → Closed-Won/Lost
- **Revenue Tracking**: Real-time sales metrics and conversion rates
- **Deal Management**: Move deals through pipeline stages with one-click actions
- **Performance Analytics**: Monthly sales performance and trends

### 🎓 Admissions Portal
- **Student Management**: Complete enrolled student database
- **Payment Tracking**: Monitor payment status (Paid, Pending, Overdue)
- **Progress Monitoring**: Visual progress bars for course completion
- **Document Management**: Track uploaded student documents
- **Payment History**: Detailed payment timeline for each student

## 🛠 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API + SWR for server state
- **Data Fetching**: SWR for caching and revalidation
- **Charts**: Recharts for data visualization
- **Icons**: Heroicons
- **Authentication**: Custom auth with protected routes

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard and main app pages
│   │   ├── leads/        # Leads management
│   │   ├── sales/        # Sales pipeline
│   │   └── admissions/   # Student admissions
│   ├── login/            # Authentication
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   └── Modal.tsx
│   └── layout/          # Layout components
│       ├── Sidebar.tsx
│       └── Header.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   └── useApi.ts       # SWR data fetching hooks
└── lib/                # Utilities and data
    ├── api.ts          # API layer with mock data
    └── mockData.ts     # Mock data for development
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd marketing-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

For testing the application, use these demo credentials:
- **Email**: admin@ilsimperia.com
- **Password**: admin123

## 🎨 Design System

The application uses a custom design system built on Tailwind CSS:

### Color Palette
- **Primary**: Blue shades for main actions and branding
- **Secondary**: Gray shades for text and backgrounds
- **Success**: Green for positive actions and status
- **Warning**: Yellow for pending states
- **Error**: Red for errors and negative actions

### Components
All UI components are built with:
- Consistent spacing and typography
- Accessible color contrasts
- Responsive design patterns
- Loading and error states
- Hover and focus interactions

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Adapted layouts with collapsible navigation
- **Mobile**: Touch-optimized interface with bottom navigation

## 🔌 API Integration

The application is structured to easily integrate with your backend API:

### Current Implementation
- Mock data with simulated API delays
- SWR for data fetching and caching
- Error handling and loading states
- Optimistic updates for better UX

### Backend Integration
To connect to your actual backend:

1. **Update API endpoints** in `src/lib/api.ts`
2. **Replace mock data** with real API calls
3. **Configure authentication** in `src/contexts/AuthContext.tsx`
4. **Add environment variables** for API URLs

Example API integration:
```typescript
// src/lib/api.ts
export const api = {
  getLeads: async (): Promise<Lead[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`)
    if (!response.ok) throw new Error('Failed to fetch leads')
    return response.json()
  }
}
```

## 🔒 Authentication

The application includes a complete authentication system:

- **Protected Routes**: Automatic redirection for unauthenticated users
- **Context-based State**: Global auth state management
- **Persistent Sessions**: Local storage for session persistence
- **Role-based Access**: Ready for role-based permissions

## 📊 Data Management

### SWR Integration
- **Automatic Caching**: Intelligent data caching and revalidation
- **Background Updates**: Fresh data without loading states
- **Error Handling**: Comprehensive error boundaries
- **Optimistic Updates**: Immediate UI updates for better UX

### State Management
- **Local State**: React hooks for component state
- **Global State**: Context API for shared state
- **Server State**: SWR for server-side data
- **Form State**: Controlled components with validation

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

### Deployment Platforms
The application can be deployed on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

## 🧪 Development

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks (optional)

### Best Practices
- Component composition over inheritance
- Custom hooks for reusable logic
- Proper error boundaries
- Accessibility considerations
- Performance optimizations

## 📈 Performance

### Optimizations Included
- **Next.js App Router**: Automatic code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching Strategy**: SWR for intelligent caching
- **Lazy Loading**: Dynamic imports for large components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Future Enhancements

### Planned Features
- **Real-time Notifications**: WebSocket integration for live updates
- **Advanced Analytics**: Detailed reporting and analytics dashboard
- **Email Integration**: Automated email campaigns and notifications
- **Mobile App**: React Native companion app
- **API Documentation**: Comprehensive API documentation
- **Multi-tenant Support**: Support for multiple organizations
- **Advanced Permissions**: Granular role-based access control
- **Data Export**: CSV/PDF export functionality
- **Integration Hub**: Third-party integrations (CRM, email marketing)

### Technical Improvements
- **Testing Suite**: Unit and integration tests
- **Storybook**: Component documentation
- **Performance Monitoring**: Real-time performance tracking
- **Error Tracking**: Comprehensive error monitoring
- **CI/CD Pipeline**: Automated testing and deployment

---

Built with ❤️ for ilsimperia by the development team.
