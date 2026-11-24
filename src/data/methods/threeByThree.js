import { applyAlg, solvedState } from '../../lib/cube3d.js'

// Example solve. Starts held with white on top, red at the front and blue on the right; every later
// state is this scramble with the documented moves applied (see applyAlg), so the example follows
// one real solve.
const HOLD = applyAlg(solvedState(3), 'y')
const SCRAMBLE = applyAlg(HOLD, "D R D2 L D' L R U' F2 L2 B U' L' D' B R' B L2 B R2 U R'")

// Step 1: the inner cube (the white/red/blue 2x2x2 block at the top front right)
const CORNER = 'U2 F'
const WHITE_RED = "R' B U2 R"
const WHITE_BLUE = "F U' F'"
const RED_BLUE = "U' F' U"

const S1A = applyAlg(SCRAMBLE, CORNER)
const S1B = applyAlg(S1A, WHITE_RED)
const S1C = applyAlg(S1B, WHITE_BLUE)
const INNER_CUBE = applyAlg(S1C, RED_BLUE)

// Step 2: the inner tower, adding the white/blue/orange corner and the white/orange and blue/orange
// edges. Held with red on the bottom and white in front, only U, B and L turn.
const TURN_UP = "x'"
const ORANGE_CORNER = 'L'
// the blue/orange edge pairs on top; the white/orange edge then has to pair in the back face
const FIRST_EDGE = "L2 U' L2"
const SECOND_EDGE = "U L B L' U2"
// then with orange in front and red at the back (yellow top, green left, blue right, white bottom),
// U and L turn freely; this hold is used from here on
const CORE_HOLD = "x'"

const S2A = applyAlg(INNER_CUBE, TURN_UP)
const S2B = applyAlg(S2A, ORANGE_CORNER)
const S2C = applyAlg(S2B, FIRST_EDGE)
const INNER_TOWER = applyAlg(S2C, SECOND_EDGE)
const CORE = applyAlg(INNER_TOWER, CORE_HOLD)

// Step 3: orient the green and yellow edges. The camera tilts (the cube itself doesn't turn) from the
// orange-front hold to the user's angle (x 120, y 60, z 15 when held red-front; STEP3_TILT is the
// same picture in the orange-front hold). From here the faces are named with green as F, orange as U
// and yellow as L; STEP3_VIEW is that picture again in those terms.
const STEP3_TILT = { x: 25.5, y: -74, z: 48.5 }
const STEP3_VIEW = { x: 14.5, y: -26.5, z: -48.5 }
const GREEN_FRONT = applyAlg(CORE, "x y'")
// a bad edge goes to the top left and another to the front right, then U' F' U fixes both. The
// moves that put them there aren't shown.
const FIX = "U' F' U"
const ROUND_1 = "L'"
const ROUND_2 = "L' F L' F'"
const READY_TO_FIX = applyAlg(GREEN_FRONT, ROUND_1)
// after the last fix the green and yellow faces are turned a little more (L2 F); turning them never
// unfixes an edge
const EDGES_FIXED = applyAlg(READY_TO_FIX, `${FIX} ${ROUND_2} ${FIX} L2 F`)
// what the goal looks like: the same cube with the green and yellow crosses formed
const CROSSES = applyAlg(EDGES_FIXED, "L2 F L' F' L F2 L'")
const FIX_SPOTS = [{ face: 'U', indices: [3] }, { face: 'L', indices: [1] }, { face: 'F', indices: [5] }]
const CROSS_GROUPS = [{ face: 'F', indices: [1, 3, 4, 5, 7] }, { face: 'L', indices: [1, 3, 4, 5, 7] }]

// Step 4: back in the orange-front hold (yellow top, green left), U and L turn freely
const START_4 = applyAlg(EDGES_FIXED, 'z y')
const YELLOW_CORNER = "L' U'"
const YELLOW_BLUE = "U L U2 L'"
const YELLOW_ORANGE = "U L' U L U2"
const S4A = applyAlg(START_4, YELLOW_CORNER)
const S4B = applyAlg(S4A, YELLOW_BLUE)
const S5 = applyAlg(S4B, YELLOW_ORANGE)

