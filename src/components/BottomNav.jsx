import {Home,ReceiptText,Target,WalletCards,MoreHorizontal} from 'lucide-react';import {NavLink} from 'react-router-dom';
const links=[['/','Home',Home],['/transactions','Activity',ReceiptText],['/budgets','Budgets',WalletCards],['/goals','Goals',Target],['/settings','More',MoreHorizontal]];
export default function BottomNav(){return <nav className="bottom-nav">{links.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/' } className={({isActive})=>`bottom-item ${isActive?'active':''}`}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>}
