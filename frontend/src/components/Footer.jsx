import { motion } from "framer-motion";
import {
  Activity,
  Lock,
  MessageCircle,
  Terminal,
  User
} from "lucide-react";
import TeamLogo from "../assets/Daitya_Legion_LOGO.png";

const Footer = () => {
  const whatsappUrl =
    "https://wa.me/918755903705?text=Reporting%20for%20Digital%20Operations%20Deployment.";
  const instagramUrl = "https://www.instagram.com/multiverse.sagar/";
  const linkedinUrl = "https://www.linkedin.com/in/sagarakanoone/";

  return (
    <footer className="relative w-full py-20 bg-[#050505] border-t border-white/5 overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,#88080811,transparent_70%)] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-center border-b border-white/5 pb-16">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-4 mb-6 group cursor-crosshair">
              <div className="w-16 h-16 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <img
                  src={TeamLogo}
                  alt="Daitya Legion Official Logo"
                  className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(136,8,8,0.5)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-[0.2em] uppercase italic group-hover:text-primary transition-colors">
                  DAITYA <span className="text-primary not-italic">LEGION</span>
                </span>
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.5em] mt-1">
                  Official Team Seal
                </span>
              </div>
            </div>
            <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed max-w-xs">
              Daitya Legion Cricket Club // Established 2024.
            </p>
          </div>

          <div className="flex flex-col items-center text-center px-4">
            <div className="flex items-center gap-4 text-gray-800 mb-6 px-6 py-2 border border-white/5 bg-white/[0.02] rounded-full">
              <Activity className="w-3.5 h-3.5 animate-pulse text-green-700" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                Network: Match Sync Online
              </span>
            </div>

            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.6em] mb-4 opacity-60 italic">
              Founder
            </p>
            <h4 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-2 glow-text-primary">
              SAGAR PATHAK
            </h4>
            <p className="text-primary/60 text-[9px] font-black uppercase tracking-[0.8em] mb-8">
              Lead Developer
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-primary/20 border border-white/10 text-white transition-all text-[9px] font-black uppercase tracking-[0.4em] group"
              >
                <Activity className="w-3.5 h-3.5 text-primary" />
                Instagram
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-primary/20 border border-white/10 text-white transition-all text-[9px] font-black uppercase tracking-[0.4em] group"
              >
                <User className="w-3.5 h-3.5 text-blue-700" />
                LinkedIn
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-4 px-10 py-4 bg-primary/10 hover:bg-primary border border-primary/40 text-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.6em] group shadow-[0_0_40px_rgba(136,8,8,0.1)]"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Developer
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-8">
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  className="w-10 h-[1px] bg-primary"
                ></motion.div>
              ))}
            </div>

            {/* Admin Control Section */}
            <div className="flex flex-col items-center md:items-end gap-5">
              <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">
                Admin Access
              </span>
              <a
                href="/admin/login"
                className="flex items-center gap-3 px-6 py-3 bg-black/40 hover:bg-primary border border-white/5 hover:border-primary transition-all text-white rounded-sm group shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              >
                <Lock className="w-3.5 h-3.5 text-primary group-hover:text-white transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                  ADMINISTRATION
                </span>
              </a>
              <div className="flex items-center gap-3 text-gray-800">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                  Platform Version 5.0
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5 mt-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">
            © 2024 Daitya Legion Cricket Club //{" "}
            <span className="text-white">developed by Sagar Pathak</span>
          </p>
          <div className="flex gap-10">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.8em] cursor-pointer hover:text-primary transition-colors">
              Privacy Policy
            </span>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.8em] cursor-pointer hover:text-primary transition-colors">
              Terms of Service
            </span>
            <span className="text-[8px] font-black text-primary/40 uppercase tracking-[0.8em]">
              Secure Admin Portal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
