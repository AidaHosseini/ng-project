import React, { useState, useEffect } from "react";
import SearchForm from "./SearchForm";

const GraphView = () => {
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    if (graphData.length > 0) {
      console.log("Updated Graph Data:", graphData);

      // ✅ Force refresh of the GraphXR iframe
      const iframe = document.getElementById("graphxr-frame");
      if (iframe) {
        iframe.src = iframe.src + "?refresh=" + new Date().getTime();
      }
    }
  }, [graphData]);

  return (
    <div>
      <SearchForm setGraphData={setGraphData} />  
      <iframe
        id="graphxr-frame"
        src="https://graphxr.kineviz.com/p/67927d2d878e960e37541211/New-Ways-of-Care-Provision-and-Analysis-of-Patient-Flows"
        width="100%"
        height="600px"
        title="GraphXR Visualization"
      ></iframe>
    </div>
  );
};

export default GraphView;
