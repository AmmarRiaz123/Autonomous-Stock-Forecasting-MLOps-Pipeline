# FastAPI Backend Routes (Contract for `my-mlops-dashboard`)

Frontend base URL comes from `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).
All routes below are under the prefix: `/api`.

## Conventions

- Content-Type: `application/json`
- Ticker path param: `{ticker}` (e.g. `AAPL`)
- Dashboard status enums:
  - Ticker/system health: `healthy | warning | error` (used by status chips/cards)
  - Log status: `success | warning | error` (used by Logs filter/table)
- Dates/times: ISO-8601 strings (UTC recommended)

---

## 1) Health

### `GET /api/health`
Used for basic backend liveness (optional but recommended).

**200**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T12:34:56Z",
  "version": "0.1.0"
}
```

---

## 2) Tickers

### `GET /api/tickers`
Dashboard + tickers list page.

**200**
```json
[
  {
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "exchange": "NASDAQ",
    "status": "healthy",
    "current_model": "Transformer",
    "last_trained_at": "2026-01-10T02:12:00Z",
    "drift_score": 0.12,
    "accuracy": 0.91,
    "updated_at": "2026-01-11T11:00:00Z"
  }
]
```

### `POST /api/tickers`
Add ticker (used by “Add ticker” modal).

**Request**
```json
{
  "ticker": "AAPL",
  "exchange": "NASDAQ",
  "name": "Apple Inc."
}
```

**201**
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "exchange": "NASDAQ",
  "status": "warning",
  "current_model": null,
  "last_trained_at": null,
  "drift_score": null,
  "accuracy": null,
  "updated_at": "2026-01-11T11:00:00Z"
}
```

### `GET /api/tickers/{ticker}`
Ticker detail header/metadata.

**200**
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "exchange": "NASDAQ",
  "status": "healthy",
  "current_model": "Transformer",
  "last_trained_at": "2026-01-10T02:12:00Z",
  "metrics": {
    "mae": 1.23,
    "rmse": 1.95,
    "mape": 0.034
  }
}
```

### (Optional) `DELETE /api/tickers/{ticker}`
If you expose “remove ticker” later.

**204** (no body)

---

## 3) Forecast Data

### `GET /api/forecast/{ticker}?horizon=30`
Ticker detail chart (actual vs predicted). `horizon` optional.

**200**
```json
{
  "ticker": "AAPL",
  "horizon": 30,
  "points": [
    {
      "date": "2026-01-01",
      "actual": 193.12,
      "predicted": 192.50,
      "lower": 189.10,
      "upper": 195.30
    }
  ]
}
```

Notes:
- `actual` may be `null` for future dates if you include forward forecast points.
- `lower/upper` are optional if you don’t support intervals.

---

## 4) Candidate Models + Deployment

### `GET /api/models/{ticker}`
Model comparison table for a ticker.

**200**
```json
[
  {
    "model": "LSTM",
    "mae": 1.40,
    "rmse": 2.10,
    "mape": 0.041,
    "r2": 0.86,
    "last_trained_at": "2026-01-10T02:12:00Z",
    "status": "success",
    "recommended": false
  },
  {
    "model": "Transformer",
    "mae": 1.23,
    "rmse": 1.95,
    "mape": 0.034,
    "r2": 0.89,
    "last_trained_at": "2026-01-10T02:12:00Z",
    "status": "success",
    "recommended": true
  }
]
```

### `POST /api/models/{ticker}/deploy`
Used by “Deploy” action in the model table.

**Request**
```json
{
  "model": "Transformer"
}
```

**200**
```json
{
  "ticker": "AAPL",
  "previous_model": "LSTM",
  "deployed_model": "Transformer",
  "deployed_at": "2026-01-11T11:05:00Z"
}
```

---

## 5) Logs & Alerts

### `GET /api/logs?ticker=AAPL&limit=200`
Logs page (filtering by ticker in UI). `ticker` optional.

**200**
```json
[
  {
    "id": "log_01H...",
    "timestamp": "2026-01-11T10:59:00Z",
    "ticker": "AAPL",
    "event": "training_completed",
    "status": "success",
    "message": "Training completed for Transformer",
    "details": {
      "mae": 1.23,
      "rmse": 1.95
    }
  }
]
```

### `POST /api/pipeline/{ticker}/retry`
Used by “Retry pipeline” action in logs table (or similar UI action).

**Request** (empty is fine)
```json
{}
```

**202**
```json
{
  "ticker": "AAPL",
  "accepted": true,
  "queued_at": "2026-01-11T11:10:00Z"
}
```

---

## 6) Settings

### `GET /api/settings`
Settings page initial load.

**200**
```json
{
  "retrain_frequency": "Weekly",
  "drift_threshold": 0.2,
  "enable_auto_deploy": true,
  "slack_webhook_url": "",
  "candidate_models": ["LSTM", "GRU", "Transformer", "XGBoost"],
  "exchanges_enabled": ["NYSE", "NASDAQ"]
}
```

### `PUT /api/settings`
Settings save.

**Request**
```json
{
  "retrain_frequency": "Daily",
  "drift_threshold": 0.15,
  "enable_auto_deploy": false,
  "slack_webhook_url": "https://hooks.slack.com/services/...",
  "candidate_models": ["Transformer", "XGBoost"],
  "exchanges_enabled": ["NASDAQ"]
}
```

**200** (echo updated)
```json
{
  "retrain_frequency": "Daily",
  "drift_threshold": 0.15,
  "enable_auto_deploy": false,
  "slack_webhook_url": "https://hooks.slack.com/services/...",
  "candidate_models": ["Transformer", "XGBoost"],
  "exchanges_enabled": ["NASDAQ"]
}
```

---

## Cross-cutting backend requirements (FastAPI)

- Enable CORS for the Next.js dev origin:
  - `http://localhost:3000` (and your deployed domain later)
- Return consistent error envelopes (recommended):
```json
{
  "detail": "Human-readable error message"
}
```
- Keep model names aligned with frontend list:
  `LSTM | GRU | Transformer | XGBoost | Prophet | ARIMA`