// Step 5: pair the red/yellow/blue corner with the yellow/red edge. L' takes the corner to the back
// left corner of the top; each U' L U, L' changes its orientation (this example needs two rounds).
const FLIPS = "L' U' L U L' L' U' L U L'"
const PAIR = "L2 U' L2"
const PLACE_BAR = "U L' U' L U"
const S5A = applyAlg(S5, FLIPS)
const S5B = applyAlg(S5A, PAIR)
const S5C = applyAlg(S5B, PLACE_BAR)

// Step 6: the last (green) layer, held with green on top, orange in front and yellow on the right.
const S6 = applyAlg(S5C, 'z')
const SUNE = "R U R' U R U2 R'"
// the top cycles through the user's pictures 5, 4 (after U2), 2 and 3 (after U'); the middle two
// rounds aren't shown
const S6_LAST = applyAlg(S6, `${SUNE} U2 ${SUNE} ${SUNE}`)
const ALL_GREEN = applyAlg(S6_LAST, `U' ${SUNE}`)
const CORNER_SWAP = "R' F R' B2 R F' R' B2 R2"
const CORNERS_ONCE = applyAlg(ALL_GREEN, CORNER_SWAP)
const CORNERS_SET = applyAlg(CORNERS_ONCE, `U ${CORNER_SWAP} U2`)
const EDGE_CYCLE = "F2 U L R' F2 L' R U F2"
const EDGES_ONCE = applyAlg(CORNERS_SET, EDGE_CYCLE)

// The user's seven top patterns: which way each top corner's green sticker faces (U = up). The
// algorithm takes each to another of them, and the third finishes.
const TOP_PATTERNS = [
  { BL: 'B', BR: 'B', FL: 'F', FR: 'F' },
  { BL: 'L', FL: 'L', BR: 'B', FR: 'F' },
  { FL: 'U', BL: 'B', BR: 'R', FR: 'F' },
  { FR: 'U', BR: 'B', BL: 'L', FL: 'F' },
  { BL: 'U', BR: 'U', FL: 'F', FR: 'F' },
  { BR: 'U', FR: 'U', BL: 'B', FL: 'F' },
  { BL: 'U', FR: 'U', BR: 'R', FL: 'F' },
]

// Sticker indices (3x3): U 0-8 back-left to front-right as seen from above; side faces 0-8 from the
// top-left as you look at that face. Pieces as [column from left, row from bottom, depth from back].
const one = (face, i) => ({ face, indices: [i] })
const CORNER_AND_CENTERS = [one('U', 8), one('F', 2), one('R', 0), one('U', 4), one('F', 4), one('R', 4)]
const BLOCK_FACES = [{ face: 'U', indices: [4, 5, 7, 8] }, { face: 'F', indices: [1, 2, 4, 5] }, { face: 'R', indices: [0, 1, 3, 4] }]
// the inner cube after turning red to the bottom: its front and right faces
const LOW_BLOCK_FACES = [{ face: 'F', indices: [4, 5, 7, 8] }, { face: 'R', indices: [3, 4, 6, 7] }]
const TOWER_FACES = [{ face: 'U', indices: [4, 5, 7, 8] }, { face: 'F', indices: [1, 2, 4, 5, 7, 8] }, { face: 'R', indices: [0, 1, 3, 4, 6, 7] }]
// pale blue, so outlines stand out against white stickers
const ON_WHITE = '#7DD3FC'

// the left and bottom faces are shown from below, as on the 2x2x2's notation
const LOW_VIEW = { x: 25, y: -20 }

export const threeByThreeNotation = {
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
  ].map(m => ({ ...m, animation: { alg: m.notation, outlineMoves: true, loop: true } })),
}

