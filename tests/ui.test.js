import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const ids=[...fs.readFileSync(new URL('../index.html',import.meta.url),'utf8').matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
const nodes=Object.fromEntries(ids.map(id=>[id,{value:id==='amount'?'100000':id==='speed'?'1500':'',setAttribute(){},hidden:false,disabled:false}]));
let visibility;globalThis.document={getElementById:id=>nodes[id],addEventListener:(name,fn)=>{visibility=fn;}};
await import('../app.js');
test('UI initial synthetic account and buy/sell/hold/reset',()=>{assert.match(nodes.equity.textContent,/1,000,000/);nodes.buy.onclick();assert.match(nodes.count.textContent,/1/);assert.match(nodes.progress.textContent,/31/);nodes.sellAll.onclick();assert.equal(nodes.sellAll.disabled,true);nodes.hold.onclick();assert.match(nodes.progress.textContent,/33/);nodes.reset.onclick();assert.match(nodes.progress.textContent,/30/);assert.match(nodes.count.textContent,/0/);});
test('bad amount does not move chart',()=>{nodes.amount.value='-5';nodes.buy.onclick();assert.match(nodes.progress.textContent,/30/);assert.match(nodes.status.textContent,/0보다/);});
test('end state disables trading and reset recovers',()=>{for(let i=0;i<60;i++)nodes.hold.onclick();assert.equal(nodes.result.hidden,false);assert.equal(nodes.buy.disabled,true);nodes.reset.onclick();assert.equal(nodes.result.hidden,true);assert.equal(nodes.buy.disabled,false);});
test('autoplay toggle, speed change, hidden page cancellation',()=>{nodes.play.onclick();assert.equal(nodes.play.textContent,'자동 재생 멈춤');nodes.speed.onchange();assert.equal(nodes.play.textContent,'관망 자동 재생');nodes.play.onclick();document.hidden=true;visibility();assert.equal(nodes.play.textContent,'관망 자동 재생');});
