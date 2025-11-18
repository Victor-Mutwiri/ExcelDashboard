import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img 
      src="https://ik.imagekit.io/janjez/ExcelDash/Favicon%20(2).png" 
      alt="SheetSight Logo" 
      className={className} 
      width="45"
      height="45"
    />
  );
};

export default Logo;
