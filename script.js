// Narrative Visualization Parameters
let currentScene = 0;
let happinessData = [];
let sceneData = [];

// Scene configurations
const scenes = [
    {
        id: 0,
        title: "The Happiest Nations in 2019",
        description: "Let's start by exploring the top 20 happiest countries according to the 2019 World Happiness Report. Nordic countries dominate the list with Finland, Denmark, Norway, Iceland, and Sweden in the top 20.",
        chartType: "topCountries"
    },
    {
        id: 1,
        title: "Does Money Buy Happiness?",
        description: "GDP per capita shows a strong correlation with happiness. However, one country that sticks out is Costa Rica(rank 12), which has lower GDP but higher happiness than many wealthier nations.",
        chartType: "gdpScatter"
    },
    {
        id: 2,
        title: "The Power of Social Support",
        description: "Social support also shows a strong correlation with happiness scores. Countries with stronger social networks tend to be happier, regardless of their economic status.",
        chartType: "socialSupport"
    },
    {
        id: 3,
        title: "Freedom and Happiness",
        description: "Freedom to make life choices shows a positive correlation with happiness. Countries where people feel they have more control over their lives tend to be happier.",
        chartType: "regionalMap"
    },
    {
        id: 4,
        title: "Explore All Countries",
        description: "Now you can explore all 156 countries in an interactive bar chart. Countries are sorted by happiness score, with the happiest countries at the top. Use the search box to filter and find specific countries - when you search, only matching countries will be displayed.",
        chartType: "interactive"
    }
];

// Initialize the visualization
async function init() {
    try {
        // Load the happiness data
        happinessData = await d3.csv('archive/2019.csv');
        
        // Convert string values to numbers
        happinessData.forEach(d => {
            d.Score = +d.Score;
            d['GDP per capita'] = +d['GDP per capita'];
            d['Social support'] = +d['Social support'];
            d['Healthy life expectancy'] = +d['Healthy life expectancy'];
            d['Freedom to make life choices'] = +d['Freedom to make life choices'];
            d['Generosity'] = +d['Generosity'];
            d['Perceptions of corruption'] = +d['Perceptions of corruption'];
        });
        
        // Initialize the first scene
        loadScene(0);
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('sceneContainer').innerHTML = 
            '<div style="text-align: center; padding: 50px;"><h2>Error Loading Data</h2><p>Please ensure the CSV file is available.</p></div>';
    }
}

// Load a specific scene
function loadScene(sceneIndex) {
    currentScene = sceneIndex;
    const scene = scenes[sceneIndex];
    
    // Update navigation buttons
    updateNavigation();
    
    // Update progress bar
    updateProgress();
    
    // Clear the scene container
    const container = document.getElementById('sceneContainer');
    container.innerHTML = '';
    
    // Add scene content
    container.innerHTML = `
        <div class="scene-title fade-in">${scene.title}</div>
        <div class="scene-description fade-in" id="sceneDescription">${scene.description}</div>
        <div class="chart-container" id="chartContainer"></div>
    `;
    
    // Load the appropriate chart
    setTimeout(() => {
        switch(scene.chartType) {
            case 'topCountries':
                createTopCountriesChart();
                break;
            case 'gdpScatter':
                createGDPScatterChart();
                // Update description with calculated correlation while preserving custom text
                const correlation = calculateCorrelation(happinessData, 'GDP per capita', 'Score');
                const descriptionElement = document.getElementById('sceneDescription');
                descriptionElement.innerHTML = `GDP per capita shows a strong positive correlation (r=${correlation.toFixed(3)}) with happiness. However, one country that sticks out is Costa Rica (rank 12), which has lower GDP but higher happiness than many wealthier nations.`;
                break;
            case 'socialSupport':
                createSocialSupportChart();
                // Update description with calculated correlation
                const socialCorrelation = calculateCorrelation(happinessData, 'Social support', 'Score');
                const socialDescriptionElement = document.getElementById('sceneDescription');
                socialDescriptionElement.innerHTML = `Social support also shows a strong positive correlation (r=${socialCorrelation.toFixed(3)}) with happiness scores. Countries with stronger social networks tend to be happier. Iceland, for example, has the highest social support score in the world and one of the highest happiness scores.`;
                break;
            case 'regionalMap':
                createRegionalMap();
                // Update description with calculated correlation
                const freedomCorrelation = calculateCorrelation(happinessData, 'Freedom to make life choices', 'Score');
                const freedomDescriptionElement = document.getElementById('sceneDescription');
                freedomDescriptionElement.innerHTML = `Freedom to make life choices shows a positive correlation (r=${freedomCorrelation.toFixed(3)}) with happiness. Countries where people feel they have more control over their lives tend to be happier. However, I expected the correlation to be similar or higher than the GDP and social support correlation coefficients.`;
                break;
            case 'interactive':
                createInteractiveChart();
                // Update description for the bar chart visualization
                const barChartDescriptionElement = document.getElementById('sceneDescription');
                barChartDescriptionElement.innerHTML = `Now you can explore all 156 countries in an interactive bar chart. Countries are sorted by happiness score, with the happiest countries at the top. Use the search box to filter and find specific countries - when you search, only matching countries will be displayed.`;
                break;
        }
    }, 100);
}

