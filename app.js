import {createState,generate,step,INITIAL} from './engine.js';
let state=createState(generate(Date.now()));let timer=null;
const $=id=>document.getElementById(id);const money=n=>Math.round(n).toLocaleString('ko-KR')+'원';
function stop(){clearInterval(timer);timer=null;$('play').textContent='관망 자동 재생';}
function draw(){
  const bars=state.bars.slice(Math.max(0,state.index-44),state.index+1);const low=Math.min(...bars.map(b=>b.low))*.99;const high=Math.max(...bars.map(b=>b.high))*1.01;
  const y=p=>340-(p-low)/(high-low)*300;const dx=780/45;let s='';
  for(let i=0;i<5;i++){const yy=40+i*75;const p=high-(high-low)*i/4;s+=`<line x1="10" x2="790" y1="${yy}" y2="${yy}" stroke="#293746"/><text x="804" y="${yy+5}" fill="#9babc0" font-size="13">${Math.round(p).toLocaleString()}</text>`;}
  bars.forEach((b,i)=>{const x=20+i*dx;const color=b.close>=b.open?'#62e1b4':'#ff9c8a';s+=`<line x1="${x}" x2="${x}" y1="${y(b.high)}" y2="${y(b.low)}" stroke="${color}" stroke-width="2"/><rect x="${x-5}" y="${Math.min(y(b.open),y(b.close))}" width="10" height="${Math.max(2,Math.abs(y(b.open)-y(b.close)))}" fill="${color}"/>`;});
  $('chart').innerHTML=s;$('chart').setAttribute('aria-label',`합성 차트 ${state.index+1}번째 봉, 현재 종가 ${money(state.bars[state.index].close)}`);
}
function render(){
  const last=state.bars[state.index];$('equity').textContent=money(state.equity);$('cash').textContent=money(state.cash);$('holding').textContent=money(state.qty*last.close);$('fees').textContent=money(state.fees);$('price').textContent=`종가 ${money(last.close)} · 보유 ${state.qty.toFixed(4)}주`;$('progress').textContent=`${state.index+1} / ${state.bars.length}봉`;
  $('trades').innerHTML=state.trades.slice().reverse().map(t=>`<tr><td>${t.bar}</td><td>${t.action==='buy'?'매수':'매도'}</td><td>${t.qty.toFixed(4)}</td><td>${money(t.price)}</td><td>${money(t.fee)}</td></tr>`).join('');$('count').textContent=state.trades.length+'건';$('empty').hidden=state.trades.length>0;
  for(const id of ['buy','sell','hold','sellAll','play','amount','speed'])$(id).disabled=state.done;
  $('sellAll').disabled=state.done||state.qty<=0;
  $('result').hidden=!state.done;if(state.done){stop();$('resultText').textContent=`최종 총자산 ${money(state.equity)} · 손익 ${money(state.equity-INITIAL)} (${((state.equity/INITIAL-1)*100).toFixed(2)}%) · 최대낙폭 ${(state.maxDrawdown*100).toFixed(2)}% · 거래 ${state.trades.length}건`;}
  draw();
}
function act(action,all=false){stop();const amount=all?state.qty*state.bars[state.index+1]?.open:Number($('amount').value);const result=step(state,action,amount);$('status').textContent=result.message;render();}
$('buy').onclick=()=>act('buy');$('sell').onclick=()=>act('sell');$('hold').onclick=()=>act('hold');$('sellAll').onclick=()=>act('sell',true);
$('play').onclick=()=>{if(timer){stop();return;}const tick=()=>{const r=step(state,'hold');$('status').textContent=r.message;render();};timer=setInterval(tick,Number($('speed').value));$('play').textContent='자동 재생 멈춤';};
$('speed').onchange=()=>{if(timer){stop();$('status').textContent='속도를 바꿨습니다. 자동 재생을 다시 시작하세요.';}};
$('reset').onclick=()=>{stop();state=createState(generate(Date.now()));$('status').textContent='새 합성 차트입니다. 처음 30개 봉부터 시작합니다.';render();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});render();
