import React from 'react';
import Link from 'next/link';

const MetaNavigation = () => {
  return (
    <nav>
      <Link href='/login'>Login</Link>
      <Link href='/register' className='margin-left-2'>
        Register
      </Link>
    </nav>
  );
};

export default MetaNavigation;
