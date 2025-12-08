import { useCallback } from 'react'
import { Whip3D } from './Whip3D'
import './CharacterDisplay.css'

const GITHUB_URL = 'https://github.com/sungchun12/claiw'

export function CharacterDisplay() {
  const handleClick = useCallback(() => {
    window.open(GITHUB_URL, '_blank', 'noopener,noreferrer')
  }, [])

  return (
    <div className="character-display">
      <Whip3D onClick={handleClick} />
      <span className="sr-only">Click the whip to visit claiw on GitHub</span>
    </div>
  )
}

