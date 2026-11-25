import { applyAlg, solvedState } from '../../lib/cube3d.js'

// Held like the 3x3x3: white on top, red in front, blue on the right.
const HOLD = applyAlg(solvedState(5), 'y')
const SCRAMBLE = applyAlg(HOLD, "Rw2 U' r F2 Lw' D u2 B R' Dw2 l F' U2 Rw' b2 L D' r' Uw B2 F d' R2 Lw U f' D2 r2 B'")

// the user's angle for showing the left and bottom faces (same as the 3x3x3 L and D cards)
const LOW_VIEW = { x: 25, y: -20 }

const card = (m) => ({ ...m, animation: { alg: m.notation, outlineMoves: true, loop: true } })

export const fiveByFiveNotation = {
  intro:
    'Hold the cube with one face toward you. Each face is named by where it is: U (up), D (down), F (front), B (back), L (left) and R (right). A 5x5x5 has five layers each way, so besides the outer faces you can also turn the inner layers. Like the 3x3x3, each face has a single middle center piece, and those never move relative to each other, so they tell you which color each face will be.',
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
        'A w after the letter means a wide turn: turn that face together with the inner layer next to it, so two layers turn at once. Rw turns the right two layers, Lw the left two, Dw the bottom two and Uw the top two. They turn the same way as R, L, D and U.',
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
        'm turns only the middle horizontal layer, the same way as U. A 3 in front of a wide turn means three layers: 3Rw turns the right three layers together, the same way as R.',
      moves: [
        { notation: 'm', label: 'Middle horizontal layer, clockwise (like U)' },
        { notation: "m'", label: "Middle horizontal layer, counterclockwise (like U')" },
        { notation: '3Rw', label: 'Right three layers, clockwise' },
        { notation: "3Rw'", label: 'Right three layers, counterclockwise' },
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

// Step 1 examples. Each is a real scramble, turned so the photo's colors face the same way,
// then center commutators that put the white or yellow pieces where they are in the photo.
const C9 = [6, 7, 8, 11, 12, 13, 16, 17, 18] // the nine center stickers of a face
const ON_WHITE = '#7DD3FC'
const S1A = applyAlg(HOLD, "x y2 Rw Bw2 u' l2 D2 B D' U f2 d Lw' B2 D2 F u2 l2 d Uw Lw' r l' B' Rw' L2 Rw' u' Dw' R Bw' L' r2 F2 r2 d2 r2 F2 r2 d2 u2 F2 u2 l2 u2 F2 u2 l2 u F u' f u F' u' f'")
const S1B = applyAlg(HOLD, "x y2 D2 B l' f Dw' u B' U d2 Uw' R l Rw l2 Fw r B' d' U' D2 R' f2 b R' Dw2 Bw2 r' f' Rw2 Fw' u L u' r' u L' u' r U r2 U2 r2 b2 r2 U2 r2 b2 U' u' r u R2 u' r' u R2 r2 F2 r2 d2 r2 F2 r2 d2 R u r2 F2 r2 d2 r2 F2 r2 d2 u' R'")
const S1C = applyAlg(HOLD, "x z F' Rw Lw D2 F D2 u D F' D2 L B Fw' b2 Rw L2 d' F B Lw' Bw2 F' Bw' d2 Lw2 f' l2 f2 Bw u u b' u' B' u b u' B u2 F2 u2 r2 u2 F2 u2 r2 u2 F2 u2 r2 u2 F2 u2 r2 u F u' f u F' u' f' u R2 u' r u R2 u' r' r2 F2 r2 u2 r2 F2 r2 u2 u b u' B' u b' u' B F u2 r2 u2 B2 u2 r2 u2 B2 F' r u2 B2 u2 r2 u2 B2 u2 r2 r' u L' u' r2 u L u' r2 L u r2 u2 r2 B2 r2 u2 r2 B2 u' L' u b u' B' u b' u' B")
const S1D = applyAlg(HOLD, "x z Rw b l2 U' D' U' B' r2 f' r' Bw Rw' D U L Bw2 Rw2 f2 Rw2 D Fw2 Lw B2 r2 Dw B2 u' Lw U2 f u' r' u L2 u' r u L2 U2 r f2 U2 f2 r2 f2 U2 f2 r2 r' U2 u R u' r u R' u' r' F u2 B2 u2 r2 u2 B2 u2 r2 F' u r2 F2 r2 d2 r2 F2 r2 d2 u' F r2 F2 r2 u2 r2 F2 r2 u2 F' u2 B2 u2 l2 u2 B2 u2 l2 U' r u2 B2 u2 l2 u2 B2 u2 l2 r' U u L u' r2 u L' u' r2 L u r2 u2 r2 B2 r2 u2 r2 B2 u' L' d L2 d' l d L2 d' l'")
const S1E = applyAlg(HOLD, "x z' B2 Lw2 D' Fw Lw Rw2 Lw' F D U Rw Fw Uw b2 U' l B2 Fw2 Rw2 u2 r Uw2 f L' u' f' l2 Fw Dw F u b' u' B2 u b u' B2 f2 U2 f2 l2 f2 U2 f2 l2 u' f u F u' f' u F' u L' u' l' u L u' l F u2 F2 u2 l2 u2 F2 u2 l2 F' u2 F2 u2 r2 u2 F2 u2 r2 u b2 u' F u b2 u' F' L u r2 F2 r2 u2 r2 F2 r2 u2 u' L' u R' u' r u R u' r' F r2 d2 r2 B2 r2 d2 r2 B2 F' r f2 D2 f2 r2 f2 D2 f2 r2 r' B u r2 u2 r2 B2 r2 u2 r2 B2 u' B' u b u' B2 u b' u' B2 B2 u f2 d2 f2 R2 f2 d2 f2 R2 u' B2")
const KEEP_WHITE = "Rw' F2 Rw"
const PAIR_UP = "Rw' F Rw"
const ELEVATOR = "Rw U2 Rw'"
const YELLOW_DONE = applyAlg(S1E, ELEVATOR)
// red (yellow on the left, white on the right), then green (red on the bottom)
const S1G = applyAlg(HOLD, "z r Fw Dw2 Bw' l' Bw R d2 r u' Lw' Fw2 U' R2 Dw' Lw' Rw2 L2 U2 Dw Uw2 F' Uw L R U' b' L2 F' u2 u F u' b' u F' u' b u L u' r' u L' u' r U r2 D2 r2 f2 r2 D2 r2 f2 U' u' r u R' u' r' u R R u f2 L2 f2 d2 f2 L2 f2 d2 u' R' R u r2 F2 r2 d2 r2 F2 r2 d2 u' R' u l2 u' R u l2 u' R' f2 R2 f2 u2 f2 R2 f2 u2 u r2 u' R' u r2 u' R D2 f u2 R2 u2 f2 u2 R2 u2 f2 f' D2 u B u' f2 u B' u' f2 d' F2 d b d' F2 d b' u B' u' b' u B u' b F u r2 B2 r2 d2 r2 B2 r2 d2 u' F' u B' u' f u B u' f' f u2 L2 u2 f2 u2 L2 u2 f2 f' f r2 b2 r2 U2 r2 b2 r2 U2 f' F u f2 L2 f2 u2 f2 L2 f2 u2 u' F' d F2 d' f d F2 d' f'")
const S1H = applyAlg(HOLD, "z x' Lw U2 b Fw b f' D2 R' u Lw' Uw R Fw d2 u2 D2 r d Fw' L2 b Dw Bw2 d Fw2 Rw F Uw l2 r2 u b u' F u b' u' F' f2 U2 f2 l2 f2 U2 f2 l2 u f' u' F' u f u' F u f u' F' u f' u' F D r u2 F2 u2 l2 u2 F2 u2 l2 r' D' D' f r2 D2 r2 f2 r2 D2 r2 f2 f' D r u2 F2 u2 l2 u2 F2 u2 l2 r' u R u' l u R' u' l' L' f r2 D2 r2 f2 r2 D2 r2 f2 f' L r2 F2 r2 d2 r2 F2 r2 d2 r2 u2 r2 F2 r2 u2 r2 F2 f2 L2 f2 u2 f2 L2 f2 u2 u F' u' b2 u F u' b2 u2 R2 u2 b2 u2 R2 u2 b2 u2 f2 u2 R2 u2 f2 u2 R2 u R2 u' l' u R2 u' l B u f2 R2 f2 d2 f2 R2 f2 d2 u' B' u b2 u' F' u b2 u' F u' l2 u L u' l2 u L' u l2 u' L2 u l2 u' L2 u L2 u' r2 u L2 u' r2 f R f2 u2 f2 L2 f2 u2 f2 L2 R' f' f r' f' L' f r f' L")
// orange and blue: every other center solved, orange in front and blue on top, as in the photo
const ORANGE_BLUE = "Rw U Rw' U Lw F2 Lw'"
const S2_OB = applyAlg(HOLD, "z x2 f2 Uw' Lw U D' Uw2 R u Bw' u' Dw' Fw' u F l2 Fw Lw' u2 Bw' Dw2 Lw2 B f u d2 b R' D R l' r2 U2 r2 b2 r2 U2 r2 b2 u B u' b u B' u' b' f2 U2 f2 l2 f2 U2 f2 l2 F r u2 B2 u2 l2 u2 B2 u2 l2 r' F' u l' u' L u l u' L' u r u' L2 u r' u' L2 u f u' F' u f' u' F f u2 L2 u2 b2 u2 L2 u2 b2 f' u r u' R2 u r' u' R2 D' f r2 D2 r2 f2 r2 D2 r2 f2 f' D r u2 F2 u2 l2 u2 F2 u2 l2 r' L f r2 D2 r2 f2 r2 D2 r2 f2 f' L' u' b u F2 u' b' u F2 u L u' l2 u L' u' l2 r2 F2 r2 d2 r2 F2 r2 d2 d f2 d' F2 d f2 d' F2 u2 B2 u2 l2 u2 B2 u2 l2 F' u f2 L2 f2 u2 f2 L2 f2 u2 u' F R' u r2 F2 r2 d2 r2 F2 r2 d2 u' R d' L2 d r2 d' L2 d r2 u f2 u' B u f2 u' B' u f2 R2 f2 d2 f2 R2 f2 d2 u' u f2 u' B' u f2 u' B B' u r2 B2 r2 u2 r2 B2 r2 u2 u' B d2 F u2 B2 u2 l2 u2 B2 u2 l2 F' d2 u b2 u' B2 u b2 u' B2 L' u r2 u2 r2 B2 r2 u2 r2 B2 u' L u l2 u' R' u l2 u' R f2 R2 f2 u2 f2 R2 f2 u2 u F u' b2 u F' u' b2 u2 R2 u2 b2 u2 R2 u2 b2 u2 f2 u2 R2 u2 f2 u2 R2 u B u' f2 u B' u' f2 f U f' d2 f U' f' d2 Lw F2 Lw' U' Rw U' Rw'")
const S1I = applyAlg(HOLD, "z x' D' f2 d' u2 d2 Bw2 Uw2 Lw Uw' Rw D' L' d2 b' u2 Bw2 R' b2 d B' u Dw2 Fw' d' u2 R2 l Fw2 d2 f u R u' l' u R' u' l u f u' F2 u f' u' F2 D r u2 F2 u2 r2 u2 F2 u2 r2 r' D' u f' u' B u f u' B' r f2 D2 f2 r2 f2 D2 f2 r2 r' B r u2 F2 u2 l2 u2 F2 u2 l2 r' B' L f r2 D2 r2 f2 r2 D2 r2 f2 f' L' u' b u F2 u' b' u F2 u L' u' l2 u L u' l2 r2 F2 r2 u2 r2 F2 r2 u2 u2 F2 u2 r2 u2 F2 u2 r2 u F2 u' b' u F2 u' b u F2 u' f2 u F2 u' f2 f2 R2 f2 d2 f2 R2 f2 d2 u F' u' b2 u F u' b2 u2 R2 u2 f2 u2 R2 u2 f2 R f2 u2 f2 R2 f2 u2 f2 R2 R' u R u' r u R' u' r' u f2 R2 f2 d2 f2 R2 f2 d2 u' u l2 u' R2 u l2 u' R2 u B2 u' b u B2 u' b' u r2 u' L' u r2 u' L d' R u2 L2 u2 f2 u2 L2 u2 f2 R' d d2 R u2 L2 u2 f2 u2 L2 u2 f2 R' d2 d F u2 l2 u2 B2 u2 l2 u2 B2 F' d' d' r2 d L d' r2 d L'")

// Step 3 examples: real scrambles with the centers solved, then the photo's edge pieces put in place
// (3d is built backwards from a cube with every other edge paired, since it is the last two edges)
const S3A = applyAlg(HOLD, "x y2 Bw Lw2 b Fw' Dw2 l2 Bw2 R' L' F2 D F D' L f Bw Uw L2 R2 Uw2 Dw Lw B u2 Fw l' U L D f' u' b' u F' u' b u F U f2 U2 f2 l2 f2 U2 f2 l2 U' u' r' u L' u' r u L f2 U2 f2 l2 f2 U2 f2 l2 U f u2 R2 u2 b2 u2 R2 u2 b2 f' U' u l' u' L' u l u' L U2 f r2 U2 r2 b2 r2 U2 r2 b2 f' U2 u l' u' R u l u' R' f u2 L2 u2 b2 u2 L2 u2 b2 f' u' r u L2 u' r' u L2 d' b d B2 d' b' d B2 L' f r2 D2 r2 f2 r2 D2 r2 f2 f' L u F u' b u F' u' b' u L' u' l2 u L u' l2 F u2 B2 u2 r2 u2 B2 u2 r2 F' u b2 u' F' u b2 u' F F' u f2 L2 f2 d2 f2 L2 f2 d2 u' F R u r2 F2 r2 d2 r2 F2 r2 d2 u' R' u f2 R2 f2 d2 f2 R2 f2 d2 u' d B d' b2 d B' d' b2 B u r2 u2 r2 B2 r2 u2 r2 B2 u' B' u r2 u' R u r2 u' R' d F' d' f2 d F d' f2 f2 R2 f2 d2 f2 R2 f2 d2 f U' f' u2 f U f' u2 u2 R2 u2 f2 u2 R2 u2 f2 d B d' f2 d B' d' f2 R u2 f2 u2 L2 u2 f2 u2 L2 R' u B' u' b2 u B u' b2 F R' Uw R' D R Uw' Uw B' U B Uw' u B' U B u' Dw R' D' R Dw' Uw' R' U2 R Uw Uw R' D R Uw' Dw B' D' B Dw'")
const S3B = applyAlg(HOLD, "x2 u r' u2 R2 L Uw2 b' U f2 u2 Fw' d' r' b' Fw' l B F2 l R' Uw Bw' U2 Dw2 F2 L2 F2 Lw' r L2 u b' u' B u b u' B' U' r f2 U2 f2 r2 f2 U2 f2 r2 r' U u B u' b u B' u' b' f2 U2 f2 l2 f2 U2 f2 l2 B r u2 B2 u2 r2 u2 B2 u2 r2 r' B' u l' u' L' u l u' L L f u2 R2 u2 b2 u2 R2 u2 b2 f' L' U r F r' f2 r F' r' f2 U' D r u2 F2 u2 l2 u2 F2 u2 l2 r' D' u r u' R' u r' u' R r f2 D2 f2 r2 f2 D2 f2 r2 r' u B u' b' u B' u' b u' b u F u' b' u F' u' R u l2 u' R' u l2 F u2 F2 u2 l2 u2 F2 u2 l2 F' d f2 d' F2 d f2 d' F2 u2 F2 u2 l2 u2 F2 u2 l2 F u r2 F2 r2 d2 r2 F2 r2 d2 u' F' F2 u f2 L2 f2 d2 f2 L2 f2 d2 u' F2 d' L2 d r2 d' L2 d r2 u f2 u' B u f2 u' B' u f2 R2 f2 d2 f2 R2 f2 d2 u' u B u' b2 u B' u' b2 u r2 u2 r2 B2 r2 u2 r2 B2 u' u B' u' f2 u B u' f2 u F u' b2 u F' u' b2 f2 R2 f2 d2 f2 R2 f2 d2 b U' b' u2 b U b' u2 R u2 R2 u2 f2 u2 R2 u2 f2 R' u B' u' b2 u B u' b2 F L Uw' B U B' Uw Uw' R' U' R Uw Uw F D F' Uw' Uw F' U' F Uw' Dw R' U R Dw' Uw' F' U2 F Uw Dw2 B' U' B Dw2 Dw' L' D L Dw")
const S3C = applyAlg(HOLD, "z' f' Rw' U B' Dw F Rw' d' Lw R' Dw' L2 Rw d' r Dw2 b2 f' u' L Bw2 D' b L' Uw' D2 b2 r' L' R f r2 U2 r2 b2 r2 U2 r2 b2 f' u b u' F u b' u' F' r u2 B2 u2 r2 u2 B2 u2 r2 r' u' l' u R' u' l u R U r f2 U2 f2 r2 f2 U2 f2 r2 r' U' f R' f' r2 f R f' r2 u L u' l' u L' u' l f u2 b2 u2 L2 u2 b2 u2 L2 f' u' f' u F2 u' f u F2 r f2 r2 f2 D2 f2 r2 f2 D2 r' u B u' b' u B' u' b u r' u' L2 u r u' L2 r2 B2 r2 u2 r2 B2 r2 u2 u2 F2 u2 l2 u2 F2 u2 l2 F' u f2 L2 f2 d2 f2 L2 f2 d2 u' F u F u' f2 u F' u' f2 L' u r2 F2 r2 u2 r2 F2 r2 u2 u' L u f2 u' F' u f2 u' F u f2 u' B u f2 u' B' u f2 d2 f2 R2 f2 d2 f2 R2 u' u b2 u' B' u b2 u' B B u r2 u2 r2 B2 r2 u2 r2 B2 u' B' u B2 u' f2 u B2 u' f2 u l2 u' R' u l2 u' R d F' d' f2 d F d' f2 f U' f' u2 f U f' u2 u2 R2 u2 b2 u2 R2 u2 b2 d B d' f2 d B' d' f2 f2 R2 f2 d2 f2 R2 f2 d2 u B' u' b2 u B u' b2 F' Lw U' R2 U Lw' Lw F R2 F' Lw' Rw U R2 U' Rw' Rw' D' L2 D Rw")
const S3D = applyAlg(HOLD, "x2 y F U' D2 F U2 D' L2 D' R B U L2 B2 R2 F U R' F U D' L' F2 L' B' U Rw U2 Rw U2 Rw' U2 3Rw U2 Lw' U2 Rw U2 Rw' U2 Rw' x' U2 Rw' F Uw' R' F R F' R U' R' Uw")
const SLICE = "Dw' L' U L Dw"
const MIDDLE_SLICE = "m' R U R' m"
const FIX_EDGE = "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 (3Rw') U2 Rw U2 Rw' U2 Rw'"
const LAST_TWO = "Uw' (R U R' F R' F' R) Uw"
// the cube once every edge is paired: the end of the 3d example (then F' and the 3c algorithm)
const EDGES_DONE = applyAlg(S3D, `${LAST_TWO} F' ${FIX_EDGE}`)
// outline each sticker on its own, so separate pieces are not joined into one shape
const one = (stickers) => stickers.map(([face, i]) => ({ face, indices: [i] }))
const TOP_FRONT_EDGE = [{ face: 'U', indices: [21, 22, 23] }, { face: 'F', indices: [1, 2, 3] }]

export const fiveByFiveMethod = {
  name: 'Reduction Method',
  description: '',
  notation: fiveByFiveNotation,
  previewState: SCRAMBLE,
  stages: [
    {
      slug: 'first-centers',
      name: 'Step 1: The White and Yellow Centers',
      description:
        'Step 1 is to build the white center. We do this by first forming a 3-bar with the white center. Then we form other bars of 3 white centers and slot them into the white face. We then do the same with yellow.',
      figures: [
        {
          state: S1A,
          groups: [{ face: 'F', indices: [11, 12, 13] }],
          highlightColor: ON_WHITE,
          caption: 'First make a bar of three with the white center piece.',
        },
      ],
      animation: {
        state: S1B,
        alg: "Rw'",
        outlineMoves: true,
        highlightBefore: [{ face: 'F', indices: [7, 12, 17] }, { face: 'U', indices: [8, 13, 18] }],
        highlightAfter: [{ face: 'F', indices: [7, 8, 12, 13, 17, 18] }],
        highlightColor: ON_WHITE,
        caption:
          "Then form two other white bars and slot them into the white face. Here Rw' brings the bar on top down next to the first one. Slot the third bar in the same way to finish the white center.",
      },
      algorithms: [],
      closing: [{
        text:
          'We then do the same with yellow, with the white center at the back. In this case we need to make sure that any time we move the yellow center to add another piece to it, we undo what we did, because moves here will break white.',
        figures: [
          {
            state: S1C,
            animation: {
              alg: PAIR_UP,
              outlineMoves: true,
              highlightBefore: [{ face: 'F', indices: [12] }, { face: 'U', indices: [13] }],
              highlightAfter: [{ face: 'F', indices: [12, 17] }],
            },
            caption:
              "To match a piece to the yellow center here, we can't just do Rw', because that will mess up white. We actually bring the yellow piece down, rotate the 2-bar out of the way, then rotate back to restore white: Rw' F Rw.",
          },
          {
            state: S1D,
            animation: {
              alg: KEEP_WHITE,
              outlineMoves: true,
              highlightBefore: [{ face: 'F', indices: [7, 12, 17] }, { face: 'U', indices: [8, 13, 18] }],
              highlightAfter: [{ face: 'F', indices: [6, 7, 11, 12, 16, 17] }],
            },
            caption: "Here we can't just do Rw' to bring that bar down (that will break white). So we do Rw' F2 Rw.",
          },
          {
            state: S1E,
            animation: {
              alg: ELEVATOR,
              outlineMoves: true,
              highlightBefore: [{ face: 'F', indices: [6, 7, 11, 12, 16, 17] }, { face: 'U', indices: [6, 11, 16] }],
              highlightAfter: [{ face: 'F', indices: C9 }],
            },
            caption:
              "To insert the last bar we actually position it above a completed bar, not the empty one. Then we do Rw U2 Rw' (this move is called the elevator).",
          },
        ],
      }],
    },
    {
      slug: 'last-centers',
      name: 'Step 2: The Remaining Centers',
      description:
        'Then we do the red and green centers. This leaves blue and orange (the last two centers), which have to be solved in unison - it can be tricky.',
      algorithms: [],
      closing: [{
        text: 'Next, rotate the cube so yellow and white are the left and right faces of the cube.',
        figures: [
          {
            state: YELLOW_DONE,
            view: LOW_VIEW,
            animation: {
              alg: 'y',
              highlightBefore: [{ face: 'F', indices: C9 }],
              highlightAfter: [{ face: 'L', indices: C9 }],
            },
            caption: 'y turns the whole cube so the yellow center is on the left and the white center (at the back) comes round to the right.',
          },
        ],
      }, {
        text:
          'Then we go around solving the other centers using these same strategies. With yellow on the left, the suggested order is red, then green. Rw and Lw no longer touch the yellow or white centers, so red can be built anywhere with the same bars.',
        figures: [
          {
            state: S1G,
            animation: {
              alg: "Rw'",
              outlineMoves: true,
              highlightBefore: [{ face: 'F', indices: [7, 12, 17] }, { face: 'U', indices: [8, 13, 18] }],
              highlightAfter: [{ face: 'F', indices: [7, 8, 12, 13, 17, 18] }],
            },
            caption:
              "Red: here Rw' brings the bar on top straight down next to the red center's bar. Nothing needs undoing, because Rw' only turns the white center on the right around as a whole.",
          },
        ],
      }, {
        text:
          "Once red is done, turn the cube so red is on the bottom and green is in front (yellow stays on the left). Now any Rw or Lw carries part of red away, so, just like with yellow, we undo it: bring a piece or bar down, turn F out of the way, and go back up (Rw' F Rw, Rw' F2 Rw), or use the elevator Rw U2 Rw'.",
        figures: [
          {
            state: S1H,
            animation: {
              alg: KEEP_WHITE,
              outlineMoves: true,
              highlightBefore: [{ face: 'F', indices: [7, 12, 17] }, { face: 'U', indices: [8, 13, 18] }],
              highlightAfter: [{ face: 'F', indices: [6, 7, 11, 12, 16, 17] }],
            },
            caption:
              "Green, with red on the bottom: Rw' F2 Rw slots the bar on top in on the left. Rw' takes part of the red center round to the back, and Rw brings it back.",
          },
          {
            state: S1I,
            animation: {
              alg: ELEVATOR,
              outlineMoves: true,
              highlightBefore: [{ face: 'F', indices: [6, 7, 11, 12, 16, 17] }, { face: 'U', indices: [6, 11, 16] }],
              highlightAfter: [{ face: 'F', indices: C9 }],
            },
            caption:
              "The last green bar goes above a finished bar again, then the elevator Rw U2 Rw'. Part of red comes up to the front and goes back down untouched.",
          },
        ],
      }, {
        text:
          'The end of step 2 is solving orange and blue at once. We first need to get them into the configuration shown here - this is possible by just using the same elevator techniques.',
        algorithms: [
          {
            name: 'Orange and blue together',
            moves: ORANGE_BLUE,
            setupState: S2_OB,
            animation: {
              alg: ORANGE_BLUE,
              outlineMoves: true,
              highlightBefore: [{ face: 'F', indices: [8] }, { face: 'U', indices: [18] }],
              highlightAfter: [{ face: 'F', indices: C9 }, { face: 'U', indices: C9 }],
            },
            caseDescription:
              "Once we have this configuration (with orange on the F face), do: Rw U Rw' U Lw F2 Lw'. This solves all of the centers.",
            tips: "Here the front's top-right center piece is blue and the top's front-right center piece is orange; every other center is already solved.",
          },
        ],
      }],
    },
    {
      slug: 'edges',
      name: 'Step 3: The Edges',
      description:
        "Now we need to do the edges. We're just building all inner edges, we don't care what center they end up by. We do this by slicing - a new technique.",
      animation: {
        state: S3A,
        view: LOW_VIEW,
        alg: SLICE,
        outlineMoves: true,
        highlightBefore: one([['F', 10], ['L', 14], ['F', 19], ['R', 15]]),
        highlightAfter: one([['U', 1], ['U', 2]]),
        caption:
          "Here the red/green middle edge is on the left, and the highlighted piece on the right is also a red/green, oriented such that the green is facing right (shown through the cube). In this case we 'slice' by doing Dw', then move it up with L', then replace that location by doing U, then L and Dw to restore the white center.",
      },
      note:
        "The important thing here is not the algorithm per se but the strategy. We may slice left-to-right as well using this same idea. The main thing to remember is that when we did the U to move the completed pair out of the way, *we have to make sure that whatever we bring in there is not a completed inner edge*, because it will get broken up. So we look for an incomplete edge on the top. If there isn't one, we can search on the back or elsewhere and bring it to the top prior to starting this step.",
      algorithms: [],
      closing: [{
        text:
          "We can also do a 'middle slice', if the configuration is right. Let m denote a rotation of only the middle horizontal layer.",
        figures: [
          {
            state: S3B,
            animation: {
              alg: MIDDLE_SLICE,
              outlineMoves: true,
              highlightBefore: one([['F', 10], ['L', 14], ['F', 9], ['R', 5], ['F', 19], ['R', 15]]),
              highlightAfter: one([['U', 21], ['F', 1], ['U', 22], ['F', 2], ['U', 23], ['F', 3]]),
            },
            caption:
              "In this case the yellow/orange middle edge is on the left (its orange shown through the cube), and the two outer middle edge pieces are on the right. Then m' forms a complete inner edge - but we need to move it out of the way so we can restore the orange center. We do this by (in this example) R U R' m. The completed inner edge happens to be on the front of the top face now.",
          },
        ],
      }, {
        text:
          'We complete all inner edges this way up until the last 2; they require an algorithm. Along the way we may also see this case:',
        algorithms: [
          {
            name: 'A scrambled inner edge',
            moves: FIX_EDGE,
            setupState: S3C,
            animation: { alg: FIX_EDGE, outlineMoves: true, highlightBefore: TOP_FRONT_EDGE, highlightAfter: TOP_FRONT_EDGE },
            caseDescription:
              'This can be fixed by holding this inner edge on the front of the upper face and doing the moves below. Note that 3Rw here means the three right-most layers (see the notation section).',
            tips: "Here the edge's two outer pieces have green on top, but its middle piece has yellow on top.",
          },
        ],
      }, {
        text:
          'When we get to the last 2 inner edges, they need to be solved simultaneously. We do this by positioning them as shown here (the highlighted piece is the final orange/white edge piece, its orange shown through the cube).',
        algorithms: [
          {
            name: 'The last two inner edges',
            moves: LAST_TWO,
            setupState: S3D,
            animation: {
              alg: LAST_TWO,
              outlineMoves: true,
              highlightBefore: [{ face: 'F', indices: [5] }, { face: 'L', indices: [9] }],
              highlightAfter: [{ face: 'F', indices: [9, 14, 19] }, { face: 'R', indices: [5, 10, 15] }],
            },
            caseDescription:
              "Doing Uw' (R U R' F R' F' R) Uw will pair the white/orange inner edge, but it may be scrambled (as it is in this case), so apply the algorithm from [step 3c](/puzzle/5x5#step-3c) to fix that.",
            tips: "Here the white/orange edge ends up on the right with its middle piece the other way round. F' brings it to the front of the top face for the step 3c algorithm.",
          },
        ],
        textAfter: 'This should allow us to solve all inner edges.',
      }],
    },
    {
      slug: 'like-a-3x3',
      name: 'Step 4: Solve It Like a 3x3x3',
      description:
        'We have now reduced the 5x5x5 to behaving like a 3x3x3: we can solve it using the exact same process as the [3x3x3](/puzzle/3x3).',
      figures: [
        {
          state: EDGES_DONE,
          groups: [{ face: 'U', indices: C9 }, { face: 'F', indices: C9 }, { face: 'R', indices: C9 }],
          unlabeled: true,
          caption: 'Each 3x3 center is equivalent to the center of a 3x3x3 face.',
        },
        {
          state: EDGES_DONE,
          groups: [{ face: 'U', indices: [21, 22, 23] }, { face: 'F', indices: [1, 2, 3] }, { face: 'F', indices: [9, 14, 19] }, { face: 'R', indices: [5, 10, 15] }],
          unlabeled: true,
          caption: 'Each paired edge is equivalent to the middle edge of a 3x3x3.',
        },
      ],
      footer:
        'So we can solve it exactly as if it were a 3x3x3 now. There are no extra cases to watch for at this point: the edge cases were already handled in step 3.',
      algorithms: [],
    },
  ],
}
