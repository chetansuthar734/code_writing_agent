import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const CodeUI = (props) => {
  const [copied, setCopied] = useState(false);

  const textToCopy = "python and js code here : npm install react";

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => console.error('Failed to copy:', err));
  };

  // Inline styles
  const styles = {
   wrapper: {
     
  position: 'relative',
  width: '90%',          // ✅ wider than message bubbles (which are 75%)
  maxWidth: '500px',    // ✅ optional
  margin: '20px 0',
//   border: '20px solid black ',
  fontFamily: 'monospace',
  borderRadius: '18px',
  alignSelf: 'flex-start', // ✅ this aligns it to the start of the cross-axis
},


    container: {
       maxWidth:'100%',
      backgroundColor: '#0f0d0da4',  // dark gray background
      color: '#00ff90',            // green text
      padding: '20px',
      whiteSpace: 'pre-wrap',
      fontSize: '16px',
    //   border: '1px solid #444',
      borderRadius:'14px'
    },


    button: {
      position: 'absolute',
      top: '-10px',
      right: '-10px',
      padding: '8px 14px',
      backgroundColor: '#007BFF',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    },
   
  };

  return (
    <div style={styles.wrapper}>


      <button style={styles.button} onClick={handleCopy}>{copied?"copied":"copy"}</button>
      <div style={styles.container}>
       <ReactMarkdown>{props.code}</ReactMarkdown>
      </div>
      {/* {copied && <div style={styles.copiedMessage}>Copied!</div>} */}
    </div>
  );
};

export default CodeUI;
