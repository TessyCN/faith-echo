import { Church, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Church Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Church className="h-6 w-6" />
              <span className="text-lg font-semibold">FFI Testimonies</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Sharing stories of God's faithfulness to build faith and inspire hope in our community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Home
              </Link>
              <Link to="/testimonies" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Testimonies
              </Link>
              <Link to="/submit" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Submit Your Story
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span> 5 Oregbeni Street, Off Ihiama, GRA, Benin City, Nigeria</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+2348039396319">+234 803 939 6319</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:info@ffi.org"> info@ffi.org </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/10 mt-10 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {currentYear} FFI Testimonies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
