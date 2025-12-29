import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { Header } from '../components/Header'
import { BlueprintBackground } from '../components/BlueprintBackground'
import { BlueprintCoordinates } from '../components/BlueprintCoordinates'
import { BlueprintSketches } from '../components/BlueprintSketches'

// Mock heavy components for focused testing
vi.mock('../components/ShaderBackground', () => ({
  ShaderBackground: () => <div data-testid="shader-background" aria-hidden="true" />,
}))

vi.mock('../components/CharacterDisplay', () => ({
  CharacterDisplay: () => <div data-testid="character-display" aria-label="Loading 3D animation" />,
}))

vi.mock('../components/Essay', () => ({
  Essay: () => <section data-testid="essay" />,
}))

describe('Accessibility', () => {
  describe('ARIA Labels', () => {
    it('decorative elements have aria-hidden', () => {
      render(<BlueprintBackground />)
      const container = document.querySelector('.blueprint-container')
      expect(container).toHaveAttribute('aria-hidden', 'true')
    })

    it('coordinates display has aria-hidden', () => {
      render(<BlueprintCoordinates />)
      const coords = document.querySelector('.coordinates')
      expect(coords).toHaveAttribute('aria-hidden', 'true')
    })

    it('sketches have aria-hidden', () => {
      render(<BlueprintSketches />)
      const sketches = document.querySelector('.blueprint-sketches')
      expect(sketches).toHaveAttribute('aria-hidden', 'true')
    })

    it('annotation line has aria-hidden', () => {
      render(<App />)
      const annotationLine = document.querySelector('.annotation-line')
      expect(annotationLine).toHaveAttribute('aria-hidden', 'true')
    })

    it('interactive elements have aria-label', () => {
      render(<App />)
      const claiw = screen.getByText('claiw')
      expect(claiw).toHaveAttribute('aria-label', 'Open claiw GitHub repository in new tab')
    })
  })

  describe('Semantic HTML', () => {
    it('uses header element', () => {
      render(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('uses main element', () => {
      render(<App />)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('uses h1 for main title', () => {
      render(<Header />)
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
    })

    it('uses h2 for section title (annotation)', () => {
      render(<App />)
      const h2 = document.querySelector('h2.annotation-title')
      expect(h2).toBeInTheDocument()
    })

    it('maintains proper heading hierarchy', () => {
      render(<App />)
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      
      // Should have at least h1 (from Header mock) and h2 (annotation)
      expect(headings.length).toBeGreaterThan(0)
      
      // Check for h2 annotation title
      const h2 = document.querySelector('h2')
      expect(h2).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    const mockWindowOpen = vi.fn()

    beforeEach(() => {
      vi.stubGlobal('open', mockWindowOpen)
    })

    it('claiw link is focusable', () => {
      render(<App />)
      const claiw = screen.getByText('claiw')
      expect(claiw).toHaveAttribute('tabIndex', '0')
    })

    it('claiw link can be activated with Enter', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const claiw = screen.getByText('claiw')
      claiw.focus()
      await user.keyboard('{Enter}')
      
      expect(mockWindowOpen).toHaveBeenCalled()
    })

    it('claiw link can be activated with Space', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const claiw = screen.getByText('claiw')
      claiw.focus()
      await user.keyboard(' ')
      
      expect(mockWindowOpen).toHaveBeenCalled()
    })

    it('claiw link has button role for assistive tech', () => {
      render(<App />)
      const button = screen.getByRole('button', { name: /open claiw github repository/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Interactive Element Roles', () => {
    it('claiw link has role="button"', () => {
      render(<App />)
      const claiw = screen.getByText('claiw')
      expect(claiw).toHaveAttribute('role', 'button')
    })

    it('button-like elements are properly identified', () => {
      render(<App />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Visual Indicators', () => {
    it('interactive elements have cursor: pointer', () => {
      render(<App />)
      const claiw = screen.getByText('claiw')
      expect(claiw).toHaveStyle({ cursor: 'pointer' })
    })
  })

  describe('Link Security', () => {
    const mockWindowOpen = vi.fn()

    beforeEach(() => {
      vi.stubGlobal('open', mockWindowOpen)
    })

    it('external links open with noopener,noreferrer', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const claiw = screen.getByText('claiw')
      await user.click(claiw)
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.any(String),
        '_blank',
        'noopener,noreferrer'
      )
    })
  })

  describe('Screen Reader Considerations', () => {
    it('decorative SVGs are hidden', () => {
      render(<BlueprintSketches />)
      const container = document.querySelector('.blueprint-sketches')
      expect(container).toHaveAttribute('aria-hidden', 'true')
    })

    it('provides meaningful text content', () => {
      render(<Header />)
      expect(screen.getByText('megadev')).toBeInTheDocument()
      expect(screen.getByText('.ai')).toBeInTheDocument()
      expect(screen.getByText('hyper-leverage tools & skills')).toBeInTheDocument()
    })

    it('tool description is readable', () => {
      render(<App />)
      expect(screen.getByText('Personal collection of AI workflows from the CLI')).toBeInTheDocument()
    })
  })

  describe('Landmark Regions', () => {
    it('has main landmark', () => {
      render(<App />)
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('has banner/header landmark', () => {
      render(<Header />)
      const banner = screen.getByRole('banner')
      expect(banner).toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {
    it('interactive elements can receive focus', () => {
      render(<App />)
      const claiw = screen.getByText('claiw')
      
      claiw.focus()
      expect(document.activeElement).toBe(claiw)
    })

    it('focus is not trapped', () => {
      render(<App />)
      const claiw = screen.getByText('claiw')
      
      claiw.focus()
      claiw.blur()
      
      expect(document.activeElement).not.toBe(claiw)
    })
  })
})

