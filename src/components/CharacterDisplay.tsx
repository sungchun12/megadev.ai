import { useState, useCallback } from 'react'
import './CharacterDisplay.css'

const GITHUB_URL = 'https://github.com/sungchun12/claiw'

export function CharacterDisplay() {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = useCallback(() => {
    window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])

  return (
    <div className="character-display">
      <div 
        className={`character-wrapper ${isHovered ? 'whip-active' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Original Zero image with CSS color transformation */}
        <img 
          src="/whip.webp" 
          alt="Megadev character wielding energy whip"
          className="character-image"
        />
        
        {/* Whip hitbox overlay - covers the whip area */}
        <button
          className="whip-hitbox"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          aria-label="Visit claiw on GitHub - CLI AI Whip Tool"
        />
      </div>
    </div>
  )
}

