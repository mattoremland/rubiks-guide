import { applyAlg, solvedState } from '../../lib/cube3d.js'

// Example solve. Held with white on the bottom, blue on the left and red at the front.
// Every later state is this scramble with the documented moves applied (see applyAlg), so the
// example follows one real solve from start to finish.
const SCRAMBLE = {
  U: ['W', 'Y', 'G', 'B'],
  D: ['G', 'Y', 'W', 'R'],
  F: ['O', 'Y', 'O', 'G'],
  B: ['R', 'G', 'B', 'O'],
  R: ['O', 'B', 'R', 'W'],
  L: ['R', 'W', 'B', 'Y'],
}

const INSERT = "R U R' U'"
const ORIENT = "R' U' R U' R' U2 R"
const SWAP = "L' U R' D2 R U' R' D2 R2"

const STEP1 = 'R U F'
const STEP2 = 'U'
const STEP3 = `${INSERT} ${INSERT} ${INSERT}`
const STEP4 = 'y U'
const STEP5 = INSERT
const STEP7 = "U'"
const FINISH = "x' U"

const S1 = applyAlg(SCRAMBLE, STEP1)
const S2 = applyAlg(S1, STEP2)
const S3 = applyAlg(S2, STEP3)
const S4 = applyAlg(S3, STEP4)
const S5 = applyAlg(S4, STEP5)
const S6 = applyAlg(S5, ORIENT)
const S7 = applyAlg(S6, STEP7)
const S8 = applyAlg(S7, SWAP)

// Bottom solved with two yellow corners on top, turned so a yellow sticker faces left on the
// back-left corner (the 6b set-up).
const TWO_YELLOW = applyAlg(solvedState(2), "z2 y' F R U R' U' F' U2")

// Sticker indices (2x2): U/D 0 back-left 1 back-right 2 front-left 3 front-right as seen from above
// (D: 0 front-left 1 front-right 2 back-left 3 back-right as seen from below); side faces
// 0 top-left 1 top-right 2 bottom-left 3 bottom-right as you look at that face.
const TOP_FRONT_RIGHT = [{ face: 'U', indices: [3] }, { face: 'F', indices: [1] }, { face: 'R', indices: [0] }]

const FROM_BELOW_LEFT = { x: -25, y: -35 }
const FROM_LEFT = { x: 25, y: -35 }
// Notation demos for the left and bottom faces
const LEFT_DEMO = { x: 25, y: -20 }

export const twoByTwoNotation = {
  intro:
    'Hold the cube with one face toward you. Each face is named by where it is: U (up), D (down), F (front), B (back), L (left) and R (right).',
  figures: [
    {
      state: SCRAMBLE,
      labels: { U: 'U', F: 'F', R: 'R' },
      caption: 'U, F and R are the top, front and right faces. L, D and B are the left, bottom and back faces, hidden here.',
    },
  ],
  directions:
    "A letter on its own means turning that face clockwise, as if you were looking straight at it. An apostrophe (') means counterclockwise, and a 2 means do the move twice (U2 is U then U again). y turns the whole cube clockwise as seen from above, the same way as U.",
  state: SCRAMBLE,
  moves: [
    { notation: 'R', label: 'Right face, clockwise' },
    { notation: "R'", label: 'Right face, counterclockwise' },
    { notation: 'U', label: 'Top face, clockwise' },
    { notation: "U'", label: 'Top face, counterclockwise' },
    { notation: 'L', label: 'Left face, clockwise', view: LEFT_DEMO, labels: { U: 'U', L: 'L', F: 'F' } },
    { notation: "L'", label: 'Left face, counterclockwise', view: LEFT_DEMO, labels: { U: 'U', L: 'L', F: 'F' } },
    { notation: 'D', label: 'Bottom face, clockwise', view: LEFT_DEMO, labels: { L: 'L', F: 'F', D: 'D' } },
    { notation: "D'", label: 'Bottom face, counterclockwise', view: LEFT_DEMO, labels: { L: 'L', F: 'F', D: 'D' } },
    { notation: 'y', label: 'Whole cube, clockwise from above' },
  ].map(m => ({ ...m, animation: { alg: m.notation, outlineMoves: true, loop: true } })),
}

