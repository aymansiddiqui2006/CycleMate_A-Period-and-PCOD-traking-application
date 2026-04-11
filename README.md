# CycleSakhi-PCOS detection web app
An AI-powered Women's Menstrual Health & PCOD Detection Platform.

## Features
- **PCOD Risk Tracking**: Algorithms based on cycle timeline to assess risks.
- **AI Chatbot**: Generative AI 'Sakhi' that helps answer queries.
- **Reporting**: Detailed analytics inside a nice dashboard with PDF Exports.
- **Delivery**: Easy fast access to menstrual care products via Zepto, Blinkit etc.
- **Doctor Consultation**: A portal to view and potentially book doctors.

## Setup Instructions

### Environment Variables
1. Make sure to have a MongoDB URI.
2. Ensure you have your Gemini API Key.
3. Review `backend/.env.example` and set up `backend/.env` with:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT=5000`
4. Set up `frontend/.env` with:
   - `VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY`
   - `VITE_MAPS_API_KEY=YOUR_MAPS_API_KEY`

### Running the Backend
1. `cd backend`
2. `npm install`
3. `npm start` (It will run the Express server on port 5000)

### Running the Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs Vite locally)

## Design and Technology
- **Frontend Core**: React 18, Vite.
- **Styling**: Tailwind CSS, Framer Motion for beautiful sliding authentication models and interaction.
- **State & Data**: Axios for data fetching. Recharts for the interactive dashboard cycle chart.
- **Backend Core**: Express and MongoDB.

