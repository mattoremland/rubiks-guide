import { applyAlg, solvedState } from '../../lib/cube3d.js'

// Held like the 3x3x3: white on top, red in front, blue on the right.
const HOLD = applyAlg(solvedState(4), 'y')
const SCRAMBLE = applyAlg(HOLD, "R2 Uw' F L2 Rw B' D2 u R' Fw2 U L' r2 B Dw R U2 F' Lw D' B2 u' R F2")

// the user's angle for showing the left and bottom faces (same as the 3x3x3 L and D cards)
const LOW_VIEW = { x: 25, y: -20 }

const card = (m) => ({ ...m, animation: { alg: m.notation, outlineMoves: true, loop: true } })

export const fourByFourNotation = {
  intro:
    'Hold the cube with one face toward you. Each face is named by where it is: U (up), D (down), F (front), B (back), L (left) and R (right). A 4x4x4 has four layers each way, so besides the outer faces you can also turn the inner layers.',
  figures: [
    {
      state: SCRAMBLE,
      labels: { U: 'U', F: 'F', R: 'R' },
      caption: 'U, F and R are the top, front and right faces. L, D and B are the left, bottom and back faces, hidden here.',
    },
  ],
  directions:
    "A letter on its own means turning that face clockwise, as if you were looking straight at it. An apostrophe (') means counterclockwise, and a 2 means do the move twice (U2 is U then U again).",
  state: SCRAMBLE,
  moves: [
    { notation: 'R', label: 'Right face, clockwise' },
    { notation: "R'", label: 'Right face, counterclockwise' },
    { notation: 'U', label: 'Top face, clockwise' },
    { notation: "U'", label: 'Top face, counterclockwise' },
    { notation: 'F', label: 'Front face, clockwise' },
    { notation: "F'", label: 'Front face, counterclockwise' },
    { notation: 'L', label: 'Left face, clockwise', view: LOW_VIEW, labels: { U: 'U', L: 'L', F: 'F' } },
    { notation: "L'", label: 'Left face, counterclockwise', view: LOW_VIEW, labels: { U: 'U', L: 'L', F: 'F' } },
    { notation: 'D', label: 'Bottom face, clockwise', view: LOW_VIEW, labels: { L: 'L', F: 'F', D: 'D' } },
    { notation: "D'", label: 'Bottom face, counterclockwise', view: LOW_VIEW, labels: { L: 'L', F: 'F', D: 'D' } },
    { notation: 'B', label: 'Back face, clockwise', labels: { B: 'B' } },
    { notation: "B'", label: 'Back face, counterclockwise', labels: { B: 'B' } },
  ].map(card),
  sections: [
    {
      text:
        'A w after the letter means a wide turn: turn that face together with the inner layer next to it, so half the cube turns at once. Rw turns the right two layers, Lw the left two, Dw the bottom two and Uw the top two. They turn the same way as R, L, D and U.',
      moves: [
        { notation: 'Rw', label: 'Right two layers, clockwise' },
        { notation: "Rw'", label: 'Right two layers, counterclockwise' },
        { notation: 'Lw', label: 'Left two layers, clockwise', view: LOW_VIEW, labels: { U: 'U', F: 'F' } },
        { notation: "Lw'", label: 'Left two layers, counterclockwise', view: LOW_VIEW, labels: { U: 'U', F: 'F' } },
        { notation: 'Dw', label: 'Bottom two layers, clockwise', view: LOW_VIEW, labels: { L: 'L', F: 'F' } },
        { notation: "Dw'", label: 'Bottom two layers, counterclockwise', view: LOW_VIEW, labels: { L: 'L', F: 'F' } },
        { notation: 'Uw', label: 'Top two layers, clockwise' },
      ].map(card),
    },
    {
      text:
        "A lowercase letter turns only the inner layer next to that face, leaving the face itself where it is: r is the second layer from the right, and u is the second layer from the top. They turn the same way as R and U. (Some guides use lowercase letters for wide turns instead; on this site a lowercase letter is always a single inner layer.)",
      moves: [
        { notation: 'r', label: 'Second layer from the right, clockwise' },
        { notation: "r'", label: 'Second layer from the right, counterclockwise' },
        { notation: 'u', label: 'Second layer from the top, clockwise' },
        { notation: "u'", label: 'Second layer from the top, counterclockwise' },
      ].map(card),
    },
    {
      text:
        'x turns the whole cube toward the back, the same way as R: the front face ends up on top. y turns the whole cube the same way as U: the front face ends up on the left. Nothing is scrambled; you are just holding the cube differently.',
      moves: [
        { notation: 'x', label: 'Whole cube, toward the back' },
        { notation: 'y', label: 'Whole cube, to the left' },
      ].map(card),
    },
  ],
}

