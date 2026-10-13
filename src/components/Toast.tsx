'use client';
import {useEffect,useRef} from 'react';
import {Check} from 'lucide-react';
export default function Toast({message}:{message:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const node=ref.current;if(node&&typeof node.showPopover==='function')node.showPopover();return()=>{if(node&&typeof node.hidePopover==='function')node.hidePopover()}},[message]);
 return <div ref={ref} popover="manual" className="toast" role="status" aria-live="polite"><Check size={18}/>{message}</div>;
}
