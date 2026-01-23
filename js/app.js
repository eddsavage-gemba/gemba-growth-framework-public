// Shared state and utilities for all pages

async function loadGrades() {
  const response = await fetch('data/grades.json');
  const data = await response.json();
  return data.grades;
}

async function loadCategories() {
  const response = await fetch('data/matrix.json');
  const data = await response.json();
  return data.categories || [];
}

async function loadExpectations(gradeNum) {
  try {
    const response = await fetch(`data/expectations/grade-${gradeNum}.md`);
    if (!response.ok) return {};
    const markdown = await response.text();
    return parseExpectationsMarkdown(markdown);
  } catch (e) {
    return {};
  }
}

function parseExpectationsMarkdown(markdown) {
  const expectations = {};
  let currentCapability = null;

  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    // Check for capability header (# Capability Name)
    if (trimmed.startsWith('# ')) {
      currentCapability = trimmed.substring(2).trim();
      expectations[currentCapability] = [];
    }
    // Check for bullet point
    else if (trimmed.startsWith('- ') && currentCapability) {
      expectations[currentCapability].push(trimmed.substring(2).trim());
    }
  }

  return expectations;
}

function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Home page app
function app() {
  return {
    grades: [],

    async init() {
      this.grades = await loadGrades();
    }
  };
}
