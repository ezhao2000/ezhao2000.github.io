// Fetch the data from the CSV file
d3.csv("data/data.csv").then(function (data) {
    // Parse the dates and prices
    const parseDate = d3.timeParse("%Y-%m");
    data.forEach(function (d) {
      d.Month = parseDate(d.Month);
      d.Price = +d.Price;
    });
  
    // Set up the SVG element and scales
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
  
    // Line generator
    const line = d3
      .line()
      .x((d) => xScale(d.Month))
      .y((d) => yScale(d.Price));
  
    // Append the line path
    const linePath = svg
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);
  
    // Append the axes
    svg.append("g").attr("class", "x-axis").attr("transform", "translate(0," + height + ")");
  
    svg.append("g").attr("class", "y-axis");
  
    // Add x-axis label
    svg.append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 30)
      .style("text-anchor", "middle")
      .text("Year");
  
    // Add y-axis label
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
            xOffset: -10, // Custom X offset for annotation
            yOffset: 0, // Custom Y offset for annotation
            showCircle: true,
            circleX: -6, // Custom X-position for the circle
            circleY: 12,
            
          },
          {
            date: new Date("2003-10"),
            value: 12.42,
            text: "Hurricane Katrina and Rita disrupt supply from Gulf of Mexico",
            xOffset: -45, // Custom X offset for annotation
            yOffset: -30, // Custom Y offset for annotation
            showCircle: true,
            circleX: 147, // Custom X-position for the circle
            circleY: -28,
          },
          // Add any other annotations specific to the first tab here
        ],
      },
      {
        tab: "secondTab",
        data: [
          {
            date: new Date("2011-01"),
            value: 13,
            text: "Hurricane Gustav and Ike disrupt supply from Gulf of Mexico",
            xOffset: -22, // Custom X offset for annotation
            yOffset: 13, // Custom Y offset for annotation
            showCircle: true,
            circleX: -212, // Custom X-position for the circle
            circleY: 9,
          },
          // Add any other annotations specific to the second tab here
        ],
      },
      {
        tab: "thirdTab",
        data: [
          {
            date: new Date("2020-01"),
            value: 7.5,
            text: "Russia Invades Ukraine causing volatility in global natural gas markets",
            xOffset: 60, // Custom X offset for annotation
            yOffset: -60, // Custom Y offset for annotation
            showCircle: true,
            circleX: 273, // Custom X-position for the circle
            circleY: -57,
          },
          // Add any other annotations specific to the third tab here
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
  
        // Add the annotation text above the lines with custom offsets
        svg
          .append("text")
          .attr("class", "annotation-text")
          .attr("x", xValue + annotation.xOffset)
          .attr("y", yValue + annotation.yOffset)
          .style("text-anchor", "middle")
          .text(annotation.text);
  
       
      // Draw the circle if showCircle is true for this annotation
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

    // Remove any existing footnote
  svg.selectAll(".footnote").remove();

  // Add the footnote text at the bottom of the plot
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

    // Function to get the appropriate footnote text based on the selected tab
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
      // Update scales domain based on the filtered data
      xScale.domain(d3.extent(filteredData.data, (d) => d.Month));
      yScale.domain([0, d3.max(filteredData.data, (d) => d.Price)]);
  
      // Update the line path
      linePath.datum(filteredData.data).attr("d", line);
  
      // Select and join data for circles (points)
      const circles = svg.selectAll("circle").data(filteredData.data);
  
      // Remove old data points
      circles.exit().remove();
  
      // Add new data points
      circles
        .enter()
        .append("circle")
        .merge(circles)
        .transition()
        .duration(500)
        .attr("cx", (d) => xScale(d.Month))
        .attr("cy", (d) => yScale(d.Price))
        .attr("r", 0) // Reduce the radius to make the points smaller
        .attr("fill", "steelblue");
  
      // Update axes
      svg.select(".x-axis").call(d3.axisBottom(xScale));
      svg.select(".y-axis").call(d3.axisLeft(yScale));
  
      // Add the annotations
      drawAnnotations(filteredData);
    }
  
    // Function to filter data based on the selected range
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
  
    // Event listener for button clicks
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
            // If "Full Data" tab is selected, hide the footnote
            svg.selectAll(".footnote").remove();
            updateLineplot(filteredData);
          } else {
        updateLineplot(filteredData);
          }
      });
    });
  
    // Initial line plot with first tab's data (1997-2006)
    const firstTabData = { tab: "firstTab", data: filterDataByRange("1997-2006") };
    const secondTabData = { tab: "secondTab", data: filterDataByRange("2007-2015") };
    const thirdTabData = { tab: "thirdTab", data: filterDataByRange("2016-2022") };
    updateLineplot(firstTabData);
  });
  