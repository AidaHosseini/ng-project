from flask import Blueprint, request, jsonify
from db.neo4j_connector import neo4j
import json 

search_bp = Blueprint("search", __name__)

@search_bp.route("/", methods=["GET"])
def search():
    city = request.args.get("city", "").strip()
    icd_code = request.args.get("icd_code", "").strip()
    
    query = """
    MATCH (i:N_ICD)-[:WIRD_BEHANDELT_IN]->(c:Clinic)
    WHERE c.city = $city AND i.name = $icd_code
    RETURN c.name AS clinic_name, c.city AS city, c.latitude AS latitude, c.longitude AS longitude
    """
    
    results = neo4j.run_query(query, {"city": city, "icd_code": icd_code})

    formatted_results = [
        {
            "clinic_name": record["clinic_name"],
            "city": record["city"],
            "latitude": record["latitude"],  
            "longitude": record["longitude"]
        }
        for record in results
    ]
    
    return json.dumps(formatted_results, ensure_ascii=False, indent=4), 200, {'Content-Type': 'application/json; charset=utf-8'}
