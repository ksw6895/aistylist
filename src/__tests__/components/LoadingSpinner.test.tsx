import { render, screen } from '@testing-library/react'
import LoadingSpinner from '@/components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSpinner />)
    
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-12', 'w-12')
  })

  it('renders with custom text', () => {
    const text = 'Loading data...'
    render(<LoadingSpinner text={text} />)
    
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('renders in fullscreen mode', () => {
    const { container } = render(<LoadingSpinner fullScreen />)
    
    const fullscreenContainer = container.querySelector('.fixed.inset-0')
    expect(fullscreenContainer).toBeInTheDocument()
    expect(fullscreenContainer).toHaveClass('bg-white/80', 'backdrop-blur-sm')
  })

  it('applies correct size classes', () => {
    const { container, rerender } = render(<LoadingSpinner size="small" />)
    let spinner = container.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-6', 'w-6')

    rerender(<LoadingSpinner size="large" />)
    spinner = container.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-16', 'w-16')
  })

  it('applies custom className', () => {
    const className = 'custom-class'
    const { container } = render(<LoadingSpinner className={className} />)
    
    const wrapper = container.querySelector('.flex.flex-col')
    expect(wrapper).toHaveClass(className)
  })
})