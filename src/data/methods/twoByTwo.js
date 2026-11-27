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
// turn the bottom so the whole right side matches the headlights, then U'
const STEP7 = "D U'"

const S1 = applyAlg(SCRAMBLE, STEP1)
// Step 1's goal: the two white-blue corners on the top left, white as a bar on top, blue facing left.
// Turning the whole cube upside down (x2) gives the Step 2 hold: white down, blue on the left.
const FLIP = "x2'"
const PAIRED = applyAlg(S1, FLIP)
const S2 = applyAlg(S1, STEP2)
const S3 = applyAlg(S2, STEP3)
const S4 = applyAlg(S3, STEP4)
const S5 = applyAlg(S4, STEP5)
const S6 = applyAlg(S5, ORIENT)
const S7 = applyAlg(S6, STEP7)

// Bottom solved with two yellow corners on top, turned so a yellow sticker faces left on the
// back-left corner (the 6b set-up).
const TWO_YELLOW = applyAlg(solvedState(2), "z2 y' F R U R' U' F' U2")

// Sticker indices (2x2): U/D 0 back-left 1 back-right 2 front-left 3 front-right as seen from above
// (D: 0 front-left 1 front-right 2 back-left 3 back-right as seen from below); side faces
// 0 top-left 1 top-right 2 bottom-left 3 bottom-right as you look at that face.
const TOP_FRONT_RIGHT = [{ face: 'U', indices: [3] }, { face: 'F', indices: [1] }, { face: 'R', indices: [0] }]
// Pieces as [column from left, row from bottom, depth from back]
const TOP_LEFT_PAIR = [[0, 1, 1], [0, 1, 0]]
const WHITE_BAR = [{ face: 'U', indices: [0, 2] }]
// pale blue, so outlines stand out against white stickers
const ON_WHITE = '#7DD3FC'

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
      description: 'Arrange these pieces next to each other.',
      figures: [
        {
          state: PAIRED,
          pieces: TOP_LEFT_PAIR,
          highlightColor: ON_WHITE,
          caption: 'The two white corners that share blue, side by side, with white as a bar on the upper face.',
        },
      ],
      algorithms: [],
    },
    {
      slug: 'white-red',
      name: 'Step 2: Position the White-Red Corner',
      description:
        'Keeping white on bottom left, move the corner with white and red faces to the bottom right corner of the top half.',
      // the whole cube turns upside down (no face turn), taking the white bar to the bottom left
      animation: {
        state: PAIRED,
        alg: FLIP,
        highlightBefore: WHITE_BAR,
        highlightColor: ON_WHITE,
        caption: 'Turn the whole cube upside down, so the white bar from step 1 ends up on the bottom left with white facing down.',
      },
      closing: {
        figure: {
          state: S1,
          animation: {
            alg: STEP2,
            outlineMoves: true,
            // red on the front of the white bar, then red on the corner that will drop in beside it
            highlightBefore: [{ face: 'F', indices: [2] }],
            highlightAfter: [{ face: 'F', indices: [2] }, { face: 'R', indices: [0] }],
          },
          caption:
            'Note the red sticker facing you on the white bar below: the corner that drops in next to it must also have red. Of the two white corners left, only one has any red on it, so there is only one choice. Then, in this example, a single `U` brings the white-red corner to the top front-right, directly above the location it needs to go.',
        },
      },
      algorithms: [],
    },
    {
      slug: 'insert',
      name: 'Step 3: Insert the Corner',
      quick: [
        { label: 'Insert a white corner (repeat until it is in)', moves: INSERT, ref: '3a', state: S2, groups: TOP_FRONT_RIGHT },
      ],
      description:
        "Do `R U R' U'` until the corner is slotted in and correctly oriented (may take a few times).",
      animation: {
        state: S2,
        alg: STEP3,
        outlineMoves: true,
        // the inserted corner, with its red now beside the red of the white bar
        highlightAfter: [{ face: 'F', indices: [2, 3] }, { face: 'R', indices: [2] }],
        caption: "This corner needs `R U R' U'` three times.",
      },
      algorithms: [],
    },
    {
      slug: 'last-white',
      name: 'Step 4: Position the Last White Corner',
      description:
        'Turn the whole cube (`y`) so the empty white slot is at the front right. Then rotate the top face so the remaining white corner is directly above the location it needs to go, as in step 2b.',
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
        caption: 'The bottom half of the cube is now completely solved, with white on the bottom.',
      },
      algorithms: [],
    },
    {
      slug: 'yellow-top',
      name: 'Step 6: Yellow Top',
      quick: [
        { label: 'All yellow on top (repeat)', moves: ORIENT, ref: '6c', state: S5, groups: [{ face: 'U', indices: [0] }] },
      ],
      description: `With white on bottom, repeat the following until top face is all yellow: \`${ORIENT}\``,
      figures: [
        {
          state: S5,
          groups: [{ face: 'U', indices: [0] }],
          caption:
            'If you end up with a single yellow corner on top, you want it in the top left position when you execute the algorithm.',
        },
        {
          state: TWO_YELLOW,
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
            "In most cases, you will have a side that is actually paired up correctly. If so, move this to the right face with yellow on top, and rotate the bottom of the cube until the entire right side (green in this example) is solved. Then do `U'`.",
        },
      ],
      animation: {
        state: S6,
        alg: STEP7,
        outlineMoves: true,
        caption: "Here the pair is already on the right, so `D` lines up the green bottom under it, then `U'`.",
      },
      algorithms: [],
    },
    {
      slug: 'swap',
      name: 'Step 8: Finish',
      quick: [
        { label: "Finish (after lining up green face and doing U')", moves: SWAP, ref: '8a', state: S7 },
      ],
      description: `Do \`${SWAP}\`.`,
      animation: {
        state: S7,
        alg: SWAP,
        outlineMoves: true,
      },
      closing: {
        text: 'The cube ends with white facing you. Turn it so white is back on the bottom. The cube is now either solved, or you will have to repeat steps 7 and 8 one more time.',
      },
      algorithms: [],
    },
  ],
}