export const threeByThreeMethod = {
  name: 'Block-Building Method',
  description: "Build a 2x2x2 'inner cube' first, then expand it.",
  notation: threeByThreeNotation,
  previewState: SCRAMBLE,
  stages: [
    {
      slug: 'inner-cube',
      name: 'Step 1: The Inner Cube',
      description:
        "Start by forming the 'inner cube': the white/red/blue corner, the white/red, white/blue and red/blue edges, and the white, red and blue centers. This is mostly done by intuition, getting a feel for how to move and orient the pieces. On a 3x3 the centers never move relative to each other, so every piece has to match the centers, not just the white one: the corner is only in place when its white, red and blue stickers all line up with the white, red and blue centers.",
      figures: [
        {
          state: INNER_CUBE,
          pieces: [{ at: [1, 1, 1], size: [2, 2, 2] }],
          highlightColor: ON_WHITE,
          caption: 'The inner cube, held with white on top, red in front and blue on the right.',
        },
      ],
      animation: {
        state: SCRAMBLE,
        alg: CORNER,
        outlineMoves: true,
        highlightBefore: [one('U', 2), one('R', 2)],
        highlightAfter: CORNER_AND_CENTERS,
        highlightColor: ON_WHITE,
        caption:
          "Start with the white/red/blue corner. Here U2 brings it to the front left and F turns it into place, with white, red and blue each matching their center.",
      },
      closing: {
        figures: [
          {
            state: S1A,
            animation: {
              alg: WHITE_RED,
              outlineMoves: true,
              highlightBefore: [one('R', 7)],
              highlightAfter: [{ face: 'U', indices: [7, 8] }, { face: 'F', indices: [1, 2] }],
              highlightColor: ON_WHITE,
            },
            caption:
              "Pair the white/red edge, here at the bottom right. A general strategy: with the corner where it belongs, drop it down out of the way (R', which also moves the edge to the back), bring the edge over to where it needs to go (B, U2), then bring the corner back up (R).",
          },
          {
            state: S1B,
            animation: {
              alg: WHITE_BLUE,
              outlineMoves: true,
              highlightBefore: [one('F', 3)],
              highlightAfter: [{ face: 'U', indices: [7, 8] }, one('U', 5), { face: 'F', indices: [1, 2] }, { face: 'R', indices: [0, 1] }],
              highlightColor: ON_WHITE,
            },
            caption:
              "Pair the white/blue edge, here on the front left, the same way: F drops the corner and the white/red edge together (and lifts the white/blue edge to the top), U' moves the edge over, and F' brings the corner and white/red edge back.",
          },
          {
            state: S1C,
            animation: {
              alg: RED_BLUE,
              outlineMoves: true,
              highlightBefore: [one('F', 7)],
              highlightAfter: BLOCK_FACES,
              highlightColor: ON_WHITE,
            },
            caption:
              "Slot in the red/blue edge, here at the bottom front: U' moves the rest of the block out of the way, F' brings the edge up into place, and U brings the block back.",
          },
        ],
      },
      algorithms: [],
    },
    {
      slug: 'inner-tower',
      name: 'Step 2: The Inner Tower',
      description:
        "Expand the inner cube into an 'inner tower' by solving the white/blue/orange corner with the blue/orange and white/orange edges. Orient the cube with red on the bottom and white on the front face (so blue is on the right face). The goal here is to expand the 2x2x2 'up', so focus on the blue/white/orange corner. In order not to disrupt anything you've built, you can move the top, back, and left faces freely. Do this to bring the orange/blue and orange/white edges to the top and pair them to the corner. Note: one will be paired in the front face, and one will be paired in the back face. Note - this example walks you through the general strategy of pairing the corner. The exact moves you need to make will differ slightly from this, depending on where the edges are.",
      animation: {
        state: INNER_CUBE,
        alg: TURN_UP,
        highlightBefore: BLOCK_FACES,
        highlightAfter: LOW_BLOCK_FACES,
        highlightColor: ON_WHITE,
        caption: 'Turn the whole cube so red is on the bottom and white faces you. The inner cube is now at the bottom front right.',
      },
      closing: {
        figures: [
          {
            state: S2A,
            animation: {
              alg: ORANGE_CORNER,
              outlineMoves: true,
              highlightBefore: [one('U', 0)],
              highlightAfter: [one('U', 6), one('F', 0)],
              highlightColor: ON_WHITE,
            },
            caption: 'Bring the white-blue-orange corner to the top with orange on the top.',
          },
          {
            state: S2B,
            animation: {
              alg: FIRST_EDGE,
              outlineMoves: true,
              highlightAfter: [{ face: 'U', indices: [6, 7] }, { face: 'F', indices: [0, 1] }],
              highlightColor: ON_WHITE,
            },
            caption:
              "Now move it out of the way and bring either edge to the top as well, and pair it on the top: here L2 drops the corner (and brings the blue/orange edge up to the top), U' rotates the edge into place, and L2 brings the corner back.",
          },
          {
            state: S2C,
            animation: {
              alg: SECOND_EDGE,
              outlineMoves: true,
              highlightBefore: [one('R', 5)],
              highlightAfter: TOWER_FACES,
              highlightColor: ON_WHITE,
            },
            caption:
              "The last edge has to be paired on the back side of the top face. Rotate the corner to the left side (U), drop it down (L), move the edge over where you want it (B), and bring the corner back (L'). U2 then lines the new pieces up with the inner cube.",
          },
          {
            state: INNER_TOWER,
            animation: {
              alg: CORE_HOLD,
              highlightAfter: [{ face: 'F', indices: [4, 5, 7, 8] }, { face: 'R', indices: [3, 4, 5, 6, 7, 8] }],
              highlightColor: ON_WHITE,
            },
            caption:
              'This gives us a core that we can hold fixed. Turn the cube so the orange center is on the front and the red center is on the back (yellow on top, green on the left).',
          },
          {
            state: CORE,
            pieces: [{ at: [1, 0, 0], size: [2, 2, 3] }],
            highlightColor: ON_WHITE,
            animation: { alg: "U L U' L'", outlineMoves: true, loop: true },
            caption: 'Held this way, we can rotate U and L freely without breaking anything.',
          },
        ],
      },
      algorithms: [],
    },
    {
      slug: 'green-yellow-edges',
      name: 'Step 3: Orient the Green and Yellow Edges',
      description:
        'We now focus on the green and yellow centers. The goal in this step is to get green and yellow crosses.',
      figures: [
        {
          state: CROSSES,
          view: STEP3_VIEW,
          groups: CROSS_GROUPS,
          caption: 'What we are working toward: a green cross and a yellow cross.',
        },
      ],
      animation: {
        state: CORE,
        tilt: STEP3_TILT,
        highlightAfter: [{ face: 'U', indices: [4] }, { face: 'L', indices: [4] }],
        caption:
          'Tilt the cube so the green and yellow centers face you. Now we have to fix the edges on the green and yellow sides.',
      },
      closing: {
        figures: [
          {
            state: GREEN_FRONT,
            view: STEP3_VIEW,
            // the four edges that are wrong in this example
            groups: [one('F', 3), one('L', 5), one('F', 5), one('F', 7), one('L', 7)],
            caption:
              'An edge is correct when its yellow touches the yellow center, or its green touches the green center. The ones outlined here are wrong: their yellow or green faces away from the yellow or green center. This example has four. There will always be an even number of edges here that need to be fixed, and we fix them 2 at a time.',
          },
          {
            state: READY_TO_FIX,
            view: STEP3_VIEW,
            animation: {
              alg: FIX,
              outlineMoves: true,
              highlightBefore: FIX_SPOTS,
            },
            caption:
              "To fix two at a time, put them in the locations shown here (top left and front right), then, with the green face as F (orange on top), do U' F' U. This fixes both of them at once.",
          },
          {
            state: CROSSES,
            view: STEP3_VIEW,
            groups: CROSS_GROUPS,
            caption:
              'Repeat step 3d, fixing 2 at a time from these same locations, until all the edges are fixed and you can form a yellow cross and a green cross.',
          },
        ],
      },
      algorithms: [],
    },
    {
      slug: 'yellow-block',
      name: 'Step 4: The Yellow Block',
      description:
        'Now that we have the green and yellow edges set, we hold the cube rigid with orange in the front, and yellow on the top. We can now freely move U and L again without breaking anything. Note that there is no algorithm given in this step - this example shows how to pair your corner with your edges, but your exact moves will vary depending on the location of the edges you are trying to match. The goal here is to understand the strategy, not memorize a move set.',
      animation: {
        state: START_4,
        alg: YELLOW_CORNER,
        outlineMoves: true,
        highlightBefore: [one('F', 6)],
        highlightAfter: CORNER_AND_CENTERS,
        caption:
          "We first identify the yellow/orange/blue corner and bring it to the top with yellow on top. Here L' brings it up, and U' slots it into the right spot, where its yellow, orange and blue match the yellow, orange and blue centers.",
      },
      closing: {
        figures: [
          {
            state: S4A,
            animation: {
              alg: YELLOW_BLUE,
              outlineMoves: true,
              highlightBefore: [one('U', 3)],
              highlightAfter: [{ face: 'U', indices: [6, 7] }, { face: 'F', indices: [0, 1] }],
            },
            caption:
              "We now need to pair both edges that will match this corner: yellow/blue, and yellow/orange. Bring the yellow/blue edge to the top - because we fixed the edges in the previous step, the yellow face will already be correctly facing up. We now move the yellow/orange/blue corner down (do L once this corner is in the front-left corner), rotate the yellow/blue edge to the middle of the front face, and then do L' to bring the corner back up. Here the yellow/blue edge is already on top: U puts the corner in the front-left corner, L drops it, U2 rotates the edge to the middle of the front, and L' brings the corner back.",
          },
          {
            state: S4B,
            animation: {
              alg: YELLOW_ORANGE,
              outlineMoves: true,
              highlightBefore: [one('F', 3)],
              highlightAfter: [{ face: 'U', indices: [4, 5, 7, 8] }, { face: 'F', indices: [1, 2] }, { face: 'R', indices: [0, 1] }],
            },
            caption:
              "We do a similar pairing for the yellow/orange edge, but this time the pairing will happen on the back of the upper face, instead of the front. We can then rotate this 2x2 block into correct position on the upper face. Here: U moves the corner to the back-left corner, L' drops it (and brings the yellow/orange edge up), U rotates the edge to the middle of the back, L brings the corner back, and U2 rotates the block into place.",
          },
        ],
      },
      algorithms: [],
    },
    {
      slug: 'last-bar',
      name: 'Step 5: The Red/Yellow Bar',
      description:
        "We need to pair the red/yellow/blue corner with the yellow/red edge. Note that the left face can still move freely, but the top is limited: we can do U' without breaking the four yellow blocks there (it just moves them aside until U brings them back), but we can't do U' again.",
      figures: [
        {
          state: S5A,
          groups: [one('U', 6), one('F', 0)],
          caption:
            'What we want to achieve: the red/yellow/blue corner in the front left corner of the upper face, with yellow on top and red facing out.',
        },
      ],
      animation: {
        state: S5,
        alg: FLIPS,
        outlineMoves: true,
        // after one round the corner is back on top, but not yet set as in 5a
        pause: { after: 4, highlight: [one('U', 6), one('F', 0)] },
        highlightAfter: [one('U', 6), one('F', 0)],
        caption:
          "To do that, we may have to flip that corner a few times. Move it to the back left corner of the upper face (here L'), then do U' L U. This changes the orientation of that corner. Do L' to bring it back to the upper face. If it is not set as in 5a, we have to do it one more time: L' to move it to the back left corner, then U' L U and L' again. This example takes two rounds.",
      },
      closing: {
        figures: [
          {
            state: S5A,
            animation: {
              alg: PAIR,
              outlineMoves: true,
              highlightAfter: [{ face: 'U', indices: [6, 7] }, { face: 'F', indices: [0, 1] }],
            },
            caption:
              "Once the corner is oriented as in 5a, we pair it with the yellow/red edge: turn L until the yellow/red edge is in the upper face (here L2), do U' to bring it to the front of the upper face, then turn L until the corner pairs with it (L2 again).",
          },
          {
            state: S5B,
            animation: {
              alg: PLACE_BAR,
              outlineMoves: true,
              highlightAfter: [{ face: 'U', indices: [1, 2, 4, 5, 7, 8] }],
            },
            caption: "Now U L' U' L U puts that newly formed bar into place.",
          },
          {
            state: S5C,
            animation: {
              alg: 'z',
              highlightAfter: [{ face: 'F', indices: [3, 4, 5, 6, 7, 8] }, { face: 'R', indices: [3, 4, 5, 6, 7, 8] }],
            },
            caption: 'Rotating the cube so blue is on the bottom, we now have the bottom two rows solved!',
          },
        ],
      },
      algorithms: [],
    },
    {
      slug: 'last-layer',
      name: 'Step 6: The Last Layer',
      description:
        'We now need to solve the last row - in our example, this is the green face. We do this by getting all nine green stickers on top, then positioning the corners, then permuting the middle edges as necessary.',
      figures: [
        {
          patterns: TOP_PATTERNS,
          patternColor: 'G',
          circled: 2,
          caption:
            "Getting all nine green stickers on top. There are several patterns of stickers that get cycled through here, but we only need one algorithm to eventually get all green stickers on the top: R U R' U R U2 R'. It will only work if we set the orientation correctly before we do it though, so we may have to rotate U to position it properly (matching one of these pictures, seen from above) before applying it each time. It will cycle through these patterns (some, but not all of them). Ultimately when we apply it to the circled one, it will put all green stickers on top.",
        },
      ],
      animation: {
        state: S6,
        alg: SUNE,
        outlineMoves: true,
        caption: "In this example the top already matches the fifth picture, so we apply the algorithm as it is.",
      },
      closing: {
        figures: [
          {
            state: S6_LAST,
            animation: {
              alg: `U' ${SUNE}`,
              outlineMoves: true,
              highlightAfter: [{ face: 'U', indices: [0, 1, 2, 3, 4, 5, 6, 7, 8] }],
            },
            caption:
              "Two more rounds later (turning U2 before the first, to match the fourth picture), U' turns the top to match the circled picture, and the last round puts all green stickers on top.",
          },
          {
            state: ALL_GREEN,
            animation: {
              alg: CORNER_SWAP,
              outlineMoves: true,
            },
            caption:
              "Positioning the corners. We just need one algorithm here: it swaps the two corners in the front of the upper face. If you already have two that have the same color facing out, move them to the back of the upper face to swap the other two. The algorithm is: (R' F R' B2) (R F' R' B2) R2. Note this may need to be applied twice in the worst case. Here no two corners have the same color facing out yet, so we apply it once as it is.",
          },
          {
            state: CORNERS_ONCE,
            animation: {
              alg: `U ${CORNER_SWAP} U2`,
              outlineMoves: true,
              // the two corners now showing the same color, moved to the back (shown through the cube)
              pause: { after: 0, highlight: [{ face: 'B', indices: [0] }, { face: 'B', indices: [2] }] },
              highlightAfter: [{ face: 'F', indices: [0, 2] }, { face: 'R', indices: [0, 2] }],
            },
            caption:
              'Now two corners have the same color facing out: U moves them to the back, we apply the algorithm again, and we should now be able to rotate U (U2 here) so that all green stickers are on top, and all corners are correctly positioned.',
          },
          {
            state: CORNERS_SET,
            animation: {
              alg: EDGE_CYCLE,
              outlineMoves: true,
              // the three edges that move flash, with arrows for where each goes: front to left, left to
              // right, right to front
              highlightBefore: [one('U', 7), one('U', 3), one('U', 5), one('F', 1), one('R', 1)],
              flash: true,
              firstRest: 3500,
              arrows: [
                { from: one('U', 7), to: one('U', 3) },
                { from: one('U', 3), to: one('U', 5) },
                { from: one('U', 5), to: one('U', 7) },
              ],
            },
            caption:
              "All that we have left is to permute the edges on top, and this can be done with a single algorithm: (F2 U L R') (F2 L' R U) F2. It cycles the front, left and right edges of the top and leaves the back edge where it is.",
          },
          {
            state: EDGES_ONCE,
            animation: {
              alg: `y' ${EDGE_CYCLE}`,
              outlineMoves: true,
            },
            caption:
              "If one application doesn't solve it, move a fully solved edge to the back and do it again. Here y' turns the whole cube to put the solved edge at the back, and the second round solves the cube.",
          },
        ],
      },
      algorithms: [],
    },
  ],
}