// Navigation functions
function nextScene() {
    if (currentScene < scenes.length - 1) {
        loadScene(currentScene + 1);
    }
}

function previousScene() {
    if (currentScene > 0) {
        loadScene(currentScene - 1);
    }
}

function goToScene(sceneIndex) {
    if (sceneIndex >= 0 && sceneIndex < scenes.length) {
        loadScene(sceneIndex);
    }
}

// Update navigation buttons
function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentScene === 0;
    nextBtn.disabled = currentScene === scenes.length - 1;
}

// Update progress bar
function updateProgress() {
    const progress = ((currentScene + 1) / scenes.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Chart 1: Top Countries Bar Chart
function createTopCountriesChart() {
    const top20 = happinessData.slice(0, 20);
    
    const margin = {top: 40, right: 30, bottom: 100, left: 80};
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const svg = d3.select('#chartContainer')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleBand()
        .domain(top20.map(d => d['Country or region']))
        .range([0, width])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(top20, d => d.Score)])
        .range([height, 0]);
    
    // Color scale
    const color = d3.scaleSequential()
        .domain([0, d3.max(top20, d => d.Score)])
        .interpolator(d3.interpolateBlues);
    
    // Bars
    svg.selectAll('.bar')
        .data(top20)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d['Country or region']))
        .attr('y', d => y(d.Score))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.Score))
        .attr('fill', d => color(d.Score))
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 1);
            showTopCountriesTooltip(event, d);
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.8);
            hideTooltip();
        });
    
    // X-axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    // Y-axis
    svg.append('g')
        .call(d3.axisLeft(y));
    
    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text('Happiness Score');
    
    // Annotations - repositioned to avoid obstruction
    // addAnnotation(svg, 20, 20, 'Finland leads with 7.769', 'top');
    // addAnnotation(svg, width - 180, 20, 'Nordic countries dominate the top 10', 'top');
}

