import React,{ useEffect,useState } from 'react';
import { getChatByRequest, sendMessage } from '../services/chatService';

const Chat = ({ request_id,userRole }) => {
    const [messages,setMessages] = useState([]);
    const [msg,setMsg] = useState('');

    const fetchMessages = async ()=>{
        const res = await getChatByRequest(request_id);
        setMessages(res.data);
    }

    useEffect(()=>{ fetchMessages(); },[request_id]);

    const handleSend = async ()=>{
        await sendMessage({ request_id, sender:userRole, message:msg });
        setMsg('');
        fetchMessages();
    }

    return (
        <div>
            <div>
                {messages.map(m=>(
                    <div key={m.id}><b>{m.sender}:</b> {m.message}</div>
                ))}
            </div>
            <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Type a message"/>
            <button onClick={handleSend}>Send</button>
        </div>
    );
}

export default Chat;
