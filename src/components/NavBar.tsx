'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Info } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Buyers', href: '/buyers', info: 'Fresh produce sourcing' },
  { name: 'F&F Fund', href: '/ff-fund' },
  { name: 'Trace', href: '/trace' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Admin', href: '/admin' },
]

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showBuyerInfo, setShowBuyerInfo] = useState(false)

  return (
    <nav className="bg-black/80 backdrop-blur-lg border-b border-emerald-500/20" role="navigation" aria-label="Main navigation">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-display font-bold text-white">
                GreenStem<span className="text-emerald-400">Global</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-white/80 hover:text-emerald-400 transition-colors flex items-center"
                    onMouseEnter={() => item.info && setShowBuyerInfo(true)}
                    onMouseLeave={() => setShowBuyerInfo(false)}
                  >
                    {item.name}
                    {item.info && <Info className="w-3 h-3 ml-1" />}
                  </Link>
                  {item.info && showBuyerInfo && (
                    <div className="absolute top-full left-0 mt-1 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                      {item.info}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-white/80 hover:bg-white/10 hover:text-emerald-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
