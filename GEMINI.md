# CS423 - Noah AI Smart Home Project

## Architecture
- **Device Layer:** ESP32/Wokwi simulator (sends data via HTTP POST).
- **Tunneling:** `localhost.run` (SSH Tunnel) to expose local API to Wokwi.
- **Communication:** REST API (JSON).
- **Backend:** Next.js API Routes (Node.js).
- **Database:** Supabase (PostgreSQL) with Realtime enabled.
- **Frontend:** Next.js (React) Dashboard with Realtime subscription.
- **AI Agent:** Gemini AI analyzing `sensor_logs` and storing results in `ai_insights`.

## Project Conventions
- **Database:** Use Supabase for both real-time updates and historical logging.
- **UI:** Maintain a modern, card-based layout using Tailwind CSS.
- **AI:** Prompts for Noah AI should be in Thai as per user requirements.
- **Real-time:** Ensure `sensor_logs` table has 'Realtime' enabled in Supabase Replication settings.

## How to Run (Full System)
1. **Start Dashboard:** `npm run dev` (Check if it runs on port 3000 or 3001).
2. **Open Tunnel:** In a new terminal, run `ssh -R 80:localhost:3000 nokey@localhost.run` (Match the port from step 1).
3. **Configure Wokwi:** Copy the `https://...` URL from the tunnel and paste it into `serverName` in Wokwi ESP32 code (add `/api/sensor` suffix).
4. **Run Simulation:** Click Play in Wokwi. Data will flow to the Dashboard.
5. **AI Analysis:** Call `POST /api/ai-analyze` to refresh AI insights.

## Submission Guidelines (CS423)
- Ensure Architecture Diagram covers all layers mentioned in the PDF.
- Live Demo must show: sensor reading, real-time update, historical graph, and AI recommendation.
