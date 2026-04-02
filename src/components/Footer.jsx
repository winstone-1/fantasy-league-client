// src/components/Footer.jsx

import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 pt-8 mt-auto">
      {/* Top row */}
      <div className="flex flex-wrap justify-between items-start gap-8 mb-8">
        {/* Branding */}
        <div>
          <h2 className="text-white font-bold text-lg mb-2">FantasyDash</h2>
          <p className="text-white/45 text-sm leading-relaxed">
            Your all-in-one fantasy league <br />
            dashboard for EPL &amp; NBA.
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap items-center gap-8">
          {["Dashboard", "Standings", "Live", "Players", "Profile"].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase()}`}
              className="text-white/55 text-sm hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom row */}
      <div className="border-t border-white/10 pt-5 flex flex-wrap justify-between items-center gap-4">
        <p className="text-white/30 text-xs">
          © 2026 FantasyDash · Built for the capstone 
        </p>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-white/6 border border-white/10 rounded-full px-3 py-1 text-xs text-white">
             EPL
          </span>
          <span className="flex items-center gap-1.5 bg-white/6 border border-white/10 rounded-full px-3 py-1 text-xs text-white">
             NBA
          </span>
          <span className="text-white/30 text-xs">Season 2026</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;