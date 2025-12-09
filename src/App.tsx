import { BlueprintBackground } from './components/BlueprintBackground'
import { BlueprintCoordinates } from './components/BlueprintCoordinates'
import { BlueprintSketches } from './components/BlueprintSketches'
import { ShaderBackground } from './components/ShaderBackground'
import { CharacterDisplay } from './components/CharacterDisplay'
import { Header } from './components/Header'
import './App.css'

function App() {
  return (
    <main className="app">
      <BlueprintBackground />
      <ShaderBackground />
      <BlueprintSketches />
      <BlueprintCoordinates />
      
      <div className="app-content">
        <Header />
        
        <div className="hero-container">
          <CharacterDisplay />
          
          <div className="annotation-panel">
            <div className="annotation">
              <div className="annotation-line" aria-hidden="true" />
              <span className="annotation-label">TOOL_01</span>
              <h2 className="annotation-title">
                <span
                  style={{
                    color: '#00FEFF',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="Open claiw GitHub repository in new tab"
                  onClick={() =>
                    window.open('https://github.com/sungchun12/claiw', '_blank', 'noopener,noreferrer')
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      window.open('https://github.com/sungchun12/claiw', '_blank', 'noopener,noreferrer')
                    }
                  }}
                >
                  claiw
                </span>
              </h2>
              <p className="annotation-subtitle">Durable pydantic-ai workflows from the CLI</p>
              <div className="annotation-divider" />
              <p className="annotation-description">
                Build AI workflows that make you mega: easy to debug, iterate, and deploy
                <br />
                <span className="annotation-hint">[ click to activate ]</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App

