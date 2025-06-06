const WHITE='w';
const BLACK='b';
const PIECES={
  'P':{char:'\u2659',value:1},
  'R':{char:'\u2656',value:5},
  'N':{char:'\u2658',value:3},
  'B':{char:'\u2657',value:3},
  'Q':{char:'\u2655',value:9},
  'K':{char:'\u2654',value:1000},
  'p':{char:'\u265F',value:-1},
  'r':{char:'\u265C',value:-5},
  'n':{char:'\u265E',value:-3},
  'b':{char:'\u265D',value:-3},
  'q':{char:'\u265B',value:-9},
  'k':{char:'\u265A',value:-1000}
};
let board=[];
const boardDiv=document.getElementById('board');
function initBoard(){
  board=[
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];
}
function drawBoard(){
  boardDiv.innerHTML='';
  for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
      const sq=document.createElement('div');
      sq.className='square '+((i+j)%2===0?'light':'dark');
      sq.dataset.r=i; sq.dataset.c=j;
      const p=board[i][j];
      if(p!==' ') sq.textContent=PIECES[p].char;
      sq.addEventListener('click',squareClick);
      boardDiv.appendChild(sq);
    }
  }
}
let selected=null;
function squareClick(){
  const r=parseInt(this.dataset.r); const c=parseInt(this.dataset.c);
  if(selected){
    if(tryMove(selected.r,selected.c,r,c)){
      selected=null; drawBoard(); setTimeout(aiMove,100);
    }else{ selected=null; drawBoard(); }
  }else{
    const p=board[r][c];
    if(p!==' ' && p===p.toUpperCase()){
      this.classList.add('selected');
      selected={r,c};
    }
  }
}
function tryMove(sr,sc,dr,dc){
  const p=board[sr][sc];
  const moves=generateMoves(board,sr,sc);
  for(const m of moves){
    if(m[0]===dr && m[1]===dc){
      board[dr][dc]=p;
      board[sr][sc]=' ';
      return true;
    }
  }
  return false;
}
function lineMoves(b,r,c,directions,color){
  const moves=[];
  for(const d of directions){
    let i=r+d[0], j=c+d[1];
    while(inBounds(i,j) && b[i][j]==' '){
      moves.push([i,j]);
      i+=d[0];
      j+=d[1];
    }
    if(inBounds(i,j) && isOpponent(color,b[i][j])) moves.push([i,j]);
  }
  return moves;
}

function generateMoves(b,r,c){
  const piece=b[r][c];
  if(piece===' ') return [];
  const color=piece===piece.toUpperCase()?WHITE:BLACK;
  let moves=[];
  switch(piece.toLowerCase()){
    case 'p':{
      const dir=color===WHITE?-1:1;
      if(inBounds(r+dir,c) && b[r+dir][c]==' ') moves.push([r+dir,c]);
      if((color===WHITE && r===6)||(color===BLACK && r===1)) if(b[r+2*dir][c]==' ') moves.push([r+2*dir,c]);
      for(const dc of[-1,1]){ if(inBounds(r+dir,c+dc)){ const t=b[r+dir][c+dc]; if(t!=' '&&isOpponent(color,t)) moves.push([r+dir,c+dc]); } }
      break; }
    case 'r':
      moves.push(...lineMoves(b,r,c,[[1,0],[-1,0],[0,1],[0,-1]],color));
      break;
    case 'n':
      for(const d of [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]){
        let i=r+d[0],j=c+d[1];
        if(inBounds(i,j)&&!isFriendly(color,b[i][j])) moves.push([i,j]);
      }
      break;
    case 'b':
      moves.push(...lineMoves(b,r,c,[[1,1],[1,-1],[-1,1],[-1,-1]],color));
      break;
    case 'q':
      moves.push(
        ...lineMoves(b,r,c,[[1,0],[-1,0],[0,1],[0,-1]],color),
        ...lineMoves(b,r,c,[[1,1],[1,-1],[-1,1],[-1,-1]],color)
      );
      break;
    case 'k':
      for(const d of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
        let i=r+d[0],j=c+d[1];
        if(inBounds(i,j)&&!isFriendly(color,b[i][j])) moves.push([i,j]);
      }
      break;
  }
  return moves;
}
function inBounds(r,c){ return r>=0 && r<8 && c>=0 && c<8; }
function isOpponent(color,piece){ return piece!=' ' && (color===WHITE ? piece===piece.toLowerCase() : piece===piece.toUpperCase()); }
function isFriendly(color,piece){ return piece!=' ' && !isOpponent(color,piece); }
function aiMove(){
  const best=minimax(board,2,false);
  if(best.move){
    const [sr,sc,dr,dc]=best.move;
    board[dr][dc]=board[sr][sc];
    board[sr][sc]=' ';
    drawBoard();
  }
}
function evaluate(b){
  let score=0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const p=b[r][c]; if(p!=' ') score+=PIECES[p].value; }
  return score;
}
function cloneBoard(b){ return b.map(row=>row.slice()); }
function allMoves(b,color){
  const ms=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=b[r][c];
    if(p!=' ' && (color===WHITE?p===p.toUpperCase():p===p.toLowerCase())){
      const moves=generateMoves(b,r,c);
      for(const m of moves) ms.push([r,c,m[0],m[1]]);
    }
  }
  return ms;
}
function minimax(b,depth,isMax){
  if(depth===0) return {score:evaluate(b)};
  const color=isMax?BLACK:WHITE;
  const moves=allMoves(b,color);
  let best={score:isMax?-Infinity:Infinity,move:null};
  for(const m of moves){
    const nb=cloneBoard(b);
    nb[m[2]][m[3]]=nb[m[0]][m[1]];
    nb[m[0]][m[1]]=' ';
    const val=minimax(nb,depth-1,!isMax).score;
    if(isMax && val>best.score){ best={score:val,move:m}; }
    if(!isMax && val<best.score){ best={score:val,move:m}; }
  }
  return best;
}
function resetGame(){ initBoard(); drawBoard(); }
initBoard(); drawBoard();
