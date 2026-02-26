export const PROJECTS = [
  {
    id: 1,
    title: 'Computer-Aided Lung Cancer Diagnosis',
    description:
      'CNN + transfer learning pipeline for lung CT scan analysis. Achieved 94% classification accuracy with Grad-CAM visual explainability. Published in IEEE 2025.',
    image: '/projects/cancer-diagnosis.jpg',
    techStack: ['Python', 'TensorFlow', 'CNN', 'Grad-CAM', 'Transfer Learning'],
    githubUrl: 'https://github.com/GunabhiramA',
    liveUrl: '',
    metric: '94% accuracy · IEEE 2025',
  },
  {
    id: 2,
    title: 'Intelligent Sudoku Generator',
    description:
      'High-performance Sudoku engine in C++ using backtracking with constraint propagation. Features difficulty grading, SVG board export, and full puzzle validation.',
    image: '/projects/sudoku.jpg',
    techStack: ['C++', 'Backtracking', 'SVG', 'Algorithms'],
    githubUrl: 'https://github.com/GunabhiramA',
    liveUrl: '',
    metric: 'Difficulty-graded · SVG export',
  },
  {
    id: 3,
    title: 'Tic Tac Toe AI',
    description:
      'Modular C implementation with a minimax AI opponent. Clean separation of game logic, rendering, and AI strategy. Includes full Makefile build system.',
    image: '/projects/tictactoe.jpg',
    techStack: ['C', 'Minimax AI', 'Makefile', 'Modular Design'],
    githubUrl: 'https://github.com/GunabhiramA',
    liveUrl: '',
    metric: 'Unbeatable AI · Modular C',
  },
];

export const SOCIAL_LINKS = {
  github: 'https://github.com/GunabhiramA',
  linkedin: 'https://www.linkedin.com/in/gunabhiram-aruru/',
  email: 'gunabhiram.aruru@colorado.edu',
};

/**
 * Skills data lives in /src/data/skills.ts
 * Import from there: import { SKILLS } from '../data/skills';
 */
