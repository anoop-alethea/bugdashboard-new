# Bug Analytics Dashboard

A comprehensive, interactive web dashboard for analyzing bug tracking data with subsystem-wise insights.

## 🌟 Features

### 📊 Key Metrics
- **Total Bugs**: Complete count of all issues
- **Open Bugs**: Active issues requiring attention
- **Closed/Resolved**: Completed issues
- **High Priority**: Critical issues needing immediate focus

### 🎯 Subsystem Analysis
- **Sub-System/Module Tracking**: Detailed breakdown of bugs per subsystem
- **Interactive Filtering**: Filter by specific subsystems to identify problem areas
- **Visual Charts**: Bar charts showing bug distribution across different modules

### 📈 Comprehensive Visualizations
- **Status Distribution**: Pie chart showing current status breakdown
- **Priority Analysis**: Visual representation of bug priorities
- **Owner Team Distribution**: Track which teams handle the most issues
- **Bug Classification**: Categorize bugs by type (functionality, UI, performance, etc.)
- **Monthly Trends**: Line chart showing bug creation patterns over time

### 🔍 Advanced Filtering
- Filter by Status, Priority, Sub-System/Module, Project, Owner Team, Assignee
- Date range filtering for temporal analysis
- Real-time data updates as filters are applied
- Multiple filter combinations for deep analysis

### 📱 Responsive Design
- Mobile-friendly interface
- Adaptive layout for different screen sizes
- Touch-friendly controls and interactions

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd "bug analytics"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the dashboard:**
   Open your browser and navigate to `http://localhost:3000`

### Using Your Own Data

1. **CSV Format**: Your CSV file should include these key columns:
   - `Status` - Bug status (New, Open, Closed, etc.)
   - `Priority` - Bug priority level (Low, Normal, High, Urgent)
   - `Sub-System/Module` - The system component affected
   - `Project` - Project name
   - `Owner Team` - Responsible team
   - `Assignee` - Person assigned to the bug
   - `Created` - Creation date
   - `Subject` - Bug description
   - `Bug Classification` - Type of issue
   - `Author` - Bug reporter

2. **Upload Process**: 
   - Use the file upload feature in the dashboard
   - Or replace the CSV file in the `public` directory
   - The dashboard automatically processes and visualizes your data

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run code linting
- `npm run typecheck` - Run TypeScript type checking

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Charts**: Recharts for data visualization
- **Styling**: Custom CSS with responsive design
- **Data Processing**: PapaParse for CSV handling
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Date Handling**: date-fns

## 📁 Project Structure

```
bug analytics/
├── src/
│   ├── components/
│   │   ├── MetricCard.tsx      # Individual metric display
│   │   ├── Charts.tsx          # Chart components
│   │   └── Filters.tsx         # Filtering interface
│   ├── utils/
│   │   └── dataProcessor.ts    # Data processing utilities
│   ├── types.ts                # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
├── public/
│   └── isuses_sep_2 - Sheet1.csv  # Sample data file
└── package.json               # Project configuration
```

## 🎯 Key Dashboard Sections

### 1. Summary Metrics
Four key performance indicators displayed as cards showing total bugs, open issues, closed issues, and high-priority items.

### 2. Subsystem Analysis
Prominent bar chart showing bug distribution across different sub-systems/modules, helping identify problematic areas.

### 3. Interactive Filters
Comprehensive filtering system allowing analysis by:
- Status and Priority levels
- Specific Sub-Systems/Modules
- Projects and Teams
- Individual Assignees
- Date ranges

### 4. Visual Analytics
Multiple chart types including:
- Pie charts for categorical data
- Bar charts for comparative analysis
- Line charts for trend analysis
- Color-coded visualizations for easy interpretation

## 🔧 Customization

### Adding New Metrics
1. Update the `DashboardMetrics` interface in `src/types.ts`
2. Modify the `calculateMetrics` function in `src/utils/dataProcessor.ts`
3. Add new MetricCard components in `App.tsx`

### Custom Chart Types
1. Create new chart components in `src/components/Charts.tsx`
2. Add corresponding data processing functions
3. Include in the main dashboard layout

### Styling Modifications
- Global styles: `src/index.css`
- Component-specific styles: Inline or create new CSS files
- Responsive breakpoints: Currently optimized for mobile and desktop

## 📊 Data Processing Features

- **Automatic CSV Parsing**: Handles various CSV formats and encodings
- **Date Normalization**: Processes different date formats consistently
- **Data Validation**: Filters out invalid or incomplete records
- **Performance Optimization**: Efficient filtering and processing for large datasets
- **Memory Management**: Optimized for handling substantial data files

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Color Coding**: Intuitive color schemes for different categories
- **Hover Effects**: Interactive elements with visual feedback
- **Loading States**: Progress indicators during data processing
- **Error Handling**: Graceful error messages and recovery options

## 🚀 Production Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting service:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront
   - Any static hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **CSV Not Loading**: Ensure the CSV file is in the `public` directory
2. **Charts Not Displaying**: Check for JavaScript errors in browser console
3. **Performance Issues**: For very large datasets (>10k records), consider data pagination
4. **Date Parsing Errors**: Verify date formats in your CSV match expected patterns

### Support

For issues and questions:
1. Check the browser console for error messages
2. Verify CSV data format matches expected structure
3. Ensure all required npm packages are installed
4. Try refreshing the page or restarting the development server

---

**Made with ❤️ for better bug tracking and analysis**