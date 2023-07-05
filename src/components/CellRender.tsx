import React from 'react';

export const renderTitle = (txt1: string, txt2: string) => (
  <div>
    {txt1}
    <br />
    {txt2}
  </div>
);

export const renderCell = (txt1: string | number, txt2: string | number) => (
  <>
    <div>{txt1}</div>
    <div style={{ color: '#f00' }}>{txt2}</div>
  </>
);
