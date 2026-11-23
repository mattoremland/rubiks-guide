// Generated with applyTurn (src/lib/pyraminx3d.js), so every piece is consistent.
// One twist of the top tip (dir -1) solves it against its center.
export const PYRAMINX_SCRAMBLE = {
  F: ['R', 'R', 'G', 'G', 'G', 'B', 'R', 'R', 'Y'],
  L: ['B', 'Y', 'Y', 'Y', 'R', 'B', 'B', 'B', 'G'],
  R: ['G', 'B', 'Y', 'B', 'B', 'R', 'R', 'R', 'Y'],
  D: ['Y', 'G', 'G', 'G', 'R', 'G', 'Y', 'Y', 'B'],
}

// PYRAMINX_SCRAMBLE with all four tips solved. No face's centers match yet; one turn of
// the front axial corner (dir +1) lines up all three centers on the right face.
const TIPS_SOLVED = {
  F: ['G', 'R', 'G', 'G', 'B', 'B', 'R', 'R', 'R'],
  L: ['Y', 'Y', 'Y', 'Y', 'B', 'B', 'B', 'B', 'B'],
  R: ['Y', 'B', 'Y', 'B', 'R', 'R', 'R', 'R', 'R'],
  D: ['G', 'G', 'G', 'G', 'G', 'G', 'Y', 'Y', 'Y'],
}

export const pyraminxMethod = {
  name: "Beginner's Method",
  description:
    'A simple layer-by-layer approach to solving the Pyraminx — tips first, then centers, then edges.',
  stages: [
    {
      slug: 'tips',
      name: 'Step 1: Tips',
      description:
        'Twist each of the 4 tips so they match the color of their adjacent center stickers. Each tip rotates independently — no algorithm needed. The animation shows the top tip being twisted into its correct position.',
      animation: {
        state: PYRAMINX_SCRAMBLE,
        turn: { vertex: 'apex', layer: 'tip', dir: -1 },
      },
      algorithms: [],
    },
    {
      slug: 'centers',
      name: 'Step 2: Match Centers',
      description:
        "Each of the 4 corners is an axial corner: the tip plus the surrounding pieces, forming a smaller inset pyramid. Rotate the axial corners until the three center stickers on one face all match. It doesn't matter which face.",
      figures: [
        {
          state: TIPS_SOLVED,
          outline: { vertex: 'fr', layer: 'big' },
          caption: 'This is the front axial corner',
        },
        {
          state: TIPS_SOLVED,
          outline: { vertex: 'back', layer: 'big' },
          caption: 'This is the right axial corner',
        },
      ],
      animation: {
        state: TIPS_SOLVED,
        turn: {
          vertex: 'fr',
          layer: 'big',
          dir: 1,
          highlightBefore: true,
          // each red tip with the center beside it
          highlightAfter: [
            { face: 'R', indices: [0, 2] },
            { face: 'R', indices: [4, 5] },
            { face: 'R', indices: [8, 7] },
          ],
        },
        caption: "In this example, rotating the front axial corner brings all three red tips and their matching centers onto the right face. Don't worry that the middle edges won't match here yet.",
      },
      algorithms: [],
    },
    {
      slug: 'orient',
      name: 'Step 3: Orient',
      description:
        'Hold the puzzle so the face with matching centers is on the bottom. Tips and centers are now solved — only the edges (the wrong-colored stickers below) remain.',
      setupState: {
        F: ['G', 'R', 'G', 'B', 'G', 'G', 'B', 'G', 'G'],
        L: ['B', 'G', 'B', 'R', 'B', 'B', 'G', 'B', 'B'],
        R: ['R', 'B', 'R', 'G', 'R', 'R', 'B', 'R', 'R'],
        D: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
      },
      highlights: {
        'F:1': 'flash',
        'F:3': 'flash',
        'F:6': 'flash',
        'L:1': 'flash',
        'L:3': 'flash',
        'L:6': 'flash',
        'R:1': 'flash',
        'R:3': 'flash',
        'R:6': 'flash',
      },
      algorithms: [],
    },
    {
      slug: 'edges',
      name: 'Step 4: Insert Edges',
      description:
        'Solve the yellow bottom face by inserting edges from the top layer. Rotate U until an edge lines up with the matching face, then use one of these algorithms. The yellow sticker will end up on the bottom (hidden) face. Repeat until all three edges are placed.',
      algorithms: [
        {
          name: 'Insert from Right',
          moves: "R U R'",
          caseDescription:
            'The edge is in the top layer on the right. Its yellow sticker (shown at R:1) faces the right side.',
          tips: "Rotate U until the edge's other sticker matches the front face, then apply R U R'.",
          setupState: {
            F: ['G', 'G', 'G', 'G', 'G', 'G', 'X', 'G', 'G'],
            L: ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
            R: ['R', 'Y', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
            D: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
          },
          highlights: { 'F:3': 'flash', 'R:1': 'flash', 'F:6': 'glow' },
        },
        {
          name: 'Insert from Left',
          moves: "L' U L",
          caseDescription:
            'The edge is in the top layer on the left. Its yellow sticker (shown at L:3) faces the left side.',
          tips: "Rotate U until the edge's other sticker matches the front face, then apply L' U L.",
          setupState: {
            F: ['G', 'G', 'G', 'G', 'G', 'G', 'X', 'G', 'G'],
            L: ['B', 'B', 'B', 'Y', 'B', 'B', 'B', 'B', 'B'],
            R: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
            D: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
          },
          highlights: { 'F:1': 'flash', 'L:3': 'flash', 'F:6': 'glow' },
        },
      ],
    },
  ],
}