// Step 1: the white center, built as two white bars brought together. The setup moves (not shown)
// make the centers match the user's photo: three white center pieces on the front, the fourth on top.
const C = [5, 6, 9, 10] // the four center stickers of a face
const S1 = applyAlg(SCRAMBLE, "F' f d b2 U b' U' f l' f l")
const WHITE_BARS = "Lw' U' Lw"
const WHITE_CENTER = applyAlg(S1, WHITE_BARS)
const ON_WHITE = '#7DD3FC'

// Step 2: the yellow center, opposite white. x2 puts white at the back; the setup moves (not shown)
// keep the white center whole and make the top and front centers match the user's second photo.
const TURN_AROUND = 'x2'
const WHITE_BACK = applyAlg(WHITE_CENTER, TURN_AROUND)
const S2 = applyAlg(WHITE_BACK, "U' f' r2 D2 r2 U R' f' U' u L2 u' L u' F' u F u F' u' F'")
const ELEVATOR = "Rw U2 Rw'"
const STEP2_END = applyAlg(S2, ELEVATOR)

// Step 3: the other centers. Held with yellow on the left and white on the right (y); red is solved on
// top with the user's F2 Rw' F' Rw, x2 puts it on the bottom for green (front), and x' brings orange to
// the front, which leaves blue solved on top. The setup moves (not shown) finish the yellow center and
// place the other center pieces so the user's moves solve each color.
const S3 = applyAlg(STEP2_END, "D f L' f2 L f' D' f2 D f D' r2 D f' D' r2 U' f U r' U' f' U r R b' R' d2 R b R' d2 B u B' l B u' B' l' R u2 L' u2 L u2 R' u2 u R u' f' u R' u' f R' u2 R d2 R' u2 R d2")
const RED = "y F2 Rw' F' Rw"
const GREEN = "x2 Rw U Rw' Lw' U Lw"
const ORANGE = "x' U2 Lw' U' Lw"
const RED_DONE = applyAlg(S3, RED)
const GREEN_DONE = applyAlg(RED_DONE, GREEN)
const CENTERS_DONE = applyAlg(GREEN_DONE, ORANGE)

// Step 4: pair the edges. The algorithm swaps the upper piece of the front-right edge with the lower
// piece of the front-left edge, so two matching pieces lined up across the front (same height, same
// color facing front) end up together on the right. The setup moves (U2 F, not shown) line up a red/yellow pair.
const PAIR_EDGES = "Dw R F' U R' F Dw'"
const S4 = applyAlg(CENTERS_DONE, 'U2 F')
// The same algorithm pairs two matching pieces lined up across the upper middle row: they end up
// together on the left. F' (not shown) lines up a blue/orange pair there after 4a.
const S4B = applyAlg(applyAlg(S4, PAIR_EDGES), "F'")
// the rest of the edges, each lined up by the setup moves shown here and paired with the algorithm
const MORE_PAIRS = ["U' F", "U' L", 'R', "U R'", "D' R", "F' L2", "U R'", "B U' L"]
const EDGES_PAIRED = MORE_PAIRS.reduce((st, setup) => applyAlg(st, `${setup} ${PAIR_EDGES}`), applyAlg(S4B, PAIR_EDGES))

// Step 5: solve it like a 3x3x3. The parity cases are shown on their own cubes, made from a solved
// cube held as on the 3x3x3 page: green in front, orange on top and yellow on the left for the
// flipped edge (as in 3x3x3 step 3), green on top for the last-layer edges (as in 3x3x3 step 6).
const FLIP_EDGE = "(Rw U2) x (Rw U2) (Rw U2) (Rw' U2) (Lw U2) (Rw' U2) (Rw U2) (Rw' U2) Rw'"
const SWAP_ACROSS = 'r2 U2 r2 Uw2 r2 u2'
const EDGE_CYCLE = "(F2 U L R') (F2 L' R U) F2" // 3x3x3 step 6f
const SOLVED = applyAlg(solvedState(4), 'y')
const inverse = (alg) => alg.replace(/[()]/g, ' ').trim().split(/\s+/).reverse()
  .map(t => (t.endsWith("'") ? t.slice(0, -1) : t.endsWith('2') ? t : `${t}'`)).join(' ')
