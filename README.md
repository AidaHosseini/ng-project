# 🧠 Healthcare Analytics & Knowledge Map (Neo4j + Flask + React)

## 📌 Overview
This project is a **React-based web application** powered by a **Flask backend** and **Neo4j graph database** for analyzing and visualizing healthcare infrastructure in Germany.

The application allows users to:

✅ Search for **clinics, MVZ, ASV, Neurologists, and Oncologists** by **city**, **radius**, and **ICD-10 codes**  
✅ See the results **on an interactive map**  
✅ Calculate **road distances** to providers  
✅ View analytics including **ICD distributions, provider details, and accessibility**

---

## 🏗 Project Structure

healthcare-graph-project/ │ ├── backend/ # Flask API with Neo4j │ ├── app.py # Flask app entry point │ 
├── routes/ │ │ └── search.py # API routes │ 
├── db/ │ │ 
└── neo4j_connector.py # Neo4j connection │ 
└── requirements.txt # Python dependencies │ ├── frontend/ # React frontend │ ├── public/ # Static assets │ ├── src/ │ │ ├── components/ │ │ │ ├── SearchForm.js # Input form for search │ │ │ ├── Map.js # Leaflet map with providers │ │ │ ├── Analytics.js # ICD stats, routes, summaries │ │ │ └── LocationContext.js # Shared location context │ │ ├── App.js │ │ └── index.js │ └── package.json │ ├── .gitignore └── README.md







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


