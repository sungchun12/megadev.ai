import { BlueprintBackground } from './components/BlueprintBackground'
import { BlueprintCoordinates } from './components/BlueprintCoordinates'
import { Header } from './components/Header'
import './App.css'

function App() {
  return (
    <main className="app">
      <BlueprintBackground />
      <BlueprintCoordinates />
      
      <div className="app-content">
        <Header />
        
        <div className="hero-container">
          <div className="character-placeholder">
            <span className="placeholder-text">[ CHARACTER ]</span>
            <span className="placeholder-subtext">megadev character coming soon</span>
          </div>
          
          <div className="annotation-panel">
            <div className="annotation">
              <div className="annotation-line" aria-hidden="true" />
              <span className="annotation-label">TOOL_01</span>
              <h2 className="annotation-title">claiw</h2>
              <p className="annotation-subtitle">CLI AI Whip</p>
              <div className="annotation-divider" />
              <p className="annotation-description">
                Crack through CLI with AI precision.
                <br />
                <span className="annotation-hint">[ hover to activate ]</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App

