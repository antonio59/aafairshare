import{r as S}from"./index-2nsPJFG6.js";import{u as b,G as l,g as v,c as y,p as w,_ as E}from"./AuthContext-BZOWtFPy.js";function D({db:i,collectionName:a,successMessage:m="Successfully saved",errorMessage:g="Error saving data",onSuccess:o,onError:c,transform:u}){const[h,n]=S.useState(!1),{toast:f}=b();return{submit:async(d,t)=>{n(!0);try{const e={...u?u(d):d,updatedAt:l()};let r;if(t){const p=v(i,a,t);await y(p,e),r={id:t,...e}}else r={id:(await w(E(i,a),{...e,createdAt:l()})).id,...e};return f({title:"Success",description:m}),o&&o(r),r}catch(s){throw console.error(`Error ${t?"updating":"creating"} ${a}:`,s),f({title:"Error",description:g,variant:"destructive"}),c&&c(s),s}finally{n(!1)}},isSubmitting:h}}export{D as u};
