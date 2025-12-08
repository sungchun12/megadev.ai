import './BlueprintSketches.css'

export function BlueprintSketches() {
  return (
    <div className="blueprint-sketches" aria-hidden="true">
      <svg className="sketches-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        
        {/* ============ TOP LEFT CORNER BRACKET ============ */}
        <g className="sketch-group" transform="translate(40, 40)">
          <path className="sketch-curve" d="M 0 80 L 0 0 L 80 0" fill="none" />
          <rect className="sketch-node" x="-4" y="-4" width="8" height="8" />
          <path className="sketch-curve dashed" d="M 20 100 Q 20 20, 100 20" fill="none" />
        </g>

        {/* ============ TOP LEFT FLOWING CURVES ============ */}
        <g className="sketch-group" transform="translate(60, 180)">
          <path 
            className="sketch-curve"
            d="M 0 0 Q 80 -40, 160 0 Q 240 40, 320 0"
            fill="none"
          />
          <circle className="sketch-node-circle" cx="0" cy="0" r="5" />
          <circle className="sketch-node-circle filled" cx="160" cy="0" r="4" />
          <circle className="sketch-node-circle" cx="320" cy="0" r="5" />
          
          {/* Connecting vertical line down */}
          <line className="sketch-line" x1="160" y1="0" x2="160" y2="60" />
          <rect className="sketch-node" x="156" y="56" width="8" height="8" />
        </g>

        {/* ============ TOP CENTER - DIMENSION LINE ============ */}
        <g className="sketch-group" transform="translate(700, 60)">
          <line className="sketch-line" x1="0" y1="0" x2="200" y2="0" />
          <line className="sketch-line" x1="0" y1="-10" x2="0" y2="10" />
          <line className="sketch-line" x1="200" y1="-10" x2="200" y2="10" />
          <text className="sketch-text dimension" x="100" y="-8">1/3</text>
        </g>

        {/* ============ TOP RIGHT - CURVED CORNER WITH NODES ============ */}
        <g className="sketch-group" transform="translate(1700, 80)">
          <path className="sketch-curve" d="M -120 0 L -40 0 Q 0 0, 0 40 L 0 120" fill="none" />
          <rect className="sketch-node" x="-44" y="-4" width="8" height="8" />
          <circle className="sketch-node-circle filled cyan" cx="0" cy="40" r="5" />
          <polygon className="sketch-diamond" points="-120,0 -114,6 -120,12 -126,6" />
        </g>

        {/* ============ TOP RIGHT - CIRCLE WITH CROSSHAIRS ============ */}
        <g className="sketch-group" transform="translate(1800, 250)">
          <circle className="sketch-circle" cx="0" cy="0" r="50" />
          <circle className="sketch-circle dashed" cx="0" cy="0" r="35" />
          <line className="sketch-line thin" x1="-60" y1="0" x2="60" y2="0" />
          <line className="sketch-line thin" x1="0" y1="-60" x2="0" y2="60" />
          <circle className="sketch-node-circle filled cyan" cx="35" cy="0" r="4" />
        </g>

        {/* ============ LEFT SIDE - FLOWING S-CURVE ============ */}
        <g className="sketch-group" transform="translate(80, 400)">
          <path 
            className="sketch-curve"
            d="M 0 0 Q 60 0, 60 60 Q 60 120, 0 120"
            fill="none"
          />
          <path 
            className="sketch-curve dashed"
            d="M 20 20 Q 80 20, 80 80 Q 80 140, 20 140"
            fill="none"
          />
          <rect className="sketch-node" x="-4" y="-4" width="8" height="8" />
          <rect className="sketch-node" x="-4" y="116" width="8" height="8" />
        </g>

        {/* ============ LEFT SIDE - BEZIER WITH CONTROL POINTS ============ */}
        <g className="sketch-group" transform="translate(150, 650)">
          <path 
            className="sketch-curve"
            d="M 0 0 C 80 -80, 160 80, 240 0"
            fill="none"
          />
          <circle className="sketch-node-circle filled" cx="0" cy="0" r="4" />
          <circle className="sketch-node-circle filled" cx="240" cy="0" r="4" />
          {/* Control point handles */}
          <line className="sketch-line thin dashed" x1="0" y1="0" x2="80" y2="-80" />
          <line className="sketch-line thin dashed" x1="240" y1="0" x2="160" y2="80" />
          <circle className="sketch-node-circle" cx="80" cy="-80" r="3" />
          <circle className="sketch-node-circle" cx="160" cy="80" r="3" />
        </g>

        {/* ============ CENTER - INTERSECTION GRID ============ */}
        <g className="sketch-group" transform="translate(500, 300)">
          <line className="sketch-line" x1="0" y1="0" x2="150" y2="0" />
          <line className="sketch-line" x1="0" y1="0" x2="0" y2="100" />
          <polygon className="sketch-diamond filled" points="0,0 6,6 0,12 -6,6" transform="translate(0,-6)" />
          <rect className="sketch-node" x="146" y="-4" width="8" height="8" />
          <circle className="sketch-node-circle filled cyan" cx="0" cy="100" r="4" />
        </g>

        {/* ============ RIGHT SIDE - LARGE ARC ============ */}
        <g className="sketch-group" transform="translate(1650, 500)">
          <path 
            className="sketch-curve"
            d="M -100 80 Q -100 -80, 80 -80"
            fill="none"
          />
          <path 
            className="sketch-curve dashed"
            d="M -80 60 Q -80 -60, 60 -60"
            fill="none"
          />
          <circle className="sketch-node-circle filled cyan" cx="-100" cy="80" r="5" />
          <circle className="sketch-node-circle" cx="80" cy="-80" r="5" />
        </g>

        {/* ============ BOTTOM LEFT - CORNER ELEMENT ============ */}
        <g className="sketch-group" transform="translate(60, 900)">
          <path className="sketch-curve" d="M 80 0 L 0 0 L 0 -80" fill="none" />
          <rect className="sketch-node" x="-4" y="-4" width="8" height="8" />
          <circle className="sketch-node-circle filled cyan" cx="80" cy="0" r="4" />
          <polygon className="sketch-diamond" points="0,-80 6,-74 0,-68 -6,-74" />
        </g>

        {/* ============ BOTTOM - WAVE PATTERN ============ */}
        <g className="sketch-group" transform="translate(300, 950)">
          <path 
            className="sketch-curve thin"
            d="M 0 0 Q 30 -20, 60 0 T 120 0 T 180 0 T 240 0 T 300 0"
            fill="none"
          />
          <rect className="sketch-node small" x="-3" y="-3" width="6" height="6" />
          <rect className="sketch-node small" x="297" y="-3" width="6" height="6" />
        </g>

        {/* ============ BOTTOM CENTER - MEASUREMENT SCALE ============ */}
        <g className="sketch-group" transform="translate(750, 1000)">
          <line className="sketch-line" x1="0" y1="0" x2="0" y2="-120" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <g key={i}>
              <line 
                className="sketch-line" 
                x1={i % 2 === 0 ? -12 : -6} 
                y1={-i * 20} 
                x2="0" 
                y2={-i * 20} 
              />
              {i % 2 === 0 && (
                <text className="sketch-text tiny" x="8" y={-i * 20 + 3}>
                  {(i * 0.1).toFixed(1)}
                </text>
              )}
            </g>
          ))}
        </g>

        {/* ============ BOTTOM RIGHT - FLOWING CURVE ============ */}
        <g className="sketch-group" transform="translate(1400, 850)">
          <path 
            className="sketch-curve"
            d="M 0 0 Q 100 -60, 200 0 Q 300 60, 400 0"
            fill="none"
          />
          <path 
            className="sketch-curve dashed"
            d="M 0 30 Q 100 -30, 200 30 Q 300 90, 400 30"
            fill="none"
          />
          <circle className="sketch-node-circle filled" cx="0" cy="0" r="4" />
          <polygon className="sketch-diamond" points="200,0 206,6 200,12 194,6" />
          <rect className="sketch-node" x="396" y="-4" width="8" height="8" />
        </g>

        {/* ============ BOTTOM RIGHT CORNER ============ */}
        <g className="sketch-group" transform="translate(1840, 1000)">
          <path className="sketch-curve" d="M -80 0 L 0 0 L 0 -80" fill="none" />
          <rect className="sketch-node" x="-4" y="-4" width="8" height="8" />
        </g>

        {/* ============ EQUATIONS & ANNOTATIONS ============ */}
        
        {/* Top area formulas */}
        <text className="sketch-text equation" x="1100" y="100">
          ε = ΔL/L₀
        </text>
        
        <text className="sketch-text equation" x="1300" y="140">
          e = (t - L)/L
        </text>

        {/* Left side specs */}
        <g className="sketch-group" transform="translate(50, 550)">
          <text className="sketch-text specs">30-02m/1.8N</text>
          <text className="sketch-text specs" y="14">DZ:200:1.02</text>
          <text className="sketch-text specs" y="28">ENTITY: FSQ-95</text>
          <text className="sketch-text specs" y="42">INIT&lt; Da_LIGHT</text>
        </g>

        {/* Right side formulas */}
        <g className="sketch-group" transform="translate(1650, 700)">
          <text className="sketch-text equation">b₁ = t₁ - t₀</text>
          <text className="sketch-text equation" y="24">b₂ = 2(Δc) tan φ</text>
        </g>

        {/* Center-right coordinates */}
        <g className="sketch-group" transform="translate(1500, 400)">
          <text className="sketch-text coords">x: 0.7533</text>
          <text className="sketch-text coords" y="16">y: 0.4892</text>
          <text className="sketch-text coords" y="32">z1: 0.8566</text>
        </g>

        {/* Bottom formulas */}
        <text className="sketch-text equation small" x="1100" y="920">
          ∫ f(x)dx = F(b) - F(a)
        </text>

        {/* Matrix notation */}
        <text className="sketch-text equation" x="200" y="820">
          [A] × [B]⁻¹
        </text>

        {/* ============ SCATTERED NODES ============ */}
        <circle className="sketch-node-circle filled cyan" cx="450" cy="180" r="4" />
        <circle className="sketch-node-circle" cx="600" cy="220" r="5" />
        <rect className="sketch-node" x="846" y="276" width="8" height="8" />
        <polygon className="sketch-diamond filled" points="1000,350 1006,356 1000,362 994,356" />
        <circle className="sketch-node-circle filled" cx="1200" cy="450" r="4" />
        <rect className="sketch-node" x="1346" y="546" width="8" height="8" />
        <circle className="sketch-node-circle filled cyan" cx="550" cy="750" r="5" />
        <polygon className="sketch-diamond" points="900,680 906,686 900,692 894,686" />

        {/* ============ CONNECTING LINES ============ */}
        <line className="sketch-line thin" x1="450" y1="180" x2="600" y2="220" />
        <line className="sketch-line thin dashed" x1="600" y1="220" x2="850" y2="280" />
        <line className="sketch-line thin" x1="1200" y1="450" x2="1350" y2="550" />

        {/* ============ ANNOTATION ARROWS ============ */}
        <g className="sketch-group" transform="translate(1400, 300)">
          <line className="sketch-line annotation" x1="0" y1="0" x2="80" y2="-40" />
          <text className="sketch-text specs" x="85" y="-45">NOMINAL THIKC</text>
          <text className="sketch-text specs" x="85" y="-31">TENSOR COATED</text>
        </g>

        {/* ============ PARTIAL SPIRAL ============ */}
        <g className="sketch-group" transform="translate(1550, 180)">
          <path 
            className="sketch-curve thin"
            d="M 0 0 Q 20 -20, 40 0 Q 60 20, 40 40 Q 20 60, 0 40"
            fill="none"
          />
          <circle className="sketch-node-circle" cx="0" cy="0" r="3" />
        </g>

        {/* ============ DASHED DIAGONAL CONSTRUCTION LINES ============ */}
        <line className="sketch-line thin dashed" x1="200" y1="150" x2="400" y2="350" />
        <line className="sketch-line thin dashed" x1="1500" y1="800" x2="1700" y2="600" />

      </svg>
    </div>
  )
}
