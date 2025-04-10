import{j as e,r as t}from"./index-DoqKjbA4.js";import{B as n}from"./card-CZH78Q96.js";import{i as j,D as c,f as m,g as h,h as d}from"./MainLayout-DfzSb1s3.js";import{u as y}from"./AuthContext-9Et84TKK.js";import{b as N,i as u,t as w,c as o}from"./utils-Cd1bfJmN.js";import{i}from"./x-DiYCQYTF.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],v=i("chevron-left",g);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],k=i("download",T);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],x=i("file-text",C);function L({value:s,onChange:r,onExport:a}){const{toast:p}=y(),f=N(s),l=b=>{a?a(b):p({title:"Export not available",description:"Export functionality is not available for this view.",variant:"destructive"})};return e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsxs(n,{variant:"ghost",size:"icon",onClick:()=>r(u(s)),className:"mr-1 sm:mr-2 h-7 w-7 sm:h-9 sm:w-9 rounded-full hover:bg-gray-100",children:[e.jsx(v,{className:"h-3.5 w-3.5 sm:h-4 sm:w-4"}),e.jsx("span",{className:"sr-only",children:"Previous"})]}),e.jsx("h2",{className:"text-sm sm:text-base md:text-lg font-semibold text-gray-800",children:f}),e.jsxs(n,{variant:"ghost",size:"icon",onClick:()=>r(w(s)),className:"ml-1 sm:ml-2 h-7 w-7 sm:h-9 sm:w-9 rounded-full hover:bg-gray-100",children:[e.jsx(j,{className:"h-3.5 w-3.5 sm:h-4 sm:w-4"}),e.jsx("span",{className:"sr-only",children:"Next"})]})]}),a&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"hidden sm:flex space-x-2",children:e.jsxs(c,{children:[e.jsx(m,{asChild:!0,children:e.jsx(n,{variant:"outline",size:"sm",className:"text-gray-600 hover:text-primary border-gray-300 hover:border-primary",children:"Export"})}),e.jsxs(h,{children:[e.jsx(d,{onClick:()=>l("csv"),children:e.jsx("span",{children:"Export CSV"})}),e.jsx(d,{onClick:()=>l("pdf"),children:e.jsx("span",{children:"Export PDF"})})]})]})}),e.jsx("div",{className:"sm:hidden",children:e.jsxs(c,{children:[e.jsx(m,{asChild:!0,children:e.jsxs(n,{variant:"ghost",size:"icon",className:"h-7 w-7 rounded-full hover:bg-gray-100",children:[e.jsx(k,{className:"h-3.5 w-3.5"}),e.jsx("span",{className:"sr-only",children:"Export"})]})}),e.jsxs(h,{align:"end",className:"w-28",children:[e.jsxs(d,{onClick:()=>l("csv"),className:"text-xs py-1.5",children:[e.jsx(x,{className:"h-3 w-3 mr-1.5"}),e.jsx("span",{children:"CSV"})]}),e.jsxs(d,{onClick:()=>l("pdf"),className:"text-xs py-1.5",children:[e.jsx(x,{className:"h-3 w-3 mr-1.5"}),e.jsx("span",{children:"PDF"})]})]})]})})]})]})}const M=t.forwardRef(({className:s,...r},a)=>e.jsx("div",{className:"relative w-full overflow-auto",children:e.jsx("table",{ref:a,className:o("w-full caption-bottom text-sm",s),...r})}));M.displayName="Table";const R=t.forwardRef(({className:s,...r},a)=>e.jsx("thead",{ref:a,className:o("[&_tr]:border-b [&_tr]:border-gray-200",s),...r}));R.displayName="TableHeader";const _=t.forwardRef(({className:s,...r},a)=>e.jsx("tbody",{ref:a,className:o("[&_tr:last-child]:border-0 [&_tr]:border-gray-200",s),...r}));_.displayName="TableBody";const D=t.forwardRef(({className:s,...r},a)=>e.jsx("tfoot",{ref:a,className:o("border-t border-gray-200 bg-muted/50 font-medium [&>tr]:last:border-b-0",s),...r}));D.displayName="TableFooter";const H=t.forwardRef(({className:s,...r},a)=>e.jsx("tr",{ref:a,className:o("border-b border-gray-200 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",s),...r}));H.displayName="TableRow";const E=t.forwardRef(({className:s,...r},a)=>e.jsx("th",{ref:a,className:o("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",s),...r}));E.displayName="TableHead";const z=t.forwardRef(({className:s,...r},a)=>e.jsx("td",{ref:a,className:o("p-4 align-middle [&:has([role=checkbox])]:pr-0",s),...r}));z.displayName="TableCell";const F=t.forwardRef(({className:s,...r},a)=>e.jsx("caption",{ref:a,className:o("mt-4 text-sm text-muted-foreground",s),...r}));F.displayName="TableCaption";export{k as D,L as M,M as T,R as a,H as b,E as c,_ as d,z as e};
