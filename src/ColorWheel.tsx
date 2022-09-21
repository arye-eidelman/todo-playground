
import { colors, themedStyle } from './utils'
import './pie.css'

const capitalize = (string: string) => string.length ? string[0].toUpperCase() + string.slice(1) : ""

export const ColorWheel = ({
  value,
  onChange,
  ...divProps
}: {
  value: typeof colors[number],
  onChange: (updatedColor: typeof colors[number]) => void
} & Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onChange'>) => {

  return (
    <div {...divProps} className={`pie box-border ${divProps.className ?? ""}`}>
      {colors.map((color, i) => {
        const sliceStart = Math.ceil((360 / 17) * (i + 1))
        const selected = value === color
        return (
          <label
            key={color}
            title={capitalize(color)}
            data-value={"22"} // span 22 degrees of the wheel (fractions arn't supported by pie.css)
            style={{ "--start": sliceStart } as React.CSSProperties}
            className={`pie__segment inline-block rounded-full border-[12px] border-solid box-border
            
              ${themedStyle('bg', color, '200')}
              ${themedStyle('text', color, '900')}
              ${themedStyle('border', selected ? color : 'transparent', '500')}
            `}
          >
            <input type="radio" className='' name="color" value={color} checked={selected} onChange={e => onChange(color)} />
          </label>
        )
      })}
    </div>
  )
}