// Chart 2: GDP vs Happiness Scatter Plot
function createGDPScatterChart() {
    const margin = {top: 40, right: 30, bottom: 60, left: 80};
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const svg = d3.select('#chartContainer')
        .append('svg')
        .attr('width', width + margin.left + margin.right + 250) // Increased width for legend
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Calculate correlation coefficient
    const correlation = calculateCorrelation(happinessData, 'GDP per capita', 'Score');
    
    // Scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(happinessData, d => d['GDP per capita'])])
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(happinessData, d => d.Score)])
        .range([height, 0]);
    
    // Color scale
    const color = d3.scaleSequential()
        .domain([0, d3.max(happinessData, d => d.Score)])
        .interpolator(d3.interpolateBlues);
    
    // Points
    svg.selectAll('circle')
        .data(happinessData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d['GDP per capita']))
        .attr('cy', d => y(d.Score))
        .attr('r', 5)
        .attr('fill', d => color(d.Score))
        .attr('opacity', 0.7)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('r', 8);
            showTooltip(event, d);
        })
        .on('mouseout', function() {
            d3.select(this).attr('r', 5);
            hideTooltip();
        });
    
    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    svg.append('g')
        .call(d3.axisLeft(y));
    
    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .text('GDP per capita');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Happiness Score');
    
    // Add color legend - moved outside the main plotting area
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width + 20; // Position outside the main chart area
    const legendY = 10;
    
    // Legend gradient
    const legendGradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'legendGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    legendGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.interpolateBlues(0));
    
    legendGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.interpolateBlues(1));
    
    // Legend rectangle
    svg.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'url(#legendGradient)')
        .attr('stroke', '#ccc');
    
    // Legend labels
    svg.append('text')
        .attr('x', legendX)
        .attr('y', legendY - 5)
        .style('font-size', '12px')
        .text('Happiness Score');
    
    svg.append('text')
        .attr('x', legendX)
        .attr('y', legendY + legendHeight + 15)
        .style('font-size', '10px')
        .text('Low');
    
    svg.append('text')
        .attr('x', legendX + legendWidth)
        .attr('y', legendY + legendHeight + 15)
        .style('font-size', '10px')
        .style('text-anchor', 'end')
        .text('High');
    
    // Highlight Costa Rica
    const costaRica = happinessData.find(d => d['Country or region'] === 'Costa Rica');
    if (costaRica) {
        svg.append('circle')
            .attr('cx', x(costaRica['GDP per capita']))
            .attr('cy', y(costaRica.Score))
            .attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', '#ff6b6b')
            .attr('stroke-width', 3);
        
        // addAnnotation(svg, x(costaRica['GDP per capita']) + 20, y(costaRica.Score) - 20, 
        //     'Costa Rica: High happiness despite lower GDP', 'top');
    }
}

// Chart 3: Social Support vs Happiness Scatter Plot
function createSocialSupportChart() {
    const margin = {top: 40, right: 30, bottom: 60, left: 80};
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const svg = d3.select('#chartContainer')
        .append('svg')
        .attr('width', width + margin.left + margin.right + 250) // Extra width for legend
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Calculate correlation coefficient
    const correlation = calculateCorrelation(happinessData, 'Social support', 'Score');
    
    // Scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(happinessData, d => d['Social support'])])
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(happinessData, d => d.Score)])
        .range([height, 0]);
    
    // Color scale
    const color = d3.scaleSequential()
        .domain([0, d3.max(happinessData, d => d.Score)])
        .interpolator(d3.interpolateGreens);
    
    // Points - All 156 countries from the dataset
    svg.selectAll('circle')
        .data(happinessData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d['Social support']))
        .attr('cy', d => y(d.Score))
        .attr('r', 5)
        .attr('fill', d => color(d.Score))
        .attr('opacity', 0.7)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('r', 8);
            showSocialSupportTooltip(event, d);
        })
        .on('mouseout', function() {
            d3.select(this).attr('r', 5);
            hideTooltip();
        });
    
    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    svg.append('g')
        .call(d3.axisLeft(y));
    
    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .text('Social Support Score');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Happiness Score');
    
    // Add color legend - moved outside the main plotting area
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width + 20; // Position outside the main chart area
    const legendY = 10;
    
    // Legend gradient
    const legendGradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'legendGradientSocial')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    legendGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.interpolateGreens(0));
    
    legendGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.interpolateGreens(1));
    
    // Legend rectangle
    svg.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'url(#legendGradientSocial)')
        .attr('stroke', '#ccc');
    
    // Legend labels
    svg.append('text')
        .attr('x', legendX)
        .attr('y', legendY - 5)
        .style('font-size', '12px')
        .text('Happiness Score');
    
    svg.append('text')
        .attr('x', legendX)
        .attr('y', legendY + legendHeight + 15)
        .style('font-size', '10px')
        .text('Low');
    
    svg.append('text')
        .attr('x', legendX + legendWidth)
        .attr('y', legendY + legendHeight + 15)
        .style('font-size', '10px')
        .style('text-anchor', 'end')
        .text('High');
    
    // Highlight Iceland (highest social support)
    const iceland = happinessData.find(d => d['Country or region'] === 'Iceland');
    if (iceland) {
        svg.append('circle')
            .attr('cx', x(iceland['Social support']))
            .attr('cy', y(iceland.Score))
            .attr('r', 8)
            .attr('fill', 'none')
            .attr('stroke', '#ff6b6b')
            .attr('stroke-width', 3);
    }
}

