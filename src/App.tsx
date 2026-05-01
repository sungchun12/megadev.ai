import { BlueprintCoordinates } from './components/BlueprintCoordinates'
import { ShaderBackground } from './components/ShaderBackground'
import { CharacterDisplay } from './components/CharacterDisplay'
import { Header } from './components/Header'
import { Essay } from './components/Essay'
import { SocialLinks } from './components/SocialLinks'
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
                  <button
                    className="claiw-button"
                    aria-label="Open claiw GitHub repository in new tab"
                    onClick={() =>
                      window.open('https://github.com/sungchun12/claiw', '_blank', 'noopener,noreferrer')
                    }
                  >
                    claiw
                  </button>
                </h2>
                <p className="annotation-subtitle">Personal collection of AI workflows from the CLI</p>
                <div className="annotation-divider" />
                <p className="annotation-description">
                  Run them to feel mega: built by Sung, for everyone.
                  <br />
                  <span className="annotation-hint">[ click to activate ]</span>
                </p>
              </div>

              {/* Coming Soon Tools */}
              <div className="annotation annotation-coming-soon">
                <span className="annotation-label">TOOL_02</span>
                <span className="annotation-title-muted">[ coming soon ]</span>
              </div>
              <div className="annotation annotation-coming-soon">
                <span className="annotation-label">TOOL_03</span>
                <span className="annotation-title-muted">[ coming soon ]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          className="scroll-indicator"
          aria-label="Scroll to read more about megadev"
          onClick={() => document.querySelector('.essay-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="scroll-indicator-teaser">What is a Megadev?</span>
          <span className="scroll-indicator-text">Scroll</span>
          <div className="scroll-indicator-arrow" />
        </button>
      </section>

      {/* Essay Section */}
      <Essay />

      {/* Social Links - Fixed Position */}
      <SocialLinks />
    </main>
  )
}

export default App

