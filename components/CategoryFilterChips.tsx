"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';

interface FilterChip {
  label: string;
  href: string;
  imageUrl: string | null;
}

interface CategoryFilterChipsProps {
  filters: FilterChip[];
  activeCollection?: string | null;
}

export default function CategoryFilterChips({ filters, activeCollection }: CategoryFilterChipsProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Mouse Drag to Scroll states
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 120 && currentScrollY > lastScrollY + 5) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 5 || currentScrollY < 50) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault(); // Prevent default link/image dragging while scrolling
  };

  return (
    <div 
      className={`sticky z-40 transition-all duration-500 ease-in-out bg-surface/95 backdrop-blur-md py-4 md:py-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-black/5 ${
        isVisible ? 'top-14 md:top-[68px]' : '-top-[200px]'
      }`}
      dir="rtl"
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <div 
          ref={scrollRef}
          className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing w-full"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="flex gap-5 md:gap-8 whitespace-nowrap justify-start w-max px-1">
            {filters.map((f) => {
              const isActive = f.href === '/products'
                ? !activeCollection
                : activeCollection === new URLSearchParams(f.href.split('?')[1]).get('collection');

              return (
                <Link
                  key={f.href}
                  href={f.href}
                  className="flex flex-col items-center gap-2 group shrink-0"
                  onDragStart={handleDragStart}
                  onClick={(e) => {
                    // Prevent click if we are dragging
                    if (isDragging) e.preventDefault();
                  }}
                >
                  <div 
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center overflow-hidden border-[3px] transition-all duration-300 pointer-events-none ${
                      isActive
                        ? 'border-brand shadow-[0_0_15px_rgba(32,37,34,0.1)] scale-105'
                        : 'border-transparent bg-black/5 group-hover:border-brand/30 group-hover:scale-105'
                    }`}
                  >
                    {f.imageUrl ? (
                      <Image
                        src={f.imageUrl}
                        alt={f.label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 64px, 96px"
                        draggable={false}
                      />
                    ) : (
                      <LayoutGrid className={`w-6 h-6 md:w-8 md:h-8 ${isActive ? 'text-brand' : 'text-foreground/40 group-hover:text-brand'} transition-all`} />
                    )}
                  </div>
                  
                  <span 
                    className={`text-xs md:text-sm font-bold transition-colors pointer-events-none ${
                      isActive ? 'text-brand' : 'text-foreground/70 group-hover:text-brand'
                    }`}
                  >
                    {f.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
