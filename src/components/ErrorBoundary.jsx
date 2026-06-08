import { Component } from 'react'
import { Link } from 'react-router-dom'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-white text-lg font-semibold mb-2">Something went wrong.</p>
          <p className="text-zinc-500 text-sm mb-8 max-w-sm">
            An unexpected error occurred on this page. This is usually caused by a network issue or an API hiccup.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
            >
              Try again
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false })}
              className="border border-zinc-700 text-zinc-400 hover:text-white px-5 py-2 rounded-md text-sm transition-colors"
            >
              Go home
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
