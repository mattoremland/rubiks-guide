const cubeNotation = (size) => ({
  faces: ['R', 'L', 'U', 'D', 'F', 'B'],
  modifiers: { "'": 'counterclockwise', '2': '180°' },
  rotations: ['x', 'y', 'z'],
  groups: [
    { label: 'Face Moves', moves: ['R', 'L', 'U', 'D', 'F', 'B'] },
    { label: 'Rotations', moves: ['x', 'y', 'z'] },
    ...(size >= 3 ? [{ label: 'Slice Moves', moves: ['M', 'E', 'S'] }] : []),
    ...(size >= 4 ? [{ label: 'Wide Moves', moves: ['Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw'] }] : []),
  ],
})

export const notations = {
  pyraminx: {
    faces: ['U', 'L', 'R', 'B'],
    tips: ['u', 'l', 'r', 'b'],
    modifiers: { "'": 'counterclockwise' },
    rotations: [],
    groups: [
      { label: 'Face Moves', moves: ['U', 'L', 'R', 'B'] },
      { label: 'Tip Moves', moves: ['u', 'l', 'r', 'b'] },
    ],
  },
  '2x2': cubeNotation(2),
  '2x2x3': {
    faces: ['R', 'L', 'U', 'D', 'F', 'B'],
    modifiers: { "'": 'counterclockwise', '2': '180°' },
    rotations: ['x', 'y', 'z'],
    groups: [
      { label: 'Face Moves', moves: ['R', 'L', 'U', 'D', 'F', 'B'] },
      { label: 'Rotations', moves: ['x', 'y', 'z'] },
    ],
  },
  '3x3x2': {
    faces: ['R', 'L', 'U', 'D', 'F', 'B'],
    modifiers: { "'": 'counterclockwise', '2': '180°' },
    rotations: ['x', 'y', 'z'],
    groups: [
      { label: 'Face Moves', moves: ['R', 'L', 'U', 'D', 'F', 'B'] },
      { label: 'Rotations', moves: ['x', 'y', 'z'] },
    ],
  },
  '3x3': cubeNotation(3),
  '4x4': cubeNotation(4),
  '5x5': cubeNotation(5),
}

export function getNotation(puzzleSlug) {
  return notations[puzzleSlug]
}
