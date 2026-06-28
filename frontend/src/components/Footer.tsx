import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-gray-300 border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex flex-col">
              <span className="font-playfair text-2xl font-bold tracking-widest text-primary">Regal Rivulet</span>
              <span className="text-[10px] tracking-[0.2em] text-gray-400 font-light -mt-1 uppercase">Retreat Hotel Singapore</span>
            </Link>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Luxury Stays. Exceptional Experiences. Discover a sanctuary of peaceful luxury and world-class hospitality in the heart of Kathmandu, Nepal.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors text-gray-400" aria-label="Facebook">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h3v-9h3.6l.4-3H12V6c0-.9.2-1.2 1-1.2h2V2h-3c-3 0-4 1.7-4 4.8V8z"/></svg>
              </a>
              <a href="#" className="hover:text-primary transition-colors text-gray-400" aria-label="Instagram">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="hover:text-primary transition-colors text-gray-400" aria-label="Twitter">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links Col */}
          <div>
            <h3 className="font-playfair text-white text-lg font-bold mb-4 tracking-wider">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/rooms" className="hover:text-primary transition-colors">Rooms & Suites</Link></li>
              <li><Link to="/gallery" className="hover:text-primary transition-colors">Photo Gallery</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact & Map</Link></li>
            </ul>
          </div>
          
          {/* Contact Col */}
          <div>
            <h3 className="font-playfair text-white text-lg font-bold mb-4 tracking-wider">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-gray-400">10 Bayfront Avenue, Singapore 018956</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span className="text-gray-400">+977 1 555-BELL</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="text-gray-400">info@booking-bell.com</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500 font-light">
          <p>&copy; {new Date().getFullYear()} Regal Rivulet Retreat Hotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
