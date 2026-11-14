export const INITIAL = 1000000;
export const FEE = .001;
export const LENGTH = 90;
export function generate(seed = 42) {
  let value=seed>>>0; const rand=()=>((value=(Math.imul(value,1664525)+1013904223)>>>0)/4294967296);
  let price=10000;
  return Array.from({length:LENGTH},(_,i)=>{const open=price; const close=Math.max(100,open*(1+(rand()-.5)*.045)); const high=Math.max(open,close)*(1+rand()*.012); const low=Math.min(open,close)*(1-rand()*.012);price=close;return {open,high,low,close,i};});
}
export function createState(bars=generate()) {return {bars,index:29,cash:INITIAL,qty:0,fees:0,peak:INITIAL,maxDrawdown:0,trades:[],equity:INITIAL,done:false};}
export function step(state,action='hold',amount=0) {
  if(state.done) return {ok:false,message:'종료된 세션입니다.'};
  if(!['buy','sell','hold'].includes(action)) return {ok:false,message:'올바른 주문을 선택하세요.'};
  if(action!=='hold'&&(!Number.isFinite(amount)||amount<=0)) return {ok:false,message:'0보다 큰 금액을 입력하세요.'};
  const bar=state.bars[state.index+1];
  if(!bar) {state.done=true;return {ok:false,message:'마지막 봉입니다.'};}
  // Amount means a total budget for buys and a gross sale value for sells.
  if(action==='buy'&&amount>state.cash+1e-7) return {ok:false,message:'현금이 부족합니다. 차입은 허용되지 않습니다.'};
  if(action==='sell'&&amount>state.qty*bar.open+1e-7) return {ok:false,message:'보유 수량을 넘게 매도할 수 없습니다.'};
  let qty=0,fee=0;
  if(action==='buy'){const gross=amount/(1+FEE);fee=amount-gross;qty=gross/bar.open;state.cash-=amount;state.qty+=qty;}
  if(action==='sell'){qty=amount/bar.open;fee=amount*FEE;state.qty-=qty;state.cash+=amount-fee;}
  state.qty=Math.max(0,state.qty);state.cash=Math.max(0,state.cash);state.fees+=fee;state.index++;
  if(action!=='hold')state.trades.push({bar:state.index+1,action,qty,price:bar.open,fee});
  state.equity=state.cash+state.qty*bar.close;state.peak=Math.max(state.peak,state.equity);state.maxDrawdown=Math.max(state.maxDrawdown,1-state.equity/state.peak);
  state.done=state.index===state.bars.length-1||state.equity<=0;
  return {ok:true,message:action==='hold'?'관망하고 다음 봉을 확인했습니다.':`다음 봉 시가에 ${action==='buy'?'매수':'매도'}했습니다.`};
}
