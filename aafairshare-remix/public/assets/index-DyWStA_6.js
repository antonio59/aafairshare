import{c as Rt}from"./x-Drx7pp5G.js";import{r as R,j as Y}from"./index-DKmAOi_X.js";import{k as Oe}from"./components-CKpw0IfN.js";import{e as Ct,i as yt,a as Pe,f as Ut,d as Se}from"./utils-C9VE-I93.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],jn=Rt("check",Ee);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],Vn=Rt("chevron-left",De);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],In=Rt("chevron-right",Le);function Yn(t){const e=Number(t);return Number.isNaN(e)?"£NaN":new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(e)}const Te=["top","right","bottom","left"],G=Math.min,F=Math.max,ft=Math.round,lt=Math.floor,j=t=>({x:t,y:t}),Me={left:"right",right:"left",bottom:"top",top:"bottom"},ke={start:"end",end:"start"};function vt(t,e,n){return F(t,G(e,n))}function X(t,e){return typeof t=="function"?t(e):t}function q(t){return t.split("-")[0]}function tt(t){return t.split("-")[1]}function Ot(t){return t==="x"?"y":"x"}function Pt(t){return t==="y"?"height":"width"}function U(t){return["top","bottom"].includes(q(t))?"y":"x"}function St(t){return Ot(U(t))}function Ne(t,e,n){n===void 0&&(n=!1);const o=tt(t),r=St(t),i=Pt(r);let s=r==="x"?o===(n?"end":"start")?"right":"left":o==="start"?"bottom":"top";return e.reference[i]>e.floating[i]&&(s=ut(s)),[s,ut(s)]}function $e(t){const e=ut(t);return[bt(t),e,bt(e)]}function bt(t){return t.replace(/start|end/g,e=>ke[e])}function Fe(t,e,n){const o=["left","right"],r=["right","left"],i=["top","bottom"],s=["bottom","top"];switch(t){case"top":case"bottom":return n?e?r:o:e?o:r;case"left":case"right":return e?i:s;default:return[]}}function _e(t,e,n,o){const r=tt(t);let i=Fe(q(t),n==="start",o);return r&&(i=i.map(s=>s+"-"+r),e&&(i=i.concat(i.map(bt)))),i}function ut(t){return t.replace(/left|right|bottom|top/g,e=>Me[e])}function He(t){return{top:0,right:0,bottom:0,left:0,...t}}function Zt(t){return typeof t!="number"?He(t):{top:t,right:t,bottom:t,left:t}}function dt(t){const{x:e,y:n,width:o,height:r}=t;return{width:o,height:r,top:n,left:e,right:e+o,bottom:n+r,x:e,y:n}}function zt(t,e,n){let{reference:o,floating:r}=t;const i=U(e),s=St(e),c=Pt(s),l=q(e),a=i==="y",f=o.x+o.width/2-r.width/2,u=o.y+o.height/2-r.height/2,m=o[c]/2-r[c]/2;let d;switch(l){case"top":d={x:f,y:o.y-r.height};break;case"bottom":d={x:f,y:o.y+o.height};break;case"right":d={x:o.x+o.width,y:u};break;case"left":d={x:o.x-r.width,y:u};break;default:d={x:o.x,y:o.y}}switch(tt(e)){case"start":d[s]-=m*(n&&a?-1:1);break;case"end":d[s]+=m*(n&&a?-1:1);break}return d}const We=async(t,e,n)=>{const{placement:o="bottom",strategy:r="absolute",middleware:i=[],platform:s}=n,c=i.filter(Boolean),l=await(s.isRTL==null?void 0:s.isRTL(e));let a=await s.getElementRects({reference:t,floating:e,strategy:r}),{x:f,y:u}=zt(a,o,l),m=o,d={},p=0;for(let h=0;h<c.length;h++){const{name:w,fn:g}=c[h],{x,y:b,data:y,reset:v}=await g({x:f,y:u,initialPlacement:o,placement:m,strategy:r,middlewareData:d,rects:a,platform:s,elements:{reference:t,floating:e}});f=x??f,u=b??u,d={...d,[w]:{...d[w],...y}},v&&p<=50&&(p++,typeof v=="object"&&(v.placement&&(m=v.placement),v.rects&&(a=v.rects===!0?await s.getElementRects({reference:t,floating:e,strategy:r}):v.rects),{x:f,y:u}=zt(a,m,l)),h=-1)}return{x:f,y:u,placement:m,strategy:r,middlewareData:d}};async function ot(t,e){var n;e===void 0&&(e={});const{x:o,y:r,platform:i,rects:s,elements:c,strategy:l}=t,{boundary:a="clippingAncestors",rootBoundary:f="viewport",elementContext:u="floating",altBoundary:m=!1,padding:d=0}=X(e,t),p=Zt(d),w=c[m?u==="floating"?"reference":"floating":u],g=dt(await i.getClippingRect({element:(n=await(i.isElement==null?void 0:i.isElement(w)))==null||n?w:w.contextElement||await(i.getDocumentElement==null?void 0:i.getDocumentElement(c.floating)),boundary:a,rootBoundary:f,strategy:l})),x=u==="floating"?{x:o,y:r,width:s.floating.width,height:s.floating.height}:s.reference,b=await(i.getOffsetParent==null?void 0:i.getOffsetParent(c.floating)),y=await(i.isElement==null?void 0:i.isElement(b))?await(i.getScale==null?void 0:i.getScale(b))||{x:1,y:1}:{x:1,y:1},v=dt(i.convertOffsetParentRelativeRectToViewportRelativeRect?await i.convertOffsetParentRelativeRectToViewportRelativeRect({elements:c,rect:x,offsetParent:b,strategy:l}):x);return{top:(g.top-v.top+p.top)/y.y,bottom:(v.bottom-g.bottom+p.bottom)/y.y,left:(g.left-v.left+p.left)/y.x,right:(v.right-g.right+p.right)/y.x}}const Be=t=>({name:"arrow",options:t,async fn(e){const{x:n,y:o,placement:r,rects:i,platform:s,elements:c,middlewareData:l}=e,{element:a,padding:f=0}=X(t,e)||{};if(a==null)return{};const u=Zt(f),m={x:n,y:o},d=St(r),p=Pt(d),h=await s.getDimensions(a),w=d==="y",g=w?"top":"left",x=w?"bottom":"right",b=w?"clientHeight":"clientWidth",y=i.reference[p]+i.reference[d]-m[d]-i.floating[p],v=m[d]-i.reference[d],C=await(s.getOffsetParent==null?void 0:s.getOffsetParent(a));let O=C?C[b]:0;(!O||!await(s.isElement==null?void 0:s.isElement(C)))&&(O=c.floating[b]||i.floating[p]);const L=y/2-v/2,$=O/2-h[p]/2-1,T=G(u[g],$),k=G(u[x],$),N=T,S=O-h[p]-k,P=O/2-h[p]/2+L,H=vt(N,P,S),E=!l.arrow&&tt(r)!=null&&P!==H&&i.reference[p]/2-(P<N?T:k)-h[p]/2<0,D=E?P<N?P-N:P-S:0;return{[d]:m[d]+D,data:{[d]:H,centerOffset:P-H-D,...E&&{alignmentOffset:D}},reset:E}}}),ze=function(t){return t===void 0&&(t={}),{name:"flip",options:t,async fn(e){var n,o;const{placement:r,middlewareData:i,rects:s,initialPlacement:c,platform:l,elements:a}=e,{mainAxis:f=!0,crossAxis:u=!0,fallbackPlacements:m,fallbackStrategy:d="bestFit",fallbackAxisSideDirection:p="none",flipAlignment:h=!0,...w}=X(t,e);if((n=i.arrow)!=null&&n.alignmentOffset)return{};const g=q(r),x=U(c),b=q(c)===c,y=await(l.isRTL==null?void 0:l.isRTL(a.floating)),v=m||(b||!h?[ut(c)]:$e(c)),C=p!=="none";!m&&C&&v.push(..._e(c,h,p,y));const O=[c,...v],L=await ot(e,w),$=[];let T=((o=i.flip)==null?void 0:o.overflows)||[];if(f&&$.push(L[g]),u){const P=Ne(r,s,y);$.push(L[P[0]],L[P[1]])}if(T=[...T,{placement:r,overflows:$}],!$.every(P=>P<=0)){var k,N;const P=(((k=i.flip)==null?void 0:k.index)||0)+1,H=O[P];if(H)return{data:{index:P,overflows:T},reset:{placement:H}};let E=(N=T.filter(D=>D.overflows[0]<=0).sort((D,A)=>D.overflows[1]-A.overflows[1])[0])==null?void 0:N.placement;if(!E)switch(d){case"bestFit":{var S;const D=(S=T.filter(A=>{if(C){const M=U(A.placement);return M===x||M==="y"}return!0}).map(A=>[A.placement,A.overflows.filter(M=>M>0).reduce((M,z)=>M+z,0)]).sort((A,M)=>A[1]-M[1])[0])==null?void 0:S[0];D&&(E=D);break}case"initialPlacement":E=c;break}if(r!==E)return{reset:{placement:E}}}return{}}}};function jt(t,e){return{top:t.top-e.height,right:t.right-e.width,bottom:t.bottom-e.height,left:t.left-e.width}}function Vt(t){return Te.some(e=>t[e]>=0)}const je=function(t){return t===void 0&&(t={}),{name:"hide",options:t,async fn(e){const{rects:n}=e,{strategy:o="referenceHidden",...r}=X(t,e);switch(o){case"referenceHidden":{const i=await ot(e,{...r,elementContext:"reference"}),s=jt(i,n.reference);return{data:{referenceHiddenOffsets:s,referenceHidden:Vt(s)}}}case"escaped":{const i=await ot(e,{...r,altBoundary:!0}),s=jt(i,n.floating);return{data:{escapedOffsets:s,escaped:Vt(s)}}}default:return{}}}}};async function Ve(t,e){const{placement:n,platform:o,elements:r}=t,i=await(o.isRTL==null?void 0:o.isRTL(r.floating)),s=q(n),c=tt(n),l=U(n)==="y",a=["left","top"].includes(s)?-1:1,f=i&&l?-1:1,u=X(e,t);let{mainAxis:m,crossAxis:d,alignmentAxis:p}=typeof u=="number"?{mainAxis:u,crossAxis:0,alignmentAxis:null}:{mainAxis:u.mainAxis||0,crossAxis:u.crossAxis||0,alignmentAxis:u.alignmentAxis};return c&&typeof p=="number"&&(d=c==="end"?p*-1:p),l?{x:d*f,y:m*a}:{x:m*a,y:d*f}}const Ie=function(t){return t===void 0&&(t=0),{name:"offset",options:t,async fn(e){var n,o;const{x:r,y:i,placement:s,middlewareData:c}=e,l=await Ve(e,t);return s===((n=c.offset)==null?void 0:n.placement)&&(o=c.arrow)!=null&&o.alignmentOffset?{}:{x:r+l.x,y:i+l.y,data:{...l,placement:s}}}}},Ye=function(t){return t===void 0&&(t={}),{name:"shift",options:t,async fn(e){const{x:n,y:o,placement:r}=e,{mainAxis:i=!0,crossAxis:s=!1,limiter:c={fn:w=>{let{x:g,y:x}=w;return{x:g,y:x}}},...l}=X(t,e),a={x:n,y:o},f=await ot(e,l),u=U(q(r)),m=Ot(u);let d=a[m],p=a[u];if(i){const w=m==="y"?"top":"left",g=m==="y"?"bottom":"right",x=d+f[w],b=d-f[g];d=vt(x,d,b)}if(s){const w=u==="y"?"top":"left",g=u==="y"?"bottom":"right",x=p+f[w],b=p-f[g];p=vt(x,p,b)}const h=c.fn({...e,[m]:d,[u]:p});return{...h,data:{x:h.x-n,y:h.y-o,enabled:{[m]:i,[u]:s}}}}}},Xe=function(t){return t===void 0&&(t={}),{options:t,fn(e){const{x:n,y:o,placement:r,rects:i,middlewareData:s}=e,{offset:c=0,mainAxis:l=!0,crossAxis:a=!0}=X(t,e),f={x:n,y:o},u=U(r),m=Ot(u);let d=f[m],p=f[u];const h=X(c,e),w=typeof h=="number"?{mainAxis:h,crossAxis:0}:{mainAxis:0,crossAxis:0,...h};if(l){const b=m==="y"?"height":"width",y=i.reference[m]-i.floating[b]+w.mainAxis,v=i.reference[m]+i.reference[b]-w.mainAxis;d<y?d=y:d>v&&(d=v)}if(a){var g,x;const b=m==="y"?"width":"height",y=["top","left"].includes(q(r)),v=i.reference[u]-i.floating[b]+(y&&((g=s.offset)==null?void 0:g[u])||0)+(y?0:w.crossAxis),C=i.reference[u]+i.reference[b]+(y?0:((x=s.offset)==null?void 0:x[u])||0)-(y?w.crossAxis:0);p<v?p=v:p>C&&(p=C)}return{[m]:d,[u]:p}}}},qe=function(t){return t===void 0&&(t={}),{name:"size",options:t,async fn(e){var n,o;const{placement:r,rects:i,platform:s,elements:c}=e,{apply:l=()=>{},...a}=X(t,e),f=await ot(e,a),u=q(r),m=tt(r),d=U(r)==="y",{width:p,height:h}=i.floating;let w,g;u==="top"||u==="bottom"?(w=u,g=m===(await(s.isRTL==null?void 0:s.isRTL(c.floating))?"start":"end")?"left":"right"):(g=u,w=m==="end"?"top":"bottom");const x=h-f.top-f.bottom,b=p-f.left-f.right,y=G(h-f[w],x),v=G(p-f[g],b),C=!e.middlewareData.shift;let O=y,L=v;if((n=e.middlewareData.shift)!=null&&n.enabled.x&&(L=b),(o=e.middlewareData.shift)!=null&&o.enabled.y&&(O=x),C&&!m){const T=F(f.left,0),k=F(f.right,0),N=F(f.top,0),S=F(f.bottom,0);d?L=p-2*(T!==0||k!==0?T+k:F(f.left,f.right)):O=h-2*(N!==0||S!==0?N+S:F(f.top,f.bottom))}await l({...e,availableWidth:L,availableHeight:O});const $=await s.getDimensions(c.floating);return p!==$.width||h!==$.height?{reset:{rects:!0}}:{}}}};function mt(){return typeof window<"u"}function et(t){return Kt(t)?(t.nodeName||"").toLowerCase():"#document"}function _(t){var e;return(t==null||(e=t.ownerDocument)==null?void 0:e.defaultView)||window}function I(t){var e;return(e=(Kt(t)?t.ownerDocument:t.document)||window.document)==null?void 0:e.documentElement}function Kt(t){return mt()?t instanceof Node||t instanceof _(t).Node:!1}function W(t){return mt()?t instanceof Element||t instanceof _(t).Element:!1}function V(t){return mt()?t instanceof HTMLElement||t instanceof _(t).HTMLElement:!1}function It(t){return!mt()||typeof ShadowRoot>"u"?!1:t instanceof ShadowRoot||t instanceof _(t).ShadowRoot}function it(t){const{overflow:e,overflowX:n,overflowY:o,display:r}=B(t);return/auto|scroll|overlay|hidden|clip/.test(e+o+n)&&!["inline","contents"].includes(r)}function Ge(t){return["table","td","th"].includes(et(t))}function ht(t){return[":popover-open",":modal"].some(e=>{try{return t.matches(e)}catch{return!1}})}function Et(t){const e=Dt(),n=W(t)?B(t):t;return["transform","translate","scale","rotate","perspective"].some(o=>n[o]?n[o]!=="none":!1)||(n.containerType?n.containerType!=="normal":!1)||!e&&(n.backdropFilter?n.backdropFilter!=="none":!1)||!e&&(n.filter?n.filter!=="none":!1)||["transform","translate","scale","rotate","perspective","filter"].some(o=>(n.willChange||"").includes(o))||["paint","layout","strict","content"].some(o=>(n.contain||"").includes(o))}function Ue(t){let e=Z(t);for(;V(e)&&!Q(e);){if(Et(e))return e;if(ht(e))return null;e=Z(e)}return null}function Dt(){return typeof CSS>"u"||!CSS.supports?!1:CSS.supports("-webkit-backdrop-filter","none")}function Q(t){return["html","body","#document"].includes(et(t))}function B(t){return _(t).getComputedStyle(t)}function gt(t){return W(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.scrollX,scrollTop:t.scrollY}}function Z(t){if(et(t)==="html")return t;const e=t.assignedSlot||t.parentNode||It(t)&&t.host||I(t);return It(e)?e.host:e}function Jt(t){const e=Z(t);return Q(e)?t.ownerDocument?t.ownerDocument.body:t.body:V(e)&&it(e)?e:Jt(e)}function rt(t,e,n){var o;e===void 0&&(e=[]),n===void 0&&(n=!0);const r=Jt(t),i=r===((o=t.ownerDocument)==null?void 0:o.body),s=_(r);if(i){const c=At(s);return e.concat(s,s.visualViewport||[],it(r)?r:[],c&&n?rt(c):[])}return e.concat(r,rt(r,[],n))}function At(t){return t.parent&&Object.getPrototypeOf(t.parent)?t.frameElement:null}function Qt(t){const e=B(t);let n=parseFloat(e.width)||0,o=parseFloat(e.height)||0;const r=V(t),i=r?t.offsetWidth:n,s=r?t.offsetHeight:o,c=ft(n)!==i||ft(o)!==s;return c&&(n=i,o=s),{width:n,height:o,$:c}}function Lt(t){return W(t)?t:t.contextElement}function J(t){const e=Lt(t);if(!V(e))return j(1);const n=e.getBoundingClientRect(),{width:o,height:r,$:i}=Qt(e);let s=(i?ft(n.width):n.width)/o,c=(i?ft(n.height):n.height)/r;return(!s||!Number.isFinite(s))&&(s=1),(!c||!Number.isFinite(c))&&(c=1),{x:s,y:c}}const Ze=j(0);function te(t){const e=_(t);return!Dt()||!e.visualViewport?Ze:{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}}function Ke(t,e,n){return e===void 0&&(e=!1),!n||e&&n!==_(t)?!1:e}function K(t,e,n,o){e===void 0&&(e=!1),n===void 0&&(n=!1);const r=t.getBoundingClientRect(),i=Lt(t);let s=j(1);e&&(o?W(o)&&(s=J(o)):s=J(t));const c=Ke(i,n,o)?te(i):j(0);let l=(r.left+c.x)/s.x,a=(r.top+c.y)/s.y,f=r.width/s.x,u=r.height/s.y;if(i){const m=_(i),d=o&&W(o)?_(o):o;let p=m,h=At(p);for(;h&&o&&d!==p;){const w=J(h),g=h.getBoundingClientRect(),x=B(h),b=g.left+(h.clientLeft+parseFloat(x.paddingLeft))*w.x,y=g.top+(h.clientTop+parseFloat(x.paddingTop))*w.y;l*=w.x,a*=w.y,f*=w.x,u*=w.y,l+=b,a+=y,p=_(h),h=At(p)}}return dt({width:f,height:u,x:l,y:a})}function Tt(t,e){const n=gt(t).scrollLeft;return e?e.left+n:K(I(t)).left+n}function ee(t,e,n){n===void 0&&(n=!1);const o=t.getBoundingClientRect(),r=o.left+e.scrollLeft-(n?0:Tt(t,o)),i=o.top+e.scrollTop;return{x:r,y:i}}function Je(t){let{elements:e,rect:n,offsetParent:o,strategy:r}=t;const i=r==="fixed",s=I(o),c=e?ht(e.floating):!1;if(o===s||c&&i)return n;let l={scrollLeft:0,scrollTop:0},a=j(1);const f=j(0),u=V(o);if((u||!u&&!i)&&((et(o)!=="body"||it(s))&&(l=gt(o)),V(o))){const d=K(o);a=J(o),f.x=d.x+o.clientLeft,f.y=d.y+o.clientTop}const m=s&&!u&&!i?ee(s,l,!0):j(0);return{width:n.width*a.x,height:n.height*a.y,x:n.x*a.x-l.scrollLeft*a.x+f.x+m.x,y:n.y*a.y-l.scrollTop*a.y+f.y+m.y}}function Qe(t){return Array.from(t.getClientRects())}function tn(t){const e=I(t),n=gt(t),o=t.ownerDocument.body,r=F(e.scrollWidth,e.clientWidth,o.scrollWidth,o.clientWidth),i=F(e.scrollHeight,e.clientHeight,o.scrollHeight,o.clientHeight);let s=-n.scrollLeft+Tt(t);const c=-n.scrollTop;return B(o).direction==="rtl"&&(s+=F(e.clientWidth,o.clientWidth)-r),{width:r,height:i,x:s,y:c}}function en(t,e){const n=_(t),o=I(t),r=n.visualViewport;let i=o.clientWidth,s=o.clientHeight,c=0,l=0;if(r){i=r.width,s=r.height;const a=Dt();(!a||a&&e==="fixed")&&(c=r.offsetLeft,l=r.offsetTop)}return{width:i,height:s,x:c,y:l}}function nn(t,e){const n=K(t,!0,e==="fixed"),o=n.top+t.clientTop,r=n.left+t.clientLeft,i=V(t)?J(t):j(1),s=t.clientWidth*i.x,c=t.clientHeight*i.y,l=r*i.x,a=o*i.y;return{width:s,height:c,x:l,y:a}}function Yt(t,e,n){let o;if(e==="viewport")o=en(t,n);else if(e==="document")o=tn(I(t));else if(W(e))o=nn(e,n);else{const r=te(t);o={x:e.x-r.x,y:e.y-r.y,width:e.width,height:e.height}}return dt(o)}function ne(t,e){const n=Z(t);return n===e||!W(n)||Q(n)?!1:B(n).position==="fixed"||ne(n,e)}function on(t,e){const n=e.get(t);if(n)return n;let o=rt(t,[],!1).filter(c=>W(c)&&et(c)!=="body"),r=null;const i=B(t).position==="fixed";let s=i?Z(t):t;for(;W(s)&&!Q(s);){const c=B(s),l=Et(s);!l&&c.position==="fixed"&&(r=null),(i?!l&&!r:!l&&c.position==="static"&&!!r&&["absolute","fixed"].includes(r.position)||it(s)&&!l&&ne(t,s))?o=o.filter(f=>f!==s):r=c,s=Z(s)}return e.set(t,o),o}function rn(t){let{element:e,boundary:n,rootBoundary:o,strategy:r}=t;const s=[...n==="clippingAncestors"?ht(e)?[]:on(e,this._c):[].concat(n),o],c=s[0],l=s.reduce((a,f)=>{const u=Yt(e,f,r);return a.top=F(u.top,a.top),a.right=G(u.right,a.right),a.bottom=G(u.bottom,a.bottom),a.left=F(u.left,a.left),a},Yt(e,c,r));return{width:l.right-l.left,height:l.bottom-l.top,x:l.left,y:l.top}}function sn(t){const{width:e,height:n}=Qt(t);return{width:e,height:n}}function cn(t,e,n){const o=V(e),r=I(e),i=n==="fixed",s=K(t,!0,i,e);let c={scrollLeft:0,scrollTop:0};const l=j(0);if(o||!o&&!i)if((et(e)!=="body"||it(r))&&(c=gt(e)),o){const m=K(e,!0,i,e);l.x=m.x+e.clientLeft,l.y=m.y+e.clientTop}else r&&(l.x=Tt(r));const a=r&&!o&&!i?ee(r,c):j(0),f=s.left+c.scrollLeft-l.x-a.x,u=s.top+c.scrollTop-l.y-a.y;return{x:f,y:u,width:s.width,height:s.height}}function wt(t){return B(t).position==="static"}function Xt(t,e){if(!V(t)||B(t).position==="fixed")return null;if(e)return e(t);let n=t.offsetParent;return I(t)===n&&(n=n.ownerDocument.body),n}function oe(t,e){const n=_(t);if(ht(t))return n;if(!V(t)){let r=Z(t);for(;r&&!Q(r);){if(W(r)&&!wt(r))return r;r=Z(r)}return n}let o=Xt(t,e);for(;o&&Ge(o)&&wt(o);)o=Xt(o,e);return o&&Q(o)&&wt(o)&&!Et(o)?n:o||Ue(t)||n}const ln=async function(t){const e=this.getOffsetParent||oe,n=this.getDimensions,o=await n(t.floating);return{reference:cn(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,width:o.width,height:o.height}}};function an(t){return B(t).direction==="rtl"}const fn={convertOffsetParentRelativeRectToViewportRelativeRect:Je,getDocumentElement:I,getClippingRect:rn,getOffsetParent:oe,getElementRects:ln,getClientRects:Qe,getDimensions:sn,getScale:J,isElement:W,isRTL:an};function re(t,e){return t.x===e.x&&t.y===e.y&&t.width===e.width&&t.height===e.height}function un(t,e){let n=null,o;const r=I(t);function i(){var c;clearTimeout(o),(c=n)==null||c.disconnect(),n=null}function s(c,l){c===void 0&&(c=!1),l===void 0&&(l=1),i();const a=t.getBoundingClientRect(),{left:f,top:u,width:m,height:d}=a;if(c||e(),!m||!d)return;const p=lt(u),h=lt(r.clientWidth-(f+m)),w=lt(r.clientHeight-(u+d)),g=lt(f),b={rootMargin:-p+"px "+-h+"px "+-w+"px "+-g+"px",threshold:F(0,G(1,l))||1};let y=!0;function v(C){const O=C[0].intersectionRatio;if(O!==l){if(!y)return s();O?s(!1,O):o=setTimeout(()=>{s(!1,1e-7)},1e3)}O===1&&!re(a,t.getBoundingClientRect())&&s(),y=!1}try{n=new IntersectionObserver(v,{...b,root:r.ownerDocument})}catch{n=new IntersectionObserver(v,b)}n.observe(t)}return s(!0),i}function dn(t,e,n,o){o===void 0&&(o={});const{ancestorScroll:r=!0,ancestorResize:i=!0,elementResize:s=typeof ResizeObserver=="function",layoutShift:c=typeof IntersectionObserver=="function",animationFrame:l=!1}=o,a=Lt(t),f=r||i?[...a?rt(a):[],...rt(e)]:[];f.forEach(g=>{r&&g.addEventListener("scroll",n,{passive:!0}),i&&g.addEventListener("resize",n)});const u=a&&c?un(a,n):null;let m=-1,d=null;s&&(d=new ResizeObserver(g=>{let[x]=g;x&&x.target===a&&d&&(d.unobserve(e),cancelAnimationFrame(m),m=requestAnimationFrame(()=>{var b;(b=d)==null||b.observe(e)})),n()}),a&&!l&&d.observe(a),d.observe(e));let p,h=l?K(t):null;l&&w();function w(){const g=K(t);h&&!re(h,g)&&n(),h=g,p=requestAnimationFrame(w)}return n(),()=>{var g;f.forEach(x=>{r&&x.removeEventListener("scroll",n),i&&x.removeEventListener("resize",n)}),u==null||u(),(g=d)==null||g.disconnect(),d=null,l&&cancelAnimationFrame(p)}}const pn=Ie,mn=Ye,hn=ze,gn=qe,wn=je,qt=Be,xn=Xe,yn=(t,e,n)=>{const o=new Map,r={platform:fn,...n},i={...r.platform,_c:o};return We(t,e,{...r,platform:i})};var at=typeof document<"u"?R.useLayoutEffect:R.useEffect;function pt(t,e){if(t===e)return!0;if(typeof t!=typeof e)return!1;if(typeof t=="function"&&t.toString()===e.toString())return!0;let n,o,r;if(t&&e&&typeof t=="object"){if(Array.isArray(t)){if(n=t.length,n!==e.length)return!1;for(o=n;o--!==0;)if(!pt(t[o],e[o]))return!1;return!0}if(r=Object.keys(t),n=r.length,n!==Object.keys(e).length)return!1;for(o=n;o--!==0;)if(!{}.hasOwnProperty.call(e,r[o]))return!1;for(o=n;o--!==0;){const i=r[o];if(!(i==="_owner"&&t.$$typeof)&&!pt(t[i],e[i]))return!1}return!0}return t!==t&&e!==e}function ie(t){return typeof window>"u"?1:(t.ownerDocument.defaultView||window).devicePixelRatio||1}function Gt(t,e){const n=ie(t);return Math.round(e*n)/n}function xt(t){const e=R.useRef(t);return at(()=>{e.current=t}),e}function vn(t){t===void 0&&(t={});const{placement:e="bottom",strategy:n="absolute",middleware:o=[],platform:r,elements:{reference:i,floating:s}={},transform:c=!0,whileElementsMounted:l,open:a}=t,[f,u]=R.useState({x:0,y:0,strategy:n,placement:e,middlewareData:{},isPositioned:!1}),[m,d]=R.useState(o);pt(m,o)||d(o);const[p,h]=R.useState(null),[w,g]=R.useState(null),x=R.useCallback(A=>{A!==C.current&&(C.current=A,h(A))},[]),b=R.useCallback(A=>{A!==O.current&&(O.current=A,g(A))},[]),y=i||p,v=s||w,C=R.useRef(null),O=R.useRef(null),L=R.useRef(f),$=l!=null,T=xt(l),k=xt(r),N=xt(a),S=R.useCallback(()=>{if(!C.current||!O.current)return;const A={placement:e,strategy:n,middleware:m};k.current&&(A.platform=k.current),yn(C.current,O.current,A).then(M=>{const z={...M,isPositioned:N.current!==!1};P.current&&!pt(L.current,z)&&(L.current=z,Oe.flushSync(()=>{u(z)}))})},[m,e,n,k,N]);at(()=>{a===!1&&L.current.isPositioned&&(L.current.isPositioned=!1,u(A=>({...A,isPositioned:!1})))},[a]);const P=R.useRef(!1);at(()=>(P.current=!0,()=>{P.current=!1}),[]),at(()=>{if(y&&(C.current=y),v&&(O.current=v),y&&v){if(T.current)return T.current(y,v,S);S()}},[y,v,S,T,$]);const H=R.useMemo(()=>({reference:C,floating:O,setReference:x,setFloating:b}),[x,b]),E=R.useMemo(()=>({reference:y,floating:v}),[y,v]),D=R.useMemo(()=>{const A={position:n,left:0,top:0};if(!E.floating)return A;const M=Gt(E.floating,f.x),z=Gt(E.floating,f.y);return c?{...A,transform:"translate("+M+"px, "+z+"px)",...ie(E.floating)>=1.5&&{willChange:"transform"}}:{position:n,left:M,top:z}},[n,c,E.floating,f.x,f.y]);return R.useMemo(()=>({...f,update:S,refs:H,elements:E,floatingStyles:D}),[f,S,H,E,D])}const bn=t=>{function e(n){return{}.hasOwnProperty.call(n,"current")}return{name:"arrow",options:t,fn(n){const{element:o,padding:r}=typeof t=="function"?t(n):t;return o&&e(o)?o.current!=null?qt({element:o.current,padding:r}).fn(n):{}:o?qt({element:o,padding:r}).fn(n):{}}}},An=(t,e)=>({...pn(t),options:[t,e]}),Rn=(t,e)=>({...mn(t),options:[t,e]}),Cn=(t,e)=>({...xn(t),options:[t,e]}),On=(t,e)=>({...hn(t),options:[t,e]}),Pn=(t,e)=>({...gn(t),options:[t,e]}),Sn=(t,e)=>({...wn(t),options:[t,e]}),En=(t,e)=>({...bn(t),options:[t,e]});var Dn="Arrow",se=R.forwardRef((t,e)=>{const{children:n,width:o=10,height:r=5,...i}=t;return Y.jsx(Ct.svg,{...i,ref:e,width:o,height:r,viewBox:"0 0 30 10",preserveAspectRatio:"none",children:t.asChild?n:Y.jsx("polygon",{points:"0,0 30,0 15,10"})})});se.displayName=Dn;var Ln=se;function Tn(t){const[e,n]=R.useState(void 0);return yt(()=>{if(t){n({width:t.offsetWidth,height:t.offsetHeight});const o=new ResizeObserver(r=>{if(!Array.isArray(r)||!r.length)return;const i=r[0];let s,c;if("borderBoxSize"in i){const l=i.borderBoxSize,a=Array.isArray(l)?l[0]:l;s=a.inlineSize,c=a.blockSize}else s=t.offsetWidth,c=t.offsetHeight;n({width:s,height:c})});return o.observe(t,{box:"border-box"}),()=>o.unobserve(t)}else n(void 0)},[t]),e}var Mt="Popper",[ce,Xn]=Pe(Mt),[Mn,le]=ce(Mt),ae=t=>{const{__scopePopper:e,children:n}=t,[o,r]=R.useState(null);return Y.jsx(Mn,{scope:e,anchor:o,onAnchorChange:r,children:n})};ae.displayName=Mt;var fe="PopperAnchor",ue=R.forwardRef((t,e)=>{const{__scopePopper:n,virtualRef:o,...r}=t,i=le(fe,n),s=R.useRef(null),c=Ut(e,s);return R.useEffect(()=>{i.onAnchorChange((o==null?void 0:o.current)||s.current)}),o?null:Y.jsx(Ct.div,{...r,ref:c})});ue.displayName=fe;var kt="PopperContent",[kn,Nn]=ce(kt),de=R.forwardRef((t,e)=>{var Nt,$t,Ft,_t,Ht,Wt;const{__scopePopper:n,side:o="bottom",sideOffset:r=0,align:i="center",alignOffset:s=0,arrowPadding:c=0,avoidCollisions:l=!0,collisionBoundary:a=[],collisionPadding:f=0,sticky:u="partial",hideWhenDetached:m=!1,updatePositionStrategy:d="optimized",onPlaced:p,...h}=t,w=le(kt,n),[g,x]=R.useState(null),b=Ut(e,nt=>x(nt)),[y,v]=R.useState(null),C=Tn(y),O=(C==null?void 0:C.width)??0,L=(C==null?void 0:C.height)??0,$=o+(i!=="center"?"-"+i:""),T=typeof f=="number"?f:{top:0,right:0,bottom:0,left:0,...f},k=Array.isArray(a)?a:[a],N=k.length>0,S={padding:T,boundary:k.filter(Fn),altBoundary:N},{refs:P,floatingStyles:H,placement:E,isPositioned:D,middlewareData:A}=vn({strategy:"fixed",placement:$,whileElementsMounted:(...nt)=>dn(...nt,{animationFrame:d==="always"}),elements:{reference:w.anchor},middleware:[An({mainAxis:r+L,alignmentAxis:s}),l&&Rn({mainAxis:!0,crossAxis:!1,limiter:u==="partial"?Cn():void 0,...S}),l&&On({...S}),Pn({...S,apply:({elements:nt,rects:Bt,availableWidth:be,availableHeight:Ae})=>{const{width:Re,height:Ce}=Bt.reference,ct=nt.floating.style;ct.setProperty("--radix-popper-available-width",`${be}px`),ct.setProperty("--radix-popper-available-height",`${Ae}px`),ct.setProperty("--radix-popper-anchor-width",`${Re}px`),ct.setProperty("--radix-popper-anchor-height",`${Ce}px`)}}),y&&En({element:y,padding:c}),_n({arrowWidth:O,arrowHeight:L}),m&&Sn({strategy:"referenceHidden",...S})]}),[M,z]=he(E),st=Se(p);yt(()=>{D&&(st==null||st())},[D,st]);const ge=(Nt=A.arrow)==null?void 0:Nt.x,we=($t=A.arrow)==null?void 0:$t.y,xe=((Ft=A.arrow)==null?void 0:Ft.centerOffset)!==0,[ye,ve]=R.useState();return yt(()=>{g&&ve(window.getComputedStyle(g).zIndex)},[g]),Y.jsx("div",{ref:P.setFloating,"data-radix-popper-content-wrapper":"",style:{...H,transform:D?H.transform:"translate(0, -200%)",minWidth:"max-content",zIndex:ye,"--radix-popper-transform-origin":[(_t=A.transformOrigin)==null?void 0:_t.x,(Ht=A.transformOrigin)==null?void 0:Ht.y].join(" "),...((Wt=A.hide)==null?void 0:Wt.referenceHidden)&&{visibility:"hidden",pointerEvents:"none"}},dir:t.dir,children:Y.jsx(kn,{scope:n,placedSide:M,onArrowChange:v,arrowX:ge,arrowY:we,shouldHideArrow:xe,children:Y.jsx(Ct.div,{"data-side":M,"data-align":z,...h,ref:b,style:{...h.style,animation:D?void 0:"none"}})})})});de.displayName=kt;var pe="PopperArrow",$n={top:"bottom",right:"left",bottom:"top",left:"right"},me=R.forwardRef(function(e,n){const{__scopePopper:o,...r}=e,i=Nn(pe,o),s=$n[i.placedSide];return Y.jsx("span",{ref:i.onArrowChange,style:{position:"absolute",left:i.arrowX,top:i.arrowY,[s]:0,transformOrigin:{top:"",right:"0 0",bottom:"center 0",left:"100% 0"}[i.placedSide],transform:{top:"translateY(100%)",right:"translateY(50%) rotate(90deg) translateX(-50%)",bottom:"rotate(180deg)",left:"translateY(50%) rotate(-90deg) translateX(50%)"}[i.placedSide],visibility:i.shouldHideArrow?"hidden":void 0},children:Y.jsx(Ln,{...r,ref:n,style:{...r.style,display:"block"}})})});me.displayName=pe;function Fn(t){return t!==null}var _n=t=>({name:"transformOrigin",options:t,fn(e){var w,g,x;const{placement:n,rects:o,middlewareData:r}=e,s=((w=r.arrow)==null?void 0:w.centerOffset)!==0,c=s?0:t.arrowWidth,l=s?0:t.arrowHeight,[a,f]=he(n),u={start:"0%",center:"50%",end:"100%"}[f],m=(((g=r.arrow)==null?void 0:g.x)??0)+c/2,d=(((x=r.arrow)==null?void 0:x.y)??0)+l/2;let p="",h="";return a==="bottom"?(p=s?u:`${m}px`,h=`${-l}px`):a==="top"?(p=s?u:`${m}px`,h=`${o.floating.height+l}px`):a==="right"?(p=`${-l}px`,h=s?u:`${d}px`):a==="left"&&(p=`${o.floating.width+l}px`,h=s?u:`${d}px`),{data:{x:p,y:h}}}});function he(t){const[e,n="center"]=t.split("-");return[e,n]}var qn=ae,Gn=ue,Un=de,Zn=me;export{Gn as A,jn as C,qn as R,Un as a,Zn as b,Xn as c,In as d,Vn as e,Yn as f};
