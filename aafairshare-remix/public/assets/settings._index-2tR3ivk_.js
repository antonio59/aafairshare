import{r as n,j as e,e as ze}from"./index-DKmAOi_X.js";import{d as v,u as Be,_ as G,R as q,x as z,I as B,y as H,g as K}from"./AuthContext-FD9biqsX.js";import{M as He}from"./MainLayout-CRbsxUpZ.js";import{u as Ke,a as Ue,e as T,b as E,P as Je,j as k,l as M}from"./utils-C9VE-I93.js";import{u as Qe,j as We,k as re,R as Xe,I as Ye,B as x,C as U,a as J,b as Q,l as W,c as X,T as Y,D as Z,d as ee,e as se,f as ae}from"./dialog-0ZMR4aKH.js";import{S as b}from"./skeleton-xo195SXM.js";import{A as Ze,a as es,b as ss,c as as,d as ts,e as ns,f as rs,g as is}from"./alert-dialog-DO7MMnAk.js";import{u as ie,F as oe,a as ce,b as le,c as de,d as ue,I as me,e as he,s as ge,o as xe,f as fe,j as te,P as ne}from"./form-BVQOn5bi.js";import{u as pe}from"./use-firestore-form-submit-D2cT9ivr.js";import"./components-CKpw0IfN.js";import"./x-Drx7pp5G.js";var R="Tabs",[os,ws]=Ue(R,[re]),je=re(),[cs,P]=os(R),be=n.forwardRef((s,t)=>{const{__scopeTabs:r,value:a,onValueChange:c,defaultValue:o,orientation:l="horizontal",dir:u,activationMode:d="automatic",...g}=s,h=Qe(u),[m,p]=Ke({prop:a,onChange:c,defaultProp:o});return e.jsx(cs,{scope:r,baseId:We(),value:m,onValueChange:p,orientation:l,dir:h,activationMode:d,children:e.jsx(T.div,{dir:h,"data-orientation":l,...g,ref:t})})});be.displayName=R;var ve="TabsList",ye=n.forwardRef((s,t)=>{const{__scopeTabs:r,loop:a=!0,...c}=s,o=P(ve,r),l=je(r);return e.jsx(Xe,{asChild:!0,...l,orientation:o.orientation,dir:o.dir,loop:a,children:e.jsx(T.div,{role:"tablist","aria-orientation":o.orientation,...c,ref:t})})});ye.displayName=ve;var Ce="TabsTrigger",Ne=n.forwardRef((s,t)=>{const{__scopeTabs:r,value:a,disabled:c=!1,...o}=s,l=P(Ce,r),u=je(r),d=we(l.baseId,a),g=Ae(l.baseId,a),h=a===l.value;return e.jsx(Ye,{asChild:!0,...u,focusable:!c,active:h,children:e.jsx(T.button,{type:"button",role:"tab","aria-selected":h,"aria-controls":g,"data-state":h?"active":"inactive","data-disabled":c?"":void 0,disabled:c,id:d,...o,ref:t,onMouseDown:E(s.onMouseDown,m=>{!c&&m.button===0&&m.ctrlKey===!1?l.onValueChange(a):m.preventDefault()}),onKeyDown:E(s.onKeyDown,m=>{[" ","Enter"].includes(m.key)&&l.onValueChange(a)}),onFocus:E(s.onFocus,()=>{const m=l.activationMode!=="manual";!h&&!c&&m&&l.onValueChange(a)})})})});Ne.displayName=Ce;var Se="TabsContent",Te=n.forwardRef((s,t)=>{const{__scopeTabs:r,value:a,forceMount:c,children:o,...l}=s,u=P(Se,r),d=we(u.baseId,a),g=Ae(u.baseId,a),h=a===u.value,m=n.useRef(h);return n.useEffect(()=>{const p=requestAnimationFrame(()=>m.current=!1);return()=>cancelAnimationFrame(p)},[]),e.jsx(Je,{present:c||h,children:({present:p})=>e.jsx(T.div,{"data-state":h?"active":"inactive","data-orientation":u.orientation,role:"tabpanel","aria-labelledby":d,hidden:!p,id:g,tabIndex:0,...l,ref:t,style:{...s.style,animationDuration:m.current?"0s":void 0},children:p&&o})})});Te.displayName=Se;function we(s,t){return`${s}-trigger-${t}`}function Ae(s,t){return`${s}-content-${t}`}var ls=be,De=ye,Le=Ne,Ee=Te;const ds=ls,Fe=n.forwardRef(({className:s,...t},r)=>e.jsx(De,{ref:r,className:k("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",s),...t}));Fe.displayName=De.displayName;const F=n.forwardRef(({className:s,...t},r)=>e.jsx(Le,{ref:r,className:k("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",s),...t}));F.displayName=Le.displayName;const I=n.forwardRef(({className:s,...t},r)=>e.jsx(Ee,{ref:r,className:k("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",s),...t}));I.displayName=Ee.displayName;const us=xe({name:fe().min(1,"Category name is required").max(50,"Category name is too long")});function ms({category:s,onSuccess:t,onCancel:r}){const[a,c]=n.useState(!1);M();const o=ie({resolver:ge(us),defaultValues:{name:(s==null?void 0:s.name)||""}}),{submit:l}=pe({db:v,collectionName:"categories",successMessage:s?"Category updated successfully":"Category created successfully",errorMessage:s?"Failed to update category":"Failed to create category",onSuccess:d=>{t&&t(d),o.reset()}}),u=async d=>{c(!0);try{await l(d,s==null?void 0:s.id)}catch(g){console.error("Error submitting category form:",g)}finally{c(!1)}};return e.jsx(oe,{...o,children:e.jsxs("form",{onSubmit:o.handleSubmit(u),className:"space-y-4",children:[e.jsx(ce,{control:o.control,name:"name",render:({field:d})=>e.jsxs(le,{children:[e.jsx(de,{children:"Category Name"}),e.jsx(ue,{children:e.jsx(me,{placeholder:"Enter category name",...d})}),e.jsx(he,{})]})}),e.jsxs("div",{className:"flex justify-end space-x-2 pt-4",children:[r&&e.jsx(x,{type:"button",variant:"outline",onClick:r,disabled:a,children:"Cancel"}),e.jsx(x,{type:"submit",disabled:a,children:a?"Saving...":s?"Update Category":"Create Category"})]})]})})}const hs=xe({name:fe().min(1,"Location name is required").max(50,"Location name is too long")});function gs({location:s,onSuccess:t,onCancel:r}){const[a,c]=n.useState(!1);M();const o=ie({resolver:ge(hs),defaultValues:{name:(s==null?void 0:s.name)||""}}),{submit:l}=pe({db:v,collectionName:"locations",successMessage:s?"Location updated successfully":"Location created successfully",errorMessage:s?"Failed to update location":"Failed to create location",onSuccess:d=>{t&&t(d),o.reset()}}),u=async d=>{c(!0);try{await l(d,s==null?void 0:s.id)}catch(g){console.error("Error submitting location form:",g)}finally{c(!1)}};return e.jsx(oe,{...o,children:e.jsxs("form",{onSubmit:o.handleSubmit(u),className:"space-y-4",children:[e.jsx(ce,{control:o.control,name:"name",render:({field:d})=>e.jsxs(le,{children:[e.jsx(de,{children:"Location Name"}),e.jsx(ue,{children:e.jsx(me,{placeholder:"Enter location name",...d})}),e.jsx(he,{})]})}),e.jsxs("div",{className:"flex justify-end space-x-2 pt-4",children:[r&&e.jsx(x,{type:"button",variant:"outline",onClick:r,disabled:a,children:"Cancel"}),e.jsx(x,{type:"submit",disabled:a,children:a?"Saving...":s?"Update Location":"Create Location"})]})]})})}const As=()=>[{title:"Settings - AAFairShare"},{name:"description",content:"Manage your AAFairShare settings"}];function Ds(){const{currentUser:s,loading:t}=Be(),r=ze(),{toast:a}=M(),[c,o]=n.useState([]),[l,u]=n.useState(!0),[d,g]=n.useState([]),[h,m]=n.useState(!0),[p,Ie]=n.useState("categories"),[ke,y]=n.useState(!1),[Me,C]=n.useState(!1),[_,$]=n.useState(void 0),[O,V]=n.useState(void 0),[Re,S]=n.useState(!1),[f,w]=n.useState(null);n.useEffect(()=>{!t&&!s&&r("/login")},[s,t,r]),n.useEffect(()=>{if(!s)return;u(!0);const i=G(v,"categories"),A=q(i,z("name")),D=B(A,j=>{const L=j.docs.map(N=>({id:N.id,...N.data()}));o(L),u(!1)},j=>{console.error("Error fetching categories:",j),a({title:"Error",description:"Could not load categories.",variant:"destructive"}),u(!1)});return()=>D()},[s,a]),n.useEffect(()=>{if(!s)return;m(!0);const i=G(v,"locations"),A=q(i,z("name")),D=B(A,j=>{const L=j.docs.map(N=>({id:N.id,...N.data()}));g(L),m(!1)},j=>{console.error("Error fetching locations:",j),a({title:"Error",description:"Could not load locations.",variant:"destructive"}),m(!1)});return()=>D()},[s,a]);const Pe=()=>{$(void 0),y(!0)},_e=i=>{$(i),y(!0)},$e=i=>{w({id:i,type:"category"}),S(!0)},Oe=()=>{V(void 0),C(!0)},Ve=i=>{V(i),C(!0)},Ge=i=>{w({id:i,type:"location"}),S(!0)},qe=async()=>{if(f)try{f.type==="category"?(await H(K(v,"categories",f.id)),a({title:"Category Deleted",description:"The category has been successfully deleted."})):(await H(K(v,"locations",f.id)),a({title:"Location Deleted",description:"The location has been successfully deleted."}))}catch(i){console.error(`Error deleting ${f.type}:`,i),a({title:"Error",description:`Failed to delete ${f.type}. Please try again.`,variant:"destructive"})}finally{S(!1),w(null)}};return t?e.jsx("div",{className:"flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900",children:e.jsxs("div",{className:"text-center space-y-4",children:[e.jsx("div",{className:"inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("h2",{className:"text-lg font-medium text-gray-900 dark:text-gray-100",children:"Loading..."})]})}):e.jsx(He,{children:e.jsxs("div",{className:"space-y-6",children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Settings"}),e.jsxs(ds,{value:p,onValueChange:Ie,children:[e.jsxs(Fe,{className:"grid w-full grid-cols-2 mb-6",children:[e.jsx(F,{value:"categories",children:"Categories"}),e.jsx(F,{value:"locations",children:"Locations"})]}),e.jsx(I,{value:"categories",children:e.jsxs(U,{className:"border-gray-200",children:[e.jsxs(J,{className:"flex flex-row items-center justify-between",children:[e.jsxs("div",{children:[e.jsx(Q,{children:"Categories"}),e.jsx(W,{children:"Manage expense categories"})]}),e.jsxs(x,{onClick:Pe,children:[e.jsx(te,{className:"h-4 w-4 mr-2"}),"Add Category"]})]}),e.jsx(X,{children:l?e.jsxs("div",{className:"space-y-4",children:[e.jsx(b,{className:"h-10 w-full"}),e.jsx(b,{className:"h-10 w-full"}),e.jsx(b,{className:"h-10 w-full"})]}):c.length===0?e.jsx("div",{className:"text-center py-8",children:e.jsx("p",{className:"text-gray-500",children:"No categories found. Add your first category."})}):e.jsx("div",{className:"space-y-2",children:c.map(i=>e.jsxs("div",{className:"flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md",children:[e.jsx("span",{className:"font-medium",children:i.name}),e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsxs(x,{variant:"ghost",size:"sm",onClick:()=>_e(i),className:"h-8 w-8 p-0",children:[e.jsx(ne,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Edit"})]}),e.jsxs(x,{variant:"ghost",size:"sm",onClick:()=>$e(i.id),className:"h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50",children:[e.jsx(Y,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Delete"})]})]})]},i.id))})})]})}),e.jsx(I,{value:"locations",children:e.jsxs(U,{className:"border-gray-200",children:[e.jsxs(J,{className:"flex flex-row items-center justify-between",children:[e.jsxs("div",{children:[e.jsx(Q,{children:"Locations"}),e.jsx(W,{children:"Manage expense locations"})]}),e.jsxs(x,{onClick:Oe,children:[e.jsx(te,{className:"h-4 w-4 mr-2"}),"Add Location"]})]}),e.jsx(X,{children:h?e.jsxs("div",{className:"space-y-4",children:[e.jsx(b,{className:"h-10 w-full"}),e.jsx(b,{className:"h-10 w-full"}),e.jsx(b,{className:"h-10 w-full"})]}):d.length===0?e.jsx("div",{className:"text-center py-8",children:e.jsx("p",{className:"text-gray-500",children:"No locations found. Add your first location."})}):e.jsx("div",{className:"space-y-2",children:d.map(i=>e.jsxs("div",{className:"flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md",children:[e.jsx("span",{className:"font-medium",children:i.name}),e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsxs(x,{variant:"ghost",size:"sm",onClick:()=>Ve(i),className:"h-8 w-8 p-0",children:[e.jsx(ne,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Edit"})]}),e.jsxs(x,{variant:"ghost",size:"sm",onClick:()=>Ge(i.id),className:"h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50",children:[e.jsx(Y,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Delete"})]})]})]},i.id))})})]})})]}),e.jsx(Z,{open:ke,onOpenChange:y,children:e.jsxs(ee,{children:[e.jsx(se,{children:e.jsx(ae,{children:_?"Edit Category":"Add Category"})}),e.jsx(ms,{category:_,onSuccess:()=>y(!1),onCancel:()=>y(!1)})]})}),e.jsx(Z,{open:Me,onOpenChange:C,children:e.jsxs(ee,{children:[e.jsx(se,{children:e.jsx(ae,{children:O?"Edit Location":"Add Location"})}),e.jsx(gs,{location:O,onSuccess:()=>C(!1),onCancel:()=>C(!1)})]})}),e.jsx(Ze,{open:Re,onOpenChange:S,children:e.jsxs(es,{children:[e.jsxs(ss,{children:[e.jsx(as,{children:"Are you sure?"}),e.jsxs(ts,{children:["This will permanently delete this ",f==null?void 0:f.type,". This action cannot be undone."]})]}),e.jsxs(ns,{children:[e.jsx(rs,{children:"Cancel"}),e.jsx(is,{onClick:qe,className:"bg-red-600 hover:bg-red-700",children:"Delete"})]})]})})]})})}export{Ds as default,As as meta};
