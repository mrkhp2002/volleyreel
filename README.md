# 🎥 VolleyReel

**AI-Assisted Volleyball Highlight & Analytics Platform**

VolleyReel is a web-based system designed to simplify volleyball match analysis, highlight generation, and performance tracking. The platform uses audio-assisted event detection combined with human verification to generate accurate highlights and analytics.

---

## 🚀 Project Overview

In volleyball, analyzing match footage is time-consuming and manual. VolleyReel addresses this by:

- Detecting key events using audio signals (whistles, energy peaks)
- Allowing user verification (human-in-the-loop)
- Generating highlight reels automatically
- Providing match and tournament analytics dashboards

This project is developed as a **15-week academic capstone prototype**.

---

## 🎯 Key Features

### 🔹 Core Features
- Upload and process match videos
- Audio-assisted event detection
- Event review and confirmation interface
- Highlight reel generation
- Match analytics dashboard

### 🔹 Data Management
- Tournament management
- Team and player management
- Match setup and tracking

### 🔹 Analytics
- Match statistics and score progression
- Tournament standings and leaderboards
- Shareable reports (read-only)

---

## 🏗️ Tech Stack

### Frontend
- React.js

### Backend
- FastAPI (Python)

### Database
- PostgreSQL

### Media & Audio Processing
- FFmpeg
- OpenCV
- Librosa

### Tools
- Git & GitHub
- Docker (optional)
- Postman / Insomnia

---

## 📁 Project Structure
volleyreel/
│
├── frontend/ # React application
├── backend/ # FastAPI backend
├── database/ # Database schema & configs
├── docs/ # Documentation
├── .gitignore
└── README.md


---

## 👥 Team & Modules

| Member | Module |
|------|--------|
| H.M.G.I. Herath | Match Upload & Audio Event Detection |
| M.D.P.D.B. Bodipala | Tournament & Team Management |
| S.H.A.S. Nandasena | Highlight Generation & Match Analytics |
| A.R.K.H. Piyasekara | Tournament Analytics & Reporting + Initial Setup |

### 🔧 Core Setup Responsibility
**A.R.K.H. Piyasekara** is responsible for:
- Repository setup
- Project structure
- Backend initialization
- Database configuration
- API integration

---

## 🌿 Git Workflow (IMPORTANT)

### Branch Structure
main → Production-ready code
dev → Integration branch
dev_* → Individual module branches

### Example Branches

dev_match_upload
dev_team_management
dev_highlight_analytics
dev_tournament_reporting


---

## 🔄 Development Rules (STRICT)

### ✅ Before starting work:
```bash
git checkout dev
git pull origin dev

✅ Then switch to your branch:
git checkout dev_yourmodule
git pull origin dev
✅ After completing work:
git add .
git commit -m "feature: your update"
git push origin dev_yourmodule
🔁 Merge Process
Create Pull Request: dev_yourmodule → dev
Review → Merge
⚠️ Team Policy

🚫 Never start work without pulling the latest dev branch
✅ Always sync before coding

🧠 Methodology
Agile (Scrum)
2-week sprints
Parallel module development
Incremental integration
🖥️ System Architecture
Frontend: React SPA
Backend: FastAPI REST APIs
Database: PostgreSQL
Processing: Background audio & video processing
