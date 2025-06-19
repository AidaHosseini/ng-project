# ✅ Refactored search.py without UNION ALL
import os
import json
import math
from flask import Blueprint, request, jsonify
from db.neo4j_connector import neo4j

# Load city coordinates
# Define the path to the city coordinates JSON file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define the path to the city coordinates JSON file
CITY_COORDS_PATH = os.path.join(BASE_DIR, '..', 'data', 'city_coords.json')

# Load the city coordinates from the JSON file
with open(CITY_COORDS_PATH, 'r', encoding='utf-8') as f:
    city_coords = json.load(f)

# Load ICD Names
# Define the path to the ICD names JSON file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define the path to the ICD names JSON file
ICD_NAMES_PATH = os.path.join(BASE_DIR, '..', 'data', 'icd_names.json')

# Load the ICD names from the JSON file
with open(ICD_NAMES_PATH, 'r', encoding='utf-8') as f:
    icd_names = json.load(f)


search_bp = Blueprint("search", __name__)


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def calculate_within_radius(center, radius_km, locations):
    lat1, lon1 = float(center[0]), float(center[1])
    result = []
    for loc in locations:
        lat2 = loc.get("lat")
        lon2 = loc.get("lon")
        if lat2 is None or lon2 is None:
            continue
        try:
            lat2 = float(lat2)
            lon2 = float(lon2)
        except ValueError:
            continue
        dist = haversine_distance(lat1, lon1, lat2, lon2)
        if dist <= radius_km:
            loc["distance_km"] = round(dist, 2)
            result.append(loc)
    return result


def run_query_if_enabled(label, query, enabled):
    if enabled:
        result = neo4j.run_query(query)
        return [record.data() for record in result]
    return []

