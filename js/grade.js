// Grade detail page app
function gradeApp() {
  return {
    grades: [],
    grade: null,
    categories: [],
    expectations: {},
    expandedCategories: [],
    personaContent: null,
    loading: true,

    async init() {
      this.grades = await loadGrades();
      this.categories = await loadCategories();

      const gradeNum = getUrlParam('g');
      if (gradeNum) {
        this.grade = this.grades.find(g => g.grade === parseInt(gradeNum));
        // Expand all categories by default
        this.expandedCategories = this.categories.map(c => c.id);
        // Load expectations from markdown
        this.expectations = await loadExpectations(gradeNum);
        // Load persona markdown
        await this.loadPersonaContent(gradeNum);
      }
      this.loading = false;
    },

    async loadPersonaContent(gradeNum) {
      try {
        const response = await fetch(`assets/content/personas/grade-${gradeNum}.md`);
        if (response.ok) {
          const markdown = await response.text();
          this.personaContent = marked.parse(markdown);
        }
      } catch (e) {
        // Persona file not found, leave content empty
      }
    },

    toggleCategory(categoryId) {
      const index = this.expandedCategories.indexOf(categoryId);
      if (index > -1) {
        this.expandedCategories.splice(index, 1);
      } else {
        this.expandedCategories.push(categoryId);
      }
    },

    getCapabilitiesForCategory(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      if (!category || !this.grade) return [];

      return category.capabilities.map(cap => ({
        ...cap,
        expectation: this.expectations[cap.name] || ['Not defined']
      }));
    },

    getAdjacentGrade() {
      if (!this.grade) return '';
      const nextGrade = this.grades.find(g => g.grade === this.grade.grade + 1);
      if (nextGrade) return nextGrade.grade;
      const prevGrade = this.grades.find(g => g.grade === this.grade.grade - 1);
      return prevGrade ? prevGrade.grade : this.grade.grade;
    }
  };
}
