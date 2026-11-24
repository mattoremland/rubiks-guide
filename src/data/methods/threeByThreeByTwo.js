import { applyAlg } from '../../lib/cube3d.js'

// Example solve on the 3x3x2 (3 wide, 2 tall, 3 deep). Every later state is this one with the
// documented moves applied (see applyAlg), so the example follows one real solve.
// Step 1's result: the white cross on top, red at the back, then green, orange and blue going
// clockwise as seen from above.
const CROSS = {
  U: ['Y', 'W', 'Y', 'W', 'W', 'W', 'Y', 'W', 'Y'],
  D: ['W', 'Y', 'W', 'Y', 'Y', 'Y', 'W', 'Y', 'W'],
  F: ['R', 'O', 'O', 'R', 'B', 'G'],
  B: ['G', 'R', 'G', 'B', 'G', 'R'],
  R: ['B', 'G', 'R', 'O', 'O', 'O'],
  L: ['O', 'B', 'B', 'G', 'R', 'B'],
}

// On the 3x3x2 the R face can only turn halfway, so R and R' are the same move.
const INSERT = "R U R U' R"
const CORNERS = "R U R U' R y' R U' R U R"
const SWAP_FB = 'R U2 R U2 R U2'
const SWAP_FR = "R U R U R U2 R U2 R U R U' R"
// Step 2 starts from the cross held a quarter turn round from step 1's image, so turning the
// puzzle upside down lands the white-orange-green corner directly above the orange and green
// bottom edges at the bottom right
const FLIP = 'x2'
// after the corner algorithm the corners are right relative to each other; one top turn lines
// them up with the bottom
const ALIGN = "U'"
// the other three white corners, each brought over its slot and inserted the same way (not shown)
const REST = `y2 ${INSERT} y U2 ${INSERT} y2 U ${INSERT}`

const START = applyAlg(CROSS, "y'")
const S2 = applyAlg(START, FLIP)
const S3 = applyAlg(S2, INSERT)
const BOTTOM = applyAlg(S3, REST)
const S4 = applyAlg(BOTTOM, `${CORNERS} ${ALIGN}`)
// a different cube at the same point, needing the front and back edges swapped
const FB_CASE = applyAlg(applyAlg(S4, SWAP_FR), SWAP_FB)

// Sticker indices (3x3x2): U 0-8 back-left to front-right as seen from above; side faces
// 0-2 the top row and 3-5 the bottom row, left to right as you look at that face.
const TOP_FRONT_RIGHT = [{ face: 'U', indices: [8] }, { face: 'F', indices: [2] }, { face: 'R', indices: [0] }]
const CROSS_GROUPS = [{ face: 'U', indices: [1, 3, 4, 5, 7] }, { face: 'F', indices: [1] }, { face: 'R', indices: [1] }]
// the red and blue cross edges, hidden at the back and left, shown through the puzzle
const HIDDEN_CROSS = [{ face: 'B', indices: [1] }, { face: 'L', indices: [1] }]
// the bottom middle edges at the front right, which the corner above them must match
const SLOT_EDGES = [{ face: 'F', indices: [4] }, { face: 'R', indices: [4] }]
// pale blue, so outlines stand out against white stickers
const ON_WHITE = '#7DD3FC'

export const threeByThreeByTwoNotation = {
  intro:
    'Hold the puzzle with one face toward you. Each face is named by where it is: U (up), F (front) and R (right). This method only needs the moves below.',
  figures: [
    {
      state: CROSS,
      labels: { U: 'U', F: 'F', R: 'R' },
      caption: 'U, F and R are the top, front and right faces.',
    },
  ],
  directions:
    "A letter on its own means turning that face clockwise, as if you were looking straight at it, and an apostrophe (') means counterclockwise. A 2 means do the move twice (U2 is U then U again). The R face can only turn halfway, so R is always a half turn. y' turns the whole puzzle counterclockwise as seen from above.",
  state: CROSS,
  moves: [
    { notation: 'R', label: 'Right face, half turn' },
    { notation: 'U', label: 'Top face, clockwise' },
    { notation: "U'", label: 'Top face, counterclockwise' },
    { notation: "y'", label: 'Whole puzzle, counterclockwise from above' },
  ].map(m => ({ ...m, animation: { alg: m.notation, outlineMoves: true, loop: true } })),
}

