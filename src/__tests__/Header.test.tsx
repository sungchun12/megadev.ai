import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '../components/Header'

describe('Header', () => {
  describe('Rendering', () => {
    it('renders a header element', () => {
      render(<Header />)
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })

    it('renders with correct header class', () => {
      render(<Header />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('header')
    })
  })

  describe('Title Content', () => {
    it('displays "megadev" text', () => {
      render(<Header />)
      expect(screen.getByText('megadev')).toBeInTheDocument()
    })

    it('displays ".ai" domain text', () => {
      render(<Header />)
      expect(screen.getByText('.ai')).toBeInTheDocument()
    })

    it('renders title as h1 heading', () => {
      render(<Header />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('header-title')
    })

    it('has correct CSS classes for title parts', () => {
      render(<Header />)
      const megadev = screen.getByText('megadev')
      const domain = screen.getByText('.ai')
      
      expect(megadev).toHaveClass('header-title-main')
      expect(domain).toHaveClass('header-title-domain')
    })
  })

  describe('Tagline', () => {
    it('displays tagline text', () => {
      render(<Header />)
      expect(screen.getByText('hyper-leverage tools & experiences')).toBeInTheDocument()
    })

    it('renders tagline with correct class', () => {
      render(<Header />)
      const tagline = screen.getByText('hyper-leverage tools & experiences')
      expect(tagline).toHaveClass('header-tagline-text')
    })
  })

  describe('Structure', () => {
    it('has proper semantic hierarchy', () => {
      const { container } = render(<Header />)
      
      // Header contains h1
      const header = container.querySelector('header')
      const h1 = container.querySelector('h1')
      const p = container.querySelector('p')
      
      expect(header).toContainElement(h1!)
      expect(header).toContainElement(p!)
    })
  })
})

