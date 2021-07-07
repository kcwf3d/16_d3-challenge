
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};


var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var chart = d3.select('#scatter')
    .append('div')
    .classed('chart', true);

var svg = chart.append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

//Append an svg group
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

//Initial Params
var chosenXAxis = 'poverty';
var chosenYAxis = 'healthcare';

//function used for updating x-scale var upon click on axis label
function xScale(lifeData, chosenXAxis) {
    //create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(lifeData, d => d[chosenXAxis]) * 0.8,
        d3.max(lifeData, d => d[chosenXAxis]) * 1.2])
        .range([0, width]);

    return xLinearScale;
}
//function used for updating x-scale var upon click on axis label
function yScale(lifeData, chosenYAxis) {
    //create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(lifeData, d => d[chosenYAxis]) * 0.8,
        d3.max(lifeData, d => d[chosenYAxis]) * 1.2])
        .range([height, 0]);

    return yLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr('cx', d => newXScale(d[chosenXAxis]))
        .attr('cy', d => newYScale(d[chosenYAxis]))

    return circlesGroup;
}

function renderStateText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr('x', d => newXScale(d[chosenXAxis]))
        .attr('y', d => newYScale(d[chosenYAxis]));

    return textGroup
}
//function for tooltip x-axis values
function XtoolTip(value, chosenXAxis) {

    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    else if (chosenXAxis === 'income') {
        return `${value}`;
    }
    else {
        return `${value}`;
    }
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === 'poverty') {
        var xLabel = 'Poverty:';
    }
    else if (chosenXAxis === 'income') {
        var xLabel = 'Median Income:';
    }
    else {
        var xLabel = 'Age:';
    }
    if (chosenYAxis === 'healthcare') {
        var yLabel = "Lack Healthcare:"
    }
    else if (chosenYAxis === 'obesity') {
        var yLabel = 'Obesity:';
    }
    else {
        var yLabel = 'Smokers:';
    }

    //create tooltip
    var toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-8, 0])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${XtoolTip(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
        });

    circlesGroup.call(toolTip);
    
    circlesGroup.on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);

    return circlesGroup;
}
//Retrieve data from the CSV file and execute everything below
d3.csv('./assets/data/data.csv').then(function (lifeData, err) {
    if (err) throw err;

    // parse data
    lifeData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(lifeData, chosenXAxis);
    var yLinearScale = yScale(lifeData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append('g')
        .classed('y-axis', true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(lifeData)
        .enter()
        .append('circle')
        .classed('stateCircle', true)
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', 17)
        .attr("fill", "pink")
        .attr('opacity', '.5');

    //append Initial Text
    var textGroup = chartGroup.selectAll('.stateText')
        .data(lifeData)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis]))
        .attr('dy', 3)
        .attr('font-size', '10px')
        .text(function (d) { return d.abbr });

    //create a group for the x axis labels
    var xLabelGroup = chartGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povLabel = xLabelGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .text('In Poverty (%)');

    var ageLabel = xLabelGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')
        .text('Age (Median)');

    var incomeLabel = xLabelGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')
        .text('Household Income (Median)')

    //create a group for Y labels
    var yLabelGroup = chartGroup.append('g')
        .attr('transform', `translate(${0 - margin.left / 4}, ${height / 2})`);

    var healthCareLabel = yLabelGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 0 - 20)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'healthcare')
        .text('Lack Healthcare (%)');

    var smokersLabel = yLabelGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 40)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'smokes')
        .text('Smokers (%)');

    var obeseLabel = yLabelGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 60)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'obesity')
        .text('Obesity (%)');

    //update the toolTip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //x axis event listener
    xLabelGroup.selectAll('text')
        .on('click', function () {
            var value = d3.select(this).attr('value');

            if (value != chosenXAxis) {

                //replace chosen x with a value
                chosenXAxis = value;

                //update x for new data
                xLinearScale = xScale(lifeData, chosenXAxis);

                //update x 
                xAxis = renderXAxis(xLinearScale, xAxis);

                //upate circles with a new x value
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update text 
                textGroup = renderStateText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update tooltip
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                //change of classes changes text
                if (chosenXAxis === 'poverty') {
                    povLabel.classed('active', true).classed('inactive', false);
                    ageLabel.classed('active', false).classed('inactive', true);
                    incomeLabel.classed('active', false).classed('inactive', true);
                }
                else if (chosenXAxis === 'age') {
                    povLabel.classed('active', false).classed('inactive', true);
                    ageLabel.classed('active', true).classed('inactive', false);
                    incomeLabel.classed('active', false).classed('inactive', true);
                }
                else {
                    povLabel.classed('active', false).classed('inactive', true);
                    ageLabel.classed('active', false).classed('inactive', true);
                    incomeLabel.classed('active', true).classed('inactive', false);
                }
            }
        });
    //y axis lables event listener
    yLabelGroup.selectAll('text')
        .on('click', function () {
            var value = d3.select(this).attr('value');

            if (value != chosenYAxis) {
                //replace chosenY with value  
                chosenYAxis = value;

                //update Y scale
                yLinearScale = yScale(lifeData, chosenYAxis);

                //update Y axis 
                yAxis = renderYAxis(yLinearScale, yAxis);

                //Udate CIRCLES with new y
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update TEXT with new Y values
                textGroup = renderStateText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update tooltips
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                //Change of the classes changes text
                if (chosenYAxis === 'obesity') {
                    obeseLabel.classed('active', true).classed('inactive', false);
                    smokersLabel.classed('active', false).classed('inactive', true);
                    healthCareLabel.classed('active', false).classed('inactive', true);
                }
                else if (chosenYAxis === 'smokes') {
                    obeseLabel.classed('active', false).classed('inactive', true);
                    smokersLabel.classed('active', true).classed('inactive', false);
                    healthCareLabel.classed('active', false).classed('inactive', true);
                }
                else {
                    obeseLabel.classed('active', false).classed('inactive', true);
                    smokersLabel.classed('active', false).classed('inactive', true);
                    healthCareLabel.classed('active', true).classed('inactive', false);
                }
            }
        });
});