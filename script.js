
d3.csv("data/data.csv").then(function (data) {
    // Parse the dates and prices
    const parseDate = d3.timeParse("%Y-%m");
    data.forEach(function (d) {
      d.Month = parseDate(d.Month);
      d.Price = +d.Price;
    });
  

    const margin = { top: 50, right: 50, bottom: 70, left: 70 };
    const width = 850 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    const svg = d3
      .select(".lineplot")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    const xScale = d3.scaleTime().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);
  
    
    const line = d3
      .line()
      .x((d) => xScale(d.Month))
      .y((d) => yScale(d.Price));
  
 
    const linePath = svg
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);
  
 
    svg.append("g").attr("class", "x-axis").attr("transform", "translate(0," + height + ")");
  
    svg.append("g").attr("class", "y-axis");
  
    
    svg.append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 30)
      .style("text-anchor", "middle")
      .text("Year");
  
  
    svg.append("text")
      .attr("class", "y-axis-label")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("dy", "1em") // Adjust the vertical position
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Price (USD per mmBtu)");
  
    // Create a common annotations array with tab information
    const annotations = [
      {
        tab: "firstTab",
        data: [
          {
            date: new Date("2001-01"),
            value: 9.3,
            text: "Low supply and high demand due to unusually cold weather",
            xOffset: -10, 
            yOffset: 0, 
            showCircle: true,
            circleX: -6, 
            circleY: 12,
            
          },
          {
            date: new Date("2003-10"),
            value: 12.42,
            text: "Hurricane Katrina and Rita disrupt supply from Gulf of Mexico",
            xOffset: -45,
            yOffset: -30, 
            showCircle: true,
            circleX: 147, 
            circleY: -28,
          },
          
        ],
      },
      {
        tab: "secondTab",
        data: [
          {
            date: new Date("2011-01"),
            value: 13,
            text: "Hurricane Gustav and Ike disrupt supply from Gulf of Mexico",
            xOffset: -22,
            yOffset: 13, 
            showCircle: true,
            circleX: -212, 
            circleY: 9,
          },
          
        ],
      },
      {
        tab: "thirdTab",
        data: [
          {
            date: new Date("2020-01"),
            value: 7.5,
            text: "Russia Invades Ukraine causing volatility in global natural gas markets",
            xOffset: 60, 
            yOffset: -60, 
            showCircle: true,
            circleX: 273,
            circleY: -57,
          },
    
        ],
      },
    ];
  
    function drawAnnotations(filteredData) {
      // Remove any existing annotations if the data changes
      svg.selectAll(".annotation-line").remove();
      svg.selectAll(".annotation-text").remove();
  
      // Filter annotations based on the selected tab's data
      const filteredAnnotations = annotations.find(
        (annotationData) => annotationData.tab === filteredData.tab
      ).data;
  
      filteredAnnotations.forEach((annotation) => {
        const xValue = xScale(annotation.date);
        const yValue = yScale(annotation.value);
  
     
        svg
          .append("text")
          .attr("class", "annotation-text")
          .attr("x", xValue + annotation.xOffset)
          .attr("y", yValue + annotation.yOffset)
          .style("text-anchor", "middle")
          .text(annotation.text);
  
       

      if (annotation.showCircle) {
        svg
          .append("circle")
          .attr("class", "annotation-circle")
          .attr("cx", xValue + annotation.circleX)
          .attr("cy", yValue + annotation.circleY)
          .attr("r", 7)
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-width", 2);
      }


  svg.selectAll(".footnote").remove();


  svg
    .append("text")
    .attr("class", "footnote")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom -5 )
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text(getFootnoteText(filteredData.tab));

      
      });
    }

  
function getFootnoteText(tab) {
    switch (tab) {
      case "firstTab":
        return "Natural Gas is a key resource necessary for the world to function. But why do prices sometimes fluctuate so drastically?";
      case "secondTab":
        return "Sometimes things out of anyone's control happen, such as natural disasters.";
      case "thirdTab":
        return "Or major world events occur and affects prices.";
      default:
        return "";
    }
  }
  
    function updateLineplot(filteredData) {

      xScale.domain(d3.extent(filteredData.data, (d) => d.Month));
      yScale.domain([0, d3.max(filteredData.data, (d) => d.Price)]);
  
   
      linePath.datum(filteredData.data).attr("d", line);
  
     
      const circles = svg.selectAll("circle").data(filteredData.data);
  
     
      circles.exit().remove();
  
     
      circles
        .enter()
        .append("circle")
        .merge(circles)
        .transition()
        .duration(500)
        .attr("cx", (d) => xScale(d.Month))
        .attr("cy", (d) => yScale(d.Price))
        .attr("r", 0) 
        .attr("fill", "steelblue");
  
      
      svg.select(".x-axis").call(d3.axisBottom(xScale));
      svg.select(".y-axis").call(d3.axisLeft(yScale));
  
    
      drawAnnotations(filteredData);
    }
  
    
    function filterDataByRange(range) {
      if (range === "full-data") {
        return data;
      } else {
        const [startYear, endYear] = range.split("-");
        return data.filter(function (d) {
          const year = d.Month.getFullYear();
          return year >= parseInt(startYear) && year <= parseInt(endYear);
        });
      }
    }
  

    const dataButtons = document.querySelectorAll(".data-btn");
    dataButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const selectedRange = this.getAttribute("data-range");
        let filteredData;
  
        if (selectedRange === "1997-2006") {
          filteredData = { tab: "firstTab", data: filterDataByRange("1997-2006") };
        } else if (selectedRange === "2007-2015") {
          filteredData = { tab: "secondTab", data: filterDataByRange("2007-2015") };
        } else if (selectedRange === "2016-2022") {
          filteredData = { tab: "thirdTab", data: filterDataByRange("2016-2022") };
        } else {
          filteredData = { tab: "fullData", data: data };
        }
        if (selectedRange === "full-data") {
           
            svg.selectAll(".footnote").remove();
            updateLineplot(filteredData);
          } else {
        updateLineplot(filteredData);
          }
      });
    });
  
    
    const firstTabData = { tab: "firstTab", data: filterDataByRange("1997-2006") };
    const secondTabData = { tab: "secondTab", data: filterDataByRange("2007-2015") };
    const thirdTabData = { tab: "thirdTab", data: filterDataByRange("2016-2022") };
    updateLineplot(firstTabData);
  });
  
