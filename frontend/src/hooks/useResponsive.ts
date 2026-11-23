import { useState, useEffect } from 'react';

/**
 * Custom hook untuk mendeteksi responsivitas dan zoom level
 * Berguna untuk conditional rendering berdasarkan ukuran layar
 */

interface ResponsiveState {
  // Screen size detection
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  
  // Screen dimensions
  width: number;
  height: number;
  
  // Zoom level detection
  zoomLevel: number;
  isZoomed: boolean;
  
  // Device detection
  isTouchDevice: boolean;
  
  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;
}

// Breakpoints sesuai dengan Tailwind CSS
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const useResponsive = (): ResponsiveState => {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false,
    width: 0,
    height: 0,
    zoomLevel: 1,
    isZoomed: false,
    isTouchDevice: false,
    isPortrait: false,
    isLandscape: false,
  });

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detect zoom level
      const zoomLevel = Math.round((window.outerWidth / window.innerWidth) * 100) / 100;
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Calculate actual zoom (considering device pixel ratio)
      const actualZoom = Math.round((devicePixelRatio / zoomLevel) * 100) / 100;
      
      // Screen size detection
      const isMobile = width < BREAKPOINTS.md;
      const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
      const isDesktop = width >= BREAKPOINTS.lg && width < BREAKPOINTS['2xl'];
      const isLarge = width >= BREAKPOINTS['2xl'];
      
      // Touch device detection
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Orientation detection
      const isPortrait = height > width;
      const isLandscape = width > height;
      
      setResponsiveState({
        isMobile,
        isTablet,
        isDesktop,
        isLarge,
        width,
        height,
        zoomLevel: actualZoom,
        isZoomed: actualZoom > 1.1, // Consider zoomed if > 110%
        isTouchDevice,
        isPortrait,
        isLandscape,
      });
    };

    // Initial call
    updateResponsiveState();

    // Event listeners
    window.addEventListener('resize', updateResponsiveState);
    window.addEventListener('orientationchange', updateResponsiveState);
    
    // Zoom detection (less reliable but helps)
    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateResponsiveState, 250);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', updateResponsiveState);
      window.removeEventListener('orientationchange', updateResponsiveState);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return responsiveState;
};

/**
 * Hook untuk mendapatkan breakpoint saat ini
 */
export const useBreakpoint = () => {
  const { width } = useResponsive();
  
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
};

/**
 * Hook untuk conditional rendering berdasarkan screen size
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

/**
 * Predefined media queries untuk kemudahan
 */
export const useMediaQueries = () => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
  const isTablet = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`);
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isLarge = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`);
  
  return {
    isMobile,
    isTablet, 
    isDesktop,
    isLarge,
  };
};

/**
 * Hook untuk mendapatkan ukuran modal yang optimal
 */
export const useOptimalModalSize = () => {
  const { width, isMobile, isTablet } = useResponsive();
  
  if (isMobile) return 'full';
  if (isTablet) return 'lg';
  if (width < 1440) return 'xl';
  return '2xl';
};

/**
 * Hook untuk mendapatkan jumlah kolom grid yang optimal
 */
export const useOptimalGridColumns = (maxColumns: number = 4) => {
  const { isMobile, isTablet, width } = useResponsive();
  
  if (isMobile) return 1;
  if (isTablet) return Math.min(2, maxColumns);
  if (width < 1440) return Math.min(3, maxColumns);
  return maxColumns;
};

export default useResponsive;
