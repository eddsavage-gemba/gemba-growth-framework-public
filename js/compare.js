// Compare page app
function compareApp() {
  return {
    grades: [],
    categories: [],
    fromGrade: '',
    toGrade: '',
    fromGradeData: null,
    toGradeData: null,
    fromExpectations: {},
    toExpectations: {},
    fromPersonaContent: null,
    toPersonaContent: null,
    transitionContent: null,

    async init() {
      this.grades = await loadGrades();
      this.categories = await loadCategories();

      // Load from URL params
      this.fromGrade = getUrlParam('from') || '';
      this.toGrade = getUrlParam('to') || '';

      await this.updateGradeData();
    },

    async updateGradeData() {
      this.fromGradeData = this.grades.find(g => g.grade === parseInt(this.fromGrade)) || null;
      this.toGradeData = this.grades.find(g => g.grade === parseInt(this.toGrade)) || null;

      // Load expectations for both grades
      if (this.fromGrade) {
        this.fromExpectations = await loadExpectations(this.fromGrade);
      }
      if (this.toGrade) {
        this.toExpectations = await loadExpectations(this.toGrade);
      }

      // Load transition content and personas
      await this.loadTransitionContent();
      await this.loadPersonaContent();
    },

    async loadPersonaContent() {
      this.fromPersonaContent = null;
      this.toPersonaContent = null;

      if (this.fromGrade) {
        try {
          const response = await fetch(`assets/personas/grade-${this.fromGrade}.md`);
          if (response.ok) {
            const markdown = await response.text();
            this.fromPersonaContent = marked.parse(markdown);
          }
        } catch (e) {}
      }

      if (this.toGrade) {
        try {
          const response = await fetch(`assets/personas/grade-${this.toGrade}.md`);
          if (response.ok) {
            const markdown = await response.text();
            this.toPersonaContent = marked.parse(markdown);
          }
        } catch (e) {}
      }
    },

    async loadTransitionContent() {
      this.transitionContent = null;
      if (!this.fromGrade || !this.toGrade) return;

      try {
        const response = await fetch(`assets/next-grade-expectations/expectations-${this.fromGrade}-to-${this.toGrade}.md`);
        if (response.ok) {
          const markdown = await response.text();
          this.transitionContent = marked.parse(markdown);
        }
      } catch (e) {
        // Transition file not found
      }
    },

    async updateUrl() {
      await this.updateGradeData();
      const params = new URLSearchParams();
      if (this.fromGrade) params.set('from', this.fromGrade);
      if (this.toGrade) params.set('to', this.toGrade);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    },

    async swapGrades() {
      const temp = this.fromGrade;
      this.fromGrade = this.toGrade;
      this.toGrade = temp;
      await this.updateUrl();
    },

    getExpectation(gradeNum, capability) {
      const expectations = gradeNum === this.fromGrade ? this.fromExpectations : this.toExpectations;
      return expectations[capability.name] || ['Not defined'];
    },

    hasChanged(capability) {
      const fromExp = this.getExpectation(this.fromGrade, capability);
      const toExp = this.getExpectation(this.toGrade, capability);
      return JSON.stringify(fromExp) !== JSON.stringify(toExp);
    }
  };
}
