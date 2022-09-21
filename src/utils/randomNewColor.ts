import { ThemeColor } from '../types'
import { colors } from './themedStyle'

export const randomNewColor = (usedColors: ThemeColor[] = []) => {
  let nonUsedColors: ThemeColor[] = colors.filter(c => !(c in usedColors))

  // if all colors are already used then ignore that and return any color
  if (nonUsedColors.length === 0) {
    nonUsedColors = [...colors]
  }
  return nonUsedColors[Math.floor(Math.random() * nonUsedColors.length)]
}