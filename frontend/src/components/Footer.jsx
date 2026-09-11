import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="mt-16 bg-brand-900 text-brand-300">
      <div className="page-container section-padding">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <img src={assets.logo} className="mb-5 h-8 brightness-0 invert" alt="Forever" />
            <p className="max-w-md text-sm leading-relaxed text-brand-400">
              Discover timeless fashion at Forever. Curated clothing and accessories designed to elevate your wardrobe and help you feel confident every day.
            </p>
          </div>

          <div>
            <p className="eyebrow mb-4 text-brand-400">Company</p>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link to="/collection" className="hover:text-white transition-colors">Shop</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-brand-400">Get in touch</p>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>+91 1234567890</li>
              <li>contact@foreveryou.com</li>
              <li className="text-brand-400">Mon – Sat, 9am – 6pm IST</li>
            </ul>
          </div>
        </div>

        <div className="divider-fade my-10 opacity-30" />

        <p className="text-center text-xs text-brand-500">
          © {new Date().getFullYear()} forever.com — All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
