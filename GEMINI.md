# CS423 - Noah AI Smart Home Project

## Architecture
- **Device Layer:** ESP32/Wokwi simulator (sends data via HTTP POST).
- **Communication:** REST API (JSON).
- **Backend:** Next.js API Routes (Node.js).
- **Database:** Supabase (PostgreSQL).
- **Frontend:** Next.js (React) Dashboard.
- **AI Agent:** Gemini AI analyzing `sensor_logs` and storing results in `ai_insights`.

## Project Conventions
- **Database:** Use Supabase for both real-time updates and historical logging.
- **UI:** Maintain a modern, card-based layout using Tailwind CSS.
- **AI:** Prompts for Noah AI should be in Thai as per user requirements.

## How to Run
1. `npm run dev` to start the dashboard.
2. `python test.py` to simulate sensor data.
3. Call `POST /api/ai-analyze` to refresh AI insights.

## Submission Guidelines (CS423)
- Ensure Architecture Diagram covers all layers mentioned in the PDF.
- Live Demo must show: sensor reading, real-time update, historical graph, and AI recommendation.
