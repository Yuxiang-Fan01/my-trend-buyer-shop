import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '我的潮流买手店 · YOUR TASTE, YOUR SPACE', description: '一间装得下你所有热爱的潮流买手店。非官方概念演示，仅用于产品设计交流。' };
export default function Layout({children}:Readonly<{children:React.ReactNode}>) {return <html lang="zh-CN"><body>{children}</body></html>}
