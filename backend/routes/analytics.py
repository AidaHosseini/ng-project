from flask import Blueprint, jsonify
from db.neo4j_connector import neo4j

analytics_blueprint = Blueprint("analytics", __name__)

@analytics_blueprint.route("/top-icd-codes", methods=["GET"])
def top_icd_codes():
    """
    Get the most frequently treated ICD-10 codes in clinics.
    """
    query = """
    MATCH (i:N_ICD)-[:WIRD_BEHANDELT_IN]->(c:Clinic)
    RETURN i.name AS icd_code, SUM(i.fallzahl) AS total_cases
    ORDER BY total_cases DESC LIMIT 5
    """
    
    results = neo4j.run_query(query)
    return jsonify([record.data() for record in results])
