(()=>{"use strict";var e,p={297:(e,t,n)=>{var u=n(591);addEventListener("message",({data:a})=>{const s={keys:u.j.generateEncryptionKeyAndLoginHash(a.password,a.username,a.iterations,a.localAuthorizationHash)};postMessage(s)})}},i={};function r(e){var t=i[e];if(void 0!==t)return t.exports;var n=i[e]={exports:{}};return p[e].call(n.exports,n,n.exports,r),n.exports}r.m=p,r.x=()=>{var e=r.O(void 0,[591],()=>r(297));return r.O(e)},e=[],r.O=(t,n,u,a)=>{if(!n){var c=1/0;for(s=0;s<e.length;s++){for(var[n,u,a]=e[s],o=!0,_=0;_<n.length;_++)(!1&a||c>=a)&&Object.keys(r.O).every(l=>r.O[l](n[_]))?n.splice(_--,1):(o=!1,a<c&&(c=a));if(o){e.splice(s--,1);var f=u();void 0!==f&&(t=f)}}return t}a=a||0;for(var s=e.length;s>0&&e[s-1][2]>a;s--)e[s]=e[s-1];e[s]=[n,u,a]},r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.f={},r.e=e=>Promise.all(Object.keys(r.f).reduce((t,n)=>(r.f[n](e,t),t),[])),r.u=e=>e+".763f625a55d6a388.js",r.miniCssF=e=>{},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e;r.tt=()=>(void 0===e&&(e={createScriptURL:t=>t},typeof trustedTypes<"u"&&trustedTypes.createPolicy&&(e=trustedTypes.createPolicy("angular#bundler",e))),e)})(),r.tu=e=>r.tt().createScriptURL(e),r.p="",(()=>{var e={297:1};r.f.i=(a,s)=>{e[a]||importScripts(r.tu(r.p+r.u(a)))};var n=self.webpackChunkSavePass_Frontend=self.webpackChunkSavePass_Frontend||[],u=n.push.bind(n);n.push=a=>{var[s,c,o]=a;for(var _ in c)r.o(c,_)&&(r.m[_]=c[_]);for(o&&o(r);s.length;)e[s.pop()]=1;u(a)}})(),(()=>{var e=r.x;r.x=()=>r.e(591).then(e)})(),r.x()})();