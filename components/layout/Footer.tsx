import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg terra-gradient flex items-center justify-center">
                <span className="text-white font-black text-lg">G</span>
              </div>
              <div>
                <span className="font-black text-lg text-white">GeoFredE</span>
                <p className="text-xs text-gray-400">Terra State</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Rwanda&apos;s premier real estate and land survey management platform. Connecting clients with expert agents across all provinces.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              {['Land Survey', 'Topographic Survey', 'Construction Permit', 'Property Valuation', 'Parcel Rental', 'Land Sales', 'Building Sales', 'Building Construction'].map((s) => (
                <li key={s}><Link href="/services" className="hover:text-primary transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Home' }, { href: '/properties', label: 'Browse Properties' },
                { href: '/about', label: 'About Us' }, { href: '/contact', label: 'Contact' },
                { href: '/auth/register', label: 'Create Account' }, { href: '/auth/agent-register', label: 'Become an Agent' },
              ].map(({ href, label }) => (
                <li key={href}><Link href={href} className="hover:text-primary transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>KG 123 St, Gasabo District<br />Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+250788000000" className="hover:text-primary transition-colors">+250 788 000 000</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:info@geofred.com" className="hover:text-primary transition-colors">info@geofred.com</a>
              </div>
            </div>

            <div className="mt-6 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
              <strong className="text-gray-300">Office Hours</strong><br />
              Mon – Fri: 8:00 AM – 6:00 PM<br />
              Sat: 9:00 AM – 3:00 PM
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>© 2024 GeoFredE-Terra State. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