// a scramble that keeps every edge correctly oriented, then the green/orange edge flipped at the top front
const ONE_FLIPPED = applyAlg(applyAlg(applyAlg(SOLVED, "z x'"), "F2 L2 U' R' F2 L2 R2"), inverse(FLIP_EDGE))
const GREEN_TOP = applyAlg(SOLVED, 'z y2')
const ACROSS = applyAlg(GREEN_TOP, inverse(SWAP_ACROSS))
// the front and right edges on top switched (green on top, white in front)
const NEXT_TO = applyAlg(GREEN_TOP, inverse(`${SWAP_ACROSS} y ${EDGE_CYCLE}`))
// outline each sticker on its own (the quick reference pictures)
const one = (stickers) => stickers.map(([face, i]) => ({ face, indices: [i] }))
const TOP_EDGE = [{ face: 'U', indices: [13, 14] }, { face: 'F', indices: [1, 2] }]

export const fourByFourMethod = {
  name: 'Reduction Method',
  callout:
    'Important: the 4x4x4 does *not* have fixed centers. On a 3x3x3 the center pieces never move, so they tell you where each color goes. On a 4x4x4 each center is four loose pieces that move around, so we build the centers ourselves, and we need to solve them in a particular orientation: white opposite yellow, red opposite orange and blue opposite green, with blue to the right of red when white is on top.',
  description: '',
  notation: fourByFourNotation,
  previewState: SCRAMBLE,
  stages: [
    {
      slug: 'white-center',
      name: 'Step 1: The White Center',
      description: 'Step 1 is to solve the white center. We do this by forming two white bars and bringing them together.',
      animation: {
        state: S1,
        alg: WHITE_BARS,
        outlineMoves: true,
        highlightBefore: [{ face: 'F', indices: [5, 6, 10] }, { face: 'U', indices: [6] }],
        highlightAfter: [{ face: 'F', indices: C }],
        highlightColor: ON_WHITE,
        caption:
          "If we encounter this situation, we can do `Lw' U' Lw` to solve the white center. Here: `Lw'` lifts the left half up, so the front's white joins the white on top to make a second bar; `U'` turns that bar to sit above the gap, and `Lw` brings it back down next to the first bar.",
      },
      algorithms: [],
    },
    {
      slug: 'yellow-center',
      name: 'Step 2: The Yellow Center',
      description:
        'We then rotate the cube so white is at the back. We need to solve the yellow center directly opposite the white center.',
      animation: {
        state: WHITE_CENTER,
        alg: TURN_AROUND,
        highlightBefore: [{ face: 'F', indices: C }],
        highlightColor: ON_WHITE,
        caption: '`x2` turns the whole cube toward the back twice, so the white center ends up at the back.',
      },
      note:
        "Here we have more limited freedom because we don't want to break up the white center. Turning any outer face is safe, but `r`, `l`, `u` and `d` (and the wide turns) carry part of the white center away, unless we undo them right after.",
      algorithms: [
        {
          name: 'The elevator',
          moves: ELEVATOR,
          setupState: S2,
          animation: {
            alg: ELEVATOR,
            outlineMoves: true,
            highlightBefore: [{ face: 'U', indices: [5, 9] }],
            highlightAfter: [{ face: 'F', indices: [6, 10] }],
          },
          caseDescription:
            "We can do a move like `Rw U2 Rw'` to go up and bring that yellow bar down to the front face. `Rw` lifts the right half of the front up, `U2` swings the yellow bar into its place, and `Rw'` brings it back down. The white center goes down and comes back up untouched.",
          tips: 'This move is called the elevator. We will be using it a lot throughout this cube.',
        },
      ],
    },
    {
      slug: 'other-centers',
      name: 'Step 3: The Remaining Centers',
      description:
        'After solving the yellow center, we want to solve the red center. We do this by holding the cube with the yellow center on the left and the white center on the right. Red can be solved anywhere - use the elevator repeatedly to solve it.',
      animation: {
        state: S3,
        alg: RED,
        outlineMoves: true,
        pause: { after: 0, highlight: [{ face: 'U', indices: [5, 9, 10] }, { face: 'F', indices: [6] }] },
        highlightAfter: [{ face: 'U', indices: C }],
        caption:
          "Here: `y` turns the cube so yellow is on the left and white on the right, and `F2 Rw' F' Rw` solves red on the top. `F2` moves the front's red to the bottom left, `Rw'` brings the top's right column (with the gap) down to the front, `F'` turns the red into that column, and `Rw` takes the column back up.",
      },
      algorithms: [],
      closing: {
        figures: [
          {
            state: RED_DONE,
            animation: {
              alg: GREEN,
              outlineMoves: true,
              pause: { after: 0, highlight: [{ face: 'U', indices: [5, 10] }, { face: 'F', indices: [6, 9] }] },
              highlightAfter: [{ face: 'F', indices: C }],
            },
            caption:
              "After the red center, we do `x2` so red is on the bottom, and then solve the green center: `Rw U Rw'`, then `Lw' U Lw`. `Rw` lifts the front's right column (with its green) up beside a green on top, `U` turns both into that column, and `Rw'` brings them down. `Lw' U Lw` does the same on the left.",
          },
          {
            state: GREEN_DONE,
            animation: {
              alg: ORANGE,
              outlineMoves: true,
              pause: { after: 0, highlight: [{ face: 'U', indices: [9] }, { face: 'F', indices: [5, 6, 10] }] },
              highlightAfter: [{ face: 'F', indices: C }, { face: 'U', indices: C }],
            },
            caption:
              "Then do `x'` and solve the orange center: `U2 Lw' U' Lw`. By doing this the blue center will automatically be solved.",
          },
        ],
      },
    },
    {
      slug: 'edges',
      name: 'Step 4: Pair the Edges',
      quick: [
        { label: 'Pair two pieces across the front', moves: PAIR_EDGES, ref: '4a', state: S4, groups: one([['F', 8], ['F', 11]]) },
      ],
      description:
        "Step 4 is to pair the edges. We could do this with slicing, but we'll use just one algorithm to solve all edges. We line up two middle edges directly across from each other and do: `Dw R F' U R' F Dw'`. This will pair these two inner edges. We don't need them to be near any particular center, we just pair them first. Repeat until all inner edges are paired.",
      animation: {
        state: S4,
        alg: PAIR_EDGES,
        outlineMoves: true,
        // the left piece's yellow is on the hidden left face, shown faintly through the cube
        highlightBefore: [{ face: 'F', indices: [8] }, { face: 'L', indices: [11] }, { face: 'F', indices: [11] }, { face: 'R', indices: [8] }],
        highlightAfter: [{ face: 'F', indices: [7, 11] }, { face: 'R', indices: [4, 8] }],
        caption:
          "Here two matching pieces sit directly across from each other on the front face, both in the lower middle row with the same color facing front. `Dw R F' U R' F Dw'` brings them together on the right.",
      },
      algorithms: [],
      closing: {
        figures: [
          {
            state: S4B,
            animation: {
              alg: PAIR_EDGES,
              outlineMoves: true,
              highlightBefore: [{ face: 'F', indices: [4] }, { face: 'L', indices: [7] }, { face: 'F', indices: [7] }, { face: 'R', indices: [4] }],
              highlightAfter: [{ face: 'F', indices: [4, 8] }],
            },
            caption:
              "This exact same algorithm also pairs the two inner edges above the ones in 4a, which is useful if you find a pair there instead of in the lower row. Here two matching pieces sit across from each other in the upper middle row, and `Dw R F' U R' F Dw'` brings them together on the left.",
          },
          {
            state: EDGES_PAIRED,
            caption: 'Repeat until all inner edges are paired.',
          },
        ],
      },
    },
    {
      slug: 'like-a-3x3',
      name: 'Step 5: Solve It Like a 3x3x3',
      quickNote: 'Solve it as a [3x3x3](/puzzle/3x3), with these extra cases:',
      quick: [
        { label: 'A single flipped edge, held top front', moves: FLIP_EDGE, ref: '5a', state: ONE_FLIPPED, groups: one([['U', 13], ['U', 14], ['F', 1], ['F', 2]]) },
        { label: 'Two edges across from each other', moves: SWAP_ACROSS, ref: '5b', state: ACROSS, groups: one([['F', 1], ['F', 2]]) },
        { label: 'Two edges next to each other', moves: `(${SWAP_ACROSS}) y ${EDGE_CYCLE}`, ref: '5c', state: NEXT_TO, groups: one([['F', 1], ['F', 2], ['R', 1], ['R', 2]]) },
      ],
      description:
        'We have now reduced the 4x4x4 to behaving like a 3x3x3: we can solve it using the exact same process as the 3x3x3.',
      figures: [
        {
          state: EDGES_PAIRED,
          groups: [{ face: 'U', indices: C }, { face: 'F', indices: C }, { face: 'R', indices: C }],
          unlabeled: true,
          caption: 'Each 2x2 center is equivalent to the center of a 3x3x3 face.',
        },
        {
          state: EDGES_PAIRED,
          groups: [...TOP_EDGE, { face: 'F', indices: [7, 11] }, { face: 'R', indices: [4, 8] }],
          unlabeled: true,
          caption: 'Each paired edge is equivalent to the middle edge of a 3x3x3.',
        },
      ],
      footer: 'So we can solve it as if it were a 3x3x3 now.',
      note:
        "There are two things that can happen with this cube that couldn't happen there though, so we need to address them if they come up. This is because of the evenness parity on a 4x4x4 cube.",
      algorithms: [
        {
          name: 'A single flipped edge',
          moves: FLIP_EDGE,
          setupState: ONE_FLIPPED,
          animation: { alg: FLIP_EDGE, outlineMoves: true, highlightBefore: TOP_EDGE, highlightAfter: TOP_EDGE },
          caseDescription:
            'When solving the yellow/green cross on the 3x3x3, there are always an even number of edges that need to be fixed. This is NOT true for the 4x4x4: it is possible that after solving a few pairs of edges on that step (step 3 on the 3x3x3 page), there is a single edge on the 4x4x4 that is incorrectly oriented. We solve it by doing the following, with the incorrect edge in the top front of the cube.',
          tips: 'Held as in step 3 of the 3x3x3 (green in front, orange on top, yellow on the left). Here the green/orange edge at the top front has its green facing up instead of to the front.',
        },
        {
          name: 'Two edges across from each other',
          moves: SWAP_ACROSS,
          setupState: ACROSS,
          animation: {
            alg: SWAP_ACROSS,
            outlineMoves: true,
            highlightBefore: [{ face: 'F', indices: [1, 2] }, { face: 'B', indices: [1, 2] }],
            highlightAfter: [{ face: 'F', indices: [1, 2] }],
          },
          caseDescription:
            "The other potential parity issue arises when we get to solving the top row of the 4x4x4. On the 3x3x3, we only show one algorithm for rotating three edges ([step 6f on that page](/puzzle/3x3#step-6f)). This is because on the 3x3, it is not possible for there to only be two edges that don't match. But on the 4x4x4 it IS possible. We could either have two across from each other that don't match, or two next to each other that don't match. This algorithm switches two across from each other.",
          tips: 'Held as in step 6 of the 3x3x3 (green on top). Here the front and back edges on top are switched.',
        },
        {
          name: 'Two edges next to each other',
          moves: SWAP_ACROSS,
          setupState: NEXT_TO,
          animation: {
            alg: SWAP_ACROSS,
            outlineMoves: true,
            highlightBefore: [{ face: 'F', indices: [1, 2] }, { face: 'R', indices: [1, 2] }],
            // at the end three edges on top are wrong (the back one shown through the cube)
            pause: { after: 5, highlight: [{ face: 'F', indices: [1, 2] }, { face: 'R', indices: [1, 2] }, { face: 'B', indices: [1, 2] }] },
          },
          caseDescription:
            'If we have two next to each other that need to be switched, but the other two are correct, we can still do this algorithm to force three edges to be incorrect, then use the original algorithm from the 3x3x3 to solve.',
          tips: 'Here the front and right edges on top are switched. After `r2 U2 r2 Uw2 r2 u2` three edges are wrong and the left one is correct, a case we know how to solve from step 6f of the 3x3x3.',
        },
      ],
    },
  ],
}