export const threeByThreeByTwoMethod = {
  name: "Beginner's Method",
  description: 'Solve the white layer first, then the corners and edges of the top layer.',
  notation: threeByThreeByTwoNotation,
  previewState: CROSS,
  stages: [
    {
      slug: 'white-cross',
      name: 'Step 1: White Cross',
      description:
        'Solve the white cross on top by intuition: position the piece below where you want it, then do one turn to bring it into position. The order of the sides, going clockwise from the top, must be red, green, orange, blue.',
      figures: [
        {
          state: CROSS,
          groups: [...CROSS_GROUPS, ...HIDDEN_CROSS],
          highlightColor: ON_WHITE,
          caption: 'The white cross on top, with red at the back and blue on the left (both shown through the puzzle).',
        },
      ],
      algorithms: [],
    },
    {
      slug: 'white-corner',
      name: 'Step 2: Position a White Corner',
      description:
        'With the white face on the bottom, move one of the white corners directly above where it needs to go. You will know because the other edges of that corner will match the two middle edges on the bottom (orange and green in this example). Orient the cube so that the destination corner is bottom right.',
      animation: {
        state: START,
        alg: FLIP,
        highlightBefore: [{ face: 'U', indices: [1, 3, 4, 5, 7] }],
        highlightAfter: [...TOP_FRONT_RIGHT, ...SLOT_EDGES],
        highlightColor: ON_WHITE,
        caption: 'Turn the whole puzzle upside down so the white cross is on the bottom.',
      },
      algorithms: [],
    },
    {
      slug: 'insert',
      name: 'Step 3: Insert the Corner',
      description: `Place the piece in the corner using ${INSERT}.`,
      animation: {
        state: S2,
        alg: INSERT,
        outlineMoves: true,
        highlightAfter: [{ face: 'F', indices: [4, 5] }, { face: 'R', indices: [3, 4] }],
        caption:
          'Repeat steps 2 and 3 for the other three white corners. Note: if you are very unlucky, all white corners may already be on the bottom but oriented incorrectly. If so, do this algorithm with a non-white corner above any corner to move a white corner back into the top, and proceed.',
      },
      algorithms: [],
    },
    {
      slug: 'top-corners',
      name: 'Step 4: Solve the Top Corners',
      description: 'Solve the corners on the top layer.',
      figures: [
        {
          // the same cube turned so the headlights face you
          state: applyAlg(BOTTOM, "y'"),
          groups: [{ face: 'F', indices: [0] }, { face: 'F', indices: [2] }],
          caption: "If two corners are correctly placed, they will form 'headlights' (two same-colored edges facing out).",
        },
      ],
      animation: {
        state: BOTTOM,
        alg: `${CORNERS} ${ALIGN}`,
        outlineMoves: true,
        // the headlights flash through the cube on the left before the algorithm starts
        highlightBefore: [{ face: 'L', indices: [0] }, { face: 'L', indices: [2] }],
        highlightAfter: [{ face: 'F', indices: [0, 2] }, { face: 'R', indices: [0, 2] }],
        caption: `Hold the cube so the headlights are on the left and do the following: (${INSERT}), rotate the entire cube counterclockwise once (y'), then (R U' R U R). Note the U and U' switch places in this algorithm, after the rotation. In this example a final ${ALIGN} then lines the corners up with the bottom.`,
      },
      algorithms: [],
    },
    {
      slug: 'top-edges',
      name: 'Step 5: Solve the Top Edges',
      description:
        'Solve the edges on the top layer. The middle edges may either need to be swapped across from each other, or as neighbors.',
      // a different cube at the same point: the front edge and the back edge (shown through the
      // cube) need to swap
      animation: {
        state: FB_CASE,
        alg: SWAP_FB,
        outlineMoves: true,
        highlightBefore: [{ face: 'F', indices: [1] }, { face: 'B', indices: [1] }],
        highlightAfter: [{ face: 'F', indices: [1] }],
        caption: 'It is possible that two opposite middle edges need to be swapped. If so, do: 3(R U2), which means "do (R U2) three times".',
      },
      closing: {
        figure: {
          state: S4,
          animation: {
            alg: SWAP_FR,
            outlineMoves: true,
            highlightBefore: [{ face: 'F', indices: [1] }, { face: 'R', indices: [1] }],
            highlightAfter: [{ face: 'F', indices: [1] }, { face: 'R', indices: [1] }],
          },
          caption: "It is also possible that two neighboring edges need to be swapped. If so, do 2(R U) 2(R U2) (R U) (R U') R.",
        },
        textAfter:
          'You may have to apply one or both of these algorithms to get the middle edges all correctly aligned.',
      },
      algorithms: [],
    },
  ],
}
