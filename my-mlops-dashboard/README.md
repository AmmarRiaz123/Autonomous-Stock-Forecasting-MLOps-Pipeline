# MLOps Stock Forecasting Dashboard

A professional Next.js dashboard for monitoring and managing autonomous stock forecasting models.

## Features

- 📊 **Dashboard**: Real-time monitoring of all tickers with status indicators
- 📈 **Ticker Management**: Add, view, and manage stock tickers
- 📉 **Forecast Visualization**: Interactive charts comparing actual vs predicted values
- 🤖 **Model Comparison**: Compare candidate models and deploy the best performer
- 📋 **Logs & Alerts**: Monitor pipeline events and retry failed operations
- ⚙️ **Settings**: Configure retraining schedules, drift thresholds, and more

## Tech Stack

- **Framework**: Next.js 14
- **Language**: JavaScript (ES6+)
- **Charts**: Chart.js + react-chartjs-2
- **Styling**: CSS Modules + Global CSS
- **API**: REST API integration with FastAPI backend

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- FastAPI backend running (default: http://localhost:8000)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your FastAPI backend URL:
