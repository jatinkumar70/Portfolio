/**
 * The JK monogram: a J and a K drafted from the same construction grid —
 * one continuous stroke, a diagonal pair and a single accent node.
 * The same geometry is drawn live by the preloader.
 */
export const MONOGRAM_PATHS = {
  /** J: top bar → down stem → hook */
  j: 'M6 8 H26 M20 8 V34 C20 41 15 44 10 44 C6 44 3 41.5 2.5 38',
  /** K: stem */
  kStem: 'M32 8 V44',
  /** K: diagonals meeting at the node */
  kArms: 'M50 8 L36.5 26 L50 44',
}
