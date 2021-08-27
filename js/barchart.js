import { numMap } from "./constants.js";

// Prototypes and Functions
/**
 * Returns the sum of an array.
 */
Array.prototype.sum = function() {
  return this.reduce(function(a, b) {
    return parseFloat(a) + parseFloat(b);
  }, 0);
};

/**
 * Returns the cumulative sum of an array.
 */
Array.prototype.cumulativeSum = function() {
  var cumulativeSum = (function(sum) {
    return function(value) {
      return (sum += parseFloat(value));
    };
  })(0);
  return this.map(cumulativeSum);
};

/**
 * Takes in multiple arrays and returns their contents zipped together.
 */
function zip(arrays) {
  return arrays[0].map(function(_, i) {
    return arrays.map(function(array) {
      return array[i];
    });
  });
}

// Doses Administered
var data_path = "doses.csv";
d3.csv(data_path).then(function(dose_data) {
  dose_data = clean_and_cast_data(dose_data);
  var zipped_data = prep_data_for_chart(dose_data);

  // bar chart creation
  var width = "100%";
  var height = 120;

  var chart = d3
    .select("#dose-chart")
    .attr("width", width)
    .attr("height", height);

  var bar = chart
    .selectAll("g")
    .data(zipped_data)
    .enter()
    .append("g");

  // Background colors for the bars
  var doseLabels = dose_data.map(function(obj) {
    return obj["label"];
  });

  var doseColors = [
    "rgba(174, 215, 228, 1)",
    "rgba(108, 179, 216, 1)",
    "rgba(13, 94, 181, 1)"
  ];
  var colormap = d3
    .scaleOrdinal()
    .domain(doseLabels)
    .range(doseColors);

  add_bar_rects(bar, height, colormap);
  add_bar_counts(bar, height);
  add_bar_labels(bar, colormap);
});

function clean_and_cast_data(data) {
  data = data.slice(0, data.length - 1);
  data.forEach(function(d) {
    d["doses"] = +d["doses"];
  });

  return data;
}

/**
 * Creates an array where each index of the array will have an object with
 * key/value pairs.
 */
function prep_data_for_chart(data) {
  var doseCounts = data.map(function(obj) {
    return obj["doses"];
  });
  var doseLabels = data.map(function(obj) {
    return obj["label"];
  });

  var doseCumulative = doseCounts.cumulativeSum();
  var dosePercent = doseCounts.map(function(d) {
    return (100 * d) / doseCounts.sum();
  });

  // doseCumPercent is a normal cumulative percent
  var doseCumPercent = dosePercent.cumulativeSum();
  // doseCumLeftPercent is the like cumulative percent but shifted down one index
  // it starts at zero and only goes to the index before to actual cumulative
  var doseCumLeftPercent = doseCumPercent.slice(0, doseCumPercent.length - 1);
  doseCumLeftPercent.splice(0, 0, 0);

  // key/value lists for the zipped data
  var datasetsKeys = [
    "counts",
    "cum",
    "label",
    "percent",
    "cumPercent",
    "cumLeftPercent"
  ];
  var datasetsValues = zip([
    doseCounts,
    doseCumulative,
    doseLabels,
    dosePercent,
    doseCumPercent,
    doseCumLeftPercent
  ]);

  // zip the data so you have an array of maps/objects/dicts
  var zipped_data = datasetsValues.map(function(values) {
    return Object.fromEntries(zip([datasetsKeys, values]));
  });

  return zipped_data;
}

/**
 * Adds the rectangular areas to the svg.
 */
function add_bar_rects(bar, height, colormap) {
  bar
    .append("rect")
    .attr("width", function(d) {
      return d.percent + "%";
    })
    .attr("x", function(d) {
      return d.cumLeftPercent + "%";
    })
    .attr("y", height / 3.5)
    .attr("height", height / 3)
    .attr("fill", function(d) {
      return colormap(d.counts);
    });
}

/**
 * Adds the dose counts to the svg.
 */
function add_bar_counts(bar, height) {
  bar
    .append("text")
    .attr("x", function(d, idx) {
      if (idx == 0) {
        return d.cumLeftPercent + "%";
      } else {
        return d.cumPercent + "%";
      }
    })
    .attr("y", (height / 3) * 2)
    .attr("dy", "0.50em")
    .style("fill", "#999999")
    .attr("text-anchor", function(d, idx) {
      if (idx == 0) {
        return "start";
      } else {
        return "end";
      }
    })
    .text(function(d, idx) {
      if (idx == 0) {
        return numMap.FORMAT.SI_3(d.cum);
      } else {
        if (d.cum > 9999999) {
          return numMap.FORMAT.SI_3(d.cum);
        } else {
          return numMap.FORMAT.SI_2(d.cum);
        }
      }
    });
}

/**
 * Adds the dose labels to the svg.
 */
function add_bar_labels(bar) {

}
