import{r as o,j as e,e as je}from"./index-DoqKjbA4.js";import{u as ce,a as pe}from"./AuthContext-9Et84TKK.js";import{R as ge,M as ve}from"./MainLayout-DfzSb1s3.js";import{B as F,C as G,a as W,b as $,c as J}from"./card-CZH78Q96.js";import{T as be,D as Ne,a as De,b as we,c as Ce,d as Se}from"./dialog-BlsaDQQP.js";import{u as ke,F as Ae,a as j,b as p,c as g,d as v,I as Ie,e as w,s as Re,o as Fe,f as Te,g as ee,h as te,i as V,P as qe,A as Le,j as Be,k as Pe,l as Ue,m as Oe,n as Me,p as Qe,q as _e,r as ze}from"./alert-dialog-D8V-m_Je.js";import{c as de,G as K,p as se,_ as R,j as y,l as ae,o as me,k as Z,a as He,y as Ve,q as X,R as U,x as Y,m as O}from"./utils-Cd1bfJmN.js";import{S as re,a as ne,b as oe,c as ie,d as C,C as Ye,e as Ge,D as le}from"./CategoryIcons-4Cs_bdfa.js";import{f as We}from"./formatting-ePblosWU.js";import{i as $e}from"./x-DiYCQYTF.js";import{C as Je}from"./react-datepicker-Bul12Z6_.js";import"./components-kNVLUHIP.js";import"./index-BdOzmHf3.js";import"./chartColors-879all_U.js";import"./constants-CQ8gJ5jU.js";import"./subMonths-CHszfCMJ.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],Xe=$e("circle-alert",Ke),xe=o.forwardRef(({className:t,...i},d)=>e.jsx("textarea",{className:de("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",t),ref:d,...i}));xe.displayName="Textarea";const Ze=Fe({amount:V().min(1,"Amount is required").refine(t=>!isNaN(parseFloat(t))&&parseFloat(t)>0,{message:"Amount must be a positive number"}),description:V().optional(),categoryId:V().min(1,"Category is required"),locationId:V().min(1,"Location is required"),splitType:ee(["50/50","100%"]),startDate:te({required_error:"Start date is required"}),endDate:te().optional().nullable(),frequency:ee(["daily","weekly","biweekly","monthly","quarterly","yearly"]),isActive:Te().default(!0)});function Ee({recurringExpense:t,categories:i,locations:d,users:S,currentUserId:m,onSuccess:x,onCancel:n}){const[b,k]=o.useState(!1),[L,M]=o.useState(""),{toast:l}=ce(),a=o.useRef(null),T=[...d].sort((s,u)=>s.name.localeCompare(u.name)).map(s=>({value:s.id,label:s.name})),r=ke({resolver:Re(Ze),defaultValues:{amount:t?String(t.amount):"",description:(t==null?void 0:t.description)||"",categoryId:(t==null?void 0:t.categoryId)||"",locationId:(t==null?void 0:t.locationId)||"",splitType:(t==null?void 0:t.splitType)||"50/50",startDate:t!=null&&t.startDate?new Date(t.startDate):new Date,endDate:t!=null&&t.endDate?new Date(t.endDate):null,frequency:(t==null?void 0:t.frequency)||"monthly",isActive:(t==null?void 0:t.isActive)??!0},mode:"onSubmit",reValidateMode:"onBlur"}),f=async s=>{try{const u={name:s,createdAt:K(),createdBy:m},N=await se(R(y,"locations"),u);return r.setValue("locationId",N.id),l({title:"Location Added",description:`${s} has been added as a new location.`}),N.id}catch(u){console.error("Error creating location:",u),l({title:"Error",description:"Failed to create new location. Please try again.",variant:"destructive"})}},q=async s=>{k(!0);try{const N={amount:parseFloat(s.amount),description:s.description||"",categoryId:s.categoryId,locationId:s.locationId,splitType:s.splitType,startDate:ae.fromDate(s.startDate),endDate:s.endDate?ae.fromDate(s.endDate):null,frequency:s.frequency,isActive:s.isActive,paidByUserId:m,title:s.description||"Recurring Expense",...t!=null&&t.id?{updatedAt:K()}:{createdAt:K()}};if(t!=null&&t.id)await me(Z(y,"recurringExpenses",t.id),N),l({title:"Recurring expense updated"});else{const Q=await se(R(y,"recurringExpenses"),N);l({title:"Recurring expense added"})}x&&x(N),r.reset()}catch(u){console.error("Error submitting recurring expense form:",u),l({title:"Error",description:"Failed to save recurring expense. Please try again.",variant:"destructive"})}finally{k(!1)}};return e.jsx(Ae,{...r,children:e.jsxs("form",{ref:a,onSubmit:r.handleSubmit(q),className:"space-y-6 p-4 max-w-3xl mx-auto",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsx(j,{control:r.control,name:"amount",render:({field:s})=>e.jsxs(p,{className:"flex flex-col",children:[e.jsx(g,{children:"Amount (£)"}),e.jsx(v,{children:e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",children:e.jsx("span",{className:"text-gray-500 dark:text-gray-400 sm:text-sm",children:"£"})}),e.jsx(Ie,{placeholder:"0.00",...s,type:"number",step:"0.01",min:"0",inputMode:"decimal",className:"pl-7 h-12 text-base"})]})}),e.jsx(w,{})]})}),e.jsx(j,{control:r.control,name:"frequency",render:({field:s})=>e.jsxs(p,{children:[e.jsx(g,{children:"Frequency"}),e.jsxs(re,{onValueChange:s.onChange,defaultValue:s.value,children:[e.jsx(v,{children:e.jsx(ne,{children:e.jsx(oe,{placeholder:"Select frequency"})})}),e.jsxs(ie,{children:[e.jsx(C,{value:"daily",children:"Daily"}),e.jsx(C,{value:"weekly",children:"Weekly"}),e.jsx(C,{value:"biweekly",children:"Bi-weekly"}),e.jsx(C,{value:"monthly",children:"Monthly"}),e.jsx(C,{value:"quarterly",children:"Quarterly"}),e.jsx(C,{value:"yearly",children:"Yearly"})]})]}),e.jsx(w,{})]})})]}),e.jsx(j,{control:r.control,name:"categoryId",render:({field:s})=>e.jsxs(p,{className:"flex flex-col",children:[e.jsx(g,{children:"Category"}),e.jsx(v,{children:e.jsx(Ye,{categories:i,selectedCategoryId:s.value,onSelectCategory:s.onChange})}),e.jsx(w,{})]})}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsx(j,{control:r.control,name:"locationId",render:({field:s})=>e.jsxs(p,{className:"flex flex-col",children:[e.jsx(g,{children:"Location"}),e.jsx(v,{children:e.jsx(Ge,{options:T,value:s.value,onChange:s.onChange,placeholder:"Select a location",emptyText:"No locations found",onCreateNew:f})}),e.jsx(w,{})]})}),e.jsx(j,{control:r.control,name:"splitType",render:({field:s})=>e.jsxs(p,{className:"flex flex-col",children:[e.jsx(g,{children:"Split Type"}),e.jsxs(re,{onValueChange:s.onChange,defaultValue:s.value,children:[e.jsx(v,{children:e.jsx(ne,{children:e.jsx(oe,{placeholder:"Select split type"})})}),e.jsxs(ie,{children:[e.jsx(C,{value:"50/50",children:"50/50 Split"}),e.jsx(C,{value:"100%",children:"100% (Not Split)"})]})]}),e.jsx(w,{})]})})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsx(j,{control:r.control,name:"startDate",render:({field:s})=>e.jsxs(p,{className:"flex flex-col",children:[e.jsx(g,{children:"Start Date"}),e.jsx(v,{children:e.jsx(le,{value:s.value,onChange:s.onChange,className:"h-12 text-base w-full"})}),e.jsx(w,{})]})}),e.jsx(j,{control:r.control,name:"endDate",render:({field:s})=>e.jsxs(p,{className:"flex flex-col",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(g,{children:"End Date (Optional)"}),s.value&&e.jsx(F,{type:"button",variant:"ghost",size:"sm",onClick:()=>s.onChange(null),className:"h-8 text-xs",children:"Clear"})]}),e.jsx(v,{children:e.jsx(le,{value:s.value||void 0,onChange:s.onChange,className:"h-12 text-base w-full",minDate:r.getValues().startDate})}),e.jsx(w,{})]})})]}),e.jsx(j,{control:r.control,name:"isActive",render:({field:s})=>e.jsxs(p,{className:"flex flex-row items-center space-x-3 space-y-0",children:[e.jsx(v,{children:e.jsx("input",{type:"checkbox",checked:s.value,onChange:s.onChange,className:"h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:bg-gray-800"})}),e.jsx(g,{children:"Active"})]})}),e.jsx(j,{control:r.control,name:"description",render:({field:s})=>e.jsxs(p,{className:"flex flex-col",children:[e.jsx(g,{children:"Description (Optional)"}),e.jsx(v,{children:e.jsx(xe,{placeholder:"Enter description",className:"min-h-[80px]",...s})}),e.jsx(w,{})]})}),e.jsxs("div",{className:"flex justify-end space-x-2 pt-4",children:[n&&e.jsx(F,{type:"button",variant:"outline",onClick:n,disabled:b,children:"Cancel"}),e.jsx(F,{type:"submit",disabled:b,children:b?"Saving...":t?"Update Expense":"Create Expense"})]})]})})}const et=He("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",{variants:{variant:{default:"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",secondary:"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",destructive:"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",outline:"text-foreground"}},defaultVariants:{variant:"default"}});function I({className:t,variant:i,...d}){return e.jsx("div",{className:de(et({variant:i}),t),...d})}function tt({recurringExpenses:t,onEdit:i,isLoading:d}){const{toast:S}=ce(),[m,x]=o.useState(!1),[n,b]=o.useState(null),k=async()=>{if(n)try{await Ve(Z(y,"recurringExpenses",n.id)),S({title:"Success",description:"Recurring expense deleted successfully"})}catch(a){console.error("Error deleting recurring expense:",a),S({title:"Error",description:"Failed to delete recurring expense",variant:"destructive"})}finally{x(!1),b(null)}},L=async a=>{try{await me(Z(y,"recurringExpenses",a.id),{isActive:!a.isActive}),S({title:"Success",description:`Recurring expense ${a.isActive?"deactivated":"activated"} successfully`})}catch(h){console.error("Error updating recurring expense:",h),S({title:"Error",description:"Failed to update recurring expense",variant:"destructive"})}},M=a=>{switch(a){case"daily":return"Daily";case"weekly":return"Weekly";case"biweekly":return"Bi-weekly";case"monthly":return"Monthly";case"quarterly":return"Quarterly";case"yearly":return"Yearly";default:return a}},l=a=>{if(!a)return"Not set";try{return a&&typeof a=="object"&&"seconds"in a?X(new Date(a.seconds*1e3),"PP"):a instanceof Date?X(a,"PP"):X(new Date(a),"PP")}catch(h){return console.error("Error formatting date:",h,a),"Invalid date"}};return d?e.jsxs(G,{className:"border-gray-200",children:[e.jsx(W,{children:e.jsx($,{children:"Recurring Expenses"})}),e.jsx(J,{children:e.jsxs("div",{className:"flex items-center justify-center p-6",children:[e.jsx(ge,{className:"h-6 w-6 animate-spin text-primary"}),e.jsx("span",{className:"ml-2",children:"Loading recurring expenses..."})]})})]}):t.length===0?e.jsxs(G,{className:"border-gray-200",children:[e.jsx(W,{children:e.jsx($,{children:"Recurring Expenses"})}),e.jsx(J,{children:e.jsxs("div",{className:"flex flex-col items-center justify-center p-6 text-center",children:[e.jsx(Xe,{className:"h-10 w-10 text-muted-foreground mb-2"}),e.jsx("h3",{className:"text-lg font-medium",children:"No recurring expenses"}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1 mb-4",children:"You haven't set up any recurring expenses yet."})]})})]}):e.jsxs(e.Fragment,{children:[e.jsxs(G,{className:"border-gray-200",children:[e.jsx(W,{children:e.jsx($,{children:"Recurring Expenses"})}),e.jsx(J,{children:e.jsx("div",{className:"space-y-4",children:t.map(a=>{var h,T,r,f,q;return e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg",children:[e.jsxs("div",{className:"flex-1 space-y-2 mb-3 md:mb-0",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx("h3",{className:"text-lg font-medium",children:a.title||a.description||"Recurring Expense"}),e.jsx(I,{variant:a.isActive?"default":"outline",className:"ml-2",children:a.isActive?"Active":"Inactive"})]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:a.description||"No description"}),e.jsxs("div",{className:"flex flex-wrap gap-2 mt-2",children:[e.jsx(I,{variant:"secondary",className:"text-xs",children:We(a.amount)}),e.jsx(I,{variant:"secondary",className:"text-xs",children:M(a.frequency)}),e.jsx(I,{variant:"secondary",className:"text-xs",children:((h=a.category)==null?void 0:h.name)||"Unknown Category"}),e.jsx(I,{variant:"secondary",className:"text-xs",children:((T=a.location)==null?void 0:T.name)||"Unknown Location"}),e.jsxs(I,{variant:"secondary",className:"text-xs",children:["Paid by: ",((r=a.paidByUser)==null?void 0:r.username)||((q=(f=a.paidByUser)==null?void 0:f.email)==null?void 0:q.split("@")[0])||"Unknown"]}),e.jsxs(I,{variant:"secondary",className:"text-xs",children:["Split: ",a.splitType]})]}),e.jsxs("div",{className:"flex items-center text-xs text-muted-foreground mt-1",children:[e.jsx(Je,{className:"h-3 w-3 mr-1"}),e.jsxs("span",{children:["Starts: ",l(a.startDate),a.endDate&&e.jsxs(e.Fragment,{children:[" • Ends: ",l(a.endDate)]})]})]})]}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsx(F,{variant:"outline",size:"sm",onClick:()=>L(a),children:a.isActive?"Deactivate":"Activate"}),e.jsxs(F,{variant:"outline",size:"icon",onClick:()=>i(a),children:[e.jsx(qe,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Edit"})]}),e.jsxs(F,{variant:"outline",size:"icon",className:"text-destructive",onClick:()=>{b(a),x(!0)},children:[e.jsx(be,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Delete"})]})]})]},a.id)})})})]}),e.jsx(Le,{open:m,onOpenChange:x,children:e.jsxs(Be,{children:[e.jsxs(Pe,{children:[e.jsx(Ue,{children:"Are you sure?"}),e.jsxs(Oe,{children:['This will permanently delete the recurring expense "',(n==null?void 0:n.title)||(n==null?void 0:n.description)||"Recurring Expense",'". This action cannot be undone.']})]}),e.jsxs(Me,{children:[e.jsx(Qe,{children:"Cancel"}),e.jsx(_e,{onClick:k,className:"bg-destructive text-destructive-foreground",children:"Delete"})]})]})})]})}function vt(){const{currentUser:t,loading:i}=pe(),d=je(),[S,m]=o.useState(!1),[x,n]=o.useState(null),[b,k]=o.useState([]),[L,M]=o.useState([]),[l,a]=o.useState([]),[h,T]=o.useState([]),[r,f]=o.useState(!0);o.useEffect(()=>{!i&&!t&&d("/login")},[t,i,d]),o.useEffect(()=>{if(!t)return;(async()=>{f(!0);try{const A=U(R(y,"categories"),Y("name")),_=(await O(A)).docs.map(c=>({id:c.id,...c.data()}));M(_);const z=U(R(y,"locations"),Y("name")),D=(await O(z)).docs.map(c=>({id:c.id,...c.data()}));a(D);const ue=U(R(y,"users")),E=(await O(ue)).docs.map(c=>({id:c.id,...c.data()}));T(E);const ye=U(R(y,"recurringExpenses"),Y("startDate","desc")),fe=(await O(ye)).docs.map(c=>{const H=c.data();return{id:c.id,...H,category:_.find(P=>P.id===H.categoryId),location:D.find(P=>P.id===H.locationId),paidByUser:E.find(P=>P.id===H.paidByUserId)}});k(fe)}catch(A){console.error("Error fetching data:",A)}finally{f(!1)}})()},[t]);const q=()=>{n(null),m(!0)},s=Q=>{n(Q),m(!0)},u=()=>{m(!1),n(null)},N=()=>{m(!1),n(null),t&&(async()=>{f(!0);try{const A=U(R(y,"recurringExpenses"),Y("startDate","desc")),_=(await O(A)).docs.map(z=>{const B=z.data();return{id:z.id,...B,category:L.find(D=>D.id===B.categoryId),location:l.find(D=>D.id===B.locationId),paidByUser:h.find(D=>D.id===B.paidByUserId)}});k(_)}catch(A){console.error("Error fetching data:",A)}finally{f(!1)}})()};return i?e.jsx("div",{className:"flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900",children:e.jsxs("div",{className:"text-center space-y-4",children:[e.jsx("div",{className:"inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"}),e.jsx("h2",{className:"text-lg font-medium text-gray-900 dark:text-gray-100",children:"Loading..."})]})}):e.jsx(ve,{children:e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900 dark:text-white",children:"Recurring Expenses"}),e.jsxs(F,{onClick:q,children:[e.jsx(ze,{className:"h-4 w-4 mr-2"}),"Add Recurring Expense"]})]}),e.jsx(tt,{recurringExpenses:b,onEdit:s,isLoading:r}),e.jsx(Ne,{open:S,onOpenChange:m,children:e.jsxs(De,{className:"sm:max-w-[600px]",children:[e.jsxs(we,{children:[e.jsx(Ce,{children:x?"Edit Recurring Expense":"Add Recurring Expense"}),e.jsx(Se,{children:x?"Update the recurring expense details below.":"Enter the recurring expense details below."})]}),e.jsx(Ee,{recurringExpense:x||void 0,categories:L,locations:l,users:h,currentUserId:(t==null?void 0:t.uid)||"",onSuccess:N,onCancel:u})]})})]})})}export{vt as default};