export const twoByTwoMethod = {
  name: "Beginner's Method",
  description: 'Solve the white layer first, then orient and position the yellow corners.',
  notation: twoByTwoNotation,
  previewState: SCRAMBLE,
  stages: [
    {
      slug: 'white-blue',
      name: 'Step 1: Match White and Blue',
      description: 'Match white and blue sides.',
      animation: {
        state: SCRAMBLE,
        view: FROM_BELOW_LEFT,
        alg: STEP1,
        outlineMoves: true,
        // the two white-blue corners, now side by side on the bottom left
        highlightAfter: [{ face: 'D', indices: [0, 2] }, { face: 'L', indices: [2, 3] }],
        caption: 'In this example, R U F brings the two white-blue corners together, with white on the bottom and blue on the left.',
      },
      algorithms: [],
    },
    {
      slug: 'white-red',
      name: 'Step 2: Position the White-Red Corner',
      description:
        'Keeping white on bottom left, move the corner with white and red faces to the bottom right corner of the top half.',
      animation: {
        state: S1,
        alg: STEP2,
        outlineMoves: true,
        highlightAfter: TOP_FRONT_RIGHT,
        caption: 'Here a single U brings the white-red corner to the top front-right.',
      },
      algorithms: [],
    },
    {
      slug: 'insert',
      name: 'Step 3: Insert the Corner',
      description:
        "Do R U R' U' until the corner is slotted in and correctly oriented (may take a few times).",
      animation: {
        state: S2,
        alg: STEP3,
        outlineMoves: true,
        highlightAfter: [{ face: 'F', indices: [3] }, { face: 'R', indices: [2] }],
        caption: "This corner needs R U R' U' three times.",
      },
      algorithms: [],
    },
    {
      slug: 'last-white',
      name: 'Step 4: Position the Last White Corner',
      description:
        'Turn the whole cube (y) so the empty white slot is at the front right, then rotate the top face so the remaining white corner is in the bottom right of the top face.',
      animation: {
        state: S3,
        alg: STEP4,
        outlineMoves: true,
        highlightAfter: TOP_FRONT_RIGHT,
      },
      algorithms: [],
    },
    {
      slug: 'insert-last',
      name: 'Step 5: Insert the Last Corner',
      description: 'Repeat step 3.',
      animation: {
        state: S4,
        alg: STEP5,
        outlineMoves: true,
        highlightAfter: [{ face: 'F', indices: [2, 3] }, { face: 'R', indices: [2, 3] }],
        caption: 'The white layer is now solved, and the bottom row of every side matches.',
      },
      algorithms: [],
    },
    {
      slug: 'yellow-top',
      name: 'Step 6: Yellow Top',
      description: `With white on bottom, repeat the following until top face is all yellow: ${ORIENT}`,
      figures: [
        {
          state: S5,
          groups: [{ face: 'U', indices: [0] }],
          caption:
            'If you end up with a single yellow corner on top, you want it in the top left position when you execute the algorithm.',
        },
        {
          state: TWO_YELLOW,
          view: FROM_LEFT,
          groups: [{ face: 'L', indices: [0] }],
          caption:
            'If there are no yellow corners or two yellow corners on top, turn the top so a yellow sticker faces left on the back-left corner, then execute the algorithm.',
        },
      ],
      animation: {
        state: S5,
        alg: ORIENT,
        outlineMoves: true,
        highlightAfter: [{ face: 'U', indices: [0, 1, 2, 3] }],
        caption: 'In this example the single yellow corner is already in the top left, so one round makes the top all yellow.',
      },
      algorithms: [],
    },
    {
      slug: 'yellow-corners',
      name: 'Step 7: Orient the Yellow Corners',
      description: 'Orient the yellow corners.',
      figures: [
        {
          state: S6,
          groups: [{ face: 'R', indices: [0, 1] }],
          caption:
            "In most cases, you will have a side that is actually paired up correctly. If so, move this to the right face with yellow on top. Then do U'.",
        },
      ],
      animation: {
        state: S6,
        alg: STEP7,
        outlineMoves: true,
      },
      algorithms: [],
    },
    {
      slug: 'swap',
      name: 'Step 8: Finish',
      description: `Repeat ${SWAP} until solved or you are in case 7a.`,
      animation: {
        state: S7,
        alg: SWAP,
        outlineMoves: true,
      },
      closing: {
        text: 'The cube ends with white facing you. Turn it so white is back on the bottom, then turn the top face to finish.',
        figure: {
          state: S8,
          animation: { alg: FINISH, outlineMoves: true },
          caption: "Here that is x' (turning the whole cube) and then U.",
        },
      },
      algorithms: [],
    },
  ],
}
