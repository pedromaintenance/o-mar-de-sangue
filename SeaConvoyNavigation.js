/* O Mar de Sangue — rotas navegáveis para comboios, sem Phaser.
 * Planejamento A* em grade, obstáculos circulares e suavização por visada.
 * Executado UMA VEZ no lançamento do CT-001, nunca por quadro.
 */
const SEA_CONVOY_NAV = Object.freeze({
  step:220,
  padding:34,
  pointClear(p,islands,radius){
    return (islands||[]).every(i=>Math.hypot(p.x-i.x,p.y-i.y)>=
      i.radius+radius+this.padding);
  },
  lineClear(a,b,islands,radius){
    const dx=b.x-a.x,dy=b.y-a.y;
    const d2=dx*dx+dy*dy;
    for(const i of islands||[]){
      const t=d2?Math.max(0,Math.min(1,
        ((i.x-a.x)*dx+(i.y-a.y)*dy)/d2)):0;
      const ox=a.x+t*dx-i.x,oy=a.y+t*dy-i.y;
      const clearance=i.radius+radius+this.padding;
      if(ox*ox+oy*oy<clearance*clearance)return false;
    }
    return true;
  },
  plan(s,start,exitEast,radius){
    const W=Number(s?.W)||0,H=Number(s?.H)||0;
    const rocks=(s?.islands||[]).filter(i=>
      Number.isFinite(i.x)&&Number.isFinite(i.y)&&
      Number.isFinite(i.radius)&&i.radius>0);
    if(W<1200||H<1000||!Number.isFinite(start?.x)||
       !Number.isFinite(start?.y)||radius<=0)return null;
    const inset=Math.max(110,radius+24);
    const cols=Math.ceil((W-2*inset)/this.step)+1;
    const rows=Math.ceil((H-2*inset)/this.step)+1;
    if(cols*rows>8000)return null; // evita travamento com mapas aberrantes
    const dx=(W-2*inset)/(cols-1),dy=(H-2*inset)/(rows-1);
    const cell=(ix,iy)=>({x:inset+ix*dx,y:inset+iy*dy});
    const id=(ix,iy)=>iy*cols+ix,positions=[],free=[];
    for(let iy=0;iy<rows;iy++)for(let ix=0;ix<cols;ix++){
      const p=cell(ix,iy);positions.push(p);
      free.push(this.pointClear(p,rocks,radius));
    }
    const finalCol=exitEast?cols-1:0;
    const targetY=Math.max(inset,Math.min(H-inset,start.y));
    const goalCandidates=[];
    for(let iy=0;iy<rows;iy++){
      const n=id(finalCol,iy);
      if(free[n])goalCandidates.push({n,d:Math.abs(positions[n].y-targetY)});
    }
    goalCandidates.sort((a,b)=>a.d-b.d);
    if(!goalCandidates.length)return null;
    // A margem de saída pode estar bloqueada em um canal; tente os 5
    // destinos de margem mais próximos antes de declarar rota impossível.
    const starts=[];
    for(let n=0;n<positions.length;n++){
      if(!free[n]||!this.lineClear(start,positions[n],rocks,radius))continue;
      starts.push({n,d:Math.hypot(start.x-positions[n].x,start.y-positions[n].y)});
    }
    starts.sort((a,b)=>a.d-b.d);
    if(!starts.length)return null;
    const startIndex=starts[0].n;
    const dirs=[[-1,0],[1,0],[0,-1],[0,1],
      [-1,-1],[-1,1],[1,-1],[1,1]];
    for(const destination of goalCandidates.slice(0,Math.min(5,goalCandidates.length))){
      const goal=destination.n;
      const size=positions.length;
      const g=new Float64Array(size);g.fill(Infinity);
      const from=new Int32Array(size);from.fill(-1);
      const visited=new Uint8Array(size),open=[];
      const heur=n=>Math.hypot(positions[n].x-positions[goal].x,
        positions[n].y-positions[goal].y);
      g[startIndex]=starts[0].d;
      open.push({n:startIndex,f:g[startIndex]+heur(startIndex)});
      let found=false;
      while(open.length){
        open.sort((a,b)=>b.f-a.f);
        const current=open.pop().n;
        if(visited[current])continue;
        if(current===goal){found=true;break;}
        visited[current]=1;
        const ix=current%cols,iy=Math.floor(current/cols);
        for(const [xx,yy] of dirs){
          const nx=ix+xx,ny=iy+yy;
          if(nx<0||nx>=cols||ny<0||ny>=rows)continue;
          const next=id(nx,ny);
          if(!free[next]||visited[next]||
             !this.lineClear(positions[current],positions[next],rocks,radius))continue;
          const distance=Math.hypot(xx*dx,yy*dy),cost=g[current]+distance;
          if(cost>=g[next])continue;
          g[next]=cost;from[next]=current;
          open.push({n:next,f:cost+heur(next)});
        }
      }
      if(!found)continue;
      const steps=[],guard=positions.length;
      let current=goal;
      for(let i=0;i<guard&&current!==-1;i++){
        steps.push(positions[current]);
        if(current===startIndex)break;
        current=from[current];
      }
      steps.reverse();
      if(!steps.length||steps[0]!==positions[startIndex])continue;
      const waypoints=[];
      let last=start,idx=0;
      while(idx<steps.length){
        let far=idx;
        for(let j=steps.length-1;j>=idx;j--){
          if(this.lineClear(last,steps[j],rocks,radius)){far=j;break;}
        }
        const next=steps[far];
        if(Math.hypot(next.x-last.x,next.y-last.y)>1)waypoints.push(next);
        last=next;idx=far+1;
      }
      if(!waypoints.length)waypoints.push(positions[goal]);
      let length=0,p=start;
      for(const next of waypoints){
        length+=Math.hypot(next.x-p.x,next.y-p.y);p=next;
      }
      return {waypoints:waypoints.map(p=>({x:p.x,y:p.y})),length,
        end:{...positions[goal]},start:{x:start.x,y:start.y},
        steps:steps.length,margin:this.padding};
    }
    return null;
  },
  captureWindow(s,target,route,stage){
    const playerDamage=Math.max(1,Number(s?.shipStats?.cannonDamage)||23);
    const balls=Math.max(1,Number(s?.shipStats?.balls)||1);
    const effectiveDamage=playerDamage*balls*.67;
    // Abordagem exige ~76% de dano, com espaço para tiros perdidos.
    const hits=Math.ceil(target.maxhp*.76/effectiveDamage);
    const charge=typeof SEA_GUNNERY!=='undefined'?
      Math.max(.9,Math.min(3,SEA_GUNNERY.chargeMs(s.profile?.levels?.cadencia||0)/1000)):2;
    const cruise=Math.max(68,Math.min(130,Number(target.speed)||105));
    const travel=route.length/cruise;
    const combat=Math.max(40,hits*charge*1.7+22);
    // O caminho fornece tempo físico, a escolta cria a dificuldade extra.
    const seconds=Math.ceil(travel+combat+Math.min(22,stage*.7));
    return Math.max(95,Math.min(320,seconds));
  }
});
