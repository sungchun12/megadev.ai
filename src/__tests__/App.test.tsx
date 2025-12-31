import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock all heavy components to focus on App integration
vi.mock('../components/BlueprintCoordinates', () => ({
  BlueprintCoordinates: () => <div data-testid="blueprint-coordinates" />,
}))

vi.mock('../components/ShaderBackground', () => ({
  ShaderBackground: () => <div data-testid="shader-background" />,
}))

vi.mock('../components/CharacterDisplay', () => ({
  CharacterDisplay: () => <div data-testid="character-display" />,
}))

vi.mock('../components/Header', () => ({
  Header: () => (
    <header data-testid="header">
      <h1>megadev.ai</h1>
    </header>
  ),
}))

vi.mock('../components/Essay', () => ({
  Essay: () => <section data-testid="essay" />,
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Structure', () => {
    it('renders main app container', () => {
      render(<App />)
      const main = document.querySelector('main.app')
      expect(main).toBeInTheDocument()
    })

    it('renders all major components', () => {
      render(<App />)

      expect(screen.getByTestId('shader-background')).toBeInTheDocument()
      expect(screen.getByTestId('blueprint-coordinates')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('character-display')).toBeInTheDocument()
      expect(screen.getByTestId('essay')).toBeInTheDocument()
    })

    it('has app-content wrapper', () => {
      render(<App />)
      const appContent = document.querySelector('.app-content')
      expect(appContent).toBeInTheDocument()
    })

    it('has hero-container', () => {
      render(<App />)
      const heroContainer = document.querySelector('.hero-container')
      expect(heroContainer).toBeInTheDocument()
    })

    it('has annotation-panel', () => {
      render(<App />)
      const annotationPanel = document.querySelector('.annotation-panel')
      expect(annotationPanel).toBeInTheDocument()
    })
  })

  describe('Annotation Section', () => {
    it('displays TOOL_01 label', () => {
      render(<App />)
      expect(screen.getByText('TOOL_01')).toBeInTheDocument()
    })

    it('displays claiw title', () => {
      render(<App />)
      expect(screen.getByText('claiw')).toBeInTheDocument()
    })

    it('displays claiw description', () => {
      render(<App />)
      expect(screen.getByText('Personal collection of AI workflows from the CLI')).toBeInTheDocument()
    })

    it('displays click hint', () => {
      render(<App />)
      expect(screen.getByText('[ click to activate ]')).toBeInTheDocument()
    })
  })

  describe('Claiw Link Interactions', () => {
    const mockWindowOpen = vi.fn()

    beforeEach(() => {
      vi.stubGlobal('open', mockWindowOpen)
    })

    it('claiw button has correct class for styling', () => {
      render(<App />)
      const claiw = screen.getByText('claiw')

      // Check button has the correct class (CSS handles actual styling)
      expect(claiw).toHaveClass('claiw-button')
    })

    it('claiw link opens GitHub on click', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const claiw = screen.getByText('claiw')
      await user.click(claiw)
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://github.com/sungchun12/claiw',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('claiw link opens GitHub on Enter key', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const claiw = screen.getByText('claiw')
      claiw.focus()
      await user.keyboard('{Enter}')
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://github.com/sungchun12/claiw',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('claiw link opens GitHub on Space key', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const claiw = screen.getByText('claiw')
      claiw.focus()
      await user.keyboard(' ')
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://github.com/sungchun12/claiw',
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('claiw link does not open on other keys', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const claiw = screen.getByText('claiw')
      claiw.focus()
      await user.keyboard('a')
      
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('claiw link has role="button"', () => {
      render(<App />)
      const claiw = screen.getByRole('button', { name: /open claiw github repository/i })
      expect(claiw).toBeInTheDocument()
    })

    it('claiw link has aria-label', () => {
      render(<App />)
      const claiw = screen.getByText('claiw')
      expect(claiw).toHaveAttribute('aria-label', 'Open claiw GitHub repository in new tab')
    })

    it('claiw button is natively focusable', () => {
      render(<App />)
      const claiw = screen.getByText('claiw')
      // Native button elements are focusable without tabIndex
      expect(claiw.tagName.toLowerCase()).toBe('button')
    })

    it('main element uses semantic landmark', () => {
      render(<App />)
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('has proper heading hierarchy (h2 for annotation title)', () => {
      render(<App />)
      // The annotation title should be h2 (h1 is in Header)
      const h2 = document.querySelector('h2.annotation-title')
      expect(h2).toBeInTheDocument()
    })
  })

  describe('Semantic Structure', () => {
    it('annotation has proper structure', () => {
      render(<App />)
      
      const annotation = document.querySelector('.annotation')
      const annotationLine = document.querySelector('.annotation-line')
      const annotationLabel = document.querySelector('.annotation-label')
      const annotationTitle = document.querySelector('.annotation-title')
      const annotationSubtitle = document.querySelector('.annotation-subtitle')
      const annotationDivider = document.querySelector('.annotation-divider')
      const annotationDescription = document.querySelector('.annotation-description')
      
      expect(annotation).toBeInTheDocument()
      expect(annotationLine).toBeInTheDocument()
      expect(annotationLabel).toBeInTheDocument()
      expect(annotationTitle).toBeInTheDocument()
      expect(annotationSubtitle).toBeInTheDocument()
      expect(annotationDivider).toBeInTheDocument()
      expect(annotationDescription).toBeInTheDocument()
    })

    it('annotation line is hidden from screen readers', () => {
      render(<App />)
      const annotationLine = document.querySelector('.annotation-line')
      expect(annotationLine).toHaveAttribute('aria-hidden', 'true')
    })
  })
})

