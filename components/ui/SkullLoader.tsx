"use client";
import { motion } from "framer-motion";
import { Text, Box } from "@mantine/core";

interface SkullLoaderProps {
  size?: number;
  color?: string;
  fullPage?: boolean;
  label?: string;
}

export const SkullLoader = ({
  size = 60,
  color = "#3b82f6",
  fullPage = false,
  label = "", // Default to empty
}: SkullLoaderProps) => {
  
  // 1. The Core Icon Content
  const LoaderContent = (
    <div 
      className="flex flex-col items-center justify-center"
      // Only add gap if there is actually a label to show
      style={{ gap: label ? '1.5rem' : '0' }} 
    >
      <div 
        className="relative flex items-center justify-center" 
        style={{ width: size, height: size }}
      >
        {/* Outer Pulsing Ring - Inset adjusted to stay centered */}
        <motion.div
          className="absolute rounded-full border border-dashed opacity-20"
          style={{ 
            borderColor: color,
            inset: -size * 0.15, // Dynamic scaling based on size
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* The Skull SVG */}
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0.5, scale: 0.9 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "100%",
            height: "100%",
            filter: `drop-shadow(0 0 ${size * 0.1}px ${color}66)`,
          }}
        >
          <path
            d="M12 2C7.03 2 3 6.03 3 11C3 13.84 4.3 16.37 6.34 18.04L7 22H17L17.66 18.04C19.7 16.37 21 13.84 21 11C21 6.03 16.97 2 12 2Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 10L10 11L9 12L8 11L9 10Z" fill={color} />
          <path d="M15 10L16 11L15 12L14 11L15 10Z" fill={color} />
          <path d="M11 14H13M10 17H14M12 14V17" stroke={color} strokeWidth="1" />
        </motion.svg>
      </div>

      {/* Conditionally render the Label and its container */}
      {label && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Text className="text-[10px] font-mono uppercase tracking-[0.4em] text-blue-500">
            {label}
          </Text>
        </motion.div>
      )}
    </div>
  );

  // 2. Full Page Wrapper Logic
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
        {/* Background Grid */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', 
            backgroundSize: '50px 50px' 
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent h-full w-full animate-scanline pointer-events-none" />
        
        <div className="relative z-10">
          {LoaderContent}
        </div>

        <style jsx global>{`
          @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
          .animate-scanline { animation: scanline 8s linear infinite; }
        `}</style>
      </div>
    );
  }

  return LoaderContent;
};