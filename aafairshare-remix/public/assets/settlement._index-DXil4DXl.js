import{j as e,r as o,e as qe}from"./index-2nsPJFG6.js";import{T as Oe,a as ze,b as Ne,c as P,d as Ge,e as B,M as We}from"./table-CFytvCPd.js";import{C as Y,a as X,b as J,c as Z,B as z}from"./card-BFF1ddVi.js";import{f as W,b as w,c as ee,g as Ke,d as Qe}from"./utils-CluHQcII.js";import{S as G}from"./skeleton-QOWYLpsz.js";import{f as b,C as Ye}from"./index-BM3PG6z1.js";import{T as ye,D as Xe,a as Je,b as Ze,c as et,d as tt,V as st,e as at,f as rt}from"./dialog-CG_jP-1F.js";import{a as nt,e as ue,d as lt,h as ie}from"./index-CzhDxUmE.js";import{h as ot,f as it,u as dt,a as ct,_ as H,I as O,R as K,x as mt,b as Q,G as ut,p as ht,d as R,y as xt,g as ft}from"./AuthContext-_l9oMLlZ.js";import{M as pt}from"./MainLayout-CXfwlrdf.js";import{c as gt,X as vt}from"./x-DQaLQz3v.js";import"./components-BE_zLF6o.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jt=[["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5",key:"1osxxc"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M3 10h5",key:"r794hk"}],["path",{d:"M17.5 17.5 16 16.3V14",key:"akvzfd"}],["circle",{cx:"16",cy:"16",r:"6",key:"qoo3c4"}]],Nt=gt("calendar-clock",jt);function yt(s){const{settlements:a,users:d,isLoading:i=!1,onUnsettlement:r}=s,t=n=>{var u;const l=d.find(h=>h.id===n);return(l==null?void 0:l.username)||((u=l==null?void 0:l.email)==null?void 0:u.split("@")[0])||"User..."};return i?e.jsxs(Y,{className:"border-gray-200",children:[e.jsx(X,{children:e.jsx(J,{children:"Settlement History"})}),e.jsx(Z,{children:e.jsxs("div",{className:"space-y-4",children:[e.jsx(G,{className:"h-10 w-full"}),e.jsx(G,{className:"h-10 w-full"}),e.jsx(G,{className:"h-10 w-full"})]})})]}):a.length===0?e.jsxs(Y,{className:"border-gray-200",children:[e.jsx(X,{children:e.jsx(J,{children:"Settlement History"})}),e.jsx(Z,{children:e.jsx("div",{className:"p-4 text-center",children:e.jsx("p",{className:"text-gray-600",children:"No settlements recorded yet."})})})]}):e.jsxs(Y,{className:"border-gray-200",children:[e.jsx(X,{children:e.jsx(J,{children:"Settlement History"})}),e.jsxs(Z,{children:[e.jsx("div",{className:"space-y-4 sm:hidden",children:a.map(n=>e.jsx("div",{className:"bg-white p-4 rounded-lg border",children:e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500",children:"Date"}),e.jsx("p",{className:"text-sm font-medium",children:W(n.date)})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500",children:"Month"}),e.jsx("p",{className:"text-sm font-medium",children:w(n.month)})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500",children:"From"}),e.jsx("p",{className:"text-sm font-medium",children:t(n.fromUserId)})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500",children:"To"}),e.jsx("p",{className:"text-sm font-medium",children:t(n.toUserId)})]}),e.jsxs("div",{className:"col-span-2",children:[e.jsx("p",{className:"text-sm text-gray-500",children:"Amount"}),e.jsx("p",{className:"text-sm font-medium",children:b(Number(n.amount))})]}),r&&e.jsx("div",{className:"col-span-2 mt-2 flex justify-end",children:e.jsxs(z,{variant:"ghost",size:"sm",onClick:()=>r(n.id),className:"text-red-500 hover:text-red-700 hover:bg-red-50",children:[e.jsx(ye,{className:"h-4 w-4 mr-2"}),"Delete Settlement"]})})]})},n.id))}),e.jsx("div",{className:"hidden sm:block overflow-x-auto",children:e.jsxs(Oe,{children:[e.jsx(ze,{children:e.jsxs(Ne,{children:[e.jsx(P,{children:"Date"}),e.jsx(P,{children:"Month"}),e.jsx(P,{children:"From"}),e.jsx(P,{children:"To"}),e.jsx(P,{className:"text-right",children:"Amount"}),r&&e.jsx(P,{})]})}),e.jsx(Ge,{children:a.map(n=>e.jsxs(Ne,{children:[e.jsx(B,{className:"text-sm text-gray-600",children:W(n.date)}),e.jsx(B,{className:"text-sm text-gray-600",children:w(n.month)}),e.jsx(B,{className:"text-sm font-medium text-gray-800",children:t(n.fromUserId)}),e.jsx(B,{className:"text-sm font-medium text-gray-800",children:t(n.toUserId)}),e.jsx(B,{className:"text-sm font-medium text-gray-800 text-right",children:b(Number(n.amount))}),r&&e.jsx(B,{className:"text-right",children:e.jsxs(z,{variant:"ghost",size:"sm",onClick:()=>r(n.id),className:"text-red-500 hover:text-red-700 hover:bg-red-50",children:[e.jsx(ye,{className:"h-4 w-4 mr-2"}),"Delete"]})})]},n.id))})]})})]})]})}var he="Avatar",[bt,Ot]=nt(he),[St,we]=bt(he),Ee=o.forwardRef((s,a)=>{const{__scopeAvatar:d,...i}=s,[r,t]=o.useState("idle");return e.jsx(St,{scope:d,imageLoadingStatus:r,onImageLoadingStatusChange:t,children:e.jsx(ue.span,{...i,ref:a})})});Ee.displayName=he;var Ce="AvatarImage",Ae=o.forwardRef((s,a)=>{const{__scopeAvatar:d,src:i,onLoadingStatusChange:r=()=>{},...t}=s,n=we(Ce,d),l=wt(i,t),u=lt(h=>{r(h),n.onImageLoadingStatusChange(h)});return ie(()=>{l!=="idle"&&u(l)},[l,u]),l==="loaded"?e.jsx(ue.img,{...t,ref:a,src:i}):null});Ae.displayName=Ce;var De="AvatarFallback",Ie=o.forwardRef((s,a)=>{const{__scopeAvatar:d,delayMs:i,...r}=s,t=we(De,d),[n,l]=o.useState(i===void 0);return o.useEffect(()=>{if(i!==void 0){const u=window.setTimeout(()=>l(!0),i);return()=>window.clearTimeout(u)}},[i]),n&&t.imageLoadingStatus!=="loaded"?e.jsx(ue.span,{...r,ref:a}):null});Ie.displayName=De;function be(s,a){return s?a?(s.src!==a&&(s.src=a),s.complete&&s.naturalWidth>0?"loaded":"loading"):"error":"idle"}function wt(s,{referrerPolicy:a,crossOrigin:d}){const i=Ct(),r=o.useRef(null),t=i?(r.current||(r.current=new window.Image),r.current):null,[n,l]=o.useState(()=>be(t,s));return ie(()=>{l(be(t,s))},[t,s]),ie(()=>{const u=I=>()=>{l(I)};if(!t)return;const h=u("loaded"),N=u("error");return t.addEventListener("load",h),t.addEventListener("error",N),a&&(t.referrerPolicy=a),typeof d=="string"&&(t.crossOrigin=d),()=>{t.removeEventListener("load",h),t.removeEventListener("error",N)}},[t,d,a]),n}function Et(){return()=>{}}function Ct(){return o.useSyncExternalStore(Et,()=>!0,()=>!1)}var Ue=Ee,Me=Ae,Te=Ie;const de=o.forwardRef(({className:s,...a},d)=>e.jsx(Ue,{ref:d,className:ee("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",s),...a}));de.displayName=Ue.displayName;const ce=o.forwardRef(({className:s,...a},d)=>e.jsx(Me,{ref:d,className:ee("aspect-square h-full w-full",s),...a}));ce.displayName=Me.displayName;const me=o.forwardRef(({className:s,...a},d)=>e.jsx(Te,{ref:d,className:ee("flex h-full w-full items-center justify-center rounded-full bg-muted",s),...a}));me.displayName=Te.displayName;const oe=768;function At(){const[s,a]=o.useState(void 0);return o.useEffect(()=>{if(typeof window>"u")return;const d=window.matchMedia(`(max-width: ${oe-1}px)`),i=()=>{a(window.innerWidth<oe)};return d.addEventListener("change",i),a(window.innerWidth<oe),()=>d.removeEventListener("change",i)},[]),!!s}function Dt({open:s,onOpenChange:a,title:d,description:i,children:r,footer:t,className:n}){const l=d||"Dialog",u=i||`Information about ${l}`,h=`dialog-title-${l.replace(/\s+/g,"-").toLowerCase()}`,N=`dialog-desc-${l.replace(/\s+/g,"-").toLowerCase()}`;return e.jsx(Xe,{open:s,onOpenChange:a,children:e.jsxs(Je,{className:ee("sm:max-w-[600px]","w-[90vw] max-w-[90vw] rounded-lg",n),"aria-labelledby":h,"aria-describedby":N,children:[e.jsxs(Ze,{children:[e.jsx(et,{id:h,children:l}),i&&e.jsx(tt,{id:N,children:e.jsx(st,{children:u})})]}),e.jsx("div",{className:"py-4 max-h-[70vh] overflow-y-auto",children:r}),t&&e.jsx(at,{children:t})]})})}function Se(s,a,d){if(!s||!a||a.length!==2)return console.error("Invalid input for settlement calculation",{expenses:s,users:a}),null;const[i,r]=a;let t=0,n=0;const l={[i.id]:0,[r.id]:0};let u=0,h=0,N=0;s.forEach(y=>{const A=Number(y.amount)||0;t+=A,y.paidByUserId===i.id?l[i.id]+=A:y.paidByUserId===r.id&&(l[r.id]+=A);const _=y.splitType||"50/50";_==="50/50"?(n+=A,y.paidByUserId===i.id&&(u+=A)):_==="100%"&&(y.paidByUserId===i.id?h+=A:y.paidByUserId===r.id&&(N+=A))});const I=n/2,E=u-I+h-N;let C=0,D=null;return E<-.005?(C=Math.abs(E),D={fromUserId:i.id,toUserId:r.id}):E>.005?(C=E,D={fromUserId:r.id,toUserId:i.id}):(C=0,D=null),{month:d,totalExpenses:t,userExpenses:l,settlementAmount:C,settlementDirection:D}}const It={subject:"AAFairShare: Settlement Report for {{month}}",textBody:`
Hi there,

The settlement for {{month}} has been completed.

Summary:
- {{fromUserName}} Paid: {{fromUserTotalFormatted}}
- {{toUserName}} Paid: {{toUserTotalFormatted}}
- Total Expenses: {{totalExpensesFormatted}}
- Settlement Amount: {{fromUserName}} paid {{toUserName}} {{settlementAmountFormatted}}

The detailed expense report is attached in CSV and PDF formats.

Thanks,
AAFairShare Bot
  `.trim(),htmlBody:`
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; line-height: 1.6; color: #333; }
  .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; max-width: 600px; margin: 20px auto; }
  .header { font-size: 1.2em; font-weight: bold; color: #3b82f6; margin-bottom: 15px; }
  .summary-item { margin-bottom: 5px; }
  .footer { margin-top: 20px; font-size: 0.9em; color: #777; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">Settlement Report for {{month}}</div>
    <p>Hi there,</p>
    <p>The settlement for <strong>{{month}}</strong> has been completed.</p>
    <div class="summary">
      <div class="summary-item"><strong>{{fromUserName}} Paid:</strong> {{fromUserTotalFormatted}}</div>
      <div class="summary-item"><strong>{{toUserName}} Paid:</strong> {{toUserTotalFormatted}}</div>
      <div class="summary-item"><strong>Total Expenses:</strong> {{totalExpensesFormatted}}</div>
      <div class="summary-item"><strong>Settlement:</strong> {{fromUserName}} paid {{toUserName}} <strong>{{settlementAmountFormatted}}</strong></div>
    </div>
    <p>The detailed expense report is attached in CSV and PDF formats.</p>
    <div class="footer">
      Thanks,<br/>
      AAFairShare Bot
    </div>
  </div>
</body>
</html>
  `.trim()};async function Ut(s){var $,E,C,D;const{settlement:a,expenses:d,users:i,month:r}=s,t=i.find(x=>x.id===a.fromUserId),n=i.find(x=>x.id===a.toUserId);if(!t||!n)throw new Error("Could not find users involved in settlement");const l=d.filter(x=>x.paidByUserId===t.id).reduce((x,y)=>x+Number(y.amount),0),u=d.filter(x=>x.paidByUserId===n.id).reduce((x,y)=>x+Number(y.amount),0),h=l+u,N={settlement:{...a,date:W(a.date),amount:b(a.amount),month:w(r)},fromUser:{id:t.id,name:t.username||(($=t.email)==null?void 0:$.split("@")[0])||"Unknown User",email:t.email},toUser:{id:n.id,name:n.username||((E=n.email)==null?void 0:E.split("@")[0])||"Unknown User",email:n.email},expenses:d.map(x=>({...x,date:W(x.date instanceof Date?x.date:new Date(x.date)),amount:b(x.amount)})),month:w(r),templateData:{month:w(r),fromUserName:t.username||((C=t.email)==null?void 0:C.split("@")[0])||"Unknown User",toUserName:n.username||((D=n.email)==null?void 0:D.split("@")[0])||"Unknown User",fromUserTotalFormatted:b(l),toUserTotalFormatted:b(u),totalExpensesFormatted:b(h),settlementAmountFormatted:b(a.amount)},template:It};await ot(it,"sendSettlementEmail")(N)}const zt=()=>[{title:"Settlement - AAFairShare"},{name:"description",content:"Manage expense settlements between users"}];function Gt(){var ve,je;const[s,a]=o.useState(Ke()),[d,i]=o.useState(!1),{toast:r}=dt(),{currentUser:t,loading:n}=ct();At();const[l,u]=o.useState([]),[h,N]=o.useState(!0),[I,$]=o.useState([]),[E,C]=o.useState(!0),[D,x]=o.useState([]),[y,A]=o.useState(!0),[_,Le]=o.useState([]),[xe,te]=o.useState(!0),[fe,ke]=o.useState([]),[pe,se]=o.useState(!0),[Mt,ae]=o.useState(null),ge=qe();o.useEffect(()=>{!n&&!t&&ge("/login")},[t,n,ge]),o.useEffect(()=>{if(!t)return;N(!0);const c=H(R,"users"),v=O(c,m=>{const f=m.docs.map(S=>({id:S.id,...S.data()}));u(f),N(!1)},m=>{console.error("Error fetching users:",m),r({title:"Error",description:"Could not load users.",variant:"destructive"}),N(!1)});return()=>v()},[t,r]),o.useEffect(()=>{if(!t)return;C(!0);const c=H(R,"expenses"),v=K(c,Q("month","==",s),mt("date","desc")),m=O(v,f=>{const S=f.docs.map(k=>{var U;const j=k.data();return{id:k.id,...j,date:(U=j.date)!=null&&U.toDate?j.date.toDate():new Date}});$(S),C(!1)},f=>{console.error("Error fetching current month expenses:",f),r({title:"Error",description:"Could not load expenses.",variant:"destructive"}),C(!1)});return()=>m()},[s,t,r]),o.useEffect(()=>{if(!t)return;A(!0);const c=H(R,"settlements"),v=K(c,Q("month","==",s)),m=O(v,f=>{const S=f.docs.map(k=>{var U;const j=k.data();return{id:k.id,...j,date:(U=j.date)!=null&&U.toDate?j.date.toDate():new Date}});x(S),A(!1)},f=>{console.error("Error fetching settlements:",f),r({title:"Error",description:"Could not load settlements.",variant:"destructive"}),A(!1)});return()=>m()},[s,t,r]);const M=Qe(s);o.useEffect(()=>{if(!t||!M)return;se(!0);const c=H(R,"settlements"),v=K(c,Q("month","==",M)),m=O(v,j=>{const U=j.docs.map(V=>{var q;const F=V.data();return{id:V.id,...F,date:(q=F.date)!=null&&q.toDate?F.date.toDate():new Date}});ke(U),se(!1)},j=>{console.error("Error fetching previous month settlements:",j),se(!1)});te(!0);const f=H(R,"expenses"),S=K(f,Q("month","==",M)),k=O(S,j=>{const U=j.docs.map(V=>{var q;const F=V.data();return{id:V.id,...F,date:(q=F.date)!=null&&q.toDate?F.date.toDate():new Date}});Le(U),te(!1)},j=>{console.error("Error fetching previous month expenses:",j),te(!1)});return()=>{m(),k()}},[M,t,r]);const[T,re]=o.useState(0),[L,ne]=o.useState(null);o.useEffect(()=>{if(E||h||!t||l.length<2)return;const c=l.find(S=>S.id===t.uid),v=l.find(S=>S.id!==t.uid);if(!c||!v){console.error("Could not find both users. User1:",c,"User2:",v),ae(null),re(0),ne(null);return}const m=Se(I,[c,v],s);if(!m){ae(null),re(0),ne(null);return}const f={month:s,totalExpenses:m.totalExpenses,userExpenses:m.userExpenses};ae(f),re(m.settlementAmount),ne(m.settlementDirection)},[I,l,t,E,h,s]);const Fe=c=>{a(c)},Re=async()=>{if(!t||!L||T<=0){r({title:"Cannot Create Settlement",description:"Missing required information or no settlement needed.",variant:"destructive"});return}try{const c={amount:T,date:new Date,month:s,fromUserId:L.fromUserId,toUserId:L.toUserId,createdAt:ut(),createdBy:t.uid},m={id:(await ht(H(R,"settlements"),c)).id,...c};try{await Ut({settlement:m,expenses:I,users:l,month:s}),r({title:"Settlement Created",description:`Settlement of ${b(T)} recorded successfully. Email sent to both users.`})}catch(f){console.error("Error sending settlement email:",f),r({title:"Settlement Created",description:`Settlement of ${b(T)} recorded successfully, but there was an error sending the email.`})}i(!1)}catch(c){console.error("Error creating settlement:",c),r({title:"Error",description:"Failed to create settlement. Please try again.",variant:"destructive"})}},_e=async c=>{if(t)try{await xt(ft(R,"settlements",c)),r({title:"Settlement Deleted",description:"Settlement has been removed successfully."})}catch(v){console.error("Error deleting settlement:",v),r({title:"Error",description:"Failed to delete settlement. Please try again.",variant:"destructive"})}},Pe=T>0&&L!==null,Be=D.length>0,He=()=>L?l.find(c=>c.id===L.fromUserId):null,$e=()=>L?l.find(c=>c.id===L.toUserId):null,p=He(),g=$e(),[Ve,le]=o.useState(!1);return o.useEffect(()=>{if(xe||pe||l.length<2)return;if(_.length===0||fe.length>0){le(!1);return}const c=l.find(f=>f.id===(t==null?void 0:t.uid)),v=l.find(f=>f.id!==(t==null?void 0:t.uid));if(!c||!v){le(!1);return}const m=Se(_,[c,v],M);le(!!m&&m.settlementAmount>0&&m.settlementDirection!==null)},[_,fe,xe,pe,l,t,M]),n?e.jsx("div",{className:"flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900",children:e.jsxs("div",{className:"text-center space-y-4",children:[e.jsx("div",{className:"inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("h2",{className:"text-lg font-medium text-gray-900 dark:text-gray-100",children:"Loading..."})]})}):e.jsx(pt,{children:e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Settlement"}),e.jsx(We,{value:s,onChange:Fe})]}),Ve&&e.jsxs("div",{className:"bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3",children:[e.jsx("div",{className:"text-amber-500 mt-0.5",children:e.jsx(Nt,{className:"h-5 w-5"})}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"font-medium text-amber-800",children:"Previous Month Unsettled"}),e.jsxs("p",{className:"text-sm text-amber-700 mt-1",children:["There are unsettled expenses from ",w(M),".",e.jsx("button",{onClick:()=>a(M),className:"ml-1 text-amber-800 underline hover:text-amber-900",children:"View and settle"})]})]})]}),e.jsxs(Y,{className:"border-gray-200",children:[e.jsx(X,{children:e.jsx(J,{children:"Settlement Status"})}),e.jsx(Z,{children:E||h?e.jsxs("div",{className:"space-y-4",children:[e.jsx(G,{className:"h-8 w-full max-w-md"}),e.jsx(G,{className:"h-16 w-full"})]}):Be?e.jsxs("div",{className:"bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3",children:[e.jsx("div",{className:"text-green-500 mt-0.5",children:e.jsx(Ye,{className:"h-5 w-5"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium text-green-800",children:"All Settled!"}),e.jsxs("p",{className:"text-sm text-green-700 mt-1",children:["All expenses for ",w(s)," have been settled."]})]})]}):Pe?e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4",children:[e.jsx("h3",{className:"font-medium text-blue-800",children:"Settlement Needed"}),e.jsxs("p",{className:"text-sm text-blue-700 mt-1",children:["Based on the expenses for ",w(s),", a settlement is needed."]}),e.jsxs("div",{className:"mt-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs(de,{className:"h-10 w-10 border border-blue-200",children:[e.jsx(ce,{src:(p==null?void 0:p.photoURL)||"",alt:(p==null?void 0:p.username)||""}),e.jsx(me,{className:"bg-blue-100 text-blue-800",children:((ve=p==null?void 0:p.username)==null?void 0:ve.charAt(0))||"?"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-gray-900",children:p==null?void 0:p.username}),e.jsx("p",{className:"text-sm text-gray-500",children:"Owes"})]})]}),e.jsx("div",{className:"hidden sm:block text-gray-400",children:"→"}),e.jsx("div",{className:"block sm:hidden border-l-2 border-gray-200 h-6 ml-5"}),e.jsxs("div",{className:"flex items-center gap-3 ml-0 sm:ml-0",children:[e.jsxs(de,{className:"h-10 w-10 border border-blue-200",children:[e.jsx(ce,{src:(g==null?void 0:g.photoURL)||"",alt:(g==null?void 0:g.username)||""}),e.jsx(me,{className:"bg-blue-100 text-blue-800",children:((je=g==null?void 0:g.username)==null?void 0:je.charAt(0))||"?"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-gray-900",children:g==null?void 0:g.username}),e.jsx("p",{className:"text-sm text-gray-500",children:"Receives"})]})]}),e.jsx("div",{className:"ml-0 sm:ml-auto",children:e.jsx("div",{className:"text-lg font-bold text-blue-700",children:b(T)})})]})]}),e.jsx("div",{className:"flex justify-end",children:e.jsx(z,{onClick:()=>i(!0),className:"bg-blue-600 hover:bg-blue-700",children:"Record Settlement"})})]}):e.jsxs("div",{className:"bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3",children:[e.jsx("div",{className:"text-gray-400 mt-0.5",children:e.jsx(vt,{className:"h-5 w-5"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium text-gray-700",children:"No Settlement Needed"}),e.jsx("p",{className:"text-sm text-gray-600 mt-1",children:I.length===0?`No expenses recorded for ${w(s)}.`:`Expenses for ${w(s)} are already balanced.`})]})]})})]}),e.jsx(yt,{settlements:D,users:l,isLoading:y||h,onUnsettlement:_e}),e.jsx(Dt,{open:d,onOpenChange:i,title:"Confirm Settlement",description:"Review and confirm the settlement details",footer:e.jsxs(e.Fragment,{children:[e.jsx(rt,{asChild:!0,children:e.jsx(z,{variant:"outline",children:"Cancel"})}),e.jsx(z,{onClick:Re,children:"Confirm Settlement"})]}),children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("p",{className:"text-gray-700",children:["Please confirm that ",p==null?void 0:p.username," has paid ",g==null?void 0:g.username," the amount of ",b(T),"."]}),e.jsx("div",{className:"bg-gray-50 p-4 rounded-lg border border-gray-200",children:e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500",children:"From"}),e.jsx("p",{className:"font-medium",children:p==null?void 0:p.username})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500",children:"To"}),e.jsx("p",{className:"font-medium",children:g==null?void 0:g.username})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500",children:"Amount"}),e.jsx("p",{className:"font-medium",children:b(T)})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500",children:"Date"}),e.jsx("p",{className:"font-medium",children:W(new Date)})]}),e.jsxs("div",{className:"col-span-2",children:[e.jsx("p",{className:"text-sm text-gray-500",children:"Month"}),e.jsx("p",{className:"font-medium",children:w(s)})]})]})}),e.jsxs("p",{className:"text-sm text-gray-500",children:["This will record the settlement and mark all expenses for ",w(s)," as settled."]})]})})]})})}export{Gt as default,zt as meta};
