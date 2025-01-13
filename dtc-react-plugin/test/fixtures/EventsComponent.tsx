import React, {useState} from 'react'

export default function EventsComponent() {
  const [toggle, setToggle] = useState(false)
  const [text, setText] = useState('toBeChanged')

  return (
    <>
      <input type='text' onInput={(e) => setText(e.target.value)} />
      <div style={toggle ? {display: 'none'} : {}}>{text}</div>
      <div style={toggle ? {} : {display: 'none'}}>two</div>
      <button onClick={() => setToggle(!toggle)}></button>
    </>
  )
}
