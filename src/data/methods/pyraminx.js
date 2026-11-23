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

// Step 3 examples, red face on the bottom (D). Moves: R = front-right corner, L = front-left
// corner, U = top corner; a plain letter is clockwise as seen on screen, which is dir +1
// (the drawing mirrors the model, see toView in pyraminx3d.js).
// The Step 2 result turned so red is on the bottom, then the top turned once: the yellow-red
// edge sits on the front with red on the left. R U' R' completes the bottom layer.
const RED_BOTTOM_LEFT_CASE = {
  F: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'Y', 'Y'],
  L: ['B', 'B', 'B', 'R', 'B', 'B', 'Y', 'B', 'B'],
  R: ['G', 'G', 'G', 'G', 'G', 'G', 'B', 'G', 'G'],
  D: ['R', 'G', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
}

// Either insert finishes the bottom layer; the top corner is still twisted. U (dir +1) then
// lines it up so every face's centers match, leaving yellow with two wrong edges.
const BOTTOM_SOLVED = {
  F: ['B', 'Y', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  L: ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'G', 'G'],
  R: ['G', 'G', 'G', 'G', 'Y', 'Y', 'G', 'G', 'G'],
  D: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
}

// The mirror case: yellow-red edge on the front with red on the right. L' U L completes the bottom layer.
const RED_BOTTOM_RIGHT_CASE = {
  F: ['G', 'Y', 'G', 'Y', 'Y', 'Y', 'G', 'Y', 'Y'],
  L: ['B', 'B', 'B', 'B', 'B', 'B', 'G', 'Y', 'Y'],
  R: ['G', 'R', 'G', 'G', 'B', 'B', 'Y', 'G', 'G'],
  D: ['R', 'B', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
}

// Notation section. Viewed face-on so U is the top corner and L / R the bottom-left and
// bottom-right corners; a plain letter is clockwise as seen on screen (dir +1).
const NOTATION_VIEW = { x: -16, y: 0 }
const CORNER_LABELS = { apex: 'U', fl: 'L', fr: 'F', back: 'R' }

export const pyraminxNotation = {
  intro:
    'Hold the pyraminx with one face toward you and one face on the bottom. Each of the 4 corners is an *axial corner*: the tip plus the surrounding pieces, forming a smaller inset pyramid. Moves are named after the axial corner that turns.',
  figures: [
    {
      state: TIPS_SOLVED,
      outline: { vertex: 'fr', layer: 'big' },
      labels: CORNER_LABELS,
      caption: 'Front axial corner (F)',
    },
    {
      state: TIPS_SOLVED,
      outline: { vertex: 'back', layer: 'big' },
      labels: CORNER_LABELS,
      caption: 'Right axial corner (R)',
    },
  ],
  directions:
    "A letter on its own means turning that axial corner clockwise, as if you were looking straight at that corner. An apostrophe (') means counterclockwise. A lowercase letter (u, l, r, b) turns just the tip.",
  view: NOTATION_VIEW,
  state: PYRAMINX_SCRAMBLE,
  moves: [
    { notation: 'U', label: 'Top corner, clockwise', vertex: 'apex', dir: 1 },
    { notation: "U'", label: 'Top corner, counterclockwise', vertex: 'apex', dir: -1 },
    { notation: 'L', label: 'Left corner, clockwise', vertex: 'fl', dir: 1 },
    { notation: "L'", label: 'Left corner, counterclockwise', vertex: 'fl', dir: -1 },
    { notation: 'R', label: 'Right corner, clockwise', vertex: 'fr', dir: 1 },
    { notation: "R'", label: 'Right corner, counterclockwise', vertex: 'fr', dir: -1 },
  ].map(m => ({ ...m, animation: { moves: [{ vertex: m.vertex, layer: 'big', dir: m.dir }], outlineMoves: true, loop: true } })),
}

export const pyraminxMethod = {
  name: "Beginner's Method",
  notation: pyraminxNotation,
  previewState: PYRAMINX_SCRAMBLE,
  description:
    'A simple layer-by-layer approach to solving the Pyraminx — tips first, then centers, then edges.',
  stages: [
    {
      slug: 'tips',
      name: 'Step 1: Tips',
      description:
        'Twist each of the 4 tips so they match the color of their adjacent center stickers.',
      animation: {
        state: PYRAMINX_SCRAMBLE,
        moves: [{ vertex: 'apex', layer: 'tip', dir: -1 }],
        loop: true,
      },
      algorithms: [],
    },
    {
      slug: 'centers',
      name: 'Step 2: Match Centers',
      description:
        "Rotate axial corners until the three center stickers on one face all match. It doesn't matter which face.",
      animation: {
        state: TIPS_SOLVED,
        moves: [{ vertex: 'fr', layer: 'big', dir: 1 }],
        outlineMoves: true,
        // each red tip with the center beside it
        highlightAfter: [
          { face: 'R', indices: [0, 2] },
          { face: 'R', indices: [4, 5] },
          { face: 'R', indices: [8, 7] },
        ],
        caption: "In this example, rotating the front axial corner brings all three red tips and their matching centers onto the right face. Don't worry if the middle edges don't match yet.",
      },
      footer: 'Now orient the cube so that the face you just solved is on the bottom.',
      algorithms: [],
    },
    {
      slug: 'edges',
      name: 'Step 3: Insert Edges',
      description:
        'Identify a middle edge that needs to be moved to the bottom. Rotate the top axial corner until that piece is on the front face, with the red side *away* from the front. The red side will then be either on the left or the right axial corner, and the other side (in this example, yellow) will match the corners on the bottom of this face.',
      figures: [
        {
          state: RED_BOTTOM_RIGHT_CASE,
          view: { x: -16, y: 43 },
          // the red-yellow edge's two stickers
          groups: [{ face: 'F', indices: [3] }, { face: 'R', indices: [1] }],
          caption: 'Red-yellow edge piece correctly positioned with red side *away* from front.',
        },
      ],
      note: "Note: if a red edge is already on the red face but flipped, perform either algorithm below to 'pop' it out of the bottom face.",
      algorithms: [
        {
          name: 'Insert from Right',
          moves: "L' U L",
          caseDescription:
            'The yellow-red edge is on the front face with its red side on the right.',
          tips: 'The left corner lifts the bottom-front slot, the top brings the edge across, and the left corner drops it into place.',
          setupState: RED_BOTTOM_RIGHT_CASE,
          view: { x: -16, y: 43 },
          animation: {
            moves: [
              { vertex: 'fl', layer: 'big', dir: -1 },
              { vertex: 'apex', layer: 'big', dir: 1 },
              { vertex: 'fl', layer: 'big', dir: 1 },
            ],
            outlineMoves: true,
          },
        },
        {
          name: 'Insert from Left',
          moves: "R U' R'",
          caseDescription:
            'The yellow-red edge is on the front face with its red side on the left.',
          tips: 'The right corner lifts the bottom-front slot, the top brings the edge across, and the right corner drops it into place.',
          setupState: RED_BOTTOM_LEFT_CASE,
          view: { x: -16, y: -37 },
          animation: {
            moves: [
              { vertex: 'fr', layer: 'big', dir: 1 },
              { vertex: 'apex', layer: 'big', dir: -1 },
              { vertex: 'fr', layer: 'big', dir: -1 },
            ],
            outlineMoves: true,
          },
        },
      ],
      closing: {
        text: 'Repeat these inserts until the bottom face is completely solved.',
        figure: {
          state: BOTTOM_SOLVED,
          bottomBand: true,
          caption: 'When the bottom is solved correctly, the bottom third of every side face will be solved as well.',
        },
      },
    },
    {
      slug: 'align-top',
      name: 'Step 4: Align the Top Corner',
      description:
        'Rotate the top axial corner so that the three corners match (in this example, a U would set up yellow as the next face to solve).',
      animation: {
        state: BOTTOM_SOLVED,
        moves: [{ vertex: 'apex', layer: 'big', dir: 1 }],
        outlineMoves: true,
        // each corner with the center beside it, on the yellow (F) and green (R) faces
        highlightAfter: [
          { face: 'F', indices: [0, 2] },
          { face: 'F', indices: [4, 5] },
          { face: 'F', indices: [8, 7] },
          { face: 'R', indices: [0, 2] },
          { face: 'R', indices: [4, 5] },
          { face: 'R', indices: [8, 7] },
        ],
        caption: "After the U, the yellow face's centers all match, and so do the green face's.",
      },
      footer: 'Now orient the next face to solve (either yellow or green in this example) to the bottom and repeat step 3 to solve it.',
      algorithms: [],
    },
    {
      slug: 'finish',
      name: 'Step 5: Finish',
      description: 'Repeat step 4 to solve the remaining faces.',
      algorithms: [],
    },
  ],
}
