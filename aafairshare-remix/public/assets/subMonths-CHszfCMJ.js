import{B as c,A as u}from"./utils-Cd1bfJmN.js";function h(r,t,e){const n=c(r,e==null?void 0:e.in);if(isNaN(t))return u(r,NaN);if(!t)return n;const a=n.getDate(),s=u(r,n.getTime());s.setMonth(n.getMonth()+t+1,0);const f=s.getDate();return a>=f?s:(n.setFullYear(s.getFullYear(),s.getMonth(),a),n)}function d(r,t){const e=c(r,t==null?void 0:t.in);return e.setDate(1),e.setHours(0,0,0,0),e}function g(r,t,e){return h(r,-t,e)}export{d as a,h as b,g as s};