# Search endpoint
# This endpoint retrieves provider locations based on various filters and a specified radius around a city.
@search_bp.route("/A", methods=["GET"])
def get_provider_latlons():
    # Input
    clinic = request.args.get("clinic", "false") == "true"
    mvz = request.args.get("mvz", "false") == "true"
    onkologie = request.args.get("onkologie", "false") == "true"
    neurologie = request.args.get("neurologie", "false") == "true"
    asv = request.args.get("asv", "false") == "true"
    niedergelasseneArzt = request.args.get("niedergelasseneArzt", "false") == "true"
    cooperation = request.args.get("cooperation", "false") == "true"
    
    city = request.args.get("city", "").lower()
    radius = float(request.args.get("radius", 20))
    center = city_coords.get(city)
    if not center:
        return jsonify({"error": "Unknown city"}), 400
    
    focus = [] # List to hold specialties(onkologie, neurologie)
    if onkologie:
        focus.append("Onkologie")
    if neurologie:
        focus.append("Neurologie")

    formatted_focus = ", ".join([f'"{f}"' for f in focus])
    specialty_filter = f"AND ANY(sp IN p.specialty WHERE sp IN [{formatted_focus}])" if focus else ""

    all_locations = []

    # Individual queries
    if clinic:
        clinic_query = f'''
        MATCH (p:Clinic)-[:HAS_LOCATION]->(l:Location)
        WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
        {specialty_filter}

        OPTIONAL MATCH (icd1:E_ICD)-[r1:WIRD_BEHANDELT_IN]->(p)
        WHERE "Onkologie" IN icd1.specialty

        OPTIONAL MATCH (icd2:E_ICD)-[r2:WIRD_BEHANDELT_IN]->(p)
        WHERE "Neurologie" IN icd2.specialty

        WITH p, l,
            SUM(COALESCE(r1.total, 0)) AS fallzahlOnkologie,
            SUM(COALESCE(r2.total, 0)) AS fallzahlNeurologie

        RETURN DISTINCT "Clinic" AS type,
            l.lat AS lat, l.lon AS lon, p.name AS name, l.city AS city, l.address AS address,
            p.number_of_bed AS number_of_bed, p.chefarzt AS chefarzt, p.specialty AS specialty, p.website AS website,
            fallzahlOnkologie, fallzahlNeurologie, NULL AS total_icd_fallzahl, p.year AS year
        '''

        all_locations += run_query_if_enabled("Clinic", clinic_query, True)


    if mvz:# MVZ (Medizinische Versorgungszentren)
        # MVZ query with specialty filter
        mvz_query = f'''
        MATCH (p:MVZ)-[:HAS_LOCATION]->(l:Location)
        WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
        {specialty_filter}
        RETURN DISTINCT "MVZ" AS type, l.lat AS lat, l.lon AS lon, p.name AS name, l.city AS city, l.address AS address,
               p.number_of_bed AS number_of_bed, p.chefarzt AS chefarzt, p.specialty AS specialty, p.website AS website,
               NULL AS total_icd_fallzahl, p.fallzahlOnkologie AS fallzahlOnkologie, p.fallzahlNeurologie AS fallzahlNeurologie
        '''
        all_locations += run_query_if_enabled("MVZ", mvz_query, True)

    if asv:# ASV (Ambulante spezialfachärztliche Versorgung)
        # ASV query with specialty filter
        asv_query = f'''
        MATCH (p:ASV)-[:HAS_LOCATION]->(l:Location)
        WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
        {specialty_filter}
        RETURN DISTINCT "ASV" AS type, l.lat AS lat, l.lon AS lon, p.name AS name, l.city AS city, l.address AS address,
               p.number_of_bed AS number_of_bed, p.chefarzt AS chefarzt, p.specialty AS specialty, p.website AS website,
               NULL AS total_icd_fallzahl, p.fallzahlOnkologie AS fallzahlOnkologie, p.fallzahlNeurologie AS fallzahlNeurologie
        '''
        all_locations += run_query_if_enabled("ASV", asv_query, True)

    if niedergelasseneArzt:# Niedergelassene Ärzte(Neurologen, Onkologen)
        if onkologie:
            onko_query = '''
            MATCH (p:Onkologen)-[:HAS_LOCATION]->(l:Location)
            WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
            RETURN DISTINCT "Onkologen" AS type, l.lat AS lat, l.lon AS lon, p.name AS name, l.city AS city, l.address AS address,
                   p.number_of_bed AS number_of_bed, p.chefarzt AS chefarzt, p.specialty AS specialty, p.website AS website,
                   NULL AS total_icd_fallzahl, p.fallzahlOnkologie AS fallzahlOnkologie, p.fallzahlNeurologie AS fallzahlNeurologie
            '''
            all_locations += run_query_if_enabled("Onkologen", onko_query, True)

        if neurologie:
            neuro_query = '''
            MATCH (p:Neurologen)-[:HAS_LOCATION]->(l:Location)
            WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
            RETURN DISTINCT "Neurologen" AS type, l.lat AS lat, l.lon AS lon, p.name AS name, l.city AS city, l.address AS address,
                   p.number_of_bed AS number_of_bed, p.chefarzt AS chefarzt, p.specialty AS specialty, p.website AS website,
                   NULL AS total_icd_fallzahl, p.fallzahlOnkologie AS fallzahlOnkologie, p.fallzahlNeurologie AS fallzahlNeurologie
            '''
            all_locations += run_query_if_enabled("Neurologen", neuro_query, True)

    # Filter by radius
    filtered_locations = calculate_within_radius(center, radius, all_locations)
    selected_nodes = [{"name": loc["name"], "label": loc["type"]} for loc in filtered_locations if isinstance(loc.get("name"), str)]

    coop_data = [] # Initialize cooperation data
    # If cooperation is enabled, run the cooperation query
    if cooperation and selected_nodes:
        coop_query = '''
        UNWIND $selected AS item
        CALL {
            WITH item
            MATCH (a)
            WHERE item.label IN labels(a) AND a.name = item.name
            MATCH (a)-[:HAS_KOOPERIERT_MIT]->(b)-[:HAS_LOCATION]->(loc2:Location)
            MATCH (a)-[:HAS_LOCATION]->(loc1:Location)
            RETURN DISTINCT
                a.name AS source_name, labels(a)[0] AS source_type, a.specialty AS source_specialty,
                loc1.lat AS source_lat, loc1.lon AS source_lon,
                b.name AS target_name, labels(b)[0] AS target_type, b.specialty AS target_specialty, b.address AS target_address,
                b.city AS target_city, b.fallzahlOnkologie AS fallzahlOnkologie, b.fallzahlNeurologie AS fallzahlNeurologie, b.website AS website,
                loc2.lat AS target_lat, loc2.lon AS target_lon
        }
        RETURN *
        '''
        coop_result = neo4j.run_query(coop_query, parameters={"selected": selected_nodes})
        coop_data = [record.data() for record in coop_result]
        for record in coop_data:
            target_entry = {
                "name": record["target_name"], "type": record["target_type"],
                "lat": record["target_lat"], "lon": record["target_lon"],
                "address": record["target_address"], "city": record["target_city"],
                "specialty": record.get("target_specialty"),
                "fallzahlOnkologie": record.get("fallzahlOnkologie"),
                "fallzahlNeurologie": record.get("fallzahlNeurologie"),
                "website": record.get("website"), "distance_km": None
            }
            already_exists = any(
                loc["name"] == target_entry["name"] and loc["address"] == target_entry["address"]
                for loc in filtered_locations)
            if not already_exists:
                filtered_locations.append(target_entry)
    # Top ICD Codes
    top_icds_data = [] # Initialize top ICD data
    # If focus specialties are provided, run the top ICD query
    if focus:
        top_icd_query = f'''
        MATCH (icd:E_ICD)
        WHERE ANY(sp IN icd.specialty WHERE sp IN [{formatted_focus}])
        RETURN icd.name AS code, icd.total_fallzahl AS total
        ORDER BY total DESC
        LIMIT 3
        '''
        result = neo4j.run_query(top_icd_query)
        top_icds = [record.data() for record in result]

        for item in top_icds:
            code = item["code"]
            name_entry = icd_names.get(code, {})
            display_name = name_entry.get("common_term") or name_entry.get("name") or code
            top_icds_data.append({
                "code": code,
                "total": item["total"],
                "name": display_name
            })

    

    return jsonify({"providers": filtered_locations, "cooperations": coop_data,
                     "center": {"lat": center[0], "lon": center[1]}, "top_icds": top_icds_data})

