from flask import Blueprint, jsonify, request
from db.neo4j_connector import neo4j

analytics_blueprint = Blueprint("analytics", __name__)


@analytics_blueprint.route("/top-icd-codes", methods=["GET"])
def top_icd_codes():
    ID = request.args.get("ID", "").strip()
    """
    Get the most frequently treated ICD-10 codes in clinics.
    """
    query = """
    # MATCH (i:N_ICD)-[:WIRD_BEHANDELT_IN]->(c:Clinic)
    MATCH (c:Clinic)
    WHERE c.id = $ID 
    RETURN i.name AS icd_code, 
           SUM(i.fallzahl) AS total_cases, 
           c.number_of_bed AS number_of_beds
    ORDER BY total_cases DESC 
    
"""
    results = neo4j.run_query(query)
    return jsonify([record.data() for record in results])
