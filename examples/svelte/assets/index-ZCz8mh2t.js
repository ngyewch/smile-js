var R=Object.defineProperty;var z=(r,e,t)=>e in r?R(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var v=(r,e,t)=>z(r,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const d of a.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();function V(){}function T(r){return r()}function F(){return Object.create(null)}function I(r){r.forEach(T)}function C(r){return typeof r=="function"}function G(r,e){return r!=r?e==e:r!==e||r&&typeof r=="object"||typeof r=="function"}function J(r){return Object.keys(r).length===0}function m(r,e){r.appendChild(e)}function N(r,e,t){r.insertBefore(e,t||null)}function E(r){r.parentNode&&r.parentNode.removeChild(r)}function S(r){return document.createElement(r)}function K(r){return document.createTextNode(r)}function A(){return K(" ")}function q(r,e,t,i){return r.addEventListener(e,t,i),()=>r.removeEventListener(e,t,i)}function b(r,e,t){t==null?r.removeAttribute(e):r.getAttribute(e)!==t&&r.setAttribute(e,t)}function X(r){return Array.from(r.childNodes)}function H(r,e){e=""+e,r.data!==e&&(r.data=e)}let U;function x(r){U=r}const w=[],P=[];let _=[];const O=[],Q=Promise.resolve();let L=!1;function W(){L||(L=!0,Q.then(Z))}function M(r){_.push(r)}const k=new Set;let y=0;function Z(){if(y!==0)return;const r=U;do{try{for(;y<w.length;){const e=w[y];y++,x(e),Y(e.$$)}}catch(e){throw w.length=0,y=0,e}for(x(null),w.length=0,y=0;P.length;)P.pop()();for(let e=0;e<_.length;e+=1){const t=_[e];k.has(t)||(k.add(t),t())}_.length=0}while(w.length);for(;O.length;)O.pop()();L=!1,k.clear(),x(r)}function Y(r){if(r.fragment!==null){r.update(),I(r.before_update);const e=r.dirty;r.dirty=[-1],r.fragment&&r.fragment.p(r.ctx,e),r.after_update.forEach(M)}}function ee(r){const e=[],t=[];_.forEach(i=>r.indexOf(i)===-1?e.push(i):t.push(i)),t.forEach(i=>i()),_=e}const te=new Set;function re(r,e){r&&r.i&&(te.delete(r),r.i(e))}function ne(r,e,t){const{fragment:i,after_update:n}=r.$$;i&&i.m(e,t),M(()=>{const a=r.$$.on_mount.map(T).filter(C);r.$$.on_destroy?r.$$.on_destroy.push(...a):I(a),r.$$.on_mount=[]}),n.forEach(M)}function ie(r,e){const t=r.$$;t.fragment!==null&&(ee(t.after_update),I(t.on_destroy),t.fragment&&t.fragment.d(e),t.on_destroy=t.fragment=null,t.ctx=[])}function se(r,e){r.$$.dirty[0]===-1&&(w.push(r),W(),r.$$.dirty.fill(0)),r.$$.dirty[e/31|0]|=1<<e%31}function ae(r,e,t,i,n,a,d=null,o=[-1]){const u=U;x(r);const s=r.$$={fragment:null,ctx:[],props:a,update:V,not_equal:n,bound:F(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(u?u.$$.context:[])),callbacks:F(),dirty:o,skip_bound:!1,root:e.target||u.$$.root};d&&d(s.root);let c=!1;if(s.ctx=t?t(r,e.props||{},(h,B,...f)=>{const g=f.length?f[0]:B;return s.ctx&&n(s.ctx[h],s.ctx[h]=g)&&(!s.skip_bound&&s.bound[h]&&s.bound[h](g),c&&se(r,h)),B}):[],s.update(),c=!0,I(s.before_update),s.fragment=i?i(s.ctx):!1,e.target){if(e.hydrate){const h=X(e.target);s.fragment&&s.fragment.l(h),h.forEach(E)}else s.fragment&&s.fragment.c();e.intro&&re(r.$$.fragment),ne(r,e.target,e.anchor),Z()}x(u)}class de{constructor(){v(this,"$$");v(this,"$$set")}$destroy(){ie(this,1),this.$destroy=V}$on(e,t){if(!C(t))return V;const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(t),()=>{const n=i.indexOf(t);n!==-1&&i.splice(n,1)}}$set(e){this.$$set&&!J(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const oe="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(oe);class l extends Error{constructor(e){super(e)}}const D=[0,1,3,7,15,31,63,127,255];class j{decodeVInt(e){if(e.length<=0)throw new l("invalid VInt");let t=BigInt(0);for(let i=0;i<e.length;i++){const n=e[i];if(i<e.length-1){if(n&128)throw new l("invalid VInt");t=t*BigInt(128)+BigInt(n&127)}else{if((n&128)!==128)throw new l("invalid VInt");t=t*BigInt(64)+BigInt(n&63);break}}return t>=BigInt(Number.MIN_SAFE_INTEGER)&&t<=BigInt(Number.MAX_SAFE_INTEGER)?Number(t):t}decodeZigZag(e){if(e<0)throw new l("illegal zigzag value");if(typeof e=="bigint"){if(e<=BigInt(2147483647))return e%BigInt(2)===BigInt(1)?Number(-(e>>BigInt(1))-BigInt(1)):Number(e>>BigInt(1));if(e%BigInt(2)===BigInt(1)){const t=(e-BigInt(1))/BigInt(2);return Number(-t-BigInt(1))}else{const t=e/BigInt(2);return Number(t)}}else return e<=2147483647?e%2===1?-(e>>1)-1:e>>1:e%2===1?-((e-1)/2)-1:e/2}decodeAscii(e){return new TextDecoder("ascii").decode(e)}decodeUtf8(e){return new TextDecoder("utf8").decode(e)}toDataView(e){const t=new ArrayBuffer(e.length),i=new DataView(t);for(let n=0;n<e.length;n++)i.setUint8(n,e[n]);return i}decodeFloat32(e){return this.toDataView(e).getFloat32(0,!1)}decodeFloat64(e){return this.toDataView(e).getFloat64(0,!1)}decodeFixedLengthBigEndianEncodedBits(e,t){const i=new Uint8Array(Math.ceil(t/8));let n=0,a=t%7,d=0,o=0,u=e[n],s=0,c;for(;n<e.length;){const h=Math.min(a,8-o);s<<=h,s|=u>>a-h,a-=h,u&=D[a],o+=h,a===0&&(n++,a=7,u=e[n]),o===8&&(c=d,i[c]=s,d++,o=0,s=0)}return o>0&&(s<<=8-o,c=d,i[c]=s),i}decodeSafeBinaryEncodedBits(e,t){const i=new Uint8Array(Math.ceil(t/8));let n=0,a=7,d=0,o=0,u=e[n],s=0;for(;d<i.length;){const c=Math.min(a,8-o);s<<=c,s|=u>>a-c,a-=c,u&=D[a],o+=c,a===0&&(n++,a=7,u=e[n]),o===8&&(i[d]=s,d++,o=0,s=0)}return o>0&&(s<<=8-o,i[d]=s),i}}class ce{constructor(e){this.inputStream=e,this.decoder=new j}isEof(){return this.inputStream.isEof()}read(){return this.inputStream.read()}peek(){return this.inputStream.peek()}readVIntBytes(){const e=[];for(;;){const t=this.read();if(e.push(t),(t&128)===128)break}return new Uint8Array(e)}readUnsignedVint(){const e=this.readVIntBytes();return this.decoder.decodeVInt(e)}readSignedVint(){return this.decoder.decodeZigZag(this.readUnsignedVint())}readAscii(e){return this.decoder.decodeAscii(this.inputStream.readArray(e))}readUtf8(e){return this.decoder.decodeUtf8(this.inputStream.readArray(e))}readFloat32(){return this.decoder.decodeFloat32(this.readFixedLengthBigEndianEncodedBits(32))}readFloat64(){return this.decoder.decodeFloat64(this.readFixedLengthBigEndianEncodedBits(64))}readFixedLengthBigEndianEncodedBits(e){const t=this.inputStream.readArray(Math.ceil(e/7));return this.decoder.decodeFixedLengthBigEndianEncodedBits(t,e)}readSafeBinary(){const e=this.readUnsignedVint();if(typeof e=="bigint")throw new l("invalid length");const t=this.inputStream.readArray(Math.ceil(e*8/7));return this.decoder.decodeSafeBinaryEncodedBits(t,e*8)}readBigInt(){const e=this.readSafeBinary();let t=0;for(let i=0;i<e.length;i++)t=t*256+e[i];return t}readBigDecimal(){const e=this.readSignedVint();if(typeof e=="bigint")throw new l("invalid scale");return this.readBigInt()*Math.pow(10,e)}readLongString(){const e=[];for(;;){const t=this.inputStream.read();if(t===252)break;e.push(t)}return new Uint8Array(e)}readLongAscii(){return this.decoder.decodeAscii(this.readLongString())}readLongUtf8(){return this.decoder.decodeUtf8(this.readLongString())}readBytes(e){return this.inputStream.readArray(e)}}const $=new l("end of input stream reached");class ue{constructor(e){this.index=0,this.array=e}isEof(){return this.index>=this.array.length}read(){if(this.isEof())throw $;const e=this.array[this.index];return this.index++,e}readArray(e){if(this.isEof())throw $;if(e<0)throw new l("invalid read amount");const t=Math.min(this.array.length,this.index+e),i=this.array.subarray(this.index,t);return this.index=t,i}peek(){if(this.isEof())throw $;return this.array[this.index]}skip(e){if(this.isEof())throw $;if(e<0)throw new l("invalid skip amount");this.index+=e}}class p{constructor(e,t,i,n){this.name=e,this.keyMode=t,this.enabled=i,this.maxStrings=n,this.reset(),this.strings=[],this.stringMap={},this.reset()}reset(){this.keyMode?(this.strings=[],this.stringMap={}):(this.strings=[""],this.stringMap={})}static newValues(e){return new p("values",!1,e,1024)}static newKeyNames(e){return new p("keyNames",!0,e,1024)}addString(e){if(!this.enabled||new TextEncoder().encode(e).length>64)return-1;if(e in this.stringMap)return this.stringMap[e];this.keyMode?this.strings.length>=this.maxStrings&&this.reset():this.strings.length>this.maxStrings&&this.reset();const t=this.strings.length;return this.strings.push(e),this.stringMap[e]=t,t}getString(e){if(!this.enabled)throw new l("shared strings are not enabled");if(e>=this.strings.length)throw new l("shared string reference out of range");return this.strings[e]}}function he(r,e){return new le(r,e).parse()}class le{constructor(e,t){this.decoderStream=new ce(new ue(e)),this.options=t,this.decoder=new j,this.sharedPropertyName=!1,this.sharedStringValue=!1,this.rawBinary=!1,this.version=0,this.sharedPropertyNames=p.newKeyNames(!1),this.sharedStringValues=p.newValues(!1)}parse(){const e=this.decoderStream.read(),t=this.decoderStream.read(),i=this.decoderStream.read();if(e!==58||t!==41||i!==10)throw new l("invalid Smile header");const n=this.decoderStream.read();return this.sharedPropertyName=(n&1)===1,this.sharedStringValue=(n&2)===2,this.rawBinary=(n&4)===4,this.version=n>>4,this.sharedPropertyNames=p.newKeyNames(this.sharedPropertyName),this.sharedStringValues=p.newValues(this.sharedStringValue),this.readValue()}readValue(){const e=this.decoderStream.read(),t=e>>5,i=e&31;switch(t){case 0:return this.sharedStringValues.getString(i);case 1:return this.readSimpleLiteralValue(e);case 2:{const n=this.decoderStream.readAscii(i+1);return this.sharedStringValues.addString(n),n}case 3:{const n=this.decoderStream.readAscii(i+33);return this.sharedStringValues.addString(n),n}case 4:{const n=this.decoderStream.readUtf8(i+2);return this.sharedStringValues.addString(n),n}case 5:{const n=this.decoderStream.readUtf8(i+34);return this.sharedStringValues.addString(n),n}case 6:return this.decoder.decodeZigZag(i);case 7:return this.readBinaryLongTextStructureValues(e);default:throw new l(`unknown token class: ${t}`)}}readSimpleLiteralValue(e){if(e===32)return"";if(e===33)return null;if(e===34)return!1;if(e===35)return!0;if(e===36)return this.decoderStream.readSignedVint();if(e===37)return this.decoderStream.readSignedVint();if(e===38)return this.decoderStream.readBigInt();if(e===40)return this.decoderStream.readFloat32();if(e===41)return this.decoderStream.readFloat64();if(e===42)return this.decoderStream.readBigDecimal();throw new l("invalid value token 0x"+e.toString(16))}readBinaryLongTextStructureValues(e){if(e===224)return this.decoderStream.readLongAscii();if(e===228)return this.decoderStream.readLongUtf8();if(e===232)return this.decoderStream.readSafeBinary();if(e>=236&&e<=239){const t=(e&3)<<8|this.decoderStream.read();return this.sharedStringValues.getString(t)}else if(e===248){const t=[];for(;this.decoderStream.peek()!==249;)t.push(this.readValue());return this.decoderStream.read(),t}else if(e===250){const t={};for(;this.decoderStream.peek()!==251;){const i=this.readKey(),n=this.readValue();t[i]=n}return this.decoderStream.read(),t}else if(e===253){const t=this.decoderStream.readUnsignedVint();if(typeof t=="bigint")throw new l("invalid length");return this.decoderStream.readBytes(t)}else throw new l("invalid value token 0x"+e.toString(16))}readKey(){const e=this.decoderStream.read();if(e===32)return"";if(e>=48&&e<=51){const t=(e&3)<<8|this.decoderStream.read();return this.sharedPropertyNames.getString(t)}else{if(e===52)return this.decoderStream.readLongUtf8();if(e>=64&&e<=127){const t=e&63;return this.sharedPropertyNames.getString(t)}else if(e>=128&&e<=191){const t=this.decoderStream.readAscii((e&63)+1);return this.sharedPropertyNames.addString(t),t}else if(e>=192&&e<=247){const t=this.decoderStream.readUtf8((e&63)+2);return this.sharedPropertyNames.addString(t),t}else throw new l("invalid key token 0x"+e.toString(16))}}}function fe(r){let e,t,i,n,a,d,o,u,s,c,h,B;return{c(){e=S("div"),t=S("label"),t.textContent="Select SMILE-encoded file",i=A(),n=S("input"),a=A(),d=S("div"),o=S("label"),o.textContent="JSON representation:",u=A(),s=S("pre"),c=K(r[0]),b(t,"for","file"),b(n,"id","file"),b(n,"type","file"),b(o,"for","output"),b(s,"id","output")},m(f,g){N(f,e,g),m(e,t),m(e,i),m(e,n),N(f,a,g),N(f,d,g),m(d,o),m(d,u),m(d,s),m(s,c),h||(B=q(n,"change",r[1]),h=!0)},p(f,[g]){g&1&&H(c,f[0])},i:V,o:V,d(f){f&&(E(e),E(a),E(d)),h=!1,B()}}}function ge(r,e,t){let i="";function n(a){const d=a.target;if(!d.files||d.files.length<1)return;const o=d.files.item(0);o&&o.arrayBuffer().then(u=>{const s=new Uint8Array(u);try{const c=he(s);console.log(c),t(0,i=JSON.stringify(c,null,2))}catch(c){alert(c)}}).catch(u=>{alert(u)})}return[i,n]}class me extends de{constructor(e){super(),ae(this,e,ge,fe,G,{})}}new me({target:document.body});
//# sourceMappingURL=index-ZCz8mh2t.js.map
