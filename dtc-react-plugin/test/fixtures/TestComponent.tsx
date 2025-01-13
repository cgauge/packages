import React from 'react'

export default function TestComponent({ greeting = 'React' }) {
  return (
    <>
      <div>Hello {greeting}</div>
      <div style={{display: 'none'}}>hidden</div>
    </>
  );
}