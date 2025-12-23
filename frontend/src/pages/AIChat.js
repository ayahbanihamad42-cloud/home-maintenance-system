import React, { useState } from 'react';
import { chatWithAI } from '../services/aiService';

const AIChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if(!input) return;

        // عرض رسالة المستخدم
        setMessages([...messages, { sender:'user', text:input }]);

        try {
            const res = await chatWithAI({ message: input });
            // عرض رد AI (ديكور أو إصلاح)
            setMessages(prev => [...prev, { sender:'AI', text: res.data.reply }]);
            setInput('');
        } catch(err){
            alert("Error sending message");
        }
    };

    const handleKeyPress = e => { if(e.key==='Enter') handleSend(); }

    return (
        <div style={{ maxWidth:'500px', margin:'auto', padding:'10px', border:'1px solid #ccc', borderRadius:'5px' }}>
            <h3>Chat with AI (Decor & Repair Suggestions)</h3>
            <div style={{ height:'300px', overflowY:'scroll', border:'1px solid #eee', padding:'5px', marginBottom:'10px' }}>
                {messages.map((m,i)=>(
                    <div key={i} style={{ textAlign: m.sender==='user'?'right':'left', margin:'5px 0' }}>
                        <b>{m.sender}:</b> {m.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={{ width:'80%', padding:'5px' }}
            />
            <button onClick={handleSend} style={{ width:'18%', padding:'5px', marginLeft:'2%' }}>Send</button>
        </div>
    );
};

export default AIChat;
