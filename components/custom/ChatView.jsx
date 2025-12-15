'use client'
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation'
import React, { useContext } from 'react'
import { useState,useEffect } from 'react';
import { api } from '@/convex/_generated/api'
import Colors from '@/data/Colors'
import { MessageContext } from '@/context/MessageContext' 
import {UserDetailContext} from '@/context/UserDetailContext'
import Image from 'next/image'
import Lookup from '@/data/Lookup'
import { ArrowRight, Link } from 'lucide-react'
function ChatView() {
    const { id } = useParams();
    const convex = useConvex();
    const {userDetail,setUserDetail}=useContext(UserDetailContext)
    const {messages,setMessages}=useContext(MessageContext)
const [input, setUserInput]=useState()
    useEffect(() => {
        id && GetWorkspaceData();
    },[id])
    
    const GetWorkspaceData = async () => {
        const result = await convex.query(api.workspace.GetWorkspace, { workspaceId: id });
        console.log(result)
        setMessages(result?.messages)
    }
    return (
        <div className='relative h-[85vh] flex flex-col'>
            <div className="flex-1 overflow-y-scroll">
            {messages?.map((msg, index) => (
                <div className='p-3 rounded-lg mb-2 flex gap-2 items-start' key={index} style={{ backgroundColor: Colors.CHAT_BACKGROUND }}>
                    {msg?.role=='user' && <Image src={userDetail?.picture} alt='userImage' width={35} height={35} className="rounded-full"/>}
                    <h2>{msg.content}</h2></div>
            ))}
            </div>
              <div className="p-5 border rounded-xl max-w-2xl w-full mt-3">
            <div className='flex gap-2'>
                    <textarea className="outline-none bg-transperant w-full h-32 max-h-56 resize-none"
                        onChange={(event)=>setInput(event.target.value) }  placeholder={Lookup.INPUT_PLACEHOLDER} />
                    {input && <ArrowRight
                    onClick={()=>onGenerate(input)} className="bg-gray-500 p-2 h-8 w-8 rounded-md cursor-pointer " />}
                </div>
                <div >
                    <Link className="h-5 w-5"/>
                </div>
            </div>
        </div>
    )
}
export default ChatView