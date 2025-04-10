var Ev=Object.defineProperty;var Tv=(n,e,t)=>e in n?Ev(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var S=(n,e,t)=>Tv(n,typeof e!="symbol"?e+"":e,t);import{r as Xe,j as qo}from"./index-DKmAOi_X.js";var Yh={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fm=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},kv=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],o=n[t++],a=n[t++],c=((i&7)<<18|(s&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const s=n[t++],o=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},mm={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],o=i+1<n.length,a=o?n[i+1]:0,c=i+2<n.length,u=c?n[i+2]:0,l=s>>2,h=(s&3)<<4|a>>4;let d=(a&15)<<2|u>>6,f=u&63;c||(f=64,o||(d=64)),r.push(t[l],t[h],t[d],t[f])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(fm(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):kv(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],a=i<n.length?t[n.charAt(i)]:0;++i;const u=i<n.length?t[n.charAt(i)]:64;++i;const h=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||a==null||u==null||h==null)throw new Sv;const d=s<<2|a>>4;if(r.push(d),u!==64){const f=a<<4&240|u>>2;if(r.push(f),h!==64){const p=u<<6&192|h;r.push(p)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Sv extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Av=function(n){const e=fm(n);return mm.encodeByteArray(e,!0)},$o=function(n){return Av(n).replace(/\./g,"")},gm=function(n){try{return mm.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function zo(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!Cv(t)||(n[t]=zo(n[t],e[t]));return n}function Cv(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xv(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dv=()=>xv().__FIREBASE_DEFAULTS__,Nv=()=>{if(typeof process>"u"||typeof Yh>"u")return;const n=Yh.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Rv=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&gm(n[1]);return e&&JSON.parse(e)},Gu=()=>{try{return Dv()||Nv()||Rv()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},pm=()=>{var n;return(n=Gu())===null||n===void 0?void 0:n.config},Pv=n=>{var e;return(e=Gu())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ov{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mv(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},n);return[$o(JSON.stringify(t)),$o(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ue(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Lv(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ue())}function Wu(){var n;const e=(n=Gu())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Fv(){return typeof self=="object"&&self.self===self}function ym(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Hu(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function wm(){const n=ue();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Vv(){return!Wu()&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function us(){try{return typeof indexedDB=="object"}catch{return!1}}function Uv(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bv="FirebaseError";class De extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Bv,Object.setPrototypeOf(this,De.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,yr.prototype.create)}}class yr{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?qv(s,r):"Error",a=`${this.serviceName}: ${o} (${i}).`;return new De(i,a,r)}}function qv(n,e){return n.replace($v,(t,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const $v=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qh(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function zv(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Gc(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],o=e[i];if(Xh(s)&&Xh(o)){if(!Gc(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function Xh(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function li(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Lr(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function Gi(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function vm(n,e){const t=new jv(n,e);return t.subscribe.bind(t)}class jv{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Gv(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=yc),i.error===void 0&&(i.error=yc),i.complete===void 0&&(i.complete=yc);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Gv(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function yc(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function P(n){return n&&n._delegate?n._delegate:n}class mt{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wv{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Ov;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Kv(e))try{this.getOrInitializeService({instanceIdentifier:Bn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=Bn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Bn){return this.instances.has(e)}getOptions(e=Bn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(s);r===a&&o.resolve(i)}return i}onInit(e,t){var r;const i=this.normalizeInstanceIdentifier(t),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const o=this.instances.get(i);return o&&e(o,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Hv(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Bn){return this.component?this.component.multipleInstances?e:Bn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Hv(n){return n===Bn?void 0:n}function Kv(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yv{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Wv(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ku=[];var W;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(W||(W={}));const bm={debug:W.DEBUG,verbose:W.VERBOSE,info:W.INFO,warn:W.WARN,error:W.ERROR,silent:W.SILENT},Qv=W.INFO,Xv={[W.DEBUG]:"log",[W.VERBOSE]:"log",[W.INFO]:"info",[W.WARN]:"warn",[W.ERROR]:"error"},Jv=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=Xv[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class va{constructor(e){this.name=e,this._logLevel=Qv,this._logHandler=Jv,this._userLogHandler=null,Ku.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in W))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?bm[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,W.DEBUG,...e),this._logHandler(this,W.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,W.VERBOSE,...e),this._logHandler(this,W.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,W.INFO,...e),this._logHandler(this,W.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,W.WARN,...e),this._logHandler(this,W.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,W.ERROR,...e),this._logHandler(this,W.ERROR,...e)}}function Zv(n){Ku.forEach(e=>{e.setLogLevel(n)})}function eb(n,e){for(const t of Ku){let r=null;e&&e.level&&(r=bm[e.level]),n===null?t.userLogHandler=null:t.userLogHandler=(i,s,...o)=>{const a=o.map(c=>{if(c==null)return null;if(typeof c=="string")return c;if(typeof c=="number"||typeof c=="boolean")return c.toString();if(c instanceof Error)return c.message;try{return JSON.stringify(c)}catch{return null}}).filter(c=>c).join(" ");s>=(r??i.logLevel)&&n({level:W[s].toLowerCase(),message:a,args:o,type:i.name})}}}const tb=(n,e)=>e.some(t=>n instanceof t);let Jh,Zh;function nb(){return Jh||(Jh=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function rb(){return Zh||(Zh=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Im=new WeakMap,Wc=new WeakMap,_m=new WeakMap,wc=new WeakMap,Yu=new WeakMap;function ib(n){const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("success",s),n.removeEventListener("error",o)},s=()=>{t(gn(n.result)),i()},o=()=>{r(n.error),i()};n.addEventListener("success",s),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Im.set(t,n)}).catch(()=>{}),Yu.set(e,n),e}function sb(n){if(Wc.has(n))return;const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("complete",s),n.removeEventListener("error",o),n.removeEventListener("abort",o)},s=()=>{t(),i()},o=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",s),n.addEventListener("error",o),n.addEventListener("abort",o)});Wc.set(n,e)}let Hc={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Wc.get(n);if(e==="objectStoreNames")return n.objectStoreNames||_m.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return gn(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function ob(n){Hc=n(Hc)}function ab(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(vc(this),e,...t);return _m.set(r,e.sort?e.sort():[e]),gn(r)}:rb().includes(n)?function(...e){return n.apply(vc(this),e),gn(Im.get(this))}:function(...e){return gn(n.apply(vc(this),e))}}function cb(n){return typeof n=="function"?ab(n):(n instanceof IDBTransaction&&sb(n),tb(n,nb())?new Proxy(n,Hc):n)}function gn(n){if(n instanceof IDBRequest)return ib(n);if(wc.has(n))return wc.get(n);const e=cb(n);return e!==n&&(wc.set(n,e),Yu.set(e,n)),e}const vc=n=>Yu.get(n);function ub(n,e,{blocked:t,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(n,e),a=gn(o);return r&&o.addEventListener("upgradeneeded",c=>{r(gn(o.result),c.oldVersion,c.newVersion,gn(o.transaction),c)}),t&&o.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),a.then(c=>{s&&c.addEventListener("close",()=>s()),i&&c.addEventListener("versionchange",u=>i(u.oldVersion,u.newVersion,u))}).catch(()=>{}),a}const lb=["get","getKey","getAll","getAllKeys","count"],hb=["put","add","delete","clear"],bc=new Map;function ed(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(bc.get(e))return bc.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,i=hb.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||lb.includes(t)))return;const s=async function(o,...a){const c=this.transaction(o,i?"readwrite":"readonly");let u=c.store;return r&&(u=u.index(a.shift())),(await Promise.all([u[t](...a),i&&c.done]))[0]};return bc.set(e,s),s}ob(n=>({...n,get:(e,t,r)=>ed(e,t)||n.get(e,t,r),has:(e,t)=>!!ed(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class db{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(fb(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function fb(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Kc="@firebase/app",td="0.9.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ir=new va("@firebase/app"),mb="@firebase/app-compat",gb="@firebase/analytics-compat",pb="@firebase/analytics",yb="@firebase/app-check-compat",wb="@firebase/app-check",vb="@firebase/auth",bb="@firebase/auth-compat",Ib="@firebase/database",_b="@firebase/database-compat",Eb="@firebase/functions",Tb="@firebase/functions-compat",kb="@firebase/installations",Sb="@firebase/installations-compat",Ab="@firebase/messaging",Cb="@firebase/messaging-compat",xb="@firebase/performance",Db="@firebase/performance-compat",Nb="@firebase/remote-config",Rb="@firebase/remote-config-compat",Pb="@firebase/storage",Ob="@firebase/storage-compat",Mb="@firebase/firestore",Lb="@firebase/firestore-compat",Fb="firebase",Vb="9.23.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pn="[DEFAULT]",Ub={[Kc]:"fire-core",[mb]:"fire-core-compat",[pb]:"fire-analytics",[gb]:"fire-analytics-compat",[wb]:"fire-app-check",[yb]:"fire-app-check-compat",[vb]:"fire-auth",[bb]:"fire-auth-compat",[Ib]:"fire-rtdb",[_b]:"fire-rtdb-compat",[Eb]:"fire-fn",[Tb]:"fire-fn-compat",[kb]:"fire-iid",[Sb]:"fire-iid-compat",[Ab]:"fire-fcm",[Cb]:"fire-fcm-compat",[xb]:"fire-perf",[Db]:"fire-perf-compat",[Nb]:"fire-rc",[Rb]:"fire-rc-compat",[Pb]:"fire-gcs",[Ob]:"fire-gcs-compat",[Mb]:"fire-fst",[Lb]:"fire-fst-compat","fire-js":"fire-js",[Fb]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yn=new Map,ls=new Map;function jo(n,e){try{n.container.addComponent(e)}catch(t){ir.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Em(n,e){n.container.addOrOverwriteComponent(e)}function Kt(n){const e=n.name;if(ls.has(e))return ir.debug(`There were multiple attempts to register component ${e}.`),!1;ls.set(e,n);for(const t of yn.values())jo(t,n);return!0}function Tm(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Bb(n,e,t=pn){Tm(n,e).clearInstance(t)}function qb(){ls.clear()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $b={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}."},Wt=new yr("app","Firebase",$b);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let zb=class{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new mt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Wt.create("app-deleted",{appName:this._name})}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xn=Vb;function Qu(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:pn,automaticDataCollectionEnabled:!1},e),i=r.name;if(typeof i!="string"||!i)throw Wt.create("bad-app-name",{appName:String(i)});if(t||(t=pm()),!t)throw Wt.create("no-options");const s=yn.get(i);if(s){if(Gc(t,s.options)&&Gc(r,s.config))return s;throw Wt.create("duplicate-app",{appName:i})}const o=new Yv(i);for(const c of ls.values())o.addComponent(c);const a=new zb(t,r,o);return yn.set(i,a),a}function jb(n=pn){const e=yn.get(n);if(!e&&n===pn&&pm())return Qu();if(!e)throw Wt.create("no-app",{appName:n});return e}function Gb(){return Array.from(yn.values())}async function km(n){const e=n.name;yn.has(e)&&(yn.delete(e),await Promise.all(n.container.getProviders().map(t=>t.delete())),n.isDeleted=!0)}function ft(n,e,t){var r;let i=(r=Ub[n])!==null&&r!==void 0?r:n;t&&(i+=`-${t}`);const s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const a=[`Unable to register library "${i}" with version "${e}":`];s&&a.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&a.push("and"),o&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),ir.warn(a.join(" "));return}Kt(new mt(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}function Sm(n,e){if(n!==null&&typeof n!="function")throw Wt.create("invalid-log-argument");eb(n,e)}function Am(n){Zv(n)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wb="firebase-heartbeat-database",Hb=1,hs="firebase-heartbeat-store";let Ic=null;function Cm(){return Ic||(Ic=ub(Wb,Hb,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(hs)}}}).catch(n=>{throw Wt.create("idb-open",{originalErrorMessage:n.message})})),Ic}async function Kb(n){try{return await(await Cm()).transaction(hs).objectStore(hs).get(xm(n))}catch(e){if(e instanceof De)ir.warn(e.message);else{const t=Wt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});ir.warn(t.message)}}}async function nd(n,e){try{const r=(await Cm()).transaction(hs,"readwrite");await r.objectStore(hs).put(e,xm(n)),await r.done}catch(t){if(t instanceof De)ir.warn(t.message);else{const r=Wt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});ir.warn(r.message)}}}function xm(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yb=1024,Qb=30*24*60*60*1e3;class Xb{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Zb(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){const t=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=rd();if(this._heartbeatsCache===null&&(this._heartbeatsCache=await this._heartbeatsCachePromise),!(this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(i=>i.date===r)))return this._heartbeatsCache.heartbeats.push({date:r,agent:t}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(i=>{const s=new Date(i.date).valueOf();return Date.now()-s<=Qb}),this._storage.overwrite(this._heartbeatsCache)}async getHeartbeatsHeader(){if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache===null||this._heartbeatsCache.heartbeats.length===0)return"";const e=rd(),{heartbeatsToSend:t,unsentEntries:r}=Jb(this._heartbeatsCache.heartbeats),i=$o(JSON.stringify({version:2,heartbeats:t}));return this._heartbeatsCache.lastSentHeartbeatDate=e,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}}function rd(){return new Date().toISOString().substring(0,10)}function Jb(n,e=Yb){const t=[];let r=n.slice();for(const i of n){const s=t.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),id(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),id(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class Zb{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return us()?Uv().then(()=>!0).catch(()=>!1):!1}async read(){return await this._canUseIndexedDBPromise?await Kb(this.app)||{heartbeats:[]}:{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return nd(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return nd(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function id(n){return $o(JSON.stringify({version:2,heartbeats:n})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eI(n){Kt(new mt("platform-logger",e=>new db(e),"PRIVATE")),Kt(new mt("heartbeat",e=>new Xb(e),"PRIVATE")),ft(Kc,td,n),ft(Kc,td,"esm2017"),ft("fire-js","")}eI("");const tI=Object.freeze(Object.defineProperty({__proto__:null,FirebaseError:De,SDK_VERSION:xn,_DEFAULT_ENTRY_NAME:pn,_addComponent:jo,_addOrOverwriteComponent:Em,_apps:yn,_clearComponents:qb,_components:ls,_getProvider:Tm,_registerComponent:Kt,_removeServiceInstance:Bb,deleteApp:km,getApp:jb,getApps:Gb,initializeApp:Qu,onLog:Sm,registerVersion:ft,setLogLevel:Am},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nI{constructor(e,t){this._delegate=e,this.firebase=t,jo(e,new mt("app-compat",()=>this,"PUBLIC")),this.container=e.container}get automaticDataCollectionEnabled(){return this._delegate.automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this._delegate.automaticDataCollectionEnabled=e}get name(){return this._delegate.name}get options(){return this._delegate.options}delete(){return new Promise(e=>{this._delegate.checkDestroyed(),e()}).then(()=>(this.firebase.INTERNAL.removeApp(this.name),km(this._delegate)))}_getService(e,t=pn){var r;this._delegate.checkDestroyed();const i=this._delegate.container.getProvider(e);return!i.isInitialized()&&((r=i.getComponent())===null||r===void 0?void 0:r.instantiationMode)==="EXPLICIT"&&i.initialize(),i.getImmediate({identifier:t})}_removeServiceInstance(e,t=pn){this._delegate.container.getProvider(e).clearInstance(t)}_addComponent(e){jo(this._delegate,e)}_addOrOverwriteComponent(e){Em(this._delegate,e)}toJSON(){return{name:this.name,automaticDataCollectionEnabled:this.automaticDataCollectionEnabled,options:this.options}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rI={"no-app":"No Firebase App '{$appName}' has been created - call Firebase App.initializeApp()","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance."},sd=new yr("app-compat","Firebase",rI);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iI(n){const e={},t={__esModule:!0,initializeApp:s,app:i,registerVersion:ft,setLogLevel:Am,onLog:Sm,apps:null,SDK_VERSION:xn,INTERNAL:{registerComponent:a,removeApp:r,useAsService:c,modularAPIs:tI}};t.default=t,Object.defineProperty(t,"apps",{get:o});function r(u){delete e[u]}function i(u){if(u=u||pn,!Qh(e,u))throw sd.create("no-app",{appName:u});return e[u]}i.App=n;function s(u,l={}){const h=Qu(u,l);if(Qh(e,h.name))return e[h.name];const d=new n(h,t);return e[h.name]=d,d}function o(){return Object.keys(e).map(u=>e[u])}function a(u){const l=u.name,h=l.replace("-compat","");if(Kt(u)&&u.type==="PUBLIC"){const d=(f=i())=>{if(typeof f[h]!="function")throw sd.create("invalid-app-argument",{appName:l});return f[h]()};u.serviceProps!==void 0&&zo(d,u.serviceProps),t[h]=d,n.prototype[h]=function(...f){return this._getService.bind(this,l).apply(this,u.multipleInstances?f:[])}}return u.type==="PUBLIC"?t[h]:null}function c(u,l){return l==="serverAuth"?null:l}return t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dm(){const n=iI(nI);n.INTERNAL=Object.assign(Object.assign({},n.INTERNAL),{createFirebaseNamespace:Dm,extendNamespace:e,createSubscribe:vm,ErrorFactory:yr,deepExtend:zo});function e(t){zo(n,t)}return n}const sI=Dm();/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const od=new va("@firebase/app-compat"),oI="@firebase/app-compat",aI="0.2.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cI(n){ft(oI,aI,n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */if(Fv()&&self.firebase!==void 0){od.warn(`
    Warning: Firebase is already defined in the global scope. Please make sure
    Firebase library is only loaded once.
  `);const n=self.firebase.SDK_VERSION;n&&n.indexOf("LITE")>=0&&od.warn(`
    Warning: You are trying to load Firebase while using Firebase Performance standalone script.
    You should load Firebase Performance with this instance of Firebase to avoid loading duplicate code.
    `)}const pt=sI;cI();var uI="firebase",lI="9.23.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */pt.registerVersion(uI,lI,"app-compat");var ad=function(){return ad=Object.assign||function(e){for(var t,r=1,i=arguments.length;r<i;r++){t=arguments[r];for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(e[s]=t[s])}return e},ad.apply(this,arguments)};function Xu(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(n);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(n,r[i])&&(t[r[i]]=n[r[i]]);return t}function DR(n,e,t){if(t||arguments.length===2)for(var r=0,i=e.length,s;r<i;r++)(s||!(r in e))&&(s||(s=Array.prototype.slice.call(e,0,r)),s[r]=e[r]);return n.concat(s||Array.prototype.slice.call(e))}const Ni={FACEBOOK:"facebook.com",GITHUB:"github.com",GOOGLE:"google.com",PASSWORD:"password",TWITTER:"twitter.com"},Ar={EMAIL_SIGNIN:"EMAIL_SIGNIN",PASSWORD_RESET:"PASSWORD_RESET",RECOVER_EMAIL:"RECOVER_EMAIL",REVERT_SECOND_FACTOR_ADDITION:"REVERT_SECOND_FACTOR_ADDITION",VERIFY_AND_CHANGE_EMAIL:"VERIFY_AND_CHANGE_EMAIL",VERIFY_EMAIL:"VERIFY_EMAIL"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hI(){return{"admin-restricted-operation":"This operation is restricted to administrators only.","argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","app-not-installed":"The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.","captcha-check-failed":"The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.","code-expired":"The SMS code has expired. Please re-send the verification code to try again.","cordova-not-ready":"Cordova framework is not ready.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.","requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.","dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.","dynamic-link-not-activated":"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.","email-change-needs-verification":"Multi-factor users must always have a verified email.","email-already-in-use":"The email address is already in use by another account.","emulator-config-failed":'Auth instance has already been used to make a network call. Auth can no longer be configured to use the emulator. Try calling "connectAuthEmulator()" sooner.',"expired-action-code":"The action code has expired.","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.","internal-error":"An internal AuthError has occurred.","invalid-app-credential":"The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.","invalid-app-id":"The mobile app identifier is not registed for the current project.","invalid-user-token":"This user's credential isn't valid for this project. This can happen if the user's token has been tampered with, or if the user isn't for the project associated with this API key.","invalid-auth-event":"An internal AuthError has occurred.","invalid-verification-code":"The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure to use the verification code provided by the user.","invalid-continue-uri":"The continue URL provided in the request is invalid.","invalid-cordova-configuration":"The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.","invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-dynamic-link-domain":"The provided dynamic link domain is not configured or authorized for the current project.","invalid-email":"The email address is badly formatted.","invalid-emulator-scheme":"Emulator URL must start with a valid scheme (http:// or https://).","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-cert-hash":"The SHA-1 certificate hash provided is invalid.","invalid-credential":"The supplied auth credential is malformed or has expired.","invalid-message-payload":"The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-multi-factor-session":"The request does not contain a valid proof of first factor successful sign-in.","invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","invalid-oauth-client-id":"The OAuth client ID provided is either invalid or does not match the specified API key.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.","invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.","invalid-persistence-type":"The specified persistence type is invalid. It can only be local, session or none.","invalid-phone-number":"The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].","invalid-provider-id":"The specified provider ID is invalid.","invalid-recipient-email":"The email corresponding to this action failed to send as the provided recipient email address is invalid.","invalid-sender":"The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-verification-id":"The verification ID used to create the phone auth credential is invalid.","invalid-tenant-id":"The Auth instance's tenant ID is invalid.","login-blocked":"Login blocked by user-provided method: {$originalMessage}","missing-android-pkg-name":"An Android Package Name must be provided if the Android App is required to be installed.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","missing-app-credential":"The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.","missing-verification-code":"The phone auth credential was created with an empty SMS verification code.","missing-continue-uri":"A continue URL must be provided in the request.","missing-iframe-start":"An internal AuthError has occurred.","missing-ios-bundle-id":"An iOS Bundle ID must be provided if an App Store ID is provided.","missing-or-invalid-nonce":"The request does not contain a valid nonce. This can occur if the SHA-256 hash of the provided raw nonce does not match the hashed nonce in the ID token payload.","missing-password":"A non-empty password must be provided","missing-multi-factor-info":"No second factor identifier is provided.","missing-multi-factor-session":"The request is missing proof of first factor successful sign-in.","missing-phone-number":"To send verification codes, provide a phone number for the recipient.","missing-verification-id":"The phone auth credential was created with an empty verification ID.","app-deleted":"This instance of FirebaseApp has been deleted.","multi-factor-info-not-found":"The user does not have a second factor matching the identifier provided.","multi-factor-auth-required":"Proof of ownership of a second factor is required to complete sign-in.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.","network-request-failed":"A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal AuthError has occurred.","no-such-provider":"User was not linked to an account with the given provider.","null-user":"A null user object was provided as the argument for an operation which requires a non-null user object.","operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.","quota-exceeded":"The project's quota for this operation has been exceeded.","redirect-cancelled-by-user":"The redirect operation has been cancelled by the user before finalizing.","redirect-operation-pending":"A redirect sign-in operation is already pending.","rejected-credential":"The request contains malformed or mismatching credentials.","second-factor-already-in-use":"The second factor is already enrolled on this account.","maximum-second-factor-count-exceeded":"The maximum allowed number of second factors on a user has been exceeded.","tenant-id-mismatch":"The provided tenant ID does not match the Auth instance's tenant ID",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.","unauthorized-continue-uri":"The domain of the continue URL is not whitelisted.  Please whitelist the domain in the Firebase console.","unsupported-first-factor":"Enrolling a second factor or signing in with a multi-factor account requires sign-in with a supported first factor.","unsupported-persistence-type":"The current environment does not support the specified persistence type.","unsupported-tenant-operation":"This operation is not supported in a multi-tenant context.","unverified-email":"The operation requires a verified email.","user-cancelled":"The user did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.","user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled.","already-initialized":"initializeAuth() has already been called with different options. To avoid this error, call initializeAuth() with the same options as when it was originally called, or call getAuth() to return the already initialized instance.","missing-recaptcha-token":"The reCAPTCHA token is missing when sending request to the backend.","invalid-recaptcha-token":"The reCAPTCHA token is invalid when sending request to the backend.","invalid-recaptcha-action":"The reCAPTCHA action is invalid when sending request to the backend.","recaptcha-not-enabled":"reCAPTCHA Enterprise integration is not enabled for this project.","missing-client-type":"The reCAPTCHA client type is missing when sending request to the backend.","missing-recaptcha-version":"The reCAPTCHA version is missing when sending request to the backend.","invalid-req-type":"Invalid request parameters.","invalid-recaptcha-version":"The reCAPTCHA version is invalid when sending request to the backend."}}function Nm(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const dI=hI,fI=Nm,Rm=new yr("auth","Firebase",Nm());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Go=new va("@firebase/auth");function mI(n,...e){Go.logLevel<=W.WARN&&Go.warn(`Auth (${xn}): ${n}`,...e)}function xo(n,...e){Go.logLevel<=W.ERROR&&Go.error(`Auth (${xn}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $e(n,...e){throw Ju(n,...e)}function Be(n,...e){return Ju(n,...e)}function Pm(n,e,t){const r=Object.assign(Object.assign({},fI()),{[e]:t});return new yr("auth","Firebase",r).create(e,{appName:n.name})}function hi(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&$e(n,"argument-error"),Pm(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Ju(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Rm.create(n,...e)}function b(n,e,...t){if(!n)throw Ju(e,...t)}function xt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw xo(e),new Error(e)}function vt(n,e){n||xt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ds(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function Zu(){return cd()==="http:"||cd()==="https:"}function cd(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gI(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Zu()||ym()||"connection"in navigator)?navigator.onLine:!0}function pI(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vs{constructor(e,t){this.shortDelay=e,this.longDelay=t,vt(t>e,"Short delay should be less than long delay!"),this.isMobile=Lv()||Hu()}get(){return gI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function el(n,e){vt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Om{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;xt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;xt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;xt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wI=new Vs(3e4,6e4);function Ee(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function Se(n,e,t,r,i={}){return Mm(n,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const a=li(Object.assign({key:n.config.apiKey},o)).slice(1),c=await n._getAdditionalHeaders();return c["Content-Type"]="application/json",n.languageCode&&(c["X-Firebase-Locale"]=n.languageCode),Om.fetch()(Lm(n,n.config.apiHost,t,a),Object.assign({method:e,headers:c,referrerPolicy:"no-referrer"},s))})}async function Mm(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},yI),e);try{const i=new vI(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Wi(n,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const a=s.ok?o.errorMessage:o.error.message,[c,u]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Wi(n,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Wi(n,"email-already-in-use",o);if(c==="USER_DISABLED")throw Wi(n,"user-disabled",o);const l=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw Pm(n,l,u);$e(n,l)}}catch(i){if(i instanceof De)throw i;$e(n,"network-request-failed",{message:String(i)})}}async function Jt(n,e,t,r,i={}){const s=await Se(n,e,t,r,i);return"mfaPendingCredential"in s&&$e(n,"multi-factor-auth-required",{_serverResponse:s}),s}function Lm(n,e,t,r){const i=`${e}${t}?${r}`;return n.config.emulator?el(n.config,i):`${n.config.apiScheme}://${i}`}class vI{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Be(this.auth,"network-request-failed")),wI.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Wi(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=Be(n,e,r);return i.customData._tokenResponse=t,i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bI(n,e){return Se(n,"POST","/v1/accounts:delete",e)}async function II(n,e){return Se(n,"POST","/v1/accounts:update",e)}async function _I(n,e){return Se(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ji(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function EI(n,e=!1){const t=P(n),r=await t.getIdToken(e),i=ba(r);b(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:Ji(_c(i.auth_time)),issuedAtTime:Ji(_c(i.iat)),expirationTime:Ji(_c(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function _c(n){return Number(n)*1e3}function ba(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return xo("JWT malformed, contained fewer than 3 sections"),null;try{const i=gm(t);return i?JSON.parse(i):(xo("Failed to decode base64 JWT payload"),null)}catch(i){return xo("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function TI(n){const e=ba(n);return b(e,"internal-error"),b(typeof e.exp<"u","internal-error"),b(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Yt(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof De&&kI(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function kI({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SI{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fm{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ji(this.lastLoginAt),this.creationTime=Ji(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fs(n){var e;const t=n.auth,r=await n.getIdToken(),i=await Yt(n,_I(t,{idToken:r}));b(i==null?void 0:i.users.length,t,"internal-error");const s=i.users[0];n._notifyReloadListener(s);const o=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?xI(s.providerUserInfo):[],a=CI(n.providerData,o),c=n.isAnonymous,u=!(n.email&&s.passwordHash)&&!(a!=null&&a.length),l=c?u:!1,h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new Fm(s.createdAt,s.lastLoginAt),isAnonymous:l};Object.assign(n,h)}async function AI(n){const e=P(n);await fs(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function CI(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function xI(n){return n.map(e=>{var{providerId:t}=e,r=Xu(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function DI(n,e){const t=await Mm(n,{},async()=>{const r=li({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,o=Lm(n,i,"/v1/token",`key=${s}`),a=await n._getAdditionalHeaders();return a["Content-Type"]="application/x-www-form-urlencoded",Om.fetch()(o,{method:"POST",headers:a,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ms{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){b(e.idToken,"internal-error"),b(typeof e.idToken<"u","internal-error"),b(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):TI(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}async getToken(e,t=!1){return b(!this.accessToken||this.refreshToken,e,"user-token-expired"),!t&&this.accessToken&&!this.isExpired?this.accessToken:this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:s}=await DI(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,o=new ms;return r&&(b(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(b(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(b(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ms,this.toJSON())}_performRefresh(){return xt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sn(n,e){b(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Zn{constructor(e){var{uid:t,auth:r,stsTokenManager:i}=e,s=Xu(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new SI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Fm(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await Yt(this,this.stsTokenManager.getToken(this.auth,e));return b(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return EI(this,e)}reload(){return AI(this)}_assign(e){this!==e&&(b(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Zn(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){b(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await fs(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){const e=await this.getIdToken();return await Yt(this,bI(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,i,s,o,a,c,u,l;const h=(r=t.displayName)!==null&&r!==void 0?r:void 0,d=(i=t.email)!==null&&i!==void 0?i:void 0,f=(s=t.phoneNumber)!==null&&s!==void 0?s:void 0,p=(o=t.photoURL)!==null&&o!==void 0?o:void 0,v=(a=t.tenantId)!==null&&a!==void 0?a:void 0,E=(c=t._redirectEventId)!==null&&c!==void 0?c:void 0,L=(u=t.createdAt)!==null&&u!==void 0?u:void 0,O=(l=t.lastLoginAt)!==null&&l!==void 0?l:void 0,{uid:D,emailVerified:z,isAnonymous:Y,providerData:$,stsTokenManager:ee}=t;b(D&&ee,e,"internal-error");const I=ms.fromJSON(this.name,ee);b(typeof D=="string",e,"internal-error"),sn(h,e.name),sn(d,e.name),b(typeof z=="boolean",e,"internal-error"),b(typeof Y=="boolean",e,"internal-error"),sn(f,e.name),sn(p,e.name),sn(v,e.name),sn(E,e.name),sn(L,e.name),sn(O,e.name);const B=new Zn({uid:D,auth:e,email:d,emailVerified:z,displayName:h,isAnonymous:Y,photoURL:p,phoneNumber:f,tenantId:v,stsTokenManager:I,createdAt:L,lastLoginAt:O});return $&&Array.isArray($)&&(B.providerData=$.map(He=>Object.assign({},He))),E&&(B._redirectEventId=E),B}static async _fromIdTokenResponse(e,t,r=!1){const i=new ms;i.updateFromServerResponse(t);const s=new Zn({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await fs(s),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ud=new Map;function ct(n){vt(n instanceof Function,"Expected a class definition");let e=ud.get(n);return e?(vt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,ud.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vm{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Vm.type="NONE";const Kr=Vm;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function er(n,e,t){return`firebase:${n}:${e}:${t}`}class Ur{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=er(this.userKey,i.apiKey,s),this.fullPersistenceKey=er("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?Zn._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Ur(ct(Kr),e,r);const i=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let s=i[0]||ct(Kr);const o=er(r,e.config.apiKey,e.name);let a=null;for(const u of t)try{const l=await u._get(o);if(l){const h=Zn._fromJSON(e,l);u!==s&&(a=h),s=u;break}}catch{}const c=i.filter(u=>u._shouldAllowMigration);return!s._shouldAllowMigration||!c.length?new Ur(s,e,r):(s=c[0],a&&await s._set(o,a.toJSON()),await Promise.all(t.map(async u=>{if(u!==s)try{await u._remove(o)}catch{}})),new Ur(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ld(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(qm(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Um(e))return"Firefox";if(e.includes("silk/"))return"Silk";if($m(e))return"Blackberry";if(zm(e))return"Webos";if(tl(e))return"Safari";if((e.includes("chrome/")||Bm(e))&&!e.includes("edge/"))return"Chrome";if(Us(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Um(n=ue()){return/firefox\//i.test(n)}function tl(n=ue()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Bm(n=ue()){return/crios\//i.test(n)}function qm(n=ue()){return/iemobile/i.test(n)}function Us(n=ue()){return/android/i.test(n)}function $m(n=ue()){return/blackberry/i.test(n)}function zm(n=ue()){return/webos/i.test(n)}function di(n=ue()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function NI(n=ue()){return/(iPad|iPhone|iPod).*OS 7_\d/i.test(n)||/(iPad|iPhone|iPod).*OS 8_\d/i.test(n)}function RI(n=ue()){var e;return di(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function PI(){return wm()&&document.documentMode===10}function jm(n=ue()){return di(n)||Us(n)||zm(n)||$m(n)||/windows phone/i.test(n)||qm(n)}function OI(){try{return!!(window&&window!==window.top)}catch{return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gm(n,e=[]){let t;switch(n){case"Browser":t=ld(ue());break;case"Worker":t=`${ld(ue())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${xn}/${r}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function MI(n){return(await Se(n,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function Wm(n,e){return Se(n,"GET","/v2/recaptchaConfig",Ee(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hd(n){return n!==void 0&&n.getResponse!==void 0}function dd(n){return n!==void 0&&n.enterprise!==void 0}class Hm{constructor(e){if(this.siteKey="",this.emailPasswordEnabled=!1,e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.emailPasswordEnabled=e.recaptchaEnforcementState.some(t=>t.provider==="EMAIL_PASSWORD_PROVIDER"&&t.enforcementState!=="OFF")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function LI(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}function nl(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=Be("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",LI().appendChild(r)})}function Km(n){return`__${n}${Math.floor(Math.random()*1e6)}`}const FI="https://www.google.com/recaptcha/enterprise.js?render=",VI="recaptcha-enterprise",UI="NO_RECAPTCHA";class Ym{constructor(e){this.type=VI,this.auth=ve(e)}async verify(e="verify",t=!1){async function r(s){if(!t){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,a)=>{Wm(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const u=new Hm(c);return s.tenantId==null?s._agentRecaptchaConfig=u:s._tenantRecaptchaConfigs[s.tenantId]=u,o(u.siteKey)}}).catch(c=>{a(c)})})}function i(s,o,a){const c=window.grecaptcha;dd(c)?c.enterprise.ready(()=>{c.enterprise.execute(s,{action:e}).then(u=>{o(u)}).catch(()=>{o(UI)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((s,o)=>{r(this.auth).then(a=>{if(!t&&dd(window.grecaptcha))i(a,s,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}nl(FI+a).then(()=>{i(a,s,o)}).catch(c=>{o(c)})}}).catch(a=>{o(a)})})}}async function wn(n,e,t,r=!1){const i=new Ym(n);let s;try{s=await i.verify(t)}catch{s=await i.verify(t,!0)}const o=Object.assign({},e);return r?Object.assign(o,{captchaResp:s}):Object.assign(o,{captchaResponse:s}),Object.assign(o,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(o,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),o}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BI{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((o,a)=>{try{const c=e(s);o(c)}catch(c){a(c)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qI{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new fd(this),this.idTokenSubscription=new fd(this),this.beforeStateQueue=new BI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Rm,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=ct(t)),this._initializationPromise=this.queue(async()=>{var r,i;if(!this._deleted&&(this.persistenceManager=await Ur.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUser(e){var t;const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,a=i==null?void 0:i._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(i=c.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return b(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await fs(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=pI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){const t=e?P(e):null;return t&&b(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&b(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0)}setPersistence(e){return this.queue(async()=>{await this.assertedPersistence.setPersistence(ct(e))})}async initializeRecaptchaConfig(){const e=await Wm(this,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),t=new Hm(e);this.tenantId==null?this._agentRecaptchaConfig=t:this._tenantRecaptchaConfigs[this.tenantId]=t,t.emailPasswordEnabled&&new Ym(this).verify()}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new yr("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&ct(e)||this._popupRedirectResolver;b(t,this,"argument-error"),this.redirectPersistenceManager=await Ur.create(this,[ct(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t),o=this._isInitialized?Promise.resolve():this._initializationPromise;return b(o,this,"internal-error"),o.then(()=>s(this.currentUser)),typeof t=="function"?e.addObserver(t,r,i):e.addObserver(t)}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return b(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Gm(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&mI(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function ve(n){return P(n)}class fd{constructor(e){this.auth=e,this.observer=null,this.addObserver=vm(t=>this.observer=t)}get next(){return b(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}function $I(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(ct);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function zI(n,e,t){const r=ve(n);b(r._canInitEmulator,r,"emulator-config-failed"),b(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!!(t!=null&&t.disableWarnings),s=Qm(e),{host:o,port:a}=jI(e),c=a===null?"":`:${a}`;r.config.emulator={url:`${s}//${o}${c}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:o,port:a,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})}),i||GI()}function Qm(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function jI(n){const e=Qm(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:md(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:md(o)}}}function md(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function GI(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return xt("not implemented")}_getIdTokenResponse(e){return xt("not implemented")}_linkToIdToken(e,t){return xt("not implemented")}_getReauthenticationResolver(e){return xt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xm(n,e){return Se(n,"POST","/v1/accounts:resetPassword",Ee(n,e))}async function Jm(n,e){return Se(n,"POST","/v1/accounts:update",e)}async function WI(n,e){return Se(n,"POST","/v1/accounts:update",Ee(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ec(n,e){return Jt(n,"POST","/v1/accounts:signInWithPassword",Ee(n,e))}async function Ia(n,e){return Se(n,"POST","/v1/accounts:sendOobCode",Ee(n,e))}async function HI(n,e){return Ia(n,e)}async function Tc(n,e){return Ia(n,e)}async function kc(n,e){return Ia(n,e)}async function KI(n,e){return Ia(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function YI(n,e){return Jt(n,"POST","/v1/accounts:signInWithEmailLink",Ee(n,e))}async function QI(n,e){return Jt(n,"POST","/v1/accounts:signInWithEmailLink",Ee(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gs extends fi{constructor(e,t,r,i=null){super("password",r),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new gs(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new gs(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){var t;switch(this.signInMethod){case"password":const r={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};if(!((t=e._getRecaptchaConfig())===null||t===void 0)&&t.emailPasswordEnabled){const i=await wn(e,r,"signInWithPassword");return Ec(e,i)}else return Ec(e,r).catch(async i=>{if(i.code==="auth/missing-recaptcha-token"){console.log("Sign-in with email address and password is protected by reCAPTCHA for this project. Automatically triggering the reCAPTCHA flow and restarting the sign-in flow.");const s=await wn(e,r,"signInWithPassword");return Ec(e,s)}else return Promise.reject(i)});case"emailLink":return YI(e,{email:this._email,oobCode:this._password});default:$e(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":return Jm(e,{idToken:t,returnSecureToken:!0,email:this._email,password:this._password});case"emailLink":return QI(e,{idToken:t,email:this._email,oobCode:this._password});default:$e(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ht(n,e){return Jt(n,"POST","/v1/accounts:signInWithIdp",Ee(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const XI="http://localhost";class Lt extends fi{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Lt(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):$e("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=t,s=Xu(t,["providerId","signInMethod"]);if(!r||!i)return null;const o=new Lt(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Ht(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Ht(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Ht(e,t)}buildRequest(){const e={requestUri:XI,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=li(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function JI(n,e){return Se(n,"POST","/v1/accounts:sendVerificationCode",Ee(n,e))}async function ZI(n,e){return Jt(n,"POST","/v1/accounts:signInWithPhoneNumber",Ee(n,e))}async function e_(n,e){const t=await Jt(n,"POST","/v1/accounts:signInWithPhoneNumber",Ee(n,e));if(t.temporaryProof)throw Wi(n,"account-exists-with-different-credential",t);return t}const t_={USER_NOT_FOUND:"user-not-found"};async function n_(n,e){const t=Object.assign(Object.assign({},e),{operation:"REAUTH"});return Jt(n,"POST","/v1/accounts:signInWithPhoneNumber",Ee(n,t),t_)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tr extends fi{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new tr({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new tr({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return ZI(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return e_(e,Object.assign({idToken:t},this._makeVerificationRequest()))}_getReauthenticationResolver(e){return n_(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:t,verificationId:r,verificationCode:i}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:r,code:i}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:t,verificationCode:r,phoneNumber:i,temporaryProof:s}=e;return!r&&!t&&!i&&!s?null:new tr({verificationId:t,verificationCode:r,phoneNumber:i,temporaryProof:s})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function r_(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function i_(n){const e=Lr(Gi(n)).link,t=e?Lr(Gi(e)).deep_link_id:null,r=Lr(Gi(n)).deep_link_id;return(r?Lr(Gi(r)).link:null)||r||t||e||n}class _a{constructor(e){var t,r,i,s,o,a;const c=Lr(Gi(e)),u=(t=c.apiKey)!==null&&t!==void 0?t:null,l=(r=c.oobCode)!==null&&r!==void 0?r:null,h=r_((i=c.mode)!==null&&i!==void 0?i:null);b(u&&l&&h,"argument-error"),this.apiKey=u,this.operation=h,this.code=l,this.continueUrl=(s=c.continueUrl)!==null&&s!==void 0?s:null,this.languageCode=(o=c.languageCode)!==null&&o!==void 0?o:null,this.tenantId=(a=c.tenantId)!==null&&a!==void 0?a:null}static parseLink(e){const t=i_(e);try{return new _a(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dn{constructor(){this.providerId=Dn.PROVIDER_ID}static credential(e,t){return gs._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=_a.parseLink(t);return b(r,"argument-error"),gs._fromEmailAndCode(e,r.code,r.tenantId)}}Dn.PROVIDER_ID="password";Dn.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Dn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zt{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mi extends Zt{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class Br extends mi{static credentialFromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;return b("providerId"in t&&"signInMethod"in t,"argument-error"),Lt._fromParams(t)}credential(e){return this._credential(Object.assign(Object.assign({},e),{nonce:e.rawNonce}))}_credential(e){return b(e.idToken||e.accessToken,"argument-error"),Lt._fromParams(Object.assign(Object.assign({},e),{providerId:this.providerId,signInMethod:this.providerId}))}static credentialFromResult(e){return Br.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return Br.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r,oauthTokenSecret:i,pendingToken:s,nonce:o,providerId:a}=e;if(!r&&!i&&!t&&!s||!a)return null;try{return new Br(a)._credential({idToken:t,accessToken:r,nonce:o,pendingToken:s})}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t extends mi{constructor(){super("facebook.com")}static credential(e){return Lt._fromParams({providerId:_t.PROVIDER_ID,signInMethod:_t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return _t.credentialFromTaggedObject(e)}static credentialFromError(e){return _t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return _t.credential(e.oauthAccessToken)}catch{return null}}}_t.FACEBOOK_SIGN_IN_METHOD="facebook.com";_t.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Et extends mi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Lt._fromParams({providerId:Et.PROVIDER_ID,signInMethod:Et.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Et.credentialFromTaggedObject(e)}static credentialFromError(e){return Et.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Et.credential(t,r)}catch{return null}}}Et.GOOGLE_SIGN_IN_METHOD="google.com";Et.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tt extends mi{constructor(){super("github.com")}static credential(e){return Lt._fromParams({providerId:Tt.PROVIDER_ID,signInMethod:Tt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Tt.credentialFromTaggedObject(e)}static credentialFromError(e){return Tt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Tt.credential(e.oauthAccessToken)}catch{return null}}}Tt.GITHUB_SIGN_IN_METHOD="github.com";Tt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const s_="http://localhost";class Yr extends fi{constructor(e,t){super(e,e),this.pendingToken=t}_getIdTokenResponse(e){const t=this.buildRequest();return Ht(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Ht(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Ht(e,t)}toJSON(){return{signInMethod:this.signInMethod,providerId:this.providerId,pendingToken:this.pendingToken}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,pendingToken:s}=t;return!r||!i||!s||r!==i?null:new Yr(r,s)}static _create(e,t){return new Yr(e,t)}buildRequest(){return{requestUri:s_,returnSecureToken:!0,pendingToken:this.pendingToken}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const o_="saml.";class Wo extends Zt{constructor(e){b(e.startsWith(o_),"argument-error"),super(e)}static credentialFromResult(e){return Wo.samlCredentialFromTaggedObject(e)}static credentialFromError(e){return Wo.samlCredentialFromTaggedObject(e.customData||{})}static credentialFromJSON(e){const t=Yr.fromJSON(e);return b(t,"argument-error"),t}static samlCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{pendingToken:t,providerId:r}=e;if(!t||!r)return null;try{return Yr._create(r,t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kt extends mi{constructor(){super("twitter.com")}static credential(e,t){return Lt._fromParams({providerId:kt.PROVIDER_ID,signInMethod:kt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return kt.credentialFromTaggedObject(e)}static credentialFromError(e){return kt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return kt.credential(t,r)}catch{return null}}}kt.TWITTER_SIGN_IN_METHOD="twitter.com";kt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Do(n,e){return Jt(n,"POST","/v1/accounts:signUp",Ee(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const s=await Zn._fromIdTokenResponse(e,r,i),o=gd(r);return new gt({user:s,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=gd(r);return new gt({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function gd(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function a_(n){var e;const t=ve(n);if(await t._initializationPromise,!((e=t.currentUser)===null||e===void 0)&&e.isAnonymous)return new gt({user:t.currentUser,providerId:null,operationType:"signIn"});const r=await Do(t,{returnSecureToken:!0}),i=await gt._fromIdTokenResponse(t,"signIn",r,!0);return await t._updateCurrentUser(i.user),i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ho extends De{constructor(e,t,r,i){var s;super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,Ho.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new Ho(e,t,r,i)}}function Zm(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?Ho._fromErrorAndOperation(n,s,e,r):s})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eg(n){return new Set(n.map(({providerId:e})=>e).filter(e=>!!e))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function c_(n,e){const t=P(n);await Ea(!0,t,e);const{providerUserInfo:r}=await II(t.auth,{idToken:await t.getIdToken(),deleteProvider:[e]}),i=eg(r||[]);return t.providerData=t.providerData.filter(s=>i.has(s.providerId)),i.has("phone")||(t.phoneNumber=null),await t.auth._persistUserIfCurrent(t),t}async function rl(n,e,t=!1){const r=await Yt(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return gt._forOperation(n,"link",r)}async function Ea(n,e,t){await fs(e);const r=eg(e.providerData),i=n===!1?"provider-already-linked":"no-such-provider";b(r.has(t)===n,e.auth,i)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tg(n,e,t=!1){const{auth:r}=n,i="reauthenticate";try{const s=await Yt(n,Zm(r,i,e,n),t);b(s.idToken,r,"internal-error");const o=ba(s.idToken);b(o,r,"internal-error");const{sub:a}=o;return b(n.uid===a,r,"user-mismatch"),gt._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&$e(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ng(n,e,t=!1){const r="signIn",i=await Zm(n,r,e),s=await gt._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}async function Ta(n,e){return ng(ve(n),e)}async function rg(n,e){const t=P(n);return await Ea(!1,t,e.providerId),rl(t,e)}async function ig(n,e){return tg(P(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function u_(n,e){return Jt(n,"POST","/v1/accounts:signInWithCustomToken",Ee(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function l_(n,e){const t=ve(n),r=await u_(t,{token:e,returnSecureToken:!0}),i=await gt._fromIdTokenResponse(t,"signIn",r);return await t._updateCurrentUser(i.user),i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bs{constructor(e,t){this.factorId=e,this.uid=t.mfaEnrollmentId,this.enrollmentTime=new Date(t.enrolledAt).toUTCString(),this.displayName=t.displayName}static _fromServerResponse(e,t){return"phoneInfo"in t?il._fromServerResponse(e,t):"totpInfo"in t?sl._fromServerResponse(e,t):$e(e,"internal-error")}}class il extends Bs{constructor(e){super("phone",e),this.phoneNumber=e.phoneInfo}static _fromServerResponse(e,t){return new il(t)}}class sl extends Bs{constructor(e){super("totp",e)}static _fromServerResponse(e,t){return new sl(t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qr(n,e,t){var r;b(((r=t.url)===null||r===void 0?void 0:r.length)>0,n,"invalid-continue-uri"),b(typeof t.dynamicLinkDomain>"u"||t.dynamicLinkDomain.length>0,n,"invalid-dynamic-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&(b(t.iOS.bundleId.length>0,n,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&(b(t.android.packageName.length>0,n,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function h_(n,e,t){var r;const i=ve(n),s={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};if(!((r=i._getRecaptchaConfig())===null||r===void 0)&&r.emailPasswordEnabled){const o=await wn(i,s,"getOobCode",!0);t&&qr(i,o,t),await Tc(i,o)}else t&&qr(i,s,t),await Tc(i,s).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log("Password resets are protected by reCAPTCHA for this project. Automatically triggering the reCAPTCHA flow and restarting the password reset flow.");const a=await wn(i,s,"getOobCode",!0);t&&qr(i,a,t),await Tc(i,a)}else return Promise.reject(o)})}async function d_(n,e,t){await Xm(P(n),{oobCode:e,newPassword:t})}async function f_(n,e){await WI(P(n),{oobCode:e})}async function sg(n,e){const t=P(n),r=await Xm(t,{oobCode:e}),i=r.requestType;switch(b(i,t,"internal-error"),i){case"EMAIL_SIGNIN":break;case"VERIFY_AND_CHANGE_EMAIL":b(r.newEmail,t,"internal-error");break;case"REVERT_SECOND_FACTOR_ADDITION":b(r.mfaInfo,t,"internal-error");default:b(r.email,t,"internal-error")}let s=null;return r.mfaInfo&&(s=Bs._fromServerResponse(ve(t),r.mfaInfo)),{data:{email:(r.requestType==="VERIFY_AND_CHANGE_EMAIL"?r.newEmail:r.email)||null,previousEmail:(r.requestType==="VERIFY_AND_CHANGE_EMAIL"?r.email:r.newEmail)||null,multiFactorInfo:s},operation:i}}async function m_(n,e){const{data:t}=await sg(P(n),e);return t.email}async function g_(n,e,t){var r;const i=ve(n),s={returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"};let o;if(!((r=i._getRecaptchaConfig())===null||r===void 0)&&r.emailPasswordEnabled){const u=await wn(i,s,"signUpPassword");o=Do(i,u)}else o=Do(i,s).catch(async u=>{if(u.code==="auth/missing-recaptcha-token"){console.log("Sign-up is protected by reCAPTCHA for this project. Automatically triggering the reCAPTCHA flow and restarting the sign-up flow.");const l=await wn(i,s,"signUpPassword");return Do(i,l)}else return Promise.reject(u)});const a=await o.catch(u=>Promise.reject(u)),c=await gt._fromIdTokenResponse(i,"signIn",a);return await i._updateCurrentUser(c.user),c}function p_(n,e,t){return Ta(P(n),Dn.credential(e,t))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function y_(n,e,t){var r;const i=ve(n),s={requestType:"EMAIL_SIGNIN",email:e,clientType:"CLIENT_TYPE_WEB"};function o(a,c){b(c.handleCodeInApp,i,"argument-error"),c&&qr(i,a,c)}if(!((r=i._getRecaptchaConfig())===null||r===void 0)&&r.emailPasswordEnabled){const a=await wn(i,s,"getOobCode",!0);o(a,t),await kc(i,a)}else o(s,t),await kc(i,s).catch(async a=>{if(a.code==="auth/missing-recaptcha-token"){console.log("Email link sign-in is protected by reCAPTCHA for this project. Automatically triggering the reCAPTCHA flow and restarting the sign-in flow.");const c=await wn(i,s,"getOobCode",!0);o(c,t),await kc(i,c)}else return Promise.reject(a)})}function w_(n,e){const t=_a.parseLink(e);return(t==null?void 0:t.operation)==="EMAIL_SIGNIN"}async function v_(n,e,t){const r=P(n),i=Dn.credentialWithLink(e,t||ds());return b(i._tenantId===(r.tenantId||null),r,"tenant-id-mismatch"),Ta(r,i)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function b_(n,e){return Se(n,"POST","/v1/accounts:createAuthUri",Ee(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function I_(n,e){const t=Zu()?ds():"http://localhost",r={identifier:e,continueUri:t},{signinMethods:i}=await b_(P(n),r);return i||[]}async function __(n,e){const t=P(n),i={requestType:"VERIFY_EMAIL",idToken:await n.getIdToken()};e&&qr(t.auth,i,e);const{email:s}=await HI(t.auth,i);s!==n.email&&await n.reload()}async function E_(n,e,t){const r=P(n),s={requestType:"VERIFY_AND_CHANGE_EMAIL",idToken:await n.getIdToken(),newEmail:e};t&&qr(r.auth,s,t);const{email:o}=await KI(r.auth,s);o!==n.email&&await n.reload()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function T_(n,e){return Se(n,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function k_(n,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const r=P(n),s={idToken:await r.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await Yt(r,T_(r.auth,s));r.displayName=o.displayName||null,r.photoURL=o.photoUrl||null;const a=r.providerData.find(({providerId:c})=>c==="password");a&&(a.displayName=r.displayName,a.photoURL=r.photoURL),await r._updateTokensIfNecessary(o)}function S_(n,e){return og(P(n),e,null)}function A_(n,e){return og(P(n),null,e)}async function og(n,e,t){const{auth:r}=n,s={idToken:await n.getIdToken(),returnSecureToken:!0};e&&(s.email=e),t&&(s.password=t);const o=await Yt(n,Jm(r,s));await n._updateTokensIfNecessary(o,!0)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function C_(n){var e,t;if(!n)return null;const{providerId:r}=n,i=n.rawUserInfo?JSON.parse(n.rawUserInfo):{},s=n.isNewUser||n.kind==="identitytoolkit#SignupNewUserResponse";if(!r&&(n!=null&&n.idToken)){const o=(t=(e=ba(n.idToken))===null||e===void 0?void 0:e.firebase)===null||t===void 0?void 0:t.sign_in_provider;if(o){const a=o!=="anonymous"&&o!=="custom"?o:null;return new $r(s,a)}}if(!r)return null;switch(r){case"facebook.com":return new x_(s,i);case"github.com":return new D_(s,i);case"google.com":return new N_(s,i);case"twitter.com":return new R_(s,i,n.screenName||null);case"custom":case"anonymous":return new $r(s,null);default:return new $r(s,r,i)}}class $r{constructor(e,t,r={}){this.isNewUser=e,this.providerId=t,this.profile=r}}class ag extends $r{constructor(e,t,r,i){super(e,t,r),this.username=i}}class x_ extends $r{constructor(e,t){super(e,"facebook.com",t)}}class D_ extends ag{constructor(e,t){super(e,"github.com",t,typeof(t==null?void 0:t.login)=="string"?t==null?void 0:t.login:null)}}class N_ extends $r{constructor(e,t){super(e,"google.com",t)}}class R_ extends ag{constructor(e,t,r){super(e,"twitter.com",t,r)}}function P_(n){const{user:e,_tokenResponse:t}=n;return e.isAnonymous&&!t?{providerId:null,isNewUser:!1,profile:null}:C_(t)}class Kn{constructor(e,t,r){this.type=e,this.credential=t,this.auth=r}static _fromIdtoken(e,t){return new Kn("enroll",e,t)}static _fromMfaPendingCredential(e){return new Kn("signin",e)}toJSON(){return{multiFactorSession:{[this.type==="enroll"?"idToken":"pendingCredential"]:this.credential}}}static fromJSON(e){var t,r;if(e!=null&&e.multiFactorSession){if(!((t=e.multiFactorSession)===null||t===void 0)&&t.pendingCredential)return Kn._fromMfaPendingCredential(e.multiFactorSession.pendingCredential);if(!((r=e.multiFactorSession)===null||r===void 0)&&r.idToken)return Kn._fromIdtoken(e.multiFactorSession.idToken)}return null}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ol{constructor(e,t,r){this.session=e,this.hints=t,this.signInResolver=r}static _fromError(e,t){const r=ve(e),i=t.customData._serverResponse,s=(i.mfaInfo||[]).map(a=>Bs._fromServerResponse(r,a));b(i.mfaPendingCredential,r,"internal-error");const o=Kn._fromMfaPendingCredential(i.mfaPendingCredential);return new ol(o,s,async a=>{const c=await a._process(r,o);delete i.mfaInfo,delete i.mfaPendingCredential;const u=Object.assign(Object.assign({},i),{idToken:c.idToken,refreshToken:c.refreshToken});switch(t.operationType){case"signIn":const l=await gt._fromIdTokenResponse(r,t.operationType,u);return await r._updateCurrentUser(l.user),l;case"reauthenticate":return b(t.user,r,"internal-error"),gt._forOperation(t.user,t.operationType,u);default:$e(r,"internal-error")}})}async resolveSignIn(e){const t=e;return this.signInResolver(t)}}function O_(n,e){var t;const r=P(n),i=e;return b(e.customData.operationType,r,"argument-error"),b((t=i.customData._serverResponse)===null||t===void 0?void 0:t.mfaPendingCredential,r,"argument-error"),ol._fromError(r,i)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M_(n,e){return Se(n,"POST","/v2/accounts/mfaEnrollment:start",Ee(n,e))}function L_(n,e){return Se(n,"POST","/v2/accounts/mfaEnrollment:finalize",Ee(n,e))}function F_(n,e){return Se(n,"POST","/v2/accounts/mfaEnrollment:withdraw",Ee(n,e))}class al{constructor(e){this.user=e,this.enrolledFactors=[],e._onReload(t=>{t.mfaInfo&&(this.enrolledFactors=t.mfaInfo.map(r=>Bs._fromServerResponse(e.auth,r)))})}static _fromUser(e){return new al(e)}async getSession(){return Kn._fromIdtoken(await this.user.getIdToken(),this.user.auth)}async enroll(e,t){const r=e,i=await this.getSession(),s=await Yt(this.user,r._process(this.user.auth,i,t));return await this.user._updateTokensIfNecessary(s),this.user.reload()}async unenroll(e){const t=typeof e=="string"?e:e.uid,r=await this.user.getIdToken();try{const i=await Yt(this.user,F_(this.user.auth,{idToken:r,mfaEnrollmentId:t}));this.enrolledFactors=this.enrolledFactors.filter(({uid:s})=>s!==t),await this.user._updateTokensIfNecessary(i),await this.user.reload()}catch(i){throw i}}}const Sc=new WeakMap;function V_(n){const e=P(n);return Sc.has(e)||Sc.set(e,al._fromUser(e)),Sc.get(e)}const Ko="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cg{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Ko,"1"),this.storage.removeItem(Ko),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function U_(){const n=ue();return tl(n)||di(n)}const B_=1e3,q_=10;class ug extends cg{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.safariLocalStorageNotSynced=U_()&&OI(),this.fallbackToPolling=jm(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const r=e.key;if(t?this.detachListener():this.stopPolling(),this.safariLocalStorageNotSynced){const o=this.storage.getItem(r);if(e.newValue!==o)e.newValue!==null?this.storage.setItem(r,e.newValue):this.storage.removeItem(r);else if(this.localCache[r]===e.newValue&&!t)return}const i=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);PI()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,q_):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},B_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}ug.type="LOCAL";const cl=ug;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lg extends cg{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}lg.type="SESSION";const sr=lg;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $_(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ka{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new ka(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:s}=t.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const a=Array.from(o).map(async u=>u(t.origin,s)),c=await $_(a);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ka.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qs(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z_{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((a,c)=>{const u=qs("",20);i.port1.start();const l=setTimeout(()=>{c(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(h){const d=h;if(d.data.eventId===u)switch(d.data.status){case"ack":clearTimeout(l),s=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),a(d.data.response);break;default:clearTimeout(l),clearTimeout(s),c(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:t},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ie(){return window}function j_(n){Ie().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ul(){return typeof Ie().WorkerGlobalScope<"u"&&typeof Ie().importScripts=="function"}async function G_(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function W_(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function H_(){return ul()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hg="firebaseLocalStorageDb",K_=1,Yo="firebaseLocalStorage",dg="fbase_key";class $s{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Sa(n,e){return n.transaction([Yo],e?"readwrite":"readonly").objectStore(Yo)}function Y_(){const n=indexedDB.deleteDatabase(hg);return new $s(n).toPromise()}function Yc(){const n=indexedDB.open(hg,K_);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Yo,{keyPath:dg})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Yo)?e(r):(r.close(),await Y_(),e(await Yc()))})})}async function pd(n,e,t){const r=Sa(n,!0).put({[dg]:e,value:t});return new $s(r).toPromise()}async function Q_(n,e){const t=Sa(n,!1).get(e),r=await new $s(t).toPromise();return r===void 0?null:r.value}function yd(n,e){const t=Sa(n,!0).delete(e);return new $s(t).toPromise()}const X_=800,J_=3;class fg{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Yc(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>J_)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return ul()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ka._getInstance(H_()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await G_(),!this.activeServiceWorker)return;this.sender=new z_(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||W_()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Yc();return await pd(e,Ko,"1"),await yd(e,Ko),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>pd(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>Q_(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>yd(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Sa(i,!1).getAll();return new $s(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),X_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}fg.type="LOCAL";const ps=fg;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z_(n,e){return Se(n,"POST","/v2/accounts/mfaSignIn:start",Ee(n,e))}function eE(n,e){return Se(n,"POST","/v2/accounts/mfaSignIn:finalize",Ee(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tE=500,nE=6e4,mo=1e12;class rE{constructor(e){this.auth=e,this.counter=mo,this._widgets=new Map}render(e,t){const r=this.counter;return this._widgets.set(r,new iE(e,this.auth.name,t||{})),this.counter++,r}reset(e){var t;const r=e||mo;(t=this._widgets.get(r))===null||t===void 0||t.delete(),this._widgets.delete(r)}getResponse(e){var t;const r=e||mo;return((t=this._widgets.get(r))===null||t===void 0?void 0:t.getResponse())||""}async execute(e){var t;const r=e||mo;return(t=this._widgets.get(r))===null||t===void 0||t.execute(),""}}class iE{constructor(e,t,r){this.params=r,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const i=typeof e=="string"?document.getElementById(e):e;b(i,"argument-error",{appName:t}),this.container=i,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=sE(50);const{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch{}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch{}this.isVisible&&this.execute()},nE)},tE))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function sE(n){const e=[],t="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let r=0;r<n;r++)e.push(t.charAt(Math.floor(Math.random()*t.length)));return e.join("")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ac=Km("rcb"),oE=new Vs(3e4,6e4),aE="https://www.google.com/recaptcha/api.js?";class cE{constructor(){var e;this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!(!((e=Ie().grecaptcha)===null||e===void 0)&&e.render)}load(e,t=""){return b(uE(t),e,"argument-error"),this.shouldResolveImmediately(t)&&hd(Ie().grecaptcha)?Promise.resolve(Ie().grecaptcha):new Promise((r,i)=>{const s=Ie().setTimeout(()=>{i(Be(e,"network-request-failed"))},oE.get());Ie()[Ac]=()=>{Ie().clearTimeout(s),delete Ie()[Ac];const a=Ie().grecaptcha;if(!a||!hd(a)){i(Be(e,"internal-error"));return}const c=a.render;a.render=(u,l)=>{const h=c(u,l);return this.counter++,h},this.hostLanguage=t,r(a)};const o=`${aE}?${li({onload:Ac,render:"explicit",hl:t})}`;nl(o).catch(()=>{clearTimeout(s),i(Be(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){var t;return!!(!((t=Ie().grecaptcha)===null||t===void 0)&&t.render)&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function uE(n){return n.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(n)}class lE{async load(e){return new rE(e)}clearedOneInstance(){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mg="recaptcha",hE={theme:"light",type:"image"};let dE=class{constructor(e,t=Object.assign({},hE),r){this.parameters=t,this.type=mg,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=ve(r),this.isInvisible=this.parameters.size==="invisible",b(typeof document<"u",this.auth,"operation-not-supported-in-this-environment");const i=typeof e=="string"?document.getElementById(e):e;b(i,this.auth,"argument-error"),this.container=i,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new lE:new cE,this.validateStartingState()}async verify(){this.assertNotDestroyed();const e=await this.render(),t=this.getAssertedRecaptcha(),r=t.getResponse(e);return r||new Promise(i=>{const s=o=>{o&&(this.tokenChangeListeners.delete(s),i(o))};this.tokenChangeListeners.add(s),this.isInvisible&&t.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){b(!this.parameters.sitekey,this.auth,"argument-error"),b(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),b(typeof document<"u",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(r=>r(t)),typeof e=="function")e(t);else if(typeof e=="string"){const r=Ie()[e];typeof r=="function"&&r(t)}}}assertNotDestroyed(){b(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){b(Zu()&&!ul(),this.auth,"internal-error"),await fE(),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=await MI(this.auth);b(e,this.auth,"internal-error"),this.parameters.sitekey=e}getAssertedRecaptcha(){return b(this.recaptcha,this.auth,"internal-error"),this.recaptcha}};function fE(){let n=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}n=()=>e(),window.addEventListener("load",n)}).catch(e=>{throw n&&window.removeEventListener("load",n),e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ll{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){const t=tr._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}async function mE(n,e,t){const r=ve(n),i=await Aa(r,e,P(t));return new ll(i,s=>Ta(r,s))}async function gE(n,e,t){const r=P(n);await Ea(!1,r,"phone");const i=await Aa(r.auth,e,P(t));return new ll(i,s=>rg(r,s))}async function pE(n,e,t){const r=P(n),i=await Aa(r.auth,e,P(t));return new ll(i,s=>ig(r,s))}async function Aa(n,e,t){var r;const i=await t.verify();try{b(typeof i=="string",n,"argument-error"),b(t.type===mg,n,"argument-error");let s;if(typeof e=="string"?s={phoneNumber:e}:s=e,"session"in s){const o=s.session;if("phoneNumber"in s)return b(o.type==="enroll",n,"internal-error"),(await M_(n,{idToken:o.credential,phoneEnrollmentInfo:{phoneNumber:s.phoneNumber,recaptchaToken:i}})).phoneSessionInfo.sessionInfo;{b(o.type==="signin",n,"internal-error");const a=((r=s.multiFactorHint)===null||r===void 0?void 0:r.uid)||s.multiFactorUid;return b(a,n,"missing-multi-factor-info"),(await Z_(n,{mfaPendingCredential:o.credential,mfaEnrollmentId:a,phoneSignInInfo:{recaptchaToken:i}})).phoneResponseInfo.sessionInfo}}else{const{sessionInfo:o}=await JI(n,{phoneNumber:s.phoneNumber,recaptchaToken:i});return o}}finally{t._reset()}}async function yE(n,e){await rl(P(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let or=class No{constructor(e){this.providerId=No.PROVIDER_ID,this.auth=ve(e)}verifyPhoneNumber(e,t){return Aa(this.auth,e,P(t))}static credential(e,t){return tr._fromVerification(e,t)}static credentialFromResult(e){const t=e;return No.credentialFromTaggedObject(t)}static credentialFromError(e){return No.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{phoneNumber:t,temporaryProof:r}=e;return t&&r?tr._fromTokenResponse(t,r):null}};or.PROVIDER_ID="phone";or.PHONE_SIGN_IN_METHOD="phone";/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wr(n,e){return e?ct(e):(b(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hl extends fi{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Ht(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Ht(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Ht(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function wE(n){return ng(n.auth,new hl(n),n.bypassAuthState)}function vE(n){const{auth:e,user:t}=n;return b(t,e,"internal-error"),tg(t,new hl(n),n.bypassAuthState)}async function bE(n){const{auth:e,user:t}=n;return b(t,e,"internal-error"),rl(t,new hl(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gg{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return wE;case"linkViaPopup":case"linkViaRedirect":return bE;case"reauthViaPopup":case"reauthViaRedirect":return vE;default:$e(this.auth,"internal-error")}}resolve(e){vt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){vt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IE=new Vs(2e3,1e4);async function _E(n,e,t){const r=ve(n);hi(n,e,Zt);const i=wr(r,t);return new $t(r,"signInViaPopup",e,i).executeNotNull()}async function EE(n,e,t){const r=P(n);hi(r.auth,e,Zt);const i=wr(r.auth,t);return new $t(r.auth,"reauthViaPopup",e,i,r).executeNotNull()}async function TE(n,e,t){const r=P(n);hi(r.auth,e,Zt);const i=wr(r.auth,t);return new $t(r.auth,"linkViaPopup",e,i,r).executeNotNull()}class $t extends gg{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,$t.currentPopupAction&&$t.currentPopupAction.cancel(),$t.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return b(e,this.auth,"internal-error"),e}async onExecution(){vt(this.filter.length===1,"Popup operations only handle one event");const e=qs();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Be(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Be(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,$t.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Be(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,IE.get())};e()}}$t.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kE="pendingRedirect",Zi=new Map;class SE extends gg{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Zi.get(this.auth._key());if(!e){try{const r=await AE(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Zi.set(this.auth._key(),e)}return this.bypassAuthState||Zi.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function AE(n,e){const t=yg(e),r=pg(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}async function dl(n,e){return pg(n)._set(yg(e),"true")}function CE(){Zi.clear()}function fl(n,e){Zi.set(n._key(),e)}function pg(n){return ct(n._redirectPersistence)}function yg(n){return er(kE,n.config.apiKey,n.name)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xE(n,e,t){return DE(n,e,t)}async function DE(n,e,t){const r=ve(n);hi(n,e,Zt),await r._initializationPromise;const i=wr(r,t);return await dl(i,r),i._openRedirect(r,e,"signInViaRedirect")}function NE(n,e,t){return RE(n,e,t)}async function RE(n,e,t){const r=P(n);hi(r.auth,e,Zt),await r.auth._initializationPromise;const i=wr(r.auth,t);await dl(i,r.auth);const s=await wg(r);return i._openRedirect(r.auth,e,"reauthViaRedirect",s)}function PE(n,e,t){return OE(n,e,t)}async function OE(n,e,t){const r=P(n);hi(r.auth,e,Zt),await r.auth._initializationPromise;const i=wr(r.auth,t);await Ea(!1,r,e.providerId),await dl(i,r.auth);const s=await wg(r);return i._openRedirect(r.auth,e,"linkViaRedirect",s)}async function ME(n,e){return await ve(n)._initializationPromise,Ca(n,e,!1)}async function Ca(n,e,t=!1){const r=ve(n),i=wr(r,e),o=await new SE(r,i,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}async function wg(n){const e=qs(`${n.uid}:::`);return n._redirectEventId=e,await n.auth._setRedirectUser(n),await n.auth._persistUserIfCurrent(n),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const LE=10*60*1e3;class vg{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!FE(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!bg(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(Be(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=LE&&this.cachedEventUids.clear(),this.cachedEventUids.has(wd(e))}saveEventToCache(e){this.cachedEventUids.add(wd(e)),this.lastProcessedEventTime=Date.now()}}function wd(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function bg({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function FE(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return bg(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ig(n,e={}){return Se(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const VE=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,UE=/^https?/;async function BE(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Ig(n);for(const t of e)try{if(qE(t))return}catch{}$e(n,"unauthorized-domain")}function qE(n){const e=ds(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!UE.test(t))return!1;if(VE.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $E=new Vs(3e4,6e4);function vd(){const n=Ie().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function zE(n){return new Promise((e,t)=>{var r,i,s;function o(){vd(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{vd(),t(Be(n,"network-request-failed"))},timeout:$E.get()})}if(!((i=(r=Ie().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=Ie().gapi)===null||s===void 0)&&s.load)o();else{const a=Km("iframefcb");return Ie()[a]=()=>{gapi.load?o():t(Be(n,"network-request-failed"))},nl(`https://apis.google.com/js/api.js?onload=${a}`).catch(c=>t(c))}}).catch(e=>{throw Ro=null,e})}let Ro=null;function jE(n){return Ro=Ro||zE(n),Ro}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const GE=new Vs(5e3,15e3),WE="__/auth/iframe",HE="emulator/auth/iframe",KE={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},YE=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function QE(n){const e=n.config;b(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?el(e,HE):`https://${n.config.authDomain}/${WE}`,r={apiKey:e.apiKey,appName:n.name,v:xn},i=YE.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${li(r).slice(1)}`}async function XE(n){const e=await jE(n),t=Ie().gapi;return b(t,n,"internal-error"),e.open({where:document.body,url:QE(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:KE,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=Be(n,"network-request-failed"),a=Ie().setTimeout(()=>{s(o)},GE.get());function c(){Ie().clearTimeout(a),i(r)}r.ping(c).then(c,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const JE={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},ZE=500,eT=600,tT="_blank",nT="http://localhost";class bd{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function rT(n,e,t,r=ZE,i=eT){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let a="";const c=Object.assign(Object.assign({},JE),{width:r.toString(),height:i.toString(),top:s,left:o}),u=ue().toLowerCase();t&&(a=Bm(u)?tT:t),Um(u)&&(e=e||nT,c.scrollbars="yes");const l=Object.entries(c).reduce((d,[f,p])=>`${d}${f}=${p},`,"");if(RI(u)&&a!=="_self")return iT(e||"",a),new bd(null);const h=window.open(e||"",a,l);b(h,n,"popup-blocked");try{h.focus()}catch{}return new bd(h)}function iT(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sT="__/auth/handler",oT="emulator/auth/handler",aT=encodeURIComponent("fac");async function Qc(n,e,t,r,i,s){b(n.config.authDomain,n,"auth-domain-config-required"),b(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:xn,eventId:i};if(e instanceof Zt){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",zv(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[l,h]of Object.entries(s||{}))o[l]=h}if(e instanceof mi){const l=e.getScopes().filter(h=>h!=="");l.length>0&&(o.scopes=l.join(","))}n.tenantId&&(o.tid=n.tenantId);const a=o;for(const l of Object.keys(a))a[l]===void 0&&delete a[l];const c=await n._getAppCheckToken(),u=c?`#${aT}=${encodeURIComponent(c)}`:"";return`${cT(n)}?${li(a).slice(1)}${u}`}function cT({config:n}){return n.emulator?el(n,oT):`https://${n.authDomain}/${sT}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cc="webStorageSupport";class uT{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=sr,this._completeRedirectFn=Ca,this._overrideRedirectResult=fl}async _openPopup(e,t,r,i){var s;vt((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const o=await Qc(e,t,r,ds(),i);return rT(e,o,qs())}async _openRedirect(e,t,r,i){await this._originValidation(e);const s=await Qc(e,t,r,ds(),i);return j_(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(vt(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await XE(e),r=new vg(e);return t.register("authEvent",i=>(b(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Cc,{type:Cc},i=>{var s;const o=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[Cc];o!==void 0&&t(!!o),$e(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=BE(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return jm()||tl()||di()}}const lT=uT;class hT{constructor(e){this.factorId=e}_process(e,t,r){switch(t.type){case"enroll":return this._finalizeEnroll(e,t.credential,r);case"signin":return this._finalizeSignIn(e,t.credential);default:return xt("unexpected MultiFactorSessionType")}}}class ml extends hT{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new ml(e)}_finalizeEnroll(e,t,r){return L_(e,{idToken:t,displayName:r,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,t){return eE(e,{mfaPendingCredential:t,phoneVerificationInfo:this.credential._makeVerificationRequest()})}}class _g{constructor(){}static assertion(e){return ml._fromCredential(e)}}_g.FACTOR_ID="phone";var Id="@firebase/auth",_d="0.23.2";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dT{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){b(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fT(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";default:return}}function mT(n){Kt(new mt("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=r.options;b(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:o,authDomain:a,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Gm(n)},u=new qI(r,i,s,c);return $I(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Kt(new mt("auth-internal",e=>{const t=ve(e.getProvider("auth").getImmediate());return(r=>new dT(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),ft(Id,_d,fT(n)),ft(Id,_d,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gT=5*60;Pv("authIdTokenMaxAge");mT("Browser");/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ar(){return window}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pT=2e3;async function yT(n,e,t){var r;const{BuildInfo:i}=ar();vt(e.sessionId,"AuthEvent did not contain a session ID");const s=await _T(e.sessionId),o={};return di()?o.ibi=i.packageName:Us()?o.apn=i.packageName:$e(n,"operation-not-supported-in-this-environment"),i.displayName&&(o.appDisplayName=i.displayName),o.sessionId=s,Qc(n,t,e.type,void 0,(r=e.eventId)!==null&&r!==void 0?r:void 0,o)}async function wT(n){const{BuildInfo:e}=ar(),t={};di()?t.iosBundleId=e.packageName:Us()?t.androidPackageName=e.packageName:$e(n,"operation-not-supported-in-this-environment"),await Ig(n,t)}function vT(n){const{cordova:e}=ar();return new Promise(t=>{e.plugins.browsertab.isAvailable(r=>{let i=null;r?e.plugins.browsertab.openUrl(n):i=e.InAppBrowser.open(n,NI()?"_blank":"_system","location=yes"),t(i)})})}async function bT(n,e,t){const{cordova:r}=ar();let i=()=>{};try{await new Promise((s,o)=>{let a=null;function c(){var h;s();const d=(h=r.plugins.browsertab)===null||h===void 0?void 0:h.close;typeof d=="function"&&d(),typeof(t==null?void 0:t.close)=="function"&&t.close()}function u(){a||(a=window.setTimeout(()=>{o(Be(n,"redirect-cancelled-by-user"))},pT))}function l(){(document==null?void 0:document.visibilityState)==="visible"&&u()}e.addPassiveListener(c),document.addEventListener("resume",u,!1),Us()&&document.addEventListener("visibilitychange",l,!1),i=()=>{e.removePassiveListener(c),document.removeEventListener("resume",u,!1),document.removeEventListener("visibilitychange",l,!1),a&&window.clearTimeout(a)}})}finally{i()}}function IT(n){var e,t,r,i,s,o,a,c,u,l;const h=ar();b(typeof((e=h==null?void 0:h.universalLinks)===null||e===void 0?void 0:e.subscribe)=="function",n,"invalid-cordova-configuration",{missingPlugin:"cordova-universal-links-plugin-fix"}),b(typeof((t=h==null?void 0:h.BuildInfo)===null||t===void 0?void 0:t.packageName)<"u",n,"invalid-cordova-configuration",{missingPlugin:"cordova-plugin-buildInfo"}),b(typeof((s=(i=(r=h==null?void 0:h.cordova)===null||r===void 0?void 0:r.plugins)===null||i===void 0?void 0:i.browsertab)===null||s===void 0?void 0:s.openUrl)=="function",n,"invalid-cordova-configuration",{missingPlugin:"cordova-plugin-browsertab"}),b(typeof((c=(a=(o=h==null?void 0:h.cordova)===null||o===void 0?void 0:o.plugins)===null||a===void 0?void 0:a.browsertab)===null||c===void 0?void 0:c.isAvailable)=="function",n,"invalid-cordova-configuration",{missingPlugin:"cordova-plugin-browsertab"}),b(typeof((l=(u=h==null?void 0:h.cordova)===null||u===void 0?void 0:u.InAppBrowser)===null||l===void 0?void 0:l.open)=="function",n,"invalid-cordova-configuration",{missingPlugin:"cordova-plugin-inappbrowser"})}async function _T(n){const e=ET(n),t=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(t)).map(i=>i.toString(16).padStart(2,"0")).join("")}function ET(n){if(vt(/[0-9a-zA-Z]+/.test(n),"Can only convert alpha-numeric strings"),typeof TextEncoder<"u")return new TextEncoder().encode(n);const e=new ArrayBuffer(n.length),t=new Uint8Array(e);for(let r=0;r<n.length;r++)t[r]=n.charCodeAt(r);return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TT=20;class kT extends vg{constructor(){super(...arguments),this.passiveListeners=new Set,this.initPromise=new Promise(e=>{this.resolveInialized=e})}addPassiveListener(e){this.passiveListeners.add(e)}removePassiveListener(e){this.passiveListeners.delete(e)}resetRedirect(){this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1}onEvent(e){return this.resolveInialized(),this.passiveListeners.forEach(t=>t(e)),super.onEvent(e)}async initialized(){await this.initPromise}}function ST(n,e,t=null){return{type:e,eventId:t,urlResponse:null,sessionId:xT(),postBody:null,tenantId:n.tenantId,error:Be(n,"no-auth-event")}}function AT(n,e){return Xc()._set(Jc(n),e)}async function Ed(n){const e=await Xc()._get(Jc(n));return e&&await Xc()._remove(Jc(n)),e}function CT(n,e){var t,r;const i=NT(e);if(i.includes("/__/auth/callback")){const s=Po(i),o=s.firebaseError?DT(decodeURIComponent(s.firebaseError)):null,a=(r=(t=o==null?void 0:o.code)===null||t===void 0?void 0:t.split("auth/"))===null||r===void 0?void 0:r[1],c=a?Be(a):null;return c?{type:n.type,eventId:n.eventId,tenantId:n.tenantId,error:c,urlResponse:null,sessionId:null,postBody:null}:{type:n.type,eventId:n.eventId,tenantId:n.tenantId,sessionId:n.sessionId,urlResponse:i,postBody:null}}return null}function xT(){const n=[],e="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let t=0;t<TT;t++){const r=Math.floor(Math.random()*e.length);n.push(e.charAt(r))}return n.join("")}function Xc(){return ct(cl)}function Jc(n){return er("authEvent",n.config.apiKey,n.name)}function DT(n){try{return JSON.parse(n)}catch{return null}}function NT(n){const e=Po(n),t=e.link?decodeURIComponent(e.link):void 0,r=Po(t).link,i=e.deep_link_id?decodeURIComponent(e.deep_link_id):void 0;return Po(i).link||i||r||t||n}function Po(n){if(!(n!=null&&n.includes("?")))return{};const[e,...t]=n.split("?");return Lr(t.join("?"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RT=500;class PT{constructor(){this._redirectPersistence=sr,this._shouldInitProactively=!0,this.eventManagers=new Map,this.originValidationPromises={},this._completeRedirectFn=Ca,this._overrideRedirectResult=fl}async _initialize(e){const t=e._key();let r=this.eventManagers.get(t);return r||(r=new kT(e),this.eventManagers.set(t,r),this.attachCallbackListeners(e,r)),r}_openPopup(e){$e(e,"operation-not-supported-in-this-environment")}async _openRedirect(e,t,r,i){IT(e);const s=await this._initialize(e);await s.initialized(),s.resetRedirect(),CE(),await this._originValidation(e);const o=ST(e,r,i);await AT(e,o);const a=await yT(e,o,t),c=await vT(a);return bT(e,s,c)}_isIframeWebStorageSupported(e,t){throw new Error("Method not implemented.")}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=wT(e)),this.originValidationPromises[t]}attachCallbackListeners(e,t){const{universalLinks:r,handleOpenURL:i,BuildInfo:s}=ar(),o=setTimeout(async()=>{await Ed(e),t.onEvent(Td())},RT),a=async l=>{clearTimeout(o);const h=await Ed(e);let d=null;h&&(l!=null&&l.url)&&(d=CT(h,l.url)),t.onEvent(d||Td())};typeof r<"u"&&typeof r.subscribe=="function"&&r.subscribe(null,a);const c=i,u=`${s.packageName.toLowerCase()}://`;ar().handleOpenURL=async l=>{if(l.toLowerCase().startsWith(u)&&a({url:l}),typeof c=="function")try{c(l)}catch(h){console.error(h)}}}}const OT=PT;function Td(){return{type:"unknown",eventId:null,sessionId:null,urlResponse:null,postBody:null,tenantId:null,error:Be("no-auth-event")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function MT(n,e){ve(n)._logFramework(e)}var LT="@firebase/auth-compat",FT="0.4.2";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const VT=1e3;function es(){var n;return((n=self==null?void 0:self.location)===null||n===void 0?void 0:n.protocol)||null}function UT(){return es()==="http:"||es()==="https:"}function Eg(n=ue()){return!!((es()==="file:"||es()==="ionic:"||es()==="capacitor:")&&n.toLowerCase().match(/iphone|ipad|ipod|android/))}function BT(){return Hu()||Wu()}function qT(){return wm()&&(document==null?void 0:document.documentMode)===11}function $T(n=ue()){return/Edge\/\d+/.test(n)}function zT(n=ue()){return qT()||$T(n)}function Tg(){try{const n=self.localStorage,e=qs();if(n)return n.setItem(e,"1"),n.removeItem(e),zT()?us():!0}catch{return gl()&&us()}return!1}function gl(){return typeof global<"u"&&"WorkerGlobalScope"in global&&"importScripts"in global}function xc(){return(UT()||ym()||Eg())&&!BT()&&Tg()&&!gl()}function kg(){return Eg()&&typeof document<"u"}async function jT(){return kg()?new Promise(n=>{const e=setTimeout(()=>{n(!1)},VT);document.addEventListener("deviceready",()=>{clearTimeout(e),n(!0)})}):!1}function GT(){return typeof window<"u"?window:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const at={LOCAL:"local",NONE:"none",SESSION:"session"},Ri=b,Sg="persistence";function WT(n,e){if(Ri(Object.values(at).includes(e),n,"invalid-persistence-type"),Hu()){Ri(e!==at.SESSION,n,"unsupported-persistence-type");return}if(Wu()){Ri(e===at.NONE,n,"unsupported-persistence-type");return}if(gl()){Ri(e===at.NONE||e===at.LOCAL&&us(),n,"unsupported-persistence-type");return}Ri(e===at.NONE||Tg(),n,"unsupported-persistence-type")}async function Zc(n){await n._initializationPromise;const e=Ag(),t=er(Sg,n.config.apiKey,n.name);e&&e.setItem(t,n._getPersistence())}function HT(n,e){const t=Ag();if(!t)return[];const r=er(Sg,n,e);switch(t.getItem(r)){case at.NONE:return[Kr];case at.LOCAL:return[ps,sr];case at.SESSION:return[sr];default:return[]}}function Ag(){var n;try{return((n=GT())===null||n===void 0?void 0:n.sessionStorage)||null}catch{return null}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const KT=b;class fn{constructor(){this.browserResolver=ct(lT),this.cordovaResolver=ct(OT),this.underlyingResolver=null,this._redirectPersistence=sr,this._completeRedirectFn=Ca,this._overrideRedirectResult=fl}async _initialize(e){return await this.selectUnderlyingResolver(),this.assertedUnderlyingResolver._initialize(e)}async _openPopup(e,t,r,i){return await this.selectUnderlyingResolver(),this.assertedUnderlyingResolver._openPopup(e,t,r,i)}async _openRedirect(e,t,r,i){return await this.selectUnderlyingResolver(),this.assertedUnderlyingResolver._openRedirect(e,t,r,i)}_isIframeWebStorageSupported(e,t){this.assertedUnderlyingResolver._isIframeWebStorageSupported(e,t)}_originValidation(e){return this.assertedUnderlyingResolver._originValidation(e)}get _shouldInitProactively(){return kg()||this.browserResolver._shouldInitProactively}get assertedUnderlyingResolver(){return KT(this.underlyingResolver,"internal-error"),this.underlyingResolver}async selectUnderlyingResolver(){if(this.underlyingResolver)return;const e=await jT();this.underlyingResolver=e?this.cordovaResolver:this.browserResolver}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cg(n){return n.unwrap()}function YT(n){return n.wrapped()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QT(n){return xg(n)}function XT(n,e){var t;const r=(t=e.customData)===null||t===void 0?void 0:t._tokenResponse;if((e==null?void 0:e.code)==="auth/multi-factor-auth-required"){const i=e;i.resolver=new JT(n,O_(n,e))}else if(r){const i=xg(e),s=e;i&&(s.credential=i,s.tenantId=r.tenantId||void 0,s.email=r.email||void 0,s.phoneNumber=r.phoneNumber||void 0)}}function xg(n){const{_tokenResponse:e}=n instanceof De?n.customData:n;if(!e)return null;if(!(n instanceof De)&&"temporaryProof"in e&&"phoneNumber"in e)return or.credentialFromResult(n);const t=e.providerId;if(!t||t===Ni.PASSWORD)return null;let r;switch(t){case Ni.GOOGLE:r=Et;break;case Ni.FACEBOOK:r=_t;break;case Ni.GITHUB:r=Tt;break;case Ni.TWITTER:r=kt;break;default:const{oauthIdToken:i,oauthAccessToken:s,oauthTokenSecret:o,pendingToken:a,nonce:c}=e;return!s&&!o&&!i&&!a?null:a?t.startsWith("saml.")?Yr._create(t,a):Lt._fromParams({providerId:t,signInMethod:t,pendingToken:a,idToken:i,accessToken:s}):new Br(t).credential({idToken:i,accessToken:s,rawNonce:c})}return n instanceof De?r.credentialFromError(n):r.credentialFromResult(n)}function et(n,e){return e.catch(t=>{throw t instanceof De&&XT(n,t),t}).then(t=>{const r=t.operationType,i=t.user;return{operationType:r,credential:QT(t),additionalUserInfo:P_(t),user:zt.getOrCreate(i)}})}async function eu(n,e){const t=await e;return{verificationId:t.verificationId,confirm:r=>et(n,t.confirm(r))}}class JT{constructor(e,t){this.resolver=t,this.auth=YT(e)}get session(){return this.resolver.session}get hints(){return this.resolver.hints}resolveSignIn(e){return et(Cg(this.auth),this.resolver.resolveSignIn(e))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zt{constructor(e){this._delegate=e,this.multiFactor=V_(e)}static getOrCreate(e){return zt.USER_MAP.has(e)||zt.USER_MAP.set(e,new zt(e)),zt.USER_MAP.get(e)}delete(){return this._delegate.delete()}reload(){return this._delegate.reload()}toJSON(){return this._delegate.toJSON()}getIdTokenResult(e){return this._delegate.getIdTokenResult(e)}getIdToken(e){return this._delegate.getIdToken(e)}linkAndRetrieveDataWithCredential(e){return this.linkWithCredential(e)}async linkWithCredential(e){return et(this.auth,rg(this._delegate,e))}async linkWithPhoneNumber(e,t){return eu(this.auth,gE(this._delegate,e,t))}async linkWithPopup(e){return et(this.auth,TE(this._delegate,e,fn))}async linkWithRedirect(e){return await Zc(ve(this.auth)),PE(this._delegate,e,fn)}reauthenticateAndRetrieveDataWithCredential(e){return this.reauthenticateWithCredential(e)}async reauthenticateWithCredential(e){return et(this.auth,ig(this._delegate,e))}reauthenticateWithPhoneNumber(e,t){return eu(this.auth,pE(this._delegate,e,t))}reauthenticateWithPopup(e){return et(this.auth,EE(this._delegate,e,fn))}async reauthenticateWithRedirect(e){return await Zc(ve(this.auth)),NE(this._delegate,e,fn)}sendEmailVerification(e){return __(this._delegate,e)}async unlink(e){return await c_(this._delegate,e),this}updateEmail(e){return S_(this._delegate,e)}updatePassword(e){return A_(this._delegate,e)}updatePhoneNumber(e){return yE(this._delegate,e)}updateProfile(e){return k_(this._delegate,e)}verifyBeforeUpdateEmail(e,t){return E_(this._delegate,e,t)}get emailVerified(){return this._delegate.emailVerified}get isAnonymous(){return this._delegate.isAnonymous}get metadata(){return this._delegate.metadata}get phoneNumber(){return this._delegate.phoneNumber}get providerData(){return this._delegate.providerData}get refreshToken(){return this._delegate.refreshToken}get tenantId(){return this._delegate.tenantId}get displayName(){return this._delegate.displayName}get email(){return this._delegate.email}get photoURL(){return this._delegate.photoURL}get providerId(){return this._delegate.providerId}get uid(){return this._delegate.uid}get auth(){return this._delegate.auth}}zt.USER_MAP=new WeakMap;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pi=b;class tu{constructor(e,t){if(this.app=e,t.isInitialized()){this._delegate=t.getImmediate(),this.linkUnderlyingAuth();return}const{apiKey:r}=e.options;Pi(r,"invalid-api-key",{appName:e.name}),Pi(r,"invalid-api-key",{appName:e.name});const i=typeof window<"u"?fn:void 0;this._delegate=t.initialize({options:{persistence:ZT(r,e.name),popupRedirectResolver:i}}),this._delegate._updateErrorMap(dI),this.linkUnderlyingAuth()}get emulatorConfig(){return this._delegate.emulatorConfig}get currentUser(){return this._delegate.currentUser?zt.getOrCreate(this._delegate.currentUser):null}get languageCode(){return this._delegate.languageCode}set languageCode(e){this._delegate.languageCode=e}get settings(){return this._delegate.settings}get tenantId(){return this._delegate.tenantId}set tenantId(e){this._delegate.tenantId=e}useDeviceLanguage(){this._delegate.useDeviceLanguage()}signOut(){return this._delegate.signOut()}useEmulator(e,t){zI(this._delegate,e,t)}applyActionCode(e){return f_(this._delegate,e)}checkActionCode(e){return sg(this._delegate,e)}confirmPasswordReset(e,t){return d_(this._delegate,e,t)}async createUserWithEmailAndPassword(e,t){return et(this._delegate,g_(this._delegate,e,t))}fetchProvidersForEmail(e){return this.fetchSignInMethodsForEmail(e)}fetchSignInMethodsForEmail(e){return I_(this._delegate,e)}isSignInWithEmailLink(e){return w_(this._delegate,e)}async getRedirectResult(){Pi(xc(),this._delegate,"operation-not-supported-in-this-environment");const e=await ME(this._delegate,fn);return e?et(this._delegate,Promise.resolve(e)):{credential:null,user:null}}addFrameworkForLogging(e){MT(this._delegate,e)}onAuthStateChanged(e,t,r){const{next:i,error:s,complete:o}=kd(e,t,r);return this._delegate.onAuthStateChanged(i,s,o)}onIdTokenChanged(e,t,r){const{next:i,error:s,complete:o}=kd(e,t,r);return this._delegate.onIdTokenChanged(i,s,o)}sendSignInLinkToEmail(e,t){return y_(this._delegate,e,t)}sendPasswordResetEmail(e,t){return h_(this._delegate,e,t||void 0)}async setPersistence(e){WT(this._delegate,e);let t;switch(e){case at.SESSION:t=sr;break;case at.LOCAL:t=await ct(ps)._isAvailable()?ps:cl;break;case at.NONE:t=Kr;break;default:return $e("argument-error",{appName:this._delegate.name})}return this._delegate.setPersistence(t)}signInAndRetrieveDataWithCredential(e){return this.signInWithCredential(e)}signInAnonymously(){return et(this._delegate,a_(this._delegate))}signInWithCredential(e){return et(this._delegate,Ta(this._delegate,e))}signInWithCustomToken(e){return et(this._delegate,l_(this._delegate,e))}signInWithEmailAndPassword(e,t){return et(this._delegate,p_(this._delegate,e,t))}signInWithEmailLink(e,t){return et(this._delegate,v_(this._delegate,e,t))}signInWithPhoneNumber(e,t){return eu(this._delegate,mE(this._delegate,e,t))}async signInWithPopup(e){return Pi(xc(),this._delegate,"operation-not-supported-in-this-environment"),et(this._delegate,_E(this._delegate,e,fn))}async signInWithRedirect(e){return Pi(xc(),this._delegate,"operation-not-supported-in-this-environment"),await Zc(this._delegate),xE(this._delegate,e,fn)}updateCurrentUser(e){return this._delegate.updateCurrentUser(e)}verifyPasswordResetCode(e){return m_(this._delegate,e)}unwrap(){return this._delegate}_delete(){return this._delegate._delete()}linkUnderlyingAuth(){this._delegate.wrapped=()=>this}}tu.Persistence=at;function kd(n,e,t){let r=n;typeof n!="function"&&({next:r,error:e,complete:t}=n);const i=r;return{next:o=>i(o&&zt.getOrCreate(o)),error:e,complete:t}}function ZT(n,e){const t=HT(n,e);if(typeof self<"u"&&!t.includes(ps)&&t.push(ps),typeof window<"u")for(const r of[cl,sr])t.includes(r)||t.push(r);return t.includes(Kr)||t.push(Kr),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pl{constructor(){this.providerId="phone",this._delegate=new or(Cg(pt.auth()))}static credential(e,t){return or.credential(e,t)}verifyPhoneNumber(e,t){return this._delegate.verifyPhoneNumber(e,t)}unwrap(){return this._delegate}}pl.PHONE_SIGN_IN_METHOD=or.PHONE_SIGN_IN_METHOD;pl.PROVIDER_ID=or.PROVIDER_ID;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const e0=b;class t0{constructor(e,t,r=pt.app()){var i;e0((i=r.options)===null||i===void 0?void 0:i.apiKey,"invalid-api-key",{appName:r.name}),this._delegate=new dE(e,t,r.auth()),this.type=this._delegate.type}clear(){this._delegate.clear()}render(){return this._delegate.render()}verify(){return this._delegate.verify()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const n0="auth-compat";function r0(n){n.INTERNAL.registerComponent(new mt(n0,e=>{const t=e.getProvider("app-compat").getImmediate(),r=e.getProvider("auth");return new tu(t,r)},"PUBLIC").setServiceProps({ActionCodeInfo:{Operation:{EMAIL_SIGNIN:Ar.EMAIL_SIGNIN,PASSWORD_RESET:Ar.PASSWORD_RESET,RECOVER_EMAIL:Ar.RECOVER_EMAIL,REVERT_SECOND_FACTOR_ADDITION:Ar.REVERT_SECOND_FACTOR_ADDITION,VERIFY_AND_CHANGE_EMAIL:Ar.VERIFY_AND_CHANGE_EMAIL,VERIFY_EMAIL:Ar.VERIFY_EMAIL}},EmailAuthProvider:Dn,FacebookAuthProvider:_t,GithubAuthProvider:Tt,GoogleAuthProvider:Et,OAuthProvider:Br,SAMLAuthProvider:Wo,PhoneAuthProvider:pl,PhoneMultiFactorGenerator:_g,RecaptchaVerifier:t0,TwitterAuthProvider:kt,Auth:tu,AuthCredential:fi,Error:De}).setInstantiationMode("LAZY").setMultipleInstances(!1)),n.registerVersion(LT,FT)}r0(pt);var i0=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},k,yl=yl||{},F=i0||self;function xa(n){var e=typeof n;return e=e!="object"?e:n?Array.isArray(n)?"array":e:"null",e=="array"||e=="object"&&typeof n.length=="number"}function Da(n){var e=typeof n;return e=="object"&&n!=null||e=="function"}function s0(n,e,t){return n.call.apply(n.bind,arguments)}function o0(n,e,t){if(!n)throw Error();if(2<arguments.length){var r=Array.prototype.slice.call(arguments,2);return function(){var i=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(i,r),n.apply(e,i)}}return function(){return n.apply(e,arguments)}}function Ge(n,e,t){return Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?Ge=s0:Ge=o0,Ge.apply(null,arguments)}function go(n,e){var t=Array.prototype.slice.call(arguments,1);return function(){var r=t.slice();return r.push.apply(r,arguments),n.apply(this,r)}}function Oe(n,e){function t(){}t.prototype=e.prototype,n.$=e.prototype,n.prototype=new t,n.prototype.constructor=n,n.ac=function(r,i,s){for(var o=Array(arguments.length-2),a=2;a<arguments.length;a++)o[a-2]=arguments[a];return e.prototype[i].apply(r,o)}}function Nn(){this.s=this.s,this.o=this.o}var a0=0;Nn.prototype.s=!1;Nn.prototype.sa=function(){!this.s&&(this.s=!0,this.N(),a0!=0)};Nn.prototype.N=function(){if(this.o)for(;this.o.length;)this.o.shift()()};const Dg=Array.prototype.indexOf?function(n,e){return Array.prototype.indexOf.call(n,e,void 0)}:function(n,e){if(typeof n=="string")return typeof e!="string"||e.length!=1?-1:n.indexOf(e,0);for(let t=0;t<n.length;t++)if(t in n&&n[t]===e)return t;return-1};function wl(n){const e=n.length;if(0<e){const t=Array(e);for(let r=0;r<e;r++)t[r]=n[r];return t}return[]}function Sd(n,e){for(let t=1;t<arguments.length;t++){const r=arguments[t];if(xa(r)){const i=n.length||0,s=r.length||0;n.length=i+s;for(let o=0;o<s;o++)n[i+o]=r[o]}else n.push(r)}}function We(n,e){this.type=n,this.g=this.target=e,this.defaultPrevented=!1}We.prototype.h=function(){this.defaultPrevented=!0};var c0=function(){if(!F.addEventListener||!Object.defineProperty)return!1;var n=!1,e=Object.defineProperty({},"passive",{get:function(){n=!0}});try{F.addEventListener("test",()=>{},e),F.removeEventListener("test",()=>{},e)}catch{}return n}();function ys(n){return/^[\s\xa0]*$/.test(n)}function Na(){var n=F.navigator;return n&&(n=n.userAgent)?n:""}function St(n){return Na().indexOf(n)!=-1}function vl(n){return vl[" "](n),n}vl[" "]=function(){};function u0(n,e){var t=nk;return Object.prototype.hasOwnProperty.call(t,n)?t[n]:t[n]=e(n)}var l0=St("Opera"),Qr=St("Trident")||St("MSIE"),Ng=St("Edge"),nu=Ng||Qr,Rg=St("Gecko")&&!(Na().toLowerCase().indexOf("webkit")!=-1&&!St("Edge"))&&!(St("Trident")||St("MSIE"))&&!St("Edge"),h0=Na().toLowerCase().indexOf("webkit")!=-1&&!St("Edge");function Pg(){var n=F.document;return n?n.documentMode:void 0}var ru;e:{var Dc="",Nc=function(){var n=Na();if(Rg)return/rv:([^\);]+)(\)|;)/.exec(n);if(Ng)return/Edge\/([\d\.]+)/.exec(n);if(Qr)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(n);if(h0)return/WebKit\/(\S+)/.exec(n);if(l0)return/(?:Version)[ \/]?(\S+)/.exec(n)}();if(Nc&&(Dc=Nc?Nc[1]:""),Qr){var Rc=Pg();if(Rc!=null&&Rc>parseFloat(Dc)){ru=String(Rc);break e}}ru=Dc}var iu;if(F.document&&Qr){var Ad=Pg();iu=Ad||parseInt(ru,10)||void 0}else iu=void 0;var d0=iu;function ws(n,e){if(We.call(this,n?n.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,n){var t=this.type=n.type,r=n.changedTouches&&n.changedTouches.length?n.changedTouches[0]:null;if(this.target=n.target||n.srcElement,this.g=e,e=n.relatedTarget){if(Rg){e:{try{vl(e.nodeName);var i=!0;break e}catch{}i=!1}i||(e=null)}}else t=="mouseover"?e=n.fromElement:t=="mouseout"&&(e=n.toElement);this.relatedTarget=e,r?(this.clientX=r.clientX!==void 0?r.clientX:r.pageX,this.clientY=r.clientY!==void 0?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0):(this.clientX=n.clientX!==void 0?n.clientX:n.pageX,this.clientY=n.clientY!==void 0?n.clientY:n.pageY,this.screenX=n.screenX||0,this.screenY=n.screenY||0),this.button=n.button,this.key=n.key||"",this.ctrlKey=n.ctrlKey,this.altKey=n.altKey,this.shiftKey=n.shiftKey,this.metaKey=n.metaKey,this.pointerId=n.pointerId||0,this.pointerType=typeof n.pointerType=="string"?n.pointerType:f0[n.pointerType]||"",this.state=n.state,this.i=n,n.defaultPrevented&&ws.$.h.call(this)}}Oe(ws,We);var f0={2:"touch",3:"pen",4:"mouse"};ws.prototype.h=function(){ws.$.h.call(this);var n=this.i;n.preventDefault?n.preventDefault():n.returnValue=!1};var Ra="closure_listenable_"+(1e6*Math.random()|0),m0=0;function g0(n,e,t,r,i){this.listener=n,this.proxy=null,this.src=e,this.type=t,this.capture=!!r,this.la=i,this.key=++m0,this.fa=this.ia=!1}function Pa(n){n.fa=!0,n.listener=null,n.proxy=null,n.src=null,n.la=null}function bl(n,e,t){for(const r in n)e.call(t,n[r],r,n)}function p0(n,e){for(const t in n)e.call(void 0,n[t],t,n)}function Og(n){const e={};for(const t in n)e[t]=n[t];return e}const Cd="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Mg(n,e){let t,r;for(let i=1;i<arguments.length;i++){r=arguments[i];for(t in r)n[t]=r[t];for(let s=0;s<Cd.length;s++)t=Cd[s],Object.prototype.hasOwnProperty.call(r,t)&&(n[t]=r[t])}}function Oa(n){this.src=n,this.g={},this.h=0}Oa.prototype.add=function(n,e,t,r,i){var s=n.toString();n=this.g[s],n||(n=this.g[s]=[],this.h++);var o=ou(n,e,r,i);return-1<o?(e=n[o],t||(e.ia=!1)):(e=new g0(e,this.src,s,!!r,i),e.ia=t,n.push(e)),e};function su(n,e){var t=e.type;if(t in n.g){var r=n.g[t],i=Dg(r,e),s;(s=0<=i)&&Array.prototype.splice.call(r,i,1),s&&(Pa(e),n.g[t].length==0&&(delete n.g[t],n.h--))}}function ou(n,e,t,r){for(var i=0;i<n.length;++i){var s=n[i];if(!s.fa&&s.listener==e&&s.capture==!!t&&s.la==r)return i}return-1}var Il="closure_lm_"+(1e6*Math.random()|0),Pc={};function Lg(n,e,t,r,i){if(Array.isArray(e)){for(var s=0;s<e.length;s++)Lg(n,e[s],t,r,i);return null}return t=Ug(t),n&&n[Ra]?n.O(e,t,Da(r)?!!r.capture:!1,i):y0(n,e,t,!1,r,i)}function y0(n,e,t,r,i,s){if(!e)throw Error("Invalid event type");var o=Da(i)?!!i.capture:!!i,a=El(n);if(a||(n[Il]=a=new Oa(n)),t=a.add(e,t,r,o,s),t.proxy)return t;if(r=w0(),t.proxy=r,r.src=n,r.listener=t,n.addEventListener)c0||(i=o),i===void 0&&(i=!1),n.addEventListener(e.toString(),r,i);else if(n.attachEvent)n.attachEvent(Vg(e.toString()),r);else if(n.addListener&&n.removeListener)n.addListener(r);else throw Error("addEventListener and attachEvent are unavailable.");return t}function w0(){function n(t){return e.call(n.src,n.listener,t)}const e=v0;return n}function Fg(n,e,t,r,i){if(Array.isArray(e))for(var s=0;s<e.length;s++)Fg(n,e[s],t,r,i);else r=Da(r)?!!r.capture:!!r,t=Ug(t),n&&n[Ra]?(n=n.i,e=String(e).toString(),e in n.g&&(s=n.g[e],t=ou(s,t,r,i),-1<t&&(Pa(s[t]),Array.prototype.splice.call(s,t,1),s.length==0&&(delete n.g[e],n.h--)))):n&&(n=El(n))&&(e=n.g[e.toString()],n=-1,e&&(n=ou(e,t,r,i)),(t=-1<n?e[n]:null)&&_l(t))}function _l(n){if(typeof n!="number"&&n&&!n.fa){var e=n.src;if(e&&e[Ra])su(e.i,n);else{var t=n.type,r=n.proxy;e.removeEventListener?e.removeEventListener(t,r,n.capture):e.detachEvent?e.detachEvent(Vg(t),r):e.addListener&&e.removeListener&&e.removeListener(r),(t=El(e))?(su(t,n),t.h==0&&(t.src=null,e[Il]=null)):Pa(n)}}}function Vg(n){return n in Pc?Pc[n]:Pc[n]="on"+n}function v0(n,e){if(n.fa)n=!0;else{e=new ws(e,this);var t=n.listener,r=n.la||n.src;n.ia&&_l(n),n=t.call(r,e)}return n}function El(n){return n=n[Il],n instanceof Oa?n:null}var Oc="__closure_events_fn_"+(1e9*Math.random()>>>0);function Ug(n){return typeof n=="function"?n:(n[Oc]||(n[Oc]=function(e){return n.handleEvent(e)}),n[Oc])}function Re(){Nn.call(this),this.i=new Oa(this),this.S=this,this.J=null}Oe(Re,Nn);Re.prototype[Ra]=!0;Re.prototype.removeEventListener=function(n,e,t,r){Fg(this,n,e,t,r)};function qe(n,e){var t,r=n.J;if(r)for(t=[];r;r=r.J)t.push(r);if(n=n.S,r=e.type||e,typeof e=="string")e=new We(e,n);else if(e instanceof We)e.target=e.target||n;else{var i=e;e=new We(r,n),Mg(e,i)}if(i=!0,t)for(var s=t.length-1;0<=s;s--){var o=e.g=t[s];i=po(o,r,!0,e)&&i}if(o=e.g=n,i=po(o,r,!0,e)&&i,i=po(o,r,!1,e)&&i,t)for(s=0;s<t.length;s++)o=e.g=t[s],i=po(o,r,!1,e)&&i}Re.prototype.N=function(){if(Re.$.N.call(this),this.i){var n=this.i,e;for(e in n.g){for(var t=n.g[e],r=0;r<t.length;r++)Pa(t[r]);delete n.g[e],n.h--}}this.J=null};Re.prototype.O=function(n,e,t,r){return this.i.add(String(n),e,!1,t,r)};Re.prototype.P=function(n,e,t,r){return this.i.add(String(n),e,!0,t,r)};function po(n,e,t,r){if(e=n.i.g[String(e)],!e)return!0;e=e.concat();for(var i=!0,s=0;s<e.length;++s){var o=e[s];if(o&&!o.fa&&o.capture==t){var a=o.listener,c=o.la||o.src;o.ia&&su(n.i,o),i=a.call(c,r)!==!1&&i}}return i&&!r.defaultPrevented}var Tl=F.JSON.stringify;class b0{constructor(e,t){this.i=e,this.j=t,this.h=0,this.g=null}get(){let e;return 0<this.h?(this.h--,e=this.g,this.g=e.next,e.next=null):e=this.i(),e}}function I0(){var n=kl;let e=null;return n.g&&(e=n.g,n.g=n.g.next,n.g||(n.h=null),e.next=null),e}class _0{constructor(){this.h=this.g=null}add(e,t){const r=Bg.get();r.set(e,t),this.h?this.h.next=r:this.g=r,this.h=r}}var Bg=new b0(()=>new E0,n=>n.reset());class E0{constructor(){this.next=this.g=this.h=null}set(e,t){this.h=e,this.g=t,this.next=null}reset(){this.next=this.g=this.h=null}}function T0(n){var e=1;n=n.split(":");const t=[];for(;0<e&&n.length;)t.push(n.shift()),e--;return n.length&&t.push(n.join(":")),t}function k0(n){F.setTimeout(()=>{throw n},0)}let vs,bs=!1,kl=new _0,qg=()=>{const n=F.Promise.resolve(void 0);vs=()=>{n.then(S0)}};var S0=()=>{for(var n;n=I0();){try{n.h.call(n.g)}catch(t){k0(t)}var e=Bg;e.j(n),100>e.h&&(e.h++,n.next=e.g,e.g=n)}bs=!1};function Ma(n,e){Re.call(this),this.h=n||1,this.g=e||F,this.j=Ge(this.qb,this),this.l=Date.now()}Oe(Ma,Re);k=Ma.prototype;k.ga=!1;k.T=null;k.qb=function(){if(this.ga){var n=Date.now()-this.l;0<n&&n<.8*this.h?this.T=this.g.setTimeout(this.j,this.h-n):(this.T&&(this.g.clearTimeout(this.T),this.T=null),qe(this,"tick"),this.ga&&(Sl(this),this.start()))}};k.start=function(){this.ga=!0,this.T||(this.T=this.g.setTimeout(this.j,this.h),this.l=Date.now())};function Sl(n){n.ga=!1,n.T&&(n.g.clearTimeout(n.T),n.T=null)}k.N=function(){Ma.$.N.call(this),Sl(this),delete this.g};function Al(n,e,t){if(typeof n=="function")t&&(n=Ge(n,t));else if(n&&typeof n.handleEvent=="function")n=Ge(n.handleEvent,n);else throw Error("Invalid listener argument");return 2147483647<Number(e)?-1:F.setTimeout(n,e||0)}function $g(n){n.g=Al(()=>{n.g=null,n.i&&(n.i=!1,$g(n))},n.j);const e=n.h;n.h=null,n.m.apply(null,e)}class A0 extends Nn{constructor(e,t){super(),this.m=e,this.j=t,this.h=null,this.i=!1,this.g=null}l(e){this.h=arguments,this.g?this.i=!0:$g(this)}N(){super.N(),this.g&&(F.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Is(n){Nn.call(this),this.h=n,this.g={}}Oe(Is,Nn);var xd=[];function zg(n,e,t,r){Array.isArray(t)||(t&&(xd[0]=t.toString()),t=xd);for(var i=0;i<t.length;i++){var s=Lg(e,t[i],r||n.handleEvent,!1,n.h||n);if(!s)break;n.g[s.key]=s}}function jg(n){bl(n.g,function(e,t){this.g.hasOwnProperty(t)&&_l(e)},n),n.g={}}Is.prototype.N=function(){Is.$.N.call(this),jg(this)};Is.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};function La(){this.g=!0}La.prototype.Ea=function(){this.g=!1};function C0(n,e,t,r,i,s){n.info(function(){if(n.g)if(s)for(var o="",a=s.split("&"),c=0;c<a.length;c++){var u=a[c].split("=");if(1<u.length){var l=u[0];u=u[1];var h=l.split("_");o=2<=h.length&&h[1]=="type"?o+(l+"="+u+"&"):o+(l+"=redacted&")}}else o=null;else o=s;return"XMLHTTP REQ ("+r+") [attempt "+i+"]: "+e+`
`+t+`
`+o})}function x0(n,e,t,r,i,s,o){n.info(function(){return"XMLHTTP RESP ("+r+") [ attempt "+i+"]: "+e+`
`+t+`
`+s+" "+o})}function Fr(n,e,t,r){n.info(function(){return"XMLHTTP TEXT ("+e+"): "+N0(n,t)+(r?" "+r:"")})}function D0(n,e){n.info(function(){return"TIMEOUT: "+e})}La.prototype.info=function(){};function N0(n,e){if(!n.g)return e;if(!e)return null;try{var t=JSON.parse(e);if(t){for(n=0;n<t.length;n++)if(Array.isArray(t[n])){var r=t[n];if(!(2>r.length)){var i=r[1];if(Array.isArray(i)&&!(1>i.length)){var s=i[0];if(s!="noop"&&s!="stop"&&s!="close")for(var o=1;o<i.length;o++)i[o]=""}}}}return Tl(t)}catch{return e}}var vr={},Dd=null;function Fa(){return Dd=Dd||new Re}vr.Ta="serverreachability";function Gg(n){We.call(this,vr.Ta,n)}Oe(Gg,We);function _s(n){const e=Fa();qe(e,new Gg(e))}vr.STAT_EVENT="statevent";function Wg(n,e){We.call(this,vr.STAT_EVENT,n),this.stat=e}Oe(Wg,We);function Je(n){const e=Fa();qe(e,new Wg(e,n))}vr.Ua="timingevent";function Hg(n,e){We.call(this,vr.Ua,n),this.size=e}Oe(Hg,We);function zs(n,e){if(typeof n!="function")throw Error("Fn must not be null and must be a function");return F.setTimeout(function(){n()},e)}var Va={NO_ERROR:0,rb:1,Eb:2,Db:3,yb:4,Cb:5,Fb:6,Qa:7,TIMEOUT:8,Ib:9},Kg={wb:"complete",Sb:"success",Ra:"error",Qa:"abort",Kb:"ready",Lb:"readystatechange",TIMEOUT:"timeout",Gb:"incrementaldata",Jb:"progress",zb:"downloadprogress",$b:"uploadprogress"};function Cl(){}Cl.prototype.h=null;function Nd(n){return n.h||(n.h=n.i())}function Yg(){}var js={OPEN:"a",vb:"b",Ra:"c",Hb:"d"};function xl(){We.call(this,"d")}Oe(xl,We);function Dl(){We.call(this,"c")}Oe(Dl,We);var au;function Ua(){}Oe(Ua,Cl);Ua.prototype.g=function(){return new XMLHttpRequest};Ua.prototype.i=function(){return{}};au=new Ua;function Gs(n,e,t,r){this.l=n,this.j=e,this.m=t,this.W=r||1,this.U=new Is(this),this.P=R0,n=nu?125:void 0,this.V=new Ma(n),this.I=null,this.i=!1,this.s=this.A=this.v=this.L=this.G=this.Y=this.B=null,this.F=[],this.g=null,this.C=0,this.o=this.u=null,this.ca=-1,this.J=!1,this.O=0,this.M=null,this.ba=this.K=this.aa=this.S=!1,this.h=new Qg}function Qg(){this.i=null,this.g="",this.h=!1}var R0=45e3,cu={},Qo={};k=Gs.prototype;k.setTimeout=function(n){this.P=n};function uu(n,e,t){n.L=1,n.v=qa(Qt(e)),n.s=t,n.S=!0,Xg(n,null)}function Xg(n,e){n.G=Date.now(),Ws(n),n.A=Qt(n.v);var t=n.A,r=n.W;Array.isArray(r)||(r=[String(r)]),sp(t.i,"t",r),n.C=0,t=n.l.J,n.h=new Qg,n.g=Sp(n.l,t?e:null,!n.s),0<n.O&&(n.M=new A0(Ge(n.Pa,n,n.g),n.O)),zg(n.U,n.g,"readystatechange",n.nb),e=n.I?Og(n.I):{},n.s?(n.u||(n.u="POST"),e["Content-Type"]="application/x-www-form-urlencoded",n.g.ha(n.A,n.u,n.s,e)):(n.u="GET",n.g.ha(n.A,n.u,null,e)),_s(),C0(n.j,n.u,n.A,n.m,n.W,n.s)}k.nb=function(n){n=n.target;const e=this.M;e&&Dt(n)==3?e.l():this.Pa(n)};k.Pa=function(n){try{if(n==this.g)e:{const l=Dt(this.g);var e=this.g.Ia();const h=this.g.da();if(!(3>l)&&(l!=3||nu||this.g&&(this.h.h||this.g.ja()||Md(this.g)))){this.J||l!=4||e==7||(e==8||0>=h?_s(3):_s(2)),Ba(this);var t=this.g.da();this.ca=t;t:if(Jg(this)){var r=Md(this.g);n="";var i=r.length,s=Dt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Yn(this),ts(this);var o="";break t}this.h.i=new F.TextDecoder}for(e=0;e<i;e++)this.h.h=!0,n+=this.h.i.decode(r[e],{stream:s&&e==i-1});r.splice(0,i),this.h.g+=n,this.C=0,o=this.h.g}else o=this.g.ja();if(this.i=t==200,x0(this.j,this.u,this.A,this.m,this.W,l,t),this.i){if(this.aa&&!this.K){t:{if(this.g){var a,c=this.g;if((a=c.g?c.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!ys(a)){var u=a;break t}}u=null}if(t=u)Fr(this.j,this.m,t,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,lu(this,t);else{this.i=!1,this.o=3,Je(12),Yn(this),ts(this);break e}}this.S?(Zg(this,l,o),nu&&this.i&&l==3&&(zg(this.U,this.V,"tick",this.mb),this.V.start())):(Fr(this.j,this.m,o,null),lu(this,o)),l==4&&Yn(this),this.i&&!this.J&&(l==4?_p(this.l,this):(this.i=!1,Ws(this)))}else Z0(this.g),t==400&&0<o.indexOf("Unknown SID")?(this.o=3,Je(12)):(this.o=0,Je(13)),Yn(this),ts(this)}}}catch{}finally{}};function Jg(n){return n.g?n.u=="GET"&&n.L!=2&&n.l.Ha:!1}function Zg(n,e,t){let r=!0,i;for(;!n.J&&n.C<t.length;)if(i=P0(n,t),i==Qo){e==4&&(n.o=4,Je(14),r=!1),Fr(n.j,n.m,null,"[Incomplete Response]");break}else if(i==cu){n.o=4,Je(15),Fr(n.j,n.m,t,"[Invalid Chunk]"),r=!1;break}else Fr(n.j,n.m,i,null),lu(n,i);Jg(n)&&i!=Qo&&i!=cu&&(n.h.g="",n.C=0),e!=4||t.length!=0||n.h.h||(n.o=1,Je(16),r=!1),n.i=n.i&&r,r?0<t.length&&!n.ba&&(n.ba=!0,e=n.l,e.g==n&&e.ca&&!e.M&&(e.l.info("Great, no buffering proxy detected. Bytes received: "+t.length),Ll(e),e.M=!0,Je(11))):(Fr(n.j,n.m,t,"[Invalid Chunked Response]"),Yn(n),ts(n))}k.mb=function(){if(this.g){var n=Dt(this.g),e=this.g.ja();this.C<e.length&&(Ba(this),Zg(this,n,e),this.i&&n!=4&&Ws(this))}};function P0(n,e){var t=n.C,r=e.indexOf(`
`,t);return r==-1?Qo:(t=Number(e.substring(t,r)),isNaN(t)?cu:(r+=1,r+t>e.length?Qo:(e=e.slice(r,r+t),n.C=r+t,e)))}k.cancel=function(){this.J=!0,Yn(this)};function Ws(n){n.Y=Date.now()+n.P,ep(n,n.P)}function ep(n,e){if(n.B!=null)throw Error("WatchDog timer not null");n.B=zs(Ge(n.lb,n),e)}function Ba(n){n.B&&(F.clearTimeout(n.B),n.B=null)}k.lb=function(){this.B=null;const n=Date.now();0<=n-this.Y?(D0(this.j,this.A),this.L!=2&&(_s(),Je(17)),Yn(this),this.o=2,ts(this)):ep(this,this.Y-n)};function ts(n){n.l.H==0||n.J||_p(n.l,n)}function Yn(n){Ba(n);var e=n.M;e&&typeof e.sa=="function"&&e.sa(),n.M=null,Sl(n.V),jg(n.U),n.g&&(e=n.g,n.g=null,e.abort(),e.sa())}function lu(n,e){try{var t=n.l;if(t.H!=0&&(t.g==n||hu(t.i,n))){if(!n.K&&hu(t.i,n)&&t.H==3){try{var r=t.Ja.g.parse(e)}catch{r=null}if(Array.isArray(r)&&r.length==3){var i=r;if(i[0]==0){e:if(!t.u){if(t.g)if(t.g.G+3e3<n.G)Zo(t),ja(t);else break e;Ml(t),Je(18)}}else t.Fa=i[1],0<t.Fa-t.V&&37500>i[2]&&t.G&&t.A==0&&!t.v&&(t.v=zs(Ge(t.ib,t),6e3));if(1>=cp(t.i)&&t.oa){try{t.oa()}catch{}t.oa=void 0}}else Qn(t,11)}else if((n.K||t.g==n)&&Zo(t),!ys(e))for(i=t.Ja.g.parse(e),e=0;e<i.length;e++){let u=i[e];if(t.V=u[0],u=u[1],t.H==2)if(u[0]=="c"){t.K=u[1],t.pa=u[2];const l=u[3];l!=null&&(t.ra=l,t.l.info("VER="+t.ra));const h=u[4];h!=null&&(t.Ga=h,t.l.info("SVER="+t.Ga));const d=u[5];d!=null&&typeof d=="number"&&0<d&&(r=1.5*d,t.L=r,t.l.info("backChannelRequestTimeoutMs_="+r)),r=t;const f=n.g;if(f){const p=f.g?f.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(p){var s=r.i;s.g||p.indexOf("spdy")==-1&&p.indexOf("quic")==-1&&p.indexOf("h2")==-1||(s.j=s.l,s.g=new Set,s.h&&(Nl(s,s.h),s.h=null))}if(r.F){const v=f.g?f.g.getResponseHeader("X-HTTP-Session-Id"):null;v&&(r.Da=v,ne(r.I,r.F,v))}}t.H=3,t.h&&t.h.Ba(),t.ca&&(t.S=Date.now()-n.G,t.l.info("Handshake RTT: "+t.S+"ms")),r=t;var o=n;if(r.wa=kp(r,r.J?r.pa:null,r.Y),o.K){up(r.i,o);var a=o,c=r.L;c&&a.setTimeout(c),a.B&&(Ba(a),Ws(a)),r.g=o}else bp(r);0<t.j.length&&Ga(t)}else u[0]!="stop"&&u[0]!="close"||Qn(t,7);else t.H==3&&(u[0]=="stop"||u[0]=="close"?u[0]=="stop"?Qn(t,7):Ol(t):u[0]!="noop"&&t.h&&t.h.Aa(u),t.A=0)}}_s(4)}catch{}}function O0(n){if(n.Z&&typeof n.Z=="function")return n.Z();if(typeof Map<"u"&&n instanceof Map||typeof Set<"u"&&n instanceof Set)return Array.from(n.values());if(typeof n=="string")return n.split("");if(xa(n)){for(var e=[],t=n.length,r=0;r<t;r++)e.push(n[r]);return e}e=[],t=0;for(r in n)e[t++]=n[r];return e}function M0(n){if(n.ta&&typeof n.ta=="function")return n.ta();if(!n.Z||typeof n.Z!="function"){if(typeof Map<"u"&&n instanceof Map)return Array.from(n.keys());if(!(typeof Set<"u"&&n instanceof Set)){if(xa(n)||typeof n=="string"){var e=[];n=n.length;for(var t=0;t<n;t++)e.push(t);return e}e=[],t=0;for(const r in n)e[t++]=r;return e}}}function tp(n,e){if(n.forEach&&typeof n.forEach=="function")n.forEach(e,void 0);else if(xa(n)||typeof n=="string")Array.prototype.forEach.call(n,e,void 0);else for(var t=M0(n),r=O0(n),i=r.length,s=0;s<i;s++)e.call(void 0,r[s],t&&t[s],n)}var np=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function L0(n,e){if(n){n=n.split("&");for(var t=0;t<n.length;t++){var r=n[t].indexOf("="),i=null;if(0<=r){var s=n[t].substring(0,r);i=n[t].substring(r+1)}else s=n[t];e(s,i?decodeURIComponent(i.replace(/\+/g," ")):"")}}}function nr(n){if(this.g=this.s=this.j="",this.m=null,this.o=this.l="",this.h=!1,n instanceof nr){this.h=n.h,Xo(this,n.j),this.s=n.s,this.g=n.g,Jo(this,n.m),this.l=n.l;var e=n.i,t=new Es;t.i=e.i,e.g&&(t.g=new Map(e.g),t.h=e.h),Rd(this,t),this.o=n.o}else n&&(e=String(n).match(np))?(this.h=!1,Xo(this,e[1]||"",!0),this.s=Hi(e[2]||""),this.g=Hi(e[3]||"",!0),Jo(this,e[4]),this.l=Hi(e[5]||"",!0),Rd(this,e[6]||"",!0),this.o=Hi(e[7]||"")):(this.h=!1,this.i=new Es(null,this.h))}nr.prototype.toString=function(){var n=[],e=this.j;e&&n.push(Ki(e,Pd,!0),":");var t=this.g;return(t||e=="file")&&(n.push("//"),(e=this.s)&&n.push(Ki(e,Pd,!0),"@"),n.push(encodeURIComponent(String(t)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t=this.m,t!=null&&n.push(":",String(t))),(t=this.l)&&(this.g&&t.charAt(0)!="/"&&n.push("/"),n.push(Ki(t,t.charAt(0)=="/"?U0:V0,!0))),(t=this.i.toString())&&n.push("?",t),(t=this.o)&&n.push("#",Ki(t,q0)),n.join("")};function Qt(n){return new nr(n)}function Xo(n,e,t){n.j=t?Hi(e,!0):e,n.j&&(n.j=n.j.replace(/:$/,""))}function Jo(n,e){if(e){if(e=Number(e),isNaN(e)||0>e)throw Error("Bad port number "+e);n.m=e}else n.m=null}function Rd(n,e,t){e instanceof Es?(n.i=e,$0(n.i,n.h)):(t||(e=Ki(e,B0)),n.i=new Es(e,n.h))}function ne(n,e,t){n.i.set(e,t)}function qa(n){return ne(n,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),n}function Hi(n,e){return n?e?decodeURI(n.replace(/%25/g,"%2525")):decodeURIComponent(n):""}function Ki(n,e,t){return typeof n=="string"?(n=encodeURI(n).replace(e,F0),t&&(n=n.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),n):null}function F0(n){return n=n.charCodeAt(0),"%"+(n>>4&15).toString(16)+(n&15).toString(16)}var Pd=/[#\/\?@]/g,V0=/[#\?:]/g,U0=/[#\?]/g,B0=/[#\?@]/g,q0=/#/g;function Es(n,e){this.h=this.g=null,this.i=n||null,this.j=!!e}function Rn(n){n.g||(n.g=new Map,n.h=0,n.i&&L0(n.i,function(e,t){n.add(decodeURIComponent(e.replace(/\+/g," ")),t)}))}k=Es.prototype;k.add=function(n,e){Rn(this),this.i=null,n=gi(this,n);var t=this.g.get(n);return t||this.g.set(n,t=[]),t.push(e),this.h+=1,this};function rp(n,e){Rn(n),e=gi(n,e),n.g.has(e)&&(n.i=null,n.h-=n.g.get(e).length,n.g.delete(e))}function ip(n,e){return Rn(n),e=gi(n,e),n.g.has(e)}k.forEach=function(n,e){Rn(this),this.g.forEach(function(t,r){t.forEach(function(i){n.call(e,i,r,this)},this)},this)};k.ta=function(){Rn(this);const n=Array.from(this.g.values()),e=Array.from(this.g.keys()),t=[];for(let r=0;r<e.length;r++){const i=n[r];for(let s=0;s<i.length;s++)t.push(e[r])}return t};k.Z=function(n){Rn(this);let e=[];if(typeof n=="string")ip(this,n)&&(e=e.concat(this.g.get(gi(this,n))));else{n=Array.from(this.g.values());for(let t=0;t<n.length;t++)e=e.concat(n[t])}return e};k.set=function(n,e){return Rn(this),this.i=null,n=gi(this,n),ip(this,n)&&(this.h-=this.g.get(n).length),this.g.set(n,[e]),this.h+=1,this};k.get=function(n,e){return n?(n=this.Z(n),0<n.length?String(n[0]):e):e};function sp(n,e,t){rp(n,e),0<t.length&&(n.i=null,n.g.set(gi(n,e),wl(t)),n.h+=t.length)}k.toString=function(){if(this.i)return this.i;if(!this.g)return"";const n=[],e=Array.from(this.g.keys());for(var t=0;t<e.length;t++){var r=e[t];const s=encodeURIComponent(String(r)),o=this.Z(r);for(r=0;r<o.length;r++){var i=s;o[r]!==""&&(i+="="+encodeURIComponent(String(o[r]))),n.push(i)}}return this.i=n.join("&")};function gi(n,e){return e=String(e),n.j&&(e=e.toLowerCase()),e}function $0(n,e){e&&!n.j&&(Rn(n),n.i=null,n.g.forEach(function(t,r){var i=r.toLowerCase();r!=i&&(rp(this,r),sp(this,i,t))},n)),n.j=e}var z0=class{constructor(n,e){this.g=n,this.map=e}};function op(n){this.l=n||j0,F.PerformanceNavigationTiming?(n=F.performance.getEntriesByType("navigation"),n=0<n.length&&(n[0].nextHopProtocol=="hq"||n[0].nextHopProtocol=="h2")):n=!!(F.g&&F.g.Ka&&F.g.Ka()&&F.g.Ka().ec),this.j=n?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}var j0=10;function ap(n){return n.h?!0:n.g?n.g.size>=n.j:!1}function cp(n){return n.h?1:n.g?n.g.size:0}function hu(n,e){return n.h?n.h==e:n.g?n.g.has(e):!1}function Nl(n,e){n.g?n.g.add(e):n.h=e}function up(n,e){n.h&&n.h==e?n.h=null:n.g&&n.g.has(e)&&n.g.delete(e)}op.prototype.cancel=function(){if(this.i=lp(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const n of this.g.values())n.cancel();this.g.clear()}};function lp(n){if(n.h!=null)return n.i.concat(n.h.F);if(n.g!=null&&n.g.size!==0){let e=n.i;for(const t of n.g.values())e=e.concat(t.F);return e}return wl(n.i)}var G0=class{stringify(n){return F.JSON.stringify(n,void 0)}parse(n){return F.JSON.parse(n,void 0)}};function W0(){this.g=new G0}function H0(n,e,t){const r=t||"";try{tp(n,function(i,s){let o=i;Da(i)&&(o=Tl(i)),e.push(r+s+"="+encodeURIComponent(o))})}catch(i){throw e.push(r+"type="+encodeURIComponent("_badmap")),i}}function K0(n,e){const t=new La;if(F.Image){const r=new Image;r.onload=go(yo,t,r,"TestLoadImage: loaded",!0,e),r.onerror=go(yo,t,r,"TestLoadImage: error",!1,e),r.onabort=go(yo,t,r,"TestLoadImage: abort",!1,e),r.ontimeout=go(yo,t,r,"TestLoadImage: timeout",!1,e),F.setTimeout(function(){r.ontimeout&&r.ontimeout()},1e4),r.src=n}else e(!1)}function yo(n,e,t,r,i){try{e.onload=null,e.onerror=null,e.onabort=null,e.ontimeout=null,i(r)}catch{}}function Hs(n){this.l=n.fc||null,this.j=n.ob||!1}Oe(Hs,Cl);Hs.prototype.g=function(){return new $a(this.l,this.j)};Hs.prototype.i=function(n){return function(){return n}}({});function $a(n,e){Re.call(this),this.F=n,this.u=e,this.m=void 0,this.readyState=Rl,this.status=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.v=new Headers,this.h=null,this.C="GET",this.B="",this.g=!1,this.A=this.j=this.l=null}Oe($a,Re);var Rl=0;k=$a.prototype;k.open=function(n,e){if(this.readyState!=Rl)throw this.abort(),Error("Error reopening a connection");this.C=n,this.B=e,this.readyState=1,Ts(this)};k.send=function(n){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const e={headers:this.v,method:this.C,credentials:this.m,cache:void 0};n&&(e.body=n),(this.F||F).fetch(new Request(this.B,e)).then(this.$a.bind(this),this.ka.bind(this))};k.abort=function(){this.response=this.responseText="",this.v=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Ks(this)),this.readyState=Rl};k.$a=function(n){if(this.g&&(this.l=n,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=n.headers,this.readyState=2,Ts(this)),this.g&&(this.readyState=3,Ts(this),this.g)))if(this.responseType==="arraybuffer")n.arrayBuffer().then(this.Ya.bind(this),this.ka.bind(this));else if(typeof F.ReadableStream<"u"&&"body"in n){if(this.j=n.body.getReader(),this.u){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.A=new TextDecoder;hp(this)}else n.text().then(this.Za.bind(this),this.ka.bind(this))};function hp(n){n.j.read().then(n.Xa.bind(n)).catch(n.ka.bind(n))}k.Xa=function(n){if(this.g){if(this.u&&n.value)this.response.push(n.value);else if(!this.u){var e=n.value?n.value:new Uint8Array(0);(e=this.A.decode(e,{stream:!n.done}))&&(this.response=this.responseText+=e)}n.done?Ks(this):Ts(this),this.readyState==3&&hp(this)}};k.Za=function(n){this.g&&(this.response=this.responseText=n,Ks(this))};k.Ya=function(n){this.g&&(this.response=n,Ks(this))};k.ka=function(){this.g&&Ks(this)};function Ks(n){n.readyState=4,n.l=null,n.j=null,n.A=null,Ts(n)}k.setRequestHeader=function(n,e){this.v.append(n,e)};k.getResponseHeader=function(n){return this.h&&this.h.get(n.toLowerCase())||""};k.getAllResponseHeaders=function(){if(!this.h)return"";const n=[],e=this.h.entries();for(var t=e.next();!t.done;)t=t.value,n.push(t[0]+": "+t[1]),t=e.next();return n.join(`\r
`)};function Ts(n){n.onreadystatechange&&n.onreadystatechange.call(n)}Object.defineProperty($a.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(n){this.m=n?"include":"same-origin"}});var Y0=F.JSON.parse;function he(n){Re.call(this),this.headers=new Map,this.u=n||null,this.h=!1,this.C=this.g=null,this.I="",this.m=0,this.j="",this.l=this.G=this.v=this.F=!1,this.B=0,this.A=null,this.K=dp,this.L=this.M=!1}Oe(he,Re);var dp="",Q0=/^https?$/i,X0=["POST","PUT"];k=he.prototype;k.Oa=function(n){this.M=n};k.ha=function(n,e,t,r){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.I+"; newUri="+n);e=e?e.toUpperCase():"GET",this.I=n,this.j="",this.m=0,this.F=!1,this.h=!0,this.g=this.u?this.u.g():au.g(),this.C=this.u?Nd(this.u):Nd(au),this.g.onreadystatechange=Ge(this.La,this);try{this.G=!0,this.g.open(e,String(n),!0),this.G=!1}catch(s){Od(this,s);return}if(n=t||"",t=new Map(this.headers),r)if(Object.getPrototypeOf(r)===Object.prototype)for(var i in r)t.set(i,r[i]);else if(typeof r.keys=="function"&&typeof r.get=="function")for(const s of r.keys())t.set(s,r.get(s));else throw Error("Unknown input type for opt_headers: "+String(r));r=Array.from(t.keys()).find(s=>s.toLowerCase()=="content-type"),i=F.FormData&&n instanceof F.FormData,!(0<=Dg(X0,e))||r||i||t.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[s,o]of t)this.g.setRequestHeader(s,o);this.K&&(this.g.responseType=this.K),"withCredentials"in this.g&&this.g.withCredentials!==this.M&&(this.g.withCredentials=this.M);try{gp(this),0<this.B&&((this.L=J0(this.g))?(this.g.timeout=this.B,this.g.ontimeout=Ge(this.ua,this)):this.A=Al(this.ua,this.B,this)),this.v=!0,this.g.send(n),this.v=!1}catch(s){Od(this,s)}};function J0(n){return Qr&&typeof n.timeout=="number"&&n.ontimeout!==void 0}k.ua=function(){typeof yl<"u"&&this.g&&(this.j="Timed out after "+this.B+"ms, aborting",this.m=8,qe(this,"timeout"),this.abort(8))};function Od(n,e){n.h=!1,n.g&&(n.l=!0,n.g.abort(),n.l=!1),n.j=e,n.m=5,fp(n),za(n)}function fp(n){n.F||(n.F=!0,qe(n,"complete"),qe(n,"error"))}k.abort=function(n){this.g&&this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1,this.m=n||7,qe(this,"complete"),qe(this,"abort"),za(this))};k.N=function(){this.g&&(this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1),za(this,!0)),he.$.N.call(this)};k.La=function(){this.s||(this.G||this.v||this.l?mp(this):this.kb())};k.kb=function(){mp(this)};function mp(n){if(n.h&&typeof yl<"u"&&(!n.C[1]||Dt(n)!=4||n.da()!=2)){if(n.v&&Dt(n)==4)Al(n.La,0,n);else if(qe(n,"readystatechange"),Dt(n)==4){n.h=!1;try{const o=n.da();e:switch(o){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var e=!0;break e;default:e=!1}var t;if(!(t=e)){var r;if(r=o===0){var i=String(n.I).match(np)[1]||null;!i&&F.self&&F.self.location&&(i=F.self.location.protocol.slice(0,-1)),r=!Q0.test(i?i.toLowerCase():"")}t=r}if(t)qe(n,"complete"),qe(n,"success");else{n.m=6;try{var s=2<Dt(n)?n.g.statusText:""}catch{s=""}n.j=s+" ["+n.da()+"]",fp(n)}}finally{za(n)}}}}function za(n,e){if(n.g){gp(n);const t=n.g,r=n.C[0]?()=>{}:null;n.g=null,n.C=null,e||qe(n,"ready");try{t.onreadystatechange=r}catch{}}}function gp(n){n.g&&n.L&&(n.g.ontimeout=null),n.A&&(F.clearTimeout(n.A),n.A=null)}k.isActive=function(){return!!this.g};function Dt(n){return n.g?n.g.readyState:0}k.da=function(){try{return 2<Dt(this)?this.g.status:-1}catch{return-1}};k.ja=function(){try{return this.g?this.g.responseText:""}catch{return""}};k.Wa=function(n){if(this.g){var e=this.g.responseText;return n&&e.indexOf(n)==0&&(e=e.substring(n.length)),Y0(e)}};function Md(n){try{if(!n.g)return null;if("response"in n.g)return n.g.response;switch(n.K){case dp:case"text":return n.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in n.g)return n.g.mozResponseArrayBuffer}return null}catch{return null}}function Z0(n){const e={};n=(n.g&&2<=Dt(n)&&n.g.getAllResponseHeaders()||"").split(`\r
`);for(let r=0;r<n.length;r++){if(ys(n[r]))continue;var t=T0(n[r]);const i=t[0];if(t=t[1],typeof t!="string")continue;t=t.trim();const s=e[i]||[];e[i]=s,s.push(t)}p0(e,function(r){return r.join(", ")})}k.Ia=function(){return this.m};k.Sa=function(){return typeof this.j=="string"?this.j:String(this.j)};function pp(n){let e="";return bl(n,function(t,r){e+=r,e+=":",e+=t,e+=`\r
`}),e}function Pl(n,e,t){e:{for(r in t){var r=!1;break e}r=!0}r||(t=pp(t),typeof n=="string"?t!=null&&encodeURIComponent(String(t)):ne(n,e,t))}function Oi(n,e,t){return t&&t.internalChannelParams&&t.internalChannelParams[n]||e}function yp(n){this.Ga=0,this.j=[],this.l=new La,this.pa=this.wa=this.I=this.Y=this.g=this.Da=this.F=this.na=this.o=this.U=this.s=null,this.fb=this.W=0,this.cb=Oi("failFast",!1,n),this.G=this.v=this.u=this.m=this.h=null,this.aa=!0,this.Fa=this.V=-1,this.ba=this.A=this.C=0,this.ab=Oi("baseRetryDelayMs",5e3,n),this.hb=Oi("retryDelaySeedMs",1e4,n),this.eb=Oi("forwardChannelMaxRetries",2,n),this.xa=Oi("forwardChannelRequestTimeoutMs",2e4,n),this.va=n&&n.xmlHttpFactory||void 0,this.Ha=n&&n.dc||!1,this.L=void 0,this.J=n&&n.supportsCrossDomainXhr||!1,this.K="",this.i=new op(n&&n.concurrentRequestLimit),this.Ja=new W0,this.P=n&&n.fastHandshake||!1,this.O=n&&n.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.bb=n&&n.bc||!1,n&&n.Ea&&this.l.Ea(),n&&n.forceLongPolling&&(this.aa=!1),this.ca=!this.P&&this.aa&&n&&n.detectBufferingProxy||!1,this.qa=void 0,n&&n.longPollingTimeout&&0<n.longPollingTimeout&&(this.qa=n.longPollingTimeout),this.oa=void 0,this.S=0,this.M=!1,this.ma=this.B=null}k=yp.prototype;k.ra=8;k.H=1;function Ol(n){if(wp(n),n.H==3){var e=n.W++,t=Qt(n.I);if(ne(t,"SID",n.K),ne(t,"RID",e),ne(t,"TYPE","terminate"),Ys(n,t),e=new Gs(n,n.l,e),e.L=2,e.v=qa(Qt(t)),t=!1,F.navigator&&F.navigator.sendBeacon)try{t=F.navigator.sendBeacon(e.v.toString(),"")}catch{}!t&&F.Image&&(new Image().src=e.v,t=!0),t||(e.g=Sp(e.l,null),e.g.ha(e.v)),e.G=Date.now(),Ws(e)}Tp(n)}function ja(n){n.g&&(Ll(n),n.g.cancel(),n.g=null)}function wp(n){ja(n),n.u&&(F.clearTimeout(n.u),n.u=null),Zo(n),n.i.cancel(),n.m&&(typeof n.m=="number"&&F.clearTimeout(n.m),n.m=null)}function Ga(n){if(!ap(n.i)&&!n.m){n.m=!0;var e=n.Na;vs||qg(),bs||(vs(),bs=!0),kl.add(e,n),n.C=0}}function ek(n,e){return cp(n.i)>=n.i.j-(n.m?1:0)?!1:n.m?(n.j=e.F.concat(n.j),!0):n.H==1||n.H==2||n.C>=(n.cb?0:n.eb)?!1:(n.m=zs(Ge(n.Na,n,e),Ep(n,n.C)),n.C++,!0)}k.Na=function(n){if(this.m)if(this.m=null,this.H==1){if(!n){this.W=Math.floor(1e5*Math.random()),n=this.W++;const i=new Gs(this,this.l,n);let s=this.s;if(this.U&&(s?(s=Og(s),Mg(s,this.U)):s=this.U),this.o!==null||this.O||(i.I=s,s=null),this.P)e:{for(var e=0,t=0;t<this.j.length;t++){t:{var r=this.j[t];if("__data__"in r.map&&(r=r.map.__data__,typeof r=="string")){r=r.length;break t}r=void 0}if(r===void 0)break;if(e+=r,4096<e){e=t;break e}if(e===4096||t===this.j.length-1){e=t+1;break e}}e=1e3}else e=1e3;e=vp(this,i,e),t=Qt(this.I),ne(t,"RID",n),ne(t,"CVER",22),this.F&&ne(t,"X-HTTP-Session-Id",this.F),Ys(this,t),s&&(this.O?e="headers="+encodeURIComponent(String(pp(s)))+"&"+e:this.o&&Pl(t,this.o,s)),Nl(this.i,i),this.bb&&ne(t,"TYPE","init"),this.P?(ne(t,"$req",e),ne(t,"SID","null"),i.aa=!0,uu(i,t,null)):uu(i,t,e),this.H=2}}else this.H==3&&(n?Ld(this,n):this.j.length==0||ap(this.i)||Ld(this))};function Ld(n,e){var t;e?t=e.m:t=n.W++;const r=Qt(n.I);ne(r,"SID",n.K),ne(r,"RID",t),ne(r,"AID",n.V),Ys(n,r),n.o&&n.s&&Pl(r,n.o,n.s),t=new Gs(n,n.l,t,n.C+1),n.o===null&&(t.I=n.s),e&&(n.j=e.F.concat(n.j)),e=vp(n,t,1e3),t.setTimeout(Math.round(.5*n.xa)+Math.round(.5*n.xa*Math.random())),Nl(n.i,t),uu(t,r,e)}function Ys(n,e){n.na&&bl(n.na,function(t,r){ne(e,r,t)}),n.h&&tp({},function(t,r){ne(e,r,t)})}function vp(n,e,t){t=Math.min(n.j.length,t);var r=n.h?Ge(n.h.Va,n.h,n):null;e:{var i=n.j;let s=-1;for(;;){const o=["count="+t];s==-1?0<t?(s=i[0].g,o.push("ofs="+s)):s=0:o.push("ofs="+s);let a=!0;for(let c=0;c<t;c++){let u=i[c].g;const l=i[c].map;if(u-=s,0>u)s=Math.max(0,i[c].g-100),a=!1;else try{H0(l,o,"req"+u+"_")}catch{r&&r(l)}}if(a){r=o.join("&");break e}}}return n=n.j.splice(0,t),e.F=n,r}function bp(n){if(!n.g&&!n.u){n.ba=1;var e=n.Ma;vs||qg(),bs||(vs(),bs=!0),kl.add(e,n),n.A=0}}function Ml(n){return n.g||n.u||3<=n.A?!1:(n.ba++,n.u=zs(Ge(n.Ma,n),Ep(n,n.A)),n.A++,!0)}k.Ma=function(){if(this.u=null,Ip(this),this.ca&&!(this.M||this.g==null||0>=this.S)){var n=2*this.S;this.l.info("BP detection timer enabled: "+n),this.B=zs(Ge(this.jb,this),n)}};k.jb=function(){this.B&&(this.B=null,this.l.info("BP detection timeout reached."),this.l.info("Buffering proxy detected and switch to long-polling!"),this.G=!1,this.M=!0,Je(10),ja(this),Ip(this))};function Ll(n){n.B!=null&&(F.clearTimeout(n.B),n.B=null)}function Ip(n){n.g=new Gs(n,n.l,"rpc",n.ba),n.o===null&&(n.g.I=n.s),n.g.O=0;var e=Qt(n.wa);ne(e,"RID","rpc"),ne(e,"SID",n.K),ne(e,"AID",n.V),ne(e,"CI",n.G?"0":"1"),!n.G&&n.qa&&ne(e,"TO",n.qa),ne(e,"TYPE","xmlhttp"),Ys(n,e),n.o&&n.s&&Pl(e,n.o,n.s),n.L&&n.g.setTimeout(n.L);var t=n.g;n=n.pa,t.L=1,t.v=qa(Qt(e)),t.s=null,t.S=!0,Xg(t,n)}k.ib=function(){this.v!=null&&(this.v=null,ja(this),Ml(this),Je(19))};function Zo(n){n.v!=null&&(F.clearTimeout(n.v),n.v=null)}function _p(n,e){var t=null;if(n.g==e){Zo(n),Ll(n),n.g=null;var r=2}else if(hu(n.i,e))t=e.F,up(n.i,e),r=1;else return;if(n.H!=0){if(e.i)if(r==1){t=e.s?e.s.length:0,e=Date.now()-e.G;var i=n.C;r=Fa(),qe(r,new Hg(r,t)),Ga(n)}else bp(n);else if(i=e.o,i==3||i==0&&0<e.ca||!(r==1&&ek(n,e)||r==2&&Ml(n)))switch(t&&0<t.length&&(e=n.i,e.i=e.i.concat(t)),i){case 1:Qn(n,5);break;case 4:Qn(n,10);break;case 3:Qn(n,6);break;default:Qn(n,2)}}}function Ep(n,e){let t=n.ab+Math.floor(Math.random()*n.hb);return n.isActive()||(t*=2),t*e}function Qn(n,e){if(n.l.info("Error code "+e),e==2){var t=null;n.h&&(t=null);var r=Ge(n.pb,n);t||(t=new nr("//www.google.com/images/cleardot.gif"),F.location&&F.location.protocol=="http"||Xo(t,"https"),qa(t)),K0(t.toString(),r)}else Je(2);n.H=0,n.h&&n.h.za(e),Tp(n),wp(n)}k.pb=function(n){n?(this.l.info("Successfully pinged google.com"),Je(2)):(this.l.info("Failed to ping google.com"),Je(1))};function Tp(n){if(n.H=0,n.ma=[],n.h){const e=lp(n.i);(e.length!=0||n.j.length!=0)&&(Sd(n.ma,e),Sd(n.ma,n.j),n.i.i.length=0,wl(n.j),n.j.length=0),n.h.ya()}}function kp(n,e,t){var r=t instanceof nr?Qt(t):new nr(t);if(r.g!="")e&&(r.g=e+"."+r.g),Jo(r,r.m);else{var i=F.location;r=i.protocol,e=e?e+"."+i.hostname:i.hostname,i=+i.port;var s=new nr(null);r&&Xo(s,r),e&&(s.g=e),i&&Jo(s,i),t&&(s.l=t),r=s}return t=n.F,e=n.Da,t&&e&&ne(r,t,e),ne(r,"VER",n.ra),Ys(n,r),r}function Sp(n,e,t){if(e&&!n.J)throw Error("Can't create secondary domain capable XhrIo object.");return e=t&&n.Ha&&!n.va?new he(new Hs({ob:!0})):new he(n.va),e.Oa(n.J),e}k.isActive=function(){return!!this.h&&this.h.isActive(this)};function Ap(){}k=Ap.prototype;k.Ba=function(){};k.Aa=function(){};k.za=function(){};k.ya=function(){};k.isActive=function(){return!0};k.Va=function(){};function ea(){if(Qr&&!(10<=Number(d0)))throw Error("Environmental error: no available transport.")}ea.prototype.g=function(n,e){return new ut(n,e)};function ut(n,e){Re.call(this),this.g=new yp(e),this.l=n,this.h=e&&e.messageUrlParams||null,n=e&&e.messageHeaders||null,e&&e.clientProtocolHeaderRequired&&(n?n["X-Client-Protocol"]="webchannel":n={"X-Client-Protocol":"webchannel"}),this.g.s=n,n=e&&e.initMessageHeaders||null,e&&e.messageContentType&&(n?n["X-WebChannel-Content-Type"]=e.messageContentType:n={"X-WebChannel-Content-Type":e.messageContentType}),e&&e.Ca&&(n?n["X-WebChannel-Client-Profile"]=e.Ca:n={"X-WebChannel-Client-Profile":e.Ca}),this.g.U=n,(n=e&&e.cc)&&!ys(n)&&(this.g.o=n),this.A=e&&e.supportsCrossDomainXhr||!1,this.v=e&&e.sendRawJson||!1,(e=e&&e.httpSessionIdParam)&&!ys(e)&&(this.g.F=e,n=this.h,n!==null&&e in n&&(n=this.h,e in n&&delete n[e])),this.j=new pi(this)}Oe(ut,Re);ut.prototype.m=function(){this.g.h=this.j,this.A&&(this.g.J=!0);var n=this.g,e=this.l,t=this.h||void 0;Je(0),n.Y=e,n.na=t||{},n.G=n.aa,n.I=kp(n,null,n.Y),Ga(n)};ut.prototype.close=function(){Ol(this.g)};ut.prototype.u=function(n){var e=this.g;if(typeof n=="string"){var t={};t.__data__=n,n=t}else this.v&&(t={},t.__data__=Tl(n),n=t);e.j.push(new z0(e.fb++,n)),e.H==3&&Ga(e)};ut.prototype.N=function(){this.g.h=null,delete this.j,Ol(this.g),delete this.g,ut.$.N.call(this)};function Cp(n){xl.call(this),n.__headers__&&(this.headers=n.__headers__,this.statusCode=n.__status__,delete n.__headers__,delete n.__status__);var e=n.__sm__;if(e){e:{for(const t in e){n=t;break e}n=void 0}(this.i=n)&&(n=this.i,e=e!==null&&n in e?e[n]:void 0),this.data=e}else this.data=n}Oe(Cp,xl);function xp(){Dl.call(this),this.status=1}Oe(xp,Dl);function pi(n){this.g=n}Oe(pi,Ap);pi.prototype.Ba=function(){qe(this.g,"a")};pi.prototype.Aa=function(n){qe(this.g,new Cp(n))};pi.prototype.za=function(n){qe(this.g,new xp)};pi.prototype.ya=function(){qe(this.g,"b")};function tk(){this.blockSize=-1}function bt(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.m=Array(this.blockSize),this.i=this.h=0,this.reset()}Oe(bt,tk);bt.prototype.reset=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.i=this.h=0};function Mc(n,e,t){t||(t=0);var r=Array(16);if(typeof e=="string")for(var i=0;16>i;++i)r[i]=e.charCodeAt(t++)|e.charCodeAt(t++)<<8|e.charCodeAt(t++)<<16|e.charCodeAt(t++)<<24;else for(i=0;16>i;++i)r[i]=e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24;e=n.g[0],t=n.g[1],i=n.g[2];var s=n.g[3],o=e+(s^t&(i^s))+r[0]+3614090360&4294967295;e=t+(o<<7&4294967295|o>>>25),o=s+(i^e&(t^i))+r[1]+3905402710&4294967295,s=e+(o<<12&4294967295|o>>>20),o=i+(t^s&(e^t))+r[2]+606105819&4294967295,i=s+(o<<17&4294967295|o>>>15),o=t+(e^i&(s^e))+r[3]+3250441966&4294967295,t=i+(o<<22&4294967295|o>>>10),o=e+(s^t&(i^s))+r[4]+4118548399&4294967295,e=t+(o<<7&4294967295|o>>>25),o=s+(i^e&(t^i))+r[5]+1200080426&4294967295,s=e+(o<<12&4294967295|o>>>20),o=i+(t^s&(e^t))+r[6]+2821735955&4294967295,i=s+(o<<17&4294967295|o>>>15),o=t+(e^i&(s^e))+r[7]+4249261313&4294967295,t=i+(o<<22&4294967295|o>>>10),o=e+(s^t&(i^s))+r[8]+1770035416&4294967295,e=t+(o<<7&4294967295|o>>>25),o=s+(i^e&(t^i))+r[9]+2336552879&4294967295,s=e+(o<<12&4294967295|o>>>20),o=i+(t^s&(e^t))+r[10]+4294925233&4294967295,i=s+(o<<17&4294967295|o>>>15),o=t+(e^i&(s^e))+r[11]+2304563134&4294967295,t=i+(o<<22&4294967295|o>>>10),o=e+(s^t&(i^s))+r[12]+1804603682&4294967295,e=t+(o<<7&4294967295|o>>>25),o=s+(i^e&(t^i))+r[13]+4254626195&4294967295,s=e+(o<<12&4294967295|o>>>20),o=i+(t^s&(e^t))+r[14]+2792965006&4294967295,i=s+(o<<17&4294967295|o>>>15),o=t+(e^i&(s^e))+r[15]+1236535329&4294967295,t=i+(o<<22&4294967295|o>>>10),o=e+(i^s&(t^i))+r[1]+4129170786&4294967295,e=t+(o<<5&4294967295|o>>>27),o=s+(t^i&(e^t))+r[6]+3225465664&4294967295,s=e+(o<<9&4294967295|o>>>23),o=i+(e^t&(s^e))+r[11]+643717713&4294967295,i=s+(o<<14&4294967295|o>>>18),o=t+(s^e&(i^s))+r[0]+3921069994&4294967295,t=i+(o<<20&4294967295|o>>>12),o=e+(i^s&(t^i))+r[5]+3593408605&4294967295,e=t+(o<<5&4294967295|o>>>27),o=s+(t^i&(e^t))+r[10]+38016083&4294967295,s=e+(o<<9&4294967295|o>>>23),o=i+(e^t&(s^e))+r[15]+3634488961&4294967295,i=s+(o<<14&4294967295|o>>>18),o=t+(s^e&(i^s))+r[4]+3889429448&4294967295,t=i+(o<<20&4294967295|o>>>12),o=e+(i^s&(t^i))+r[9]+568446438&4294967295,e=t+(o<<5&4294967295|o>>>27),o=s+(t^i&(e^t))+r[14]+3275163606&4294967295,s=e+(o<<9&4294967295|o>>>23),o=i+(e^t&(s^e))+r[3]+4107603335&4294967295,i=s+(o<<14&4294967295|o>>>18),o=t+(s^e&(i^s))+r[8]+1163531501&4294967295,t=i+(o<<20&4294967295|o>>>12),o=e+(i^s&(t^i))+r[13]+2850285829&4294967295,e=t+(o<<5&4294967295|o>>>27),o=s+(t^i&(e^t))+r[2]+4243563512&4294967295,s=e+(o<<9&4294967295|o>>>23),o=i+(e^t&(s^e))+r[7]+1735328473&4294967295,i=s+(o<<14&4294967295|o>>>18),o=t+(s^e&(i^s))+r[12]+2368359562&4294967295,t=i+(o<<20&4294967295|o>>>12),o=e+(t^i^s)+r[5]+4294588738&4294967295,e=t+(o<<4&4294967295|o>>>28),o=s+(e^t^i)+r[8]+2272392833&4294967295,s=e+(o<<11&4294967295|o>>>21),o=i+(s^e^t)+r[11]+1839030562&4294967295,i=s+(o<<16&4294967295|o>>>16),o=t+(i^s^e)+r[14]+4259657740&4294967295,t=i+(o<<23&4294967295|o>>>9),o=e+(t^i^s)+r[1]+2763975236&4294967295,e=t+(o<<4&4294967295|o>>>28),o=s+(e^t^i)+r[4]+1272893353&4294967295,s=e+(o<<11&4294967295|o>>>21),o=i+(s^e^t)+r[7]+4139469664&4294967295,i=s+(o<<16&4294967295|o>>>16),o=t+(i^s^e)+r[10]+3200236656&4294967295,t=i+(o<<23&4294967295|o>>>9),o=e+(t^i^s)+r[13]+681279174&4294967295,e=t+(o<<4&4294967295|o>>>28),o=s+(e^t^i)+r[0]+3936430074&4294967295,s=e+(o<<11&4294967295|o>>>21),o=i+(s^e^t)+r[3]+3572445317&4294967295,i=s+(o<<16&4294967295|o>>>16),o=t+(i^s^e)+r[6]+76029189&4294967295,t=i+(o<<23&4294967295|o>>>9),o=e+(t^i^s)+r[9]+3654602809&4294967295,e=t+(o<<4&4294967295|o>>>28),o=s+(e^t^i)+r[12]+3873151461&4294967295,s=e+(o<<11&4294967295|o>>>21),o=i+(s^e^t)+r[15]+530742520&4294967295,i=s+(o<<16&4294967295|o>>>16),o=t+(i^s^e)+r[2]+3299628645&4294967295,t=i+(o<<23&4294967295|o>>>9),o=e+(i^(t|~s))+r[0]+4096336452&4294967295,e=t+(o<<6&4294967295|o>>>26),o=s+(t^(e|~i))+r[7]+1126891415&4294967295,s=e+(o<<10&4294967295|o>>>22),o=i+(e^(s|~t))+r[14]+2878612391&4294967295,i=s+(o<<15&4294967295|o>>>17),o=t+(s^(i|~e))+r[5]+4237533241&4294967295,t=i+(o<<21&4294967295|o>>>11),o=e+(i^(t|~s))+r[12]+1700485571&4294967295,e=t+(o<<6&4294967295|o>>>26),o=s+(t^(e|~i))+r[3]+2399980690&4294967295,s=e+(o<<10&4294967295|o>>>22),o=i+(e^(s|~t))+r[10]+4293915773&4294967295,i=s+(o<<15&4294967295|o>>>17),o=t+(s^(i|~e))+r[1]+2240044497&4294967295,t=i+(o<<21&4294967295|o>>>11),o=e+(i^(t|~s))+r[8]+1873313359&4294967295,e=t+(o<<6&4294967295|o>>>26),o=s+(t^(e|~i))+r[15]+4264355552&4294967295,s=e+(o<<10&4294967295|o>>>22),o=i+(e^(s|~t))+r[6]+2734768916&4294967295,i=s+(o<<15&4294967295|o>>>17),o=t+(s^(i|~e))+r[13]+1309151649&4294967295,t=i+(o<<21&4294967295|o>>>11),o=e+(i^(t|~s))+r[4]+4149444226&4294967295,e=t+(o<<6&4294967295|o>>>26),o=s+(t^(e|~i))+r[11]+3174756917&4294967295,s=e+(o<<10&4294967295|o>>>22),o=i+(e^(s|~t))+r[2]+718787259&4294967295,i=s+(o<<15&4294967295|o>>>17),o=t+(s^(i|~e))+r[9]+3951481745&4294967295,n.g[0]=n.g[0]+e&4294967295,n.g[1]=n.g[1]+(i+(o<<21&4294967295|o>>>11))&4294967295,n.g[2]=n.g[2]+i&4294967295,n.g[3]=n.g[3]+s&4294967295}bt.prototype.j=function(n,e){e===void 0&&(e=n.length);for(var t=e-this.blockSize,r=this.m,i=this.h,s=0;s<e;){if(i==0)for(;s<=t;)Mc(this,n,s),s+=this.blockSize;if(typeof n=="string"){for(;s<e;)if(r[i++]=n.charCodeAt(s++),i==this.blockSize){Mc(this,r),i=0;break}}else for(;s<e;)if(r[i++]=n[s++],i==this.blockSize){Mc(this,r),i=0;break}}this.h=i,this.i+=e};bt.prototype.l=function(){var n=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);n[0]=128;for(var e=1;e<n.length-8;++e)n[e]=0;var t=8*this.i;for(e=n.length-8;e<n.length;++e)n[e]=t&255,t/=256;for(this.j(n),n=Array(16),e=t=0;4>e;++e)for(var r=0;32>r;r+=8)n[t++]=this.g[e]>>>r&255;return n};function Z(n,e){this.h=e;for(var t=[],r=!0,i=n.length-1;0<=i;i--){var s=n[i]|0;r&&s==e||(t[i]=s,r=!1)}this.g=t}var nk={};function Fl(n){return-128<=n&&128>n?u0(n,function(e){return new Z([e|0],0>e?-1:0)}):new Z([n|0],0>n?-1:0)}function Nt(n){if(isNaN(n)||!isFinite(n))return zr;if(0>n)return Ve(Nt(-n));for(var e=[],t=1,r=0;n>=t;r++)e[r]=n/t|0,t*=du;return new Z(e,0)}function Dp(n,e){if(n.length==0)throw Error("number format error: empty string");if(e=e||10,2>e||36<e)throw Error("radix out of range: "+e);if(n.charAt(0)=="-")return Ve(Dp(n.substring(1),e));if(0<=n.indexOf("-"))throw Error('number format error: interior "-" character');for(var t=Nt(Math.pow(e,8)),r=zr,i=0;i<n.length;i+=8){var s=Math.min(8,n.length-i),o=parseInt(n.substring(i,i+s),e);8>s?(s=Nt(Math.pow(e,s)),r=r.R(s).add(Nt(o))):(r=r.R(t),r=r.add(Nt(o)))}return r}var du=4294967296,zr=Fl(0),fu=Fl(1),Fd=Fl(16777216);k=Z.prototype;k.ea=function(){if(ht(this))return-Ve(this).ea();for(var n=0,e=1,t=0;t<this.g.length;t++){var r=this.D(t);n+=(0<=r?r:du+r)*e,e*=du}return n};k.toString=function(n){if(n=n||10,2>n||36<n)throw Error("radix out of range: "+n);if(jt(this))return"0";if(ht(this))return"-"+Ve(this).toString(n);for(var e=Nt(Math.pow(n,6)),t=this,r="";;){var i=na(t,e).g;t=ta(t,i.R(e));var s=((0<t.g.length?t.g[0]:t.h)>>>0).toString(n);if(t=i,jt(t))return s+r;for(;6>s.length;)s="0"+s;r=s+r}};k.D=function(n){return 0>n?0:n<this.g.length?this.g[n]:this.h};function jt(n){if(n.h!=0)return!1;for(var e=0;e<n.g.length;e++)if(n.g[e]!=0)return!1;return!0}function ht(n){return n.h==-1}k.X=function(n){return n=ta(this,n),ht(n)?-1:jt(n)?0:1};function Ve(n){for(var e=n.g.length,t=[],r=0;r<e;r++)t[r]=~n.g[r];return new Z(t,~n.h).add(fu)}k.abs=function(){return ht(this)?Ve(this):this};k.add=function(n){for(var e=Math.max(this.g.length,n.g.length),t=[],r=0,i=0;i<=e;i++){var s=r+(this.D(i)&65535)+(n.D(i)&65535),o=(s>>>16)+(this.D(i)>>>16)+(n.D(i)>>>16);r=o>>>16,s&=65535,o&=65535,t[i]=o<<16|s}return new Z(t,t[t.length-1]&-2147483648?-1:0)};function ta(n,e){return n.add(Ve(e))}k.R=function(n){if(jt(this)||jt(n))return zr;if(ht(this))return ht(n)?Ve(this).R(Ve(n)):Ve(Ve(this).R(n));if(ht(n))return Ve(this.R(Ve(n)));if(0>this.X(Fd)&&0>n.X(Fd))return Nt(this.ea()*n.ea());for(var e=this.g.length+n.g.length,t=[],r=0;r<2*e;r++)t[r]=0;for(r=0;r<this.g.length;r++)for(var i=0;i<n.g.length;i++){var s=this.D(r)>>>16,o=this.D(r)&65535,a=n.D(i)>>>16,c=n.D(i)&65535;t[2*r+2*i]+=o*c,wo(t,2*r+2*i),t[2*r+2*i+1]+=s*c,wo(t,2*r+2*i+1),t[2*r+2*i+1]+=o*a,wo(t,2*r+2*i+1),t[2*r+2*i+2]+=s*a,wo(t,2*r+2*i+2)}for(r=0;r<e;r++)t[r]=t[2*r+1]<<16|t[2*r];for(r=e;r<2*e;r++)t[r]=0;return new Z(t,0)};function wo(n,e){for(;(n[e]&65535)!=n[e];)n[e+1]+=n[e]>>>16,n[e]&=65535,e++}function Mi(n,e){this.g=n,this.h=e}function na(n,e){if(jt(e))throw Error("division by zero");if(jt(n))return new Mi(zr,zr);if(ht(n))return e=na(Ve(n),e),new Mi(Ve(e.g),Ve(e.h));if(ht(e))return e=na(n,Ve(e)),new Mi(Ve(e.g),e.h);if(30<n.g.length){if(ht(n)||ht(e))throw Error("slowDivide_ only works with positive integers.");for(var t=fu,r=e;0>=r.X(n);)t=Vd(t),r=Vd(r);var i=Cr(t,1),s=Cr(r,1);for(r=Cr(r,2),t=Cr(t,2);!jt(r);){var o=s.add(r);0>=o.X(n)&&(i=i.add(t),s=o),r=Cr(r,1),t=Cr(t,1)}return e=ta(n,i.R(e)),new Mi(i,e)}for(i=zr;0<=n.X(e);){for(t=Math.max(1,Math.floor(n.ea()/e.ea())),r=Math.ceil(Math.log(t)/Math.LN2),r=48>=r?1:Math.pow(2,r-48),s=Nt(t),o=s.R(e);ht(o)||0<o.X(n);)t-=r,s=Nt(t),o=s.R(e);jt(s)&&(s=fu),i=i.add(s),n=ta(n,o)}return new Mi(i,n)}k.gb=function(n){return na(this,n).h};k.and=function(n){for(var e=Math.max(this.g.length,n.g.length),t=[],r=0;r<e;r++)t[r]=this.D(r)&n.D(r);return new Z(t,this.h&n.h)};k.or=function(n){for(var e=Math.max(this.g.length,n.g.length),t=[],r=0;r<e;r++)t[r]=this.D(r)|n.D(r);return new Z(t,this.h|n.h)};k.xor=function(n){for(var e=Math.max(this.g.length,n.g.length),t=[],r=0;r<e;r++)t[r]=this.D(r)^n.D(r);return new Z(t,this.h^n.h)};function Vd(n){for(var e=n.g.length+1,t=[],r=0;r<e;r++)t[r]=n.D(r)<<1|n.D(r-1)>>>31;return new Z(t,n.h)}function Cr(n,e){var t=e>>5;e%=32;for(var r=n.g.length-t,i=[],s=0;s<r;s++)i[s]=0<e?n.D(s+t)>>>e|n.D(s+t+1)<<32-e:n.D(s+t);return new Z(i,n.h)}ea.prototype.createWebChannel=ea.prototype.g;ut.prototype.send=ut.prototype.u;ut.prototype.open=ut.prototype.m;ut.prototype.close=ut.prototype.close;Va.NO_ERROR=0;Va.TIMEOUT=8;Va.HTTP_ERROR=6;Kg.COMPLETE="complete";Yg.EventType=js;js.OPEN="a";js.CLOSE="b";js.ERROR="c";js.MESSAGE="d";Re.prototype.listen=Re.prototype.O;he.prototype.listenOnce=he.prototype.P;he.prototype.getLastError=he.prototype.Sa;he.prototype.getLastErrorCode=he.prototype.Ia;he.prototype.getStatus=he.prototype.da;he.prototype.getResponseJson=he.prototype.Wa;he.prototype.getResponseText=he.prototype.ja;he.prototype.send=he.prototype.ha;he.prototype.setWithCredentials=he.prototype.Oa;bt.prototype.digest=bt.prototype.l;bt.prototype.reset=bt.prototype.reset;bt.prototype.update=bt.prototype.j;Z.prototype.add=Z.prototype.add;Z.prototype.multiply=Z.prototype.R;Z.prototype.modulo=Z.prototype.gb;Z.prototype.compare=Z.prototype.X;Z.prototype.toNumber=Z.prototype.ea;Z.prototype.toString=Z.prototype.toString;Z.prototype.getBits=Z.prototype.D;Z.fromNumber=Nt;Z.fromString=Dp;var rk=function(){return new ea},ik=function(){return Fa()},Lc=Va,sk=Kg,ok=vr,Ud={xb:0,Ab:1,Bb:2,Ub:3,Zb:4,Wb:5,Xb:6,Vb:7,Tb:8,Yb:9,PROXY:10,NOPROXY:11,Rb:12,Nb:13,Ob:14,Mb:15,Pb:16,Qb:17,tb:18,sb:19,ub:20},ak=Hs,vo=Yg,ck=he,uk=bt,jr=Z,lk={};const Bd="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xe{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}xe.UNAUTHENTICATED=new xe(null),xe.GOOGLE_CREDENTIALS=new xe("google-credentials-uid"),xe.FIRST_PARTY=new xe("first-party-uid"),xe.MOCK_USER=new xe("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let yi="9.23.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vn=new va("@firebase/firestore");function mu(){return vn.logLevel}function hk(n){vn.setLogLevel(n)}function w(n,...e){if(vn.logLevel<=W.DEBUG){const t=e.map(Vl);vn.debug(`Firestore (${yi}): ${n}`,...t)}}function me(n,...e){if(vn.logLevel<=W.ERROR){const t=e.map(Vl);vn.error(`Firestore (${yi}): ${n}`,...t)}}function It(n,...e){if(vn.logLevel<=W.WARN){const t=e.map(Vl);vn.warn(`Firestore (${yi}): ${n}`,...t)}}function Vl(n){if(typeof n=="string")return n;try{return e=n,JSON.stringify(e)}catch{return n}/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function A(n="Unexpected state"){const e=`FIRESTORE (${yi}) INTERNAL ASSERTION FAILED: `+n;throw me(e),new Error(e)}function R(n,e){n||A()}function dk(n,e){n||A()}function T(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const g={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class y extends De{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Np{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class fk{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(xe.UNAUTHENTICATED))}shutdown(){}}class mk{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class gk{constructor(e){this.t=e,this.currentUser=xe.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){let r=this.i;const i=c=>this.i!==r?(r=this.i,t(c)):Promise.resolve();let s=new Ne;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Ne,e.enqueueRetryable(()=>i(this.currentUser))};const o=()=>{const c=s;e.enqueueRetryable(async()=>{await c.promise,await i(this.currentUser)})},a=c=>{w("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.auth.addAuthTokenListener(this.o),o()};this.t.onInit(c=>a(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?a(c):(w("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Ne)}},0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(w("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(R(typeof r.accessToken=="string"),new Np(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.auth.removeAuthTokenListener(this.o)}u(){const e=this.auth&&this.auth.getUid();return R(e===null||typeof e=="string"),new xe(e)}}class pk{constructor(e,t,r){this.h=e,this.l=t,this.m=r,this.type="FirstParty",this.user=xe.FIRST_PARTY,this.g=new Map}p(){return this.m?this.m():null}get headers(){this.g.set("X-Goog-AuthUser",this.h);const e=this.p();return e&&this.g.set("Authorization",e),this.l&&this.g.set("X-Goog-Iam-Authorization-Token",this.l),this.g}}class yk{constructor(e,t,r){this.h=e,this.l=t,this.m=r}getToken(){return Promise.resolve(new pk(this.h,this.l,this.m))}start(e,t){e.enqueueRetryable(()=>t(xe.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class wk{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class vk{constructor(e){this.I=e,this.forceRefresh=!1,this.appCheck=null,this.T=null}start(e,t){const r=s=>{s.error!=null&&w("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.T;return this.T=s.token,w("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{w("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.appCheck.addTokenListener(this.o)};this.I.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.I.getImmediate({optional:!0});s?i(s):w("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(R(typeof t.token=="string"),this.T=t.token,new wk(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.appCheck.removeTokenListener(this.o)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bk(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rp{static A(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const i=bk(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%e.length))}return r}}function V(n,e){return n<e?-1:n>e?1:0}function Xr(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}function Pp(n){return n+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ae{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new y(g.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new y(g.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new y(g.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new y(g.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return ae.fromMillis(Date.now())}static fromDate(e){return ae.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new ae(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?V(this.nanoseconds,e.nanoseconds):V(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N{constructor(e){this.timestamp=e}static fromTimestamp(e){return new N(e)}static min(){return new N(new ae(0,0))}static max(){return new N(new ae(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ks{constructor(e,t,r){t===void 0?t=0:t>e.length&&A(),r===void 0?r=e.length-t:r>e.length-t&&A(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return ks.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof ks?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=e.get(i),o=t.get(i);if(s<o)return-1;if(s>o)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class H extends ks{construct(e,t,r){return new H(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new y(g.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new H(t)}static emptyPath(){return new H([])}}const Ik=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ge extends ks{construct(e,t,r){return new ge(e,t,r)}static isValidIdentifier(e){return Ik.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ge.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new ge(["__name__"])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new y(g.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;i<e.length;){const a=e[i];if(a==="\\"){if(i+1===e.length)throw new y(g.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[i+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new y(g.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,i+=2}else a==="`"?(o=!o,i++):a!=="."||o?(r+=a,i++):(s(),i++)}if(s(),o)throw new y(g.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new ge(t)}static emptyPath(){return new ge([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _{constructor(e){this.path=e}static fromPath(e){return new _(H.fromString(e))}static fromName(e){return new _(H.fromString(e).popFirst(5))}static empty(){return new _(H.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&H.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return H.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new _(new H(e.slice()))}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Op{constructor(e,t,r,i){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=i}}function gu(n){return n.fields.find(e=>e.kind===2)}function qn(n){return n.fields.filter(e=>e.kind!==2)}Op.UNKNOWN_ID=-1;class _k{constructor(e,t){this.fieldPath=e,this.kind=t}}class ra{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new ra(0,lt.min())}}function Mp(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=N.fromTimestamp(r===1e9?new ae(t+1,0):new ae(t,r));return new lt(i,_.empty(),e)}function Lp(n){return new lt(n.readTime,n.key,-1)}class lt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new lt(N.min(),_.empty(),-1)}static max(){return new lt(N.max(),_.empty(),-1)}}function Ul(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=_.comparator(n.documentKey,e.documentKey),t!==0?t:V(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fp="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Vp{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pn(n){if(n.code!==g.FAILED_PRECONDITION||n.message!==Fp)throw n;w("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class m{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&A(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new m((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof m?t:m.resolve(t)}catch(t){return m.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):m.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):m.reject(t)}static resolve(e){return new m((t,r)=>{t(e)})}static reject(e){return new m((t,r)=>{r(e)})}static waitFor(e){return new m((t,r)=>{let i=0,s=0,o=!1;e.forEach(a=>{++i,a.next(()=>{++s,o&&s===i&&t()},c=>r(c))}),o=!0,s===i&&t()})}static or(e){let t=m.resolve(!1);for(const r of e)t=t.next(i=>i?m.resolve(i):r());return t}static forEach(e,t){const r=[];return e.forEach((i,s)=>{r.push(t.call(this,i,s))}),this.waitFor(r)}static mapArray(e,t){return new m((r,i)=>{const s=e.length,o=new Array(s);let a=0;for(let c=0;c<s;c++){const u=c;t(e[u]).next(l=>{o[u]=l,++a,a===s&&r(o)},l=>i(l))}})}static doWhile(e,t){return new m((r,i)=>{const s=()=>{e()===!0?t().next(()=>{s()},i):r()};s()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wa{constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.v=new Ne,this.transaction.oncomplete=()=>{this.v.resolve()},this.transaction.onabort=()=>{t.error?this.v.reject(new ns(e,t.error)):this.v.resolve()},this.transaction.onerror=r=>{const i=Bl(r.target.error);this.v.reject(new ns(e,i))}}static open(e,t,r,i){try{return new Wa(t,e.transaction(i,r))}catch(s){throw new ns(t,s)}}get R(){return this.v.promise}abort(e){e&&this.v.reject(e),this.aborted||(w("SimpleDb","Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}P(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new Tk(t)}}class yt{constructor(e,t,r){this.name=e,this.version=t,this.V=r,yt.S(ue())===12.2&&me("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}static delete(e){return w("SimpleDb","Removing database:",e),zn(window.indexedDB.deleteDatabase(e)).toPromise()}static D(){if(!us())return!1;if(yt.C())return!0;const e=ue(),t=yt.S(e),r=0<t&&t<10,i=yt.N(e),s=0<i&&i<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||r||s)}static C(){var e;return typeof process<"u"&&((e=lk)===null||e===void 0?void 0:e.k)==="YES"}static M(e,t){return e.store(t)}static S(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),r=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(r)}static N(e){const t=e.match(/Android ([\d.]+)/i),r=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(r)}async $(e){return this.db||(w("SimpleDb","Opening database:",this.name),this.db=await new Promise((t,r)=>{const i=indexedDB.open(this.name,this.version);i.onsuccess=s=>{const o=s.target.result;t(o)},i.onblocked=()=>{r(new ns(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},i.onerror=s=>{const o=s.target.error;o.name==="VersionError"?r(new y(g.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?r(new y(g.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):r(new ns(e,o))},i.onupgradeneeded=s=>{w("SimpleDb",'Database "'+this.name+'" requires upgrade from version:',s.oldVersion);const o=s.target.result;this.V.O(o,i.transaction,s.oldVersion,this.version).next(()=>{w("SimpleDb","Database upgrade to version "+this.version+" complete")})}})),this.F&&(this.db.onversionchange=t=>this.F(t)),this.db}B(e){this.F=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,r,i){const s=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.$(e);const a=Wa.open(this.db,e,s?"readonly":"readwrite",r),c=i(a).next(u=>(a.P(),u)).catch(u=>(a.abort(u),m.reject(u))).toPromise();return c.catch(()=>{}),await a.R,c}catch(a){const c=a,u=c.name!=="FirebaseError"&&o<3;if(w("SimpleDb","Transaction failed with error:",c.message,"Retrying:",u),this.close(),!u)return Promise.reject(c)}}}close(){this.db&&this.db.close(),this.db=void 0}}class Ek{constructor(e){this.L=e,this.q=!1,this.U=null}get isDone(){return this.q}get K(){return this.U}set cursor(e){this.L=e}done(){this.q=!0}G(e){this.U=e}delete(){return zn(this.L.delete())}}class ns extends y{constructor(e,t){super(g.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function On(n){return n.name==="IndexedDbTransactionError"}class Tk{constructor(e){this.store=e}put(e,t){let r;return t!==void 0?(w("SimpleDb","PUT",this.store.name,e,t),r=this.store.put(t,e)):(w("SimpleDb","PUT",this.store.name,"<auto-key>",e),r=this.store.put(e)),zn(r)}add(e){return w("SimpleDb","ADD",this.store.name,e,e),zn(this.store.add(e))}get(e){return zn(this.store.get(e)).next(t=>(t===void 0&&(t=null),w("SimpleDb","GET",this.store.name,e,t),t))}delete(e){return w("SimpleDb","DELETE",this.store.name,e),zn(this.store.delete(e))}count(){return w("SimpleDb","COUNT",this.store.name),zn(this.store.count())}j(e,t){const r=this.options(e,t);if(r.index||typeof this.store.getAll!="function"){const i=this.cursor(r),s=[];return this.W(i,(o,a)=>{s.push(a)}).next(()=>s)}{const i=this.store.getAll(r.range);return new m((s,o)=>{i.onerror=a=>{o(a.target.error)},i.onsuccess=a=>{s(a.target.result)}})}}H(e,t){const r=this.store.getAll(e,t===null?void 0:t);return new m((i,s)=>{r.onerror=o=>{s(o.target.error)},r.onsuccess=o=>{i(o.target.result)}})}J(e,t){w("SimpleDb","DELETE ALL",this.store.name);const r=this.options(e,t);r.Y=!1;const i=this.cursor(r);return this.W(i,(s,o,a)=>a.delete())}X(e,t){let r;t?r=e:(r={},t=e);const i=this.cursor(r);return this.W(i,t)}Z(e){const t=this.cursor({});return new m((r,i)=>{t.onerror=s=>{const o=Bl(s.target.error);i(o)},t.onsuccess=s=>{const o=s.target.result;o?e(o.primaryKey,o.value).next(a=>{a?o.continue():r()}):r()}})}W(e,t){const r=[];return new m((i,s)=>{e.onerror=o=>{s(o.target.error)},e.onsuccess=o=>{const a=o.target.result;if(!a)return void i();const c=new Ek(a),u=t(a.primaryKey,a.value,c);if(u instanceof m){const l=u.catch(h=>(c.done(),m.reject(h)));r.push(l)}c.isDone?i():c.K===null?a.continue():a.continue(c.K)}}).next(()=>m.waitFor(r))}options(e,t){let r;return e!==void 0&&(typeof e=="string"?r=e:t=e),{index:r,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const r=this.store.index(e.index);return e.Y?r.openKeyCursor(e.range,t):r.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function zn(n){return new m((e,t)=>{n.onsuccess=r=>{const i=r.target.result;e(i)},n.onerror=r=>{const i=Bl(r.target.error);t(i)}})}let qd=!1;function Bl(n){const e=yt.S(ue());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(n.message.indexOf(t)>=0){const r=new y("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return qd||(qd=!0,setTimeout(()=>{throw r},0)),r}}return n}class kk{constructor(e,t){this.asyncQueue=e,this.tt=t,this.task=null}start(){this.et(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}et(e){w("IndexBackiller",`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,async()=>{this.task=null;try{w("IndexBackiller",`Documents written: ${await this.tt.nt()}`)}catch(t){On(t)?w("IndexBackiller","Ignoring IndexedDB error during index backfill: ",t):await Pn(t)}await this.et(6e4)})}}class Sk{constructor(e,t){this.localStore=e,this.persistence=t}async nt(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",t=>this.st(t,e))}st(e,t){const r=new Set;let i=t,s=!0;return m.doWhile(()=>s===!0&&i>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(o=>{if(o!==null&&!r.has(o))return w("IndexBackiller",`Processing collection: ${o}`),this.it(e,o,i).next(a=>{i-=a,r.add(o)});s=!1})).next(()=>t-i)}it(e,t,r){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next(i=>this.localStore.localDocuments.getNextDocuments(e,t,i,r).next(s=>{const o=s.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next(()=>this.rt(i,s)).next(a=>(w("IndexBackiller",`Updating offset: ${a}`),this.localStore.indexManager.updateCollectionGroup(e,t,a))).next(()=>o.size)}))}rt(e,t){let r=e;return t.changes.forEach((i,s)=>{const o=Lp(s);Ul(o,r)>0&&(r=o)}),new lt(r.readTime,r.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nt{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ot(r),this.ut=r=>t.writeSequenceNumber(r))}ot(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ut&&this.ut(e),e}}nt.ct=-1;function Qs(n){return n==null}function Ss(n){return n===0&&1/n==-1/0}function Up(n){return typeof n=="number"&&Number.isInteger(n)&&!Ss(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ze(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=$d(e)),e=Ak(n.get(t),e);return $d(e)}function Ak(n,e){let t=e;const r=n.length;for(let i=0;i<r;i++){const s=n.charAt(i);switch(s){case"\0":t+="";break;case"":t+="";break;default:t+=s}}return t}function $d(n){return n+""}function Rt(n){const e=n.length;if(R(e>=2),e===2)return R(n.charAt(0)===""&&n.charAt(1)===""),H.emptyPath();const t=e-2,r=[];let i="";for(let s=0;s<e;){const o=n.indexOf("",s);switch((o<0||o>t)&&A(),n.charAt(o+1)){case"":const a=n.substring(s,o);let c;i.length===0?c=a:(i+=a,c=i,i=""),r.push(c);break;case"":i+=n.substring(s,o),i+="\0";break;case"":i+=n.substring(s,o+1);break;default:A()}s=o+2}return new H(r)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zd=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oo(n,e){return[n,Ze(e)]}function Bp(n,e,t){return[n,Ze(e),t]}const Ck={},xk=["prefixPath","collectionGroup","readTime","documentId"],Dk=["prefixPath","collectionGroup","documentId"],Nk=["collectionGroup","readTime","prefixPath","documentId"],Rk=["canonicalId","targetId"],Pk=["targetId","path"],Ok=["path","targetId"],Mk=["collectionId","parent"],Lk=["indexId","uid"],Fk=["uid","sequenceNumber"],Vk=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],Uk=["indexId","uid","orderedDocumentKey"],Bk=["userId","collectionPath","documentId"],qk=["userId","collectionPath","largestBatchId"],$k=["userId","collectionGroup","largestBatchId"],qp=["mutationQueues","mutations","documentMutations","remoteDocuments","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries"],zk=[...qp,"documentOverlays"],$p=["mutationQueues","mutations","documentMutations","remoteDocumentsV14","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries","documentOverlays"],zp=$p,jk=[...zp,"indexConfiguration","indexState","indexEntries"];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pu extends Vp{constructor(e,t){super(),this.ht=e,this.currentSequenceNumber=t}}function Me(n,e){const t=T(n);return yt.M(t.ht,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jd(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function br(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function jp(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class te{constructor(e,t){this.comparator=e,this.root=t||Fe.EMPTY}insert(e,t){return new te(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Fe.BLACK,null,null))}remove(e){return new te(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Fe.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new bo(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new bo(this.root,e,this.comparator,!1)}getReverseIterator(){return new bo(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new bo(this.root,e,this.comparator,!0)}}class bo{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Fe{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r??Fe.RED,this.left=i??Fe.EMPTY,this.right=s??Fe.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new Fe(e??this.key,t??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return Fe.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return Fe.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Fe.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Fe.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw A();const e=this.left.check();if(e!==this.right.check())throw A();return e+(this.isRed()?0:1)}}Fe.EMPTY=null,Fe.RED=!0,Fe.BLACK=!1;Fe.EMPTY=new class{constructor(){this.size=0}get key(){throw A()}get value(){throw A()}get color(){throw A()}get left(){throw A()}get right(){throw A()}copy(n,e,t,r,i){return this}insert(n,e,t){return new Fe(n,e)}remove(n,e){return this}isEmpty(){return!0}inorderTraversal(n){return!1}reverseTraversal(n){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie{constructor(e){this.comparator=e,this.data=new te(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Gd(this.data.getIterator())}getIteratorFrom(e){return new Gd(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof ie)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new ie(this.comparator);return t.data=e,t}}class Gd{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function xr(n){return n.hasNext()?n.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(e){this.fields=e,e.sort(ge.comparator)}static empty(){return new rt([])}unionWith(e){let t=new ie(ge.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new rt(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Xr(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gp extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gk(){return typeof atob<"u"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ke{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(r){try{return atob(r)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Gp("Invalid base64 string: "+i):i}}(e);return new ke(t)}static fromUint8Array(e){const t=function(r){let i="";for(let s=0;s<r.length;++s)i+=String.fromCharCode(r[s]);return i}(e);return new ke(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return e=this.binaryString,btoa(e);var e}toUint8Array(){return function(e){const t=new Uint8Array(e.length);for(let r=0;r<e.length;r++)t[r]=e.charCodeAt(r);return t}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return V(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}ke.EMPTY_BYTE_STRING=new ke("");const Wk=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function bn(n){if(R(!!n),typeof n=="string"){let e=0;const t=Wk.exec(n);if(R(!!t),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:le(n.seconds),nanos:le(n.nanos)}}function le(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function In(n){return typeof n=="string"?ke.fromBase64String(n):ke.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ha(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function ql(n){const e=n.mapValue.fields.__previous_value__;return Ha(e)?ql(e):e}function As(n){const e=bn(n.mapValue.fields.__local_write_time__.timestampValue);return new ae(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hk{constructor(e,t,r,i,s,o,a,c,u){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=c,this.useFetchStreams=u}}class _n{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new _n("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof _n&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mn={mapValue:{fields:{__type__:{stringValue:"__max__"}}}},Mo={nullValue:"NULL_VALUE"};function cr(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Ha(n)?4:Wp(n)?9007199254740991:10:A()}function Ft(n,e){if(n===e)return!0;const t=cr(n);if(t!==cr(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return As(n).isEqual(As(e));case 3:return function(r,i){if(typeof r.timestampValue=="string"&&typeof i.timestampValue=="string"&&r.timestampValue.length===i.timestampValue.length)return r.timestampValue===i.timestampValue;const s=bn(r.timestampValue),o=bn(i.timestampValue);return s.seconds===o.seconds&&s.nanos===o.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(r,i){return In(r.bytesValue).isEqual(In(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(r,i){return le(r.geoPointValue.latitude)===le(i.geoPointValue.latitude)&&le(r.geoPointValue.longitude)===le(i.geoPointValue.longitude)}(n,e);case 2:return function(r,i){if("integerValue"in r&&"integerValue"in i)return le(r.integerValue)===le(i.integerValue);if("doubleValue"in r&&"doubleValue"in i){const s=le(r.doubleValue),o=le(i.doubleValue);return s===o?Ss(s)===Ss(o):isNaN(s)&&isNaN(o)}return!1}(n,e);case 9:return Xr(n.arrayValue.values||[],e.arrayValue.values||[],Ft);case 10:return function(r,i){const s=r.mapValue.fields||{},o=i.mapValue.fields||{};if(jd(s)!==jd(o))return!1;for(const a in s)if(s.hasOwnProperty(a)&&(o[a]===void 0||!Ft(s[a],o[a])))return!1;return!0}(n,e);default:return A()}}function Cs(n,e){return(n.values||[]).find(t=>Ft(t,e))!==void 0}function En(n,e){if(n===e)return 0;const t=cr(n),r=cr(e);if(t!==r)return V(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return V(n.booleanValue,e.booleanValue);case 2:return function(i,s){const o=le(i.integerValue||i.doubleValue),a=le(s.integerValue||s.doubleValue);return o<a?-1:o>a?1:o===a?0:isNaN(o)?isNaN(a)?0:-1:1}(n,e);case 3:return Wd(n.timestampValue,e.timestampValue);case 4:return Wd(As(n),As(e));case 5:return V(n.stringValue,e.stringValue);case 6:return function(i,s){const o=In(i),a=In(s);return o.compareTo(a)}(n.bytesValue,e.bytesValue);case 7:return function(i,s){const o=i.split("/"),a=s.split("/");for(let c=0;c<o.length&&c<a.length;c++){const u=V(o[c],a[c]);if(u!==0)return u}return V(o.length,a.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,s){const o=V(le(i.latitude),le(s.latitude));return o!==0?o:V(le(i.longitude),le(s.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return function(i,s){const o=i.values||[],a=s.values||[];for(let c=0;c<o.length&&c<a.length;++c){const u=En(o[c],a[c]);if(u)return u}return V(o.length,a.length)}(n.arrayValue,e.arrayValue);case 10:return function(i,s){if(i===mn.mapValue&&s===mn.mapValue)return 0;if(i===mn.mapValue)return 1;if(s===mn.mapValue)return-1;const o=i.fields||{},a=Object.keys(o),c=s.fields||{},u=Object.keys(c);a.sort(),u.sort();for(let l=0;l<a.length&&l<u.length;++l){const h=V(a[l],u[l]);if(h!==0)return h;const d=En(o[a[l]],c[u[l]]);if(d!==0)return d}return V(a.length,u.length)}(n.mapValue,e.mapValue);default:throw A()}}function Wd(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return V(n,e);const t=bn(n),r=bn(e),i=V(t.seconds,r.seconds);return i!==0?i:V(t.nanos,r.nanos)}function Jr(n){return yu(n)}function yu(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(r){const i=bn(r);return`time(${i.seconds},${i.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?In(n.bytesValue).toBase64():"referenceValue"in n?(t=n.referenceValue,_.fromName(t).toString()):"geoPointValue"in n?`geo(${(e=n.geoPointValue).latitude},${e.longitude})`:"arrayValue"in n?function(r){let i="[",s=!0;for(const o of r.values||[])s?s=!1:i+=",",i+=yu(o);return i+"]"}(n.arrayValue):"mapValue"in n?function(r){const i=Object.keys(r.fields||{}).sort();let s="{",o=!0;for(const a of i)o?o=!1:s+=",",s+=`${a}:${yu(r.fields[a])}`;return s+"}"}(n.mapValue):A();var e,t}function ur(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function wu(n){return!!n&&"integerValue"in n}function xs(n){return!!n&&"arrayValue"in n}function Hd(n){return!!n&&"nullValue"in n}function Kd(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Lo(n){return!!n&&"mapValue"in n}function rs(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return br(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=rs(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=rs(n.arrayValue.values[t]);return e}return Object.assign({},n)}function Wp(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}function Kk(n){return"nullValue"in n?Mo:"booleanValue"in n?{booleanValue:!1}:"integerValue"in n||"doubleValue"in n?{doubleValue:NaN}:"timestampValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in n?{stringValue:""}:"bytesValue"in n?{bytesValue:""}:"referenceValue"in n?ur(_n.empty(),_.empty()):"geoPointValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in n?{arrayValue:{}}:"mapValue"in n?{mapValue:{}}:A()}function Yk(n){return"nullValue"in n?{booleanValue:!1}:"booleanValue"in n?{doubleValue:NaN}:"integerValue"in n||"doubleValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in n?{stringValue:""}:"stringValue"in n?{bytesValue:""}:"bytesValue"in n?ur(_n.empty(),_.empty()):"referenceValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in n?{arrayValue:{}}:"arrayValue"in n?{mapValue:{}}:"mapValue"in n?mn:A()}function Yd(n,e){const t=En(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?-1:!n.inclusive&&e.inclusive?1:0}function Qd(n,e){const t=En(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?1:!n.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ue{constructor(e){this.value=e}static empty(){return new Ue({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Lo(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=rs(t)}setAll(e){let t=ge.emptyPath(),r={},i=[];e.forEach((o,a)=>{if(!t.isImmediateParentOf(a)){const c=this.getFieldsMap(t);this.applyChanges(c,r,i),r={},i=[],t=a.popLast()}o?r[a.lastSegment()]=rs(o):i.push(a.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());Lo(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Ft(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];Lo(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){br(t,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new Ue(rs(this.value))}}function Hp(n){const e=[];return br(n.fields,(t,r)=>{const i=new ge([t]);if(Lo(r)){const s=Hp(r.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)}),new rt(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class re{constructor(e,t,r,i,s,o,a){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=a}static newInvalidDocument(e){return new re(e,0,N.min(),N.min(),N.min(),Ue.empty(),0)}static newFoundDocument(e,t,r,i){return new re(e,1,t,N.min(),r,i,0)}static newNoDocument(e,t){return new re(e,2,t,N.min(),N.min(),Ue.empty(),0)}static newUnknownDocument(e,t){return new re(e,3,t,N.min(),N.min(),Ue.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(N.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ue.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ue.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=N.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof re&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new re(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tn{constructor(e,t){this.position=e,this.inclusive=t}}function Xd(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const s=e[i],o=n.position[i];if(s.field.isKeyField()?r=_.comparator(_.fromName(o.referenceValue),t.key):r=En(o,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function Jd(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Ft(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gr{constructor(e,t="asc"){this.field=e,this.dir=t}}function Qk(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kp{}class j extends Kp{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new Xk(e,t,r):t==="array-contains"?new eS(e,r):t==="in"?new ey(e,r):t==="not-in"?new tS(e,r):t==="array-contains-any"?new nS(e,r):new j(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new Jk(e,r):new Zk(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(En(t,this.value)):t!==null&&cr(this.value)===cr(t)&&this.matchesComparison(En(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return A()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}getFirstInequalityField(){return this.isInequality()?this.field:null}}class J extends Kp{constructor(e,t){super(),this.filters=e,this.op=t,this.lt=null}static create(e,t){return new J(e,t)}matches(e){return Zr(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.lt!==null||(this.lt=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.lt}getFilters(){return Object.assign([],this.filters)}getFirstInequalityField(){const e=this.ft(t=>t.isInequality());return e!==null?e.field:null}ft(e){for(const t of this.getFlattenedFilters())if(e(t))return t;return null}}function Zr(n){return n.op==="and"}function vu(n){return n.op==="or"}function $l(n){return Yp(n)&&Zr(n)}function Yp(n){for(const e of n.filters)if(e instanceof J)return!1;return!0}function bu(n){if(n instanceof j)return n.field.canonicalString()+n.op.toString()+Jr(n.value);if($l(n))return n.filters.map(e=>bu(e)).join(",");{const e=n.filters.map(t=>bu(t)).join(",");return`${n.op}(${e})`}}function Qp(n,e){return n instanceof j?function(t,r){return r instanceof j&&t.op===r.op&&t.field.isEqual(r.field)&&Ft(t.value,r.value)}(n,e):n instanceof J?function(t,r){return r instanceof J&&t.op===r.op&&t.filters.length===r.filters.length?t.filters.reduce((i,s,o)=>i&&Qp(s,r.filters[o]),!0):!1}(n,e):void A()}function Xp(n,e){const t=n.filters.concat(e);return J.create(t,n.op)}function Jp(n){return n instanceof j?function(e){return`${e.field.canonicalString()} ${e.op} ${Jr(e.value)}`}(n):n instanceof J?function(e){return e.op.toString()+" {"+e.getFilters().map(Jp).join(" ,")+"}"}(n):"Filter"}class Xk extends j{constructor(e,t,r){super(e,t,r),this.key=_.fromName(r.referenceValue)}matches(e){const t=_.comparator(e.key,this.key);return this.matchesComparison(t)}}class Jk extends j{constructor(e,t){super(e,"in",t),this.keys=Zp("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class Zk extends j{constructor(e,t){super(e,"not-in",t),this.keys=Zp("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Zp(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>_.fromName(r.referenceValue))}class eS extends j{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return xs(t)&&Cs(t.arrayValue,this.value)}}class ey extends j{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Cs(this.value.arrayValue,t)}}class tS extends j{constructor(e,t){super(e,"not-in",t)}matches(e){if(Cs(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Cs(this.value.arrayValue,t)}}class nS extends j{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!xs(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Cs(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rS{constructor(e,t=null,r=[],i=[],s=null,o=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=a,this.dt=null}}function Iu(n,e=null,t=[],r=[],i=null,s=null,o=null){return new rS(n,e,t,r,i,s,o)}function lr(n){const e=T(n);if(e.dt===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>bu(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),Qs(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Jr(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Jr(r)).join(",")),e.dt=t}return e.dt}function Xs(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!Qk(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Qp(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!Jd(n.startAt,e.startAt)&&Jd(n.endAt,e.endAt)}function ia(n){return _.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function sa(n,e){return n.filters.filter(t=>t instanceof j&&t.field.isEqual(e))}function Zd(n,e,t){let r=Mo,i=!0;for(const s of sa(n,e)){let o=Mo,a=!0;switch(s.op){case"<":case"<=":o=Kk(s.value);break;case"==":case"in":case">=":o=s.value;break;case">":o=s.value,a=!1;break;case"!=":case"not-in":o=Mo}Yd({value:r,inclusive:i},{value:o,inclusive:a})<0&&(r=o,i=a)}if(t!==null){for(let s=0;s<n.orderBy.length;++s)if(n.orderBy[s].field.isEqual(e)){const o=t.position[s];Yd({value:r,inclusive:i},{value:o,inclusive:t.inclusive})<0&&(r=o,i=t.inclusive);break}}return{value:r,inclusive:i}}function ef(n,e,t){let r=mn,i=!0;for(const s of sa(n,e)){let o=mn,a=!0;switch(s.op){case">=":case">":o=Yk(s.value),a=!1;break;case"==":case"in":case"<=":o=s.value;break;case"<":o=s.value,a=!1;break;case"!=":case"not-in":o=mn}Qd({value:r,inclusive:i},{value:o,inclusive:a})>0&&(r=o,i=a)}if(t!==null){for(let s=0;s<n.orderBy.length;++s)if(n.orderBy[s].field.isEqual(e)){const o=t.position[s];Qd({value:r,inclusive:i},{value:o,inclusive:t.inclusive})>0&&(r=o,i=t.inclusive);break}}return{value:r,inclusive:i}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class en{constructor(e,t=null,r=[],i=[],s=null,o="F",a=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=a,this.endAt=c,this.wt=null,this._t=null,this.startAt,this.endAt}}function ty(n,e,t,r,i,s,o,a){return new en(n,e,t,r,i,s,o,a)}function wi(n){return new en(n)}function tf(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function zl(n){return n.explicitOrderBy.length>0?n.explicitOrderBy[0].field:null}function Ka(n){for(const e of n.filters){const t=e.getFirstInequalityField();if(t!==null)return t}return null}function jl(n){return n.collectionGroup!==null}function rr(n){const e=T(n);if(e.wt===null){e.wt=[];const t=Ka(e),r=zl(e);if(t!==null&&r===null)t.isKeyField()||e.wt.push(new Gr(t)),e.wt.push(new Gr(ge.keyField(),"asc"));else{let i=!1;for(const s of e.explicitOrderBy)e.wt.push(s),s.field.isKeyField()&&(i=!0);if(!i){const s=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";e.wt.push(new Gr(ge.keyField(),s))}}}return e.wt}function st(n){const e=T(n);if(!e._t)if(e.limitType==="F")e._t=Iu(e.path,e.collectionGroup,rr(e),e.filters,e.limit,e.startAt,e.endAt);else{const t=[];for(const s of rr(e)){const o=s.dir==="desc"?"asc":"desc";t.push(new Gr(s.field,o))}const r=e.endAt?new Tn(e.endAt.position,e.endAt.inclusive):null,i=e.startAt?new Tn(e.startAt.position,e.startAt.inclusive):null;e._t=Iu(e.path,e.collectionGroup,t,e.filters,e.limit,r,i)}return e._t}function _u(n,e){e.getFirstInequalityField(),Ka(n);const t=n.filters.concat([e]);return new en(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function oa(n,e,t){return new en(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Js(n,e){return Xs(st(n),st(e))&&n.limitType===e.limitType}function ny(n){return`${lr(st(n))}|lt:${n.limitType}`}function Eu(n){return`Query(target=${function(e){let t=e.path.canonicalString();return e.collectionGroup!==null&&(t+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(t+=`, filters: [${e.filters.map(r=>Jp(r)).join(", ")}]`),Qs(e.limit)||(t+=", limit: "+e.limit),e.orderBy.length>0&&(t+=`, orderBy: [${e.orderBy.map(r=>function(i){return`${i.field.canonicalString()} (${i.dir})`}(r)).join(", ")}]`),e.startAt&&(t+=", startAt: ",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Jr(r)).join(",")),e.endAt&&(t+=", endAt: ",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Jr(r)).join(",")),`Target(${t})`}(st(n))}; limitType=${n.limitType})`}function Zs(n,e){return e.isFoundDocument()&&function(t,r){const i=r.key.path;return t.collectionGroup!==null?r.key.hasCollectionId(t.collectionGroup)&&t.path.isPrefixOf(i):_.isDocumentKey(t.path)?t.path.isEqual(i):t.path.isImmediateParentOf(i)}(n,e)&&function(t,r){for(const i of rr(t))if(!i.field.isKeyField()&&r.data.field(i.field)===null)return!1;return!0}(n,e)&&function(t,r){for(const i of t.filters)if(!i.matches(r))return!1;return!0}(n,e)&&function(t,r){return!(t.startAt&&!function(i,s,o){const a=Xd(i,s,o);return i.inclusive?a<=0:a<0}(t.startAt,rr(t),r)||t.endAt&&!function(i,s,o){const a=Xd(i,s,o);return i.inclusive?a>=0:a>0}(t.endAt,rr(t),r))}(n,e)}function ry(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function iy(n){return(e,t)=>{let r=!1;for(const i of rr(n)){const s=iS(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function iS(n,e,t){const r=n.field.isKeyField()?_.comparator(e.key,t.key):function(i,s,o){const a=s.data.field(i),c=o.data.field(i);return a!==null&&c!==null?En(a,c):A()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return A()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){br(this.inner,(t,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return jp(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sS=new te(_.comparator);function it(){return sS}const sy=new te(_.comparator);function Yi(...n){let e=sy;for(const t of n)e=e.insert(t.key,t);return e}function oy(n){let e=sy;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function Pt(){return is()}function ay(){return is()}function is(){return new Mn(n=>n.toString(),(n,e)=>n.isEqual(e))}const oS=new te(_.comparator),aS=new ie(_.comparator);function U(...n){let e=aS;for(const t of n)e=e.add(t);return e}const cS=new ie(V);function Gl(){return cS}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cy(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Ss(e)?"-0":e}}function uy(n){return{integerValue:""+n}}function ly(n,e){return Up(e)?uy(e):cy(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ya{constructor(){this._=void 0}}function uS(n,e,t){return n instanceof ei?function(r,i){const s={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return i&&Ha(i)&&(i=ql(i)),i&&(s.fields.__previous_value__=i),{mapValue:s}}(t,e):n instanceof hr?dy(n,e):n instanceof dr?fy(n,e):function(r,i){const s=hy(r,i),o=nf(s)+nf(r.gt);return wu(s)&&wu(r.gt)?uy(o):cy(r.serializer,o)}(n,e)}function lS(n,e,t){return n instanceof hr?dy(n,e):n instanceof dr?fy(n,e):t}function hy(n,e){return n instanceof ti?wu(t=e)||function(r){return!!r&&"doubleValue"in r}(t)?e:{integerValue:0}:null;var t}class ei extends Ya{}class hr extends Ya{constructor(e){super(),this.elements=e}}function dy(n,e){const t=my(e);for(const r of n.elements)t.some(i=>Ft(i,r))||t.push(r);return{arrayValue:{values:t}}}class dr extends Ya{constructor(e){super(),this.elements=e}}function fy(n,e){let t=my(e);for(const r of n.elements)t=t.filter(i=>!Ft(i,r));return{arrayValue:{values:t}}}class ti extends Ya{constructor(e,t){super(),this.serializer=e,this.gt=t}}function nf(n){return le(n.integerValue||n.doubleValue)}function my(n){return xs(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eo{constructor(e,t){this.field=e,this.transform=t}}function hS(n,e){return n.field.isEqual(e.field)&&function(t,r){return t instanceof hr&&r instanceof hr||t instanceof dr&&r instanceof dr?Xr(t.elements,r.elements,Ft):t instanceof ti&&r instanceof ti?Ft(t.gt,r.gt):t instanceof ei&&r instanceof ei}(n.transform,e.transform)}class dS{constructor(e,t){this.version=e,this.transformResults=t}}class oe{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new oe}static exists(e){return new oe(void 0,e)}static updateTime(e){return new oe(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Fo(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Qa{}function gy(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new bi(n.key,oe.none()):new vi(n.key,n.data,oe.none());{const t=n.data,r=Ue.empty();let i=new ie(ge.comparator);for(let s of e.fields)if(!i.has(s)){let o=t.field(s);o===null&&s.length>1&&(s=s.popLast(),o=t.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new tn(n.key,r,new rt(i.toArray()),oe.none())}}function fS(n,e,t){n instanceof vi?function(r,i,s){const o=r.value.clone(),a=sf(r.fieldTransforms,i,s.transformResults);o.setAll(a),i.convertToFoundDocument(s.version,o).setHasCommittedMutations()}(n,e,t):n instanceof tn?function(r,i,s){if(!Fo(r.precondition,i))return void i.convertToUnknownDocument(s.version);const o=sf(r.fieldTransforms,i,s.transformResults),a=i.data;a.setAll(py(r)),a.setAll(o),i.convertToFoundDocument(s.version,a).setHasCommittedMutations()}(n,e,t):function(r,i,s){i.convertToNoDocument(s.version).setHasCommittedMutations()}(0,e,t)}function ss(n,e,t,r){return n instanceof vi?function(i,s,o,a){if(!Fo(i.precondition,s))return o;const c=i.value.clone(),u=of(i.fieldTransforms,a,s);return c.setAll(u),s.convertToFoundDocument(s.version,c).setHasLocalMutations(),null}(n,e,t,r):n instanceof tn?function(i,s,o,a){if(!Fo(i.precondition,s))return o;const c=of(i.fieldTransforms,a,s),u=s.data;return u.setAll(py(i)),u.setAll(c),s.convertToFoundDocument(s.version,u).setHasLocalMutations(),o===null?null:o.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(l=>l.field))}(n,e,t,r):function(i,s,o){return Fo(i.precondition,s)?(s.convertToNoDocument(s.version).setHasLocalMutations(),null):o}(n,e,t)}function mS(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),s=hy(r.transform,i||null);s!=null&&(t===null&&(t=Ue.empty()),t.set(r.field,s))}return t||null}function rf(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(t,r){return t===void 0&&r===void 0||!(!t||!r)&&Xr(t,r,(i,s)=>hS(i,s))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class vi extends Qa{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class tn extends Qa{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function py(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function sf(n,e,t){const r=new Map;R(n.length===t.length);for(let i=0;i<t.length;i++){const s=n[i],o=s.transform,a=e.data.field(s.field);r.set(s.field,lS(o,a,t[i]))}return r}function of(n,e,t){const r=new Map;for(const i of n){const s=i.transform,o=t.data.field(i.field);r.set(i.field,uS(s,o,e))}return r}class bi extends Qa{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Wl extends Qa{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hl{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&fS(s,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=ss(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=ss(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=ay();return this.mutations.forEach(i=>{const s=e.get(i.key),o=s.overlayedDocument;let a=this.applyToLocalView(o,s.mutatedFields);a=t.has(i.key)?null:a;const c=gy(o,a);c!==null&&r.set(i.key,c),o.isValidDocument()||o.convertToNoDocument(N.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),U())}isEqual(e){return this.batchId===e.batchId&&Xr(this.mutations,e.mutations,(t,r)=>rf(t,r))&&Xr(this.baseMutations,e.baseMutations,(t,r)=>rf(t,r))}}class Kl{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){R(e.mutations.length===r.length);let i=oS;const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new Kl(e,t,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yl{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gS{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var be,G;function yy(n){switch(n){default:return A();case g.CANCELLED:case g.UNKNOWN:case g.DEADLINE_EXCEEDED:case g.RESOURCE_EXHAUSTED:case g.INTERNAL:case g.UNAVAILABLE:case g.UNAUTHENTICATED:return!1;case g.INVALID_ARGUMENT:case g.NOT_FOUND:case g.ALREADY_EXISTS:case g.PERMISSION_DENIED:case g.FAILED_PRECONDITION:case g.ABORTED:case g.OUT_OF_RANGE:case g.UNIMPLEMENTED:case g.DATA_LOSS:return!0}}function wy(n){if(n===void 0)return me("GRPC error has no .code"),g.UNKNOWN;switch(n){case be.OK:return g.OK;case be.CANCELLED:return g.CANCELLED;case be.UNKNOWN:return g.UNKNOWN;case be.DEADLINE_EXCEEDED:return g.DEADLINE_EXCEEDED;case be.RESOURCE_EXHAUSTED:return g.RESOURCE_EXHAUSTED;case be.INTERNAL:return g.INTERNAL;case be.UNAVAILABLE:return g.UNAVAILABLE;case be.UNAUTHENTICATED:return g.UNAUTHENTICATED;case be.INVALID_ARGUMENT:return g.INVALID_ARGUMENT;case be.NOT_FOUND:return g.NOT_FOUND;case be.ALREADY_EXISTS:return g.ALREADY_EXISTS;case be.PERMISSION_DENIED:return g.PERMISSION_DENIED;case be.FAILED_PRECONDITION:return g.FAILED_PRECONDITION;case be.ABORTED:return g.ABORTED;case be.OUT_OF_RANGE:return g.OUT_OF_RANGE;case be.UNIMPLEMENTED:return g.UNIMPLEMENTED;case be.DATA_LOSS:return g.DATA_LOSS;default:return A()}}(G=be||(be={}))[G.OK=0]="OK",G[G.CANCELLED=1]="CANCELLED",G[G.UNKNOWN=2]="UNKNOWN",G[G.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",G[G.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",G[G.NOT_FOUND=5]="NOT_FOUND",G[G.ALREADY_EXISTS=6]="ALREADY_EXISTS",G[G.PERMISSION_DENIED=7]="PERMISSION_DENIED",G[G.UNAUTHENTICATED=16]="UNAUTHENTICATED",G[G.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",G[G.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",G[G.ABORTED=10]="ABORTED",G[G.OUT_OF_RANGE=11]="OUT_OF_RANGE",G[G.UNIMPLEMENTED=12]="UNIMPLEMENTED",G[G.INTERNAL=13]="INTERNAL",G[G.UNAVAILABLE=14]="UNAVAILABLE",G[G.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ql{constructor(){this.onExistenceFilterMismatchCallbacks=new Map}static get instance(){return Io}static getOrCreateInstance(){return Io===null&&(Io=new Ql),Io}onExistenceFilterMismatch(e){const t=Symbol();return this.onExistenceFilterMismatchCallbacks.set(t,e),()=>this.onExistenceFilterMismatchCallbacks.delete(t)}notifyOnExistenceFilterMismatch(e){this.onExistenceFilterMismatchCallbacks.forEach(t=>t(e))}}let Io=null;/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vy(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pS=new jr([4294967295,4294967295],0);function af(n){const e=vy().encode(n),t=new uk;return t.update(e),new Uint8Array(t.digest())}function cf(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new jr([t,r],0),new jr([i,s],0)]}class Xl{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Qi(`Invalid padding: ${t}`);if(r<0)throw new Qi(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Qi(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Qi(`Invalid padding when bitmap length is 0: ${t}`);this.It=8*e.length-t,this.Tt=jr.fromNumber(this.It)}Et(e,t,r){let i=e.add(t.multiply(jr.fromNumber(r)));return i.compare(pS)===1&&(i=new jr([i.getBits(0),i.getBits(1)],0)),i.modulo(this.Tt).toNumber()}At(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}vt(e){if(this.It===0)return!1;const t=af(e),[r,i]=cf(t);for(let s=0;s<this.hashCount;s++){const o=this.Et(r,i,s);if(!this.At(o))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new Xl(s,i,t);return r.forEach(a=>o.insert(a)),o}insert(e){if(this.It===0)return;const t=af(e),[r,i]=cf(t);for(let s=0;s<this.hashCount;s++){const o=this.Et(r,i,s);this.Rt(o)}}Rt(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Qi extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class to{constructor(e,t,r,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,no.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new to(N.min(),i,new te(V),it(),U())}}class no{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new no(r,t,U(),U(),U())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vo{constructor(e,t,r,i){this.Pt=e,this.removedTargetIds=t,this.key=r,this.bt=i}}class by{constructor(e,t){this.targetId=e,this.Vt=t}}class Iy{constructor(e,t,r=ke.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class uf{constructor(){this.St=0,this.Dt=hf(),this.Ct=ke.EMPTY_BYTE_STRING,this.xt=!1,this.Nt=!0}get current(){return this.xt}get resumeToken(){return this.Ct}get kt(){return this.St!==0}get Mt(){return this.Nt}$t(e){e.approximateByteSize()>0&&(this.Nt=!0,this.Ct=e)}Ot(){let e=U(),t=U(),r=U();return this.Dt.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:A()}}),new no(this.Ct,this.xt,e,t,r)}Ft(){this.Nt=!1,this.Dt=hf()}Bt(e,t){this.Nt=!0,this.Dt=this.Dt.insert(e,t)}Lt(e){this.Nt=!0,this.Dt=this.Dt.remove(e)}qt(){this.St+=1}Ut(){this.St-=1}Kt(){this.Nt=!0,this.xt=!0}}class yS{constructor(e){this.Gt=e,this.Qt=new Map,this.jt=it(),this.zt=lf(),this.Wt=new te(V)}Ht(e){for(const t of e.Pt)e.bt&&e.bt.isFoundDocument()?this.Jt(t,e.bt):this.Yt(t,e.key,e.bt);for(const t of e.removedTargetIds)this.Yt(t,e.key,e.bt)}Xt(e){this.forEachTarget(e,t=>{const r=this.Zt(t);switch(e.state){case 0:this.te(t)&&r.$t(e.resumeToken);break;case 1:r.Ut(),r.kt||r.Ft(),r.$t(e.resumeToken);break;case 2:r.Ut(),r.kt||this.removeTarget(t);break;case 3:this.te(t)&&(r.Kt(),r.$t(e.resumeToken));break;case 4:this.te(t)&&(this.ee(t),r.$t(e.resumeToken));break;default:A()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Qt.forEach((r,i)=>{this.te(i)&&t(i)})}ne(e){var t;const r=e.targetId,i=e.Vt.count,s=this.se(r);if(s){const o=s.target;if(ia(o))if(i===0){const a=new _(o.path);this.Yt(r,a,re.newNoDocument(a,N.min()))}else R(i===1);else{const a=this.ie(r);if(a!==i){const c=this.re(e,a);if(c!==0){this.ee(r);const u=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Wt=this.Wt.insert(r,u)}(t=Ql.instance)===null||t===void 0||t.notifyOnExistenceFilterMismatch(function(u,l,h){var d,f,p,v,E,L;const O={localCacheCount:l,existenceFilterCount:h.count},D=h.unchangedNames;return D&&(O.bloomFilter={applied:u===0,hashCount:(d=D==null?void 0:D.hashCount)!==null&&d!==void 0?d:0,bitmapLength:(v=(p=(f=D==null?void 0:D.bits)===null||f===void 0?void 0:f.bitmap)===null||p===void 0?void 0:p.length)!==null&&v!==void 0?v:0,padding:(L=(E=D==null?void 0:D.bits)===null||E===void 0?void 0:E.padding)!==null&&L!==void 0?L:0}),O}(c,a,e.Vt))}}}}re(e,t){const{unchangedNames:r,count:i}=e.Vt;if(!r||!r.bits)return 1;const{bits:{bitmap:s="",padding:o=0},hashCount:a=0}=r;let c,u;try{c=In(s).toUint8Array()}catch(l){if(l instanceof Gp)return It("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),1;throw l}try{u=new Xl(c,o,a)}catch(l){return It(l instanceof Qi?"BloomFilter error: ":"Applying bloom filter failed: ",l),1}return u.It===0?1:i!==t-this.oe(e.targetId,u)?2:0}oe(e,t){const r=this.Gt.getRemoteKeysForTarget(e);let i=0;return r.forEach(s=>{const o=this.Gt.ue(),a=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;t.vt(a)||(this.Yt(e,s,null),i++)}),i}ce(e){const t=new Map;this.Qt.forEach((s,o)=>{const a=this.se(o);if(a){if(s.current&&ia(a.target)){const c=new _(a.target.path);this.jt.get(c)!==null||this.ae(o,c)||this.Yt(o,c,re.newNoDocument(c,e))}s.Mt&&(t.set(o,s.Ot()),s.Ft())}});let r=U();this.zt.forEach((s,o)=>{let a=!0;o.forEachWhile(c=>{const u=this.se(c);return!u||u.purpose==="TargetPurposeLimboResolution"||(a=!1,!1)}),a&&(r=r.add(s))}),this.jt.forEach((s,o)=>o.setReadTime(e));const i=new to(e,t,this.Wt,this.jt,r);return this.jt=it(),this.zt=lf(),this.Wt=new te(V),i}Jt(e,t){if(!this.te(e))return;const r=this.ae(e,t.key)?2:0;this.Zt(e).Bt(t.key,r),this.jt=this.jt.insert(t.key,t),this.zt=this.zt.insert(t.key,this.he(t.key).add(e))}Yt(e,t,r){if(!this.te(e))return;const i=this.Zt(e);this.ae(e,t)?i.Bt(t,1):i.Lt(t),this.zt=this.zt.insert(t,this.he(t).delete(e)),r&&(this.jt=this.jt.insert(t,r))}removeTarget(e){this.Qt.delete(e)}ie(e){const t=this.Zt(e).Ot();return this.Gt.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}qt(e){this.Zt(e).qt()}Zt(e){let t=this.Qt.get(e);return t||(t=new uf,this.Qt.set(e,t)),t}he(e){let t=this.zt.get(e);return t||(t=new ie(V),this.zt=this.zt.insert(e,t)),t}te(e){const t=this.se(e)!==null;return t||w("WatchChangeAggregator","Detected inactive target",e),t}se(e){const t=this.Qt.get(e);return t&&t.kt?null:this.Gt.le(e)}ee(e){this.Qt.set(e,new uf),this.Gt.getRemoteKeysForTarget(e).forEach(t=>{this.Yt(e,t,null)})}ae(e,t){return this.Gt.getRemoteKeysForTarget(e).has(t)}}function lf(){return new te(_.comparator)}function hf(){return new te(_.comparator)}const wS={asc:"ASCENDING",desc:"DESCENDING"},vS={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},bS={and:"AND",or:"OR"};class IS{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Tu(n,e){return n.useProto3Json||Qs(e)?e:{value:e}}function ni(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function _y(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function _S(n,e){return ni(n,e.toTimestamp())}function we(n){return R(!!n),N.fromTimestamp(function(e){const t=bn(e);return new ae(t.seconds,t.nanos)}(n))}function Jl(n,e){return function(t){return new H(["projects",t.projectId,"databases",t.database])}(n).child("documents").child(e).canonicalString()}function Ey(n){const e=H.fromString(n);return R(Ry(e)),e}function Ds(n,e){return Jl(n.databaseId,e.path)}function Ot(n,e){const t=Ey(e);if(t.get(1)!==n.databaseId.projectId)throw new y(g.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new y(g.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new _(ky(t))}function ku(n,e){return Jl(n.databaseId,e)}function Ty(n){const e=Ey(n);return e.length===4?H.emptyPath():ky(e)}function Ns(n){return new H(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function ky(n){return R(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function df(n,e,t){return{name:Ds(n,e),fields:t.value.mapValue.fields}}function Sy(n,e,t){const r=Ot(n,e.name),i=we(e.updateTime),s=e.createTime?we(e.createTime):N.min(),o=new Ue({mapValue:{fields:e.fields}}),a=re.newFoundDocument(r,i,s,o);return t&&a.setHasCommittedMutations(),t?a.setHasCommittedMutations():a}function ES(n,e){return"found"in e?function(t,r){R(!!r.found),r.found.name,r.found.updateTime;const i=Ot(t,r.found.name),s=we(r.found.updateTime),o=r.found.createTime?we(r.found.createTime):N.min(),a=new Ue({mapValue:{fields:r.found.fields}});return re.newFoundDocument(i,s,o,a)}(n,e):"missing"in e?function(t,r){R(!!r.missing),R(!!r.readTime);const i=Ot(t,r.missing),s=we(r.readTime);return re.newNoDocument(i,s)}(n,e):A()}function TS(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:A()}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(c,u){return c.useProto3Json?(R(u===void 0||typeof u=="string"),ke.fromBase64String(u||"")):(R(u===void 0||u instanceof Uint8Array),ke.fromUint8Array(u||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&function(c){const u=c.code===void 0?g.UNKNOWN:wy(c.code);return new y(u,c.message||"")}(o);t=new Iy(r,i,s,a||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=Ot(n,r.document.name),s=we(r.document.updateTime),o=r.document.createTime?we(r.document.createTime):N.min(),a=new Ue({mapValue:{fields:r.document.fields}}),c=re.newFoundDocument(i,s,o,a),u=r.targetIds||[],l=r.removedTargetIds||[];t=new Vo(u,l,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=Ot(n,r.document),s=r.readTime?we(r.readTime):N.min(),o=re.newNoDocument(i,s),a=r.removedTargetIds||[];t=new Vo([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=Ot(n,r.document),s=r.removedTargetIds||[];t=new Vo([],s,i,null)}else{if(!("filter"in e))return A();{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,o=new gS(i,s),a=r.targetId;t=new by(a,o)}}return t}function Rs(n,e){let t;if(e instanceof vi)t={update:df(n,e.key,e.value)};else if(e instanceof bi)t={delete:Ds(n,e.key)};else if(e instanceof tn)t={update:df(n,e.key,e.data),updateMask:DS(e.fieldMask)};else{if(!(e instanceof Wl))return A();t={verify:Ds(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(i,s){const o=s.transform;if(o instanceof ei)return{fieldPath:s.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(o instanceof hr)return{fieldPath:s.field.canonicalString(),appendMissingElements:{values:o.elements}};if(o instanceof dr)return{fieldPath:s.field.canonicalString(),removeAllFromArray:{values:o.elements}};if(o instanceof ti)return{fieldPath:s.field.canonicalString(),increment:o.gt};throw A()}(0,r))),e.precondition.isNone||(t.currentDocument=function(r,i){return i.updateTime!==void 0?{updateTime:_S(r,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:A()}(n,e.precondition)),t}function Su(n,e){const t=e.currentDocument?function(i){return i.updateTime!==void 0?oe.updateTime(we(i.updateTime)):i.exists!==void 0?oe.exists(i.exists):oe.none()}(e.currentDocument):oe.none(),r=e.updateTransforms?e.updateTransforms.map(i=>function(s,o){let a=null;if("setToServerValue"in o)R(o.setToServerValue==="REQUEST_TIME"),a=new ei;else if("appendMissingElements"in o){const u=o.appendMissingElements.values||[];a=new hr(u)}else if("removeAllFromArray"in o){const u=o.removeAllFromArray.values||[];a=new dr(u)}else"increment"in o?a=new ti(s,o.increment):A();const c=ge.fromServerFormat(o.fieldPath);return new eo(c,a)}(n,i)):[];if(e.update){e.update.name;const i=Ot(n,e.update.name),s=new Ue({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=function(a){const c=a.fieldPaths||[];return new rt(c.map(u=>ge.fromServerFormat(u)))}(e.updateMask);return new tn(i,s,o,t,r)}return new vi(i,s,t,r)}if(e.delete){const i=Ot(n,e.delete);return new bi(i,t)}if(e.verify){const i=Ot(n,e.verify);return new Wl(i,t)}return A()}function kS(n,e){return n&&n.length>0?(R(e!==void 0),n.map(t=>function(r,i){let s=r.updateTime?we(r.updateTime):we(i);return s.isEqual(N.min())&&(s=we(i)),new dS(s,r.transformResults||[])}(t,e))):[]}function Ay(n,e){return{documents:[ku(n,e.path)]}}function Cy(n,e){const t={structuredQuery:{}},r=e.path;e.collectionGroup!==null?(t.parent=ku(n,r),t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(t.parent=ku(n,r.popLast()),t.structuredQuery.from=[{collectionId:r.lastSegment()}]);const i=function(c){if(c.length!==0)return Ny(J.create(c,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const s=function(c){if(c.length!==0)return c.map(u=>function(l){return{field:Pr(l.field),direction:AS(l.dir)}}(u))}(e.orderBy);s&&(t.structuredQuery.orderBy=s);const o=Tu(n,e.limit);var a;return o!==null&&(t.structuredQuery.limit=o),e.startAt&&(t.structuredQuery.startAt={before:(a=e.startAt).inclusive,values:a.position}),e.endAt&&(t.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),t}function xy(n){let e=Ty(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){R(r===1);const l=t.from[0];l.allDescendants?i=l.collectionId:e=e.child(l.collectionId)}let s=[];t.where&&(s=function(l){const h=Dy(l);return h instanceof J&&$l(h)?h.getFilters():[h]}(t.where));let o=[];t.orderBy&&(o=t.orderBy.map(l=>function(h){return new Gr(Or(h.field),function(d){switch(d){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(h.direction))}(l)));let a=null;t.limit&&(a=function(l){let h;return h=typeof l=="object"?l.value:l,Qs(h)?null:h}(t.limit));let c=null;t.startAt&&(c=function(l){const h=!!l.before,d=l.values||[];return new Tn(d,h)}(t.startAt));let u=null;return t.endAt&&(u=function(l){const h=!l.before,d=l.values||[];return new Tn(d,h)}(t.endAt)),ty(e,i,o,s,a,"F",c,u)}function SS(n,e){const t=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return A()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Dy(n){return n.unaryFilter!==void 0?function(e){switch(e.unaryFilter.op){case"IS_NAN":const t=Or(e.unaryFilter.field);return j.create(t,"==",{doubleValue:NaN});case"IS_NULL":const r=Or(e.unaryFilter.field);return j.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Or(e.unaryFilter.field);return j.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const s=Or(e.unaryFilter.field);return j.create(s,"!=",{nullValue:"NULL_VALUE"});default:return A()}}(n):n.fieldFilter!==void 0?function(e){return j.create(Or(e.fieldFilter.field),function(t){switch(t){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return A()}}(e.fieldFilter.op),e.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(e){return J.create(e.compositeFilter.filters.map(t=>Dy(t)),function(t){switch(t){case"AND":return"and";case"OR":return"or";default:return A()}}(e.compositeFilter.op))}(n):A()}function AS(n){return wS[n]}function CS(n){return vS[n]}function xS(n){return bS[n]}function Pr(n){return{fieldPath:n.canonicalString()}}function Or(n){return ge.fromServerFormat(n.fieldPath)}function Ny(n){return n instanceof j?function(e){if(e.op==="=="){if(Kd(e.value))return{unaryFilter:{field:Pr(e.field),op:"IS_NAN"}};if(Hd(e.value))return{unaryFilter:{field:Pr(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(Kd(e.value))return{unaryFilter:{field:Pr(e.field),op:"IS_NOT_NAN"}};if(Hd(e.value))return{unaryFilter:{field:Pr(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Pr(e.field),op:CS(e.op),value:e.value}}}(n):n instanceof J?function(e){const t=e.getFilters().map(r=>Ny(r));return t.length===1?t[0]:{compositeFilter:{op:xS(e.op),filters:t}}}(n):A()}function DS(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function Ry(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt{constructor(e,t,r,i,s=N.min(),o=N.min(),a=ke.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=a,this.expectedCount=c}withSequenceNumber(e){return new Gt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Gt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Gt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Gt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Py{constructor(e){this.fe=e}}function NS(n,e){let t;if(e.document)t=Sy(n.fe,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const r=_.fromSegments(e.noDocument.path),i=mr(e.noDocument.readTime);t=re.newNoDocument(r,i),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return A();{const r=_.fromSegments(e.unknownDocument.path),i=mr(e.unknownDocument.version);t=re.newUnknownDocument(r,i)}}return e.readTime&&t.setReadTime(function(r){const i=new ae(r[0],r[1]);return N.fromTimestamp(i)}(e.readTime)),t}function ff(n,e){const t=e.key,r={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:aa(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())r.document=function(i,s){return{name:Ds(i,s.key),fields:s.data.value.mapValue.fields,updateTime:ni(i,s.version.toTimestamp()),createTime:ni(i,s.createTime.toTimestamp())}}(n.fe,e);else if(e.isNoDocument())r.noDocument={path:t.path.toArray(),readTime:fr(e.version)};else{if(!e.isUnknownDocument())return A();r.unknownDocument={path:t.path.toArray(),version:fr(e.version)}}return r}function aa(n){const e=n.toTimestamp();return[e.seconds,e.nanoseconds]}function fr(n){const e=n.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function mr(n){const e=new ae(n.seconds,n.nanoseconds);return N.fromTimestamp(e)}function jn(n,e){const t=(e.baseMutations||[]).map(s=>Su(n.fe,s));for(let s=0;s<e.mutations.length-1;++s){const o=e.mutations[s];if(s+1<e.mutations.length&&e.mutations[s+1].transform!==void 0){const a=e.mutations[s+1];o.updateTransforms=a.transform.fieldTransforms,e.mutations.splice(s+1,1),++s}}const r=e.mutations.map(s=>Su(n.fe,s)),i=ae.fromMillis(e.localWriteTimeMs);return new Hl(e.batchId,i,t,r)}function Xi(n){const e=mr(n.readTime),t=n.lastLimboFreeSnapshotVersion!==void 0?mr(n.lastLimboFreeSnapshotVersion):N.min();let r;var i;return n.query.documents!==void 0?(R((i=n.query).documents.length===1),r=st(wi(Ty(i.documents[0])))):r=function(s){return st(xy(s))}(n.query),new Gt(r,n.targetId,"TargetPurposeListen",n.lastListenSequenceNumber,e,t,ke.fromBase64String(n.resumeToken))}function Oy(n,e){const t=fr(e.snapshotVersion),r=fr(e.lastLimboFreeSnapshotVersion);let i;i=ia(e.target)?Ay(n.fe,e.target):Cy(n.fe,e.target);const s=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:lr(e.target),readTime:t,resumeToken:s,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:i}}function Zl(n){const e=xy({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?oa(e,e.limit,"L"):e}function Fc(n,e){return new Yl(e.largestBatchId,Su(n.fe,e.overlayMutation))}function mf(n,e){const t=e.path.lastSegment();return[n,Ze(e.path.popLast()),t]}function gf(n,e,t,r){return{indexId:n,uid:e.uid||"",sequenceNumber:t,readTime:fr(r.readTime),documentKey:Ze(r.documentKey.path),largestBatchId:r.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RS{getBundleMetadata(e,t){return pf(e).get(t).next(r=>{if(r)return{id:(i=r).bundleId,createTime:mr(i.createTime),version:i.version};var i})}saveBundleMetadata(e,t){return pf(e).put({bundleId:(r=t).id,createTime:fr(we(r.createTime)),version:r.version});var r}getNamedQuery(e,t){return yf(e).get(t).next(r=>{if(r)return{name:(i=r).name,query:Zl(i.bundledQuery),readTime:mr(i.readTime)};var i})}saveNamedQuery(e,t){return yf(e).put(function(r){return{name:r.name,readTime:fr(we(r.readTime)),bundledQuery:r.bundledQuery}}(t))}}function pf(n){return Me(n,"bundles")}function yf(n){return Me(n,"namedQueries")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xa{constructor(e,t){this.serializer=e,this.userId=t}static de(e,t){const r=t.uid||"";return new Xa(e,r)}getOverlay(e,t){return Li(e).get(mf(this.userId,t)).next(r=>r?Fc(this.serializer,r):null)}getOverlays(e,t){const r=Pt();return m.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,t,r){const i=[];return r.forEach((s,o)=>{const a=new Yl(t,o);i.push(this.we(e,a))}),m.waitFor(i)}removeOverlaysForBatchId(e,t,r){const i=new Set;t.forEach(o=>i.add(Ze(o.getCollectionPath())));const s=[];return i.forEach(o=>{const a=IDBKeyRange.bound([this.userId,o,r],[this.userId,o,r+1],!1,!0);s.push(Li(e).J("collectionPathOverlayIndex",a))}),m.waitFor(s)}getOverlaysForCollection(e,t,r){const i=Pt(),s=Ze(t),o=IDBKeyRange.bound([this.userId,s,r],[this.userId,s,Number.POSITIVE_INFINITY],!0);return Li(e).j("collectionPathOverlayIndex",o).next(a=>{for(const c of a){const u=Fc(this.serializer,c);i.set(u.getKey(),u)}return i})}getOverlaysForCollectionGroup(e,t,r,i){const s=Pt();let o;const a=IDBKeyRange.bound([this.userId,t,r],[this.userId,t,Number.POSITIVE_INFINITY],!0);return Li(e).X({index:"collectionGroupOverlayIndex",range:a},(c,u,l)=>{const h=Fc(this.serializer,u);s.size()<i||h.largestBatchId===o?(s.set(h.getKey(),h),o=h.largestBatchId):l.done()}).next(()=>s)}we(e,t){return Li(e).put(function(r,i,s){const[o,a,c]=mf(i,s.mutation.key);return{userId:i,collectionPath:a,documentId:c,collectionGroup:s.mutation.key.getCollectionGroup(),largestBatchId:s.largestBatchId,overlayMutation:Rs(r.fe,s.mutation)}}(this.serializer,this.userId,t))}}function Li(n){return Me(n,"documentOverlays")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gn{constructor(){}_e(e,t){this.me(e,t),t.ge()}me(e,t){if("nullValue"in e)this.ye(t,5);else if("booleanValue"in e)this.ye(t,10),t.pe(e.booleanValue?1:0);else if("integerValue"in e)this.ye(t,15),t.pe(le(e.integerValue));else if("doubleValue"in e){const r=le(e.doubleValue);isNaN(r)?this.ye(t,13):(this.ye(t,15),Ss(r)?t.pe(0):t.pe(r))}else if("timestampValue"in e){const r=e.timestampValue;this.ye(t,20),typeof r=="string"?t.Ie(r):(t.Ie(`${r.seconds||""}`),t.pe(r.nanos||0))}else if("stringValue"in e)this.Te(e.stringValue,t),this.Ee(t);else if("bytesValue"in e)this.ye(t,30),t.Ae(In(e.bytesValue)),this.Ee(t);else if("referenceValue"in e)this.ve(e.referenceValue,t);else if("geoPointValue"in e){const r=e.geoPointValue;this.ye(t,45),t.pe(r.latitude||0),t.pe(r.longitude||0)}else"mapValue"in e?Wp(e)?this.ye(t,Number.MAX_SAFE_INTEGER):(this.Re(e.mapValue,t),this.Ee(t)):"arrayValue"in e?(this.Pe(e.arrayValue,t),this.Ee(t)):A()}Te(e,t){this.ye(t,25),this.be(e,t)}be(e,t){t.Ie(e)}Re(e,t){const r=e.fields||{};this.ye(t,55);for(const i of Object.keys(r))this.Te(i,t),this.me(r[i],t)}Pe(e,t){const r=e.values||[];this.ye(t,50);for(const i of r)this.me(i,t)}ve(e,t){this.ye(t,37),_.fromName(e).path.forEach(r=>{this.ye(t,60),this.be(r,t)})}ye(e,t){e.pe(t)}Ee(e){e.pe(2)}}Gn.Ve=new Gn;function PS(n){if(n===0)return 8;let e=0;return n>>4==0&&(e+=4,n<<=4),n>>6==0&&(e+=2,n<<=2),n>>7==0&&(e+=1),e}function wf(n){const e=64-function(t){let r=0;for(let i=0;i<8;++i){const s=PS(255&t[i]);if(r+=s,s!==8)break}return r}(n);return Math.ceil(e/8)}class OS{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Se(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.De(r.value),r=t.next();this.Ce()}xe(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Ne(r.value),r=t.next();this.ke()}Me(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.De(r);else if(r<2048)this.De(960|r>>>6),this.De(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.De(480|r>>>12),this.De(128|63&r>>>6),this.De(128|63&r);else{const i=t.codePointAt(0);this.De(240|i>>>18),this.De(128|63&i>>>12),this.De(128|63&i>>>6),this.De(128|63&i)}}this.Ce()}$e(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Ne(r);else if(r<2048)this.Ne(960|r>>>6),this.Ne(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Ne(480|r>>>12),this.Ne(128|63&r>>>6),this.Ne(128|63&r);else{const i=t.codePointAt(0);this.Ne(240|i>>>18),this.Ne(128|63&i>>>12),this.Ne(128|63&i>>>6),this.Ne(128|63&i)}}this.ke()}Oe(e){const t=this.Fe(e),r=wf(t);this.Be(1+r),this.buffer[this.position++]=255&r;for(let i=t.length-r;i<t.length;++i)this.buffer[this.position++]=255&t[i]}Le(e){const t=this.Fe(e),r=wf(t);this.Be(1+r),this.buffer[this.position++]=~(255&r);for(let i=t.length-r;i<t.length;++i)this.buffer[this.position++]=~(255&t[i])}qe(){this.Ue(255),this.Ue(255)}Ke(){this.Ge(255),this.Ge(255)}reset(){this.position=0}seed(e){this.Be(e.length),this.buffer.set(e,this.position),this.position+=e.length}Qe(){return this.buffer.slice(0,this.position)}Fe(e){const t=function(i){const s=new DataView(new ArrayBuffer(8));return s.setFloat64(0,i,!1),new Uint8Array(s.buffer)}(e),r=(128&t[0])!=0;t[0]^=r?255:128;for(let i=1;i<t.length;++i)t[i]^=r?255:0;return t}De(e){const t=255&e;t===0?(this.Ue(0),this.Ue(255)):t===255?(this.Ue(255),this.Ue(0)):this.Ue(t)}Ne(e){const t=255&e;t===0?(this.Ge(0),this.Ge(255)):t===255?(this.Ge(255),this.Ge(0)):this.Ge(e)}Ce(){this.Ue(0),this.Ue(1)}ke(){this.Ge(0),this.Ge(1)}Ue(e){this.Be(1),this.buffer[this.position++]=e}Ge(e){this.Be(1),this.buffer[this.position++]=~e}Be(e){const t=e+this.position;if(t<=this.buffer.length)return;let r=2*this.buffer.length;r<t&&(r=t);const i=new Uint8Array(r);i.set(this.buffer),this.buffer=i}}class MS{constructor(e){this.je=e}Ae(e){this.je.Se(e)}Ie(e){this.je.Me(e)}pe(e){this.je.Oe(e)}ge(){this.je.qe()}}class LS{constructor(e){this.je=e}Ae(e){this.je.xe(e)}Ie(e){this.je.$e(e)}pe(e){this.je.Le(e)}ge(){this.je.Ke()}}class Fi{constructor(){this.je=new OS,this.ze=new MS(this.je),this.We=new LS(this.je)}seed(e){this.je.seed(e)}He(e){return e===0?this.ze:this.We}Qe(){return this.je.Qe()}reset(){this.je.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wn{constructor(e,t,r,i){this.indexId=e,this.documentKey=t,this.arrayValue=r,this.directionalValue=i}Je(){const e=this.directionalValue.length,t=e===0||this.directionalValue[e-1]===255?e+1:e,r=new Uint8Array(t);return r.set(this.directionalValue,0),t!==e?r.set([0],this.directionalValue.length):++r[r.length-1],new Wn(this.indexId,this.documentKey,this.arrayValue,r)}}function on(n,e){let t=n.indexId-e.indexId;return t!==0?t:(t=vf(n.arrayValue,e.arrayValue),t!==0?t:(t=vf(n.directionalValue,e.directionalValue),t!==0?t:_.comparator(n.documentKey,e.documentKey)))}function vf(n,e){for(let t=0;t<n.length&&t<e.length;++t){const r=n[t]-e[t];if(r!==0)return r}return n.length-e.length}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FS{constructor(e){this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.Ye=e.orderBy,this.Xe=[];for(const t of e.filters){const r=t;r.isInequality()?this.Ze=r:this.Xe.push(r)}}tn(e){R(e.collectionGroup===this.collectionId);const t=gu(e);if(t!==void 0&&!this.en(t))return!1;const r=qn(e);let i=new Set,s=0,o=0;for(;s<r.length&&this.en(r[s]);++s)i=i.add(r[s].fieldPath.canonicalString());if(s===r.length)return!0;if(this.Ze!==void 0){if(!i.has(this.Ze.field.canonicalString())){const a=r[s];if(!this.nn(this.Ze,a)||!this.sn(this.Ye[o++],a))return!1}++s}for(;s<r.length;++s){const a=r[s];if(o>=this.Ye.length||!this.sn(this.Ye[o++],a))return!1}return!0}en(e){for(const t of this.Xe)if(this.nn(t,e))return!0;return!1}nn(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const r=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===r}sn(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function My(n){var e,t;if(R(n instanceof j||n instanceof J),n instanceof j){if(n instanceof ey){const i=((t=(e=n.value.arrayValue)===null||e===void 0?void 0:e.values)===null||t===void 0?void 0:t.map(s=>j.create(n.field,"==",s)))||[];return J.create(i,"or")}return n}const r=n.filters.map(i=>My(i));return J.create(r,n.op)}function VS(n){if(n.getFilters().length===0)return[];const e=xu(My(n));return R(Ly(e)),Au(e)||Cu(e)?[e]:e.getFilters()}function Au(n){return n instanceof j}function Cu(n){return n instanceof J&&$l(n)}function Ly(n){return Au(n)||Cu(n)||function(e){if(e instanceof J&&vu(e)){for(const t of e.getFilters())if(!Au(t)&&!Cu(t))return!1;return!0}return!1}(n)}function xu(n){if(R(n instanceof j||n instanceof J),n instanceof j)return n;if(n.filters.length===1)return xu(n.filters[0]);const e=n.filters.map(r=>xu(r));let t=J.create(e,n.op);return t=ca(t),Ly(t)?t:(R(t instanceof J),R(Zr(t)),R(t.filters.length>1),t.filters.reduce((r,i)=>eh(r,i)))}function eh(n,e){let t;return R(n instanceof j||n instanceof J),R(e instanceof j||e instanceof J),t=n instanceof j?e instanceof j?function(r,i){return J.create([r,i],"and")}(n,e):bf(n,e):e instanceof j?bf(e,n):function(r,i){if(R(r.filters.length>0&&i.filters.length>0),Zr(r)&&Zr(i))return Xp(r,i.getFilters());const s=vu(r)?r:i,o=vu(r)?i:r,a=s.filters.map(c=>eh(c,o));return J.create(a,"or")}(n,e),ca(t)}function bf(n,e){if(Zr(e))return Xp(e,n.getFilters());{const t=e.filters.map(r=>eh(n,r));return J.create(t,"or")}}function ca(n){if(R(n instanceof j||n instanceof J),n instanceof j)return n;const e=n.getFilters();if(e.length===1)return ca(e[0]);if(Yp(n))return n;const t=e.map(i=>ca(i)),r=[];return t.forEach(i=>{i instanceof j?r.push(i):i instanceof J&&(i.op===n.op?r.push(...i.filters):r.push(i))}),r.length===1?r[0]:J.create(r,n.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class US{constructor(){this.rn=new th}addToCollectionParentIndex(e,t){return this.rn.add(t),m.resolve()}getCollectionParents(e,t){return m.resolve(this.rn.getEntries(t))}addFieldIndex(e,t){return m.resolve()}deleteFieldIndex(e,t){return m.resolve()}getDocumentsMatchingTarget(e,t){return m.resolve(null)}getIndexType(e,t){return m.resolve(0)}getFieldIndexes(e,t){return m.resolve([])}getNextCollectionGroupToUpdate(e){return m.resolve(null)}getMinOffset(e,t){return m.resolve(lt.min())}getMinOffsetFromCollectionGroup(e,t){return m.resolve(lt.min())}updateCollectionGroup(e,t,r){return m.resolve()}updateIndexEntries(e,t){return m.resolve()}}class th{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new ie(H.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new ie(H.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _o=new Uint8Array(0);class BS{constructor(e,t){this.user=e,this.databaseId=t,this.on=new th,this.un=new Mn(r=>lr(r),(r,i)=>Xs(r,i)),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.on.has(t)){const r=t.lastSegment(),i=t.popLast();e.addOnCommittedListener(()=>{this.on.add(t)});const s={collectionId:r,parent:Ze(i)};return If(e).put(s)}return m.resolve()}getCollectionParents(e,t){const r=[],i=IDBKeyRange.bound([t,""],[Pp(t),""],!1,!0);return If(e).j(i).next(s=>{for(const o of s){if(o.collectionId!==t)break;r.push(Rt(o.parent))}return r})}addFieldIndex(e,t){const r=Eo(e),i=function(o){return{indexId:o.indexId,collectionGroup:o.collectionGroup,fields:o.fields.map(a=>[a.fieldPath.canonicalString(),a.kind])}}(t);delete i.indexId;const s=r.add(i);if(t.indexState){const o=Ui(e);return s.next(a=>{o.put(gf(a,this.user,t.indexState.sequenceNumber,t.indexState.offset))})}return s.next()}deleteFieldIndex(e,t){const r=Eo(e),i=Ui(e),s=Vi(e);return r.delete(t.indexId).next(()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))).next(()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))}getDocumentsMatchingTarget(e,t){const r=Vi(e);let i=!0;const s=new Map;return m.forEach(this.cn(t),o=>this.an(e,o).next(a=>{i&&(i=!!a),s.set(o,a)})).next(()=>{if(i){let o=U();const a=[];return m.forEach(s,(c,u)=>{var l;w("IndexedDbIndexManager",`Using index ${l=c,`id=${l.indexId}|cg=${l.collectionGroup}|f=${l.fields.map(D=>`${D.fieldPath}:${D.kind}`).join(",")}`} to execute ${lr(t)}`);const h=function(D,z){const Y=gu(z);if(Y===void 0)return null;for(const $ of sa(D,Y.fieldPath))switch($.op){case"array-contains-any":return $.value.arrayValue.values||[];case"array-contains":return[$.value]}return null}(u,c),d=function(D,z){const Y=new Map;for(const $ of qn(z))for(const ee of sa(D,$.fieldPath))switch(ee.op){case"==":case"in":Y.set($.fieldPath.canonicalString(),ee.value);break;case"not-in":case"!=":return Y.set($.fieldPath.canonicalString(),ee.value),Array.from(Y.values())}return null}(u,c),f=function(D,z){const Y=[];let $=!0;for(const ee of qn(z)){const I=ee.kind===0?Zd(D,ee.fieldPath,D.startAt):ef(D,ee.fieldPath,D.startAt);Y.push(I.value),$&&($=I.inclusive)}return new Tn(Y,$)}(u,c),p=function(D,z){const Y=[];let $=!0;for(const ee of qn(z)){const I=ee.kind===0?ef(D,ee.fieldPath,D.endAt):Zd(D,ee.fieldPath,D.endAt);Y.push(I.value),$&&($=I.inclusive)}return new Tn(Y,$)}(u,c),v=this.hn(c,u,f),E=this.hn(c,u,p),L=this.ln(c,u,d),O=this.fn(c.indexId,h,v,f.inclusive,E,p.inclusive,L);return m.forEach(O,D=>r.H(D,t.limit).next(z=>{z.forEach(Y=>{const $=_.fromSegments(Y.documentKey);o.has($)||(o=o.add($),a.push($))})}))}).next(()=>a)}return m.resolve(null)})}cn(e){let t=this.un.get(e);return t||(e.filters.length===0?t=[e]:t=VS(J.create(e.filters,"and")).map(r=>Iu(e.path,e.collectionGroup,e.orderBy,r.getFilters(),e.limit,e.startAt,e.endAt)),this.un.set(e,t),t)}fn(e,t,r,i,s,o,a){const c=(t!=null?t.length:1)*Math.max(r.length,s.length),u=c/(t!=null?t.length:1),l=[];for(let h=0;h<c;++h){const d=t?this.dn(t[h/u]):_o,f=this.wn(e,d,r[h%u],i),p=this._n(e,d,s[h%u],o),v=a.map(E=>this.wn(e,d,E,!0));l.push(...this.createRange(f,p,v))}return l}wn(e,t,r,i){const s=new Wn(e,_.empty(),t,r);return i?s:s.Je()}_n(e,t,r,i){const s=new Wn(e,_.empty(),t,r);return i?s.Je():s}an(e,t){const r=new FS(t),i=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,i).next(s=>{let o=null;for(const a of s)r.tn(a)&&(!o||a.fields.length>o.fields.length)&&(o=a);return o})}getIndexType(e,t){let r=2;const i=this.cn(t);return m.forEach(i,s=>this.an(e,s).next(o=>{o?r!==0&&o.fields.length<function(a){let c=new ie(ge.comparator),u=!1;for(const l of a.filters)for(const h of l.getFlattenedFilters())h.field.isKeyField()||(h.op==="array-contains"||h.op==="array-contains-any"?u=!0:c=c.add(h.field));for(const l of a.orderBy)l.field.isKeyField()||(c=c.add(l.field));return c.size+(u?1:0)}(s)&&(r=1):r=0})).next(()=>function(s){return s.limit!==null}(t)&&i.length>1&&r===2?1:r)}mn(e,t){const r=new Fi;for(const i of qn(e)){const s=t.data.field(i.fieldPath);if(s==null)return null;const o=r.He(i.kind);Gn.Ve._e(s,o)}return r.Qe()}dn(e){const t=new Fi;return Gn.Ve._e(e,t.He(0)),t.Qe()}gn(e,t){const r=new Fi;return Gn.Ve._e(ur(this.databaseId,t),r.He(function(i){const s=qn(i);return s.length===0?0:s[s.length-1].kind}(e))),r.Qe()}ln(e,t,r){if(r===null)return[];let i=[];i.push(new Fi);let s=0;for(const o of qn(e)){const a=r[s++];for(const c of i)if(this.yn(t,o.fieldPath)&&xs(a))i=this.pn(i,o,a);else{const u=c.He(o.kind);Gn.Ve._e(a,u)}}return this.In(i)}hn(e,t,r){return this.ln(e,t,r.position)}In(e){const t=[];for(let r=0;r<e.length;++r)t[r]=e[r].Qe();return t}pn(e,t,r){const i=[...e],s=[];for(const o of r.arrayValue.values||[])for(const a of i){const c=new Fi;c.seed(a.Qe()),Gn.Ve._e(o,c.He(t.kind)),s.push(c)}return s}yn(e,t){return!!e.filters.find(r=>r instanceof j&&r.field.isEqual(t)&&(r.op==="in"||r.op==="not-in"))}getFieldIndexes(e,t){const r=Eo(e),i=Ui(e);return(t?r.j("collectionGroupIndex",IDBKeyRange.bound(t,t)):r.j()).next(s=>{const o=[];return m.forEach(s,a=>i.get([a.indexId,this.uid]).next(c=>{o.push(function(u,l){const h=l?new ra(l.sequenceNumber,new lt(mr(l.readTime),new _(Rt(l.documentKey)),l.largestBatchId)):ra.empty(),d=u.fields.map(([f,p])=>new _k(ge.fromServerFormat(f),p));return new Op(u.indexId,u.collectionGroup,d,h)}(a,c))})).next(()=>o)})}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next(t=>t.length===0?null:(t.sort((r,i)=>{const s=r.indexState.sequenceNumber-i.indexState.sequenceNumber;return s!==0?s:V(r.collectionGroup,i.collectionGroup)}),t[0].collectionGroup))}updateCollectionGroup(e,t,r){const i=Eo(e),s=Ui(e);return this.Tn(e).next(o=>i.j("collectionGroupIndex",IDBKeyRange.bound(t,t)).next(a=>m.forEach(a,c=>s.put(gf(c.indexId,this.user,o,r)))))}updateIndexEntries(e,t){const r=new Map;return m.forEach(t,(i,s)=>{const o=r.get(i.collectionGroup);return(o?m.resolve(o):this.getFieldIndexes(e,i.collectionGroup)).next(a=>(r.set(i.collectionGroup,a),m.forEach(a,c=>this.En(e,i,c).next(u=>{const l=this.An(s,c);return u.isEqual(l)?m.resolve():this.vn(e,s,c,u,l)}))))})}Rn(e,t,r,i){return Vi(e).put({indexId:i.indexId,uid:this.uid,arrayValue:i.arrayValue,directionalValue:i.directionalValue,orderedDocumentKey:this.gn(r,t.key),documentKey:t.key.path.toArray()})}Pn(e,t,r,i){return Vi(e).delete([i.indexId,this.uid,i.arrayValue,i.directionalValue,this.gn(r,t.key),t.key.path.toArray()])}En(e,t,r){const i=Vi(e);let s=new ie(on);return i.X({index:"documentKeyIndex",range:IDBKeyRange.only([r.indexId,this.uid,this.gn(r,t)])},(o,a)=>{s=s.add(new Wn(r.indexId,t,a.arrayValue,a.directionalValue))}).next(()=>s)}An(e,t){let r=new ie(on);const i=this.mn(t,e);if(i==null)return r;const s=gu(t);if(s!=null){const o=e.data.field(s.fieldPath);if(xs(o))for(const a of o.arrayValue.values||[])r=r.add(new Wn(t.indexId,e.key,this.dn(a),i))}else r=r.add(new Wn(t.indexId,e.key,_o,i));return r}vn(e,t,r,i,s){w("IndexedDbIndexManager","Updating index entries for document '%s'",t.key);const o=[];return function(a,c,u,l,h){const d=a.getIterator(),f=c.getIterator();let p=xr(d),v=xr(f);for(;p||v;){let E=!1,L=!1;if(p&&v){const O=u(p,v);O<0?L=!0:O>0&&(E=!0)}else p!=null?L=!0:E=!0;E?(l(v),v=xr(f)):L?(h(p),p=xr(d)):(p=xr(d),v=xr(f))}}(i,s,on,a=>{o.push(this.Rn(e,t,r,a))},a=>{o.push(this.Pn(e,t,r,a))}),m.waitFor(o)}Tn(e){let t=1;return Ui(e).X({index:"sequenceNumberIndex",reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(r,i,s)=>{s.done(),t=i.sequenceNumber+1}).next(()=>t)}createRange(e,t,r){r=r.sort((o,a)=>on(o,a)).filter((o,a,c)=>!a||on(o,c[a-1])!==0);const i=[];i.push(e);for(const o of r){const a=on(o,e),c=on(o,t);if(a===0)i[0]=e.Je();else if(a>0&&c<0)i.push(o),i.push(o.Je());else if(c>0)break}i.push(t);const s=[];for(let o=0;o<i.length;o+=2){if(this.bn(i[o],i[o+1]))return[];const a=[i[o].indexId,this.uid,i[o].arrayValue,i[o].directionalValue,_o,[]],c=[i[o+1].indexId,this.uid,i[o+1].arrayValue,i[o+1].directionalValue,_o,[]];s.push(IDBKeyRange.bound(a,c))}return s}bn(e,t){return on(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(_f)}getMinOffset(e,t){return m.mapArray(this.cn(t),r=>this.an(e,r).next(i=>i||A())).next(_f)}}function If(n){return Me(n,"collectionParents")}function Vi(n){return Me(n,"indexEntries")}function Eo(n){return Me(n,"indexConfiguration")}function Ui(n){return Me(n,"indexState")}function _f(n){R(n.length!==0);let e=n[0].indexState.offset,t=e.largestBatchId;for(let r=1;r<n.length;r++){const i=n[r].indexState.offset;Ul(i,e)<0&&(e=i),t<i.largestBatchId&&(t=i.largestBatchId)}return new lt(e.readTime,e.documentKey,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ef={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0};class tt{constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}static withCacheSize(e){return new tt(e,tt.DEFAULT_COLLECTION_PERCENTILE,tt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fy(n,e,t){const r=n.store("mutations"),i=n.store("documentMutations"),s=[],o=IDBKeyRange.only(t.batchId);let a=0;const c=r.X({range:o},(l,h,d)=>(a++,d.delete()));s.push(c.next(()=>{R(a===1)}));const u=[];for(const l of t.mutations){const h=Bp(e,l.key.path,t.batchId);s.push(i.delete(h)),u.push(l.key)}return m.waitFor(s).next(()=>u)}function ua(n){if(!n)return 0;let e;if(n.document)e=n.document;else if(n.unknownDocument)e=n.unknownDocument;else{if(!n.noDocument)throw A();e=n.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */tt.DEFAULT_COLLECTION_PERCENTILE=10,tt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,tt.DEFAULT=new tt(41943040,tt.DEFAULT_COLLECTION_PERCENTILE,tt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),tt.DISABLED=new tt(-1,0,0);class Ja{constructor(e,t,r,i){this.userId=e,this.serializer=t,this.indexManager=r,this.referenceDelegate=i,this.Vn={}}static de(e,t,r,i){R(e.uid!=="");const s=e.isAuthenticated()?e.uid:"";return new Ja(s,t,r,i)}checkEmpty(e){let t=!0;const r=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return an(e).X({index:"userMutationsIndex",range:r},(i,s,o)=>{t=!1,o.done()}).next(()=>t)}addMutationBatch(e,t,r,i){const s=Mr(e),o=an(e);return o.add({}).next(a=>{R(typeof a=="number");const c=new Hl(a,t,r,i),u=function(d,f,p){const v=p.baseMutations.map(L=>Rs(d.fe,L)),E=p.mutations.map(L=>Rs(d.fe,L));return{userId:f,batchId:p.batchId,localWriteTimeMs:p.localWriteTime.toMillis(),baseMutations:v,mutations:E}}(this.serializer,this.userId,c),l=[];let h=new ie((d,f)=>V(d.canonicalString(),f.canonicalString()));for(const d of i){const f=Bp(this.userId,d.key.path,a);h=h.add(d.key.path.popLast()),l.push(o.put(u)),l.push(s.put(f,Ck))}return h.forEach(d=>{l.push(this.indexManager.addToCollectionParentIndex(e,d))}),e.addOnCommittedListener(()=>{this.Vn[a]=c.keys()}),m.waitFor(l).next(()=>c)})}lookupMutationBatch(e,t){return an(e).get(t).next(r=>r?(R(r.userId===this.userId),jn(this.serializer,r)):null)}Sn(e,t){return this.Vn[t]?m.resolve(this.Vn[t]):this.lookupMutationBatch(e,t).next(r=>{if(r){const i=r.keys();return this.Vn[t]=i,i}return null})}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=IDBKeyRange.lowerBound([this.userId,r]);let s=null;return an(e).X({index:"userMutationsIndex",range:i},(o,a,c)=>{a.userId===this.userId&&(R(a.batchId>=r),s=jn(this.serializer,a)),c.done()}).next(()=>s)}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let r=-1;return an(e).X({index:"userMutationsIndex",range:t,reverse:!0},(i,s,o)=>{r=s.batchId,o.done()}).next(()=>r)}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,-1],[this.userId,Number.POSITIVE_INFINITY]);return an(e).j("userMutationsIndex",t).next(r=>r.map(i=>jn(this.serializer,i)))}getAllMutationBatchesAffectingDocumentKey(e,t){const r=Oo(this.userId,t.path),i=IDBKeyRange.lowerBound(r),s=[];return Mr(e).X({range:i},(o,a,c)=>{const[u,l,h]=o,d=Rt(l);if(u===this.userId&&t.path.isEqual(d))return an(e).get(h).next(f=>{if(!f)throw A();R(f.userId===this.userId),s.push(jn(this.serializer,f))});c.done()}).next(()=>s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ie(V);const i=[];return t.forEach(s=>{const o=Oo(this.userId,s.path),a=IDBKeyRange.lowerBound(o),c=Mr(e).X({range:a},(u,l,h)=>{const[d,f,p]=u,v=Rt(f);d===this.userId&&s.path.isEqual(v)?r=r.add(p):h.done()});i.push(c)}),m.waitFor(i).next(()=>this.Dn(e,r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1,s=Oo(this.userId,r),o=IDBKeyRange.lowerBound(s);let a=new ie(V);return Mr(e).X({range:o},(c,u,l)=>{const[h,d,f]=c,p=Rt(d);h===this.userId&&r.isPrefixOf(p)?p.length===i&&(a=a.add(f)):l.done()}).next(()=>this.Dn(e,a))}Dn(e,t){const r=[],i=[];return t.forEach(s=>{i.push(an(e).get(s).next(o=>{if(o===null)throw A();R(o.userId===this.userId),r.push(jn(this.serializer,o))}))}),m.waitFor(i).next(()=>r)}removeMutationBatch(e,t){return Fy(e.ht,this.userId,t).next(r=>(e.addOnCommittedListener(()=>{this.Cn(t.batchId)}),m.forEach(r,i=>this.referenceDelegate.markPotentiallyOrphaned(e,i))))}Cn(e){delete this.Vn[e]}performConsistencyCheck(e){return this.checkEmpty(e).next(t=>{if(!t)return m.resolve();const r=IDBKeyRange.lowerBound([this.userId]),i=[];return Mr(e).X({range:r},(s,o,a)=>{if(s[0]===this.userId){const c=Rt(s[1]);i.push(c)}else a.done()}).next(()=>{R(i.length===0)})})}containsKey(e,t){return Vy(e,this.userId,t)}xn(e){return Uy(e).get(this.userId).next(t=>t||{userId:this.userId,lastAcknowledgedBatchId:-1,lastStreamToken:""})}}function Vy(n,e,t){const r=Oo(e,t.path),i=r[1],s=IDBKeyRange.lowerBound(r);let o=!1;return Mr(n).X({range:s,Y:!0},(a,c,u)=>{const[l,h,d]=a;l===e&&h===i&&(o=!0),u.done()}).next(()=>o)}function an(n){return Me(n,"mutations")}function Mr(n){return Me(n,"documentMutations")}function Uy(n){return Me(n,"mutationQueues")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gr{constructor(e){this.Nn=e}next(){return this.Nn+=2,this.Nn}static kn(){return new gr(0)}static Mn(){return new gr(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qS{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.$n(e).next(t=>{const r=new gr(t.highestTargetId);return t.highestTargetId=r.next(),this.On(e,t).next(()=>t.highestTargetId)})}getLastRemoteSnapshotVersion(e){return this.$n(e).next(t=>N.fromTimestamp(new ae(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(e){return this.$n(e).next(t=>t.highestListenSequenceNumber)}setTargetsMetadata(e,t,r){return this.$n(e).next(i=>(i.highestListenSequenceNumber=t,r&&(i.lastRemoteSnapshotVersion=r.toTimestamp()),t>i.highestListenSequenceNumber&&(i.highestListenSequenceNumber=t),this.On(e,i)))}addTargetData(e,t){return this.Fn(e,t).next(()=>this.$n(e).next(r=>(r.targetCount+=1,this.Bn(t,r),this.On(e,r))))}updateTargetData(e,t){return this.Fn(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next(()=>Dr(e).delete(t.targetId)).next(()=>this.$n(e)).next(r=>(R(r.targetCount>0),r.targetCount-=1,this.On(e,r)))}removeTargets(e,t,r){let i=0;const s=[];return Dr(e).X((o,a)=>{const c=Xi(a);c.sequenceNumber<=t&&r.get(c.targetId)===null&&(i++,s.push(this.removeTargetData(e,c)))}).next(()=>m.waitFor(s)).next(()=>i)}forEachTarget(e,t){return Dr(e).X((r,i)=>{const s=Xi(i);t(s)})}$n(e){return Tf(e).get("targetGlobalKey").next(t=>(R(t!==null),t))}On(e,t){return Tf(e).put("targetGlobalKey",t)}Fn(e,t){return Dr(e).put(Oy(this.serializer,t))}Bn(e,t){let r=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,r=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,r=!0),r}getTargetCount(e){return this.$n(e).next(t=>t.targetCount)}getTargetData(e,t){const r=lr(t),i=IDBKeyRange.bound([r,Number.NEGATIVE_INFINITY],[r,Number.POSITIVE_INFINITY]);let s=null;return Dr(e).X({range:i,index:"queryTargetsIndex"},(o,a,c)=>{const u=Xi(a);Xs(t,u.target)&&(s=u,c.done())}).next(()=>s)}addMatchingKeys(e,t,r){const i=[],s=hn(e);return t.forEach(o=>{const a=Ze(o.path);i.push(s.put({targetId:r,path:a})),i.push(this.referenceDelegate.addReference(e,r,o))}),m.waitFor(i)}removeMatchingKeys(e,t,r){const i=hn(e);return m.forEach(t,s=>{const o=Ze(s.path);return m.waitFor([i.delete([r,o]),this.referenceDelegate.removeReference(e,r,s)])})}removeMatchingKeysForTargetId(e,t){const r=hn(e),i=IDBKeyRange.bound([t],[t+1],!1,!0);return r.delete(i)}getMatchingKeysForTargetId(e,t){const r=IDBKeyRange.bound([t],[t+1],!1,!0),i=hn(e);let s=U();return i.X({range:r,Y:!0},(o,a,c)=>{const u=Rt(o[1]),l=new _(u);s=s.add(l)}).next(()=>s)}containsKey(e,t){const r=Ze(t.path),i=IDBKeyRange.bound([r],[Pp(r)],!1,!0);let s=0;return hn(e).X({index:"documentTargetsIndex",Y:!0,range:i},([o,a],c,u)=>{o!==0&&(s++,u.done())}).next(()=>s>0)}le(e,t){return Dr(e).get(t).next(r=>r?Xi(r):null)}}function Dr(n){return Me(n,"targets")}function Tf(n){return Me(n,"targetGlobal")}function hn(n){return Me(n,"targetDocuments")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kf([n,e],[t,r]){const i=V(n,t);return i===0?V(e,r):i}class $S{constructor(e){this.Ln=e,this.buffer=new ie(kf),this.qn=0}Un(){return++this.qn}Kn(e){const t=[e,this.Un()];if(this.buffer.size<this.Ln)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();kf(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class zS{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Gn=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Qn(6e4)}stop(){this.Gn&&(this.Gn.cancel(),this.Gn=null)}get started(){return this.Gn!==null}Qn(e){w("LruGarbageCollector",`Garbage collection scheduled in ${e}ms`),this.Gn=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Gn=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){On(t)?w("LruGarbageCollector","Ignoring IndexedDB error during garbage collection: ",t):await Pn(t)}await this.Qn(3e5)})}}class jS{constructor(e,t){this.jn=e,this.params=t}calculateTargetCount(e,t){return this.jn.zn(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return m.resolve(nt.ct);const r=new $S(t);return this.jn.forEachTarget(e,i=>r.Kn(i.sequenceNumber)).next(()=>this.jn.Wn(e,i=>r.Kn(i))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.jn.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.jn.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(w("LruGarbageCollector","Garbage collection skipped; disabled"),m.resolve(Ef)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(w("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Ef):this.Hn(e,t))}getCacheSize(e){return this.jn.getCacheSize(e)}Hn(e,t){let r,i,s,o,a,c,u;const l=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(h=>(h>this.params.maximumSequenceNumbersToCollect?(w("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${h}`),i=this.params.maximumSequenceNumbersToCollect):i=h,o=Date.now(),this.nthSequenceNumber(e,i))).next(h=>(r=h,a=Date.now(),this.removeTargets(e,r,t))).next(h=>(s=h,c=Date.now(),this.removeOrphanedDocuments(e,r))).next(h=>(u=Date.now(),mu()<=W.DEBUG&&w("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-l}ms
	Determined least recently used ${i} in `+(a-o)+`ms
	Removed ${s} targets in `+(c-a)+`ms
	Removed ${h} documents in `+(u-c)+`ms
Total Duration: ${u-l}ms`),m.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:h})))}}function GS(n,e){return new jS(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WS{constructor(e,t){this.db=e,this.garbageCollector=GS(this,t)}zn(e){const t=this.Jn(e);return this.db.getTargetCache().getTargetCount(e).next(r=>t.next(i=>r+i))}Jn(e){let t=0;return this.Wn(e,r=>{t++}).next(()=>t)}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}Wn(e,t){return this.Yn(e,(r,i)=>t(i))}addReference(e,t,r){return To(e,r)}removeReference(e,t,r){return To(e,r)}removeTargets(e,t,r){return this.db.getTargetCache().removeTargets(e,t,r)}markPotentiallyOrphaned(e,t){return To(e,t)}Xn(e,t){return function(r,i){let s=!1;return Uy(r).Z(o=>Vy(r,o,i).next(a=>(a&&(s=!0),m.resolve(!a)))).next(()=>s)}(e,t)}removeOrphanedDocuments(e,t){const r=this.db.getRemoteDocumentCache().newChangeBuffer(),i=[];let s=0;return this.Yn(e,(o,a)=>{if(a<=t){const c=this.Xn(e,o).next(u=>{if(!u)return s++,r.getEntry(e,o).next(()=>(r.removeEntry(o,N.min()),hn(e).delete([0,Ze(o.path)])))});i.push(c)}}).next(()=>m.waitFor(i)).next(()=>r.apply(e)).next(()=>s)}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,r)}updateLimboDocument(e,t){return To(e,t)}Yn(e,t){const r=hn(e);let i,s=nt.ct;return r.X({index:"documentTargetsIndex"},([o,a],{path:c,sequenceNumber:u})=>{o===0?(s!==nt.ct&&t(new _(Rt(i)),s),s=u,i=c):s=nt.ct}).next(()=>{s!==nt.ct&&t(new _(Rt(i)),s)})}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function To(n,e){return hn(n).put(function(t,r){return{targetId:0,path:Ze(t.path),sequenceNumber:r}}(e,n.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class By{constructor(){this.changes=new Mn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,re.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?m.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HS{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,r){return Vn(e).put(r)}removeEntry(e,t,r){return Vn(e).delete(function(i,s){const o=i.path.toArray();return[o.slice(0,o.length-2),o[o.length-2],aa(s),o[o.length-1]]}(t,r))}updateMetadata(e,t){return this.getMetadata(e).next(r=>(r.byteSize+=t,this.Zn(e,r)))}getEntry(e,t){let r=re.newInvalidDocument(t);return Vn(e).X({index:"documentKeyIndex",range:IDBKeyRange.only(Bi(t))},(i,s)=>{r=this.ts(t,s)}).next(()=>r)}es(e,t){let r={size:0,document:re.newInvalidDocument(t)};return Vn(e).X({index:"documentKeyIndex",range:IDBKeyRange.only(Bi(t))},(i,s)=>{r={document:this.ts(t,s),size:ua(s)}}).next(()=>r)}getEntries(e,t){let r=it();return this.ns(e,t,(i,s)=>{const o=this.ts(i,s);r=r.insert(i,o)}).next(()=>r)}ss(e,t){let r=it(),i=new te(_.comparator);return this.ns(e,t,(s,o)=>{const a=this.ts(s,o);r=r.insert(s,a),i=i.insert(s,ua(o))}).next(()=>({documents:r,rs:i}))}ns(e,t,r){if(t.isEmpty())return m.resolve();let i=new ie(Cf);t.forEach(c=>i=i.add(c));const s=IDBKeyRange.bound(Bi(i.first()),Bi(i.last())),o=i.getIterator();let a=o.getNext();return Vn(e).X({index:"documentKeyIndex",range:s},(c,u,l)=>{const h=_.fromSegments([...u.prefixPath,u.collectionGroup,u.documentId]);for(;a&&Cf(a,h)<0;)r(a,null),a=o.getNext();a&&a.isEqual(h)&&(r(a,u),a=o.hasNext()?o.getNext():null),a?l.G(Bi(a)):l.done()}).next(()=>{for(;a;)r(a,null),a=o.hasNext()?o.getNext():null})}getDocumentsMatchingQuery(e,t,r,i){const s=t.path,o=[s.popLast().toArray(),s.lastSegment(),aa(r.readTime),r.documentKey.path.isEmpty()?"":r.documentKey.path.lastSegment()],a=[s.popLast().toArray(),s.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Vn(e).j(IDBKeyRange.bound(o,a,!0)).next(c=>{let u=it();for(const l of c){const h=this.ts(_.fromSegments(l.prefixPath.concat(l.collectionGroup,l.documentId)),l);h.isFoundDocument()&&(Zs(t,h)||i.has(h.key))&&(u=u.insert(h.key,h))}return u})}getAllFromCollectionGroup(e,t,r,i){let s=it();const o=Af(t,r),a=Af(t,lt.max());return Vn(e).X({index:"collectionGroupIndex",range:IDBKeyRange.bound(o,a,!0)},(c,u,l)=>{const h=this.ts(_.fromSegments(u.prefixPath.concat(u.collectionGroup,u.documentId)),u);s=s.insert(h.key,h),s.size===i&&l.done()}).next(()=>s)}newChangeBuffer(e){return new KS(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next(t=>t.byteSize)}getMetadata(e){return Sf(e).get("remoteDocumentGlobalKey").next(t=>(R(!!t),t))}Zn(e,t){return Sf(e).put("remoteDocumentGlobalKey",t)}ts(e,t){if(t){const r=NS(this.serializer,t);if(!(r.isNoDocument()&&r.version.isEqual(N.min())))return r}return re.newInvalidDocument(e)}}function qy(n){return new HS(n)}class KS extends By{constructor(e,t){super(),this.os=e,this.trackRemovals=t,this.us=new Mn(r=>r.toString(),(r,i)=>r.isEqual(i))}applyChanges(e){const t=[];let r=0,i=new ie((s,o)=>V(s.canonicalString(),o.canonicalString()));return this.changes.forEach((s,o)=>{const a=this.us.get(s);if(t.push(this.os.removeEntry(e,s,a.readTime)),o.isValidDocument()){const c=ff(this.os.serializer,o);i=i.add(s.path.popLast());const u=ua(c);r+=u-a.size,t.push(this.os.addEntry(e,s,c))}else if(r-=a.size,this.trackRemovals){const c=ff(this.os.serializer,o.convertToNoDocument(N.min()));t.push(this.os.addEntry(e,s,c))}}),i.forEach(s=>{t.push(this.os.indexManager.addToCollectionParentIndex(e,s))}),t.push(this.os.updateMetadata(e,r)),m.waitFor(t)}getFromCache(e,t){return this.os.es(e,t).next(r=>(this.us.set(t,{size:r.size,readTime:r.document.readTime}),r.document))}getAllFromCache(e,t){return this.os.ss(e,t).next(({documents:r,rs:i})=>(i.forEach((s,o)=>{this.us.set(s,{size:o,readTime:r.get(s).readTime})}),r))}}function Sf(n){return Me(n,"remoteDocumentGlobal")}function Vn(n){return Me(n,"remoteDocumentsV14")}function Bi(n){const e=n.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Af(n,e){const t=e.documentKey.path.toArray();return[n,aa(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Cf(n,e){const t=n.path.toArray(),r=e.path.toArray();let i=0;for(let s=0;s<t.length-2&&s<r.length-2;++s)if(i=V(t[s],r[s]),i)return i;return i=V(t.length,r.length),i||(i=V(t[t.length-2],r[r.length-2]),i||V(t[t.length-1],r[r.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class YS{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $y{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(r!==null&&ss(r.mutation,i,rt.empty(),ae.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,U()).next(()=>r))}getLocalViewOfDocuments(e,t,r=U()){const i=Pt();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,r).next(s=>{let o=Yi();return s.forEach((a,c)=>{o=o.insert(a,c.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const r=Pt();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,U()))}populateOverlays(e,t,r){const i=[];return r.forEach(s=>{t.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((o,a)=>{t.set(o,a)})})}computeViews(e,t,r,i){let s=it();const o=is(),a=is();return t.forEach((c,u)=>{const l=r.get(u.key);i.has(u.key)&&(l===void 0||l.mutation instanceof tn)?s=s.insert(u.key,u):l!==void 0?(o.set(u.key,l.mutation.getFieldMask()),ss(l.mutation,u,l.mutation.getFieldMask(),ae.now())):o.set(u.key,rt.empty())}),this.recalculateAndSaveOverlays(e,s).next(c=>(c.forEach((u,l)=>o.set(u,l)),t.forEach((u,l)=>{var h;return a.set(u,new YS(l,(h=o.get(u))!==null&&h!==void 0?h:null))}),a))}recalculateAndSaveOverlays(e,t){const r=is();let i=new te((o,a)=>o-a),s=U();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const a of o)a.keys().forEach(c=>{const u=t.get(c);if(u===null)return;let l=r.get(c)||rt.empty();l=a.applyToLocalView(u,l),r.set(c,l);const h=(i.get(a.batchId)||U()).add(c);i=i.insert(a.batchId,h)})}).next(()=>{const o=[],a=i.getReverseIterator();for(;a.hasNext();){const c=a.getNext(),u=c.key,l=c.value,h=ay();l.forEach(d=>{if(!s.has(d)){const f=gy(t.get(d),r.get(d));f!==null&&h.set(d,f),s=s.add(d)}}),o.push(this.documentOverlayCache.saveOverlays(e,u,h))}return m.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r){return function(i){return _.isDocumentKey(i.path)&&i.collectionGroup===null&&i.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):jl(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r):this.getDocumentsMatchingCollectionQuery(e,t,r)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next(s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):m.resolve(Pt());let a=-1,c=s;return o.next(u=>m.forEach(u,(l,h)=>(a<h.largestBatchId&&(a=h.largestBatchId),s.get(l)?m.resolve():this.remoteDocumentCache.getEntry(e,l).next(d=>{c=c.insert(l,d)}))).next(()=>this.populateOverlays(e,u,s)).next(()=>this.computeViews(e,c,u,U())).next(l=>({batchId:a,changes:oy(l)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new _(t)).next(r=>{let i=Yi();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,r){const i=t.collectionGroup;let s=Yi();return this.indexManager.getCollectionParents(e,i).next(o=>m.forEach(o,a=>{const c=function(u,l){return new en(l,null,u.explicitOrderBy.slice(),u.filters.slice(),u.limit,u.limitType,u.startAt,u.endAt)}(t,a.child(i));return this.getDocumentsMatchingCollectionQuery(e,c,r).next(u=>{u.forEach((l,h)=>{s=s.insert(l,h)})})}).next(()=>s))}getDocumentsMatchingCollectionQuery(e,t,r){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(s=>(i=s,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i))).next(s=>{i.forEach((a,c)=>{const u=c.getKey();s.get(u)===null&&(s=s.insert(u,re.newInvalidDocument(u)))});let o=Yi();return s.forEach((a,c)=>{const u=i.get(a);u!==void 0&&ss(u.mutation,c,rt.empty(),ae.now()),Zs(t,c)&&(o=o.insert(a,c))}),o})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QS{constructor(e){this.serializer=e,this.cs=new Map,this.hs=new Map}getBundleMetadata(e,t){return m.resolve(this.cs.get(t))}saveBundleMetadata(e,t){var r;return this.cs.set(t.id,{id:(r=t).id,version:r.version,createTime:we(r.createTime)}),m.resolve()}getNamedQuery(e,t){return m.resolve(this.hs.get(t))}saveNamedQuery(e,t){return this.hs.set(t.name,function(r){return{name:r.name,query:Zl(r.bundledQuery),readTime:we(r.readTime)}}(t)),m.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XS{constructor(){this.overlays=new te(_.comparator),this.ls=new Map}getOverlay(e,t){return m.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Pt();return m.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((i,s)=>{this.we(e,t,s)}),m.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.ls.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.ls.delete(r)),m.resolve()}getOverlaysForCollection(e,t,r){const i=Pt(),s=t.length+1,o=new _(t.child("")),a=this.overlays.getIteratorFrom(o);for(;a.hasNext();){const c=a.getNext().value,u=c.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===s&&c.largestBatchId>r&&i.set(c.getKey(),c)}return m.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new te((u,l)=>u-l);const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>r){let l=s.get(u.largestBatchId);l===null&&(l=Pt(),s=s.insert(u.largestBatchId,l)),l.set(u.getKey(),u)}}const a=Pt(),c=s.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((u,l)=>a.set(u,l)),!(a.size()>=i)););return m.resolve(a)}we(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const o=this.ls.get(i.largestBatchId).delete(r.key);this.ls.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new Yl(t,r));let s=this.ls.get(t);s===void 0&&(s=U(),this.ls.set(t,s)),this.ls.set(t,s.add(r.key))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nh{constructor(){this.fs=new ie(Ce.ds),this.ws=new ie(Ce._s)}isEmpty(){return this.fs.isEmpty()}addReference(e,t){const r=new Ce(e,t);this.fs=this.fs.add(r),this.ws=this.ws.add(r)}gs(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.ys(new Ce(e,t))}ps(e,t){e.forEach(r=>this.removeReference(r,t))}Is(e){const t=new _(new H([])),r=new Ce(t,e),i=new Ce(t,e+1),s=[];return this.ws.forEachInRange([r,i],o=>{this.ys(o),s.push(o.key)}),s}Ts(){this.fs.forEach(e=>this.ys(e))}ys(e){this.fs=this.fs.delete(e),this.ws=this.ws.delete(e)}Es(e){const t=new _(new H([])),r=new Ce(t,e),i=new Ce(t,e+1);let s=U();return this.ws.forEachInRange([r,i],o=>{s=s.add(o.key)}),s}containsKey(e){const t=new Ce(e,0),r=this.fs.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Ce{constructor(e,t){this.key=e,this.As=t}static ds(e,t){return _.comparator(e.key,t.key)||V(e.As,t.As)}static _s(e,t){return V(e.As,t.As)||_.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JS{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.vs=1,this.Rs=new ie(Ce.ds)}checkEmpty(e){return m.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const s=this.vs;this.vs++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Hl(s,t,r,i);this.mutationQueue.push(o);for(const a of i)this.Rs=this.Rs.add(new Ce(a.key,s)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return m.resolve(o)}lookupMutationBatch(e,t){return m.resolve(this.Ps(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.bs(r),s=i<0?0:i;return m.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return m.resolve(this.mutationQueue.length===0?-1:this.vs-1)}getAllMutationBatches(e){return m.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Ce(t,0),i=new Ce(t,Number.POSITIVE_INFINITY),s=[];return this.Rs.forEachInRange([r,i],o=>{const a=this.Ps(o.As);s.push(a)}),m.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ie(V);return t.forEach(i=>{const s=new Ce(i,0),o=new Ce(i,Number.POSITIVE_INFINITY);this.Rs.forEachInRange([s,o],a=>{r=r.add(a.As)})}),m.resolve(this.Vs(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let s=r;_.isDocumentKey(s)||(s=s.child(""));const o=new Ce(new _(s),0);let a=new ie(V);return this.Rs.forEachWhile(c=>{const u=c.key.path;return!!r.isPrefixOf(u)&&(u.length===i&&(a=a.add(c.As)),!0)},o),m.resolve(this.Vs(a))}Vs(e){const t=[];return e.forEach(r=>{const i=this.Ps(r);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){R(this.Ss(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.Rs;return m.forEach(t.mutations,i=>{const s=new Ce(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Rs=r})}Cn(e){}containsKey(e,t){const r=new Ce(t,0),i=this.Rs.firstAfterOrEqual(r);return m.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,m.resolve()}Ss(e,t){return this.bs(e)}bs(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Ps(e){const t=this.bs(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZS{constructor(e){this.Ds=e,this.docs=new te(_.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),s=i?i.size:0,o=this.Ds(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return m.resolve(r?r.document.mutableCopy():re.newInvalidDocument(t))}getEntries(e,t){let r=it();return t.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():re.newInvalidDocument(i))}),m.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let s=it();const o=t.path,a=new _(o.child("")),c=this.docs.getIteratorFrom(a);for(;c.hasNext();){const{key:u,value:{document:l}}=c.getNext();if(!o.isPrefixOf(u.path))break;u.path.length>o.length+1||Ul(Lp(l),r)<=0||(i.has(l.key)||Zs(t,l))&&(s=s.insert(l.key,l.mutableCopy()))}return m.resolve(s)}getAllFromCollectionGroup(e,t,r,i){A()}Cs(e,t){return m.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new eA(this)}getSize(e){return m.resolve(this.size)}}class eA extends By{constructor(e){super(),this.os=e}applyChanges(e){const t=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?t.push(this.os.addEntry(e,i)):this.os.removeEntry(r)}),m.waitFor(t)}getFromCache(e,t){return this.os.getEntry(e,t)}getAllFromCache(e,t){return this.os.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tA{constructor(e){this.persistence=e,this.xs=new Mn(t=>lr(t),Xs),this.lastRemoteSnapshotVersion=N.min(),this.highestTargetId=0,this.Ns=0,this.ks=new nh,this.targetCount=0,this.Ms=gr.kn()}forEachTarget(e,t){return this.xs.forEach((r,i)=>t(i)),m.resolve()}getLastRemoteSnapshotVersion(e){return m.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return m.resolve(this.Ns)}allocateTargetId(e){return this.highestTargetId=this.Ms.next(),m.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Ns&&(this.Ns=t),m.resolve()}Fn(e){this.xs.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.Ms=new gr(t),this.highestTargetId=t),e.sequenceNumber>this.Ns&&(this.Ns=e.sequenceNumber)}addTargetData(e,t){return this.Fn(t),this.targetCount+=1,m.resolve()}updateTargetData(e,t){return this.Fn(t),m.resolve()}removeTargetData(e,t){return this.xs.delete(t.target),this.ks.Is(t.targetId),this.targetCount-=1,m.resolve()}removeTargets(e,t,r){let i=0;const s=[];return this.xs.forEach((o,a)=>{a.sequenceNumber<=t&&r.get(a.targetId)===null&&(this.xs.delete(o),s.push(this.removeMatchingKeysForTargetId(e,a.targetId)),i++)}),m.waitFor(s).next(()=>i)}getTargetCount(e){return m.resolve(this.targetCount)}getTargetData(e,t){const r=this.xs.get(t)||null;return m.resolve(r)}addMatchingKeys(e,t,r){return this.ks.gs(t,r),m.resolve()}removeMatchingKeys(e,t,r){this.ks.ps(t,r);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach(o=>{s.push(i.markPotentiallyOrphaned(e,o))}),m.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.ks.Is(t),m.resolve()}getMatchingKeysForTargetId(e,t){const r=this.ks.Es(t);return m.resolve(r)}containsKey(e,t){return m.resolve(this.ks.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zy{constructor(e,t){this.$s={},this.overlays={},this.Os=new nt(0),this.Fs=!1,this.Fs=!0,this.referenceDelegate=e(this),this.Bs=new tA(this),this.indexManager=new US,this.remoteDocumentCache=function(r){return new ZS(r)}(r=>this.referenceDelegate.Ls(r)),this.serializer=new Py(t),this.qs=new QS(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Fs=!1,Promise.resolve()}get started(){return this.Fs}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new XS,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.$s[e.toKey()];return r||(r=new JS(t,this.referenceDelegate),this.$s[e.toKey()]=r),r}getTargetCache(){return this.Bs}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.qs}runTransaction(e,t,r){w("MemoryPersistence","Starting transaction:",e);const i=new nA(this.Os.next());return this.referenceDelegate.Us(),r(i).next(s=>this.referenceDelegate.Ks(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Gs(e,t){return m.or(Object.values(this.$s).map(r=>()=>r.containsKey(e,t)))}}class nA extends Vp{constructor(e){super(),this.currentSequenceNumber=e}}class Za{constructor(e){this.persistence=e,this.Qs=new nh,this.js=null}static zs(e){return new Za(e)}get Ws(){if(this.js)return this.js;throw A()}addReference(e,t,r){return this.Qs.addReference(r,t),this.Ws.delete(r.toString()),m.resolve()}removeReference(e,t,r){return this.Qs.removeReference(r,t),this.Ws.add(r.toString()),m.resolve()}markPotentiallyOrphaned(e,t){return this.Ws.add(t.toString()),m.resolve()}removeTarget(e,t){this.Qs.Is(t.targetId).forEach(i=>this.Ws.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(s=>this.Ws.add(s.toString()))}).next(()=>r.removeTargetData(e,t))}Us(){this.js=new Set}Ks(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return m.forEach(this.Ws,r=>{const i=_.fromPath(r);return this.Hs(e,i).next(s=>{s||t.removeEntry(i,N.min())})}).next(()=>(this.js=null,t.apply(e)))}updateLimboDocument(e,t){return this.Hs(e,t).next(r=>{r?this.Ws.delete(t.toString()):this.Ws.add(t.toString())})}Ls(e){return 0}Hs(e,t){return m.or([()=>m.resolve(this.Qs.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Gs(e,t)])}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rA{constructor(e){this.serializer=e}O(e,t,r,i){const s=new Wa("createOrUpgrade",t);r<1&&i>=1&&(function(a){a.createObjectStore("owner")}(e),function(a){a.createObjectStore("mutationQueues",{keyPath:"userId"}),a.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",zd,{unique:!0}),a.createObjectStore("documentMutations")}(e),xf(e),function(a){a.createObjectStore("remoteDocuments")}(e));let o=m.resolve();return r<3&&i>=3&&(r!==0&&(function(a){a.deleteObjectStore("targetDocuments"),a.deleteObjectStore("targets"),a.deleteObjectStore("targetGlobal")}(e),xf(e)),o=o.next(()=>function(a){const c=a.store("targetGlobal"),u={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:N.min().toTimestamp(),targetCount:0};return c.put("targetGlobalKey",u)}(s))),r<4&&i>=4&&(r!==0&&(o=o.next(()=>function(a,c){return c.store("mutations").j().next(u=>{a.deleteObjectStore("mutations"),a.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",zd,{unique:!0});const l=c.store("mutations"),h=u.map(d=>l.put(d));return m.waitFor(h)})}(e,s))),o=o.next(()=>{(function(a){a.createObjectStore("clientMetadata",{keyPath:"clientId"})})(e)})),r<5&&i>=5&&(o=o.next(()=>this.Ys(s))),r<6&&i>=6&&(o=o.next(()=>(function(a){a.createObjectStore("remoteDocumentGlobal")}(e),this.Xs(s)))),r<7&&i>=7&&(o=o.next(()=>this.Zs(s))),r<8&&i>=8&&(o=o.next(()=>this.ti(e,s))),r<9&&i>=9&&(o=o.next(()=>{(function(a){a.objectStoreNames.contains("remoteDocumentChanges")&&a.deleteObjectStore("remoteDocumentChanges")})(e)})),r<10&&i>=10&&(o=o.next(()=>this.ei(s))),r<11&&i>=11&&(o=o.next(()=>{(function(a){a.createObjectStore("bundles",{keyPath:"bundleId"})})(e),function(a){a.createObjectStore("namedQueries",{keyPath:"name"})}(e)})),r<12&&i>=12&&(o=o.next(()=>{(function(a){const c=a.createObjectStore("documentOverlays",{keyPath:Bk});c.createIndex("collectionPathOverlayIndex",qk,{unique:!1}),c.createIndex("collectionGroupOverlayIndex",$k,{unique:!1})})(e)})),r<13&&i>=13&&(o=o.next(()=>function(a){const c=a.createObjectStore("remoteDocumentsV14",{keyPath:xk});c.createIndex("documentKeyIndex",Dk),c.createIndex("collectionGroupIndex",Nk)}(e)).next(()=>this.ni(e,s)).next(()=>e.deleteObjectStore("remoteDocuments"))),r<14&&i>=14&&(o=o.next(()=>this.si(e,s))),r<15&&i>=15&&(o=o.next(()=>function(a){a.createObjectStore("indexConfiguration",{keyPath:"indexId",autoIncrement:!0}).createIndex("collectionGroupIndex","collectionGroup",{unique:!1}),a.createObjectStore("indexState",{keyPath:Lk}).createIndex("sequenceNumberIndex",Fk,{unique:!1}),a.createObjectStore("indexEntries",{keyPath:Vk}).createIndex("documentKeyIndex",Uk,{unique:!1})}(e))),o}Xs(e){let t=0;return e.store("remoteDocuments").X((r,i)=>{t+=ua(i)}).next(()=>{const r={byteSize:t};return e.store("remoteDocumentGlobal").put("remoteDocumentGlobalKey",r)})}Ys(e){const t=e.store("mutationQueues"),r=e.store("mutations");return t.j().next(i=>m.forEach(i,s=>{const o=IDBKeyRange.bound([s.userId,-1],[s.userId,s.lastAcknowledgedBatchId]);return r.j("userMutationsIndex",o).next(a=>m.forEach(a,c=>{R(c.userId===s.userId);const u=jn(this.serializer,c);return Fy(e,s.userId,u).next(()=>{})}))}))}Zs(e){const t=e.store("targetDocuments"),r=e.store("remoteDocuments");return e.store("targetGlobal").get("targetGlobalKey").next(i=>{const s=[];return r.X((o,a)=>{const c=new H(o),u=function(l){return[0,Ze(l)]}(c);s.push(t.get(u).next(l=>l?m.resolve():(h=>t.put({targetId:0,path:Ze(h),sequenceNumber:i.highestListenSequenceNumber}))(c)))}).next(()=>m.waitFor(s))})}ti(e,t){e.createObjectStore("collectionParents",{keyPath:Mk});const r=t.store("collectionParents"),i=new th,s=o=>{if(i.add(o)){const a=o.lastSegment(),c=o.popLast();return r.put({collectionId:a,parent:Ze(c)})}};return t.store("remoteDocuments").X({Y:!0},(o,a)=>{const c=new H(o);return s(c.popLast())}).next(()=>t.store("documentMutations").X({Y:!0},([o,a,c],u)=>{const l=Rt(a);return s(l.popLast())}))}ei(e){const t=e.store("targets");return t.X((r,i)=>{const s=Xi(i),o=Oy(this.serializer,s);return t.put(o)})}ni(e,t){const r=t.store("remoteDocuments"),i=[];return r.X((s,o)=>{const a=t.store("remoteDocumentsV14"),c=(u=o,u.document?new _(H.fromString(u.document.name).popFirst(5)):u.noDocument?_.fromSegments(u.noDocument.path):u.unknownDocument?_.fromSegments(u.unknownDocument.path):A()).path.toArray();var u;/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/const l={prefixPath:c.slice(0,c.length-2),collectionGroup:c[c.length-2],documentId:c[c.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};i.push(a.put(l))}).next(()=>m.waitFor(i))}si(e,t){const r=t.store("mutations"),i=qy(this.serializer),s=new zy(Za.zs,this.serializer.fe);return r.j().next(o=>{const a=new Map;return o.forEach(c=>{var u;let l=(u=a.get(c.userId))!==null&&u!==void 0?u:U();jn(this.serializer,c).keys().forEach(h=>l=l.add(h)),a.set(c.userId,l)}),m.forEach(a,(c,u)=>{const l=new xe(u),h=Xa.de(this.serializer,l),d=s.getIndexManager(l),f=Ja.de(l,this.serializer,d,s.referenceDelegate);return new $y(i,f,h,d).recalculateAndSaveOverlaysForDocumentKeys(new pu(t,nt.ct),c).next()})})}}function xf(n){n.createObjectStore("targetDocuments",{keyPath:Pk}).createIndex("documentTargetsIndex",Ok,{unique:!0}),n.createObjectStore("targets",{keyPath:"targetId"}).createIndex("queryTargetsIndex",Rk,{unique:!0}),n.createObjectStore("targetGlobal")}const Vc="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.";class rh{constructor(e,t,r,i,s,o,a,c,u,l,h=15){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=r,this.ii=s,this.window=o,this.document=a,this.ri=u,this.oi=l,this.ui=h,this.Os=null,this.Fs=!1,this.isPrimary=!1,this.networkEnabled=!0,this.ci=null,this.inForeground=!1,this.ai=null,this.hi=null,this.li=Number.NEGATIVE_INFINITY,this.fi=d=>Promise.resolve(),!rh.D())throw new y(g.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new WS(this,i),this.di=t+"main",this.serializer=new Py(c),this.wi=new yt(this.di,this.ui,new rA(this.serializer)),this.Bs=new qS(this.referenceDelegate,this.serializer),this.remoteDocumentCache=qy(this.serializer),this.qs=new RS,this.window&&this.window.localStorage?this._i=this.window.localStorage:(this._i=null,l===!1&&me("IndexedDbPersistence","LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.mi().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new y(g.FAILED_PRECONDITION,Vc);return this.gi(),this.yi(),this.pi(),this.runTransaction("getHighestListenSequenceNumber","readonly",e=>this.Bs.getHighestSequenceNumber(e))}).then(e=>{this.Os=new nt(e,this.ri)}).then(()=>{this.Fs=!0}).catch(e=>(this.wi&&this.wi.close(),Promise.reject(e)))}Ii(e){return this.fi=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.wi.B(async t=>{t.newVersion===null&&await e()})}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.ii.enqueueAndForget(async()=>{this.started&&await this.mi()}))}mi(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",e=>ko(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.Ti(e).next(t=>{t||(this.isPrimary=!1,this.ii.enqueueRetryable(()=>this.fi(!1)))})}).next(()=>this.Ei(e)).next(t=>this.isPrimary&&!t?this.Ai(e).next(()=>!1):!!t&&this.vi(e).next(()=>!0))).catch(e=>{if(On(e))return w("IndexedDbPersistence","Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return w("IndexedDbPersistence","Releasing owner lease after error during lease refresh",e),!1}).then(e=>{this.isPrimary!==e&&this.ii.enqueueRetryable(()=>this.fi(e)),this.isPrimary=e})}Ti(e){return qi(e).get("owner").next(t=>m.resolve(this.Ri(t)))}Pi(e){return ko(e).delete(this.clientId)}async bi(){if(this.isPrimary&&!this.Vi(this.li,18e5)){this.li=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",t=>{const r=Me(t,"clientMetadata");return r.j().next(i=>{const s=this.Si(i,18e5),o=i.filter(a=>s.indexOf(a)===-1);return m.forEach(o,a=>r.delete(a.clientId)).next(()=>o)})}).catch(()=>[]);if(this._i)for(const t of e)this._i.removeItem(this.Di(t.clientId))}}pi(){this.hi=this.ii.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.mi().then(()=>this.bi()).then(()=>this.pi()))}Ri(e){return!!e&&e.ownerId===this.clientId}Ei(e){return this.oi?m.resolve(!0):qi(e).get("owner").next(t=>{if(t!==null&&this.Vi(t.leaseTimestampMs,5e3)&&!this.Ci(t.ownerId)){if(this.Ri(t)&&this.networkEnabled)return!0;if(!this.Ri(t)){if(!t.allowTabSynchronization)throw new y(g.FAILED_PRECONDITION,Vc);return!1}}return!(!this.networkEnabled||!this.inForeground)||ko(e).j().next(r=>this.Si(r,5e3).find(i=>{if(this.clientId!==i.clientId){const s=!this.networkEnabled&&i.networkEnabled,o=!this.inForeground&&i.inForeground,a=this.networkEnabled===i.networkEnabled;if(s||o&&a)return!0}return!1})===void 0)}).next(t=>(this.isPrimary!==t&&w("IndexedDbPersistence",`Client ${t?"is":"is not"} eligible for a primary lease.`),t))}async shutdown(){this.Fs=!1,this.xi(),this.hi&&(this.hi.cancel(),this.hi=null),this.Ni(),this.ki(),await this.wi.runTransaction("shutdown","readwrite",["owner","clientMetadata"],e=>{const t=new pu(e,nt.ct);return this.Ai(t).next(()=>this.Pi(t))}),this.wi.close(),this.Mi()}Si(e,t){return e.filter(r=>this.Vi(r.updateTimeMs,t)&&!this.Ci(r.clientId))}$i(){return this.runTransaction("getActiveClients","readonly",e=>ko(e).j().next(t=>this.Si(t,18e5).map(r=>r.clientId)))}get started(){return this.Fs}getMutationQueue(e,t){return Ja.de(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.Bs}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new BS(e,this.serializer.fe.databaseId)}getDocumentOverlayCache(e){return Xa.de(this.serializer,e)}getBundleCache(){return this.qs}runTransaction(e,t,r){w("IndexedDbPersistence","Starting transaction:",e);const i=t==="readonly"?"readonly":"readwrite",s=(o=this.ui)===15?jk:o===14?zp:o===13?$p:o===12?zk:o===11?qp:void A();var o;let a;return this.wi.runTransaction(e,i,s,c=>(a=new pu(c,this.Os?this.Os.next():nt.ct),t==="readwrite-primary"?this.Ti(a).next(u=>!!u||this.Ei(a)).next(u=>{if(!u)throw me(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.ii.enqueueRetryable(()=>this.fi(!1)),new y(g.FAILED_PRECONDITION,Fp);return r(a)}).next(u=>this.vi(a).next(()=>u)):this.Oi(a).next(()=>r(a)))).then(c=>(a.raiseOnCommittedEvent(),c))}Oi(e){return qi(e).get("owner").next(t=>{if(t!==null&&this.Vi(t.leaseTimestampMs,5e3)&&!this.Ci(t.ownerId)&&!this.Ri(t)&&!(this.oi||this.allowTabSynchronization&&t.allowTabSynchronization))throw new y(g.FAILED_PRECONDITION,Vc)})}vi(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return qi(e).put("owner",t)}static D(){return yt.D()}Ai(e){const t=qi(e);return t.get("owner").next(r=>this.Ri(r)?(w("IndexedDbPersistence","Releasing primary lease."),t.delete("owner")):m.resolve())}Vi(e,t){const r=Date.now();return!(e<r-t)&&(!(e>r)||(me(`Detected an update time that is in the future: ${e} > ${r}`),!1))}gi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.ai=()=>{this.ii.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.mi()))},this.document.addEventListener("visibilitychange",this.ai),this.inForeground=this.document.visibilityState==="visible")}Ni(){this.ai&&(this.document.removeEventListener("visibilitychange",this.ai),this.ai=null)}yi(){var e;typeof((e=this.window)===null||e===void 0?void 0:e.addEventListener)=="function"&&(this.ci=()=>{this.xi();const t=/(?:Version|Mobile)\/1[456]/;Vv()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.ii.enterRestrictedMode(!0),this.ii.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.ci))}ki(){this.ci&&(this.window.removeEventListener("pagehide",this.ci),this.ci=null)}Ci(e){var t;try{const r=((t=this._i)===null||t===void 0?void 0:t.getItem(this.Di(e)))!==null;return w("IndexedDbPersistence",`Client '${e}' ${r?"is":"is not"} zombied in LocalStorage`),r}catch(r){return me("IndexedDbPersistence","Failed to get zombied client id.",r),!1}}xi(){if(this._i)try{this._i.setItem(this.Di(this.clientId),String(Date.now()))}catch(e){me("Failed to set zombie client id.",e)}}Mi(){if(this._i)try{this._i.removeItem(this.Di(this.clientId))}catch{}}Di(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function qi(n){return Me(n,"owner")}function ko(n){return Me(n,"clientMetadata")}function ih(n,e){let t=n.projectId;return n.isDefaultDatabase||(t+="."+n.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sh{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.Fi=r,this.Bi=i}static Li(e,t){let r=U(),i=U();for(const s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new sh(e,t.fromCache,r,i)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jy{constructor(){this.qi=!1}initialize(e,t){this.Ui=e,this.indexManager=t,this.qi=!0}getDocumentsMatchingQuery(e,t,r,i){return this.Ki(e,t).next(s=>s||this.Gi(e,t,i,r)).next(s=>s||this.Qi(e,t))}Ki(e,t){if(tf(t))return m.resolve(null);let r=st(t);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=oa(t,null,"F"),r=st(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const o=U(...s);return this.Ui.getDocuments(e,o).next(a=>this.indexManager.getMinOffset(e,r).next(c=>{const u=this.ji(t,a);return this.zi(t,u,o,c.readTime)?this.Ki(e,oa(t,null,"F")):this.Wi(e,u,t,c)}))})))}Gi(e,t,r,i){return tf(t)||i.isEqual(N.min())?this.Qi(e,t):this.Ui.getDocuments(e,r).next(s=>{const o=this.ji(t,s);return this.zi(t,o,r,i)?this.Qi(e,t):(mu()<=W.DEBUG&&w("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Eu(t)),this.Wi(e,o,t,Mp(i,-1)))})}ji(e,t){let r=new ie(iy(e));return t.forEach((i,s)=>{Zs(e,s)&&(r=r.add(s))}),r}zi(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Qi(e,t){return mu()<=W.DEBUG&&w("QueryEngine","Using full collection scan to execute query:",Eu(t)),this.Ui.getDocumentsMatchingQuery(e,t,lt.min())}Wi(e,t,r,i){return this.Ui.getDocumentsMatchingQuery(e,r,i).next(s=>(t.forEach(o=>{s=s.insert(o.key,o)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iA{constructor(e,t,r,i){this.persistence=e,this.Hi=t,this.serializer=i,this.Ji=new te(V),this.Yi=new Mn(s=>lr(s),Xs),this.Xi=new Map,this.Zi=e.getRemoteDocumentCache(),this.Bs=e.getTargetCache(),this.qs=e.getBundleCache(),this.tr(r)}tr(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new $y(this.Zi,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Zi.setIndexManager(this.indexManager),this.Hi.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Ji))}}function Gy(n,e,t,r){return new iA(n,e,t,r)}async function Wy(n,e){const t=T(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,t.tr(e),t.mutationQueue.getAllMutationBatches(r))).next(s=>{const o=[],a=[];let c=U();for(const u of i){o.push(u.batchId);for(const l of u.mutations)c=c.add(l.key)}for(const u of s){a.push(u.batchId);for(const l of u.mutations)c=c.add(l.key)}return t.localDocuments.getDocuments(r,c).next(u=>({er:u,removedBatchIds:o,addedBatchIds:a}))})})}function sA(n,e){const t=T(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=t.Zi.newChangeBuffer({trackRemovals:!0});return function(o,a,c,u){const l=c.batch,h=l.keys();let d=m.resolve();return h.forEach(f=>{d=d.next(()=>u.getEntry(a,f)).next(p=>{const v=c.docVersions.get(f);R(v!==null),p.version.compareTo(v)<0&&(l.applyToRemoteDocument(p,c),p.isValidDocument()&&(p.setReadTime(c.commitVersion),u.addEntry(p)))})}),d.next(()=>o.mutationQueue.removeMutationBatch(a,l))}(t,r,e,s).next(()=>s.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(o){let a=U();for(let c=0;c<o.mutationResults.length;++c)o.mutationResults[c].transformResults.length>0&&(a=a.add(o.batch.mutations[c].key));return a}(e))).next(()=>t.localDocuments.getDocuments(r,i))})}function Hy(n){const e=T(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Bs.getLastRemoteSnapshotVersion(t))}function oA(n,e){const t=T(n),r=e.snapshotVersion;let i=t.Ji;return t.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const o=t.Zi.newChangeBuffer({trackRemovals:!0});i=t.Ji;const a=[];e.targetChanges.forEach((l,h)=>{const d=i.get(h);if(!d)return;a.push(t.Bs.removeMatchingKeys(s,l.removedDocuments,h).next(()=>t.Bs.addMatchingKeys(s,l.addedDocuments,h)));let f=d.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(h)!==null?f=f.withResumeToken(ke.EMPTY_BYTE_STRING,N.min()).withLastLimboFreeSnapshotVersion(N.min()):l.resumeToken.approximateByteSize()>0&&(f=f.withResumeToken(l.resumeToken,r)),i=i.insert(h,f),function(p,v,E){return p.resumeToken.approximateByteSize()===0||v.snapshotVersion.toMicroseconds()-p.snapshotVersion.toMicroseconds()>=3e8?!0:E.addedDocuments.size+E.modifiedDocuments.size+E.removedDocuments.size>0}(d,f,l)&&a.push(t.Bs.updateTargetData(s,f))});let c=it(),u=U();if(e.documentUpdates.forEach(l=>{e.resolvedLimboDocuments.has(l)&&a.push(t.persistence.referenceDelegate.updateLimboDocument(s,l))}),a.push(Ky(s,o,e.documentUpdates).next(l=>{c=l.nr,u=l.sr})),!r.isEqual(N.min())){const l=t.Bs.getLastRemoteSnapshotVersion(s).next(h=>t.Bs.setTargetsMetadata(s,s.currentSequenceNumber,r));a.push(l)}return m.waitFor(a).next(()=>o.apply(s)).next(()=>t.localDocuments.getLocalViewOfDocuments(s,c,u)).next(()=>c)}).then(s=>(t.Ji=i,s))}function Ky(n,e,t){let r=U(),i=U();return t.forEach(s=>r=r.add(s)),e.getEntries(n,r).next(s=>{let o=it();return t.forEach((a,c)=>{const u=s.get(a);c.isFoundDocument()!==u.isFoundDocument()&&(i=i.add(a)),c.isNoDocument()&&c.version.isEqual(N.min())?(e.removeEntry(a,c.readTime),o=o.insert(a,c)):!u.isValidDocument()||c.version.compareTo(u.version)>0||c.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(c),o=o.insert(a,c)):w("LocalStore","Ignoring outdated watch update for ",a,". Current version:",u.version," Watch version:",c.version)}),{nr:o,sr:i}})}function aA(n,e){const t=T(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function ri(n,e){const t=T(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return t.Bs.getTargetData(r,e).next(s=>s?(i=s,m.resolve(i)):t.Bs.allocateTargetId(r).next(o=>(i=new Gt(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.Bs.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=t.Ji.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.Ji=t.Ji.insert(r.targetId,r),t.Yi.set(e,r.targetId)),r})}async function ii(n,e,t){const r=T(n),i=r.Ji.get(e),s=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",s,o=>r.persistence.referenceDelegate.removeTarget(o,i))}catch(o){if(!On(o))throw o;w("LocalStore",`Failed to update sequence numbers for target ${e}: ${o}`)}r.Ji=r.Ji.remove(e),r.Yi.delete(i.target)}function la(n,e,t){const r=T(n);let i=N.min(),s=U();return r.persistence.runTransaction("Execute query","readonly",o=>function(a,c,u){const l=T(a),h=l.Yi.get(u);return h!==void 0?m.resolve(l.Ji.get(h)):l.Bs.getTargetData(c,u)}(r,o,st(e)).next(a=>{if(a)return i=a.lastLimboFreeSnapshotVersion,r.Bs.getMatchingKeysForTargetId(o,a.targetId).next(c=>{s=c})}).next(()=>r.Hi.getDocumentsMatchingQuery(o,e,t?i:N.min(),t?s:U())).next(a=>(Xy(r,ry(e),a),{documents:a,ir:s})))}function Yy(n,e){const t=T(n),r=T(t.Bs),i=t.Ji.get(e);return i?Promise.resolve(i.target):t.persistence.runTransaction("Get target data","readonly",s=>r.le(s,e).next(o=>o?o.target:null))}function Qy(n,e){const t=T(n),r=t.Xi.get(e)||N.min();return t.persistence.runTransaction("Get new document changes","readonly",i=>t.Zi.getAllFromCollectionGroup(i,e,Mp(r,-1),Number.MAX_SAFE_INTEGER)).then(i=>(Xy(t,e,i),i))}function Xy(n,e,t){let r=n.Xi.get(e)||N.min();t.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),n.Xi.set(e,r)}async function cA(n,e,t,r){const i=T(n);let s=U(),o=it();for(const u of t){const l=e.rr(u.metadata.name);u.document&&(s=s.add(l));const h=e.ur(u);h.setReadTime(e.cr(u.metadata.readTime)),o=o.insert(l,h)}const a=i.Zi.newChangeBuffer({trackRemovals:!0}),c=await ri(i,function(u){return st(wi(H.fromString(`__bundle__/docs/${u}`)))}(r));return i.persistence.runTransaction("Apply bundle documents","readwrite",u=>Ky(u,a,o).next(l=>(a.apply(u),l)).next(l=>i.Bs.removeMatchingKeysForTargetId(u,c.targetId).next(()=>i.Bs.addMatchingKeys(u,s,c.targetId)).next(()=>i.localDocuments.getLocalViewOfDocuments(u,l.nr,l.sr)).next(()=>l.nr)))}async function uA(n,e,t=U()){const r=await ri(n,st(Zl(e.bundledQuery))),i=T(n);return i.persistence.runTransaction("Save named query","readwrite",s=>{const o=we(e.readTime);if(r.snapshotVersion.compareTo(o)>=0)return i.qs.saveNamedQuery(s,e);const a=r.withResumeToken(ke.EMPTY_BYTE_STRING,o);return i.Ji=i.Ji.insert(a.targetId,a),i.Bs.updateTargetData(s,a).next(()=>i.Bs.removeMatchingKeysForTargetId(s,r.targetId)).next(()=>i.Bs.addMatchingKeys(s,t,r.targetId)).next(()=>i.qs.saveNamedQuery(s,e))})}function Df(n,e){return`firestore_clients_${n}_${e}`}function Nf(n,e,t){let r=`firestore_mutations_${n}_${t}`;return e.isAuthenticated()&&(r+=`_${e.uid}`),r}function Uc(n,e){return`firestore_targets_${n}_${e}`}class ha{constructor(e,t,r,i){this.user=e,this.batchId=t,this.state=r,this.error=i}static ar(e,t,r){const i=JSON.parse(r);let s,o=typeof i=="object"&&["pending","acknowledged","rejected"].indexOf(i.state)!==-1&&(i.error===void 0||typeof i.error=="object");return o&&i.error&&(o=typeof i.error.message=="string"&&typeof i.error.code=="string",o&&(s=new y(i.error.code,i.error.message))),o?new ha(e,t,i.state,s):(me("SharedClientState",`Failed to parse mutation state for ID '${t}': ${r}`),null)}hr(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class os{constructor(e,t,r){this.targetId=e,this.state=t,this.error=r}static ar(e,t){const r=JSON.parse(t);let i,s=typeof r=="object"&&["not-current","current","rejected"].indexOf(r.state)!==-1&&(r.error===void 0||typeof r.error=="object");return s&&r.error&&(s=typeof r.error.message=="string"&&typeof r.error.code=="string",s&&(i=new y(r.error.code,r.error.message))),s?new os(e,r.state,i):(me("SharedClientState",`Failed to parse target state for ID '${e}': ${t}`),null)}hr(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class da{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static ar(e,t){const r=JSON.parse(t);let i=typeof r=="object"&&r.activeTargetIds instanceof Array,s=Gl();for(let o=0;i&&o<r.activeTargetIds.length;++o)i=Up(r.activeTargetIds[o]),s=s.add(r.activeTargetIds[o]);return i?new da(e,s):(me("SharedClientState",`Failed to parse client data for instance '${e}': ${t}`),null)}}class oh{constructor(e,t){this.clientId=e,this.onlineState=t}static ar(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new oh(t.clientId,t.onlineState):(me("SharedClientState",`Failed to parse online state: ${e}`),null)}}class Du{constructor(){this.activeTargetIds=Gl()}lr(e){this.activeTargetIds=this.activeTargetIds.add(e)}dr(e){this.activeTargetIds=this.activeTargetIds.delete(e)}hr(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Bc{constructor(e,t,r,i,s){this.window=e,this.ii=t,this.persistenceKey=r,this.wr=i,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this._r=this.mr.bind(this),this.gr=new te(V),this.started=!1,this.yr=[];const o=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=s,this.pr=Df(this.persistenceKey,this.wr),this.Ir=function(a){return`firestore_sequence_number_${a}`}(this.persistenceKey),this.gr=this.gr.insert(this.wr,new Du),this.Tr=new RegExp(`^firestore_clients_${o}_([^_]*)$`),this.Er=new RegExp(`^firestore_mutations_${o}_(\\d+)(?:_(.*))?$`),this.Ar=new RegExp(`^firestore_targets_${o}_(\\d+)$`),this.vr=function(a){return`firestore_online_state_${a}`}(this.persistenceKey),this.Rr=function(a){return`firestore_bundle_loaded_v2_${a}`}(this.persistenceKey),this.window.addEventListener("storage",this._r)}static D(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.$i();for(const r of e){if(r===this.wr)continue;const i=this.getItem(Df(this.persistenceKey,r));if(i){const s=da.ar(r,i);s&&(this.gr=this.gr.insert(s.clientId,s))}}this.Pr();const t=this.storage.getItem(this.vr);if(t){const r=this.br(t);r&&this.Vr(r)}for(const r of this.yr)this.mr(r);this.yr=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(e){this.setItem(this.Ir,JSON.stringify(e))}getAllActiveQueryTargets(){return this.Sr(this.gr)}isActiveQueryTarget(e){let t=!1;return this.gr.forEach((r,i)=>{i.activeTargetIds.has(e)&&(t=!0)}),t}addPendingMutation(e){this.Dr(e,"pending")}updateMutationState(e,t,r){this.Dr(e,t,r),this.Cr(e)}addLocalQueryTarget(e){let t="not-current";if(this.isActiveQueryTarget(e)){const r=this.storage.getItem(Uc(this.persistenceKey,e));if(r){const i=os.ar(e,r);i&&(t=i.state)}}return this.Nr.lr(e),this.Pr(),t}removeLocalQueryTarget(e){this.Nr.dr(e),this.Pr()}isLocalQueryTarget(e){return this.Nr.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(Uc(this.persistenceKey,e))}updateQueryState(e,t,r){this.kr(e,t,r)}handleUserChange(e,t,r){t.forEach(i=>{this.Cr(i)}),this.currentUser=e,r.forEach(i=>{this.addPendingMutation(i)})}setOnlineState(e){this.Mr(e)}notifyBundleLoaded(e){this.$r(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this._r),this.removeItem(this.pr),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return w("SharedClientState","READ",e,t),t}setItem(e,t){w("SharedClientState","SET",e,t),this.storage.setItem(e,t)}removeItem(e){w("SharedClientState","REMOVE",e),this.storage.removeItem(e)}mr(e){const t=e;if(t.storageArea===this.storage){if(w("SharedClientState","EVENT",t.key,t.newValue),t.key===this.pr)return void me("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.ii.enqueueRetryable(async()=>{if(this.started){if(t.key!==null){if(this.Tr.test(t.key)){if(t.newValue==null){const r=this.Or(t.key);return this.Fr(r,null)}{const r=this.Br(t.key,t.newValue);if(r)return this.Fr(r.clientId,r)}}else if(this.Er.test(t.key)){if(t.newValue!==null){const r=this.Lr(t.key,t.newValue);if(r)return this.qr(r)}}else if(this.Ar.test(t.key)){if(t.newValue!==null){const r=this.Ur(t.key,t.newValue);if(r)return this.Kr(r)}}else if(t.key===this.vr){if(t.newValue!==null){const r=this.br(t.newValue);if(r)return this.Vr(r)}}else if(t.key===this.Ir){const r=function(i){let s=nt.ct;if(i!=null)try{const o=JSON.parse(i);R(typeof o=="number"),s=o}catch(o){me("SharedClientState","Failed to read sequence number from WebStorage",o)}return s}(t.newValue);r!==nt.ct&&this.sequenceNumberHandler(r)}else if(t.key===this.Rr){const r=this.Gr(t.newValue);await Promise.all(r.map(i=>this.syncEngine.Qr(i)))}}}else this.yr.push(t)})}}get Nr(){return this.gr.get(this.wr)}Pr(){this.setItem(this.pr,this.Nr.hr())}Dr(e,t,r){const i=new ha(this.currentUser,e,t,r),s=Nf(this.persistenceKey,this.currentUser,e);this.setItem(s,i.hr())}Cr(e){const t=Nf(this.persistenceKey,this.currentUser,e);this.removeItem(t)}Mr(e){const t={clientId:this.wr,onlineState:e};this.storage.setItem(this.vr,JSON.stringify(t))}kr(e,t,r){const i=Uc(this.persistenceKey,e),s=new os(e,t,r);this.setItem(i,s.hr())}$r(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Rr,t)}Or(e){const t=this.Tr.exec(e);return t?t[1]:null}Br(e,t){const r=this.Or(e);return da.ar(r,t)}Lr(e,t){const r=this.Er.exec(e),i=Number(r[1]),s=r[2]!==void 0?r[2]:null;return ha.ar(new xe(s),i,t)}Ur(e,t){const r=this.Ar.exec(e),i=Number(r[1]);return os.ar(i,t)}br(e){return oh.ar(e)}Gr(e){return JSON.parse(e)}async qr(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.jr(e.batchId,e.state,e.error);w("SharedClientState",`Ignoring mutation for non-active user ${e.user.uid}`)}Kr(e){return this.syncEngine.zr(e.targetId,e.state,e.error)}Fr(e,t){const r=t?this.gr.insert(e,t):this.gr.remove(e),i=this.Sr(this.gr),s=this.Sr(r),o=[],a=[];return s.forEach(c=>{i.has(c)||o.push(c)}),i.forEach(c=>{s.has(c)||a.push(c)}),this.syncEngine.Wr(o,a).then(()=>{this.gr=r})}Vr(e){this.gr.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}Sr(e){let t=Gl();return e.forEach((r,i)=>{t=t.unionWith(i.activeTargetIds)}),t}}class Jy{constructor(){this.Hr=new Du,this.Jr={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e){return this.Hr.lr(e),this.Jr[e]||"not-current"}updateQueryState(e,t,r){this.Jr[e]=t}removeLocalQueryTarget(e){this.Hr.dr(e)}isLocalQueryTarget(e){return this.Hr.activeTargetIds.has(e)}clearQueryState(e){delete this.Jr[e]}getAllActiveQueryTargets(){return this.Hr.activeTargetIds}isActiveQueryTarget(e){return this.Hr.activeTargetIds.has(e)}start(){return this.Hr=new Du,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lA{Yr(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rf{constructor(){this.Xr=()=>this.Zr(),this.eo=()=>this.no(),this.so=[],this.io()}Yr(e){this.so.push(e)}shutdown(){window.removeEventListener("online",this.Xr),window.removeEventListener("offline",this.eo)}io(){window.addEventListener("online",this.Xr),window.addEventListener("offline",this.eo)}Zr(){w("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.so)e(0)}no(){w("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.so)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let So=null;function qc(){return So===null?So=268435456+Math.round(2147483648*Math.random()):So++,"0x"+So.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hA={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dA{constructor(e){this.ro=e.ro,this.oo=e.oo}uo(e){this.co=e}ao(e){this.ho=e}onMessage(e){this.lo=e}close(){this.oo()}send(e){this.ro(e)}fo(){this.co()}wo(e){this.ho(e)}_o(e){this.lo(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const je="WebChannelConnection";class fA extends class{constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http";this.mo=t+"://"+e.host,this.yo="projects/"+this.databaseId.projectId+"/databases/"+this.databaseId.database+"/documents"}get po(){return!1}Io(e,t,r,i,s){const o=qc(),a=this.To(e,t);w("RestConnection",`Sending RPC '${e}' ${o}:`,a,r);const c={};return this.Eo(c,i,s),this.Ao(e,a,c,r).then(u=>(w("RestConnection",`Received RPC '${e}' ${o}: `,u),u),u=>{throw It("RestConnection",`RPC '${e}' ${o} failed with error: `,u,"url: ",a,"request:",r),u})}vo(e,t,r,i,s,o){return this.Io(e,t,r,i,s)}Eo(e,t,r){e["X-Goog-Api-Client"]="gl-js/ fire/"+yi,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i)}To(e,t){const r=hA[e];return`${this.mo}/v1/${t}:${r}`}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Ao(e,t,r,i){const s=qc();return new Promise((o,a)=>{const c=new ck;c.setWithCredentials(!0),c.listenOnce(sk.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case Lc.NO_ERROR:const l=c.getResponseJson();w(je,`XHR for RPC '${e}' ${s} received:`,JSON.stringify(l)),o(l);break;case Lc.TIMEOUT:w(je,`RPC '${e}' ${s} timed out`),a(new y(g.DEADLINE_EXCEEDED,"Request time out"));break;case Lc.HTTP_ERROR:const h=c.getStatus();if(w(je,`RPC '${e}' ${s} failed with status:`,h,"response text:",c.getResponseText()),h>0){let d=c.getResponseJson();Array.isArray(d)&&(d=d[0]);const f=d==null?void 0:d.error;if(f&&f.status&&f.message){const p=function(v){const E=v.toLowerCase().replace(/_/g,"-");return Object.values(g).indexOf(E)>=0?E:g.UNKNOWN}(f.status);a(new y(p,f.message))}else a(new y(g.UNKNOWN,"Server responded with status "+c.getStatus()))}else a(new y(g.UNAVAILABLE,"Connection failed."));break;default:A()}}finally{w(je,`RPC '${e}' ${s} completed.`)}});const u=JSON.stringify(i);w(je,`RPC '${e}' ${s} sending request:`,i),c.send(t,"POST",u,r,15)})}Ro(e,t,r){const i=qc(),s=[this.mo,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=rk(),a=ik(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(c.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(c.xmlHttpFactory=new ak({})),this.Eo(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const l=s.join("");w(je,`Creating RPC '${e}' stream ${i}: ${l}`,c);const h=o.createWebChannel(l,c);let d=!1,f=!1;const p=new dA({ro:E=>{f?w(je,`Not sending because RPC '${e}' stream ${i} is closed:`,E):(d||(w(je,`Opening RPC '${e}' stream ${i} transport.`),h.open(),d=!0),w(je,`RPC '${e}' stream ${i} sending:`,E),h.send(E))},oo:()=>h.close()}),v=(E,L,O)=>{E.listen(L,D=>{try{O(D)}catch(z){setTimeout(()=>{throw z},0)}})};return v(h,vo.EventType.OPEN,()=>{f||w(je,`RPC '${e}' stream ${i} transport opened.`)}),v(h,vo.EventType.CLOSE,()=>{f||(f=!0,w(je,`RPC '${e}' stream ${i} transport closed`),p.wo())}),v(h,vo.EventType.ERROR,E=>{f||(f=!0,It(je,`RPC '${e}' stream ${i} transport errored:`,E),p.wo(new y(g.UNAVAILABLE,"The operation could not be completed")))}),v(h,vo.EventType.MESSAGE,E=>{var L;if(!f){const O=E.data[0];R(!!O);const D=O,z=D.error||((L=D[0])===null||L===void 0?void 0:L.error);if(z){w(je,`RPC '${e}' stream ${i} received error:`,z);const Y=z.status;let $=function(I){const B=be[I];if(B!==void 0)return wy(B)}(Y),ee=z.message;$===void 0&&($=g.INTERNAL,ee="Unknown error status: "+Y+" with message "+z.message),f=!0,p.wo(new y($,ee)),h.close()}else w(je,`RPC '${e}' stream ${i} received:`,O),p._o(O)}}),v(a,ok.STAT_EVENT,E=>{E.stat===Ud.PROXY?w(je,`RPC '${e}' stream ${i} detected buffering proxy`):E.stat===Ud.NOPROXY&&w(je,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{p.fo()},0),p}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zy(){return typeof window<"u"?window:null}function Uo(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ro(n){return new IS(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ah{constructor(e,t,r=1e3,i=1.5,s=6e4){this.ii=e,this.timerId=t,this.Po=r,this.bo=i,this.Vo=s,this.So=0,this.Do=null,this.Co=Date.now(),this.reset()}reset(){this.So=0}xo(){this.So=this.Vo}No(e){this.cancel();const t=Math.floor(this.So+this.ko()),r=Math.max(0,Date.now()-this.Co),i=Math.max(0,t-r);i>0&&w("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.So} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Do=this.ii.enqueueAfterDelay(this.timerId,i,()=>(this.Co=Date.now(),e())),this.So*=this.bo,this.So<this.Po&&(this.So=this.Po),this.So>this.Vo&&(this.So=this.Vo)}Mo(){this.Do!==null&&(this.Do.skipDelay(),this.Do=null)}cancel(){this.Do!==null&&(this.Do.cancel(),this.Do=null)}ko(){return(Math.random()-.5)*this.So}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ew{constructor(e,t,r,i,s,o,a,c){this.ii=e,this.$o=r,this.Oo=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=a,this.listener=c,this.state=0,this.Fo=0,this.Bo=null,this.Lo=null,this.stream=null,this.qo=new ah(e,t)}Uo(){return this.state===1||this.state===5||this.Ko()}Ko(){return this.state===2||this.state===3}start(){this.state!==4?this.auth():this.Go()}async stop(){this.Uo()&&await this.close(0)}Qo(){this.state=0,this.qo.reset()}jo(){this.Ko()&&this.Bo===null&&(this.Bo=this.ii.enqueueAfterDelay(this.$o,6e4,()=>this.zo()))}Wo(e){this.Ho(),this.stream.send(e)}async zo(){if(this.Ko())return this.close(0)}Ho(){this.Bo&&(this.Bo.cancel(),this.Bo=null)}Jo(){this.Lo&&(this.Lo.cancel(),this.Lo=null)}async close(e,t){this.Ho(),this.Jo(),this.qo.cancel(),this.Fo++,e!==4?this.qo.reset():t&&t.code===g.RESOURCE_EXHAUSTED?(me(t.toString()),me("Using maximum backoff delay to prevent overloading the backend."),this.qo.xo()):t&&t.code===g.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.Yo(),this.stream.close(),this.stream=null),this.state=e,await this.listener.ao(t)}Yo(){}auth(){this.state=1;const e=this.Xo(this.Fo),t=this.Fo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.Fo===t&&this.Zo(r,i)},r=>{e(()=>{const i=new y(g.UNKNOWN,"Fetching auth token failed: "+r.message);return this.tu(i)})})}Zo(e,t){const r=this.Xo(this.Fo);this.stream=this.eu(e,t),this.stream.uo(()=>{r(()=>(this.state=2,this.Lo=this.ii.enqueueAfterDelay(this.Oo,1e4,()=>(this.Ko()&&(this.state=3),Promise.resolve())),this.listener.uo()))}),this.stream.ao(i=>{r(()=>this.tu(i))}),this.stream.onMessage(i=>{r(()=>this.onMessage(i))})}Go(){this.state=5,this.qo.No(async()=>{this.state=0,this.start()})}tu(e){return w("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}Xo(e){return t=>{this.ii.enqueueAndForget(()=>this.Fo===e?t():(w("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class mA extends ew{constructor(e,t,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,o),this.serializer=s}eu(e,t){return this.connection.Ro("Listen",e,t)}onMessage(e){this.qo.reset();const t=TS(this.serializer,e),r=function(i){if(!("targetChange"in i))return N.min();const s=i.targetChange;return s.targetIds&&s.targetIds.length?N.min():s.readTime?we(s.readTime):N.min()}(e);return this.listener.nu(t,r)}su(e){const t={};t.database=Ns(this.serializer),t.addTarget=function(i,s){let o;const a=s.target;if(o=ia(a)?{documents:Ay(i,a)}:{query:Cy(i,a)},o.targetId=s.targetId,s.resumeToken.approximateByteSize()>0){o.resumeToken=_y(i,s.resumeToken);const c=Tu(i,s.expectedCount);c!==null&&(o.expectedCount=c)}else if(s.snapshotVersion.compareTo(N.min())>0){o.readTime=ni(i,s.snapshotVersion.toTimestamp());const c=Tu(i,s.expectedCount);c!==null&&(o.expectedCount=c)}return o}(this.serializer,e);const r=SS(this.serializer,e);r&&(t.labels=r),this.Wo(t)}iu(e){const t={};t.database=Ns(this.serializer),t.removeTarget=e,this.Wo(t)}}class gA extends ew{constructor(e,t,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,o),this.serializer=s,this.ru=!1}get ou(){return this.ru}start(){this.ru=!1,this.lastStreamToken=void 0,super.start()}Yo(){this.ru&&this.uu([])}eu(e,t){return this.connection.Ro("Write",e,t)}onMessage(e){if(R(!!e.streamToken),this.lastStreamToken=e.streamToken,this.ru){this.qo.reset();const t=kS(e.writeResults,e.commitTime),r=we(e.commitTime);return this.listener.cu(r,t)}return R(!e.writeResults||e.writeResults.length===0),this.ru=!0,this.listener.au()}hu(){const e={};e.database=Ns(this.serializer),this.Wo(e)}uu(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>Rs(this.serializer,r))};this.Wo(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pA extends class{}{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.lu=!1}fu(){if(this.lu)throw new y(g.FAILED_PRECONDITION,"The client has already been terminated.")}Io(e,t,r){return this.fu(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,s])=>this.connection.Io(e,t,r,i,s)).catch(i=>{throw i.name==="FirebaseError"?(i.code===g.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new y(g.UNKNOWN,i.toString())})}vo(e,t,r,i){return this.fu(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.vo(e,t,r,s,o,i)).catch(s=>{throw s.name==="FirebaseError"?(s.code===g.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new y(g.UNKNOWN,s.toString())})}terminate(){this.lu=!0}}class yA{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.wu=0,this._u=null,this.mu=!0}gu(){this.wu===0&&(this.yu("Unknown"),this._u=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._u=null,this.pu("Backend didn't respond within 10 seconds."),this.yu("Offline"),Promise.resolve())))}Iu(e){this.state==="Online"?this.yu("Unknown"):(this.wu++,this.wu>=1&&(this.Tu(),this.pu(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.yu("Offline")))}set(e){this.Tu(),this.wu=0,e==="Online"&&(this.mu=!1),this.yu(e)}yu(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}pu(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.mu?(me(t),this.mu=!1):w("OnlineStateTracker",t)}Tu(){this._u!==null&&(this._u.cancel(),this._u=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wA{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Eu=[],this.Au=new Map,this.vu=new Set,this.Ru=[],this.Pu=s,this.Pu.Yr(o=>{r.enqueueAndForget(async()=>{Ln(this)&&(w("RemoteStore","Restarting streams for network reachability change."),await async function(a){const c=T(a);c.vu.add(4),await Ii(c),c.bu.set("Unknown"),c.vu.delete(4),await io(c)}(this))})}),this.bu=new yA(r,i)}}async function io(n){if(Ln(n))for(const e of n.Ru)await e(!0)}async function Ii(n){for(const e of n.Ru)await e(!1)}function ec(n,e){const t=T(n);t.Au.has(e.targetId)||(t.Au.set(e.targetId,e),lh(t)?uh(t):Ei(t).Ko()&&ch(t,e))}function Ps(n,e){const t=T(n),r=Ei(t);t.Au.delete(e),r.Ko()&&tw(t,e),t.Au.size===0&&(r.Ko()?r.jo():Ln(t)&&t.bu.set("Unknown"))}function ch(n,e){if(n.Vu.qt(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(N.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}Ei(n).su(e)}function tw(n,e){n.Vu.qt(e),Ei(n).iu(e)}function uh(n){n.Vu=new yS({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),le:e=>n.Au.get(e)||null,ue:()=>n.datastore.serializer.databaseId}),Ei(n).start(),n.bu.gu()}function lh(n){return Ln(n)&&!Ei(n).Uo()&&n.Au.size>0}function Ln(n){return T(n).vu.size===0}function nw(n){n.Vu=void 0}async function vA(n){n.Au.forEach((e,t)=>{ch(n,e)})}async function bA(n,e){nw(n),lh(n)?(n.bu.Iu(e),uh(n)):n.bu.set("Unknown")}async function IA(n,e,t){if(n.bu.set("Online"),e instanceof Iy&&e.state===2&&e.cause)try{await async function(r,i){const s=i.cause;for(const o of i.targetIds)r.Au.has(o)&&(await r.remoteSyncer.rejectListen(o,s),r.Au.delete(o),r.Vu.removeTarget(o))}(n,e)}catch(r){w("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await fa(n,r)}else if(e instanceof Vo?n.Vu.Ht(e):e instanceof by?n.Vu.ne(e):n.Vu.Xt(e),!t.isEqual(N.min()))try{const r=await Hy(n.localStore);t.compareTo(r)>=0&&await function(i,s){const o=i.Vu.ce(s);return o.targetChanges.forEach((a,c)=>{if(a.resumeToken.approximateByteSize()>0){const u=i.Au.get(c);u&&i.Au.set(c,u.withResumeToken(a.resumeToken,s))}}),o.targetMismatches.forEach((a,c)=>{const u=i.Au.get(a);if(!u)return;i.Au.set(a,u.withResumeToken(ke.EMPTY_BYTE_STRING,u.snapshotVersion)),tw(i,a);const l=new Gt(u.target,a,c,u.sequenceNumber);ch(i,l)}),i.remoteSyncer.applyRemoteEvent(o)}(n,t)}catch(r){w("RemoteStore","Failed to raise snapshot:",r),await fa(n,r)}}async function fa(n,e,t){if(!On(e))throw e;n.vu.add(1),await Ii(n),n.bu.set("Offline"),t||(t=()=>Hy(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{w("RemoteStore","Retrying IndexedDB access"),await t(),n.vu.delete(1),await io(n)})}function rw(n,e){return e().catch(t=>fa(n,t,e))}async function _i(n){const e=T(n),t=kn(e);let r=e.Eu.length>0?e.Eu[e.Eu.length-1].batchId:-1;for(;_A(e);)try{const i=await aA(e.localStore,r);if(i===null){e.Eu.length===0&&t.jo();break}r=i.batchId,EA(e,i)}catch(i){await fa(e,i)}iw(e)&&sw(e)}function _A(n){return Ln(n)&&n.Eu.length<10}function EA(n,e){n.Eu.push(e);const t=kn(n);t.Ko()&&t.ou&&t.uu(e.mutations)}function iw(n){return Ln(n)&&!kn(n).Uo()&&n.Eu.length>0}function sw(n){kn(n).start()}async function TA(n){kn(n).hu()}async function kA(n){const e=kn(n);for(const t of n.Eu)e.uu(t.mutations)}async function SA(n,e,t){const r=n.Eu.shift(),i=Kl.from(r,e,t);await rw(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),await _i(n)}async function AA(n,e){e&&kn(n).ou&&await async function(t,r){if(i=r.code,yy(i)&&i!==g.ABORTED){const s=t.Eu.shift();kn(t).Qo(),await rw(t,()=>t.remoteSyncer.rejectFailedWrite(s.batchId,r)),await _i(t)}var i}(n,e),iw(n)&&sw(n)}async function Pf(n,e){const t=T(n);t.asyncQueue.verifyOperationInProgress(),w("RemoteStore","RemoteStore received new credentials");const r=Ln(t);t.vu.add(3),await Ii(t),r&&t.bu.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.vu.delete(3),await io(t)}async function Nu(n,e){const t=T(n);e?(t.vu.delete(2),await io(t)):e||(t.vu.add(2),await Ii(t),t.bu.set("Unknown"))}function Ei(n){return n.Su||(n.Su=function(e,t,r){const i=T(e);return i.fu(),new mA(t,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,r)}(n.datastore,n.asyncQueue,{uo:vA.bind(null,n),ao:bA.bind(null,n),nu:IA.bind(null,n)}),n.Ru.push(async e=>{e?(n.Su.Qo(),lh(n)?uh(n):n.bu.set("Unknown")):(await n.Su.stop(),nw(n))})),n.Su}function kn(n){return n.Du||(n.Du=function(e,t,r){const i=T(e);return i.fu(),new gA(t,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,r)}(n.datastore,n.asyncQueue,{uo:TA.bind(null,n),ao:AA.bind(null,n),au:kA.bind(null,n),cu:SA.bind(null,n)}),n.Ru.push(async e=>{e?(n.Du.Qo(),await _i(n)):(await n.Du.stop(),n.Eu.length>0&&(w("RemoteStore",`Stopping write stream with ${n.Eu.length} pending writes`),n.Eu=[]))})),n.Du}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hh{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new Ne,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}static createAndSchedule(e,t,r,i,s){const o=Date.now()+r,a=new hh(e,t,o,i,s);return a.start(r),a}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new y(g.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Ti(n,e){if(me("AsyncQueue",`${e}: ${n}`),On(n))return new y(g.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wr{constructor(e){this.comparator=e?(t,r)=>e(t,r)||_.comparator(t.key,r.key):(t,r)=>_.comparator(t.key,r.key),this.keyedMap=Yi(),this.sortedSet=new te(this.comparator)}static emptySet(e){return new Wr(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Wr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Wr;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Of{constructor(){this.Cu=new te(_.comparator)}track(e){const t=e.doc.key,r=this.Cu.get(t);r?e.type!==0&&r.type===3?this.Cu=this.Cu.insert(t,e):e.type===3&&r.type!==1?this.Cu=this.Cu.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.Cu=this.Cu.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.Cu=this.Cu.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.Cu=this.Cu.remove(t):e.type===1&&r.type===2?this.Cu=this.Cu.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.Cu=this.Cu.insert(t,{type:2,doc:e.doc}):A():this.Cu=this.Cu.insert(t,e)}xu(){const e=[];return this.Cu.inorderTraversal((t,r)=>{e.push(r)}),e}}class si{constructor(e,t,r,i,s,o,a,c,u){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=a,this.excludesMetadataChanges=c,this.hasCachedResults=u}static fromInitialDocuments(e,t,r,i,s){const o=[];return t.forEach(a=>{o.push({type:0,doc:a})}),new si(e,t,Wr.emptySet(t),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Js(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CA{constructor(){this.Nu=void 0,this.listeners=[]}}class xA{constructor(){this.queries=new Mn(e=>ny(e),Js),this.onlineState="Unknown",this.ku=new Set}}async function dh(n,e){const t=T(n),r=e.query;let i=!1,s=t.queries.get(r);if(s||(i=!0,s=new CA),i)try{s.Nu=await t.onListen(r)}catch(o){const a=Ti(o,`Initialization of query '${Eu(e.query)}' failed`);return void e.onError(a)}t.queries.set(r,s),s.listeners.push(e),e.Mu(t.onlineState),s.Nu&&e.$u(s.Nu)&&mh(t)}async function fh(n,e){const t=T(n),r=e.query;let i=!1;const s=t.queries.get(r);if(s){const o=s.listeners.indexOf(e);o>=0&&(s.listeners.splice(o,1),i=s.listeners.length===0)}if(i)return t.queries.delete(r),t.onUnlisten(r)}function DA(n,e){const t=T(n);let r=!1;for(const i of e){const s=i.query,o=t.queries.get(s);if(o){for(const a of o.listeners)a.$u(i)&&(r=!0);o.Nu=i}}r&&mh(t)}function NA(n,e,t){const r=T(n),i=r.queries.get(e);if(i)for(const s of i.listeners)s.onError(t);r.queries.delete(e)}function mh(n){n.ku.forEach(e=>{e.next()})}class gh{constructor(e,t,r){this.query=e,this.Ou=t,this.Fu=!1,this.Bu=null,this.onlineState="Unknown",this.options=r||{}}$u(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new si(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Fu?this.Lu(e)&&(this.Ou.next(e),t=!0):this.qu(e,this.onlineState)&&(this.Uu(e),t=!0),this.Bu=e,t}onError(e){this.Ou.error(e)}Mu(e){this.onlineState=e;let t=!1;return this.Bu&&!this.Fu&&this.qu(this.Bu,e)&&(this.Uu(this.Bu),t=!0),t}qu(e,t){if(!e.fromCache)return!0;const r=t!=="Offline";return(!this.options.Ku||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Lu(e){if(e.docChanges.length>0)return!0;const t=this.Bu&&this.Bu.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Uu(e){e=si.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Ou.next(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RA{constructor(e,t){this.Gu=e,this.byteLength=t}Qu(){return"metadata"in this.Gu}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf{constructor(e){this.serializer=e}rr(e){return Ot(this.serializer,e)}ur(e){return e.metadata.exists?Sy(this.serializer,e.document,!1):re.newNoDocument(this.rr(e.metadata.name),this.cr(e.metadata.readTime))}cr(e){return we(e)}}class PA{constructor(e,t,r){this.ju=e,this.localStore=t,this.serializer=r,this.queries=[],this.documents=[],this.collectionGroups=new Set,this.progress=ow(e)}zu(e){this.progress.bytesLoaded+=e.byteLength;let t=this.progress.documentsLoaded;if(e.Gu.namedQuery)this.queries.push(e.Gu.namedQuery);else if(e.Gu.documentMetadata){this.documents.push({metadata:e.Gu.documentMetadata}),e.Gu.documentMetadata.exists||++t;const r=H.fromString(e.Gu.documentMetadata.name);this.collectionGroups.add(r.get(r.length-2))}else e.Gu.document&&(this.documents[this.documents.length-1].document=e.Gu.document,++t);return t!==this.progress.documentsLoaded?(this.progress.documentsLoaded=t,Object.assign({},this.progress)):null}Wu(e){const t=new Map,r=new Mf(this.serializer);for(const i of e)if(i.metadata.queries){const s=r.rr(i.metadata.name);for(const o of i.metadata.queries){const a=(t.get(o)||U()).add(s);t.set(o,a)}}return t}async complete(){const e=await cA(this.localStore,new Mf(this.serializer),this.documents,this.ju.id),t=this.Wu(this.documents);for(const r of this.queries)await uA(this.localStore,r,t.get(r.name));return this.progress.taskState="Success",{progress:this.progress,Hu:this.collectionGroups,Ju:e}}}function ow(n){return{taskState:"Running",documentsLoaded:0,bytesLoaded:0,totalDocuments:n.totalDocuments,totalBytes:n.totalBytes}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aw{constructor(e){this.key=e}}class cw{constructor(e){this.key=e}}class uw{constructor(e,t){this.query=e,this.Yu=t,this.Xu=null,this.hasCachedResults=!1,this.current=!1,this.Zu=U(),this.mutatedKeys=U(),this.tc=iy(e),this.ec=new Wr(this.tc)}get nc(){return this.Yu}sc(e,t){const r=t?t.ic:new Of,i=t?t.ec:this.ec;let s=t?t.mutatedKeys:this.mutatedKeys,o=i,a=!1;const c=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,u=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((l,h)=>{const d=i.get(l),f=Zs(this.query,h)?h:null,p=!!d&&this.mutatedKeys.has(d.key),v=!!f&&(f.hasLocalMutations||this.mutatedKeys.has(f.key)&&f.hasCommittedMutations);let E=!1;d&&f?d.data.isEqual(f.data)?p!==v&&(r.track({type:3,doc:f}),E=!0):this.rc(d,f)||(r.track({type:2,doc:f}),E=!0,(c&&this.tc(f,c)>0||u&&this.tc(f,u)<0)&&(a=!0)):!d&&f?(r.track({type:0,doc:f}),E=!0):d&&!f&&(r.track({type:1,doc:d}),E=!0,(c||u)&&(a=!0)),E&&(f?(o=o.add(f),s=v?s.add(l):s.delete(l)):(o=o.delete(l),s=s.delete(l)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const l=this.query.limitType==="F"?o.last():o.first();o=o.delete(l.key),s=s.delete(l.key),r.track({type:1,doc:l})}return{ec:o,ic:r,zi:a,mutatedKeys:s}}rc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r){const i=this.ec;this.ec=e.ec,this.mutatedKeys=e.mutatedKeys;const s=e.ic.xu();s.sort((u,l)=>function(h,d){const f=p=>{switch(p){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return A()}};return f(h)-f(d)}(u.type,l.type)||this.tc(u.doc,l.doc)),this.oc(r);const o=t?this.uc():[],a=this.Zu.size===0&&this.current?1:0,c=a!==this.Xu;return this.Xu=a,s.length!==0||c?{snapshot:new si(this.query,e.ec,i,s,e.mutatedKeys,a===0,c,!1,!!r&&r.resumeToken.approximateByteSize()>0),cc:o}:{cc:o}}Mu(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({ec:this.ec,ic:new Of,mutatedKeys:this.mutatedKeys,zi:!1},!1)):{cc:[]}}ac(e){return!this.Yu.has(e)&&!!this.ec.has(e)&&!this.ec.get(e).hasLocalMutations}oc(e){e&&(e.addedDocuments.forEach(t=>this.Yu=this.Yu.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Yu=this.Yu.delete(t)),this.current=e.current)}uc(){if(!this.current)return[];const e=this.Zu;this.Zu=U(),this.ec.forEach(r=>{this.ac(r.key)&&(this.Zu=this.Zu.add(r.key))});const t=[];return e.forEach(r=>{this.Zu.has(r)||t.push(new cw(r))}),this.Zu.forEach(r=>{e.has(r)||t.push(new aw(r))}),t}hc(e){this.Yu=e.ir,this.Zu=U();const t=this.sc(e.documents);return this.applyChanges(t,!0)}lc(){return si.fromInitialDocuments(this.query,this.ec,this.mutatedKeys,this.Xu===0,this.hasCachedResults)}}class OA{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class MA{constructor(e){this.key=e,this.fc=!1}}class LA{constructor(e,t,r,i,s,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.dc={},this.wc=new Mn(a=>ny(a),Js),this._c=new Map,this.mc=new Set,this.gc=new te(_.comparator),this.yc=new Map,this.Ic=new nh,this.Tc={},this.Ec=new Map,this.Ac=gr.Mn(),this.onlineState="Unknown",this.vc=void 0}get isPrimaryClient(){return this.vc===!0}}async function FA(n,e){const t=bh(n);let r,i;const s=t.wc.get(e);if(s)r=s.targetId,t.sharedClientState.addLocalQueryTarget(r),i=s.view.lc();else{const o=await ri(t.localStore,st(e)),a=t.sharedClientState.addLocalQueryTarget(o.targetId);r=o.targetId,i=await ph(t,e,r,a==="current",o.resumeToken),t.isPrimaryClient&&ec(t.remoteStore,o)}return i}async function ph(n,e,t,r,i){n.Rc=(h,d,f)=>async function(p,v,E,L){let O=v.view.sc(E);O.zi&&(O=await la(p.localStore,v.query,!1).then(({documents:Y})=>v.view.sc(Y,O)));const D=L&&L.targetChanges.get(v.targetId),z=v.view.applyChanges(O,p.isPrimaryClient,D);return Ru(p,v.targetId,z.cc),z.snapshot}(n,h,d,f);const s=await la(n.localStore,e,!0),o=new uw(e,s.ir),a=o.sc(s.documents),c=no.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),u=o.applyChanges(a,n.isPrimaryClient,c);Ru(n,t,u.cc);const l=new OA(e,t,o);return n.wc.set(e,l),n._c.has(t)?n._c.get(t).push(e):n._c.set(t,[e]),u.snapshot}async function VA(n,e){const t=T(n),r=t.wc.get(e),i=t._c.get(r.targetId);if(i.length>1)return t._c.set(r.targetId,i.filter(s=>!Js(s,e))),void t.wc.delete(e);t.isPrimaryClient?(t.sharedClientState.removeLocalQueryTarget(r.targetId),t.sharedClientState.isActiveQueryTarget(r.targetId)||await ii(t.localStore,r.targetId,!1).then(()=>{t.sharedClientState.clearQueryState(r.targetId),Ps(t.remoteStore,r.targetId),oi(t,r.targetId)}).catch(Pn)):(oi(t,r.targetId),await ii(t.localStore,r.targetId,!0))}async function UA(n,e,t){const r=Ih(n);try{const i=await function(s,o){const a=T(s),c=ae.now(),u=o.reduce((d,f)=>d.add(f.key),U());let l,h;return a.persistence.runTransaction("Locally write mutations","readwrite",d=>{let f=it(),p=U();return a.Zi.getEntries(d,u).next(v=>{f=v,f.forEach((E,L)=>{L.isValidDocument()||(p=p.add(E))})}).next(()=>a.localDocuments.getOverlayedDocuments(d,f)).next(v=>{l=v;const E=[];for(const L of o){const O=mS(L,l.get(L.key).overlayedDocument);O!=null&&E.push(new tn(L.key,O,Hp(O.value.mapValue),oe.exists(!0)))}return a.mutationQueue.addMutationBatch(d,c,E,o)}).next(v=>{h=v;const E=v.applyToLocalDocumentSet(l,p);return a.documentOverlayCache.saveOverlays(d,v.batchId,E)})}).then(()=>({batchId:h.batchId,changes:oy(l)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(s,o,a){let c=s.Tc[s.currentUser.toKey()];c||(c=new te(V)),c=c.insert(o,a),s.Tc[s.currentUser.toKey()]=c}(r,i.batchId,t),await nn(r,i.changes),await _i(r.remoteStore)}catch(i){const s=Ti(i,"Failed to persist write");t.reject(s)}}async function lw(n,e){const t=T(n);try{const r=await oA(t.localStore,e);e.targetChanges.forEach((i,s)=>{const o=t.yc.get(s);o&&(R(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1),i.addedDocuments.size>0?o.fc=!0:i.modifiedDocuments.size>0?R(o.fc):i.removedDocuments.size>0&&(R(o.fc),o.fc=!1))}),await nn(t,r,e)}catch(r){await Pn(r)}}function Lf(n,e,t){const r=T(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.wc.forEach((s,o)=>{const a=o.view.Mu(e);a.snapshot&&i.push(a.snapshot)}),function(s,o){const a=T(s);a.onlineState=o;let c=!1;a.queries.forEach((u,l)=>{for(const h of l.listeners)h.Mu(o)&&(c=!0)}),c&&mh(a)}(r.eventManager,e),i.length&&r.dc.nu(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function BA(n,e,t){const r=T(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.yc.get(e),s=i&&i.key;if(s){let o=new te(_.comparator);o=o.insert(s,re.newNoDocument(s,N.min()));const a=U().add(s),c=new to(N.min(),new Map,new te(V),o,a);await lw(r,c),r.gc=r.gc.remove(s),r.yc.delete(e),vh(r)}else await ii(r.localStore,e,!1).then(()=>oi(r,e,t)).catch(Pn)}async function qA(n,e){const t=T(n),r=e.batch.batchId;try{const i=await sA(t.localStore,e);wh(t,r,null),yh(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await nn(t,i)}catch(i){await Pn(i)}}async function $A(n,e,t){const r=T(n);try{const i=await function(s,o){const a=T(s);return a.persistence.runTransaction("Reject batch","readwrite-primary",c=>{let u;return a.mutationQueue.lookupMutationBatch(c,o).next(l=>(R(l!==null),u=l.keys(),a.mutationQueue.removeMutationBatch(c,l))).next(()=>a.mutationQueue.performConsistencyCheck(c)).next(()=>a.documentOverlayCache.removeOverlaysForBatchId(c,u,o)).next(()=>a.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(c,u)).next(()=>a.localDocuments.getDocuments(c,u))})}(r.localStore,e);wh(r,e,t),yh(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await nn(r,i)}catch(i){await Pn(i)}}async function zA(n,e){const t=T(n);Ln(t.remoteStore)||w("SyncEngine","The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");try{const r=await function(s){const o=T(s);return o.persistence.runTransaction("Get highest unacknowledged batch id","readonly",a=>o.mutationQueue.getHighestUnacknowledgedBatchId(a))}(t.localStore);if(r===-1)return void e.resolve();const i=t.Ec.get(r)||[];i.push(e),t.Ec.set(r,i)}catch(r){const i=Ti(r,"Initialization of waitForPendingWrites() operation failed");e.reject(i)}}function yh(n,e){(n.Ec.get(e)||[]).forEach(t=>{t.resolve()}),n.Ec.delete(e)}function wh(n,e,t){const r=T(n);let i=r.Tc[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.Tc[r.currentUser.toKey()]=i}}function oi(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n._c.get(e))n.wc.delete(r),t&&n.dc.Pc(r,t);n._c.delete(e),n.isPrimaryClient&&n.Ic.Is(e).forEach(r=>{n.Ic.containsKey(r)||hw(n,r)})}function hw(n,e){n.mc.delete(e.path.canonicalString());const t=n.gc.get(e);t!==null&&(Ps(n.remoteStore,t),n.gc=n.gc.remove(e),n.yc.delete(t),vh(n))}function Ru(n,e,t){for(const r of t)r instanceof aw?(n.Ic.addReference(r.key,e),jA(n,r)):r instanceof cw?(w("SyncEngine","Document no longer in limbo: "+r.key),n.Ic.removeReference(r.key,e),n.Ic.containsKey(r.key)||hw(n,r.key)):A()}function jA(n,e){const t=e.key,r=t.path.canonicalString();n.gc.get(t)||n.mc.has(r)||(w("SyncEngine","New document in limbo: "+t),n.mc.add(r),vh(n))}function vh(n){for(;n.mc.size>0&&n.gc.size<n.maxConcurrentLimboResolutions;){const e=n.mc.values().next().value;n.mc.delete(e);const t=new _(H.fromString(e)),r=n.Ac.next();n.yc.set(r,new MA(t)),n.gc=n.gc.insert(t,r),ec(n.remoteStore,new Gt(st(wi(t.path)),r,"TargetPurposeLimboResolution",nt.ct))}}async function nn(n,e,t){const r=T(n),i=[],s=[],o=[];r.wc.isEmpty()||(r.wc.forEach((a,c)=>{o.push(r.Rc(c,e,t).then(u=>{if((u||t)&&r.isPrimaryClient&&r.sharedClientState.updateQueryState(c.targetId,u!=null&&u.fromCache?"not-current":"current"),u){i.push(u);const l=sh.Li(c.targetId,u);s.push(l)}}))}),await Promise.all(o),r.dc.nu(i),await async function(a,c){const u=T(a);try{await u.persistence.runTransaction("notifyLocalViewChanges","readwrite",l=>m.forEach(c,h=>m.forEach(h.Fi,d=>u.persistence.referenceDelegate.addReference(l,h.targetId,d)).next(()=>m.forEach(h.Bi,d=>u.persistence.referenceDelegate.removeReference(l,h.targetId,d)))))}catch(l){if(!On(l))throw l;w("LocalStore","Failed to update sequence numbers: "+l)}for(const l of c){const h=l.targetId;if(!l.fromCache){const d=u.Ji.get(h),f=d.snapshotVersion,p=d.withLastLimboFreeSnapshotVersion(f);u.Ji=u.Ji.insert(h,p)}}}(r.localStore,s))}async function GA(n,e){const t=T(n);if(!t.currentUser.isEqual(e)){w("SyncEngine","User change. New user:",e.toKey());const r=await Wy(t.localStore,e);t.currentUser=e,function(i,s){i.Ec.forEach(o=>{o.forEach(a=>{a.reject(new y(g.CANCELLED,s))})}),i.Ec.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await nn(t,r.er)}}function WA(n,e){const t=T(n),r=t.yc.get(e);if(r&&r.fc)return U().add(r.key);{let i=U();const s=t._c.get(e);if(!s)return i;for(const o of s){const a=t.wc.get(o);i=i.unionWith(a.view.nc)}return i}}async function HA(n,e){const t=T(n),r=await la(t.localStore,e.query,!0),i=e.view.hc(r);return t.isPrimaryClient&&Ru(t,e.targetId,i.cc),i}async function KA(n,e){const t=T(n);return Qy(t.localStore,e).then(r=>nn(t,r))}async function YA(n,e,t,r){const i=T(n),s=await function(o,a){const c=T(o),u=T(c.mutationQueue);return c.persistence.runTransaction("Lookup mutation documents","readonly",l=>u.Sn(l,a).next(h=>h?c.localDocuments.getDocuments(l,h):m.resolve(null)))}(i.localStore,e);s!==null?(t==="pending"?await _i(i.remoteStore):t==="acknowledged"||t==="rejected"?(wh(i,e,r||null),yh(i,e),function(o,a){T(T(o).mutationQueue).Cn(a)}(i.localStore,e)):A(),await nn(i,s)):w("SyncEngine","Cannot apply mutation batch with id: "+e)}async function QA(n,e){const t=T(n);if(bh(t),Ih(t),e===!0&&t.vc!==!0){const r=t.sharedClientState.getAllActiveQueryTargets(),i=await Ff(t,r.toArray());t.vc=!0,await Nu(t.remoteStore,!0);for(const s of i)ec(t.remoteStore,s)}else if(e===!1&&t.vc!==!1){const r=[];let i=Promise.resolve();t._c.forEach((s,o)=>{t.sharedClientState.isLocalQueryTarget(o)?r.push(o):i=i.then(()=>(oi(t,o),ii(t.localStore,o,!0))),Ps(t.remoteStore,o)}),await i,await Ff(t,r),function(s){const o=T(s);o.yc.forEach((a,c)=>{Ps(o.remoteStore,c)}),o.Ic.Ts(),o.yc=new Map,o.gc=new te(_.comparator)}(t),t.vc=!1,await Nu(t.remoteStore,!1)}}async function Ff(n,e,t){const r=T(n),i=[],s=[];for(const o of e){let a;const c=r._c.get(o);if(c&&c.length!==0){a=await ri(r.localStore,st(c[0]));for(const u of c){const l=r.wc.get(u),h=await HA(r,l);h.snapshot&&s.push(h.snapshot)}}else{const u=await Yy(r.localStore,o);a=await ri(r.localStore,u),await ph(r,dw(u),o,!1,a.resumeToken)}i.push(a)}return r.dc.nu(s),i}function dw(n){return ty(n.path,n.collectionGroup,n.orderBy,n.filters,n.limit,"F",n.startAt,n.endAt)}function XA(n){const e=T(n);return T(T(e.localStore).persistence).$i()}async function JA(n,e,t,r){const i=T(n);if(i.vc)return void w("SyncEngine","Ignoring unexpected query state notification.");const s=i._c.get(e);if(s&&s.length>0)switch(t){case"current":case"not-current":{const o=await Qy(i.localStore,ry(s[0])),a=to.createSynthesizedRemoteEventForCurrentChange(e,t==="current",ke.EMPTY_BYTE_STRING);await nn(i,o,a);break}case"rejected":await ii(i.localStore,e,!0),oi(i,e,r);break;default:A()}}async function ZA(n,e,t){const r=bh(n);if(r.vc){for(const i of e){if(r._c.has(i)){w("SyncEngine","Adding an already active target "+i);continue}const s=await Yy(r.localStore,i),o=await ri(r.localStore,s);await ph(r,dw(s),o.targetId,!1,o.resumeToken),ec(r.remoteStore,o)}for(const i of t)r._c.has(i)&&await ii(r.localStore,i,!1).then(()=>{Ps(r.remoteStore,i),oi(r,i)}).catch(Pn)}}function bh(n){const e=T(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=lw.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=WA.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=BA.bind(null,e),e.dc.nu=DA.bind(null,e.eventManager),e.dc.Pc=NA.bind(null,e.eventManager),e}function Ih(n){const e=T(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=qA.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=$A.bind(null,e),e}function eC(n,e,t){const r=T(n);(async function(i,s,o){try{const a=await s.getMetadata();if(await function(h,d){const f=T(h),p=we(d.createTime);return f.persistence.runTransaction("hasNewerBundle","readonly",v=>f.qs.getBundleMetadata(v,d.id)).then(v=>!!v&&v.createTime.compareTo(p)>=0)}(i.localStore,a))return await s.close(),o._completeWith(function(h){return{taskState:"Success",documentsLoaded:h.totalDocuments,bytesLoaded:h.totalBytes,totalDocuments:h.totalDocuments,totalBytes:h.totalBytes}}(a)),Promise.resolve(new Set);o._updateProgress(ow(a));const c=new PA(a,i.localStore,s.serializer);let u=await s.bc();for(;u;){const h=await c.zu(u);h&&o._updateProgress(h),u=await s.bc()}const l=await c.complete();return await nn(i,l.Ju,void 0),await function(h,d){const f=T(h);return f.persistence.runTransaction("Save bundle","readwrite",p=>f.qs.saveBundleMetadata(p,d))}(i.localStore,a),o._completeWith(l.progress),Promise.resolve(l.Hu)}catch(a){return It("SyncEngine",`Loading bundle failed with ${a}`),o._failWith(a),Promise.resolve(new Set)}})(r,e,t).then(i=>{r.sharedClientState.notifyBundleLoaded(i)})}class Pu{constructor(){this.synchronizeTabs=!1}async initialize(e){this.serializer=ro(e.databaseInfo.databaseId),this.sharedClientState=this.createSharedClientState(e),this.persistence=this.createPersistence(e),await this.persistence.start(),this.localStore=this.createLocalStore(e),this.gcScheduler=this.createGarbageCollectionScheduler(e,this.localStore),this.indexBackfillerScheduler=this.createIndexBackfillerScheduler(e,this.localStore)}createGarbageCollectionScheduler(e,t){return null}createIndexBackfillerScheduler(e,t){return null}createLocalStore(e){return Gy(this.persistence,new jy,e.initialUser,this.serializer)}createPersistence(e){return new zy(Za.zs,this.serializer)}createSharedClientState(e){return new Jy}async terminate(){this.gcScheduler&&this.gcScheduler.stop(),await this.sharedClientState.shutdown(),await this.persistence.shutdown()}}class fw extends Pu{constructor(e,t,r){super(),this.Vc=e,this.cacheSizeBytes=t,this.forceOwnership=r,this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Vc.initialize(this,e),await Ih(this.Vc.syncEngine),await _i(this.Vc.remoteStore),await this.persistence.Ii(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}createLocalStore(e){return Gy(this.persistence,new jy,e.initialUser,this.serializer)}createGarbageCollectionScheduler(e,t){const r=this.persistence.referenceDelegate.garbageCollector;return new zS(r,e.asyncQueue,t)}createIndexBackfillerScheduler(e,t){const r=new Sk(t,this.persistence);return new kk(e.asyncQueue,r)}createPersistence(e){const t=ih(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),r=this.cacheSizeBytes!==void 0?tt.withCacheSize(this.cacheSizeBytes):tt.DEFAULT;return new rh(this.synchronizeTabs,t,e.clientId,r,e.asyncQueue,Zy(),Uo(),this.serializer,this.sharedClientState,!!this.forceOwnership)}createSharedClientState(e){return new Jy}}class tC extends fw{constructor(e,t){super(e,t,!1),this.Vc=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.Vc.syncEngine;this.sharedClientState instanceof Bc&&(this.sharedClientState.syncEngine={jr:YA.bind(null,t),zr:JA.bind(null,t),Wr:ZA.bind(null,t),$i:XA.bind(null,t),Qr:KA.bind(null,t)},await this.sharedClientState.start()),await this.persistence.Ii(async r=>{await QA(this.Vc.syncEngine,r),this.gcScheduler&&(r&&!this.gcScheduler.started?this.gcScheduler.start():r||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(r&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():r||this.indexBackfillerScheduler.stop())})}createSharedClientState(e){const t=Zy();if(!Bc.D(t))throw new y(g.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const r=ih(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new Bc(t,e.asyncQueue,r,e.clientId,e.initialUser)}}class _h{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Lf(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=GA.bind(null,this.syncEngine),await Nu(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new xA}createDatastore(e){const t=ro(e.databaseInfo.databaseId),r=(i=e.databaseInfo,new fA(i));var i;return function(s,o,a,c){return new pA(s,o,a,c)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return t=this.localStore,r=this.datastore,i=e.asyncQueue,s=a=>Lf(this.syncEngine,a,0),o=Rf.D()?new Rf:new lA,new wA(t,r,i,s,o);var t,r,i,s,o}createSyncEngine(e,t){return function(r,i,s,o,a,c,u){const l=new LA(r,i,s,o,a,c);return u&&(l.vc=!0),l}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}terminate(){return async function(e){const t=T(e);w("RemoteStore","RemoteStore shutting down."),t.vu.add(5),await Ii(t),t.Pu.shutdown(),t.bu.set("Unknown")}(this.remoteStore)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vf(n,e=10240){let t=0;return{async read(){if(t<n.byteLength){const r={value:n.slice(t,t+e),done:!1};return t+=e,r}return{done:!0}},async cancel(){},releaseLock(){},closed:Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tc{constructor(e){this.observer=e,this.muted=!1}next(e){this.observer.next&&this.Sc(this.observer.next,e)}error(e){this.observer.error?this.Sc(this.observer.error,e):me("Uncaught Error in snapshot listener:",e.toString())}Dc(){this.muted=!0}Sc(e,t){this.muted||setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nC{constructor(e,t){this.Cc=e,this.serializer=t,this.metadata=new Ne,this.buffer=new Uint8Array,this.xc=new TextDecoder("utf-8"),this.Nc().then(r=>{r&&r.Qu()?this.metadata.resolve(r.Gu.metadata):this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is
             ${JSON.stringify(r==null?void 0:r.Gu)}`))},r=>this.metadata.reject(r))}close(){return this.Cc.cancel()}async getMetadata(){return this.metadata.promise}async bc(){return await this.getMetadata(),this.Nc()}async Nc(){const e=await this.kc();if(e===null)return null;const t=this.xc.decode(e),r=Number(t);isNaN(r)&&this.Mc(`length string (${t}) is not valid number`);const i=await this.$c(r);return new RA(JSON.parse(i),e.length+r)}Oc(){return this.buffer.findIndex(e=>e===123)}async kc(){for(;this.Oc()<0&&!await this.Fc(););if(this.buffer.length===0)return null;const e=this.Oc();e<0&&this.Mc("Reached the end of bundle when a length string is expected.");const t=this.buffer.slice(0,e);return this.buffer=this.buffer.slice(e),t}async $c(e){for(;this.buffer.length<e;)await this.Fc()&&this.Mc("Reached the end of bundle when more is expected.");const t=this.xc.decode(this.buffer.slice(0,e));return this.buffer=this.buffer.slice(e),t}Mc(e){throw this.Cc.cancel(),new Error(`Invalid bundle format: ${e}`)}async Fc(){const e=await this.Cc.read();if(!e.done){const t=new Uint8Array(this.buffer.length+e.value.length);t.set(this.buffer),t.set(e.value,this.buffer.length),this.buffer=t}return e.done}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rC{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastWriteError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw new y(g.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes.");const t=await async function(r,i){const s=T(r),o=Ns(s.serializer)+"/documents",a={documents:i.map(h=>Ds(s.serializer,h))},c=await s.vo("BatchGetDocuments",o,a,i.length),u=new Map;c.forEach(h=>{const d=ES(s.serializer,h);u.set(d.key.toString(),d)});const l=[];return i.forEach(h=>{const d=u.get(h.toString());R(!!d),l.push(d)}),l}(this.datastore,e);return t.forEach(r=>this.recordVersion(r)),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastWriteError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new bi(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastWriteError)throw this.lastWriteError;const e=this.readVersions;this.mutations.forEach(t=>{e.delete(t.key.toString())}),e.forEach((t,r)=>{const i=_.fromPath(r);this.mutations.push(new Wl(i,this.precondition(i)))}),await async function(t,r){const i=T(t),s=Ns(i.serializer)+"/documents",o={writes:r.map(a=>Rs(i.serializer,a))};await i.Io("Commit",s,o)}(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw A();t=N.min()}const r=this.readVersions.get(e.key.toString());if(r){if(!t.isEqual(r))throw new y(g.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(N.min())?oe.exists(!1):oe.updateTime(t):oe.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(N.min()))throw new y(g.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return oe.updateTime(t)}return oe.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iC{constructor(e,t,r,i,s){this.asyncQueue=e,this.datastore=t,this.options=r,this.updateFunction=i,this.deferred=s,this.Bc=r.maxAttempts,this.qo=new ah(this.asyncQueue,"transaction_retry")}run(){this.Bc-=1,this.Lc()}Lc(){this.qo.No(async()=>{const e=new rC(this.datastore),t=this.qc(e);t&&t.then(r=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(r)}).catch(i=>{this.Uc(i)}))}).catch(r=>{this.Uc(r)})})}qc(e){try{const t=this.updateFunction(e);return!Qs(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Uc(e){this.Bc>0&&this.Kc(e)?(this.Bc-=1,this.asyncQueue.enqueueAndForget(()=>(this.Lc(),Promise.resolve()))):this.deferred.reject(e)}Kc(e){if(e.name==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!yy(t)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sC{constructor(e,t,r,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=i,this.user=xe.UNAUTHENTICATED,this.clientId=Rp.A(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this.authCredentials.start(r,async s=>{w("FirestoreClient","Received user=",s.uid),await this.authCredentialListener(s),this.user=s}),this.appCheckCredentials.start(r,s=>(w("FirestoreClient","Received new app check token=",s),this.appCheckCredentialListener(s,this.user)))}async getConfiguration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}verifyNotTerminated(){if(this.asyncQueue.isShuttingDown)throw new y(g.FAILED_PRECONDITION,"The client has already been terminated.")}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ne;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Ti(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Bo(n,e){n.asyncQueue.verifyOperationInProgress(),w("FirestoreClient","Initializing OfflineComponentProvider");const t=await n.getConfiguration();await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async i=>{r.isEqual(i)||(await Wy(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Ou(n,e){n.asyncQueue.verifyOperationInProgress();const t=await Eh(n);w("FirestoreClient","Initializing OnlineComponentProvider");const r=await n.getConfiguration();await e.initialize(t,r),n.setCredentialChangeListener(i=>Pf(e.remoteStore,i)),n.setAppCheckTokenChangeListener((i,s)=>Pf(e.remoteStore,s)),n._onlineComponents=e}function mw(n){return n.name==="FirebaseError"?n.code===g.FAILED_PRECONDITION||n.code===g.UNIMPLEMENTED:!(typeof DOMException<"u"&&n instanceof DOMException)||n.code===22||n.code===20||n.code===11}async function Eh(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){w("FirestoreClient","Using user provided OfflineComponentProvider");try{await Bo(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!mw(t))throw t;It("Error using user provided cache. Falling back to memory cache: "+t),await Bo(n,new Pu)}}else w("FirestoreClient","Using default OfflineComponentProvider"),await Bo(n,new Pu);return n._offlineComponents}async function nc(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(w("FirestoreClient","Using user provided OnlineComponentProvider"),await Ou(n,n._uninitializedComponentsProvider._online)):(w("FirestoreClient","Using default OnlineComponentProvider"),await Ou(n,new _h))),n._onlineComponents}function gw(n){return Eh(n).then(e=>e.persistence)}function Th(n){return Eh(n).then(e=>e.localStore)}function pw(n){return nc(n).then(e=>e.remoteStore)}function kh(n){return nc(n).then(e=>e.syncEngine)}function oC(n){return nc(n).then(e=>e.datastore)}async function ai(n){const e=await nc(n),t=e.eventManager;return t.onListen=FA.bind(null,e.syncEngine),t.onUnlisten=VA.bind(null,e.syncEngine),t}function aC(n){return n.asyncQueue.enqueue(async()=>{const e=await gw(n),t=await pw(n);return e.setNetworkEnabled(!0),function(r){const i=T(r);return i.vu.delete(0),io(i)}(t)})}function cC(n){return n.asyncQueue.enqueue(async()=>{const e=await gw(n),t=await pw(n);return e.setNetworkEnabled(!1),async function(r){const i=T(r);i.vu.add(0),await Ii(i),i.bu.set("Offline")}(t)})}function uC(n,e){const t=new Ne;return n.asyncQueue.enqueueAndForget(async()=>async function(r,i,s){try{const o=await function(a,c){const u=T(a);return u.persistence.runTransaction("read document","readonly",l=>u.localDocuments.getDocument(l,c))}(r,i);o.isFoundDocument()?s.resolve(o):o.isNoDocument()?s.resolve(null):s.reject(new y(g.UNAVAILABLE,"Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"))}catch(o){const a=Ti(o,`Failed to get document '${i} from cache`);s.reject(a)}}(await Th(n),e,t)),t.promise}function yw(n,e,t={}){const r=new Ne;return n.asyncQueue.enqueueAndForget(async()=>function(i,s,o,a,c){const u=new tc({next:h=>{s.enqueueAndForget(()=>fh(i,l));const d=h.docs.has(o);!d&&h.fromCache?c.reject(new y(g.UNAVAILABLE,"Failed to get document because the client is offline.")):d&&h.fromCache&&a&&a.source==="server"?c.reject(new y(g.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):c.resolve(h)},error:h=>c.reject(h)}),l=new gh(wi(o.path),u,{includeMetadataChanges:!0,Ku:!0});return dh(i,l)}(await ai(n),n.asyncQueue,e,t,r)),r.promise}function lC(n,e){const t=new Ne;return n.asyncQueue.enqueueAndForget(async()=>async function(r,i,s){try{const o=await la(r,i,!0),a=new uw(i,o.ir),c=a.sc(o.documents),u=a.applyChanges(c,!1);s.resolve(u.snapshot)}catch(o){const a=Ti(o,`Failed to execute query '${i} against cache`);s.reject(a)}}(await Th(n),e,t)),t.promise}function ww(n,e,t={}){const r=new Ne;return n.asyncQueue.enqueueAndForget(async()=>function(i,s,o,a,c){const u=new tc({next:h=>{s.enqueueAndForget(()=>fh(i,l)),h.fromCache&&a.source==="server"?c.reject(new y(g.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(h)},error:h=>c.reject(h)}),l=new gh(o,u,{includeMetadataChanges:!0,Ku:!0});return dh(i,l)}(await ai(n),n.asyncQueue,e,t,r)),r.promise}function hC(n,e){const t=new tc(e);return n.asyncQueue.enqueueAndForget(async()=>function(r,i){T(r).ku.add(i),i.next()}(await ai(n),t)),()=>{t.Dc(),n.asyncQueue.enqueueAndForget(async()=>function(r,i){T(r).ku.delete(i)}(await ai(n),t))}}function dC(n,e,t,r){const i=function(s,o){let a;return a=typeof s=="string"?vy().encode(s):s,function(c,u){return new nC(c,u)}(function(c,u){if(c instanceof Uint8Array)return Vf(c,u);if(c instanceof ArrayBuffer)return Vf(new Uint8Array(c),u);if(c instanceof ReadableStream)return c.getReader();throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream")}(a),o)}(t,ro(e));n.asyncQueue.enqueueAndForget(async()=>{eC(await kh(n),i,r)})}function fC(n,e){return n.asyncQueue.enqueue(async()=>function(t,r){const i=T(t);return i.persistence.runTransaction("Get named query","readonly",s=>i.qs.getNamedQuery(s,r))}(await Th(n),e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vw(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uf=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sh(n,e,t){if(!t)throw new y(g.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function bw(n,e,t,r){if(e===!0&&r===!0)throw new y(g.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Bf(n){if(!_.isDocumentKey(n))throw new y(g.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function qf(n){if(_.isDocumentKey(n))throw new y(g.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function rc(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(t){return t.constructor?t.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":A()}function K(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new y(g.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=rc(n);throw new y(g.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function Iw(n,e){if(e<=0)throw new y(g.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $f{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new y(g.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.cache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new y(g.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}bw("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=vw((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new y(g.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new y(g.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new y(g.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(t=this.experimentalLongPollingOptions,r=e.experimentalLongPollingOptions,t.timeoutSeconds===r.timeoutSeconds)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams;var t,r}}class so{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new $f({}),this._settingsFrozen=!1}get app(){if(!this._app)throw new y(g.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!==void 0}_setSettings(e){if(this._settingsFrozen)throw new y(g.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new $f(e),e.credentials!==void 0&&(this._authCredentials=function(t){if(!t)return new fk;switch(t.type){case"firstParty":return new yk(t.sessionIndex||"0",t.iamToken||null,t.authTokenFactory||null);case"provider":return t.client;default:throw new y(g.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask||(this._terminateTask=this._terminate()),this._terminateTask}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const t=Uf.get(e);t&&(w("ComponentProvider","Removing Datastore"),Uf.delete(e),t.terminate())}(this),Promise.resolve()}}function mC(n,e,t,r={}){var i;const s=(n=K(n,so))._getSettings(),o=`${e}:${t}`;if(s.host!=="firestore.googleapis.com"&&s.host!==o&&It("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},s),{host:o,ssl:!1})),r.mockUserToken){let a,c;if(typeof r.mockUserToken=="string")a=r.mockUserToken,c=xe.MOCK_USER;else{a=Mv(r.mockUserToken,(i=n._app)===null||i===void 0?void 0:i.options.projectId);const u=r.mockUserToken.sub||r.mockUserToken.user_id;if(!u)throw new y(g.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new xe(u)}n._authCredentials=new mk(new Np(a,c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class se{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Mt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new se(this.firestore,e,this._key)}}class ze{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new ze(this.firestore,e,this._query)}}class Mt extends ze{constructor(e,t,r){super(e,t,wi(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new se(this.firestore,null,new _(e))}withConverter(e){return new Mt(this.firestore,e,this._path)}}function _w(n,e,...t){if(n=P(n),Sh("collection","path",e),n instanceof so){const r=H.fromString(e,...t);return qf(r),new Mt(n,null,r)}{if(!(n instanceof se||n instanceof Mt))throw new y(g.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(H.fromString(e,...t));return qf(r),new Mt(n.firestore,null,r)}}function gC(n,e){if(n=K(n,so),Sh("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new y(g.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new ze(n,null,function(t){return new en(H.emptyPath(),t)}(e))}function ma(n,e,...t){if(n=P(n),arguments.length===1&&(e=Rp.A()),Sh("doc","path",e),n instanceof so){const r=H.fromString(e,...t);return Bf(r),new se(n,null,new _(r))}{if(!(n instanceof se||n instanceof Mt))throw new y(g.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(H.fromString(e,...t));return Bf(r),new se(n.firestore,n instanceof Mt?n.converter:null,new _(r))}}function Ew(n,e){return n=P(n),e=P(e),(n instanceof se||n instanceof Mt)&&(e instanceof se||e instanceof Mt)&&n.firestore===e.firestore&&n.path===e.path&&n.converter===e.converter}function Tw(n,e){return n=P(n),e=P(e),n instanceof ze&&e instanceof ze&&n.firestore===e.firestore&&Js(n._query,e._query)&&n.converter===e.converter}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pC{constructor(){this.Gc=Promise.resolve(),this.Qc=[],this.jc=!1,this.zc=[],this.Wc=null,this.Hc=!1,this.Jc=!1,this.Yc=[],this.qo=new ah(this,"async_queue_retry"),this.Xc=()=>{const t=Uo();t&&w("AsyncQueue","Visibility state changed to "+t.visibilityState),this.qo.Mo()};const e=Uo();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this.Xc)}get isShuttingDown(){return this.jc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Zc(),this.ta(e)}enterRestrictedMode(e){if(!this.jc){this.jc=!0,this.Jc=e||!1;const t=Uo();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Xc)}}enqueue(e){if(this.Zc(),this.jc)return new Promise(()=>{});const t=new Ne;return this.ta(()=>this.jc&&this.Jc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Qc.push(e),this.ea()))}async ea(){if(this.Qc.length!==0){try{await this.Qc[0](),this.Qc.shift(),this.qo.reset()}catch(e){if(!On(e))throw e;w("AsyncQueue","Operation failed with retryable error: "+e)}this.Qc.length>0&&this.qo.No(()=>this.ea())}}ta(e){const t=this.Gc.then(()=>(this.Hc=!0,e().catch(r=>{this.Wc=r,this.Hc=!1;const i=function(s){let o=s.message||"";return s.stack&&(o=s.stack.includes(s.message)?s.stack:s.message+`
`+s.stack),o}(r);throw me("INTERNAL UNHANDLED ERROR: ",i),r}).then(r=>(this.Hc=!1,r))));return this.Gc=t,t}enqueueAfterDelay(e,t,r){this.Zc(),this.Yc.indexOf(e)>-1&&(t=0);const i=hh.createAndSchedule(this,e,t,r,s=>this.na(s));return this.zc.push(i),i}Zc(){this.Wc&&A()}verifyOperationInProgress(){}async sa(){let e;do e=this.Gc,await e;while(e!==this.Gc)}ia(e){for(const t of this.zc)if(t.timerId===e)return!0;return!1}ra(e){return this.sa().then(()=>{this.zc.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.zc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.sa()})}oa(e){this.Yc.push(e)}na(e){const t=this.zc.indexOf(e);this.zc.splice(t,1)}}function Mu(n){return function(e,t){if(typeof e!="object"||e===null)return!1;const r=e;for(const i of t)if(i in r&&typeof r[i]=="function")return!0;return!1}(n,["next","error","complete"])}class yC{constructor(){this._progressObserver={},this._taskCompletionResolver=new Ne,this._lastProgress={taskState:"Running",totalBytes:0,totalDocuments:0,bytesLoaded:0,documentsLoaded:0}}onProgress(e,t,r){this._progressObserver={next:e,error:t,complete:r}}catch(e){return this._taskCompletionResolver.promise.catch(e)}then(e,t){return this._taskCompletionResolver.promise.then(e,t)}_completeWith(e){this._updateProgress(e),this._progressObserver.complete&&this._progressObserver.complete(),this._taskCompletionResolver.resolve(e)}_failWith(e){this._lastProgress.taskState="Error",this._progressObserver.next&&this._progressObserver.next(this._lastProgress),this._progressObserver.error&&this._progressObserver.error(e),this._taskCompletionResolver.reject(e)}_updateProgress(e){this._lastProgress=e,this._progressObserver.next&&this._progressObserver.next(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wC=-1;class de extends so{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new pC,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}_terminate(){return this._firestoreClient||kw(this),this._firestoreClient.terminate()}}function Le(n){return n._firestoreClient||kw(n),n._firestoreClient.verifyNotTerminated(),n._firestoreClient}function kw(n){var e,t,r;const i=n._freezeSettings(),s=function(o,a,c,u){return new Hk(o,a,c,u.host,u.ssl,u.experimentalForceLongPolling,u.experimentalAutoDetectLongPolling,vw(u.experimentalLongPollingOptions),u.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,i);n._firestoreClient=new sC(n._authCredentials,n._appCheckCredentials,n._queue,s),!((t=i.cache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=i.cache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._firestoreClient._uninitializedComponentsProvider={_offlineKind:i.cache.kind,_offline:i.cache._offlineComponentProvider,_online:i.cache._onlineComponentProvider})}function vC(n,e){Aw(n=K(n,de));const t=Le(n);if(t._uninitializedComponentsProvider)throw new y(g.FAILED_PRECONDITION,"SDK cache is already specified.");It("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const r=n._freezeSettings(),i=new _h;return Sw(t,i,new fw(i,r.cacheSizeBytes,e==null?void 0:e.forceOwnership))}function bC(n){Aw(n=K(n,de));const e=Le(n);if(e._uninitializedComponentsProvider)throw new y(g.FAILED_PRECONDITION,"SDK cache is already specified.");It("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=n._freezeSettings(),r=new _h;return Sw(e,r,new tC(r,t.cacheSizeBytes))}function Sw(n,e,t){const r=new Ne;return n.asyncQueue.enqueue(async()=>{try{await Bo(n,t),await Ou(n,e),r.resolve()}catch(i){const s=i;if(!mw(s))throw s;It("Error enabling indexeddb cache. Falling back to memory cache: "+s),r.reject(s)}}).then(()=>r.promise)}function IC(n){if(n._initialized&&!n._terminated)throw new y(g.FAILED_PRECONDITION,"Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");const e=new Ne;return n._queue.enqueueAndForgetEvenWhileRestricted(async()=>{try{await async function(t){if(!yt.D())return Promise.resolve();const r=t+"main";await yt.delete(r)}(ih(n._databaseId,n._persistenceKey)),e.resolve()}catch(t){e.reject(t)}}),e.promise}function _C(n){return function(e){const t=new Ne;return e.asyncQueue.enqueueAndForget(async()=>zA(await kh(e),t)),t.promise}(Le(n=K(n,de)))}function EC(n){return aC(Le(n=K(n,de)))}function TC(n){return cC(Le(n=K(n,de)))}function kC(n,e){const t=Le(n=K(n,de)),r=new yC;return dC(t,n._databaseId,e,r),r}function SC(n,e){return fC(Le(n=K(n,de)),e).then(t=>t?new ze(n,null,t.query):null)}function Aw(n){if(n._initialized||n._terminated)throw new y(g.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Vt(ke.fromBase64String(e))}catch(t){throw new y(g.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Vt(ke.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sn{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new y(g.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ge(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ir{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ic{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new y(g.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new y(g.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return V(this._lat,e._lat)||V(this._long,e._long)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const AC=/^__.*__$/;class CC{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new tn(e,this.data,this.fieldMask,t,this.fieldTransforms):new vi(e,this.data,t,this.fieldTransforms)}}class Cw{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new tn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function xw(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw A()}}class sc{constructor(e,t,r,i,s,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.ua(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get ca(){return this.settings.ca}aa(e){return new sc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}ha(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.aa({path:r,la:!1});return i.fa(e),i}da(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.aa({path:r,la:!1});return i.ua(),i}wa(e){return this.aa({path:void 0,la:!0})}_a(e){return ga(e,this.settings.methodName,this.settings.ma||!1,this.path,this.settings.ga)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}ua(){if(this.path)for(let e=0;e<this.path.length;e++)this.fa(this.path.get(e))}fa(e){if(e.length===0)throw this._a("Document fields must not be empty");if(xw(this.ca)&&AC.test(e))throw this._a('Document fields cannot begin and end with "__"')}}class xC{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||ro(e)}ya(e,t,r,i=!1){return new sc({ca:e,methodName:t,ga:r,path:ge.emptyPath(),la:!1,ma:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function _r(n){const e=n._freezeSettings(),t=ro(n._databaseId);return new xC(n._databaseId,!!e.ignoreUndefinedProperties,t)}function oc(n,e,t,r,i,s={}){const o=n.ya(s.merge||s.mergeFields?2:0,e,t,i);Dh("Data must be an object, but it was:",o,r);const a=Rw(r,o);let c,u;if(s.merge)c=new rt(o.fieldMask),u=o.fieldTransforms;else if(s.mergeFields){const l=[];for(const h of s.mergeFields){const d=Lu(e,h,t);if(!o.contains(d))throw new y(g.INVALID_ARGUMENT,`Field '${d}' is specified in your field mask but missing from your input data.`);Ow(l,d)||l.push(d)}c=new rt(l),u=o.fieldTransforms.filter(h=>c.covers(h.field))}else c=null,u=o.fieldTransforms;return new CC(new Ue(a),c,u)}class oo extends Ir{_toFieldTransform(e){if(e.ca!==2)throw e.ca===1?e._a(`${this._methodName}() can only appear at the top level of your update data`):e._a(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof oo}}function Dw(n,e,t){return new sc({ca:3,ga:e.settings.ga,methodName:n._methodName,la:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class Ah extends Ir{_toFieldTransform(e){return new eo(e.path,new ei)}isEqual(e){return e instanceof Ah}}class DC extends Ir{constructor(e,t){super(e),this.pa=t}_toFieldTransform(e){const t=Dw(this,e,!0),r=this.pa.map(s=>Er(s,t)),i=new hr(r);return new eo(e.path,i)}isEqual(e){return this===e}}class NC extends Ir{constructor(e,t){super(e),this.pa=t}_toFieldTransform(e){const t=Dw(this,e,!0),r=this.pa.map(s=>Er(s,t)),i=new dr(r);return new eo(e.path,i)}isEqual(e){return this===e}}class RC extends Ir{constructor(e,t){super(e),this.Ia=t}_toFieldTransform(e){const t=new ti(e.serializer,ly(e.serializer,this.Ia));return new eo(e.path,t)}isEqual(e){return this===e}}function Ch(n,e,t,r){const i=n.ya(1,e,t);Dh("Data must be an object, but it was:",i,r);const s=[],o=Ue.empty();br(r,(c,u)=>{const l=Nh(e,c,t);u=P(u);const h=i.da(l);if(u instanceof oo)s.push(l);else{const d=Er(u,h);d!=null&&(s.push(l),o.set(l,d))}});const a=new rt(s);return new Cw(o,a,i.fieldTransforms)}function xh(n,e,t,r,i,s){const o=n.ya(1,e,t),a=[Lu(e,r,t)],c=[i];if(s.length%2!=0)throw new y(g.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let d=0;d<s.length;d+=2)a.push(Lu(e,s[d])),c.push(s[d+1]);const u=[],l=Ue.empty();for(let d=a.length-1;d>=0;--d)if(!Ow(u,a[d])){const f=a[d];let p=c[d];p=P(p);const v=o.da(f);if(p instanceof oo)u.push(f);else{const E=Er(p,v);E!=null&&(u.push(f),l.set(f,E))}}const h=new rt(u);return new Cw(l,h,o.fieldTransforms)}function Nw(n,e,t,r=!1){return Er(t,n.ya(r?4:3,e))}function Er(n,e){if(Pw(n=P(n)))return Dh("Unsupported field value:",e,n),Rw(n,e);if(n instanceof Ir)return function(t,r){if(!xw(r.ca))throw r._a(`${t._methodName}() can only be used with update() and set()`);if(!r.path)throw r._a(`${t._methodName}() is not currently supported inside arrays`);const i=t._toFieldTransform(r);i&&r.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.la&&e.ca!==4)throw e._a("Nested arrays are not supported");return function(t,r){const i=[];let s=0;for(const o of t){let a=Er(o,r.wa(s));a==null&&(a={nullValue:"NULL_VALUE"}),i.push(a),s++}return{arrayValue:{values:i}}}(n,e)}return function(t,r){if((t=P(t))===null)return{nullValue:"NULL_VALUE"};if(typeof t=="number")return ly(r.serializer,t);if(typeof t=="boolean")return{booleanValue:t};if(typeof t=="string")return{stringValue:t};if(t instanceof Date){const i=ae.fromDate(t);return{timestampValue:ni(r.serializer,i)}}if(t instanceof ae){const i=new ae(t.seconds,1e3*Math.floor(t.nanoseconds/1e3));return{timestampValue:ni(r.serializer,i)}}if(t instanceof ic)return{geoPointValue:{latitude:t.latitude,longitude:t.longitude}};if(t instanceof Vt)return{bytesValue:_y(r.serializer,t._byteString)};if(t instanceof se){const i=r.databaseId,s=t.firestore._databaseId;if(!s.isEqual(i))throw r._a(`Document reference is for database ${s.projectId}/${s.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Jl(t.firestore._databaseId||r.databaseId,t._key.path)}}throw r._a(`Unsupported field value: ${rc(t)}`)}(n,e)}function Rw(n,e){const t={};return jp(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):br(n,(r,i)=>{const s=Er(i,e.ha(r));s!=null&&(t[r]=s)}),{mapValue:{fields:t}}}function Pw(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof ae||n instanceof ic||n instanceof Vt||n instanceof se||n instanceof Ir)}function Dh(n,e,t){if(!Pw(t)||!function(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}(t)){const r=rc(t);throw r==="an object"?e._a(n+" a custom object"):e._a(n+" "+r)}}function Lu(n,e,t){if((e=P(e))instanceof Sn)return e._internalPath;if(typeof e=="string")return Nh(n,e);throw ga("Field path arguments must be of type string or ",n,!1,void 0,t)}const PC=new RegExp("[~\\*/\\[\\]]");function Nh(n,e,t){if(e.search(PC)>=0)throw ga(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Sn(...e.split("."))._internalPath}catch{throw ga(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function ga(n,e,t,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let a=`Function ${e}() called with invalid data`;t&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(s||o)&&(c+=" (found",s&&(c+=` in field ${r}`),o&&(c+=` in document ${i}`),c+=")"),new y(g.INVALID_ARGUMENT,a+n+c)}function Ow(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Os{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new se(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new OC(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(ac("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class OC extends Os{data(){return super.data()}}function ac(n,e){return typeof e=="string"?Nh(n,e):e instanceof Sn?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mw(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new y(g.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Rh{}class ao extends Rh{}function cn(n,e,...t){let r=[];e instanceof Rh&&r.push(e),r=r.concat(t),function(i){const s=i.filter(a=>a instanceof Ph).length,o=i.filter(a=>a instanceof cc).length;if(s>1||s>0&&o>0)throw new y(g.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)n=i._apply(n);return n}class cc extends ao{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new cc(e,t,r)}_apply(e){const t=this._parse(e);return Fw(e._query,t),new ze(e.firestore,e.converter,_u(e._query,t))}_parse(e){const t=_r(e.firestore);return function(i,s,o,a,c,u,l){let h;if(c.isKeyField()){if(u==="array-contains"||u==="array-contains-any")throw new y(g.INVALID_ARGUMENT,`Invalid Query. You can't perform '${u}' queries on documentId().`);if(u==="in"||u==="not-in"){jf(l,u);const d=[];for(const f of l)d.push(zf(a,i,f));h={arrayValue:{values:d}}}else h=zf(a,i,l)}else u!=="in"&&u!=="not-in"&&u!=="array-contains-any"||jf(l,u),h=Nw(o,s,l,u==="in"||u==="not-in");return j.create(c,u,h)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function MC(n,e,t){const r=e,i=ac("where",n);return cc._create(i,r,t)}class Ph extends Rh{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Ph(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:J.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(r,i){let s=r;const o=i.getFlattenedFilters();for(const a of o)Fw(s,a),s=_u(s,a)}(e._query,t),new ze(e.firestore,e.converter,_u(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Oh extends ao{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Oh(e,t)}_apply(e){const t=function(r,i,s){if(r.startAt!==null)throw new y(g.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new y(g.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");const o=new Gr(i,s);return function(a,c){if(zl(a)===null){const u=Ka(a);u!==null&&Vw(a,u,c.field)}}(r,o),o}(e._query,this._field,this._direction);return new ze(e.firestore,e.converter,function(r,i){const s=r.explicitOrderBy.concat([i]);return new en(r.path,r.collectionGroup,s,r.filters.slice(),r.limit,r.limitType,r.startAt,r.endAt)}(e._query,t))}}function LC(n,e="asc"){const t=e,r=ac("orderBy",n);return Oh._create(r,t)}class uc extends ao{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new uc(e,t,r)}_apply(e){return new ze(e.firestore,e.converter,oa(e._query,this._limit,this._limitType))}}function FC(n){return Iw("limit",n),uc._create("limit",n,"F")}function VC(n){return Iw("limitToLast",n),uc._create("limitToLast",n,"L")}class lc extends ao{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new lc(e,t,r)}_apply(e){const t=Lw(e,this.type,this._docOrFields,this._inclusive);return new ze(e.firestore,e.converter,function(r,i){return new en(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),r.limit,r.limitType,i,r.endAt)}(e._query,t))}}function UC(...n){return lc._create("startAt",n,!0)}function BC(...n){return lc._create("startAfter",n,!1)}class hc extends ao{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new hc(e,t,r)}_apply(e){const t=Lw(e,this.type,this._docOrFields,this._inclusive);return new ze(e.firestore,e.converter,function(r,i){return new en(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),r.limit,r.limitType,r.startAt,i)}(e._query,t))}}function qC(...n){return hc._create("endBefore",n,!1)}function $C(...n){return hc._create("endAt",n,!0)}function Lw(n,e,t,r){if(t[0]=P(t[0]),t[0]instanceof Os)return function(i,s,o,a,c){if(!a)throw new y(g.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${o}().`);const u=[];for(const l of rr(i))if(l.field.isKeyField())u.push(ur(s,a.key));else{const h=a.data.field(l.field);if(Ha(h))throw new y(g.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+l.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(h===null){const d=l.field.canonicalString();throw new y(g.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${d}' (used as the orderBy) does not exist.`)}u.push(h)}return new Tn(u,c)}(n._query,n.firestore._databaseId,e,t[0]._document,r);{const i=_r(n.firestore);return function(s,o,a,c,u,l){const h=s.explicitOrderBy;if(u.length>h.length)throw new y(g.INVALID_ARGUMENT,`Too many arguments provided to ${c}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const d=[];for(let f=0;f<u.length;f++){const p=u[f];if(h[f].field.isKeyField()){if(typeof p!="string")throw new y(g.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${c}(), but got a ${typeof p}`);if(!jl(s)&&p.indexOf("/")!==-1)throw new y(g.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${c}() must be a plain document ID, but '${p}' contains a slash.`);const v=s.path.child(H.fromString(p));if(!_.isDocumentKey(v))throw new y(g.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${c}() must result in a valid document path, but '${v}' is not because it contains an odd number of segments.`);const E=new _(v);d.push(ur(o,E))}else{const v=Nw(a,c,p);d.push(v)}}return new Tn(d,l)}(n._query,n.firestore._databaseId,i,e,t,r)}}function zf(n,e,t){if(typeof(t=P(t))=="string"){if(t==="")throw new y(g.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!jl(e)&&t.indexOf("/")!==-1)throw new y(g.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(H.fromString(t));if(!_.isDocumentKey(r))throw new y(g.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return ur(n,new _(r))}if(t instanceof se)return ur(n,t._key);throw new y(g.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${rc(t)}.`)}function jf(n,e){if(!Array.isArray(n)||n.length===0)throw new y(g.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Fw(n,e){if(e.isInequality()){const r=Ka(n),i=e.field;if(r!==null&&!r.isEqual(i))throw new y(g.INVALID_ARGUMENT,`Invalid query. All where filters with an inequality (<, <=, !=, not-in, >, or >=) must be on the same field. But you have inequality filters on '${r.toString()}' and '${i.toString()}'`);const s=zl(n);s!==null&&Vw(n,i,s)}const t=function(r,i){for(const s of r)for(const o of s.getFlattenedFilters())if(i.indexOf(o.op)>=0)return o.op;return null}(n.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new y(g.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new y(g.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function Vw(n,e,t){if(!t.isEqual(e))throw new y(g.INVALID_ARGUMENT,`Invalid query. You have a where filter with an inequality (<, <=, !=, not-in, >, or >=) on field '${e.toString()}' and so you must also use '${e.toString()}' as your first argument to orderBy(), but your first orderBy() is on field '${t.toString()}' instead.`)}class Mh{convertValue(e,t="none"){switch(cr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return le(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(In(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 10:return this.convertObject(e.mapValue,t);default:throw A()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return br(e,(i,s)=>{r[i]=this.convertValue(s,t)}),r}convertGeoPoint(e){return new ic(le(e.latitude),le(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=ql(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(As(e));default:return null}}convertTimestamp(e){const t=bn(e);return new ae(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=H.fromString(e);R(Ry(r));const i=new _n(r.get(1),r.get(3)),s=new _(r.popFirst(5));return i.isEqual(t)||me(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dc(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class zC extends Mh{constructor(e){super(),this.firestore=e}convertBytes(e){return new Vt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new se(this.firestore,null,t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Xt extends Os{constructor(e,t,r,i,s,o){super(e,t,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new as(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(ac("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class as extends Xt{data(e={}){return super.data(e)}}class An{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new Xn(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new as(this._firestore,this._userDataWriter,r.key,r,new Xn(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new y(g.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(r,i){if(r._snapshot.oldDocs.isEmpty()){let s=0;return r._snapshot.docChanges.map(o=>{const a=new as(r._firestore,r._userDataWriter,o.doc.key,o.doc,new Xn(r._snapshot.mutatedKeys.has(o.doc.key),r._snapshot.fromCache),r.query.converter);return o.doc,{type:"added",doc:a,oldIndex:-1,newIndex:s++}})}{let s=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(o=>i||o.type!==3).map(o=>{const a=new as(r._firestore,r._userDataWriter,o.doc.key,o.doc,new Xn(r._snapshot.mutatedKeys.has(o.doc.key),r._snapshot.fromCache),r.query.converter);let c=-1,u=-1;return o.type!==0&&(c=s.indexOf(o.doc.key),s=s.delete(o.doc.key)),o.type!==1&&(s=s.add(o.doc),u=s.indexOf(o.doc.key)),{type:jC(o.type),doc:a,oldIndex:c,newIndex:u}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function jC(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return A()}}function Uw(n,e){return n instanceof Xt&&e instanceof Xt?n._firestore===e._firestore&&n._key.isEqual(e._key)&&(n._document===null?e._document===null:n._document.isEqual(e._document))&&n._converter===e._converter:n instanceof An&&e instanceof An&&n._firestore===e._firestore&&Tw(n.query,e.query)&&n.metadata.isEqual(e.metadata)&&n._snapshot.isEqual(e._snapshot)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GC(n){n=K(n,se);const e=K(n.firestore,de);return yw(Le(e),n._key).then(t=>Lh(e,n,t))}class Tr extends Mh{constructor(e){super(),this.firestore=e}convertBytes(e){return new Vt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new se(this.firestore,null,t)}}function WC(n){n=K(n,se);const e=K(n.firestore,de),t=Le(e),r=new Tr(e);return uC(t,n._key).then(i=>new Xt(e,r,n._key,i,new Xn(i!==null&&i.hasLocalMutations,!0),n.converter))}function HC(n){n=K(n,se);const e=K(n.firestore,de);return yw(Le(e),n._key,{source:"server"}).then(t=>Lh(e,n,t))}function KC(n){n=K(n,ze);const e=K(n.firestore,de),t=Le(e),r=new Tr(e);return Mw(n._query),ww(t,n._query).then(i=>new An(e,r,n,i))}function YC(n){n=K(n,ze);const e=K(n.firestore,de),t=Le(e),r=new Tr(e);return lC(t,n._query).then(i=>new An(e,r,n,i))}function QC(n){n=K(n,ze);const e=K(n.firestore,de),t=Le(e),r=new Tr(e);return ww(t,n._query,{source:"server"}).then(i=>new An(e,r,n,i))}function Gf(n,e,t){n=K(n,se);const r=K(n.firestore,de),i=dc(n.converter,e,t);return co(r,[oc(_r(r),"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,oe.none())])}function Wf(n,e,t,...r){n=K(n,se);const i=K(n.firestore,de),s=_r(i);let o;return o=typeof(e=P(e))=="string"||e instanceof Sn?xh(s,"updateDoc",n._key,e,t,r):Ch(s,"updateDoc",n._key,e),co(i,[o.toMutation(n._key,oe.exists(!0))])}function XC(n){return co(K(n.firestore,de),[new bi(n._key,oe.none())])}function JC(n,e){const t=K(n.firestore,de),r=ma(n),i=dc(n.converter,e);return co(t,[oc(_r(n.firestore),"addDoc",r._key,i,n.converter!==null,{}).toMutation(r._key,oe.exists(!1))]).then(()=>r)}function Bw(n,...e){var t,r,i;n=P(n);let s={includeMetadataChanges:!1},o=0;typeof e[o]!="object"||Mu(e[o])||(s=e[o],o++);const a={includeMetadataChanges:s.includeMetadataChanges};if(Mu(e[o])){const h=e[o];e[o]=(t=h.next)===null||t===void 0?void 0:t.bind(h),e[o+1]=(r=h.error)===null||r===void 0?void 0:r.bind(h),e[o+2]=(i=h.complete)===null||i===void 0?void 0:i.bind(h)}let c,u,l;if(n instanceof se)u=K(n.firestore,de),l=wi(n._key.path),c={next:h=>{e[o]&&e[o](Lh(u,n,h))},error:e[o+1],complete:e[o+2]};else{const h=K(n,ze);u=K(h.firestore,de),l=h._query;const d=new Tr(u);c={next:f=>{e[o]&&e[o](new An(u,d,h,f))},error:e[o+1],complete:e[o+2]},Mw(n._query)}return function(h,d,f,p){const v=new tc(p),E=new gh(d,v,f);return h.asyncQueue.enqueueAndForget(async()=>dh(await ai(h),E)),()=>{v.Dc(),h.asyncQueue.enqueueAndForget(async()=>fh(await ai(h),E))}}(Le(u),l,a,c)}function ZC(n,e){return hC(Le(n=K(n,de)),Mu(e)?e:{next:e})}function co(n,e){return function(t,r){const i=new Ne;return t.asyncQueue.enqueueAndForget(async()=>UA(await kh(t),r,i)),i.promise}(Le(n),e)}function Lh(n,e,t){const r=t.docs.get(e._key),i=new Tr(n);return new Xt(n,i,e._key,r,new Xn(t.hasPendingWrites,t.fromCache),e.converter)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ex={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tx{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=_r(e)}set(e,t,r){this._verifyNotCommitted();const i=dn(e,this._firestore),s=dc(i.converter,t,r),o=oc(this._dataReader,"WriteBatch.set",i._key,s,i.converter!==null,r);return this._mutations.push(o.toMutation(i._key,oe.none())),this}update(e,t,r,...i){this._verifyNotCommitted();const s=dn(e,this._firestore);let o;return o=typeof(t=P(t))=="string"||t instanceof Sn?xh(this._dataReader,"WriteBatch.update",s._key,t,r,i):Ch(this._dataReader,"WriteBatch.update",s._key,t),this._mutations.push(o.toMutation(s._key,oe.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=dn(e,this._firestore);return this._mutations=this._mutations.concat(new bi(t._key,oe.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new y(g.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function dn(n,e){if((n=P(n)).firestore!==e)throw new y(g.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nx extends class{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=_r(e)}get(e){const t=dn(e,this._firestore),r=new zC(this._firestore);return this._transaction.lookup([t._key]).then(i=>{if(!i||i.length!==1)return A();const s=i[0];if(s.isFoundDocument())return new Os(this._firestore,r,s.key,s,t.converter);if(s.isNoDocument())return new Os(this._firestore,r,t._key,null,t.converter);throw A()})}set(e,t,r){const i=dn(e,this._firestore),s=dc(i.converter,t,r),o=oc(this._dataReader,"Transaction.set",i._key,s,i.converter!==null,r);return this._transaction.set(i._key,o),this}update(e,t,r,...i){const s=dn(e,this._firestore);let o;return o=typeof(t=P(t))=="string"||t instanceof Sn?xh(this._dataReader,"Transaction.update",s._key,t,r,i):Ch(this._dataReader,"Transaction.update",s._key,t),this._transaction.update(s._key,o),this}delete(e){const t=dn(e,this._firestore);return this._transaction.delete(t._key),this}}{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=dn(e,this._firestore),r=new Tr(this._firestore);return super.get(e).then(i=>new Xt(this._firestore,r,t._key,i._document,new Xn(!1,!1),t.converter))}}function rx(n,e,t){n=K(n,de);const r=Object.assign(Object.assign({},ex),t);return function(i){if(i.maxAttempts<1)throw new y(g.INVALID_ARGUMENT,"Max attempts must be at least 1")}(r),function(i,s,o){const a=new Ne;return i.asyncQueue.enqueueAndForget(async()=>{const c=await oC(i);new iC(i.asyncQueue,c,o,s,a).run()}),a.promise}(Le(n),i=>e(new nx(n,i)),r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ix(){return new oo("deleteField")}function sx(){return new Ah("serverTimestamp")}function ox(...n){return new DC("arrayUnion",n)}function ax(...n){return new NC("arrayRemove",n)}function cx(n){return new RC("increment",n)}(function(n,e=!0){(function(t){yi=t})(xn),Kt(new mt("firestore",(t,{instanceIdentifier:r,options:i})=>{const s=t.getProvider("app").getImmediate(),o=new de(new gk(t.getProvider("auth-internal")),new vk(t.getProvider("app-check-internal")),function(a,c){if(!Object.prototype.hasOwnProperty.apply(a.options,["projectId"]))throw new y(g.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new _n(a.options.projectId,c)}(s,r),s);return i=Object.assign({useFetchStreams:e},i),o._setSettings(i),o},"PUBLIC").setMultipleInstances(!0)),ft(Bd,"3.13.0",n),ft(Bd,"3.13.0","esm2017")})();const ux="@firebase/firestore-compat",lx="0.3.12";/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fh(n,e){if(e===void 0)return{merge:!1};if(e.mergeFields!==void 0&&e.merge!==void 0)throw new y("invalid-argument",`Invalid options passed to function ${n}(): You cannot specify both "merge" and "mergeFields".`);return e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hf(){if(typeof Uint8Array>"u")throw new y("unimplemented","Uint8Arrays are not available in this environment.")}function Kf(){if(!Gk())throw new y("unimplemented","Blobs are unavailable in Firestore in this environment.")}class Ms{constructor(e){this._delegate=e}static fromBase64String(e){return Kf(),new Ms(Vt.fromBase64String(e))}static fromUint8Array(e){return Hf(),new Ms(Vt.fromUint8Array(e))}toBase64(){return Kf(),this._delegate.toBase64()}toUint8Array(){return Hf(),this._delegate.toUint8Array()}isEqual(e){return this._delegate.isEqual(e._delegate)}toString(){return"Blob(base64: "+this.toBase64()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fu(n){return hx(n,["next","error","complete"])}function hx(n,e){if(typeof n!="object"||n===null)return!1;const t=n;for(const r of e)if(r in t&&typeof t[r]=="function")return!0;return!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dx{enableIndexedDbPersistence(e,t){return vC(e._delegate,{forceOwnership:t})}enableMultiTabIndexedDbPersistence(e){return bC(e._delegate)}clearIndexedDbPersistence(e){return IC(e._delegate)}}class qw{constructor(e,t,r){this._delegate=t,this._persistenceProvider=r,this.INTERNAL={delete:()=>this.terminate()},e instanceof _n||(this._appCompat=e)}get _databaseId(){return this._delegate._databaseId}settings(e){const t=this._delegate._getSettings();!e.merge&&t.host!==e.host&&It("You are overriding the original host. If you did not intend to override your settings, use {merge: true}."),e.merge&&(e=Object.assign(Object.assign({},t),e),delete e.merge),this._delegate._setSettings(e)}useEmulator(e,t,r={}){mC(this._delegate,e,t,r)}enableNetwork(){return EC(this._delegate)}disableNetwork(){return TC(this._delegate)}enablePersistence(e){let t=!1,r=!1;return e&&(t=!!e.synchronizeTabs,r=!!e.experimentalForceOwningTab,bw("synchronizeTabs",t,"experimentalForceOwningTab",r)),t?this._persistenceProvider.enableMultiTabIndexedDbPersistence(this):this._persistenceProvider.enableIndexedDbPersistence(this,r)}clearPersistence(){return this._persistenceProvider.clearIndexedDbPersistence(this)}terminate(){return this._appCompat&&(this._appCompat._removeServiceInstance("firestore-compat"),this._appCompat._removeServiceInstance("firestore")),this._delegate._delete()}waitForPendingWrites(){return _C(this._delegate)}onSnapshotsInSync(e){return ZC(this._delegate,e)}get app(){if(!this._appCompat)throw new y("failed-precondition","Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._appCompat}collection(e){try{return new ci(this,_w(this._delegate,e))}catch(t){throw Qe(t,"collection()","Firestore.collection()")}}doc(e){try{return new dt(this,ma(this._delegate,e))}catch(t){throw Qe(t,"doc()","Firestore.doc()")}}collectionGroup(e){try{return new Ye(this,gC(this._delegate,e))}catch(t){throw Qe(t,"collectionGroup()","Firestore.collectionGroup()")}}runTransaction(e){return rx(this._delegate,t=>e(new $w(this,t)))}batch(){return Le(this._delegate),new zw(new tx(this._delegate,e=>co(this._delegate,e)))}loadBundle(e){return kC(this._delegate,e)}namedQuery(e){return SC(this._delegate,e).then(t=>t?new Ye(this,t):null)}}class fc extends Mh{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ms(new Vt(e))}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return dt.forKey(t,this.firestore,null)}}function fx(n){hk(n)}class $w{constructor(e,t){this._firestore=e,this._delegate=t,this._userDataWriter=new fc(e)}get(e){const t=Jn(e);return this._delegate.get(t).then(r=>new Ls(this._firestore,new Xt(this._firestore._delegate,this._userDataWriter,r._key,r._document,r.metadata,t.converter)))}set(e,t,r){const i=Jn(e);return r?(Fh("Transaction.set",r),this._delegate.set(i,t,r)):this._delegate.set(i,t),this}update(e,t,r,...i){const s=Jn(e);return arguments.length===2?this._delegate.update(s,t):this._delegate.update(s,t,r,...i),this}delete(e){const t=Jn(e);return this._delegate.delete(t),this}}class zw{constructor(e){this._delegate=e}set(e,t,r){const i=Jn(e);return r?(Fh("WriteBatch.set",r),this._delegate.set(i,t,r)):this._delegate.set(i,t),this}update(e,t,r,...i){const s=Jn(e);return arguments.length===2?this._delegate.update(s,t):this._delegate.update(s,t,r,...i),this}delete(e){const t=Jn(e);return this._delegate.delete(t),this}commit(){return this._delegate.commit()}}class pr{constructor(e,t,r){this._firestore=e,this._userDataWriter=t,this._delegate=r}fromFirestore(e,t){const r=new as(this._firestore._delegate,this._userDataWriter,e._key,e._document,e.metadata,null);return this._delegate.fromFirestore(new Fs(this._firestore,r),t??{})}toFirestore(e,t){return t?this._delegate.toFirestore(e,t):this._delegate.toFirestore(e)}static getInstance(e,t){const r=pr.INSTANCES;let i=r.get(e);i||(i=new WeakMap,r.set(e,i));let s=i.get(t);return s||(s=new pr(e,new fc(e),t),i.set(t,s)),s}}pr.INSTANCES=new WeakMap;class dt{constructor(e,t){this.firestore=e,this._delegate=t,this._userDataWriter=new fc(e)}static forPath(e,t,r){if(e.length%2!==0)throw new y("invalid-argument",`Invalid document reference. Document references must have an even number of segments, but ${e.canonicalString()} has ${e.length}`);return new dt(t,new se(t._delegate,r,new _(e)))}static forKey(e,t,r){return new dt(t,new se(t._delegate,r,e))}get id(){return this._delegate.id}get parent(){return new ci(this.firestore,this._delegate.parent)}get path(){return this._delegate.path}collection(e){try{return new ci(this.firestore,_w(this._delegate,e))}catch(t){throw Qe(t,"collection()","DocumentReference.collection()")}}isEqual(e){return e=P(e),e instanceof se?Ew(this._delegate,e):!1}set(e,t){t=Fh("DocumentReference.set",t);try{return t?Gf(this._delegate,e,t):Gf(this._delegate,e)}catch(r){throw Qe(r,"setDoc()","DocumentReference.set()")}}update(e,t,...r){try{return arguments.length===1?Wf(this._delegate,e):Wf(this._delegate,e,t,...r)}catch(i){throw Qe(i,"updateDoc()","DocumentReference.update()")}}delete(){return XC(this._delegate)}onSnapshot(...e){const t=jw(e),r=Gw(e,i=>new Ls(this.firestore,new Xt(this.firestore._delegate,this._userDataWriter,i._key,i._document,i.metadata,this._delegate.converter)));return Bw(this._delegate,t,r)}get(e){let t;return(e==null?void 0:e.source)==="cache"?t=WC(this._delegate):(e==null?void 0:e.source)==="server"?t=HC(this._delegate):t=GC(this._delegate),t.then(r=>new Ls(this.firestore,new Xt(this.firestore._delegate,this._userDataWriter,r._key,r._document,r.metadata,this._delegate.converter)))}withConverter(e){return new dt(this.firestore,e?this._delegate.withConverter(pr.getInstance(this.firestore,e)):this._delegate.withConverter(null))}}function Qe(n,e,t){return n.message=n.message.replace(e,t),n}function jw(n){for(const e of n)if(typeof e=="object"&&!Fu(e))return e;return{}}function Gw(n,e){var t,r;let i;return Fu(n[0])?i=n[0]:Fu(n[1])?i=n[1]:typeof n[0]=="function"?i={next:n[0],error:n[1],complete:n[2]}:i={next:n[1],error:n[2],complete:n[3]},{next:s=>{i.next&&i.next(e(s))},error:(t=i.error)===null||t===void 0?void 0:t.bind(i),complete:(r=i.complete)===null||r===void 0?void 0:r.bind(i)}}class Ls{constructor(e,t){this._firestore=e,this._delegate=t}get ref(){return new dt(this._firestore,this._delegate.ref)}get id(){return this._delegate.id}get metadata(){return this._delegate.metadata}get exists(){return this._delegate.exists()}data(e){return this._delegate.data(e)}get(e,t){return this._delegate.get(e,t)}isEqual(e){return Uw(this._delegate,e._delegate)}}class Fs extends Ls{data(e){const t=this._delegate.data(e);return dk(t!==void 0),t}}class Ye{constructor(e,t){this.firestore=e,this._delegate=t,this._userDataWriter=new fc(e)}where(e,t,r){try{return new Ye(this.firestore,cn(this._delegate,MC(e,t,r)))}catch(i){throw Qe(i,/(orderBy|where)\(\)/,"Query.$1()")}}orderBy(e,t){try{return new Ye(this.firestore,cn(this._delegate,LC(e,t)))}catch(r){throw Qe(r,/(orderBy|where)\(\)/,"Query.$1()")}}limit(e){try{return new Ye(this.firestore,cn(this._delegate,FC(e)))}catch(t){throw Qe(t,"limit()","Query.limit()")}}limitToLast(e){try{return new Ye(this.firestore,cn(this._delegate,VC(e)))}catch(t){throw Qe(t,"limitToLast()","Query.limitToLast()")}}startAt(...e){try{return new Ye(this.firestore,cn(this._delegate,UC(...e)))}catch(t){throw Qe(t,"startAt()","Query.startAt()")}}startAfter(...e){try{return new Ye(this.firestore,cn(this._delegate,BC(...e)))}catch(t){throw Qe(t,"startAfter()","Query.startAfter()")}}endBefore(...e){try{return new Ye(this.firestore,cn(this._delegate,qC(...e)))}catch(t){throw Qe(t,"endBefore()","Query.endBefore()")}}endAt(...e){try{return new Ye(this.firestore,cn(this._delegate,$C(...e)))}catch(t){throw Qe(t,"endAt()","Query.endAt()")}}isEqual(e){return Tw(this._delegate,e._delegate)}get(e){let t;return(e==null?void 0:e.source)==="cache"?t=YC(this._delegate):(e==null?void 0:e.source)==="server"?t=QC(this._delegate):t=KC(this._delegate),t.then(r=>new Vu(this.firestore,new An(this.firestore._delegate,this._userDataWriter,this._delegate,r._snapshot)))}onSnapshot(...e){const t=jw(e),r=Gw(e,i=>new Vu(this.firestore,new An(this.firestore._delegate,this._userDataWriter,this._delegate,i._snapshot)));return Bw(this._delegate,t,r)}withConverter(e){return new Ye(this.firestore,e?this._delegate.withConverter(pr.getInstance(this.firestore,e)):this._delegate.withConverter(null))}}class mx{constructor(e,t){this._firestore=e,this._delegate=t}get type(){return this._delegate.type}get doc(){return new Fs(this._firestore,this._delegate.doc)}get oldIndex(){return this._delegate.oldIndex}get newIndex(){return this._delegate.newIndex}}class Vu{constructor(e,t){this._firestore=e,this._delegate=t}get query(){return new Ye(this._firestore,this._delegate.query)}get metadata(){return this._delegate.metadata}get size(){return this._delegate.size}get empty(){return this._delegate.empty}get docs(){return this._delegate.docs.map(e=>new Fs(this._firestore,e))}docChanges(e){return this._delegate.docChanges(e).map(t=>new mx(this._firestore,t))}forEach(e,t){this._delegate.forEach(r=>{e.call(t,new Fs(this._firestore,r))})}isEqual(e){return Uw(this._delegate,e._delegate)}}class ci extends Ye{constructor(e,t){super(e,t),this.firestore=e,this._delegate=t}get id(){return this._delegate.id}get path(){return this._delegate.path}get parent(){const e=this._delegate.parent;return e?new dt(this.firestore,e):null}doc(e){try{return e===void 0?new dt(this.firestore,ma(this._delegate)):new dt(this.firestore,ma(this._delegate,e))}catch(t){throw Qe(t,"doc()","CollectionReference.doc()")}}add(e){return JC(this._delegate,e).then(t=>new dt(this.firestore,t))}isEqual(e){return Ew(this._delegate,e._delegate)}withConverter(e){return new ci(this.firestore,e?this._delegate.withConverter(pr.getInstance(this.firestore,e)):this._delegate.withConverter(null))}}function Jn(n){return K(n,se)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vh{constructor(...e){this._delegate=new Sn(...e)}static documentId(){return new Vh(ge.keyField().canonicalString())}isEqual(e){return e=P(e),e instanceof Sn?this._delegate._internalPath.isEqual(e._internalPath):!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hn{constructor(e){this._delegate=e}static serverTimestamp(){const e=sx();return e._methodName="FieldValue.serverTimestamp",new Hn(e)}static delete(){const e=ix();return e._methodName="FieldValue.delete",new Hn(e)}static arrayUnion(...e){const t=ox(...e);return t._methodName="FieldValue.arrayUnion",new Hn(t)}static arrayRemove(...e){const t=ax(...e);return t._methodName="FieldValue.arrayRemove",new Hn(t)}static increment(e){const t=cx(e);return t._methodName="FieldValue.increment",new Hn(t)}isEqual(e){return this._delegate.isEqual(e._delegate)}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gx={Firestore:qw,GeoPoint:ic,Timestamp:ae,Blob:Ms,Transaction:$w,WriteBatch:zw,DocumentReference:dt,DocumentSnapshot:Ls,Query:Ye,QueryDocumentSnapshot:Fs,QuerySnapshot:Vu,CollectionReference:ci,FieldPath:Vh,FieldValue:Hn,setLogLevel:fx,CACHE_SIZE_UNLIMITED:wC};function px(n,e){n.INTERNAL.registerComponent(new mt("firestore-compat",t=>{const r=t.getProvider("app-compat").getImmediate(),i=t.getProvider("firestore").getImmediate();return e(r,i)},"PUBLIC").setServiceProps(Object.assign({},gx)))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yx(n){px(n,(e,t)=>new qw(e,t,new dx)),n.registerVersion(ux,lx)}yx(pt);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wx="type.googleapis.com/google.protobuf.Int64Value",vx="type.googleapis.com/google.protobuf.UInt64Value";function Ww(n,e){const t={};for(const r in n)n.hasOwnProperty(r)&&(t[r]=e(n[r]));return t}function Uu(n){if(n==null)return null;if(n instanceof Number&&(n=n.valueOf()),typeof n=="number"&&isFinite(n)||n===!0||n===!1||Object.prototype.toString.call(n)==="[object String]")return n;if(n instanceof Date)return n.toISOString();if(Array.isArray(n))return n.map(e=>Uu(e));if(typeof n=="function"||typeof n=="object")return Ww(n,e=>Uu(e));throw new Error("Data cannot be encoded in JSON: "+n)}function pa(n){if(n==null)return n;if(n["@type"])switch(n["@type"]){case wx:case vx:{const e=Number(n.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+n);return e}default:throw new Error("Data cannot be decoded from JSON: "+n)}return Array.isArray(n)?n.map(e=>pa(e)):typeof n=="function"||typeof n=="object"?Ww(n,e=>pa(e)):n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hw="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yf={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Hr extends De{constructor(e,t,r){super(`${Hw}/${e}`,t||""),this.details=r}}function bx(n){if(n>=200&&n<300)return"ok";switch(n){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function Ix(n,e){let t=bx(n),r=t,i;try{const s=e&&e.error;if(s){const o=s.status;if(typeof o=="string"){if(!Yf[o])return new Hr("internal","internal");t=Yf[o],r=o}const a=s.message;typeof a=="string"&&(r=a),i=s.details,i!==void 0&&(i=pa(i))}}catch{}return t==="ok"?null:new Hr(t,r,i)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _x{constructor(e,t,r){this.auth=null,this.messaging=null,this.appCheck=null,this.auth=e.getImmediate({optional:!0}),this.messaging=t.getImmediate({optional:!0}),this.auth||e.get().then(i=>this.auth=i,()=>{}),this.messaging||t.get().then(i=>this.messaging=i,()=>{}),this.appCheck||r.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.appCheck){const t=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return t.error?null:t.token}return null}async getContext(e){const t=await this.getAuthToken(),r=await this.getMessagingToken(),i=await this.getAppCheckToken(e);return{authToken:t,messagingToken:r,appCheckToken:i}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qf="us-central1";function Ex(n){let e=null;return{promise:new Promise((t,r)=>{e=setTimeout(()=>{r(new Hr("deadline-exceeded","deadline-exceeded"))},n)}),cancel:()=>{e&&clearTimeout(e)}}}let Tx=class{constructor(e,t,r,i,s=Qf,o){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new _x(t,r,i),this.cancelAllRequests=new Promise(a=>{this.deleteService=()=>Promise.resolve(a())});try{const a=new URL(s);this.customDomain=a.origin,this.region=Qf}catch{this.customDomain=null,this.region=s}}_delete(){return this.deleteService()}_url(e){const t=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}};function kx(n,e,t){n.emulatorOrigin=`http://${e}:${t}`}function Sx(n,e,t){return r=>xx(n,e,r,t||{})}function Ax(n,e,t){return r=>Kw(n,e,r,t||{})}async function Cx(n,e,t,r){t["Content-Type"]="application/json";let i;try{i=await r(n,{method:"POST",body:JSON.stringify(e),headers:t})}catch{return{status:0,json:null}}let s=null;try{s=await i.json()}catch{}return{status:i.status,json:s}}function xx(n,e,t,r){const i=n._url(e);return Kw(n,i,t,r)}async function Kw(n,e,t,r){t=Uu(t);const i={data:t},s={},o=await n.contextProvider.getContext(r.limitedUseAppCheckTokens);o.authToken&&(s.Authorization="Bearer "+o.authToken),o.messagingToken&&(s["Firebase-Instance-ID-Token"]=o.messagingToken),o.appCheckToken!==null&&(s["X-Firebase-AppCheck"]=o.appCheckToken);const a=r.timeout||7e4,c=Ex(a),u=await Promise.race([Cx(e,i,s,n.fetchImpl),c.promise,n.cancelAllRequests]);if(c.cancel(),!u)throw new Hr("cancelled","Firebase Functions instance was deleted.");const l=Ix(u.status,u.json);if(l)throw l;if(!u.json)throw new Hr("internal","Response is not valid JSON object.");let h=u.json.data;if(typeof h>"u"&&(h=u.json.result),typeof h>"u")throw new Hr("internal","Response is missing data field.");return{data:pa(h)}}const Xf="@firebase/functions",Jf="0.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dx="auth-internal",Nx="app-check-internal",Rx="messaging-internal";function Px(n,e){const t=(r,{instanceIdentifier:i})=>{const s=r.getProvider("app").getImmediate(),o=r.getProvider(Dx),a=r.getProvider(Rx),c=r.getProvider(Nx);return new Tx(s,o,a,c,i,n)};Kt(new mt(Hw,t,"PUBLIC").setMultipleInstances(!0)),ft(Xf,Jf,e),ft(Xf,Jf,"esm2017")}function Zf(n,e,t){kx(P(n),e,t)}function Ox(n,e,t){return Sx(P(n),e,t)}function Mx(n,e,t){return Ax(P(n),e,t)}Px(fetch.bind(self));const Lx="@firebase/functions-compat",Fx="0.3.5";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yw{constructor(e,t){this.app=e,this._delegate=t,this._region=this._delegate.region,this._customDomain=this._delegate.customDomain}httpsCallable(e,t){return Ox(this._delegate,e,t)}httpsCallableFromURL(e,t){return Mx(this._delegate,e,t)}useFunctionsEmulator(e){const t=e.match("[a-zA-Z]+://([a-zA-Z0-9.-]+)(?::([0-9]+))?");if(t==null)throw new De("functions","No origin provided to useFunctionsEmulator()");if(t[2]==null)throw new De("functions","Port missing in origin provided to useFunctionsEmulator()");return Zf(this._delegate,t[1],Number(t[2]))}useEmulator(e,t){return Zf(this._delegate,e,t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vx="us-central1",Ux=(n,{instanceIdentifier:e})=>{const t=n.getProvider("app-compat").getImmediate(),r=n.getProvider("functions").getImmediate({identifier:e??Vx});return new Yw(t,r)};function Bx(){const n={Functions:Yw};pt.INTERNAL.registerComponent(new mt("functions-compat",Ux,"PUBLIC").setServiceProps(n).setMultipleInstances(!0))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Bx();pt.registerVersion(Lx,Fx);const mc=typeof window<"u",qx={apiKey:"AIzaSyAYLQoJRCZ9ynyASEQ0zNWez9GUeNG4qsg",authDomain:"aafairshare-37271.firebaseapp.com",projectId:"aafairshare-37271",storageBucket:"aafairshare-37271.appspot.com",messagingSenderId:"121020031141",appId:"1:121020031141:web:c56c04b654aae5cfd76d4c"};let qt,Vr,wt,cs;function $x(){if(!mc)return console.log("Server-side rendering, using dummy Firebase implementation"),{app:{},auth:{},db:{},functions:{}};try{return pt.apps.length>0?(console.log("Firebase already initialized, using existing app"),qt=pt.apps[0]):(console.log("Initializing Firebase"),qt=pt.initializeApp(qx)),Vr=qt.auth(),wt=qt.firestore(),cs=qt.functions(),Vr.setPersistence(pt.auth.Auth.Persistence.LOCAL).catch(n=>{console.error("Failed to set Firebase auth persistence:",n)}),{app:qt,auth:Vr,db:wt,functions:cs}}catch(n){throw console.error("Error initializing Firebase:",n),Vr={},wt={},cs={},qt={},n}}function PR(n){return mc?!wt||typeof wt.collection!="function"?(console.error("Firestore not initialized when trying to access collection"),null):wt.collection(n):(console.log("Attempted to access Firestore collection on server"),null)}function OR(n){return mc?!wt||typeof wt.doc!="function"?(console.error("Firestore not initialized when trying to access document"),null):wt.doc(n):(console.log("Attempted to access Firestore document on server"),null)}if(mc)try{const n=$x();qt=n.app,Vr=n.auth,wt=n.db,cs=n.functions}catch(n){console.error("Failed to initialize Firebase on module load:",n)}else qt={},Vr={},wt={},cs={};function em(n,e){if(typeof n=="function")return n(e);n!=null&&(n.current=e)}function Qw(...n){return e=>{let t=!1;const r=n.map(i=>{const s=em(i,e);return!t&&typeof s=="function"&&(t=!0),s});if(t)return()=>{for(let i=0;i<r.length;i++){const s=r[i];typeof s=="function"?s():em(n[i],null)}}}}function MR(...n){return Xe.useCallback(Qw(...n),n)}function zx(n){const e=jx(n),t=Xe.forwardRef((r,i)=>{const{children:s,...o}=r,a=Xe.Children.toArray(s),c=a.find(Gx);if(c){const u=c.props.children,l=a.map(h=>h===c?Xe.Children.count(u)>1?Xe.Children.only(null):Xe.isValidElement(u)?u.props.children:null:h);return qo.jsx(e,{...o,ref:i,children:Xe.isValidElement(u)?Xe.cloneElement(u,void 0,l):null})}return qo.jsx(e,{...o,ref:i,children:s})});return t.displayName=`${n}.Slot`,t}var LR=zx("Slot");function jx(n){const e=Xe.forwardRef((t,r)=>{const{children:i,...s}=t;if(Xe.isValidElement(i)){const o=Hx(i),a=Wx(s,i.props);return i.type!==Xe.Fragment&&(a.ref=r?Qw(r,o):o),Xe.cloneElement(i,a)}return Xe.Children.count(i)>1?Xe.Children.only(null):null});return e.displayName=`${n}.SlotClone`,e}var Xw=Symbol("radix.slottable");function FR(n){const e=({children:t})=>qo.jsx(qo.Fragment,{children:t});return e.displayName=`${n}.Slottable`,e.__radixId=Xw,e}function Gx(n){return Xe.isValidElement(n)&&typeof n.type=="function"&&"__radixId"in n.type&&n.type.__radixId===Xw}function Wx(n,e){const t={...e};for(const r in e){const i=n[r],s=e[r];/^on[A-Z]/.test(r)?i&&s?t[r]=(...a)=>{s(...a),i(...a)}:i&&(t[r]=i):r==="style"?t[r]={...i,...s}:r==="className"&&(t[r]=[i,s].filter(Boolean).join(" "))}return{...n,...t}}function Hx(n){var r,i;let e=(r=Object.getOwnPropertyDescriptor(n.props,"ref"))==null?void 0:r.get,t=e&&"isReactWarning"in e&&e.isReactWarning;return t?n.ref:(e=(i=Object.getOwnPropertyDescriptor(n,"ref"))==null?void 0:i.get,t=e&&"isReactWarning"in e&&e.isReactWarning,t?n.props.ref:n.props.ref||n.ref)}function Jw(n){var e,t,r="";if(typeof n=="string"||typeof n=="number")r+=n;else if(typeof n=="object")if(Array.isArray(n)){var i=n.length;for(e=0;e<i;e++)n[e]&&(t=Jw(n[e]))&&(r&&(r+=" "),r+=t)}else for(t in n)n[t]&&(r&&(r+=" "),r+=t);return r}function Zw(){for(var n,e,t=0,r="",i=arguments.length;t<i;t++)(n=arguments[t])&&(e=Jw(n))&&(r&&(r+=" "),r+=e);return r}const tm=n=>typeof n=="boolean"?`${n}`:n===0?"0":n,nm=Zw,VR=(n,e)=>t=>{var r;if((e==null?void 0:e.variants)==null)return nm(n,t==null?void 0:t.class,t==null?void 0:t.className);const{variants:i,defaultVariants:s}=e,o=Object.keys(i).map(u=>{const l=t==null?void 0:t[u],h=s==null?void 0:s[u];if(l===null)return null;const d=tm(l)||tm(h);return i[u][d]}),a=t&&Object.entries(t).reduce((u,l)=>{let[h,d]=l;return d===void 0||(u[h]=d),u},{}),c=e==null||(r=e.compoundVariants)===null||r===void 0?void 0:r.reduce((u,l)=>{let{class:h,className:d,...f}=l;return Object.entries(f).every(p=>{let[v,E]=p;return Array.isArray(E)?E.includes({...s,...a}[v]):{...s,...a}[v]===E})?[...u,h,d]:u},[]);return nm(n,o,c,t==null?void 0:t.class,t==null?void 0:t.className)},Uh="-",Kx=n=>{const e=Qx(n),{conflictingClassGroups:t,conflictingClassGroupModifiers:r}=n;return{getClassGroupId:o=>{const a=o.split(Uh);return a[0]===""&&a.length!==1&&a.shift(),ev(a,e)||Yx(o)},getConflictingClassGroupIds:(o,a)=>{const c=t[o]||[];return a&&r[o]?[...c,...r[o]]:c}}},ev=(n,e)=>{var o;if(n.length===0)return e.classGroupId;const t=n[0],r=e.nextPart.get(t),i=r?ev(n.slice(1),r):void 0;if(i)return i;if(e.validators.length===0)return;const s=n.join(Uh);return(o=e.validators.find(({validator:a})=>a(s)))==null?void 0:o.classGroupId},rm=/^\[(.+)\]$/,Yx=n=>{if(rm.test(n)){const e=rm.exec(n)[1],t=e==null?void 0:e.substring(0,e.indexOf(":"));if(t)return"arbitrary.."+t}},Qx=n=>{const{theme:e,classGroups:t}=n,r={nextPart:new Map,validators:[]};for(const i in t)Bu(t[i],r,i,e);return r},Bu=(n,e,t,r)=>{n.forEach(i=>{if(typeof i=="string"){const s=i===""?e:im(e,i);s.classGroupId=t;return}if(typeof i=="function"){if(Xx(i)){Bu(i(r),e,t,r);return}e.validators.push({validator:i,classGroupId:t});return}Object.entries(i).forEach(([s,o])=>{Bu(o,im(e,s),t,r)})})},im=(n,e)=>{let t=n;return e.split(Uh).forEach(r=>{t.nextPart.has(r)||t.nextPart.set(r,{nextPart:new Map,validators:[]}),t=t.nextPart.get(r)}),t},Xx=n=>n.isThemeGetter,Jx=n=>{if(n<1)return{get:()=>{},set:()=>{}};let e=0,t=new Map,r=new Map;const i=(s,o)=>{t.set(s,o),e++,e>n&&(e=0,r=t,t=new Map)};return{get(s){let o=t.get(s);if(o!==void 0)return o;if((o=r.get(s))!==void 0)return i(s,o),o},set(s,o){t.has(s)?t.set(s,o):i(s,o)}}},qu="!",$u=":",Zx=$u.length,eD=n=>{const{prefix:e,experimentalParseClassName:t}=n;let r=i=>{const s=[];let o=0,a=0,c=0,u;for(let p=0;p<i.length;p++){let v=i[p];if(o===0&&a===0){if(v===$u){s.push(i.slice(c,p)),c=p+Zx;continue}if(v==="/"){u=p;continue}}v==="["?o++:v==="]"?o--:v==="("?a++:v===")"&&a--}const l=s.length===0?i:i.substring(c),h=tD(l),d=h!==l,f=u&&u>c?u-c:void 0;return{modifiers:s,hasImportantModifier:d,baseClassName:h,maybePostfixModifierPosition:f}};if(e){const i=e+$u,s=r;r=o=>o.startsWith(i)?s(o.substring(i.length)):{isExternal:!0,modifiers:[],hasImportantModifier:!1,baseClassName:o,maybePostfixModifierPosition:void 0}}if(t){const i=r;r=s=>t({className:s,parseClassName:i})}return r},tD=n=>n.endsWith(qu)?n.substring(0,n.length-1):n.startsWith(qu)?n.substring(1):n,nD=n=>{const e=Object.fromEntries(n.orderSensitiveModifiers.map(r=>[r,!0]));return r=>{if(r.length<=1)return r;const i=[];let s=[];return r.forEach(o=>{o[0]==="["||e[o]?(i.push(...s.sort(),o),s=[]):s.push(o)}),i.push(...s.sort()),i}},rD=n=>({cache:Jx(n.cacheSize),parseClassName:eD(n),sortModifiers:nD(n),...Kx(n)}),iD=/\s+/,sD=(n,e)=>{const{parseClassName:t,getClassGroupId:r,getConflictingClassGroupIds:i,sortModifiers:s}=e,o=[],a=n.trim().split(iD);let c="";for(let u=a.length-1;u>=0;u-=1){const l=a[u],{isExternal:h,modifiers:d,hasImportantModifier:f,baseClassName:p,maybePostfixModifierPosition:v}=t(l);if(h){c=l+(c.length>0?" "+c:c);continue}let E=!!v,L=r(E?p.substring(0,v):p);if(!L){if(!E){c=l+(c.length>0?" "+c:c);continue}if(L=r(p),!L){c=l+(c.length>0?" "+c:c);continue}E=!1}const O=s(d).join(":"),D=f?O+qu:O,z=D+L;if(o.includes(z))continue;o.push(z);const Y=i(L,E);for(let $=0;$<Y.length;++$){const ee=Y[$];o.push(D+ee)}c=l+(c.length>0?" "+c:c)}return c};function oD(){let n=0,e,t,r="";for(;n<arguments.length;)(e=arguments[n++])&&(t=tv(e))&&(r&&(r+=" "),r+=t);return r}const tv=n=>{if(typeof n=="string")return n;let e,t="";for(let r=0;r<n.length;r++)n[r]&&(e=tv(n[r]))&&(t&&(t+=" "),t+=e);return t};function aD(n,...e){let t,r,i,s=o;function o(c){const u=e.reduce((l,h)=>h(l),n());return t=rD(u),r=t.cache.get,i=t.cache.set,s=a,a(c)}function a(c){const u=r(c);if(u)return u;const l=sD(c,t);return i(c,l),l}return function(){return s(oD.apply(null,arguments))}}const Te=n=>{const e=t=>t[n]||[];return e.isThemeGetter=!0,e},nv=/^\[(?:(\w[\w-]*):)?(.+)\]$/i,rv=/^\((?:(\w[\w-]*):)?(.+)\)$/i,cD=/^\d+\/\d+$/,uD=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,lD=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,hD=/^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/,dD=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,fD=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,Nr=n=>cD.test(n),q=n=>!!n&&!Number.isNaN(Number(n)),un=n=>!!n&&Number.isInteger(Number(n)),$c=n=>n.endsWith("%")&&q(n.slice(0,-1)),Bt=n=>uD.test(n),mD=()=>!0,gD=n=>lD.test(n)&&!hD.test(n),iv=()=>!1,pD=n=>dD.test(n),yD=n=>fD.test(n),wD=n=>!C(n)&&!x(n),vD=n=>ki(n,av,iv),C=n=>nv.test(n),Un=n=>ki(n,cv,gD),zc=n=>ki(n,TD,q),sm=n=>ki(n,sv,iv),bD=n=>ki(n,ov,yD),Ao=n=>ki(n,uv,pD),x=n=>rv.test(n),$i=n=>Si(n,cv),ID=n=>Si(n,kD),om=n=>Si(n,sv),_D=n=>Si(n,av),ED=n=>Si(n,ov),Co=n=>Si(n,uv,!0),ki=(n,e,t)=>{const r=nv.exec(n);return r?r[1]?e(r[1]):t(r[2]):!1},Si=(n,e,t=!1)=>{const r=rv.exec(n);return r?r[1]?e(r[1]):t:!1},sv=n=>n==="position"||n==="percentage",ov=n=>n==="image"||n==="url",av=n=>n==="length"||n==="size"||n==="bg-size",cv=n=>n==="length",TD=n=>n==="number",kD=n=>n==="family-name",uv=n=>n==="shadow",SD=()=>{const n=Te("color"),e=Te("font"),t=Te("text"),r=Te("font-weight"),i=Te("tracking"),s=Te("leading"),o=Te("breakpoint"),a=Te("container"),c=Te("spacing"),u=Te("radius"),l=Te("shadow"),h=Te("inset-shadow"),d=Te("text-shadow"),f=Te("drop-shadow"),p=Te("blur"),v=Te("perspective"),E=Te("aspect"),L=Te("ease"),O=Te("animate"),D=()=>["auto","avoid","all","avoid-page","page","left","right","column"],z=()=>["center","top","bottom","left","right","top-left","left-top","top-right","right-top","bottom-right","right-bottom","bottom-left","left-bottom"],Y=()=>[...z(),x,C],$=()=>["auto","hidden","clip","visible","scroll"],ee=()=>["auto","contain","none"],I=()=>[x,C,c],B=()=>[Nr,"full","auto",...I()],He=()=>[un,"none","subgrid",x,C],xi=()=>["auto",{span:["full",un,x,C]},un,x,C],rn=()=>[un,"auto",x,C],Di=()=>["auto","min","max","fr",x,C],kr=()=>["start","end","center","between","around","evenly","stretch","baseline","center-safe","end-safe"],Sr=()=>["start","end","center","stretch","center-safe","end-safe"],Ut=()=>["auto",...I()],Fn=()=>[Nr,"auto","full","dvw","dvh","lvw","lvh","svw","svh","min","max","fit",...I()],M=()=>[n,x,C],jh=()=>[...z(),om,sm,{position:[x,C]}],Gh=()=>["no-repeat",{repeat:["","x","y","space","round"]}],Wh=()=>["auto","cover","contain",_D,vD,{size:[x,C]}],gc=()=>[$c,$i,Un],Ke=()=>["","none","full",u,x,C],ot=()=>["",q,$i,Un],uo=()=>["solid","dashed","dotted","double"],Hh=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"],Ae=()=>[q,$c,om,sm],Kh=()=>["","none",p,x,C],lo=()=>["none",q,x,C],ho=()=>["none",q,x,C],pc=()=>[q,x,C],fo=()=>[Nr,"full",...I()];return{cacheSize:500,theme:{animate:["spin","ping","pulse","bounce"],aspect:["video"],blur:[Bt],breakpoint:[Bt],color:[mD],container:[Bt],"drop-shadow":[Bt],ease:["in","out","in-out"],font:[wD],"font-weight":["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],"inset-shadow":[Bt],leading:["none","tight","snug","normal","relaxed","loose"],perspective:["dramatic","near","normal","midrange","distant","none"],radius:[Bt],shadow:[Bt],spacing:["px",q],text:[Bt],"text-shadow":[Bt],tracking:["tighter","tight","normal","wide","wider","widest"]},classGroups:{aspect:[{aspect:["auto","square",Nr,C,x,E]}],container:["container"],columns:[{columns:[q,C,x,a]}],"break-after":[{"break-after":D()}],"break-before":[{"break-before":D()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],sr:["sr-only","not-sr-only"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:Y()}],overflow:[{overflow:$()}],"overflow-x":[{"overflow-x":$()}],"overflow-y":[{"overflow-y":$()}],overscroll:[{overscroll:ee()}],"overscroll-x":[{"overscroll-x":ee()}],"overscroll-y":[{"overscroll-y":ee()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:B()}],"inset-x":[{"inset-x":B()}],"inset-y":[{"inset-y":B()}],start:[{start:B()}],end:[{end:B()}],top:[{top:B()}],right:[{right:B()}],bottom:[{bottom:B()}],left:[{left:B()}],visibility:["visible","invisible","collapse"],z:[{z:[un,"auto",x,C]}],basis:[{basis:[Nr,"full","auto",a,...I()]}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["nowrap","wrap","wrap-reverse"]}],flex:[{flex:[q,Nr,"auto","initial","none",C]}],grow:[{grow:["",q,x,C]}],shrink:[{shrink:["",q,x,C]}],order:[{order:[un,"first","last","none",x,C]}],"grid-cols":[{"grid-cols":He()}],"col-start-end":[{col:xi()}],"col-start":[{"col-start":rn()}],"col-end":[{"col-end":rn()}],"grid-rows":[{"grid-rows":He()}],"row-start-end":[{row:xi()}],"row-start":[{"row-start":rn()}],"row-end":[{"row-end":rn()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":Di()}],"auto-rows":[{"auto-rows":Di()}],gap:[{gap:I()}],"gap-x":[{"gap-x":I()}],"gap-y":[{"gap-y":I()}],"justify-content":[{justify:[...kr(),"normal"]}],"justify-items":[{"justify-items":[...Sr(),"normal"]}],"justify-self":[{"justify-self":["auto",...Sr()]}],"align-content":[{content:["normal",...kr()]}],"align-items":[{items:[...Sr(),{baseline:["","last"]}]}],"align-self":[{self:["auto",...Sr(),{baseline:["","last"]}]}],"place-content":[{"place-content":kr()}],"place-items":[{"place-items":[...Sr(),"baseline"]}],"place-self":[{"place-self":["auto",...Sr()]}],p:[{p:I()}],px:[{px:I()}],py:[{py:I()}],ps:[{ps:I()}],pe:[{pe:I()}],pt:[{pt:I()}],pr:[{pr:I()}],pb:[{pb:I()}],pl:[{pl:I()}],m:[{m:Ut()}],mx:[{mx:Ut()}],my:[{my:Ut()}],ms:[{ms:Ut()}],me:[{me:Ut()}],mt:[{mt:Ut()}],mr:[{mr:Ut()}],mb:[{mb:Ut()}],ml:[{ml:Ut()}],"space-x":[{"space-x":I()}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":I()}],"space-y-reverse":["space-y-reverse"],size:[{size:Fn()}],w:[{w:[a,"screen",...Fn()]}],"min-w":[{"min-w":[a,"screen","none",...Fn()]}],"max-w":[{"max-w":[a,"screen","none","prose",{screen:[o]},...Fn()]}],h:[{h:["screen",...Fn()]}],"min-h":[{"min-h":["screen","none",...Fn()]}],"max-h":[{"max-h":["screen",...Fn()]}],"font-size":[{text:["base",t,$i,Un]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:[r,x,zc]}],"font-stretch":[{"font-stretch":["ultra-condensed","extra-condensed","condensed","semi-condensed","normal","semi-expanded","expanded","extra-expanded","ultra-expanded",$c,C]}],"font-family":[{font:[ID,C,e]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractions"],tracking:[{tracking:[i,x,C]}],"line-clamp":[{"line-clamp":[q,"none",x,zc]}],leading:[{leading:[s,...I()]}],"list-image":[{"list-image":["none",x,C]}],"list-style-position":[{list:["inside","outside"]}],"list-style-type":[{list:["disc","decimal","none",x,C]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"placeholder-color":[{placeholder:M()}],"text-color":[{text:M()}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...uo(),"wavy"]}],"text-decoration-thickness":[{decoration:[q,"from-font","auto",x,Un]}],"text-decoration-color":[{decoration:M()}],"underline-offset":[{"underline-offset":[q,"auto",x,C]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:I()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",x,C]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],wrap:[{wrap:["break-word","anywhere","normal"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",x,C]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:jh()}],"bg-repeat":[{bg:Gh()}],"bg-size":[{bg:Wh()}],"bg-image":[{bg:["none",{linear:[{to:["t","tr","r","br","b","bl","l","tl"]},un,x,C],radial:["",x,C],conic:[un,x,C]},ED,bD]}],"bg-color":[{bg:M()}],"gradient-from-pos":[{from:gc()}],"gradient-via-pos":[{via:gc()}],"gradient-to-pos":[{to:gc()}],"gradient-from":[{from:M()}],"gradient-via":[{via:M()}],"gradient-to":[{to:M()}],rounded:[{rounded:Ke()}],"rounded-s":[{"rounded-s":Ke()}],"rounded-e":[{"rounded-e":Ke()}],"rounded-t":[{"rounded-t":Ke()}],"rounded-r":[{"rounded-r":Ke()}],"rounded-b":[{"rounded-b":Ke()}],"rounded-l":[{"rounded-l":Ke()}],"rounded-ss":[{"rounded-ss":Ke()}],"rounded-se":[{"rounded-se":Ke()}],"rounded-ee":[{"rounded-ee":Ke()}],"rounded-es":[{"rounded-es":Ke()}],"rounded-tl":[{"rounded-tl":Ke()}],"rounded-tr":[{"rounded-tr":Ke()}],"rounded-br":[{"rounded-br":Ke()}],"rounded-bl":[{"rounded-bl":Ke()}],"border-w":[{border:ot()}],"border-w-x":[{"border-x":ot()}],"border-w-y":[{"border-y":ot()}],"border-w-s":[{"border-s":ot()}],"border-w-e":[{"border-e":ot()}],"border-w-t":[{"border-t":ot()}],"border-w-r":[{"border-r":ot()}],"border-w-b":[{"border-b":ot()}],"border-w-l":[{"border-l":ot()}],"divide-x":[{"divide-x":ot()}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":ot()}],"divide-y-reverse":["divide-y-reverse"],"border-style":[{border:[...uo(),"hidden","none"]}],"divide-style":[{divide:[...uo(),"hidden","none"]}],"border-color":[{border:M()}],"border-color-x":[{"border-x":M()}],"border-color-y":[{"border-y":M()}],"border-color-s":[{"border-s":M()}],"border-color-e":[{"border-e":M()}],"border-color-t":[{"border-t":M()}],"border-color-r":[{"border-r":M()}],"border-color-b":[{"border-b":M()}],"border-color-l":[{"border-l":M()}],"divide-color":[{divide:M()}],"outline-style":[{outline:[...uo(),"none","hidden"]}],"outline-offset":[{"outline-offset":[q,x,C]}],"outline-w":[{outline:["",q,$i,Un]}],"outline-color":[{outline:M()}],shadow:[{shadow:["","none",l,Co,Ao]}],"shadow-color":[{shadow:M()}],"inset-shadow":[{"inset-shadow":["none",h,Co,Ao]}],"inset-shadow-color":[{"inset-shadow":M()}],"ring-w":[{ring:ot()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:M()}],"ring-offset-w":[{"ring-offset":[q,Un]}],"ring-offset-color":[{"ring-offset":M()}],"inset-ring-w":[{"inset-ring":ot()}],"inset-ring-color":[{"inset-ring":M()}],"text-shadow":[{"text-shadow":["none",d,Co,Ao]}],"text-shadow-color":[{"text-shadow":M()}],opacity:[{opacity:[q,x,C]}],"mix-blend":[{"mix-blend":[...Hh(),"plus-darker","plus-lighter"]}],"bg-blend":[{"bg-blend":Hh()}],"mask-clip":[{"mask-clip":["border","padding","content","fill","stroke","view"]},"mask-no-clip"],"mask-composite":[{mask:["add","subtract","intersect","exclude"]}],"mask-image-linear-pos":[{"mask-linear":[q]}],"mask-image-linear-from-pos":[{"mask-linear-from":Ae()}],"mask-image-linear-to-pos":[{"mask-linear-to":Ae()}],"mask-image-linear-from-color":[{"mask-linear-from":M()}],"mask-image-linear-to-color":[{"mask-linear-to":M()}],"mask-image-t-from-pos":[{"mask-t-from":Ae()}],"mask-image-t-to-pos":[{"mask-t-to":Ae()}],"mask-image-t-from-color":[{"mask-t-from":M()}],"mask-image-t-to-color":[{"mask-t-to":M()}],"mask-image-r-from-pos":[{"mask-r-from":Ae()}],"mask-image-r-to-pos":[{"mask-r-to":Ae()}],"mask-image-r-from-color":[{"mask-r-from":M()}],"mask-image-r-to-color":[{"mask-r-to":M()}],"mask-image-b-from-pos":[{"mask-b-from":Ae()}],"mask-image-b-to-pos":[{"mask-b-to":Ae()}],"mask-image-b-from-color":[{"mask-b-from":M()}],"mask-image-b-to-color":[{"mask-b-to":M()}],"mask-image-l-from-pos":[{"mask-l-from":Ae()}],"mask-image-l-to-pos":[{"mask-l-to":Ae()}],"mask-image-l-from-color":[{"mask-l-from":M()}],"mask-image-l-to-color":[{"mask-l-to":M()}],"mask-image-x-from-pos":[{"mask-x-from":Ae()}],"mask-image-x-to-pos":[{"mask-x-to":Ae()}],"mask-image-x-from-color":[{"mask-x-from":M()}],"mask-image-x-to-color":[{"mask-x-to":M()}],"mask-image-y-from-pos":[{"mask-y-from":Ae()}],"mask-image-y-to-pos":[{"mask-y-to":Ae()}],"mask-image-y-from-color":[{"mask-y-from":M()}],"mask-image-y-to-color":[{"mask-y-to":M()}],"mask-image-radial":[{"mask-radial":[x,C]}],"mask-image-radial-from-pos":[{"mask-radial-from":Ae()}],"mask-image-radial-to-pos":[{"mask-radial-to":Ae()}],"mask-image-radial-from-color":[{"mask-radial-from":M()}],"mask-image-radial-to-color":[{"mask-radial-to":M()}],"mask-image-radial-shape":[{"mask-radial":["circle","ellipse"]}],"mask-image-radial-size":[{"mask-radial":[{closest:["side","corner"],farthest:["side","corner"]}]}],"mask-image-radial-pos":[{"mask-radial-at":z()}],"mask-image-conic-pos":[{"mask-conic":[q]}],"mask-image-conic-from-pos":[{"mask-conic-from":Ae()}],"mask-image-conic-to-pos":[{"mask-conic-to":Ae()}],"mask-image-conic-from-color":[{"mask-conic-from":M()}],"mask-image-conic-to-color":[{"mask-conic-to":M()}],"mask-mode":[{mask:["alpha","luminance","match"]}],"mask-origin":[{"mask-origin":["border","padding","content","fill","stroke","view"]}],"mask-position":[{mask:jh()}],"mask-repeat":[{mask:Gh()}],"mask-size":[{mask:Wh()}],"mask-type":[{"mask-type":["alpha","luminance"]}],"mask-image":[{mask:["none",x,C]}],filter:[{filter:["","none",x,C]}],blur:[{blur:Kh()}],brightness:[{brightness:[q,x,C]}],contrast:[{contrast:[q,x,C]}],"drop-shadow":[{"drop-shadow":["","none",f,Co,Ao]}],"drop-shadow-color":[{"drop-shadow":M()}],grayscale:[{grayscale:["",q,x,C]}],"hue-rotate":[{"hue-rotate":[q,x,C]}],invert:[{invert:["",q,x,C]}],saturate:[{saturate:[q,x,C]}],sepia:[{sepia:["",q,x,C]}],"backdrop-filter":[{"backdrop-filter":["","none",x,C]}],"backdrop-blur":[{"backdrop-blur":Kh()}],"backdrop-brightness":[{"backdrop-brightness":[q,x,C]}],"backdrop-contrast":[{"backdrop-contrast":[q,x,C]}],"backdrop-grayscale":[{"backdrop-grayscale":["",q,x,C]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[q,x,C]}],"backdrop-invert":[{"backdrop-invert":["",q,x,C]}],"backdrop-opacity":[{"backdrop-opacity":[q,x,C]}],"backdrop-saturate":[{"backdrop-saturate":[q,x,C]}],"backdrop-sepia":[{"backdrop-sepia":["",q,x,C]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":I()}],"border-spacing-x":[{"border-spacing-x":I()}],"border-spacing-y":[{"border-spacing-y":I()}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["","all","colors","opacity","shadow","transform","none",x,C]}],"transition-behavior":[{transition:["normal","discrete"]}],duration:[{duration:[q,"initial",x,C]}],ease:[{ease:["linear","initial",L,x,C]}],delay:[{delay:[q,x,C]}],animate:[{animate:["none",O,x,C]}],backface:[{backface:["hidden","visible"]}],perspective:[{perspective:[v,x,C]}],"perspective-origin":[{"perspective-origin":Y()}],rotate:[{rotate:lo()}],"rotate-x":[{"rotate-x":lo()}],"rotate-y":[{"rotate-y":lo()}],"rotate-z":[{"rotate-z":lo()}],scale:[{scale:ho()}],"scale-x":[{"scale-x":ho()}],"scale-y":[{"scale-y":ho()}],"scale-z":[{"scale-z":ho()}],"scale-3d":["scale-3d"],skew:[{skew:pc()}],"skew-x":[{"skew-x":pc()}],"skew-y":[{"skew-y":pc()}],transform:[{transform:[x,C,"","none","gpu","cpu"]}],"transform-origin":[{origin:Y()}],"transform-style":[{transform:["3d","flat"]}],translate:[{translate:fo()}],"translate-x":[{"translate-x":fo()}],"translate-y":[{"translate-y":fo()}],"translate-z":[{"translate-z":fo()}],"translate-none":["translate-none"],accent:[{accent:M()}],appearance:[{appearance:["none","auto"]}],"caret-color":[{caret:M()}],"color-scheme":[{scheme:["normal","dark","light","light-dark","only-dark","only-light"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",x,C]}],"field-sizing":[{"field-sizing":["fixed","content"]}],"pointer-events":[{"pointer-events":["auto","none"]}],resize:[{resize:["none","","y","x"]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":I()}],"scroll-mx":[{"scroll-mx":I()}],"scroll-my":[{"scroll-my":I()}],"scroll-ms":[{"scroll-ms":I()}],"scroll-me":[{"scroll-me":I()}],"scroll-mt":[{"scroll-mt":I()}],"scroll-mr":[{"scroll-mr":I()}],"scroll-mb":[{"scroll-mb":I()}],"scroll-ml":[{"scroll-ml":I()}],"scroll-p":[{"scroll-p":I()}],"scroll-px":[{"scroll-px":I()}],"scroll-py":[{"scroll-py":I()}],"scroll-ps":[{"scroll-ps":I()}],"scroll-pe":[{"scroll-pe":I()}],"scroll-pt":[{"scroll-pt":I()}],"scroll-pr":[{"scroll-pr":I()}],"scroll-pb":[{"scroll-pb":I()}],"scroll-pl":[{"scroll-pl":I()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",x,C]}],fill:[{fill:["none",...M()]}],"stroke-w":[{stroke:[q,$i,Un,zc]}],stroke:[{stroke:["none",...M()]}],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-x","border-w-y","border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-x","border-color-y","border-color-s","border-color-e","border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],translate:["translate-x","translate-y","translate-none"],"translate-none":["translate","translate-x","translate-y","translate-z"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]},orderSensitiveModifiers:["*","**","after","backdrop","before","details-content","file","first-letter","first-line","marker","placeholder","selection"]}},AD=aD(SD),lv=6048e5,CD=864e5,xD=6e4,DD=36e5,ND=1e3,am=Symbol.for("constructDateFrom");function Pe(n,e){return typeof n=="function"?n(e):n&&typeof n=="object"&&am in n?n[am](e):n instanceof Date?new n.constructor(e):new Date(e)}function _e(n,e){return Pe(e||n,n)}function hv(n,e,t){const r=_e(n,t==null?void 0:t.in);return isNaN(e)?Pe((t==null?void 0:t.in)||n,NaN):(e&&r.setDate(r.getDate()+e),r)}let RD={};function Ai(){return RD}function Cn(n,e){var a,c,u,l;const t=Ai(),r=(e==null?void 0:e.weekStartsOn)??((c=(a=e==null?void 0:e.locale)==null?void 0:a.options)==null?void 0:c.weekStartsOn)??t.weekStartsOn??((l=(u=t.locale)==null?void 0:u.options)==null?void 0:l.weekStartsOn)??0,i=_e(n,e==null?void 0:e.in),s=i.getDay(),o=(s<r?7:0)+s-r;return i.setDate(i.getDate()-o),i.setHours(0,0,0,0),i}function ui(n,e){return Cn(n,{...e,weekStartsOn:1})}function dv(n,e){const t=_e(n,e==null?void 0:e.in),r=t.getFullYear(),i=Pe(t,0);i.setFullYear(r+1,0,4),i.setHours(0,0,0,0);const s=ui(i),o=Pe(t,0);o.setFullYear(r,0,4),o.setHours(0,0,0,0);const a=ui(o);return t.getTime()>=s.getTime()?r+1:t.getTime()>=a.getTime()?r:r-1}function ya(n){const e=_e(n),t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()));return t.setUTCFullYear(e.getFullYear()),+n-+t}function PD(n,...e){const t=Pe.bind(null,e.find(r=>typeof r=="object"));return e.map(t)}function cm(n,e){const t=_e(n,e==null?void 0:e.in);return t.setHours(0,0,0,0),t}function OD(n,e,t){const[r,i]=PD(t==null?void 0:t.in,n,e),s=cm(r),o=cm(i),a=+s-ya(s),c=+o-ya(o);return Math.round((a-c)/CD)}function MD(n,e){const t=dv(n,e),r=Pe(n,0);return r.setFullYear(t,0,4),r.setHours(0,0,0,0),ui(r)}function LD(n){return n instanceof Date||typeof n=="object"&&Object.prototype.toString.call(n)==="[object Date]"}function FD(n){return!(!LD(n)&&typeof n!="number"||isNaN(+_e(n)))}function VD(n,e){const t=_e(n,e==null?void 0:e.in);return t.setFullYear(t.getFullYear(),0,1),t.setHours(0,0,0,0),t}const UD={lessThanXSeconds:{one:"less than a second",other:"less than {{count}} seconds"},xSeconds:{one:"1 second",other:"{{count}} seconds"},halfAMinute:"half a minute",lessThanXMinutes:{one:"less than a minute",other:"less than {{count}} minutes"},xMinutes:{one:"1 minute",other:"{{count}} minutes"},aboutXHours:{one:"about 1 hour",other:"about {{count}} hours"},xHours:{one:"1 hour",other:"{{count}} hours"},xDays:{one:"1 day",other:"{{count}} days"},aboutXWeeks:{one:"about 1 week",other:"about {{count}} weeks"},xWeeks:{one:"1 week",other:"{{count}} weeks"},aboutXMonths:{one:"about 1 month",other:"about {{count}} months"},xMonths:{one:"1 month",other:"{{count}} months"},aboutXYears:{one:"about 1 year",other:"about {{count}} years"},xYears:{one:"1 year",other:"{{count}} years"},overXYears:{one:"over 1 year",other:"over {{count}} years"},almostXYears:{one:"almost 1 year",other:"almost {{count}} years"}},BD=(n,e,t)=>{let r;const i=UD[n];return typeof i=="string"?r=i:e===1?r=i.one:r=i.other.replace("{{count}}",e.toString()),t!=null&&t.addSuffix?t.comparison&&t.comparison>0?"in "+r:r+" ago":r};function jc(n){return(e={})=>{const t=e.width?String(e.width):n.defaultWidth;return n.formats[t]||n.formats[n.defaultWidth]}}const qD={full:"EEEE, MMMM do, y",long:"MMMM do, y",medium:"MMM d, y",short:"MM/dd/yyyy"},$D={full:"h:mm:ss a zzzz",long:"h:mm:ss a z",medium:"h:mm:ss a",short:"h:mm a"},zD={full:"{{date}} 'at' {{time}}",long:"{{date}} 'at' {{time}}",medium:"{{date}}, {{time}}",short:"{{date}}, {{time}}"},jD={date:jc({formats:qD,defaultWidth:"full"}),time:jc({formats:$D,defaultWidth:"full"}),dateTime:jc({formats:zD,defaultWidth:"full"})},GD={lastWeek:"'last' eeee 'at' p",yesterday:"'yesterday at' p",today:"'today at' p",tomorrow:"'tomorrow at' p",nextWeek:"eeee 'at' p",other:"P"},WD=(n,e,t,r)=>GD[n];function zi(n){return(e,t)=>{const r=t!=null&&t.context?String(t.context):"standalone";let i;if(r==="formatting"&&n.formattingValues){const o=n.defaultFormattingWidth||n.defaultWidth,a=t!=null&&t.width?String(t.width):o;i=n.formattingValues[a]||n.formattingValues[o]}else{const o=n.defaultWidth,a=t!=null&&t.width?String(t.width):n.defaultWidth;i=n.values[a]||n.values[o]}const s=n.argumentCallback?n.argumentCallback(e):e;return i[s]}}const HD={narrow:["B","A"],abbreviated:["BC","AD"],wide:["Before Christ","Anno Domini"]},KD={narrow:["1","2","3","4"],abbreviated:["Q1","Q2","Q3","Q4"],wide:["1st quarter","2nd quarter","3rd quarter","4th quarter"]},YD={narrow:["J","F","M","A","M","J","J","A","S","O","N","D"],abbreviated:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],wide:["January","February","March","April","May","June","July","August","September","October","November","December"]},QD={narrow:["S","M","T","W","T","F","S"],short:["Su","Mo","Tu","We","Th","Fr","Sa"],abbreviated:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],wide:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},XD={narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"}},JD={narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"}},ZD=(n,e)=>{const t=Number(n),r=t%100;if(r>20||r<10)switch(r%10){case 1:return t+"st";case 2:return t+"nd";case 3:return t+"rd"}return t+"th"},eN={ordinalNumber:ZD,era:zi({values:HD,defaultWidth:"wide"}),quarter:zi({values:KD,defaultWidth:"wide",argumentCallback:n=>n-1}),month:zi({values:YD,defaultWidth:"wide"}),day:zi({values:QD,defaultWidth:"wide"}),dayPeriod:zi({values:XD,defaultWidth:"wide",formattingValues:JD,defaultFormattingWidth:"wide"})};function ji(n){return(e,t={})=>{const r=t.width,i=r&&n.matchPatterns[r]||n.matchPatterns[n.defaultMatchWidth],s=e.match(i);if(!s)return null;const o=s[0],a=r&&n.parsePatterns[r]||n.parsePatterns[n.defaultParseWidth],c=Array.isArray(a)?nN(a,h=>h.test(o)):tN(a,h=>h.test(o));let u;u=n.valueCallback?n.valueCallback(c):c,u=t.valueCallback?t.valueCallback(u):u;const l=e.slice(o.length);return{value:u,rest:l}}}function tN(n,e){for(const t in n)if(Object.prototype.hasOwnProperty.call(n,t)&&e(n[t]))return t}function nN(n,e){for(let t=0;t<n.length;t++)if(e(n[t]))return t}function rN(n){return(e,t={})=>{const r=e.match(n.matchPattern);if(!r)return null;const i=r[0],s=e.match(n.parsePattern);if(!s)return null;let o=n.valueCallback?n.valueCallback(s[0]):s[0];o=t.valueCallback?t.valueCallback(o):o;const a=e.slice(i.length);return{value:o,rest:a}}}const iN=/^(\d+)(th|st|nd|rd)?/i,sN=/\d+/i,oN={narrow:/^(b|a)/i,abbreviated:/^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,wide:/^(before christ|before common era|anno domini|common era)/i},aN={any:[/^b/i,/^(a|c)/i]},cN={narrow:/^[1234]/i,abbreviated:/^q[1234]/i,wide:/^[1234](th|st|nd|rd)? quarter/i},uN={any:[/1/i,/2/i,/3/i,/4/i]},lN={narrow:/^[jfmasond]/i,abbreviated:/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,wide:/^(january|february|march|april|may|june|july|august|september|october|november|december)/i},hN={narrow:[/^j/i,/^f/i,/^m/i,/^a/i,/^m/i,/^j/i,/^j/i,/^a/i,/^s/i,/^o/i,/^n/i,/^d/i],any:[/^ja/i,/^f/i,/^mar/i,/^ap/i,/^may/i,/^jun/i,/^jul/i,/^au/i,/^s/i,/^o/i,/^n/i,/^d/i]},dN={narrow:/^[smtwf]/i,short:/^(su|mo|tu|we|th|fr|sa)/i,abbreviated:/^(sun|mon|tue|wed|thu|fri|sat)/i,wide:/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i},fN={narrow:[/^s/i,/^m/i,/^t/i,/^w/i,/^t/i,/^f/i,/^s/i],any:[/^su/i,/^m/i,/^tu/i,/^w/i,/^th/i,/^f/i,/^sa/i]},mN={narrow:/^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,any:/^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i},gN={any:{am:/^a/i,pm:/^p/i,midnight:/^mi/i,noon:/^no/i,morning:/morning/i,afternoon:/afternoon/i,evening:/evening/i,night:/night/i}},pN={ordinalNumber:rN({matchPattern:iN,parsePattern:sN,valueCallback:n=>parseInt(n,10)}),era:ji({matchPatterns:oN,defaultMatchWidth:"wide",parsePatterns:aN,defaultParseWidth:"any"}),quarter:ji({matchPatterns:cN,defaultMatchWidth:"wide",parsePatterns:uN,defaultParseWidth:"any",valueCallback:n=>n+1}),month:ji({matchPatterns:lN,defaultMatchWidth:"wide",parsePatterns:hN,defaultParseWidth:"any"}),day:ji({matchPatterns:dN,defaultMatchWidth:"wide",parsePatterns:fN,defaultParseWidth:"any"}),dayPeriod:ji({matchPatterns:mN,defaultMatchWidth:"any",parsePatterns:gN,defaultParseWidth:"any"})},fv={code:"en-US",formatDistance:BD,formatLong:jD,formatRelative:WD,localize:eN,match:pN,options:{weekStartsOn:0,firstWeekContainsDate:1}};function yN(n,e){const t=_e(n,e==null?void 0:e.in);return OD(t,VD(t))+1}function mv(n,e){const t=_e(n,e==null?void 0:e.in),r=+ui(t)-+MD(t);return Math.round(r/lv)+1}function Bh(n,e){var l,h,d,f;const t=_e(n,e==null?void 0:e.in),r=t.getFullYear(),i=Ai(),s=(e==null?void 0:e.firstWeekContainsDate)??((h=(l=e==null?void 0:e.locale)==null?void 0:l.options)==null?void 0:h.firstWeekContainsDate)??i.firstWeekContainsDate??((f=(d=i.locale)==null?void 0:d.options)==null?void 0:f.firstWeekContainsDate)??1,o=Pe((e==null?void 0:e.in)||n,0);o.setFullYear(r+1,0,s),o.setHours(0,0,0,0);const a=Cn(o,e),c=Pe((e==null?void 0:e.in)||n,0);c.setFullYear(r,0,s),c.setHours(0,0,0,0);const u=Cn(c,e);return+t>=+a?r+1:+t>=+u?r:r-1}function wN(n,e){var a,c,u,l;const t=Ai(),r=(e==null?void 0:e.firstWeekContainsDate)??((c=(a=e==null?void 0:e.locale)==null?void 0:a.options)==null?void 0:c.firstWeekContainsDate)??t.firstWeekContainsDate??((l=(u=t.locale)==null?void 0:u.options)==null?void 0:l.firstWeekContainsDate)??1,i=Bh(n,e),s=Pe((e==null?void 0:e.in)||n,0);return s.setFullYear(i,0,r),s.setHours(0,0,0,0),Cn(s,e)}function gv(n,e){const t=_e(n,e==null?void 0:e.in),r=+Cn(t,e)-+wN(t,e);return Math.round(r/lv)+1}function X(n,e){const t=n<0?"-":"",r=Math.abs(n).toString().padStart(e,"0");return t+r}const ln={y(n,e){const t=n.getFullYear(),r=t>0?t:1-t;return X(e==="yy"?r%100:r,e.length)},M(n,e){const t=n.getMonth();return e==="M"?String(t+1):X(t+1,2)},d(n,e){return X(n.getDate(),e.length)},a(n,e){const t=n.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return t.toUpperCase();case"aaa":return t;case"aaaaa":return t[0];case"aaaa":default:return t==="am"?"a.m.":"p.m."}},h(n,e){return X(n.getHours()%12||12,e.length)},H(n,e){return X(n.getHours(),e.length)},m(n,e){return X(n.getMinutes(),e.length)},s(n,e){return X(n.getSeconds(),e.length)},S(n,e){const t=e.length,r=n.getMilliseconds(),i=Math.trunc(r*Math.pow(10,t-3));return X(i,e.length)}},Rr={midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},um={G:function(n,e,t){const r=n.getFullYear()>0?1:0;switch(e){case"G":case"GG":case"GGG":return t.era(r,{width:"abbreviated"});case"GGGGG":return t.era(r,{width:"narrow"});case"GGGG":default:return t.era(r,{width:"wide"})}},y:function(n,e,t){if(e==="yo"){const r=n.getFullYear(),i=r>0?r:1-r;return t.ordinalNumber(i,{unit:"year"})}return ln.y(n,e)},Y:function(n,e,t,r){const i=Bh(n,r),s=i>0?i:1-i;if(e==="YY"){const o=s%100;return X(o,2)}return e==="Yo"?t.ordinalNumber(s,{unit:"year"}):X(s,e.length)},R:function(n,e){const t=dv(n);return X(t,e.length)},u:function(n,e){const t=n.getFullYear();return X(t,e.length)},Q:function(n,e,t){const r=Math.ceil((n.getMonth()+1)/3);switch(e){case"Q":return String(r);case"QQ":return X(r,2);case"Qo":return t.ordinalNumber(r,{unit:"quarter"});case"QQQ":return t.quarter(r,{width:"abbreviated",context:"formatting"});case"QQQQQ":return t.quarter(r,{width:"narrow",context:"formatting"});case"QQQQ":default:return t.quarter(r,{width:"wide",context:"formatting"})}},q:function(n,e,t){const r=Math.ceil((n.getMonth()+1)/3);switch(e){case"q":return String(r);case"qq":return X(r,2);case"qo":return t.ordinalNumber(r,{unit:"quarter"});case"qqq":return t.quarter(r,{width:"abbreviated",context:"standalone"});case"qqqqq":return t.quarter(r,{width:"narrow",context:"standalone"});case"qqqq":default:return t.quarter(r,{width:"wide",context:"standalone"})}},M:function(n,e,t){const r=n.getMonth();switch(e){case"M":case"MM":return ln.M(n,e);case"Mo":return t.ordinalNumber(r+1,{unit:"month"});case"MMM":return t.month(r,{width:"abbreviated",context:"formatting"});case"MMMMM":return t.month(r,{width:"narrow",context:"formatting"});case"MMMM":default:return t.month(r,{width:"wide",context:"formatting"})}},L:function(n,e,t){const r=n.getMonth();switch(e){case"L":return String(r+1);case"LL":return X(r+1,2);case"Lo":return t.ordinalNumber(r+1,{unit:"month"});case"LLL":return t.month(r,{width:"abbreviated",context:"standalone"});case"LLLLL":return t.month(r,{width:"narrow",context:"standalone"});case"LLLL":default:return t.month(r,{width:"wide",context:"standalone"})}},w:function(n,e,t,r){const i=gv(n,r);return e==="wo"?t.ordinalNumber(i,{unit:"week"}):X(i,e.length)},I:function(n,e,t){const r=mv(n);return e==="Io"?t.ordinalNumber(r,{unit:"week"}):X(r,e.length)},d:function(n,e,t){return e==="do"?t.ordinalNumber(n.getDate(),{unit:"date"}):ln.d(n,e)},D:function(n,e,t){const r=yN(n);return e==="Do"?t.ordinalNumber(r,{unit:"dayOfYear"}):X(r,e.length)},E:function(n,e,t){const r=n.getDay();switch(e){case"E":case"EE":case"EEE":return t.day(r,{width:"abbreviated",context:"formatting"});case"EEEEE":return t.day(r,{width:"narrow",context:"formatting"});case"EEEEEE":return t.day(r,{width:"short",context:"formatting"});case"EEEE":default:return t.day(r,{width:"wide",context:"formatting"})}},e:function(n,e,t,r){const i=n.getDay(),s=(i-r.weekStartsOn+8)%7||7;switch(e){case"e":return String(s);case"ee":return X(s,2);case"eo":return t.ordinalNumber(s,{unit:"day"});case"eee":return t.day(i,{width:"abbreviated",context:"formatting"});case"eeeee":return t.day(i,{width:"narrow",context:"formatting"});case"eeeeee":return t.day(i,{width:"short",context:"formatting"});case"eeee":default:return t.day(i,{width:"wide",context:"formatting"})}},c:function(n,e,t,r){const i=n.getDay(),s=(i-r.weekStartsOn+8)%7||7;switch(e){case"c":return String(s);case"cc":return X(s,e.length);case"co":return t.ordinalNumber(s,{unit:"day"});case"ccc":return t.day(i,{width:"abbreviated",context:"standalone"});case"ccccc":return t.day(i,{width:"narrow",context:"standalone"});case"cccccc":return t.day(i,{width:"short",context:"standalone"});case"cccc":default:return t.day(i,{width:"wide",context:"standalone"})}},i:function(n,e,t){const r=n.getDay(),i=r===0?7:r;switch(e){case"i":return String(i);case"ii":return X(i,e.length);case"io":return t.ordinalNumber(i,{unit:"day"});case"iii":return t.day(r,{width:"abbreviated",context:"formatting"});case"iiiii":return t.day(r,{width:"narrow",context:"formatting"});case"iiiiii":return t.day(r,{width:"short",context:"formatting"});case"iiii":default:return t.day(r,{width:"wide",context:"formatting"})}},a:function(n,e,t){const i=n.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return t.dayPeriod(i,{width:"abbreviated",context:"formatting"});case"aaa":return t.dayPeriod(i,{width:"abbreviated",context:"formatting"}).toLowerCase();case"aaaaa":return t.dayPeriod(i,{width:"narrow",context:"formatting"});case"aaaa":default:return t.dayPeriod(i,{width:"wide",context:"formatting"})}},b:function(n,e,t){const r=n.getHours();let i;switch(r===12?i=Rr.noon:r===0?i=Rr.midnight:i=r/12>=1?"pm":"am",e){case"b":case"bb":return t.dayPeriod(i,{width:"abbreviated",context:"formatting"});case"bbb":return t.dayPeriod(i,{width:"abbreviated",context:"formatting"}).toLowerCase();case"bbbbb":return t.dayPeriod(i,{width:"narrow",context:"formatting"});case"bbbb":default:return t.dayPeriod(i,{width:"wide",context:"formatting"})}},B:function(n,e,t){const r=n.getHours();let i;switch(r>=17?i=Rr.evening:r>=12?i=Rr.afternoon:r>=4?i=Rr.morning:i=Rr.night,e){case"B":case"BB":case"BBB":return t.dayPeriod(i,{width:"abbreviated",context:"formatting"});case"BBBBB":return t.dayPeriod(i,{width:"narrow",context:"formatting"});case"BBBB":default:return t.dayPeriod(i,{width:"wide",context:"formatting"})}},h:function(n,e,t){if(e==="ho"){let r=n.getHours()%12;return r===0&&(r=12),t.ordinalNumber(r,{unit:"hour"})}return ln.h(n,e)},H:function(n,e,t){return e==="Ho"?t.ordinalNumber(n.getHours(),{unit:"hour"}):ln.H(n,e)},K:function(n,e,t){const r=n.getHours()%12;return e==="Ko"?t.ordinalNumber(r,{unit:"hour"}):X(r,e.length)},k:function(n,e,t){let r=n.getHours();return r===0&&(r=24),e==="ko"?t.ordinalNumber(r,{unit:"hour"}):X(r,e.length)},m:function(n,e,t){return e==="mo"?t.ordinalNumber(n.getMinutes(),{unit:"minute"}):ln.m(n,e)},s:function(n,e,t){return e==="so"?t.ordinalNumber(n.getSeconds(),{unit:"second"}):ln.s(n,e)},S:function(n,e){return ln.S(n,e)},X:function(n,e,t){const r=n.getTimezoneOffset();if(r===0)return"Z";switch(e){case"X":return hm(r);case"XXXX":case"XX":return $n(r);case"XXXXX":case"XXX":default:return $n(r,":")}},x:function(n,e,t){const r=n.getTimezoneOffset();switch(e){case"x":return hm(r);case"xxxx":case"xx":return $n(r);case"xxxxx":case"xxx":default:return $n(r,":")}},O:function(n,e,t){const r=n.getTimezoneOffset();switch(e){case"O":case"OO":case"OOO":return"GMT"+lm(r,":");case"OOOO":default:return"GMT"+$n(r,":")}},z:function(n,e,t){const r=n.getTimezoneOffset();switch(e){case"z":case"zz":case"zzz":return"GMT"+lm(r,":");case"zzzz":default:return"GMT"+$n(r,":")}},t:function(n,e,t){const r=Math.trunc(+n/1e3);return X(r,e.length)},T:function(n,e,t){return X(+n,e.length)}};function lm(n,e=""){const t=n>0?"-":"+",r=Math.abs(n),i=Math.trunc(r/60),s=r%60;return s===0?t+String(i):t+String(i)+e+X(s,2)}function hm(n,e){return n%60===0?(n>0?"-":"+")+X(Math.abs(n)/60,2):$n(n,e)}function $n(n,e=""){const t=n>0?"-":"+",r=Math.abs(n),i=X(Math.trunc(r/60),2),s=X(r%60,2);return t+i+e+s}const dm=(n,e)=>{switch(n){case"P":return e.date({width:"short"});case"PP":return e.date({width:"medium"});case"PPP":return e.date({width:"long"});case"PPPP":default:return e.date({width:"full"})}},pv=(n,e)=>{switch(n){case"p":return e.time({width:"short"});case"pp":return e.time({width:"medium"});case"ppp":return e.time({width:"long"});case"pppp":default:return e.time({width:"full"})}},vN=(n,e)=>{const t=n.match(/(P+)(p+)?/)||[],r=t[1],i=t[2];if(!i)return dm(n,e);let s;switch(r){case"P":s=e.dateTime({width:"short"});break;case"PP":s=e.dateTime({width:"medium"});break;case"PPP":s=e.dateTime({width:"long"});break;case"PPPP":default:s=e.dateTime({width:"full"});break}return s.replace("{{date}}",dm(r,e)).replace("{{time}}",pv(i,e))},zu={p:pv,P:vN},bN=/^D+$/,IN=/^Y+$/,_N=["D","DD","YY","YYYY"];function yv(n){return bN.test(n)}function wv(n){return IN.test(n)}function ju(n,e,t){const r=EN(n,e,t);if(console.warn(r),_N.includes(n))throw new RangeError(r)}function EN(n,e,t){const r=n[0]==="Y"?"years":"days of the month";return`Use \`${n.toLowerCase()}\` instead of \`${n}\` (in \`${e}\`) for formatting ${r} to the input \`${t}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`}const TN=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,kN=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,SN=/^'([^]*?)'?$/,AN=/''/g,CN=/[a-zA-Z]/;function Ci(n,e,t){var l,h,d,f,p,v,E,L;const r=Ai(),i=(t==null?void 0:t.locale)??r.locale??fv,s=(t==null?void 0:t.firstWeekContainsDate)??((h=(l=t==null?void 0:t.locale)==null?void 0:l.options)==null?void 0:h.firstWeekContainsDate)??r.firstWeekContainsDate??((f=(d=r.locale)==null?void 0:d.options)==null?void 0:f.firstWeekContainsDate)??1,o=(t==null?void 0:t.weekStartsOn)??((v=(p=t==null?void 0:t.locale)==null?void 0:p.options)==null?void 0:v.weekStartsOn)??r.weekStartsOn??((L=(E=r.locale)==null?void 0:E.options)==null?void 0:L.weekStartsOn)??0,a=_e(n,t==null?void 0:t.in);if(!FD(a))throw new RangeError("Invalid time value");let c=e.match(kN).map(O=>{const D=O[0];if(D==="p"||D==="P"){const z=zu[D];return z(O,i.formatLong)}return O}).join("").match(TN).map(O=>{if(O==="''")return{isToken:!1,value:"'"};const D=O[0];if(D==="'")return{isToken:!1,value:xN(O)};if(um[D])return{isToken:!0,value:O};if(D.match(CN))throw new RangeError("Format string contains an unescaped latin alphabet character `"+D+"`");return{isToken:!1,value:O}});i.localize.preprocessor&&(c=i.localize.preprocessor(a,c));const u={firstWeekContainsDate:s,weekStartsOn:o,locale:i};return c.map(O=>{if(!O.isToken)return O.value;const D=O.value;(!(t!=null&&t.useAdditionalWeekYearTokens)&&wv(D)||!(t!=null&&t.useAdditionalDayOfYearTokens)&&yv(D))&&ju(D,e,String(n));const z=um[D[0]];return z(a,D,i.localize,u)}).join("")}function xN(n){const e=n.match(SN);return e?e[1].replace(AN,"'"):n}function DN(){return Object.assign({},Ai())}function NN(n,e){const t=_e(n,e==null?void 0:e.in).getDay();return t===0?7:t}function RN(n,e){const t=PN(e)?new e(0):Pe(e,0);return t.setFullYear(n.getFullYear(),n.getMonth(),n.getDate()),t.setHours(n.getHours(),n.getMinutes(),n.getSeconds(),n.getMilliseconds()),t}function PN(n){var e;return typeof n=="function"&&((e=n.prototype)==null?void 0:e.constructor)===n}const ON=10;class vv{constructor(){S(this,"subPriority",0)}validate(e,t){return!0}}class MN extends vv{constructor(e,t,r,i,s){super(),this.value=e,this.validateValue=t,this.setValue=r,this.priority=i,s&&(this.subPriority=s)}validate(e,t){return this.validateValue(e,this.value,t)}set(e,t,r){return this.setValue(e,t,this.value,r)}}class LN extends vv{constructor(t,r){super();S(this,"priority",ON);S(this,"subPriority",-1);this.context=t||(i=>Pe(r,i))}set(t,r){return r.timestampIsSet?t:Pe(t,RN(t,this.context))}}class Q{run(e,t,r,i){const s=this.parse(e,t,r,i);return s?{setter:new MN(s.value,this.validate,this.set,this.priority,this.subPriority),rest:s.rest}:null}validate(e,t,r){return!0}}class FN extends Q{constructor(){super(...arguments);S(this,"priority",140);S(this,"incompatibleTokens",["R","u","t","T"])}parse(t,r,i){switch(r){case"G":case"GG":case"GGG":return i.era(t,{width:"abbreviated"})||i.era(t,{width:"narrow"});case"GGGGG":return i.era(t,{width:"narrow"});case"GGGG":default:return i.era(t,{width:"wide"})||i.era(t,{width:"abbreviated"})||i.era(t,{width:"narrow"})}}set(t,r,i){return r.era=i,t.setFullYear(i,0,1),t.setHours(0,0,0,0),t}}const pe={month:/^(1[0-2]|0?\d)/,date:/^(3[0-1]|[0-2]?\d)/,dayOfYear:/^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,week:/^(5[0-3]|[0-4]?\d)/,hour23h:/^(2[0-3]|[0-1]?\d)/,hour24h:/^(2[0-4]|[0-1]?\d)/,hour11h:/^(1[0-1]|0?\d)/,hour12h:/^(1[0-2]|0?\d)/,minute:/^[0-5]?\d/,second:/^[0-5]?\d/,singleDigit:/^\d/,twoDigits:/^\d{1,2}/,threeDigits:/^\d{1,3}/,fourDigits:/^\d{1,4}/,anyDigitsSigned:/^-?\d+/,singleDigitSigned:/^-?\d/,twoDigitsSigned:/^-?\d{1,2}/,threeDigitsSigned:/^-?\d{1,3}/,fourDigitsSigned:/^-?\d{1,4}/},At={basicOptionalMinutes:/^([+-])(\d{2})(\d{2})?|Z/,basic:/^([+-])(\d{2})(\d{2})|Z/,basicOptionalSeconds:/^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,extended:/^([+-])(\d{2}):(\d{2})|Z/,extendedOptionalSeconds:/^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/};function ye(n,e){return n&&{value:e(n.value),rest:n.rest}}function ce(n,e){const t=e.match(n);return t?{value:parseInt(t[0],10),rest:e.slice(t[0].length)}:null}function Ct(n,e){const t=e.match(n);if(!t)return null;if(t[0]==="Z")return{value:0,rest:e.slice(1)};const r=t[1]==="+"?1:-1,i=t[2]?parseInt(t[2],10):0,s=t[3]?parseInt(t[3],10):0,o=t[5]?parseInt(t[5],10):0;return{value:r*(i*DD+s*xD+o*ND),rest:e.slice(t[0].length)}}function bv(n){return ce(pe.anyDigitsSigned,n)}function fe(n,e){switch(n){case 1:return ce(pe.singleDigit,e);case 2:return ce(pe.twoDigits,e);case 3:return ce(pe.threeDigits,e);case 4:return ce(pe.fourDigits,e);default:return ce(new RegExp("^\\d{1,"+n+"}"),e)}}function wa(n,e){switch(n){case 1:return ce(pe.singleDigitSigned,e);case 2:return ce(pe.twoDigitsSigned,e);case 3:return ce(pe.threeDigitsSigned,e);case 4:return ce(pe.fourDigitsSigned,e);default:return ce(new RegExp("^-?\\d{1,"+n+"}"),e)}}function qh(n){switch(n){case"morning":return 4;case"evening":return 17;case"pm":case"noon":case"afternoon":return 12;case"am":case"midnight":case"night":default:return 0}}function Iv(n,e){const t=e>0,r=t?e:1-e;let i;if(r<=50)i=n||100;else{const s=r+50,o=Math.trunc(s/100)*100,a=n>=s%100;i=n+o-(a?100:0)}return t?i:1-i}function _v(n){return n%400===0||n%4===0&&n%100!==0}class VN extends Q{constructor(){super(...arguments);S(this,"priority",130);S(this,"incompatibleTokens",["Y","R","u","w","I","i","e","c","t","T"])}parse(t,r,i){const s=o=>({year:o,isTwoDigitYear:r==="yy"});switch(r){case"y":return ye(fe(4,t),s);case"yo":return ye(i.ordinalNumber(t,{unit:"year"}),s);default:return ye(fe(r.length,t),s)}}validate(t,r){return r.isTwoDigitYear||r.year>0}set(t,r,i){const s=t.getFullYear();if(i.isTwoDigitYear){const a=Iv(i.year,s);return t.setFullYear(a,0,1),t.setHours(0,0,0,0),t}const o=!("era"in r)||r.era===1?i.year:1-i.year;return t.setFullYear(o,0,1),t.setHours(0,0,0,0),t}}class UN extends Q{constructor(){super(...arguments);S(this,"priority",130);S(this,"incompatibleTokens",["y","R","u","Q","q","M","L","I","d","D","i","t","T"])}parse(t,r,i){const s=o=>({year:o,isTwoDigitYear:r==="YY"});switch(r){case"Y":return ye(fe(4,t),s);case"Yo":return ye(i.ordinalNumber(t,{unit:"year"}),s);default:return ye(fe(r.length,t),s)}}validate(t,r){return r.isTwoDigitYear||r.year>0}set(t,r,i,s){const o=Bh(t,s);if(i.isTwoDigitYear){const c=Iv(i.year,o);return t.setFullYear(c,0,s.firstWeekContainsDate),t.setHours(0,0,0,0),Cn(t,s)}const a=!("era"in r)||r.era===1?i.year:1-i.year;return t.setFullYear(a,0,s.firstWeekContainsDate),t.setHours(0,0,0,0),Cn(t,s)}}class BN extends Q{constructor(){super(...arguments);S(this,"priority",130);S(this,"incompatibleTokens",["G","y","Y","u","Q","q","M","L","w","d","D","e","c","t","T"])}parse(t,r){return wa(r==="R"?4:r.length,t)}set(t,r,i){const s=Pe(t,0);return s.setFullYear(i,0,4),s.setHours(0,0,0,0),ui(s)}}class qN extends Q{constructor(){super(...arguments);S(this,"priority",130);S(this,"incompatibleTokens",["G","y","Y","R","w","I","i","e","c","t","T"])}parse(t,r){return wa(r==="u"?4:r.length,t)}set(t,r,i){return t.setFullYear(i,0,1),t.setHours(0,0,0,0),t}}class $N extends Q{constructor(){super(...arguments);S(this,"priority",120);S(this,"incompatibleTokens",["Y","R","q","M","L","w","I","d","D","i","e","c","t","T"])}parse(t,r,i){switch(r){case"Q":case"QQ":return fe(r.length,t);case"Qo":return i.ordinalNumber(t,{unit:"quarter"});case"QQQ":return i.quarter(t,{width:"abbreviated",context:"formatting"})||i.quarter(t,{width:"narrow",context:"formatting"});case"QQQQQ":return i.quarter(t,{width:"narrow",context:"formatting"});case"QQQQ":default:return i.quarter(t,{width:"wide",context:"formatting"})||i.quarter(t,{width:"abbreviated",context:"formatting"})||i.quarter(t,{width:"narrow",context:"formatting"})}}validate(t,r){return r>=1&&r<=4}set(t,r,i){return t.setMonth((i-1)*3,1),t.setHours(0,0,0,0),t}}class zN extends Q{constructor(){super(...arguments);S(this,"priority",120);S(this,"incompatibleTokens",["Y","R","Q","M","L","w","I","d","D","i","e","c","t","T"])}parse(t,r,i){switch(r){case"q":case"qq":return fe(r.length,t);case"qo":return i.ordinalNumber(t,{unit:"quarter"});case"qqq":return i.quarter(t,{width:"abbreviated",context:"standalone"})||i.quarter(t,{width:"narrow",context:"standalone"});case"qqqqq":return i.quarter(t,{width:"narrow",context:"standalone"});case"qqqq":default:return i.quarter(t,{width:"wide",context:"standalone"})||i.quarter(t,{width:"abbreviated",context:"standalone"})||i.quarter(t,{width:"narrow",context:"standalone"})}}validate(t,r){return r>=1&&r<=4}set(t,r,i){return t.setMonth((i-1)*3,1),t.setHours(0,0,0,0),t}}class jN extends Q{constructor(){super(...arguments);S(this,"incompatibleTokens",["Y","R","q","Q","L","w","I","D","i","e","c","t","T"]);S(this,"priority",110)}parse(t,r,i){const s=o=>o-1;switch(r){case"M":return ye(ce(pe.month,t),s);case"MM":return ye(fe(2,t),s);case"Mo":return ye(i.ordinalNumber(t,{unit:"month"}),s);case"MMM":return i.month(t,{width:"abbreviated",context:"formatting"})||i.month(t,{width:"narrow",context:"formatting"});case"MMMMM":return i.month(t,{width:"narrow",context:"formatting"});case"MMMM":default:return i.month(t,{width:"wide",context:"formatting"})||i.month(t,{width:"abbreviated",context:"formatting"})||i.month(t,{width:"narrow",context:"formatting"})}}validate(t,r){return r>=0&&r<=11}set(t,r,i){return t.setMonth(i,1),t.setHours(0,0,0,0),t}}class GN extends Q{constructor(){super(...arguments);S(this,"priority",110);S(this,"incompatibleTokens",["Y","R","q","Q","M","w","I","D","i","e","c","t","T"])}parse(t,r,i){const s=o=>o-1;switch(r){case"L":return ye(ce(pe.month,t),s);case"LL":return ye(fe(2,t),s);case"Lo":return ye(i.ordinalNumber(t,{unit:"month"}),s);case"LLL":return i.month(t,{width:"abbreviated",context:"standalone"})||i.month(t,{width:"narrow",context:"standalone"});case"LLLLL":return i.month(t,{width:"narrow",context:"standalone"});case"LLLL":default:return i.month(t,{width:"wide",context:"standalone"})||i.month(t,{width:"abbreviated",context:"standalone"})||i.month(t,{width:"narrow",context:"standalone"})}}validate(t,r){return r>=0&&r<=11}set(t,r,i){return t.setMonth(i,1),t.setHours(0,0,0,0),t}}function WN(n,e,t){const r=_e(n,t==null?void 0:t.in),i=gv(r,t)-e;return r.setDate(r.getDate()-i*7),_e(r,t==null?void 0:t.in)}class HN extends Q{constructor(){super(...arguments);S(this,"priority",100);S(this,"incompatibleTokens",["y","R","u","q","Q","M","L","I","d","D","i","t","T"])}parse(t,r,i){switch(r){case"w":return ce(pe.week,t);case"wo":return i.ordinalNumber(t,{unit:"week"});default:return fe(r.length,t)}}validate(t,r){return r>=1&&r<=53}set(t,r,i,s){return Cn(WN(t,i,s),s)}}function KN(n,e,t){const r=_e(n,t==null?void 0:t.in),i=mv(r,t)-e;return r.setDate(r.getDate()-i*7),r}class YN extends Q{constructor(){super(...arguments);S(this,"priority",100);S(this,"incompatibleTokens",["y","Y","u","q","Q","M","L","w","d","D","e","c","t","T"])}parse(t,r,i){switch(r){case"I":return ce(pe.week,t);case"Io":return i.ordinalNumber(t,{unit:"week"});default:return fe(r.length,t)}}validate(t,r){return r>=1&&r<=53}set(t,r,i){return ui(KN(t,i))}}const QN=[31,28,31,30,31,30,31,31,30,31,30,31],XN=[31,29,31,30,31,30,31,31,30,31,30,31];class JN extends Q{constructor(){super(...arguments);S(this,"priority",90);S(this,"subPriority",1);S(this,"incompatibleTokens",["Y","R","q","Q","w","I","D","i","e","c","t","T"])}parse(t,r,i){switch(r){case"d":return ce(pe.date,t);case"do":return i.ordinalNumber(t,{unit:"date"});default:return fe(r.length,t)}}validate(t,r){const i=t.getFullYear(),s=_v(i),o=t.getMonth();return s?r>=1&&r<=XN[o]:r>=1&&r<=QN[o]}set(t,r,i){return t.setDate(i),t.setHours(0,0,0,0),t}}class ZN extends Q{constructor(){super(...arguments);S(this,"priority",90);S(this,"subpriority",1);S(this,"incompatibleTokens",["Y","R","q","Q","M","L","w","I","d","E","i","e","c","t","T"])}parse(t,r,i){switch(r){case"D":case"DD":return ce(pe.dayOfYear,t);case"Do":return i.ordinalNumber(t,{unit:"date"});default:return fe(r.length,t)}}validate(t,r){const i=t.getFullYear();return _v(i)?r>=1&&r<=366:r>=1&&r<=365}set(t,r,i){return t.setMonth(0,i),t.setHours(0,0,0,0),t}}function $h(n,e,t){var h,d,f,p;const r=Ai(),i=(t==null?void 0:t.weekStartsOn)??((d=(h=t==null?void 0:t.locale)==null?void 0:h.options)==null?void 0:d.weekStartsOn)??r.weekStartsOn??((p=(f=r.locale)==null?void 0:f.options)==null?void 0:p.weekStartsOn)??0,s=_e(n,t==null?void 0:t.in),o=s.getDay(),c=(e%7+7)%7,u=7-i,l=e<0||e>6?e-(o+u)%7:(c+u)%7-(o+u)%7;return hv(s,l,t)}class eR extends Q{constructor(){super(...arguments);S(this,"priority",90);S(this,"incompatibleTokens",["D","i","e","c","t","T"])}parse(t,r,i){switch(r){case"E":case"EE":case"EEE":return i.day(t,{width:"abbreviated",context:"formatting"})||i.day(t,{width:"short",context:"formatting"})||i.day(t,{width:"narrow",context:"formatting"});case"EEEEE":return i.day(t,{width:"narrow",context:"formatting"});case"EEEEEE":return i.day(t,{width:"short",context:"formatting"})||i.day(t,{width:"narrow",context:"formatting"});case"EEEE":default:return i.day(t,{width:"wide",context:"formatting"})||i.day(t,{width:"abbreviated",context:"formatting"})||i.day(t,{width:"short",context:"formatting"})||i.day(t,{width:"narrow",context:"formatting"})}}validate(t,r){return r>=0&&r<=6}set(t,r,i,s){return t=$h(t,i,s),t.setHours(0,0,0,0),t}}class tR extends Q{constructor(){super(...arguments);S(this,"priority",90);S(this,"incompatibleTokens",["y","R","u","q","Q","M","L","I","d","D","E","i","c","t","T"])}parse(t,r,i,s){const o=a=>{const c=Math.floor((a-1)/7)*7;return(a+s.weekStartsOn+6)%7+c};switch(r){case"e":case"ee":return ye(fe(r.length,t),o);case"eo":return ye(i.ordinalNumber(t,{unit:"day"}),o);case"eee":return i.day(t,{width:"abbreviated",context:"formatting"})||i.day(t,{width:"short",context:"formatting"})||i.day(t,{width:"narrow",context:"formatting"});case"eeeee":return i.day(t,{width:"narrow",context:"formatting"});case"eeeeee":return i.day(t,{width:"short",context:"formatting"})||i.day(t,{width:"narrow",context:"formatting"});case"eeee":default:return i.day(t,{width:"wide",context:"formatting"})||i.day(t,{width:"abbreviated",context:"formatting"})||i.day(t,{width:"short",context:"formatting"})||i.day(t,{width:"narrow",context:"formatting"})}}validate(t,r){return r>=0&&r<=6}set(t,r,i,s){return t=$h(t,i,s),t.setHours(0,0,0,0),t}}class nR extends Q{constructor(){super(...arguments);S(this,"priority",90);S(this,"incompatibleTokens",["y","R","u","q","Q","M","L","I","d","D","E","i","e","t","T"])}parse(t,r,i,s){const o=a=>{const c=Math.floor((a-1)/7)*7;return(a+s.weekStartsOn+6)%7+c};switch(r){case"c":case"cc":return ye(fe(r.length,t),o);case"co":return ye(i.ordinalNumber(t,{unit:"day"}),o);case"ccc":return i.day(t,{width:"abbreviated",context:"standalone"})||i.day(t,{width:"short",context:"standalone"})||i.day(t,{width:"narrow",context:"standalone"});case"ccccc":return i.day(t,{width:"narrow",context:"standalone"});case"cccccc":return i.day(t,{width:"short",context:"standalone"})||i.day(t,{width:"narrow",context:"standalone"});case"cccc":default:return i.day(t,{width:"wide",context:"standalone"})||i.day(t,{width:"abbreviated",context:"standalone"})||i.day(t,{width:"short",context:"standalone"})||i.day(t,{width:"narrow",context:"standalone"})}}validate(t,r){return r>=0&&r<=6}set(t,r,i,s){return t=$h(t,i,s),t.setHours(0,0,0,0),t}}function rR(n,e,t){const r=_e(n,t==null?void 0:t.in),i=NN(r,t),s=e-i;return hv(r,s,t)}class iR extends Q{constructor(){super(...arguments);S(this,"priority",90);S(this,"incompatibleTokens",["y","Y","u","q","Q","M","L","w","d","D","E","e","c","t","T"])}parse(t,r,i){const s=o=>o===0?7:o;switch(r){case"i":case"ii":return fe(r.length,t);case"io":return i.ordinalNumber(t,{unit:"day"});case"iii":return ye(i.day(t,{width:"abbreviated",context:"formatting"})||i.day(t,{width:"short",context:"formatting"})||i.day(t,{width:"narrow",context:"formatting"}),s);case"iiiii":return ye(i.day(t,{width:"narrow",context:"formatting"}),s);case"iiiiii":return ye(i.day(t,{width:"short",context:"formatting"})||i.day(t,{width:"narrow",context:"formatting"}),s);case"iiii":default:return ye(i.day(t,{width:"wide",context:"formatting"})||i.day(t,{width:"abbreviated",context:"formatting"})||i.day(t,{width:"short",context:"formatting"})||i.day(t,{width:"narrow",context:"formatting"}),s)}}validate(t,r){return r>=1&&r<=7}set(t,r,i){return t=rR(t,i),t.setHours(0,0,0,0),t}}class sR extends Q{constructor(){super(...arguments);S(this,"priority",80);S(this,"incompatibleTokens",["b","B","H","k","t","T"])}parse(t,r,i){switch(r){case"a":case"aa":case"aaa":return i.dayPeriod(t,{width:"abbreviated",context:"formatting"})||i.dayPeriod(t,{width:"narrow",context:"formatting"});case"aaaaa":return i.dayPeriod(t,{width:"narrow",context:"formatting"});case"aaaa":default:return i.dayPeriod(t,{width:"wide",context:"formatting"})||i.dayPeriod(t,{width:"abbreviated",context:"formatting"})||i.dayPeriod(t,{width:"narrow",context:"formatting"})}}set(t,r,i){return t.setHours(qh(i),0,0,0),t}}class oR extends Q{constructor(){super(...arguments);S(this,"priority",80);S(this,"incompatibleTokens",["a","B","H","k","t","T"])}parse(t,r,i){switch(r){case"b":case"bb":case"bbb":return i.dayPeriod(t,{width:"abbreviated",context:"formatting"})||i.dayPeriod(t,{width:"narrow",context:"formatting"});case"bbbbb":return i.dayPeriod(t,{width:"narrow",context:"formatting"});case"bbbb":default:return i.dayPeriod(t,{width:"wide",context:"formatting"})||i.dayPeriod(t,{width:"abbreviated",context:"formatting"})||i.dayPeriod(t,{width:"narrow",context:"formatting"})}}set(t,r,i){return t.setHours(qh(i),0,0,0),t}}class aR extends Q{constructor(){super(...arguments);S(this,"priority",80);S(this,"incompatibleTokens",["a","b","t","T"])}parse(t,r,i){switch(r){case"B":case"BB":case"BBB":return i.dayPeriod(t,{width:"abbreviated",context:"formatting"})||i.dayPeriod(t,{width:"narrow",context:"formatting"});case"BBBBB":return i.dayPeriod(t,{width:"narrow",context:"formatting"});case"BBBB":default:return i.dayPeriod(t,{width:"wide",context:"formatting"})||i.dayPeriod(t,{width:"abbreviated",context:"formatting"})||i.dayPeriod(t,{width:"narrow",context:"formatting"})}}set(t,r,i){return t.setHours(qh(i),0,0,0),t}}class cR extends Q{constructor(){super(...arguments);S(this,"priority",70);S(this,"incompatibleTokens",["H","K","k","t","T"])}parse(t,r,i){switch(r){case"h":return ce(pe.hour12h,t);case"ho":return i.ordinalNumber(t,{unit:"hour"});default:return fe(r.length,t)}}validate(t,r){return r>=1&&r<=12}set(t,r,i){const s=t.getHours()>=12;return s&&i<12?t.setHours(i+12,0,0,0):!s&&i===12?t.setHours(0,0,0,0):t.setHours(i,0,0,0),t}}class uR extends Q{constructor(){super(...arguments);S(this,"priority",70);S(this,"incompatibleTokens",["a","b","h","K","k","t","T"])}parse(t,r,i){switch(r){case"H":return ce(pe.hour23h,t);case"Ho":return i.ordinalNumber(t,{unit:"hour"});default:return fe(r.length,t)}}validate(t,r){return r>=0&&r<=23}set(t,r,i){return t.setHours(i,0,0,0),t}}class lR extends Q{constructor(){super(...arguments);S(this,"priority",70);S(this,"incompatibleTokens",["h","H","k","t","T"])}parse(t,r,i){switch(r){case"K":return ce(pe.hour11h,t);case"Ko":return i.ordinalNumber(t,{unit:"hour"});default:return fe(r.length,t)}}validate(t,r){return r>=0&&r<=11}set(t,r,i){return t.getHours()>=12&&i<12?t.setHours(i+12,0,0,0):t.setHours(i,0,0,0),t}}class hR extends Q{constructor(){super(...arguments);S(this,"priority",70);S(this,"incompatibleTokens",["a","b","h","H","K","t","T"])}parse(t,r,i){switch(r){case"k":return ce(pe.hour24h,t);case"ko":return i.ordinalNumber(t,{unit:"hour"});default:return fe(r.length,t)}}validate(t,r){return r>=1&&r<=24}set(t,r,i){const s=i<=24?i%24:i;return t.setHours(s,0,0,0),t}}class dR extends Q{constructor(){super(...arguments);S(this,"priority",60);S(this,"incompatibleTokens",["t","T"])}parse(t,r,i){switch(r){case"m":return ce(pe.minute,t);case"mo":return i.ordinalNumber(t,{unit:"minute"});default:return fe(r.length,t)}}validate(t,r){return r>=0&&r<=59}set(t,r,i){return t.setMinutes(i,0,0),t}}class fR extends Q{constructor(){super(...arguments);S(this,"priority",50);S(this,"incompatibleTokens",["t","T"])}parse(t,r,i){switch(r){case"s":return ce(pe.second,t);case"so":return i.ordinalNumber(t,{unit:"second"});default:return fe(r.length,t)}}validate(t,r){return r>=0&&r<=59}set(t,r,i){return t.setSeconds(i,0),t}}class mR extends Q{constructor(){super(...arguments);S(this,"priority",30);S(this,"incompatibleTokens",["t","T"])}parse(t,r){const i=s=>Math.trunc(s*Math.pow(10,-r.length+3));return ye(fe(r.length,t),i)}set(t,r,i){return t.setMilliseconds(i),t}}class gR extends Q{constructor(){super(...arguments);S(this,"priority",10);S(this,"incompatibleTokens",["t","T","x"])}parse(t,r){switch(r){case"X":return Ct(At.basicOptionalMinutes,t);case"XX":return Ct(At.basic,t);case"XXXX":return Ct(At.basicOptionalSeconds,t);case"XXXXX":return Ct(At.extendedOptionalSeconds,t);case"XXX":default:return Ct(At.extended,t)}}set(t,r,i){return r.timestampIsSet?t:Pe(t,t.getTime()-ya(t)-i)}}class pR extends Q{constructor(){super(...arguments);S(this,"priority",10);S(this,"incompatibleTokens",["t","T","X"])}parse(t,r){switch(r){case"x":return Ct(At.basicOptionalMinutes,t);case"xx":return Ct(At.basic,t);case"xxxx":return Ct(At.basicOptionalSeconds,t);case"xxxxx":return Ct(At.extendedOptionalSeconds,t);case"xxx":default:return Ct(At.extended,t)}}set(t,r,i){return r.timestampIsSet?t:Pe(t,t.getTime()-ya(t)-i)}}class yR extends Q{constructor(){super(...arguments);S(this,"priority",40);S(this,"incompatibleTokens","*")}parse(t){return bv(t)}set(t,r,i){return[Pe(t,i*1e3),{timestampIsSet:!0}]}}class wR extends Q{constructor(){super(...arguments);S(this,"priority",20);S(this,"incompatibleTokens","*")}parse(t){return bv(t)}set(t,r,i){return[Pe(t,i),{timestampIsSet:!0}]}}const vR={G:new FN,y:new VN,Y:new UN,R:new BN,u:new qN,Q:new $N,q:new zN,M:new jN,L:new GN,w:new HN,I:new YN,d:new JN,D:new ZN,E:new eR,e:new tR,c:new nR,i:new iR,a:new sR,b:new oR,B:new aR,h:new cR,H:new uR,K:new lR,k:new hR,m:new dR,s:new fR,S:new mR,X:new gR,x:new pR,t:new yR,T:new wR},bR=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,IR=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,_R=/^'([^]*?)'?$/,ER=/''/g,TR=/\S/,kR=/[a-zA-Z]/;function zh(n,e,t,r){var E,L,O,D,z,Y,$,ee;const i=()=>Pe((r==null?void 0:r.in)||t,NaN),s=DN(),o=(r==null?void 0:r.locale)??s.locale??fv,a=(r==null?void 0:r.firstWeekContainsDate)??((L=(E=r==null?void 0:r.locale)==null?void 0:E.options)==null?void 0:L.firstWeekContainsDate)??s.firstWeekContainsDate??((D=(O=s.locale)==null?void 0:O.options)==null?void 0:D.firstWeekContainsDate)??1,c=(r==null?void 0:r.weekStartsOn)??((Y=(z=r==null?void 0:r.locale)==null?void 0:z.options)==null?void 0:Y.weekStartsOn)??s.weekStartsOn??((ee=($=s.locale)==null?void 0:$.options)==null?void 0:ee.weekStartsOn)??0;if(!e)return n?i():_e(t,r==null?void 0:r.in);const u={firstWeekContainsDate:a,weekStartsOn:c,locale:o},l=[new LN(r==null?void 0:r.in,t)],h=e.match(IR).map(I=>{const B=I[0];if(B in zu){const He=zu[B];return He(I,o.formatLong)}return I}).join("").match(bR),d=[];for(let I of h){!(r!=null&&r.useAdditionalWeekYearTokens)&&wv(I)&&ju(I,e,n),!(r!=null&&r.useAdditionalDayOfYearTokens)&&yv(I)&&ju(I,e,n);const B=I[0],He=vR[B];if(He){const{incompatibleTokens:xi}=He;if(Array.isArray(xi)){const Di=d.find(kr=>xi.includes(kr.token)||kr.token===B);if(Di)throw new RangeError(`The format string mustn't contain \`${Di.fullToken}\` and \`${I}\` at the same time`)}else if(He.incompatibleTokens==="*"&&d.length>0)throw new RangeError(`The format string mustn't contain \`${I}\` and any other token at the same time`);d.push({token:B,fullToken:I});const rn=He.run(n,I,o.match,u);if(!rn)return i();l.push(rn.setter),n=rn.rest}else{if(B.match(kR))throw new RangeError("Format string contains an unescaped latin alphabet character `"+B+"`");if(I==="''"?I="'":B==="'"&&(I=SR(I)),n.indexOf(I)===0)n=n.slice(I.length);else return i()}}if(n.length>0&&TR.test(n))return i();const f=l.map(I=>I.priority).sort((I,B)=>B-I).filter((I,B,He)=>He.indexOf(I)===B).map(I=>l.filter(B=>B.priority===I).sort((B,He)=>He.subPriority-B.subPriority)).map(I=>I[0]);let p=_e(t,r==null?void 0:r.in);if(isNaN(+p))return i();const v={};for(const I of f){if(!I.validate(p,u))return i();const B=I.set(p,v,u);Array.isArray(B)?(p=B[0],Object.assign(v,B[1])):p=B}return p}function SR(n){return n.match(_R)[1].replace(ER,"'")}function UR(...n){return AD(Zw(n))}function BR(n){const e=typeof n=="string"?new Date(n):n;return Ci(e,"MMM d, yyyy")}function qR(n){const e=zh(n+"-01","yyyy-MM-dd",new Date);return Ci(e,"MMMM yyyy")}function $R(){return Ci(new Date,"yyyy-MM")}function zR(n){const e=typeof n=="string"?new Date(n):n;return Ci(e,"yyyy-MM")}function jR(n){const e=zh(n+"-01","yyyy-MM-dd",new Date);return e.setMonth(e.getMonth()+1),Ci(e,"yyyy-MM")}function GR(n){const e=zh(n+"-01","yyyy-MM-dd",new Date);return e.setMonth(e.getMonth()-1),Ci(e,"yyyy-MM")}function WR(n){let e=0;for(let r=0;r<n.length;r++)e=n.charCodeAt(r)+((e<<5)-e);let t="#";for(let r=0;r<3;r++){const i=e>>r*8&255;t+=("00"+i.toString(16)).substr(-2)}return t}const HR=n=>{switch(n==null?void 0:n.toLowerCase()){case"groceries":return"bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600";case"utilities":return"bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600";case"rent":return"bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-600";case"transport":return"bg-orange-100 dark:bg-orange-800 border-orange-300 dark:border-orange-600";case"entertainment":return"bg-pink-100 dark:bg-pink-800 border-pink-300 dark:border-pink-600";case"food & drink":case"dining":return"bg-red-100 dark:bg-red-800 border-red-300 dark:border-red-600";case"shopping":return"bg-indigo-100 dark:bg-indigo-800 border-indigo-300 dark:border-indigo-600";case"gifts":return"bg-rose-100 dark:bg-rose-800 border-rose-300 dark:border-rose-600";case"health":return"bg-emerald-100 dark:bg-emerald-800 border-emerald-300 dark:border-emerald-600";case"holidays":return"bg-cyan-100 dark:bg-cyan-800 border-cyan-300 dark:border-cyan-600";case"subscriptions":return"bg-amber-100 dark:bg-amber-800 border-amber-300 dark:border-amber-600";default:return"bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500"}};export{Vr as $,FR as A,Pe as B,_e as C,DD as D,xD as E,hv as F,sx as G,PD as H,Bw as I,cm as J,OD as K,Ai as L,Zw as M,LD as N,FD as O,zh as P,VD as Q,cn as R,LR as S,Cn as T,mv as U,ad as V,Xu as W,DR as X,$x as Y,pt as Z,_w as _,VR as a,mc as a0,OR as a1,PR as a2,qR as b,UR as c,cs as d,MC as e,BR as f,$R as g,Ox as h,GR as i,wt as j,ma as k,ae as l,KC as m,zR as n,Wf as o,JC as p,Ci as q,HR as r,FC as s,jR as t,MR as u,zx as v,Qw as w,LC as x,XC as y,WR as z};
