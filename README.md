# Donor Analytics Dashboard

A modern web application for analyzing and visualizing donor giving patterns. Built with Next.js, React, and Tailwind CSS.

## Features

- Upload and process Excel files containing donor data
- Interactive data visualizations using Recharts
- Comprehensive donor analytics including:
  - Donation trends over time
  - Donor movement analysis
  - Tier changes tracking
  - New donor acquisition metrics
- Modern UI with smooth animations
- Responsive design for all devices

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd potomac-project
```

2. Install dependencies:
```bash
npm install
```

3. Place your Excel file:
   - Copy your Excel file named `all years.xlsx` to the `public` directory
   - The file should be located at `public/all years.xlsx`
   - Make sure the file has the correct format (see Excel File Format section)

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Home Page**
   - View the main dashboard with analytics
   - Access all features through the navigation bar

2. **Upload Data**
   - Navigate to the Upload page
   - Drag and drop or select Excel files
   - Files are processed automatically
   - Redirects to dashboard after successful upload

3. **Donor Trends**
   - View comprehensive analytics
   - Interactive charts and graphs
   - Detailed donor movement analysis

4. **About**
   - Learn about the project features
   - View technologies used

## Excel File Format

The application expects an Excel file with the following columns:

Required columns:
- `VANID` (unique donor identifier)
- `Name` (donor name)
- `FY25` through `FY20` (fiscal year donation amounts)
- `MRC Ever` (Most Recent Contribution amount)
- `MRC Ever Date` (date of most recent contribution)
- `MRC Source Code` (source of the contribution)

Optional flag columns (boolean values):
- `Major Donor`
- `Mid-Range`
- `Planned Giving`
- `Anonymous`
- `Email Only`
- `Easement Donor`
- `One Solicit Per Year`
- `One Solicit Spring`
- `Friend of PPS`
- `Major Donor Prospect`

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Tremor
- Excel.js
- Heroicons

## Project Structure

```
potomac-project/
├── public/
│   └── all years.xlsx    # Place your Excel file here
├── src/
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   └── utils/           # Utility functions
├── package.json
└── README.md
```

## Troubleshooting

1. If you see a "Failed to fetch Excel file" error:
   - Make sure the Excel file is named exactly `all years.xlsx`
   - Verify the file is in the `public` directory
   - Check that the file has the correct format

2. If you see type errors:
   - Run `npm run type-check` to identify issues
   - Make sure all required columns are present in your Excel file

3. If the application doesn't start:
   - Check Node.js and npm versions
   - Try deleting `node_modules` and running `npm install` again

## License

MIT License

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
