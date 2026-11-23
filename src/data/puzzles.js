export const puzzles = [
  {
    slug: 'pyraminx',
    name: 'Pyraminx',
    type: 'pyraminx',
    dimensions: { faces: 4, size: 3 },
    description: 'A tetrahedron-shaped puzzle with 4 triangular faces.',
    difficulty: 1,
    pieceCount: 14,
  },
  {
    slug: '2x2',
    name: '2x2x2',
    type: 'cube',
    dimensions: { x: 2, y: 2, z: 2 },
    description: 'The pocket cube — a simpler version of the classic 3x3.',
    difficulty: 2,
    pieceCount: 8,
  },
  {
    slug: '2x2x3',
    name: '2x2x3',
    type: 'cuboid',
    dimensions: { x: 2, y: 3, z: 2 },
    description: 'A tower cuboid — taller than it is wide.',
    difficulty: 3,
    pieceCount: 12,
  },
  {
    slug: '2x3x3',
    name: '2x3x3',
    type: 'cuboid',
    dimensions: { x: 3, y: 3, z: 2 },
    description: 'A domino cuboid — wider and shorter.',
    difficulty: 3,
    pieceCount: 18,
  },
  {
    slug: '3x3',
    name: '3x3x3',
    type: 'cube',
    dimensions: { x: 3, y: 3, z: 3 },
    description: 'The classic Rubik\'s Cube.',
    difficulty: 4,
    pieceCount: 26,
  },
  {
    slug: '4x4',
    name: '4x4x4',
    type: 'cube',
    dimensions: { x: 4, y: 4, z: 4 },
    description: 'The Rubik\'s Revenge — adds center and edge pairing complexity.',
    difficulty: 5,
    pieceCount: 56,
  },
  {
    slug: '5x5',
    name: '5x5x5',
    type: 'cube',
    dimensions: { x: 5, y: 5, z: 5 },
    description: 'The Professor\'s Cube — the largest standard NxN.',
    difficulty: 6,
    pieceCount: 98,
  },
]

export function getPuzzleBySlug(slug) {
  return puzzles.find(p => p.slug === slug)
}