// Chart 4: Freedom and Happiness Comparison
function createRegionalMap() {
    // Get countries with highest and lowest freedom of life choices
    const sortedByFreedom = happinessData.sort((a, b) => b['Freedom to make life choices'] - a['Freedom to make life choices']);
    const top10Freedom = sortedByFreedom.slice(0, 10); // Highest freedom
    const bottom10Freedom = sortedByFreedom.slice(-10); // Lowest freedom
    
    const margin = {top: 40, right: 30, bottom: 100, left: 120};
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    const svg = d3.select('#chartContainer')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Calculate averages for comparison
    const avgHappinessHighFreedom = d3.mean(top10Freedom, d => d.Score);
    const avgHappinessLowFreedom = d3.mean(bottom10Freedom, d => d.Score);
    
    // Create data for the comparison chart
    const comparisonData = [
        { group: 'Highest Freedom Countries', avgHappiness: avgHappinessHighFreedom, count: top10Freedom.length },
        { group: 'Lowest Freedom Countries', avgHappiness: avgHappinessLowFreedom, count: bottom10Freedom.length }
    ];
    
    // Scales
    const x = d3.scaleBand()
        .domain(comparisonData.map(d => d.group))
        .range([0, width])
        .padding(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(comparisonData, d => d.avgHappiness) * 1.1])
        .range([height, 0]);
    
    // Color scale
    const color = d3.scaleOrdinal()
        .domain(['Highest Freedom Countries', 'Lowest Freedom Countries'])
        .range(['#2E8B57', '#DC143C']);
    
    // Bars
    svg.selectAll('.bar')
        .data(comparisonData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.group))
        .attr('y', d => y(d.avgHappiness))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.avgHappiness))
        .attr('fill', d => color(d.group))
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 1);
            showComparisonTooltip(event, d);
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.8);
            hideTooltip();
        });
    
    // Add value labels on bars
    svg.selectAll('.value-label')
        .data(comparisonData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => x(d.group) + x.bandwidth() / 2)
        .attr('y', d => y(d.avgHappiness) - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(d => d.avgHappiness.toFixed(3));
    
    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    svg.append('g')
        .call(d3.axisLeft(y));
    
    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Average Happiness Score by Freedom Level');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Average Happiness Score');
    
    // Add explanation
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 60)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text('Comparing average happiness of top 10 vs bottom 10 countries by freedom of life choices');
    
    // Add country lists
    svg.append('text')
        .attr('x', 0)
        .attr('y', height + 80)
        .style('font-size', '10px')
        .style('fill', '#666')
        .text('Highest Freedom Countries: ' + top10Freedom.map(d => d['Country or region']).join(', '));
    
    svg.append('text')
        .attr('x', 0)
        .attr('y', height + 95)
        .style('font-size', '10px')
        .style('fill', '#666')
        .text('Lowest Freedom Countries: ' + bottom10Freedom.map(d => d['Country or region']).join(', '));
}

// Chart 5: Interactive Searchable Bar Chart
function createInteractiveChart() {
    const margin = {top: 40, right: 30, bottom: 60, left: 80};
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    // Add search container with better positioning
    const searchContainer = d3.select('#chartContainer')
        .append('div')
        .attr('class', 'search-container')
        .style('text-align', 'center')
        .style('margin-bottom', '20px');
    
    // Add search input
    searchContainer.append('input')
        .attr('type', 'text')
        .attr('id', 'countrySearch')
        .attr('placeholder', 'Search for a country...')
        .attr('class', 'search-input')
        .on('input', function() {
            const searchTerm = this.value.toLowerCase();
            updateBarChart(searchTerm, svg, x, y, color, height, width);
        });
    
    const svg = d3.select('#chartContainer')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Sort data by happiness score (descending)
    const sortedData = happinessData.sort((a, b) => b.Score - a.Score);
    
    // Scales
    const x = d3.scaleBand()
        .domain(sortedData.map(d => d['Country or region']))
        .range([0, width])
        .padding(0.1);
    
    // Keep y-axis scale consistent with full dataset range
    const y = d3.scaleLinear()
        .domain([0, d3.max(happinessData, d => d.Score)])
        .range([height, 0]);
    
    // Color scale
    const color = d3.scaleSequential()
        .domain([0, d3.max(happinessData, d => d.Score)])
        .interpolator(d3.interpolateReds);
    
    // Initial bars (all countries)
    svg.selectAll('.bar')
        .data(sortedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d['Country or region']))
        .attr('y', d => y(d.Score))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.Score))
        .attr('fill', d => color(d.Score))
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 1);
            showDetailedTooltip(event, d);
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.8);
            hideTooltip();
        });
    
    // X-axis (without labels)
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .remove(); // Remove all text labels
    
    // Y-axis
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y));
    
    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Happiness Score by Country');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Happiness Score');
    
    // Add instruction text
    svg.append('text')
        .attr('class', 'instruction-text')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#666')
        .text('All 156 countries shown. Use the search box to filter and see specific countries.');
    
    // Store references for search functionality
    window.barChartData = sortedData;
    window.barChartSvg = svg;
    window.barChartX = x;
    window.barChartY = y;
    window.barChartColor = color;
    window.barChartHeight = height;
    window.barChartWidth = width;
}

