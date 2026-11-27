import { applyAlg } from '../../lib/cube3d.js'

// Example solve on the 2x2x3 tower (2 wide, 3 tall, 2 deep), held (after step 1) with white on the
// bottom, blue at the front and green at the back. Every later state is this one with the documented moves
// applied (see applyAlg), so the example follows one real solve.
// Step 1a's result: the white-blue corners paired as a bar on top, blue facing you; the white-green
// corners already paired on the bottom.
const START = {
  U: ['Y', 'Y', 'W', 'W'],
  D: ['Y', 'W', 'Y', 'W'],
  F: ['B', 'B', 'R', 'O', 'O', 'R'],
  B: ['R', 'G', 'R', 'O', 'O', 'G'],
  R: ['O', 'B', 'G', 'G', 'G', 'G'],
  L: ['O', 'R', 'B', 'B', 'R', 'B'],
}

// On the tower the R, F and B faces can only turn halfway, so R and R' (F and F', B and B') are the
// same move.
// M turns the middle layer.
// turn the whole tower over (the bar lands on the bottom at the front, blue facing you); U brings the
// green pair to the back and B brings it down
const STEP1B = 'z2 U B'
const SWAP = "R U R U' R F U' F U F"
// after the swap the corners are right relative to each other; one top turn lines them up
const ALIGN = "U'"
const SWAP_MIDDLE = 'R U2 R U2 R U2'
const MATCH = 'R M R'

const S1 = applyAlg(START, STEP1B)
const S2 = applyAlg(S1, `${SWAP} ${ALIGN}`)
// different cubes with the top and bottom solved, for the other middle-layer cases
const CASE_A = applyAlg(applyAlg(START, `${STEP1B} ${SWAP} ${ALIGN} ${MATCH}`), SWAP_MIDDLE)
const CASE_C = applyAlg(applyAlg(START, `${STEP1B} ${SWAP} ${ALIGN} ${MATCH} y ${MATCH} y'`), SWAP_MIDDLE)

// Sticker indices (2x2x3): U/D 0 back-left 1 back-right 2 front-left 3 front-right as seen from above
// (D: 0 front-left 1 front-right 2 back-left 3 back-right as seen from below); side faces 0-1 the top
// row, 2-3 the middle row and 4-5 the bottom row, left to right as you look at that face.
// pale blue, so outlines stand out against white stickers
const ON_WHITE = '#7DD3FC'
// outline each sticker on its own (the quick reference pictures)
const one = (stickers) => stickers.map(([face, i]) => ({ face, indices: [i] }))

export const twoByTwoByThreeNotation = {
  intro:
    'Hold the tower with one face toward you. Each face is named by where it is: U (up), F (front) and R (right). This method only needs the moves below.',
  figures: [
    {
      state: START,
      labels: { U: 'U', F: 'F', R: 'R' },
      caption: 'U, F and R are the top, front and right faces.',
    },
  ],
  directions:
    "A letter on its own means turning that face clockwise, as if you were looking straight at it, and an apostrophe (') means counterclockwise. A 2 means do the move twice (U2 is U then U again). The R, F and B faces can only turn halfway, so R, F and B are always half turns. M turns the middle layer counterclockwise as seen from above, and M' turns it clockwise.",
  state: START,
  moves: [
    { notation: 'R', label: 'Right face, half turn' },
    { notation: 'U', label: 'Top face, clockwise' },
    { notation: "U'", label: 'Top face, counterclockwise' },
    { notation: 'F', label: 'Front face, half turn' },
    { notation: 'B', label: 'Back face, half turn', labels: { B: 'B' } },
    { notation: 'M', label: 'Middle layer, counterclockwise from above' },
    { notation: "M'", label: 'Middle layer, clockwise from above' },
  ].map(m => ({ ...m, animation: { alg: m.notation, outlineMoves: true, loop: true } })),
}

