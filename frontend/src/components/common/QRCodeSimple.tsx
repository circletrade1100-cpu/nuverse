import React from 'react';

interface QRCodeSimpleProps {
  value: string;
  size?: number;
  className?: string;
}

const QRCodeSimple: React.FC<QRCodeSimpleProps> = ({ 
  value, 
  size = 80, 
  className = '' 
}) => {
  // Generate a simple visual QR-like pattern based on the value
  const generatePattern = (data: string) => {
    const pattern = [];
    const gridSize = 8; // 8x8 grid for simplicity
    
    // Create a deterministic pattern based on the string hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      // Use hash to determine if cell should be filled
      const shouldFill = (hash + i) % 3 !== 0;
      pattern.push(shouldFill);
    }
    
    return pattern;
  };

  const pattern = generatePattern(value);
  const gridSize = 8;

  return (
    <div 
      className={`inline-block bg-white border-2 border-slate-200 rounded-lg p-2 ${className}`}
      style={{ width: size + 16, height: size + 16 }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        className="block"
      >
        {/* Background */}
        <rect width={gridSize} height={gridSize} fill="white" />
        
        {/* Corner markers */}
        <rect x="0" y="0" width="3" height="3" fill="black" />
        <rect x="0.5" y="0.5" width="2" height="2" fill="white" />
        <rect x="1" y="1" width="1" height="1" fill="black" />
        
        <rect x={gridSize - 3} y="0" width="3" height="3" fill="black" />
        <rect x={gridSize - 2.5} y="0.5" width="2" height="2" fill="white" />
        <rect x={gridSize - 2} y="1" width="1" height="1" fill="black" />
        
        <rect x="0" y={gridSize - 3} width="3" height="3" fill="black" />
        <rect x="0.5" y={gridSize - 2.5} width="2" height="2" fill="white" />
        <rect x="1" y={gridSize - 2} width="1" height="1" fill="black" />
        
        {/* Data pattern */}
        {pattern.map((filled, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          
          // Skip corner areas
          if ((x < 3 && y < 3) || 
              (x >= gridSize - 3 && y < 3) || 
              (x < 3 && y >= gridSize - 3)) {
            return null;
          }
          
          if (filled) {
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width="1"
                height="1"
                fill="black"
              />
            );
          }
          return null;
        })}
        
        {/* Center logo area */}
        <rect x="3" y="3" width="2" height="2" fill="black" />
        <rect x="3.25" y="3.25" width="1.5" height="1.5" fill="white" />
        <circle cx="4" cy="4" r="0.3" fill="black" />
      </svg>
      
      {/* QR Label */}
      <div className="text-center mt-1">
        <span className="text-xs font-semibold text-slate-600">QR CODE</span>
      </div>
    </div>
  );
};

export default QRCodeSimple;
