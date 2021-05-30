import React from 'react';

import logo from '../../logo.svg';
import clsx from 'clsx';

export interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={clsx('logo', className)}>
      <img src={logo} alt="Instaglitch" /> Instaglitch{' '}
      <div className="badge">BETA</div>
    </div>
  );
};
