"use client";

// npm install @langchain/langgraph-sdk @langchain/core
// npm install react-markdown

import { useStream } from "@langchain/langgraph-sdk/react";
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from "react";
import "./App.css";
import CodeUI from "./component/code_ui"; 
// import { BarLoader } from 'react-css-loaders';

{/* <ReactMarkdown>{report}</ReactMarkdown> */}


export default function App() {

    const [clicked, setClicked] = useState(false);
   const [neterror,setNeterror] = useState(false)
  const [partialResponse ,setPartialResponse] =useState("")
    const [finalMessages, setFinalMessages] = useState([]);
    const [user,setUser] = useState("")
//   useEffect(() => {
// console.log(partialResponse)
// }, [partialResponse]);

//  console.log('refreshed')
  const thread = useStream({
    // apiUrl: "http://127.0.0.1:8989", 
    apiUrl: "http://127.0.0.1:2026",
    assistantId: "agent",
    messagesKey: "messages",
    onFinish:(finalevent)=>{

      // setFinalMessages(thread.messages); 
      setUser("")
      console.log(finalevent.values.messages)
      setFinalMessages(finalevent.values.messages); 
      ; // clear partial
      },
    onError:()=>{setPartialResponse("")},
    // onStop:()=>{ setPartialResponse("")}, 
    onCustomEvent: (event, options) => {
       setPartialResponse(event)
      },  //for custom data stream by get_stream_writer
    //  onSubmit:()=>{setNeterror(false) }
     
    
    // onCustomEvent: for custom event handler
    
  });

// useEffect(()=>{thread.events.forEach(element => {
  
// });((e)=>{console.log(e)})})

  return (<div className="layout">
         {/* <BarLoader /> */}
          <div className="user-query">

  <div style={{ textAlign: "center" ,marginBottom:'10px',color:'white' }}>
    User Query
  </div>





{/* when query in history click scrollToViewElement() chat-container element*/}
  <div className="messages">
    {finalMessages
       .slice()
       .reverse()
      .filter((msg) => msg.type === "human" && msg.content.trim() !=='') // only user messages
      .map((msg) => (
        <div key={msg.id}  onClick={()=>{console.log(msg.content); setClicked(!clicked);const  e =document.getElementById(msg.id); e.scrollIntoView({behavior:'smooth',block:'center'})  }} className="user-bubble">
          {msg.content}
        </div>
      ))}
  </div>
</div>











    <div className="chat-container">

 <div className="messages">

        {/* {thread.messages.map((msg) => ( */}
        {/* <CodeUI code='python and javaScript code here' /> */}
        {finalMessages.map((msg) => ( 

          
          <div
          key={msg.id}
          id={msg.id}
          className={`message ${msg.type==="human"? "user": "bot"}`}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown> 
          </div>



        ))}


        {/* //user message temp. until receive final state  */}
        {user && ( <div className="message user">
            <ReactMarkdown>{user}</ReactMarkdown>
          </div>)}
         
         {/* <CodeUI code="this is python code generate by gemini-1.5-flash "/> */}
       {/* {neterror && <div style={{color:'red'}}>error network issue</div>} */}



        {/* Live-streaming partial output */}
        {partialResponse && (
          <div className="message bot">

            <ReactMarkdown>{partialResponse}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        className="input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target;
          const message = new FormData(form).get("message");
          form.reset();
          setUser(message)



  thread.submit({
          //  task:message,
          //  revision_numer:1,
          //  max_revisions:2,
          messages:[message]

          },
          {streamMode:["custom"]});

  }}
      >
       <label  for='file' style={{margin:"10px"}}>➕
        </label>
         <input type="file" id="file" className="file_upload" />

        {/* Input */}
        <input
          type="text"
          name="message"
          placeholder="Ask a question..."
          autoComplete="off"
        />

        {/* Send/Stop Button */}
        {thread.isLoading ? (
          <button type="button" onClick={() => {thread.stop() ; setPartialResponse("") }}>
            Stop
          </button>
        ) : (
          <button type="submit">Send</button>
        )}
      </form>
    </div>
     </div>
  );
}