export const twoByTwoByThreeMethod = {
  name: "Beginner's Method",
  description: 'Solve the white bottom first, then the yellow top, then the middle layer.',
  notation: twoByTwoByThreeNotation,
  previewState: START,
  stages: [
    {
      slug: 'white-bottom',
      name: 'Step 1: White on Bottom',
      description: 'Solve the white face on the bottom.',
      figures: [
        {
          state: START,
          groups: [{ face: 'U', indices: [2, 3] }, { face: 'F', indices: [0, 1] }],
          highlightColor: ON_WHITE,
          caption: 'Pair the two white corners that contain blue edges: a white bar with blue on its side.',
        },
      ],
      animation: {
        state: START,
        alg: STEP1B,
        outlineMoves: true,
        highlightBefore: [{ face: 'U', indices: [2, 3] }, { face: 'F', indices: [0, 1] }],
        highlightAfter: [{ face: 'F', indices: [4, 5] }],
        highlightColor: ON_WHITE,
        caption:
          'Turn the entire cube over so this white bar is on the bottom. You will have to pair the other two white corners on the top to form another white bar. After doing that, you may have to rotate `U`, and then bring that second white bar down to the bottom.',
      },
      algorithms: [],
    },
    {
      slug: 'yellow-top',
      name: 'Step 2: Solve the Top Face',
      quick: [
        { label: 'Swap the two top-right corners', moves: "(R U R U' R) (F U' F U F)", ref: '2a', state: S1, groups: one([['F', 1], ['R', 0], ['R', 1]]) },
      ],
      description: 'Solve the top face.',
      animation: {
        state: S1,
        alg: `${SWAP} ${ALIGN}`,
        outlineMoves: true,
        highlightBefore: [{ face: 'F', indices: [1] }, { face: 'R', indices: [0, 1] }],
        highlightAfter: [{ face: 'F', indices: [0, 1] }, { face: 'R', indices: [0, 1] }],
        caption: `To swap places of the two corners on the top right of the cube: \`(R U R U' R) (F U' F U F)\`. You will need to do this at most two times. Repeat until yellow face is solved on top. In this example a final \`${ALIGN}\` then lines the top up with the bottom.`,
      },
      algorithms: [],
    },
    {
      slug: 'middle-layer',
      name: 'Step 3: Middle Layer',
      quick: [
        { label: 'Swap the two right middle edges', moves: '(R U2) (R U2) (R U2)', ref: '3a', state: CASE_A, groups: one([['F', 3], ['R', 2], ['R', 3]]) },
        { label: 'No adjacent edges match: R, then M R if they match', moves: MATCH, ref: '3b', state: S2 },
      ],
      description:
        'Rotate the top and bottom so that they align with each other (e.g. blues and reds are lined up in this example). In the middle row there are three possibilities here:',
      // a different cube: the two right middle pieces are swapped
      animation: {
        state: CASE_A,
        alg: SWAP_MIDDLE,
        outlineMoves: true,
        highlightBefore: [{ face: 'F', indices: [3] }, { face: 'R', indices: [2, 3] }],
        highlightAfter: [{ face: 'F', indices: [2, 3] }, { face: 'R', indices: [2, 3] }],
        caption: '2 adjacent pieces match. To swap the mismatched middle edges, place them on the right and do `3(R U2)`.',
      },
      closing: {
        figures: [
          {
            state: S2,
            animation: {
              alg: MATCH,
              outlineMoves: true,
              // after R the middle edges match: the front pair and the back pair (shown through the tower)
              pause: { after: 0, highlight: [{ face: 'F', indices: [2, 3] }, { face: 'B', indices: [2, 3] }] },
              highlightAfter: [{ face: 'F', indices: [2, 3] }, { face: 'R', indices: [2, 3] }],
            },
            caption:
              'No adjacent edges match. Test positioning by doing `R` and seeing if middle edges match (you may need to rotate the entire cube a few times to check all possibilities). If they do, do `M R`.',
          },
          {
            // a different cube where no position gives a match after R
            state: CASE_C,
            animation: {
              alg: SWAP_MIDDLE,
              outlineMoves: true,
            },
            caption:
              'No adjacent edges match AND there is no way to get a match by doing step 3b. In this case do `3(R U2)`, then follow step 3a or 3b again, as appropriate.',
          },
        ],
      },
      algorithms: [],
    },
  ],
}