// Function to update bar chart based on search
function updateBarChart(searchTerm, svg, x, y, color, height, width) {
    let filteredData;
    
    if (searchTerm.length === 0) {
        // Show all countries
        filteredData = window.barChartData;
    } else {
        // Filter to matching countries
        filteredData = window.barChartData.filter(d => 
            d['Country or region'].toLowerCase().includes(searchTerm)
        );
    }
    
    // Update x scale for filtered data
    x.domain(filteredData.map(d => d['Country or region']));
    
    // Keep y-axis scale consistent with full dataset range
    y.domain([0, d3.max(happinessData, d => d.Score)]);
    
    // Update bars
    const bars = svg.selectAll('.bar')
        .data(filteredData, d => d['Country or region']);
    
    // Remove old bars
    bars.exit().remove();
    
    // Add new bars
    const newBars = bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('fill', d => color(d.Score))
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 1);
            showDetailedTooltip(event, d);
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.8);
            hideTooltip();
        });
    
    // Update all bars
    svg.selectAll('.bar')
        .attr('x', d => x(d['Country or region']))
        .attr('y', d => y(d.Score))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.Score))
        .attr('fill', d => color(d.Score));
    
    // Update x-axis (without labels)
    svg.select('.x-axis').remove();
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .remove(); // Remove all text labels
    
    // Update y-axis (keep consistent scale)
    svg.select('.y-axis').remove();
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y));
    
    // Update instruction text
    svg.select('.instruction-text').remove();
    let instructionText;
    if (searchTerm.length === 0) {
        instructionText = 'All 156 countries shown. Use the search box to filter and see specific countries.';
    } else if (filteredData.length === 0) {
        instructionText = `No countries found matching "${searchTerm}". Try a different search term.`;
    } else if (filteredData.length === 1) {
        instructionText = `Showing ${filteredData[0]['Country or region']} (Rank: ${filteredData[0]['Overall rank']}, Score: ${filteredData[0].Score.toFixed(3)})`;
    } else {
        instructionText = `Showing ${filteredData.length} countries matching "${searchTerm}".`;
    }
    
    svg.append('text')
        .attr('class', 'instruction-text')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#666')
        .text(instructionText);
}

// Function to highlight countries based on search
function highlightCountry(searchTerm) {
    // This function is no longer needed as we are using a bar chart for search.
    // If search functionality is re-introduced, this function will need to be updated.
}

// Tooltip function for map
function showMapTooltip(event, d) {
    // This function is no longer needed as we are using a bar chart instead of a map.
    // The showDetailedTooltip function is used for the bar chart.
}

// Helper functions
function addAnnotation(svg, x, y, text, position) {
    const annotation = svg.append('g')
        .attr('class', 'annotation')
        .attr('transform', `translate(${x}, ${y})`);
    
    annotation.append('rect')
        .attr('width', 160)
        .attr('height', 40)
        .attr('fill', 'rgba(255, 255, 255, 0.95)')
        .attr('stroke', '#667eea')
        .attr('stroke-width', 2)
        .attr('rx', 6);
    
    annotation.append('text')
        .attr('x', 8)
        .attr('y', 15)
        .style('font-size', '11px')
        .text(text);
}

function showTooltip(event, d) {
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    
    tooltip.html(`
        <strong>${d['Country or region']}</strong><br/>
        Rank: ${d['Overall rank']}<br/>
        GDP per capita: ${d['GDP per capita'].toFixed(3)}<br/>
        Happiness Score: ${d.Score.toFixed(3)}
    `);
}

