// Practical Data Point Testing Script
// Run this to test current system and identify missing data points

import { DataPointTester } from './data-point-testing';

// Test projects to evaluate
const TEST_PROJECTS = [
  { name: 'Axie Infinity', type: 'Web3Game' },
  { name: 'Decentraland', type: 'Web3Game' },
  { name: 'The Sandbox', type: 'Web3Game' },
  // Add more test projects as needed
];

async function testDataPointCoverage() {
  console.log('🎯 STARTING DATA POINT COVERAGE TESTING');
  console.log('=====================================\n');

  const tester = new DataPointTester();

  for (const project of TEST_PROJECTS) {
    console.log(`\n🚀 TESTING PROJECT: ${project.name} (${project.type})`);
    console.log('=' .repeat(50));

    try {
      // Make API call to our enhanced batch research endpoint (includes Game Store API integration)
      const response = await fetch('http://localhost:4000/api/research-single-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: project.name
        })
      });

      if (!response.ok) {
        console.log(`❌ API call failed: ${response.status} ${response.statusText}`);
        continue;
      }

      const searchResults = await response.json();
      
      // Analyze the results
      const testResult = tester.analyzeSearchResults(
        project.name, 
        project.type, 
        searchResults
      );

      // Print detailed results
      tester.printTestResults(testResult);

      // Add a delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.log(`❌ Error testing ${project.name}: ${error}`);
    }
  }

  // Generate summary report
  tester.generateSummaryReport();
}

// Function to test a single project (for debugging)
async function testSingleProject(projectName: string, projectType: string = 'Web3Game') {
  console.log(`\n🔍 TESTING SINGLE PROJECT: ${projectName}`);
  console.log('=' .repeat(40));

  const tester = new DataPointTester();

  try {
    const response = await fetch('http://localhost:4000/api/research-single-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName: projectName
      })
    });

    if (!response.ok) {
      console.log(`❌ API call failed: ${response.status} ${response.statusText}`);
      return;
    }

    const searchResults = await response.json();
    
    // Analyze the results
    const testResult = tester.analyzeSearchResults(
      projectName, 
      projectType, 
      searchResults
    );

    // Print detailed results
    tester.printTestResults(testResult);

  } catch (error) {
    console.log(`❌ Error testing ${projectName}: ${error}`);
  }
}

// Function to analyze existing search results (for debugging)
function analyzeExistingResults(projectName: string, projectType: string, searchResults: any) {
  console.log(`\n🔍 ANALYZING EXISTING RESULTS FOR: ${projectName}`);
  console.log('=' .repeat(45));

  const tester = new DataPointTester();
  
  const testResult = tester.analyzeSearchResults(
    projectName, 
    projectType, 
    searchResults
  );

  tester.printTestResults(testResult);
  
  return testResult;
}

// Export functions for use in other scripts
export { 
  testDataPointCoverage, 
  testSingleProject, 
  analyzeExistingResults,
  TEST_PROJECTS 
};

// Run the test if this file is executed directly
if (require.main === module) {
  // Check if a specific project was provided as command line argument
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    const projectName = args[0];
    const projectType = args[1] || 'Web3Game';
    testSingleProject(projectName, projectType);
  } else {
    testDataPointCoverage();
  }
}
