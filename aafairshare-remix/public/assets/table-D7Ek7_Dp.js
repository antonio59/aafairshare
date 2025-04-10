import{r as a,j as o}from"./index-2nsPJFG6.js";import{u as Sn,k as Re,v as Pn,I as Tn,w as An,x as kn,F as On,R as Ln,j as Me,B as Y}from"./dialog-BYXhr3nu.js";import{a as Ne,d as je,c as Fn,P as q,g as Gn,f as G,b as x,e as P,h as Kn,r as $n,D as Un,s as De,u as Bn,j as g,m as zn,o as Hn,t as Vn}from"./utils-DMxJPV5D.js";import{c as Ee,R as Yn,A as Xn,a as Wn,b as qn,d as Ie,C as Zn,e as Jn}from"./index-C6EXf-SH.js";import{c as ae}from"./x-DQaLQz3v.js";import{u as Qn}from"./AuthContext-BZOWtFPy.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],nt=ae("circle",et);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],ot=ae("download",tt);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rt=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],be=ae("file-text",rt);var oe=["Enter"," "],at=["ArrowDown","PageUp","Home"],Se=["ArrowUp","PageDown","End"],st=[...at,...Se],ct={ltr:[...oe,"ArrowRight"],rtl:[...oe,"ArrowLeft"]},it={ltr:["ArrowLeft"],rtl:["ArrowRight"]},K="Menu",[L,dt,ut]=Fn(K),[j,Pe]=Ne(K,[ut,Ee,Re]),Z=Ee(),Te=Re(),[lt,D]=j(K),[pt,$]=j(K),Ae=e=>{const{__scopeMenu:t,open:n=!1,children:r,dir:s,onOpenChange:c,modal:d=!0}=e,l=Z(t),[m,h]=a.useState(null),p=a.useRef(!1),i=je(c),f=Sn(s);return a.useEffect(()=>{const w=()=>{p.current=!0,document.addEventListener("pointerdown",v,{capture:!0,once:!0}),document.addEventListener("pointermove",v,{capture:!0,once:!0})},v=()=>p.current=!1;return document.addEventListener("keydown",w,{capture:!0}),()=>{document.removeEventListener("keydown",w,{capture:!0}),document.removeEventListener("pointerdown",v,{capture:!0}),document.removeEventListener("pointermove",v,{capture:!0})}},[]),o.jsx(Yn,{...l,children:o.jsx(lt,{scope:t,open:n,onOpenChange:i,content:m,onContentChange:h,children:o.jsx(pt,{scope:t,onClose:a.useCallback(()=>i(!1),[i]),isUsingKeyboardRef:p,dir:f,modal:d,children:r})})})};Ae.displayName=K;var ft="MenuAnchor",se=a.forwardRef((e,t)=>{const{__scopeMenu:n,...r}=e,s=Z(n);return o.jsx(Xn,{...s,...r,ref:t})});se.displayName=ft;var ce="MenuPortal",[mt,ke]=j(ce,{forceMount:void 0}),Oe=e=>{const{__scopeMenu:t,forceMount:n,children:r,container:s}=e,c=D(ce,t);return o.jsx(mt,{scope:t,forceMount:n,children:o.jsx(q,{present:n||c.open,children:o.jsx(Gn,{asChild:!0,container:s,children:r})})})};Oe.displayName=ce;var y="MenuContent",[ht,ie]=j(y),Le=a.forwardRef((e,t)=>{const n=ke(y,e.__scopeMenu),{forceMount:r=n.forceMount,...s}=e,c=D(y,e.__scopeMenu),d=$(y,e.__scopeMenu);return o.jsx(L.Provider,{scope:e.__scopeMenu,children:o.jsx(q,{present:r||c.open,children:o.jsx(L.Slot,{scope:e.__scopeMenu,children:d.modal?o.jsx(xt,{...s,ref:t}):o.jsx(vt,{...s,ref:t})})})})}),xt=a.forwardRef((e,t)=>{const n=D(y,e.__scopeMenu),r=a.useRef(null),s=G(t,r);return a.useEffect(()=>{const c=r.current;if(c)return Pn(c)},[]),o.jsx(de,{...e,ref:s,trapFocus:n.open,disableOutsidePointerEvents:n.open,disableOutsideScroll:!0,onFocusOutside:x(e.onFocusOutside,c=>c.preventDefault(),{checkForDefaultPrevented:!1}),onDismiss:()=>n.onOpenChange(!1)})}),vt=a.forwardRef((e,t)=>{const n=D(y,e.__scopeMenu);return o.jsx(de,{...e,ref:t,trapFocus:!1,disableOutsidePointerEvents:!1,disableOutsideScroll:!1,onDismiss:()=>n.onOpenChange(!1)})}),wt=$n("MenuContent.ScrollLock"),de=a.forwardRef((e,t)=>{const{__scopeMenu:n,loop:r=!1,trapFocus:s,onOpenAutoFocus:c,onCloseAutoFocus:d,disableOutsidePointerEvents:l,onEntryFocus:m,onEscapeKeyDown:h,onPointerDownOutside:p,onFocusOutside:i,onInteractOutside:f,onDismiss:w,disableOutsideScroll:v,...N}=e,E=D(y,n),T=$(y,n),U=Z(n),B=Te(n),me=dt(n),[Rn,he]=a.useState(null),z=a.useRef(null),Nn=G(t,z,E.onContentChange),H=a.useRef(0),V=a.useRef(""),jn=a.useRef(0),Q=a.useRef(null),xe=a.useRef("right"),ee=a.useRef(0),Dn=v?kn:a.Fragment,En=v?{as:wt,allowPinchZoom:!0}:void 0,In=u=>{var S,we;const b=V.current+u,C=me().filter(_=>!_.disabled),R=document.activeElement,ne=(S=C.find(_=>_.ref.current===R))==null?void 0:S.textValue,te=C.map(_=>_.textValue),ve=It(te,b,ne),A=(we=C.find(_=>_.textValue===ve))==null?void 0:we.ref.current;(function _(ge){V.current=ge,window.clearTimeout(H.current),ge!==""&&(H.current=window.setTimeout(()=>_(""),1e3))})(b),A&&setTimeout(()=>A.focus())};a.useEffect(()=>()=>window.clearTimeout(H.current),[]),An();const I=a.useCallback(u=>{var C,R;return xe.current===((C=Q.current)==null?void 0:C.side)&&Pt(u,(R=Q.current)==null?void 0:R.area)},[]);return o.jsx(ht,{scope:n,searchRef:V,onItemEnter:a.useCallback(u=>{I(u)&&u.preventDefault()},[I]),onItemLeave:a.useCallback(u=>{var b;I(u)||((b=z.current)==null||b.focus(),he(null))},[I]),onTriggerLeave:a.useCallback(u=>{I(u)&&u.preventDefault()},[I]),pointerGraceTimerRef:jn,onPointerGraceIntentChange:a.useCallback(u=>{Q.current=u},[]),children:o.jsx(Dn,{...En,children:o.jsx(On,{asChild:!0,trapped:s,onMountAutoFocus:x(c,u=>{var b;u.preventDefault(),(b=z.current)==null||b.focus({preventScroll:!0})}),onUnmountAutoFocus:d,children:o.jsx(Un,{asChild:!0,disableOutsidePointerEvents:l,onEscapeKeyDown:h,onPointerDownOutside:p,onFocusOutside:i,onInteractOutside:f,onDismiss:w,children:o.jsx(Ln,{asChild:!0,...B,dir:T.dir,orientation:"vertical",loop:r,currentTabStopId:Rn,onCurrentTabStopIdChange:he,onEntryFocus:x(m,u=>{T.isUsingKeyboardRef.current||u.preventDefault()}),preventScrollOnEntryFocus:!0,children:o.jsx(Wn,{role:"menu","aria-orientation":"vertical","data-state":Qe(E.open),"data-radix-menu-content":"",dir:T.dir,...U,...N,ref:Nn,style:{outline:"none",...N.style},onKeyDown:x(N.onKeyDown,u=>{const C=u.target.closest("[data-radix-menu-content]")===u.currentTarget,R=u.ctrlKey||u.altKey||u.metaKey,ne=u.key.length===1;C&&(u.key==="Tab"&&u.preventDefault(),!R&&ne&&In(u.key));const te=z.current;if(u.target!==te||!st.includes(u.key))return;u.preventDefault();const A=me().filter(S=>!S.disabled).map(S=>S.ref.current);Se.includes(u.key)&&A.reverse(),Dt(A)}),onBlur:x(e.onBlur,u=>{u.currentTarget.contains(u.target)||(window.clearTimeout(H.current),V.current="")}),onPointerMove:x(e.onPointerMove,F(u=>{const b=u.target,C=ee.current!==u.clientX;if(u.currentTarget.contains(b)&&C){const R=u.clientX>ee.current?"right":"left";xe.current=R,ee.current=u.clientX}}))})})})})})})});Le.displayName=y;var gt="MenuGroup",ue=a.forwardRef((e,t)=>{const{__scopeMenu:n,...r}=e;return o.jsx(P.div,{role:"group",...r,ref:t})});ue.displayName=gt;var Mt="MenuLabel",Fe=a.forwardRef((e,t)=>{const{__scopeMenu:n,...r}=e;return o.jsx(P.div,{...r,ref:t})});Fe.displayName=Mt;var X="MenuItem",ye="menu.itemSelect",J=a.forwardRef((e,t)=>{const{disabled:n=!1,onSelect:r,...s}=e,c=a.useRef(null),d=$(X,e.__scopeMenu),l=ie(X,e.__scopeMenu),m=G(t,c),h=a.useRef(!1),p=()=>{const i=c.current;if(!n&&i){const f=new CustomEvent(ye,{bubbles:!0,cancelable:!0});i.addEventListener(ye,w=>r==null?void 0:r(w),{once:!0}),Kn(i,f),f.defaultPrevented?h.current=!1:d.onClose()}};return o.jsx(Ge,{...s,ref:m,disabled:n,onClick:x(e.onClick,p),onPointerDown:i=>{var f;(f=e.onPointerDown)==null||f.call(e,i),h.current=!0},onPointerUp:x(e.onPointerUp,i=>{var f;h.current||(f=i.currentTarget)==null||f.click()}),onKeyDown:x(e.onKeyDown,i=>{const f=l.searchRef.current!=="";n||f&&i.key===" "||oe.includes(i.key)&&(i.currentTarget.click(),i.preventDefault())})})});J.displayName=X;var Ge=a.forwardRef((e,t)=>{const{__scopeMenu:n,disabled:r=!1,textValue:s,...c}=e,d=ie(X,n),l=Te(n),m=a.useRef(null),h=G(t,m),[p,i]=a.useState(!1),[f,w]=a.useState("");return a.useEffect(()=>{const v=m.current;v&&w((v.textContent??"").trim())},[c.children]),o.jsx(L.ItemSlot,{scope:n,disabled:r,textValue:s??f,children:o.jsx(Tn,{asChild:!0,...l,focusable:!r,children:o.jsx(P.div,{role:"menuitem","data-highlighted":p?"":void 0,"aria-disabled":r||void 0,"data-disabled":r?"":void 0,...c,ref:h,onPointerMove:x(e.onPointerMove,F(v=>{r?d.onItemLeave(v):(d.onItemEnter(v),v.defaultPrevented||v.currentTarget.focus({preventScroll:!0}))})),onPointerLeave:x(e.onPointerLeave,F(v=>d.onItemLeave(v))),onFocus:x(e.onFocus,()=>i(!0)),onBlur:x(e.onBlur,()=>i(!1))})})})}),bt="MenuCheckboxItem",Ke=a.forwardRef((e,t)=>{const{checked:n=!1,onCheckedChange:r,...s}=e;return o.jsx(He,{scope:e.__scopeMenu,checked:n,children:o.jsx(J,{role:"menuitemcheckbox","aria-checked":W(n)?"mixed":n,...s,ref:t,"data-state":pe(n),onSelect:x(s.onSelect,()=>r==null?void 0:r(W(n)?!0:!n),{checkForDefaultPrevented:!1})})})});Ke.displayName=bt;var $e="MenuRadioGroup",[yt,Ct]=j($e,{value:void 0,onValueChange:()=>{}}),Ue=a.forwardRef((e,t)=>{const{value:n,onValueChange:r,...s}=e,c=je(r);return o.jsx(yt,{scope:e.__scopeMenu,value:n,onValueChange:c,children:o.jsx(ue,{...s,ref:t})})});Ue.displayName=$e;var Be="MenuRadioItem",ze=a.forwardRef((e,t)=>{const{value:n,...r}=e,s=Ct(Be,e.__scopeMenu),c=n===s.value;return o.jsx(He,{scope:e.__scopeMenu,checked:c,children:o.jsx(J,{role:"menuitemradio","aria-checked":c,...r,ref:t,"data-state":pe(c),onSelect:x(r.onSelect,()=>{var d;return(d=s.onValueChange)==null?void 0:d.call(s,n)},{checkForDefaultPrevented:!1})})})});ze.displayName=Be;var le="MenuItemIndicator",[He,_t]=j(le,{checked:!1}),Ve=a.forwardRef((e,t)=>{const{__scopeMenu:n,forceMount:r,...s}=e,c=_t(le,n);return o.jsx(q,{present:r||W(c.checked)||c.checked===!0,children:o.jsx(P.span,{...s,ref:t,"data-state":pe(c.checked)})})});Ve.displayName=le;var Rt="MenuSeparator",Ye=a.forwardRef((e,t)=>{const{__scopeMenu:n,...r}=e;return o.jsx(P.div,{role:"separator","aria-orientation":"horizontal",...r,ref:t})});Ye.displayName=Rt;var Nt="MenuArrow",Xe=a.forwardRef((e,t)=>{const{__scopeMenu:n,...r}=e,s=Z(n);return o.jsx(qn,{...s,...r,ref:t})});Xe.displayName=Nt;var jt="MenuSub",[ko,We]=j(jt),k="MenuSubTrigger",qe=a.forwardRef((e,t)=>{const n=D(k,e.__scopeMenu),r=$(k,e.__scopeMenu),s=We(k,e.__scopeMenu),c=ie(k,e.__scopeMenu),d=a.useRef(null),{pointerGraceTimerRef:l,onPointerGraceIntentChange:m}=c,h={__scopeMenu:e.__scopeMenu},p=a.useCallback(()=>{d.current&&window.clearTimeout(d.current),d.current=null},[]);return a.useEffect(()=>p,[p]),a.useEffect(()=>{const i=l.current;return()=>{window.clearTimeout(i),m(null)}},[l,m]),o.jsx(se,{asChild:!0,...h,children:o.jsx(Ge,{id:s.triggerId,"aria-haspopup":"menu","aria-expanded":n.open,"aria-controls":s.contentId,"data-state":Qe(n.open),...e,ref:De(t,s.onTriggerChange),onClick:i=>{var f;(f=e.onClick)==null||f.call(e,i),!(e.disabled||i.defaultPrevented)&&(i.currentTarget.focus(),n.open||n.onOpenChange(!0))},onPointerMove:x(e.onPointerMove,F(i=>{c.onItemEnter(i),!i.defaultPrevented&&!e.disabled&&!n.open&&!d.current&&(c.onPointerGraceIntentChange(null),d.current=window.setTimeout(()=>{n.onOpenChange(!0),p()},100))})),onPointerLeave:x(e.onPointerLeave,F(i=>{var w,v;p();const f=(w=n.content)==null?void 0:w.getBoundingClientRect();if(f){const N=(v=n.content)==null?void 0:v.dataset.side,E=N==="right",T=E?-5:5,U=f[E?"left":"right"],B=f[E?"right":"left"];c.onPointerGraceIntentChange({area:[{x:i.clientX+T,y:i.clientY},{x:U,y:f.top},{x:B,y:f.top},{x:B,y:f.bottom},{x:U,y:f.bottom}],side:N}),window.clearTimeout(l.current),l.current=window.setTimeout(()=>c.onPointerGraceIntentChange(null),300)}else{if(c.onTriggerLeave(i),i.defaultPrevented)return;c.onPointerGraceIntentChange(null)}})),onKeyDown:x(e.onKeyDown,i=>{var w;const f=c.searchRef.current!=="";e.disabled||f&&i.key===" "||ct[r.dir].includes(i.key)&&(n.onOpenChange(!0),(w=n.content)==null||w.focus(),i.preventDefault())})})})});qe.displayName=k;var Ze="MenuSubContent",Je=a.forwardRef((e,t)=>{const n=ke(y,e.__scopeMenu),{forceMount:r=n.forceMount,...s}=e,c=D(y,e.__scopeMenu),d=$(y,e.__scopeMenu),l=We(Ze,e.__scopeMenu),m=a.useRef(null),h=G(t,m);return o.jsx(L.Provider,{scope:e.__scopeMenu,children:o.jsx(q,{present:r||c.open,children:o.jsx(L.Slot,{scope:e.__scopeMenu,children:o.jsx(de,{id:l.contentId,"aria-labelledby":l.triggerId,...s,ref:h,align:"start",side:d.dir==="rtl"?"left":"right",disableOutsidePointerEvents:!1,disableOutsideScroll:!1,trapFocus:!1,onOpenAutoFocus:p=>{var i;d.isUsingKeyboardRef.current&&((i=m.current)==null||i.focus()),p.preventDefault()},onCloseAutoFocus:p=>p.preventDefault(),onFocusOutside:x(e.onFocusOutside,p=>{p.target!==l.trigger&&c.onOpenChange(!1)}),onEscapeKeyDown:x(e.onEscapeKeyDown,p=>{d.onClose(),p.preventDefault()}),onKeyDown:x(e.onKeyDown,p=>{var w;const i=p.currentTarget.contains(p.target),f=it[d.dir].includes(p.key);i&&f&&(c.onOpenChange(!1),(w=l.trigger)==null||w.focus(),p.preventDefault())})})})})})});Je.displayName=Ze;function Qe(e){return e?"open":"closed"}function W(e){return e==="indeterminate"}function pe(e){return W(e)?"indeterminate":e?"checked":"unchecked"}function Dt(e){const t=document.activeElement;for(const n of e)if(n===t||(n.focus(),document.activeElement!==t))return}function Et(e,t){return e.map((n,r)=>e[(t+r)%e.length])}function It(e,t,n){const s=t.length>1&&Array.from(t).every(h=>h===t[0])?t[0]:t,c=n?e.indexOf(n):-1;let d=Et(e,Math.max(c,0));s.length===1&&(d=d.filter(h=>h!==n));const m=d.find(h=>h.toLowerCase().startsWith(s.toLowerCase()));return m!==n?m:void 0}function St(e,t){const{x:n,y:r}=e;let s=!1;for(let c=0,d=t.length-1;c<t.length;d=c++){const l=t[c].x,m=t[c].y,h=t[d].x,p=t[d].y;m>r!=p>r&&n<(h-l)*(r-m)/(p-m)+l&&(s=!s)}return s}function Pt(e,t){if(!t)return!1;const n={x:e.clientX,y:e.clientY};return St(n,t)}function F(e){return t=>t.pointerType==="mouse"?e(t):void 0}var Tt=Ae,At=se,kt=Oe,Ot=Le,Lt=ue,Ft=Fe,Gt=J,Kt=Ke,$t=Ue,Ut=ze,Bt=Ve,zt=Ye,Ht=Xe,Vt=qe,Yt=Je,fe="DropdownMenu",[Xt,Oo]=Ne(fe,[Pe]),M=Pe(),[Wt,en]=Xt(fe),nn=e=>{const{__scopeDropdownMenu:t,children:n,dir:r,open:s,defaultOpen:c,onOpenChange:d,modal:l=!0}=e,m=M(t),h=a.useRef(null),[p=!1,i]=Bn({prop:s,defaultProp:c,onChange:d});return o.jsx(Wt,{scope:t,triggerId:Me(),triggerRef:h,contentId:Me(),open:p,onOpenChange:i,onOpenToggle:a.useCallback(()=>i(f=>!f),[i]),modal:l,children:o.jsx(Tt,{...m,open:p,onOpenChange:i,dir:r,modal:l,children:n})})};nn.displayName=fe;var tn="DropdownMenuTrigger",on=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,disabled:r=!1,...s}=e,c=en(tn,n),d=M(n);return o.jsx(At,{asChild:!0,...d,children:o.jsx(P.button,{type:"button",id:c.triggerId,"aria-haspopup":"menu","aria-expanded":c.open,"aria-controls":c.open?c.contentId:void 0,"data-state":c.open?"open":"closed","data-disabled":r?"":void 0,disabled:r,...s,ref:De(t,c.triggerRef),onPointerDown:x(e.onPointerDown,l=>{!r&&l.button===0&&l.ctrlKey===!1&&(c.onOpenToggle(),c.open||l.preventDefault())}),onKeyDown:x(e.onKeyDown,l=>{r||(["Enter"," "].includes(l.key)&&c.onOpenToggle(),l.key==="ArrowDown"&&c.onOpenChange(!0),["Enter"," ","ArrowDown"].includes(l.key)&&l.preventDefault())})})})});on.displayName=tn;var qt="DropdownMenuPortal",rn=e=>{const{__scopeDropdownMenu:t,...n}=e,r=M(t);return o.jsx(kt,{...r,...n})};rn.displayName=qt;var an="DropdownMenuContent",sn=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=en(an,n),c=M(n),d=a.useRef(!1);return o.jsx(Ot,{id:s.contentId,"aria-labelledby":s.triggerId,...c,...r,ref:t,onCloseAutoFocus:x(e.onCloseAutoFocus,l=>{var m;d.current||(m=s.triggerRef.current)==null||m.focus(),d.current=!1,l.preventDefault()}),onInteractOutside:x(e.onInteractOutside,l=>{const m=l.detail.originalEvent,h=m.button===0&&m.ctrlKey===!0,p=m.button===2||h;(!s.modal||p)&&(d.current=!0)}),style:{...e.style,"--radix-dropdown-menu-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-dropdown-menu-content-available-width":"var(--radix-popper-available-width)","--radix-dropdown-menu-content-available-height":"var(--radix-popper-available-height)","--radix-dropdown-menu-trigger-width":"var(--radix-popper-anchor-width)","--radix-dropdown-menu-trigger-height":"var(--radix-popper-anchor-height)"}})});sn.displayName=an;var Zt="DropdownMenuGroup",Jt=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx(Lt,{...s,...r,ref:t})});Jt.displayName=Zt;var Qt="DropdownMenuLabel",cn=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx(Ft,{...s,...r,ref:t})});cn.displayName=Qt;var eo="DropdownMenuItem",dn=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx(Gt,{...s,...r,ref:t})});dn.displayName=eo;var no="DropdownMenuCheckboxItem",un=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx(Kt,{...s,...r,ref:t})});un.displayName=no;var to="DropdownMenuRadioGroup",oo=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx($t,{...s,...r,ref:t})});oo.displayName=to;var ro="DropdownMenuRadioItem",ln=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx(Ut,{...s,...r,ref:t})});ln.displayName=ro;var ao="DropdownMenuItemIndicator",pn=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx(Bt,{...s,...r,ref:t})});pn.displayName=ao;var so="DropdownMenuSeparator",fn=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx(zt,{...s,...r,ref:t})});fn.displayName=so;var co="DropdownMenuArrow",io=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx(Ht,{...s,...r,ref:t})});io.displayName=co;var uo="DropdownMenuSubTrigger",mn=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx(Vt,{...s,...r,ref:t})});mn.displayName=uo;var lo="DropdownMenuSubContent",hn=a.forwardRef((e,t)=>{const{__scopeDropdownMenu:n,...r}=e,s=M(n);return o.jsx(Yt,{...s,...r,ref:t,style:{...e.style,"--radix-dropdown-menu-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-dropdown-menu-content-available-width":"var(--radix-popper-available-width)","--radix-dropdown-menu-content-available-height":"var(--radix-popper-available-height)","--radix-dropdown-menu-trigger-width":"var(--radix-popper-anchor-width)","--radix-dropdown-menu-trigger-height":"var(--radix-popper-anchor-height)"}})});hn.displayName=lo;var po=nn,fo=on,mo=rn,xn=sn,vn=cn,wn=dn,gn=un,Mn=ln,bn=pn,yn=fn,Cn=mn,_n=hn;const Ce=po,_e=fo,ho=a.forwardRef(({className:e,inset:t,children:n,...r},s)=>o.jsxs(Cn,{ref:s,className:g("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",t&&"pl-8",e),...r,children:[n,o.jsx(Ie,{className:"ml-auto h-4 w-4"})]}));ho.displayName=Cn.displayName;const xo=a.forwardRef(({className:e,...t},n)=>o.jsx(_n,{ref:n,className:g("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",e),...t}));xo.displayName=_n.displayName;const re=a.forwardRef(({className:e,sideOffset:t=4,...n},r)=>o.jsx(mo,{children:o.jsx(xn,{ref:r,sideOffset:t,className:g("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",e),...n})}));re.displayName=xn.displayName;const O=a.forwardRef(({className:e,inset:t,...n},r)=>o.jsx(wn,{ref:r,className:g("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",t&&"pl-8",e),...n}));O.displayName=wn.displayName;const vo=a.forwardRef(({className:e,children:t,checked:n,...r},s)=>o.jsxs(gn,{ref:s,className:g("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",e),checked:n,...r,children:[o.jsx("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:o.jsx(bn,{children:o.jsx(Zn,{className:"h-4 w-4"})})}),t]}));vo.displayName=gn.displayName;const wo=a.forwardRef(({className:e,children:t,...n},r)=>o.jsxs(Mn,{ref:r,className:g("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",e),...n,children:[o.jsx("span",{className:"absolute left-2 flex h-3.5 w-3.5 items-center justify-center",children:o.jsx(bn,{children:o.jsx(nt,{className:"h-2 w-2 fill-current"})})}),t]}));wo.displayName=Mn.displayName;const go=a.forwardRef(({className:e,inset:t,...n},r)=>o.jsx(vn,{ref:r,className:g("px-2 py-1.5 text-sm font-semibold",t&&"pl-8",e),...n}));go.displayName=vn.displayName;const Mo=a.forwardRef(({className:e,...t},n)=>o.jsx(yn,{ref:n,className:g("-mx-1 my-1 h-px bg-muted",e),...t}));Mo.displayName=yn.displayName;function Lo({value:e,onChange:t,onExport:n}){const{toast:r}=Qn(),s=zn(e),c=d=>{n?n(d):r({title:"Export not available",description:"Export functionality is not available for this view.",variant:"destructive"})};return o.jsxs("div",{className:"flex items-center justify-between",children:[o.jsxs("div",{className:"flex items-center",children:[o.jsxs(Y,{variant:"ghost",size:"icon",onClick:()=>t(Hn(e)),className:"mr-1 sm:mr-2 h-7 w-7 sm:h-9 sm:w-9 rounded-full hover:bg-gray-100",children:[o.jsx(Jn,{className:"h-3.5 w-3.5 sm:h-4 sm:w-4"}),o.jsx("span",{className:"sr-only",children:"Previous"})]}),o.jsx("h2",{className:"text-sm sm:text-base md:text-lg font-semibold text-gray-800",children:s}),o.jsxs(Y,{variant:"ghost",size:"icon",onClick:()=>t(Vn(e)),className:"ml-1 sm:ml-2 h-7 w-7 sm:h-9 sm:w-9 rounded-full hover:bg-gray-100",children:[o.jsx(Ie,{className:"h-3.5 w-3.5 sm:h-4 sm:w-4"}),o.jsx("span",{className:"sr-only",children:"Next"})]})]}),n&&o.jsxs(o.Fragment,{children:[o.jsx("div",{className:"hidden sm:flex space-x-2",children:o.jsxs(Ce,{children:[o.jsx(_e,{asChild:!0,children:o.jsx(Y,{variant:"outline",size:"sm",className:"text-gray-600 hover:text-primary border-gray-300 hover:border-primary",children:"Export"})}),o.jsxs(re,{children:[o.jsx(O,{onClick:()=>c("csv"),children:o.jsx("span",{children:"Export CSV"})}),o.jsx(O,{onClick:()=>c("pdf"),children:o.jsx("span",{children:"Export PDF"})})]})]})}),o.jsx("div",{className:"sm:hidden",children:o.jsxs(Ce,{children:[o.jsx(_e,{asChild:!0,children:o.jsxs(Y,{variant:"ghost",size:"icon",className:"h-7 w-7 rounded-full hover:bg-gray-100",children:[o.jsx(ot,{className:"h-3.5 w-3.5"}),o.jsx("span",{className:"sr-only",children:"Export"})]})}),o.jsxs(re,{align:"end",className:"w-28",children:[o.jsxs(O,{onClick:()=>c("csv"),className:"text-xs py-1.5",children:[o.jsx(be,{className:"h-3 w-3 mr-1.5"}),o.jsx("span",{children:"CSV"})]}),o.jsxs(O,{onClick:()=>c("pdf"),className:"text-xs py-1.5",children:[o.jsx(be,{className:"h-3 w-3 mr-1.5"}),o.jsx("span",{children:"PDF"})]})]})]})})]})]})}const bo=a.forwardRef(({className:e,...t},n)=>o.jsx("div",{className:"relative w-full overflow-auto",children:o.jsx("table",{ref:n,className:g("w-full caption-bottom text-sm",e),...t})}));bo.displayName="Table";const yo=a.forwardRef(({className:e,...t},n)=>o.jsx("thead",{ref:n,className:g("[&_tr]:border-b [&_tr]:border-gray-200",e),...t}));yo.displayName="TableHeader";const Co=a.forwardRef(({className:e,...t},n)=>o.jsx("tbody",{ref:n,className:g("[&_tr:last-child]:border-0 [&_tr]:border-gray-200",e),...t}));Co.displayName="TableBody";const _o=a.forwardRef(({className:e,...t},n)=>o.jsx("tfoot",{ref:n,className:g("border-t border-gray-200 bg-muted/50 font-medium [&>tr]:last:border-b-0",e),...t}));_o.displayName="TableFooter";const Ro=a.forwardRef(({className:e,...t},n)=>o.jsx("tr",{ref:n,className:g("border-b border-gray-200 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",e),...t}));Ro.displayName="TableRow";const No=a.forwardRef(({className:e,...t},n)=>o.jsx("th",{ref:n,className:g("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",e),...t}));No.displayName="TableHead";const jo=a.forwardRef(({className:e,...t},n)=>o.jsx("td",{ref:n,className:g("p-4 align-middle [&:has([role=checkbox])]:pr-0",e),...t}));jo.displayName="TableCell";const Do=a.forwardRef(({className:e,...t},n)=>o.jsx("caption",{ref:n,className:g("mt-4 text-sm text-muted-foreground",e),...t}));Do.displayName="TableCaption";export{Lo as M,bo as T,yo as a,Ro as b,No as c,Co as d,jo as e};
