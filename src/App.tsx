import { BlueprintCoordinates } from './components/BlueprintCoordinates'
import { ShaderBackground } from './components/ShaderBackground'
import { CharacterDisplay } from './components/CharacterDisplay'
import { Header } from './components/Header'
import { Essay } from './components/Essay'
import './App.css'

function App() {
  return (
    <main className="app">
      {/* Hero Section - First Viewport */}
      <section className="hero-section">
        <ShaderBackground />
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
                <p className="annotation-subtitle">Personal collection of AI workflows from the CLI</p>
                <div className="annotation-divider" />
                <p className="annotation-description">
                  Run AI workflows that make you mega: built by Sung, for everyone.
                  <br />
                  <span className="annotation-hint">[ click to activate ]</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator" aria-hidden="true">
          <span className="scroll-indicator-text">Scroll</span>
          <div className="scroll-indicator-arrow" />
        </div>
      </section>

      {/* Essay Section */}
      <Essay />
    </main>
  )
}

export default App