function showDetailedTooltip(event, d) {
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    
    tooltip.html(`
        <strong>${d['Country or region']}</strong><br/>
        Rank: ${d['Overall rank']}<br/>
        Score: ${d.Score.toFixed(3)}<br/>
        GDP: ${d['GDP per capita'].toFixed(3)}<br/>
        Social Support: ${d['Social support'].toFixed(3)}<br/>
        Life Expectancy: ${d['Healthy life expectancy'].toFixed(3)}<br/>
        Freedom: ${d['Freedom to make life choices'].toFixed(3)}<br/>
        Generosity: ${d['Generosity'].toFixed(3)}<br/>
        Corruption: ${d['Perceptions of corruption'].toFixed(3)}
    `);
}

function showTopCountriesTooltip(event, d) {
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    
    tooltip.html(`
        <strong>${d['Country or region']}</strong><br/>
        Rank: ${d['Overall rank']}<br/>
        Score: ${d.Score.toFixed(3)}
    `);
}

function showSocialSupportTooltip(event, d) {
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    
    tooltip.html(`
        <strong>${d['Country or region']}</strong><br/>
        Rank: ${d['Overall rank']}<br/>
        Social Support: ${d['Social support'].toFixed(3)}<br/>
        Happiness Score: ${d.Score.toFixed(3)}
    `);
}

function showCorruptionTooltip(event, d) {
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    
    tooltip.html(`
        <strong>${d['Country or region']}</strong><br/>
        Rank: ${d['Overall rank']}<br/>
        Corruption: ${d['Perceptions of corruption'].toFixed(3)}
    `);
}

function showFreedomTooltip(event, d) {
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    
    tooltip.html(`
        <strong>${d['Country or region']}</strong><br/>
        Rank: ${d['Overall rank']}<br/>
        Freedom: ${d['Freedom to make life choices'].toFixed(3)}
    `);
}

function showComparisonTooltip(event, d) {
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    
    // Calculate average freedom for the group
    let avgFreedom;
    if (d.group === 'Highest Freedom Countries') {
        const top10Freedom = happinessData.sort((a, b) => b['Freedom to make life choices'] - a['Freedom to make life choices']).slice(0, 10);
        avgFreedom = d3.mean(top10Freedom, d => d['Freedom to make life choices']);
    } else {
        const bottom10Freedom = happinessData.sort((a, b) => b['Freedom to make life choices'] - a['Freedom to make life choices']).slice(-10);
        avgFreedom = d3.mean(bottom10Freedom, d => d['Freedom to make life choices']);
    }
    
    tooltip.html(`
        <strong>${d.group}</strong><br/>
        Average Happiness Score: ${d.avgHappiness.toFixed(3)}<br/>
        Average Freedom Score: ${avgFreedom.toFixed(3)}<br/>
        Number of Countries: ${d.count}
    `);
}

function hideTooltip() {
    d3.selectAll('.tooltip').remove();
}

// Helper function to calculate correlation coefficient
function calculateCorrelation(data, xKey, yKey) {
    const n = data.length;
    if (n === 0) return 0;

    const sumX = d3.sum(data, d => +d[xKey]);
    const sumY = d3.sum(data, d => +d[yKey]);
    const sumXY = d3.sum(data, d => +d[xKey] * +d[yKey]);
    const sumXSquared = d3.sum(data, d => (+d[xKey]) ** 2);
    const sumYSquared = d3.sum(data, d => (+d[yKey]) ** 2);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXSquared - sumX ** 2) * (n * sumYSquared - sumY ** 2));

    if (denominator === 0) return 0; // Avoid division by zero
    return numerator / denominator;
}

// Fallback function to create a simple world map
function createSimpleWorldMap(svg, width, height, colorScale, happinessMap) {
    // This function is no longer needed as we are using a bar chart instead of a map.
}

// Function to add map legend
function addMapLegend(svg, width, height, colorScale) {
    // This function is no longer needed as we are using a bar chart instead of a map.
}

// Final fallback: Create a grid-based visualization
function createGridVisualization(svg, width, height, colorScale, happinessMap) {
    // This function is no longer needed as we are using a bar chart instead of a map.
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init); 