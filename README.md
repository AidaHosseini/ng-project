# 🧠 New ways of providing care and analyzing patient flows with knowledge maps, knowledge extraction (Neo4j + Flask + React)

## 📌 Overview
This project is a **React-based web application** powered by a **Flask backend** and **Neo4j graph database** for analyzing and visualizing healthcare infrastructure in Germany.

The application allows users to:

✅ Search for **clinics, MVZ, ASV, Neurologists, and Oncologists** by **city** and **radius**  
✅ See the results **on an interactive map**  
✅ Calculate **road distances** to providers  
✅ View analytics including **ICD distributions, provider details, and accessibility** and ...

---

## 🏗 Project Structure

healthcare-graph-project/
├── frontend/                        # React frontend
│   ├── public/                      # Static assets (index.html, favicon)
│   ├── src/                         # React source code
│   │   ├── components/              # Reusable UI components
│   │   │   ├── SearchForm.js        # Search form for ICD, city, radius, provider(Clinic, MVZ, ASV, Niedergelassene Ärzte), Focus(Onkologen, Neurologen), Coorperation
│   │   │   ├── Map.js               # Leaflet map showing providers
│   │   │   ├── Analytics.js         # ICD stats, provider info, distances
│   │   │   └── LocationContext.js   # Context for shared location state
│   │   ├── App.js                   # Root component
│   │   └── index.js                 # React entry point
│   ├── package.json                 # Frontend dependencies
│   └── README.md                    # Frontend-specific documentation
│
├── backend/                         # Flask backend
│   ├── app.py                       # Main Flask application
│   ├── routes/
│   │   └── search.py                # API logic for querying Neo4j
│   ├── db/
│   │   └── neo4j_connector.py       # Neo4j connection logic
│   ├── requirements.txt             # Python dependencies
│   └── README.md                    # Backend-specific documentation
│
├── .gitignore                       # Files to ignore in Git
├── README.md                        # 📘 Main project documentation
└── docs/                            # Optional: add project notes, diagrams





---

## 🚀 Installation & Setup

### 🔧 1. Neo4j Database

- Install [Neo4j Desktop](https://neo4j.com/download/)
- Create a local database
- Add nodes like `Clinic`, `MVZ`, `ASV`, `Neurologen`, `Onkologen`, and connect them to `ICD` nodes using relationships such as `:WIRD_BEHANDELT_IN`

Update `neo4j_connector.py`:
```python
URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "your_password"

🐍 2. Backend Setup (Flask)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

Start the server:
export FLASK_APP=app.py  # (Windows: set FLASK_APP=app.py)
flask run

⚛️ 3. Frontend Setup (React)
cd frontend
npm install
npm start

🌐 CORS Setup
from flask_cors import CORS
CORS(app)

📤 Git Commands
git add .
git commit -m "🔧 Added ICD support + refined analytics"
git pull origin main
git push origin main


