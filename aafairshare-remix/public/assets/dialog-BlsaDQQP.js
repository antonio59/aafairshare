import{i as Z,a as J,e as D,b as x,u as Q,j as X,P as C,f as ee,D as te}from"./x-DiYCQYTF.js";import{r as i,j as s}from"./index-DoqKjbA4.js";import{u as h,v as oe,c as m}from"./utils-Cd1bfJmN.js";import{c as R,m as ae,o as se,n as ne,F as re}from"./MainLayout-DfzSb1s3.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie=[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]],Pe=Z("trash-2",ie);var b="Dialog",[I,Oe]=J(b),[le,u]=I(b),P=e=>{const{__scopeDialog:t,children:o,open:r,defaultOpen:n,onOpenChange:a,modal:l=!0}=e,c=i.useRef(null),f=i.useRef(null),[g=!1,d]=Q({prop:r,defaultProp:n,onChange:a});return s.jsx(le,{scope:t,triggerRef:c,contentRef:f,contentId:R(),titleId:R(),descriptionId:R(),open:g,onOpenChange:d,onOpenToggle:i.useCallback(()=>d(N=>!N),[d]),modal:l,children:o})};P.displayName=b;var O="DialogTrigger",w=i.forwardRef((e,t)=>{const{__scopeDialog:o,...r}=e,n=u(O,o),a=h(t,n.triggerRef);return s.jsx(D.button,{type:"button","aria-haspopup":"dialog","aria-expanded":n.open,"aria-controls":n.contentId,"data-state":E(n.open),...r,ref:a,onClick:x(e.onClick,n.onOpenToggle)})});w.displayName=O;var _="DialogPortal",[ce,T]=I(_,{forceMount:void 0}),A=e=>{const{__scopeDialog:t,forceMount:o,children:r,container:n}=e,a=u(_,t);return s.jsx(ce,{scope:t,forceMount:o,children:i.Children.map(r,l=>s.jsx(C,{present:o||a.open,children:s.jsx(ee,{asChild:!0,container:n,children:l})}))})};A.displayName=_;var y="DialogOverlay",M=i.forwardRef((e,t)=>{const o=T(y,e.__scopeDialog),{forceMount:r=o.forceMount,...n}=e,a=u(y,e.__scopeDialog);return a.modal?s.jsx(C,{present:r||a.open,children:s.jsx(ue,{...n,ref:t})}):null});M.displayName=y;var de=oe("DialogOverlay.RemoveScroll"),ue=i.forwardRef((e,t)=>{const{__scopeDialog:o,...r}=e,n=u(y,o);return s.jsx(se,{as:de,allowPinchZoom:!0,shards:[n.contentRef],children:s.jsx(D.div,{"data-state":E(n.open),...r,ref:t,style:{pointerEvents:"auto",...r.style}})})}),p="DialogContent",F=i.forwardRef((e,t)=>{const o=T(p,e.__scopeDialog),{forceMount:r=o.forceMount,...n}=e,a=u(p,e.__scopeDialog);return s.jsx(C,{present:r||a.open,children:a.modal?s.jsx(fe,{...n,ref:t}):s.jsx(ge,{...n,ref:t})})});F.displayName=p;var fe=i.forwardRef((e,t)=>{const o=u(p,e.__scopeDialog),r=i.useRef(null),n=h(t,o.contentRef,r);return i.useEffect(()=>{const a=r.current;if(a)return ae(a)},[]),s.jsx(S,{...e,ref:n,trapFocus:o.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:x(e.onCloseAutoFocus,a=>{var l;a.preventDefault(),(l=o.triggerRef.current)==null||l.focus()}),onPointerDownOutside:x(e.onPointerDownOutside,a=>{const l=a.detail.originalEvent,c=l.button===0&&l.ctrlKey===!0;(l.button===2||c)&&a.preventDefault()}),onFocusOutside:x(e.onFocusOutside,a=>a.preventDefault())})}),ge=i.forwardRef((e,t)=>{const o=u(p,e.__scopeDialog),r=i.useRef(!1),n=i.useRef(!1);return s.jsx(S,{...e,ref:t,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:a=>{var l,c;(l=e.onCloseAutoFocus)==null||l.call(e,a),a.defaultPrevented||(r.current||(c=o.triggerRef.current)==null||c.focus(),a.preventDefault()),r.current=!1,n.current=!1},onInteractOutside:a=>{var f,g;(f=e.onInteractOutside)==null||f.call(e,a),a.defaultPrevented||(r.current=!0,a.detail.originalEvent.type==="pointerdown"&&(n.current=!0));const l=a.target;((g=o.triggerRef.current)==null?void 0:g.contains(l))&&a.preventDefault(),a.detail.originalEvent.type==="focusin"&&n.current&&a.preventDefault()}})}),S=i.forwardRef((e,t)=>{const{__scopeDialog:o,trapFocus:r,onOpenAutoFocus:n,onCloseAutoFocus:a,...l}=e,c=u(p,o),f=i.useRef(null),g=h(t,f);return ne(),s.jsxs(s.Fragment,{children:[s.jsx(re,{asChild:!0,loop:!0,trapped:r,onMountAutoFocus:n,onUnmountAutoFocus:a,children:s.jsx(te,{role:"dialog",id:c.contentId,"aria-describedby":c.descriptionId,"aria-labelledby":c.titleId,"data-state":E(c.open),...l,ref:g,onDismiss:()=>c.onOpenChange(!1)})}),s.jsxs(s.Fragment,{children:[s.jsx(pe,{titleId:c.titleId}),s.jsx(xe,{contentRef:f,descriptionId:c.descriptionId})]})]})}),j="DialogTitle",k=i.forwardRef((e,t)=>{const{__scopeDialog:o,...r}=e,n=u(j,o);return s.jsx(D.h2,{id:n.titleId,...r,ref:t})});k.displayName=j;var W="DialogDescription",$=i.forwardRef((e,t)=>{const{__scopeDialog:o,...r}=e,n=u(W,o);return s.jsx(D.p,{id:n.descriptionId,...r,ref:t})});$.displayName=W;var L="DialogClose",G=i.forwardRef((e,t)=>{const{__scopeDialog:o,...r}=e,n=u(L,o);return s.jsx(D.button,{type:"button",...r,ref:t,onClick:x(e.onClick,()=>n.onOpenChange(!1))})});G.displayName=L;function E(e){return e?"open":"closed"}var H="DialogTitleWarning",[we,V]=X(H,{contentName:p,titleName:j,docsSlug:"dialog"}),pe=({titleId:e})=>{const t=V(H),o=`\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;return i.useEffect(()=>{e&&(document.getElementById(e)||console.error(o))},[o,e]),null},me="DialogDescriptionWarning",xe=({contentRef:e,descriptionId:t})=>{const r=`Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${V(me).contentName}}.`;return i.useEffect(()=>{var a;const n=(a=e.current)==null?void 0:a.getAttribute("aria-describedby");t&&n&&(document.getElementById(t)||console.warn(r))},[r,e,t]),null},De=P,Te=w,ye=A,z=M,B=F,v=k,q=$,ve=G;const K=i.forwardRef(({style:e,...t},o)=>s.jsx("span",{ref:o,style:{position:"absolute",border:0,width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",wordWrap:"normal",...e},...t}));K.displayName="VisuallyHidden";const Ae=De,Ne=ye,Me=ve,U=i.forwardRef(({className:e,...t},o)=>s.jsx(z,{ref:o,className:m("fixed inset-0 z-40 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",e),...t}));U.displayName=z.displayName;const Re=i.forwardRef(({className:e,children:t,...o},r)=>{const n=i.useId(),a=o["aria-labelledby"]||n,l=o["aria-describedby"],[c,f]=i.useState(!1);return i.useEffect(()=>{const g=d=>{if(!d)return!1;if(Array.isArray(d))return d.some(N=>g(N));if(i.isValidElement(d)){if(d.type===Y||d.type&&typeof d.type!="string"&&d.type.displayName===v.displayName)return!0;if(d.props&&typeof d.props=="object"&&"children"in d.props)return g(d.props.children)}return!1};f(g(t))},[t]),s.jsxs(Ne,{children:[s.jsx(U,{}),s.jsxs(B,{ref:r,className:m("fixed left-[50%] top-[50%] z-40 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",e),"aria-labelledby":a,"aria-describedby":l,...o,children:[!c&&s.jsx(v,{id:a,className:"sr-only",children:s.jsx(K,{children:"Dialog"})}),t]})]})});Re.displayName=B.displayName;const Ce=({className:e,...t})=>s.jsx("div",{className:m("flex flex-col space-y-1.5 text-center sm:text-left",e),...t});Ce.displayName="DialogHeader";const he=({className:e,...t})=>s.jsx("div",{className:m("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",e),...t});he.displayName="DialogFooter";const Y=i.forwardRef(({className:e,...t},o)=>s.jsx(v,{ref:o,className:m("text-lg font-semibold leading-none tracking-tight",e),...t}));Y.displayName=v.displayName;const be=i.forwardRef(({className:e,...t},o)=>s.jsx(q,{ref:o,className:m("text-sm text-muted-foreground",e),...t}));be.displayName=q.displayName;export{B as C,Ae as D,z as O,ye as P,De as R,Pe as T,K as V,we as W,Re as a,Ce as b,Y as c,be as d,he as e,Me as f,Oe as g,v as h,q as i,ve as j,Te as k};
