MATCH (i:N_ICD)-[:WIRD_BEHANDELT_IN]->(c:Clinic)
RETURN i, c;


