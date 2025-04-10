import{E as R,m as y,c as v,a as E,r as o,b as C,j as l}from"./index-DoqKjbA4.js";import{i as b,d as M,c as S,s as F,g as k,a as H,b as j,u as P,R as D,e as T,f as z,r as L}from"./components-kNVLUHIP.js";/**
 * @remix-run/react v2.16.5
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function B(e){if(!e)return null;let t=Object.entries(e),s={};for(let[i,r]of t)if(r&&r.__type==="RouteErrorResponse")s[i]=new R(r.status,r.statusText,r.data,r.internal===!0);else if(r&&r.__type==="Error"){if(r.__subType){let n=window[r.__subType];if(typeof n=="function")try{let d=new n(r.message);d.stack=r.stack,s[i]=d}catch{}}if(s[i]==null){let n=new Error(r.message);n.stack=r.stack,s[i]=n}}else s[i]=r;return s}/**
 * @remix-run/react v2.16.5
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let u,a,p=!1,h;new Promise(e=>{h=e}).catch(()=>{});function O(e){if(!a){if(window.__remixContext.future.v3_singleFetch){if(!u){let c=window.__remixContext.stream;b(c,"No stream found for single fetch decoding"),window.__remixContext.stream=void 0,u=M(c,window).then(w=>{window.__remixContext.state=w.value,u.value=!0}).catch(w=>{u.error=w})}if(u.error)throw u.error;if(!u.value)throw u}let n=S(window.__remixManifest.routes,window.__remixRouteModules,window.__remixContext.state,window.__remixContext.future,window.__remixContext.isSpaMode),d;if(!window.__remixContext.isSpaMode){d={...window.__remixContext.state,loaderData:{...window.__remixContext.state.loaderData}};let c=y(n,window.location,window.__remixContext.basename);if(c)for(let w of c){let f=w.route.id,_=window.__remixRouteModules[f],m=window.__remixManifest.routes[f];_&&F(m,_,window.__remixContext.isSpaMode)&&(_.HydrateFallback||!m.hasLoader)?d.loaderData[f]=void 0:m&&!m.hasLoader&&(d.loaderData[f]=null)}d&&d.errors&&(d.errors=B(d.errors))}a=v({routes:n,history:E(),basename:window.__remixContext.basename,future:{v7_normalizeFormMethod:!0,v7_fetcherPersist:window.__remixContext.future.v3_fetcherPersist,v7_partialHydration:!0,v7_prependBasename:!0,v7_relativeSplatPath:window.__remixContext.future.v3_relativeSplatPath,v7_skipActionErrorRevalidation:window.__remixContext.future.v3_singleFetch===!0},hydrationData:d,mapRouteProperties:C,dataStrategy:window.__remixContext.future.v3_singleFetch&&!window.__remixContext.isSpaMode?H(window.__remixManifest,window.__remixRouteModules,()=>a):void 0,patchRoutesOnNavigation:k(window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode,window.__remixContext.basename)}),a.state.initialized&&(p=!0,a.initialize()),a.createRoutesForHMR=j,window.__remixRouter=a,h&&h(a)}let[t,s]=o.useState(void 0),[i,r]=o.useState(a.state.location);return o.useLayoutEffect(()=>{p||(p=!0,a.initialize())},[]),o.useLayoutEffect(()=>a.subscribe(n=>{n.location!==i&&r(n.location)}),[i]),P(a,window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode),o.createElement(o.Fragment,null,o.createElement(D.Provider,{value:{manifest:window.__remixManifest,routeModules:window.__remixRouteModules,future:window.__remixContext.future,criticalCss:t,isSpaMode:window.__remixContext.isSpaMode}},o.createElement(T,{location:i},o.createElement(z,{router:a,fallbackElement:null,future:{v7_startTransition:!0}}))),window.__remixContext.future.v3_singleFetch?o.createElement(o.Fragment,null):null)}var x={},g;function I(){if(g)return x;g=1;var e=L();return x.createRoot=e.createRoot,x.hydrateRoot=e.hydrateRoot,x}var q=I();function A({children:e}){const[t,s]=o.useState(!1),[i,r]=o.useState(null);if(o.useEffect(()=>{t&&i&&typeof window<"u"&&window.handleReactError&&window.handleReactError(i)},[t,i]),t)return l.jsxs("div",{style:{padding:"20px",margin:"20px",border:"1px solid red",borderRadius:"5px",backgroundColor:"#fff8f8"},children:[l.jsx("h2",{children:"Something went wrong"}),l.jsx("p",{children:"An error occurred while loading the application."}),i&&l.jsx("pre",{style:{whiteSpace:"pre-wrap",overflow:"auto",maxHeight:"200px",padding:"10px",backgroundColor:"#f5f5f5"},children:i.message})]});try{return l.jsx(l.Fragment,{children:e})}catch(n){return r(n instanceof Error?n:new Error(String(n))),s(!0),null}}typeof window<"u"&&!window.handleReactError&&(window.handleReactError=e=>{console.error("React Error Handler:",e);const t=document.getElementById("root-error-messages")||document.createElement("div");t.id||(t.id="root-error-messages",t.style.padding="20px",t.style.margin="20px",t.style.border="1px solid red",t.style.borderRadius="5px",t.style.backgroundColor="#fff8f8",document.body.appendChild(t));const s=document.createElement("div");s.innerHTML=`
      <h3 style="margin-top: 10px; color: red;">Error:</h3>
      <pre style="white-space: pre-wrap; overflow: auto; max-height: 200px; padding: 10px; background-color: #f5f5f5;">
        ${e.message}
        ${e.stack||""}
      </pre>
    `,t.appendChild(s)});function N(){return l.jsx(A,{children:l.jsx(O,{})})}try{console.log("Starting hydration..."),o.startTransition(()=>{try{q.hydrateRoot(document,l.jsx(o.StrictMode,{children:l.jsx(N,{})})),console.log("Hydration complete")}catch(e){console.error("Hydration error:",e),typeof window<"u"&&window.handleReactError&&window.handleReactError(e instanceof Error?e:new Error(String(e))),document.body.innerHTML=`
        <div style="padding: 20px; margin: 20px; border: 1px solid red; border-radius: 5px; background-color: #fff8f8;">
          <h2>Failed to load application</h2>
          <p>There was an error loading the application. Please try refreshing the page.</p>
          <pre style="white-space: pre-wrap; overflow: auto; max-height: 200px; padding: 10px; background-color: #f5f5f5;">
            ${e instanceof Error?e.message:String(e)}
          </pre>
        </div>
      `}})}catch(e){console.error("Fatal error during initialization:",e),typeof window<"u"&&window.handleReactError&&window.handleReactError(e instanceof Error?e:new Error(String(e)))}
