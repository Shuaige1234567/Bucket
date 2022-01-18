"use strict";(self.webpackChunkContainer_assets=self.webpackChunkContainer_assets||[]).push([[92],{2664:(e,t,n)=>{n.d(t,{Z:()=>s});var l=n(8081),a=n.n(l),o=n(3645),i=n.n(o)()(a());i.push([e.id,".title .drop {\n  cursor: pointer;\n  width: 1000px;\n  border-radius: 2px;\n  border-color: #eeeeee;\n  border-style: dashed;\n  color: #bdbdbd;\n  outline: none;\n  margin: auto;\n}\n.title .uploadBac {\n  position: relative;\n  padding-top: 20px;\n  padding-bottom: 20px;\n  background-color: #fafafc;\n}\n.title .uploadBac p {\n  text-align: center;\n  font-size: 20px;\n  margin-bottom: 0px !important;\n}\n\n.uploadBac .icon svg {\n  width: 35px;\n  height: 35px;\n}\n.fileTable .ant-table-tbody > tr > td {\n  max-width: 300px;\n}\n.showTable {\n  width: 100%;\n  position: relative;\n}\n.showTable .ant-spin-container {\n  transition: all 2s ease;\n}\n.action_bac {\n  width: 100%;\n  height: 32px;\n  bottom: 15px;\n  position: absolute;\n}\n.showTable .ant-pagination-prev,\n.showTable .ant-pagination-next,\n.showTable .ant-pagination-item {\n  z-index: 1;\n}\n.Action {\n  position: absolute;\n  right: 200px;\n}\n",""]);const s=i},1092:(e,t,n)=>{n.r(t),n.d(t,{default:()=>K,getReverseFileExtension:()=>j});var l=n(7294),a=n(463),o=n(2023),i=n(7480),s=n(7183),r=n(8361),c=n(331),g=n(4078),u=n(1577),p=n(1382),d=n(7265),m=n(2484),f=n(5689),h=n(9704),k=n(3379),y=n.n(k),b=n(7795),v=n.n(b),w=n(569),x=n.n(w),E=n(3565),S=n.n(E),I=n(9216),Z=n.n(I),_=n(4589),N=n.n(_),A=n(2664),C={};C.styleTagTransform=N(),C.setAttributes=S(),C.insert=x().bind(null,"head"),C.domAPI=v(),C.insertStyleElement=Z();y()(A.Z,C);A.Z&&A.Z.locals&&A.Z.locals;const{Content:T}=s.Z,j=e=>{switch(Object.keys(e)[0]){case"jpeg":return"image/jpeg";case"gif":return"image/gif";case"jpg":return"image/jpg";case"png":return"image/png";case"svg":return"image/svg";case"avi":return"video/avi";case"mp4":return"video/mp4";case"aac":return"video/aac";case"wav":return"audio/wav";case"mp3":return"audio/mp3";case"wasm":return"application/wasm";default:return""}},P=e=>{switch(e){case"image/jpeg":return{jpeg:null};case"image/gif":return{gif:null};case"image/jpg":return{jpg:null};case"image/png":return{png:null};case"image/svg":return{svg:null};case"video/avi":return{avi:null};case"video/aac":return{aac:null};case"video/mp4":return{mp4:null};case"audio/wav":return{wav:null};case"audio/mp3":case"audio/mpeg":return{mp3:null};case"application/wasm":return{wasm:null};default:return null}};let O=[],z="",F=!1,R=0,B=!0,J=!0,U=[];const D=[];const K=function(){const[e,t]=(0,l.useState)(""),[n,s]=(0,l.useState)(!1),{principal:k,assets:y,bucketActor:b}=(0,h.v9)((e=>e)),v=k.value;let w=JSON.parse(localStorage.getItem(v));const x=null===w?[]:w,E=null===y?[]:y.ok;if(x.length<E.length&&B)for(let e=0;e<E.length;e++)x[e]={filekey:E[e].file_key,bucketId:E[e].bucket_id.toString(),filename:E[e].file_name,filetype:[Object.keys(E[e].file_extension)[0]],id:(0,i.x0)()};const S=(0,l.useCallback)((e=>{let t=[];R=e.length,console.log(e);let n=0;for(let l=0;l<e.length;l++){const a=e[l];let i="";const c=[],g=[],u=[];let p=a.size;n+=p,console.log("fileSize:",p);let d=1992295,m=Math.ceil(p/d);console.log("chunks:",m);let f=File.prototype.slice||File.prototype.mozSlice||File.prototype.webkitSlice,h=0;const k=[],y=new FileReader;let v=P(a.type);y.onload=function(e){let n=e.target.result,l=new Uint8Array(n),p=[];for(let e=0;e<l.length;e++)p.push(l[e]);let d=o.sha256.digest(p);if(u.push(d),g.push(p),c.push(...d),h++,h<m)w();else{if(i=(0,o.sha256)(c),i=i.toUpperCase(),x.find((e=>e.filekey===i)))R--,r.ZP.error(`${i} is Repeat`);else{F=!0,s(!0);for(let e=0;e<g.length;e++)console.log(i),k.push(b.put({file_key:i,file_name:a.name,file_extension:v,chunk:{digest:u[e],data:g[e]},chunk_number:m,order:e}));t.push(...k),0===t.length&&Promise.all(t).then()}}};const w=()=>{let e=h*d,t=e+d>p?p:e+d;y.readAsArrayBuffer(f.call(a,e,t))};w()}}),[x,b]);if(F&&J){let e=JSON.parse(localStorage.getItem(v));setInterval((I=(null===e?[]:e).length,async()=>{const e=[];let n=JSON.parse(localStorage.getItem(v));const l=null===n?[]:n;let a=await b.getAssetExts();if(console.log(a.ok,l.length),a.ok.length>l.length)for(let t=0;t<a.ok.length;t++)console.log(a.ok[t]),e.push({id:(0,i.x0)(),filename:a.ok[t].file_name,bucketId:a.ok[t].bucket_id.toString(),filekey:a.ok[t].file_key,filetype:[Object.keys(a.ok[t].file_extension)[0]]});let o=JSON.stringify(e);if(e.length>0&&""!==v&&(J=!1,localStorage.setItem(v,o),t({})),a.ok.length===I+R)return console.log("上传完成"),console.log(a.ok),location.reload(),0}),1e3)}var I;(0,l.useEffect)((()=>()=>{Promise.all(D).then((()=>{console.log("deleted")}))}));const Z=e=>async()=>{s(!0),(async e=>{console.log(e);let t=await b.getAssetExtkey(e);console.log("RE",t);let n=Number(t.ok.need_query_times);console.log(n);let l=[];for(let t=0;t<n;t++){let n=await b.get({file_key:e,flag:t});console.log(n);let a=n.ok[0];for(let e=1;e<n.ok.length;e++)a=a.concat(n.ok[e]);l=l.concat(a)}console.log(l);let a=new Uint8Array(l).buffer;console.log(a);let o=j(t.ok.file_extension);const i=new Blob([a],{type:o});return console.log(i),URL.createObjectURL(i)})(e).then((e=>{e&&(s(!1),window.open(`${e}`))}))},_={onChange:(e,t)=>{console.log(t),U=t}},N=[{title:"FileName",dataIndex:"filename"},{title:"BucketId",dataIndex:"bucketId"},{title:"FileKey",dataIndex:"filekey"},{title:"FileType",dataIndex:"filetype",render:e=>l.createElement("span",null,e.map((e=>{let t;switch(e){case"mp3":case"wav":t="volcano";break;case"acc":case"mp4":case"avi":t="geekblue";break;default:t="magenta"}return l.createElement(c.Z,{color:t,key:(0,i.x0)()},e)})))},{title:"Action",key:"action",render:(e,t)=>l.createElement(g.Z,{size:"middle"},l.createElement(u.Z,{type:"primary",onClick:Z(t.filekey)},"Entry"))}];O=[...x],z=JSON.stringify(O),O.length>0&&""!==v&&localStorage.setItem(v,z);const{getRootProps:A,getInputProps:C}=(0,a.uI)({onDrop:S});return l.createElement(p.Z,{spinning:n,size:"large"},l.createElement(T,{style:{padding:"0 0",minHeight:0},className:"main"},l.createElement("div",{className:"showTable"},l.createElement("div",{className:"title"},l.createElement("div",null,l.createElement("div",{className:"drop",...A()},l.createElement("input",{...C()}),l.createElement("div",{className:"uploadBac"},l.createElement("p",null,l.createElement(f.Z,{className:"icon"})),l.createElement("p",null,"Click one or drag many files to this area to upload"))))),l.createElement(d.Z,{className:"fileTable",rowSelection:_,rowKey:e=>e.id,columns:N,pagination:{position:"bottomRight"},dataSource:O}),l.createElement("div",{className:"action_bac"},l.createElement(g.Z,{style:{display:O.length>0?"inline-flex":"none"},size:"middle",className:"Action"},l.createElement(m.Z,{title:"Are you sure to delete these files?",onConfirm:async()=>{if(console.log(U),U.length>0){const e=JSON.parse(localStorage.getItem(v));for(let t=0;t<U.length;t++){D.push(b.deletekey(U[t].filekey));let n=e.findIndex((e=>U[t].filekey===e.filekey));if(-1===n)return r.ZP.error("Please select the file to delete!"),0;e.splice(n,1)}console.log(e);const n=JSON.stringify(e);""!==v&&localStorage.setItem(v,n),B=!1,U=[],t({}),r.ZP.success("Deleted successded")}else r.ZP.error("Please select the file to delete!")},onCancel:()=>{r.ZP.error("Cancel deletion")},okText:"Yes",cancelText:"No"},l.createElement(u.Z,{type:"primary"},"Delete")))))))}}}]);