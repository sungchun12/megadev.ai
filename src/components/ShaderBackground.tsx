import { Shader, SolidColor, DotGrid } from 'shaders/react'
import './ShaderBackground.css'

export function ShaderBackground() {
  return (
    <Shader className="shader-background" colorSpace="srgb">
      <SolidColor color="#1573FF" />
      <DotGrid color="#b3ccff" density={75} dotSize={0.18} opacity={0.3} />
    </Shader>
  )
}
