from flask import Blueprint, request, jsonify
from db.neo4j_connector import neo4j
import json 

# Create a Blueprint for the search endpoint
search_bp = Blueprint("search", __name__)

@search_bp.route("/", methods=["GET"])
def search():
    """
    Handles API requests for searching medical providers (Clinics, MVZ, Neurologists, Oncologists)
    based on city, ICD codes, and provider types.
    """

    # Extracting query parameters from the request
    city = request.args.get("city", "").strip() # City name
    icd_code = request.args.get("icd_code", "").strip() # ICD code
    radius = request.args.get("radius", "30")  # Default search radius (not implemented yet)

    # Boolean flags to determine which provider types should be included in the search
    onkologen = request.args.get("onkologen", "false") == "true"
    neurologen = request.args.get("neurologen", "false") == "true"
    providers = request.args.getlist("providers")  # List of selected provider types
    cooperation = request.args.get("cooperation", "false") == "true"
    mvz = request.args.get("mvz", "false") == "true"
    asv = request.args.get("asv", "false") == "true"    
    #arzt = request.args.get("arzt", "false") == "true"
    clinic = request.args.get("clinic", "false") == "true"

    print(f"🔵 API Request: City={city}, ICD={icd_code}, Radius={radius}, Providers: Clinic={clinic}, MVZ={mvz}, ASV={asv}, Neurologen={neurologen}, Onkologen={onkologen}, Cooperation={cooperation}")
    if city is None or city == "":
        return jsonify({"error": "Please enter your city"}), 400
    

 # ✅ Rule 1: Only ONE from (Neurologen, Onkologen) can be selected
    if neurologen == True and onkologen == True :
        return jsonify({"error": "You can select either Neurologen OR Onkologen, not both"}), 400

    # ✅ Rule 2: Clinic, MVZ, and ASV can be selected together
    provider_selected = any([clinic, mvz, asv])

    # # ✅ Rule 3: Ensure at least one selection from Neurologen/Onkologen or Clinic/MVZ/ASV
    # if not (neurologen or onkologen or provider_selected):
    #     return jsonify({"error": "Please select at least one provider type"}), 400

    
    # If no provider type is selected, default to searching for clinics
    if mvz==False and asv==False and clinic==False and onkologen==False and neurologen==False:
        clinic = True
        print("clinic&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", clinic)
        # print("🔴 Error: No provider type selected")
        # return jsonify({"error": "No provider type selected"}), 400


    # Initialize query filters and parameters
    where_clauses = []
    params = {}

    # Apply city filter if provided
    if city and city is not None:
        if neurologen and neurologen == True:
            where_clauses.append("n.city = $city")
        elif onkologen and onkologen == True:
            where_clauses.append("o.city = $city")
        elif mvz and mvz == True:
            where_clauses.append("m.city = $city")
        
        # elif asv and asv == True:
        #     where_clauses.append("a.city = $city")
        else:
            where_clauses.append("c.city = $city")
        params["city"] = city


    # Apply ICD code filter if provided
    if icd_code and icd_code is not None:
        print("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", icd_code)
        where_clauses.append("i.name = $icd_code")
        params["icd_code"] = icd_code

    
    # Dynamically create MATCH statements based on selected provider types
    match_statements = []
    if clinic == True:
        match_statements.append("MATCH (i:ICD)-[:WIRD_BEHANDELT_IN]->(c:Clinic)")
        
    if mvz == True:
        match_statements.append("MATCH (i:ICD)-[:WIRD_BEHANDELT_IN]->(m:MVZ)")
    if neurologen == True:
        match_statements.append("MATCH (i:ICD)-[:WIRD_BEHANDELT_IN]->(n:Neurologen)")
    if onkologen == True: 
        match_statements.append("MATCH (i:ICD)-[:WIRD_BEHANDELT_IN]->(o:Onkologen)")
    # if asv ==  True:
    #     match_statements.append("MATCH (i:ICD)-[:WIRD_BEHANDELT_IN]->(m:MVZ)")

    # Combine match statements into a single Cypher query section
    match_clause = "\n".join(match_statements)

    # If filters exist, construct a WHERE clause
    where_clause = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""

    # Dynamically build the RETURN statement for selected provider types
    return_statements = []   
    

    
    if icd_code and icd_code is not None:
        print("&&&&&&&&&&&&&&&&&&&&&&&&&&&&1234455")
        return_statements.extend([
         "i.name AS icd_name",  # Always return ICD name
         "i.fallzahl AS icd_fallzahl"  # Always return ICD case count
     ])

    if clinic:
        return_statements.extend([
            "c.name AS clinic_name",
            "c.identity AS clinic_identity",
            "c.city AS clinic_city",
            "COALESCE(c.address, 'Unknown Address') AS clinic_address",  # Ensure address is never null
            "c.latitude AS clinic_latitude",
            "c.longitude AS clinic_longitude",
            "c.number_of_bed AS clinic_number_of_beds",
            "c.cooperation AS clinic_cooperation",
            "c.chefarzt AS clinic_chefarzt"
        ])
    if mvz:
        return_statements.extend([
            "m.name AS mvz_name",
            "m.city AS mvz_city",
            "COALESCE(m.address, 'Unknown Address') AS mvz_address",
            "m.schwerpunkte AS mvz_schwerpunkte",
            "m.latitude AS mvz_latitude",
            "m.longitude AS mvz_longitude"
        ])
    if neurologen:
        return_statements.extend([
            "n.name AS neurologe_name",
            "n.city AS neurologe_city",
            "COALESCE(n.address, 'Unknown Address') AS neurologe_address",
            "n.schwerpunkte AS neurologe_schwerpunkte",
            "n.latitude AS neurologe_latitude",
            "n.longitude AS neurologe_longitude"
        ])
    if onkologen:
        return_statements.extend([
            "o.name AS onkologe_name",
            "o.city AS onkologe_city",
            "COALESCE(o.address, 'Unknown Address') AS onkologe_address",
            "o.schwerpunkte AS onkologe_schwerpunkte",
            "o.latitude AS onkologe_latitude",
            "o.longitude AS onkologe_longitude"
        ])

    # Combine the RETURN statements
    return_clause = "RETURN " + ", ".join(return_statements)

    # Final Query Assembly
    query = f"""
    {match_clause}
    {where_clause}
    {return_clause}
    """

    # Log the generated query
    print(f"🔵 Generated Query:\n{query}")

    # Execute the Neo4j query with parameters
    results = neo4j.run_query(query, params)

    # Format results into a JSON-friendly structure
    formatted_results = []
    for record in results:
        entry ={}
        if icd_code and icd_code is not None:
            entry.update ({
                 "icd_name": record.get("icd_name"),
                 "icd_fallzahl": record.get("icd_fallzahl")
            })
        if clinic:
            entry.update({
                #"clinic_id": record.get("clinic_identity"),
                "clinic_name": record.get("clinic_name"),
                "clinic_identity": record.get("clinic_identity"),
                "clinic_city": record.get("clinic_city"),
                "clinic_address": record.get("clinic_address"),
                "clinic_latitude": record.get("clinic_latitude"),
                "clinic_longitude": record.get("clinic_longitude"),
                "clinic_number_of_beds": record.get("clinic_number_of_beds")
            })
        if mvz:
            entry.update({
                "mvz_name": record.get("mvz_name"),
                "mvz_city": record.get("mvz_city"),
                "mvz_address": record.get("mvz_address"),
                "mvz_schwerpunkte": record.get("mvz_schwerpunkte"),
                "mvz_latitude": record.get("mvz_latitude"),
                "mvz_longitude": record.get("mvz_longitude")
            })
        if neurologen:
            entry.update({
                "neurologe_name": record.get("neurologe_name"),
                "neurologe_city": record.get("neurologe_city"),
                "neurologe_address": record.get("neurologe_address"),
                "neurologe_schwerpunkte": record.get("neurologe_schwerpunkte"),
                "neurologe_latitude": record.get("neurologe_latitude"),
                "neurologe_longitude": record.get("neurologe_longitude")
            })
        if onkologen:
            entry.update({
                "onkologe_name": record.get("onkologe_name"),
                "onkologe_city": record.get("onkologe_city"),
                "onkologe_address": record.get("onkologe_address"),
                "onkologe_schwerpunkte": record.get("onkologe_schwerpunkte"),
                "onkologe_latitude": record.get("onkologe_latitude"),
                "onkologe_longitude": record.get("onkologe_longitude")
            })
        formatted_results.append(entry)

    # Return JSON response
    return json.dumps(formatted_results, ensure_ascii=False, indent=4), 200, {'Content-Type': 'application/json; charset=utf-8'}