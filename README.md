# What Makes Nations Happy? - Interactive Narrative Visualization

## Overview

This project creates an interactive narrative visualization exploring the 2019 World Happiness Report dataset. The visualization follows an **interactive slideshow** structure, guiding users through different aspects of global happiness while allowing exploration at each step.

## Project Structure

```
├── index.html          # Main HTML file with structure and styling
├── script.js           # Main JavaScript with D3 visualization logic
├── archive/
│   └── 2019.csv       # World Happiness Report dataset
└── README.md          # This file
```

## Features

### **Narrative Structure: Interactive Slideshow**
- **Scene 1**: Overview of top 20 happiest countries
- **Scene 2**: GDP vs Happiness correlation analysis
- **Scene 3**: Social support impact visualization
- **Scene 4**: Regional patterns exploration
- **Scene 5**: Full interactive dataset exploration

### **Visual Elements**
- **Scenes**: 5 distinct visualizations with consistent styling
- **Annotations**: Highlight key insights and data points
- **Parameters**: Control scene state and navigation
- **Triggers**: Navigation buttons and interactive elements

### **Interactive Features**
- Navigation buttons (Previous/Next/Home)
- Progress indicator
- Hover tooltips with detailed information
- Animated transitions between scenes
- Responsive design

## Technical Implementation

### **Dependencies**
- D3.js v7 (data visualization)
- d3-annotation (annotations)
- topoJSON Client (geographic data support)

### **Key Components**

#### **Parameters**
- `currentScene`: Tracks current scene index
- `happinessData`: Loaded dataset
- `scenes`: Scene configuration array

#### **Triggers**
- Navigation button clicks
- Mouse hover events for tooltips
- Scene transition animations

#### **Annotations**
- Consistent visual template
- Highlight key insights
- Support narrative messaging

## How to Run

1. **Local Development**:
   ```bash
   # Start a local server (Python 3)
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

2. **GitHub Pages** (for submission):
   - Push to GitHub repository
   - Enable GitHub Pages in repository settings
   - Access via `https://username.github.io/repository-name`

## Dataset Information

The 2019 World Happiness Report dataset contains:
- **156 countries** with happiness scores
- **7 variables**: Overall rank, Score, GDP per capita, Social support, Healthy life expectancy, Freedom to make life choices, Generosity, Perceptions of corruption
- **Score range**: 2.853 (South Sudan) to 7.769 (Finland)

## Narrative Messaging

The visualization communicates that **happiness is multi-dimensional**:
1. **Money matters but isn't everything** - GDP correlation exists but isn't perfect
2. **Social support is crucial** - Strong social networks correlate with happiness
3. **Regional patterns exist** - Northern Europe dominates top rankings
4. **Complex interactions** - Multiple factors contribute to national happiness

## Design Decisions

### **Color Scheme**
- Blue gradient for happiness scores
- Consistent visual hierarchy
- Accessible color choices

### **Layout**
- Clean, modern interface
- Responsive design
- Clear navigation structure

### **Interactivity**
- Progressive disclosure of information
- Tooltips for detailed exploration
- Smooth transitions between scenes

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern browsers with ES6 support

## Future Enhancements

- Geographic map visualization
- Time series analysis
- More detailed regional breakdowns
- Export functionality
- Mobile-optimized interactions

---

**Created for CS416 Data Visualization Course**
*Interactive Narrative Visualization Project* 