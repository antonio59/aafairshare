import{r as a,j as e}from"./index-DoqKjbA4.js";import{C as j,D as y}from"./react-datepicker-Bul12Z6_.js";import{c as C}from"./utils-Cd1bfJmN.js";import{B as b,C as N,a as g,b as k,c as w}from"./card-CZH78Q96.js";import{M as D}from"./MainLayout-DfzSb1s3.js";import"./x-DiYCQYTF.js";import"./components-kNVLUHIP.js";import"./subMonths-CHszfCMJ.js";import"./AuthContext-9Et84TKK.js";function v({date:s,setDate:d,className:p,placeholder:f="Pick a date",disabled:m=!1,minDate:x,maxDate:h}){const[l,r]=a.useState(!1),i=a.useRef(null);a.useEffect(()=>{function t(n){i.current&&!i.current.contains(n.target)&&r(!1)}return document.addEventListener("mousedown",t),()=>{document.removeEventListener("mousedown",t)}},[]);const u=a.forwardRef(({value:t,onClick:n},o)=>e.jsxs(b,{ref:c=>{i.current=c,typeof o=="function"?o(c):o&&(o.current=c)},onClick:()=>{r(!l),n&&n({})},variant:"outline",className:C("w-full justify-start text-left font-normal h-12 text-base border-gray-200 dark:border-gray-700",!t&&"text-muted-foreground",p),disabled:m,type:"button",children:[e.jsx(j,{className:"mr-2 h-4 w-4"}),t||e.jsx("span",{children:f})]}));return u.displayName="CustomDatePickerInput",e.jsx(y,{selected:s,onChange:t=>{d(t||void 0),r(!1)},onClickOutside:()=>r(!1),open:l,customInput:e.jsx(u,{}),dateFormat:"MMMM d, yyyy",minDate:x,maxDate:h,disabled:m,calendarClassName:"bg-background border border-gray-200 dark:border-gray-700 rounded-md shadow-md",wrapperClassName:"w-full",popperClassName:"z-50",popperPlacement:"bottom",shouldCloseOnSelect:!0,popperModifiers:[{name:"preventOverflow",options:{boundary:typeof document<"u"?document.body:null,padding:20}},{name:"offset",options:{offset:[0,8]}}]})}function B(){const[s,d]=a.useState(new Date);return e.jsx(D,{children:e.jsx("div",{className:"container mx-auto py-8",children:e.jsxs(N,{className:"max-w-md mx-auto",children:[e.jsx(g,{children:e.jsx(k,{children:"Date Picker Test"})}),e.jsxs(w,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-medium mb-2",children:"New Date Picker"}),e.jsx(v,{date:s,setDate:d})]}),e.jsxs("div",{className:"pt-4",children:[e.jsx("h3",{className:"text-lg font-medium mb-2",children:"Selected Date:"}),e.jsx("p",{children:s?s.toLocaleDateString():"No date selected"})]})]})]})})})}export{B as default};
