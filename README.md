# Servaana - Restaurant POS & Billing System

A modern, intuitive SaaS Restaurant Point of Sale and Billing System optimized for iPad/tablet touch screens with a clean, minimal design using soft pastel colors.

## Features

### 🎨 Modern UI/UX
- Clean, minimal design with soft pastel color palette
- Optimized for iPad/tablet touch screens
- Large tap areas and smooth animations
- Card-based design with rounded corners and soft shadows
- Consistent visual hierarchy

### 🏪 Restaurant Management
- Restaurant registration and authentication
- Visual setup wizard for tables and menu
- Real-time table status (free/occupied)
- Area-based table organization

### 📱 POS Operations
- One-tap order taking with interactive menu popup
- Quick bill printing with automatic table reset
- Real-time order tracking
- Smooth popup animations and transitions

### 📊 Analytics & Reporting
- Daily/weekly/monthly revenue charts
- Popular items visualization
- Table usage heatmap
- Expense tracking and categorization
- Net profit calculations

### 💰 Inventory & Expenses
- Daily expense tracking
- Category-based expense organization
- Real-time expense summaries

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication with bcrypt
- **CORS** enabled for cross-origin requests

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development and building
- **Zustand** for lightweight state management
- **Tailwind CSS** for utility-first styling
- **Recharts** for beautiful data visualizations
- **Lucide React** for consistent icons
- **Axios** for API communication

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd servaana

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant-pos
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or start MongoDB service (Linux/macOS)
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 4. Run the Application

From the root directory:

```bash
# Start both frontend and backend concurrently
npm run dev
```

Or run them separately:

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Usage Guide

### 1. Restaurant Registration
- Create a new restaurant account with basic information
- Auto-login after successful registration

### 2. Setup Wizard
- **Table Setup**: Create areas (AC, Outdoor, etc.) and add tables with seat counts
- **Menu Setup**: Add categories and menu items with prices and descriptions
- Complete setup to access the main dashboard

### 3. Daily Operations
- **Dashboard**: View all tables grouped by areas with real-time status
- **Take Orders**: Tap "Take Order" → Select items → Confirm order
- **Print Bills**: Tap "Print Bill" → Review order → Print and complete

### 4. Management
- **Inventory**: Track daily expenses by category
- **Analytics**: View revenue trends, popular items, and profit analysis

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new restaurant
- `POST /api/auth/login` - Restaurant login

### Restaurant Management
- `GET /api/restaurants/me` - Get restaurant data
- `PUT /api/restaurants/:id/setup` - Complete setup wizard
- `PUT /api/restaurants/:id/tables/:tableLabel` - Update table status
- `POST /api/restaurants/:id/expenses` - Add expense

### Order Management
- `POST /api/orders/:restaurantId` - Create new order
- `GET /api/orders/restaurant/:restaurantId` - Get active orders
- `PUT /api/orders/:orderId/complete` - Complete order

## Project Structure

```
restaurant-pos/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route handlers
│   ├── middleware/      # Authentication middleware
│   └── server.js        # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Main application pages
│   │   ├── stores/      # Zustand state management
│   │   └── utils/       # API utilities and helpers
│   └── public/          # Static assets
└── package.json         # Root package configuration
```

## Design System

### Color Palette
- **Pastel Blue**: `#E6F3FF` (navigation, primary actions)
- **Pastel Green**: `#E8F5E8` (free tables, success states)
- **Pastel Red**: `#FFE6E6` (occupied tables, expenses)
- **Pastel Yellow**: `#FFF9E6` (areas, highlights)
- **Soft Gray**: `#F5F5F5` (backgrounds)

### Typography
- System fonts: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'`
- Font smoothing enabled for crisp text rendering

### Animations
- **Fade In**: 0.3s ease-in-out
- **Slide Up**: 0.3s ease-out for popups
- **Bounce Soft**: 0.6s ease-in-out for buttons
- **Scale**: Hover effects on interactive elements

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.