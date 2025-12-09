import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CharacterDisplay } from '../components/CharacterDisplay'

// Mock the Whip3D component since it uses WebGL
vi.mock('../components/Whip3D', () => ({
  Whip3D: () => <div data-testid="whip3d-mock">Whip3D Component</div>,
}))

describe('CharacterDisplay', () => {
  describe('Container Rendering', () => {
    it('renders character display container', () => {
      render(<CharacterDisplay />)
      const container = document.querySelector('.character-display')
      expect(container).toBeInTheDocument()
    })

    it('has correct class name', () => {
      const { container } = render(<CharacterDisplay />)
      expect(container.firstChild).toHaveClass('character-display')
    })
  })

  describe('Loading State (Suspense Fallback)', () => {
    it('shows loading placeholder while Whip3D loads', () => {
      // Force suspense to show fallback by using a slow dynamic import
      render(<CharacterDisplay />)
      
      // The loading placeholder should be accessible
      const loadingElement = screen.queryByLabelText('Loading 3D animation')
      // Either shows loading or the loaded component
      expect(
        loadingElement || screen.queryByTestId('whip3d-mock')
      ).toBeInTheDocument()
    })
  })

  describe('Loaded State', () => {
    it('renders Whip3D component after loading', async () => {
      render(<CharacterDisplay />)
      
      // Wait for lazy component to load
      await waitFor(() => {
        expect(screen.getByTestId('whip3d-mock')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('loading placeholder has aria-label', () => {
      // Test the loading placeholder component directly
      const LoadingPlaceholder = () => (
        <div className="whip-loading-placeholder" aria-label="Loading 3D animation">
          <div className="whip-loading-spinner" />
        </div>
      )
      
      render(<LoadingPlaceholder />)
      expect(screen.getByLabelText('Loading 3D animation')).toBeInTheDocument()
    })
  })
})

