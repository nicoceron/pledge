# Pledge - Habit Accountability App 💪

A React Native application built with Expo that helps you stay accountable to your habits through financial pledges. If you miss a habit, you get charged $5 USD - creating real financial accountability for your goals.

## ✨ Features

### 🎯 Core Functionality

- **Habit Tracking**: Create and manage daily, weekly, or monthly habits
- **Financial Accountability**: Set pledge amounts (default $5) that you're charged when you miss habits
- **Real-time Status**: Mark habits as completed or missed each day
- **Streak Tracking**: Monitor your consistency with streak counters
- **Payment History**: View all charges from missed habits

### 📱 Beautiful UI/UX

- **Modern Design**: Clean, gradient-based interface with smooth animations
- **Intuitive Navigation**: Bottom tab navigation with 4 main sections
- **Interactive Components**: Engaging habit cards with clear action buttons
- **Responsive Layout**: Works perfectly on both iOS and Android

### 📊 Analytics & Insights

- **Success Rate Tracking**: See your overall habit completion percentage
- **Detailed Statistics**: View completed habits, missed habits, and total charges
- **Progress Overview**: Monitor your habit journey with visual metrics
- **Payment History**: Track all financial accountability charges

## 🏗️ Technical Architecture

### Tech Stack

- **Framework**: React Native 0.79 (Latest)
- **Development Platform**: Expo SDK 53
- **Language**: TypeScript for type safety
- **Navigation**: React Navigation v7
- **Storage**: AsyncStorage for local data persistence
- **UI Components**: Custom components with Expo Vector Icons
- **Gradients**: Expo Linear Gradient for beautiful backgrounds

### Project Structure

```
src/
├── components/          # Reusable UI components
│   └── HabitCard.tsx   # Main habit display component
├── hooks/               # Custom React hooks
│   └── useHabits.ts    # Habit management logic
├── navigation/          # App navigation setup
│   ├── AppNavigator.tsx
│   └── TabNavigator.tsx
├── screens/             # Main app screens
│   ├── HomeScreen.tsx   # Today's habits
│   ├── HabitsScreen.tsx # All habits management
│   ├── AnalyticsScreen.tsx # Statistics & insights
│   └── SettingsScreen.tsx  # User profile & settings
├── services/            # Data services
│   └── storage.ts      # AsyncStorage management
├── types/               # TypeScript type definitions
│   └── index.ts
└── utils/               # Utility functions
    └── index.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS testing) or Android Emulator (for Android testing)

### Installation

1. **Clone or use this project directory**

   ```bash
   cd pledge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - **iOS**: Press `i` in the terminal or run `npm run ios`
   - **Android**: Press `a` in the terminal or run `npm run android`
   - **Web**: Press `w` in the terminal or run `npm run web`

## 📱 App Screens

### 🏠 Home Screen

- **Today's Overview**: See habits due today with completion stats
- **Quick Actions**: Fast access to add habits and view analytics
- **Habit Cards**: Interactive cards showing today's habits with complete/miss buttons
- **Progress Summary**: Visual stats showing completed vs. due habits

### 📋 Habits Screen

- **All Habits**: View and manage all your active habits
- **Add New Habits**: Create habits with custom frequency and pledge amounts
- **Habit Management**: Edit, delete, and toggle habit status
- **Floating Action Button**: Quick access to add new habits

### 📈 Analytics Screen

- **Success Rate**: Overall completion percentage across all habits
- **Streak Statistics**: Average and total streak information
- **Financial Overview**: Total charges and payment history
- **Detailed Metrics**: Comprehensive breakdown of habit performance

### ⚙️ Settings Screen

- **User Profile**: Manage your name and email
- **App Statistics**: Overview of your habit journey
- **Data Management**: Clear all data option
- **Future Features**: Notifications, payment methods, and support (coming soon)

## 💰 Financial Accountability System

### How It Works

1. **Set Pledge Amount**: When creating a habit, set how much you'll be charged for missing it (default: $5)
2. **Daily Tracking**: Mark habits as completed or missed each day
3. **Automatic Charging**: Missing a habit creates a payment record in your history
4. **Transparency**: View all charges in the Analytics section

### Payment Features (Current Implementation)

- **Local Tracking**: All payment records are stored locally for demonstration
- **Payment History**: View all missed habit charges with dates and amounts
- **Running Totals**: Track total amount pledged across all missed habits

_Note: This is a demonstration app. In a production version, you would integrate with actual payment processors like Stripe, PayPal, or Apple/Google Pay for real financial transactions._

## 🎨 Design Philosophy

### Visual Design

- **Color Scheme**: Purple/indigo gradients with semantic colors (green for success, red for danger)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent padding and margins for professional look
- **Shadows**: Subtle shadows and elevation for depth

### User Experience

- **Intuitive Flow**: Clear navigation and logical screen organization
- **Immediate Feedback**: Visual confirmations for all user actions
- **Error Handling**: Proper alerts and error states
- **Accessibility**: Proper contrast ratios and touch targets

## 🔧 Development Notes

### Key Features Implemented

- ✅ Habit CRUD operations
- ✅ Daily habit tracking with completion status
- ✅ Financial penalty system for missed habits
- ✅ Local data persistence with AsyncStorage
- ✅ Beautiful, responsive UI with gradients and animations
- ✅ Comprehensive analytics and statistics
- ✅ User profile management
- ✅ Cross-platform compatibility (iOS/Android)

### Future Enhancements

- 🔄 Push notifications for habit reminders
- 💳 Real payment processor integration
- 🔄 Cloud sync and backup
- 📊 Advanced analytics with charts
- 👥 Social features and accountability partners
- 🎯 Habit templates and recommendations
- 🏆 Achievement system and badges

## 🐛 Known Issues & Limitations

1. **Local Storage Only**: Data is stored locally and will be lost if app is deleted
2. **No Real Payments**: Payment system is simulated for demonstration
3. **Basic Analytics**: Charts and advanced visualizations not yet implemented
4. **No Notifications**: Push notifications for habit reminders not yet implemented

## 📄 License

This project is created for demonstration purposes. Feel free to use and modify as needed.

## 🤝 Contributing

This is a demonstration project, but suggestions and improvements are welcome!

---

**Built with ❤️ using React Native and Expo**

_Pledge - Because accountability matters!_ 💪
