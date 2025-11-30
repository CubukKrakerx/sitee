const board = document.getElementById('chessboard');
const turnDisplay = document.getElementById('turn');
const messageDisplay = document.getElementById('message');
const themeSelector = document.getElementById('themeSelector');

let selectedSquare = null;
let turn = 'white';
let gameOver = false;

let boardState = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

const pieces = {
  'P':'♙','R':'♖','N':'♘','B':'♗','Q':'♕','K':'♔',
  'p':'♟','r':'♜','n':'♞','b':'♝','q':'♛','k':'♚'
};

// Temalar
const themes = {
  classic: {
    lightSquare: '#d3d3d3',
    darkSquare: '#7a7a7a',  
    whitePiecesColor: 'white',
    blackPiecesColor: 'black',
    boardBackground: '#4f4f4f'
  },
  wood: {
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    whitePiecesColor: 'white',
    blackPiecesColor: 'black',
    boardBackground: '#deb887'
  },
  dark: {
    lightSquare: '#c0c0c0',
    darkSquare: '#333333',
    whitePiecesColor: '#f0f0f0',
    blackPiecesColor: '#0a0a0a',
    boardBackground: '#222222'
  },
    Pleasure: {
    lightSquare: '#4e5000ff',
    darkSquare: '#52003dff',
    whitePiecesColor: '#00ccffff',
    blackPiecesColor: '#4c00ffff',
    boardBackground: '#ff00f2ff'
  }
};

let currentTheme = themes.classic;

// Tema değiştirici
themeSelector.addEventListener('change', () => {
  const selected = themeSelector.value;
  if(themes[selected]){
    currentTheme = themes[selected];
    drawBoard();
  }
});

function colorOf(piece){ return piece ? (piece===piece.toUpperCase()?'white':'black') : null; }

function validMove(piece, fr, fc, tr, tc){
  const dr = tr-fr, dc = tc-fc, target = boardState[tr][tc], color = colorOf(piece);
  const dir = color==='white'?-1:1;

  switch(piece.toUpperCase()){
    case 'P':
      if(dc===0 && target===''){
        if(dr===dir) return true;
        if((fr===6 && color==='white' || fr===1 && color==='black') && dr===2*dir && boardState[fr+dir][fc]==='') return true;
      }
      if(Math.abs(dc)===1 && dr===dir && target && colorOf(target)!==color) return true;
      return false;
    case 'R':
      if(fr!==tr && fc!==tc) return false;
      if(fr===tr){ const step = dc>0?1:-1; for(let c=fc+step;c!==tc;c+=step) if(boardState[fr][c]!=='') return false; }
      else { const step = dr>0?1:-1; for(let r=fr+step;r!==tr;r+=step) if(boardState[r][fc]!=='') return false; }
      return !target || colorOf(target)!==color;
    case 'B':
      if(Math.abs(dr)!==Math.abs(dc)) return false;
      const sr = dr>0?1:-1, sc = dc>0?1:-1;
      for(let r=fr+sr,c=fc+sc;r!==tr;r+=sr,c+=sc) if(boardState[r][c]!=='') return false;
      return !target || colorOf(target)!==color;
    case 'N':
      return ((Math.abs(dr)===2 && Math.abs(dc)===1)||(Math.abs(dr)===1 && Math.abs(dc)===2)) && (!target || colorOf(target)!==color);
    case 'Q':
      return validMove('R',fr,fc,tr,tc) || validMove('B',fr,fc,tr,tc);
    case 'K':
      return Math.abs(dr)<=1 && Math.abs(dc)<=1 && (!target || colorOf(target)!==color);
  }
  return false;
}

function kingPosition(color){
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(boardState[r][c] && boardState[r][c].toUpperCase()==='K' && colorOf(boardState[r][c])===color) return [r,c];
  return null;
}

function isInCheck(color){
  const [kr,kc] = kingPosition(color);
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const p=boardState[r][c];
      if(p && colorOf(p)!==color && validMove(p,r,c,kr,kc)) return true;
    }
  }
  return false;
}

function hasLegalMoves(color){
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const p=boardState[r][c];
      if(p && colorOf(p)===color){
        for(let tr=0;tr<8;tr++){
          for(let tc=0;tc<8;tc++){
            if(validMove(p,r,c,tr,tc)){
              const backup=boardState[tr][tc];
              boardState[tr][tc]=p; boardState[r][c]='';
              if(!isInCheck(color)){ boardState[r][c]=p; boardState[tr][tc]=backup; return true; }
              boardState[r][c]=p; boardState[tr][tc]=backup;
            }
          }
        }
      }
    }
  }
  return false;
}

function checkEnd(color){
  if(isInCheck(color) && !hasLegalMoves(color)){
    messageDisplay.textContent = `Mat! ${(color==='white'?'Siyah':'Beyaz')} kazandı!`;
    gameOver=true;
  } else if(!isInCheck(color) && !hasLegalMoves(color)){
    messageDisplay.textContent = 'Pat! Oyun berabere.';
    gameOver=true;
  } else if(isInCheck(color)){
    messageDisplay.textContent='Şah çekildi!';
  } else {
    messageDisplay.textContent='';
  }
}

function drawBoard(){
  board.style.backgroundColor = currentTheme.boardBackground;
  board.innerHTML='';
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const sq = document.createElement('div');
      sq.classList.add('square');
      sq.dataset.row=r; sq.dataset.col=c;
      sq.style.backgroundColor = (r+c)%2===0 ? currentTheme.lightSquare : currentTheme.darkSquare;

      const piece = boardState[r][c];
      if(piece){
        const span = document.createElement('span');
        span.textContent = pieces[piece];
        span.style.color = colorOf(piece)==='white' ? currentTheme.whitePiecesColor : currentTheme.blackPiecesColor;
        sq.appendChild(span);
      }

      sq.addEventListener('click', clickSquare);
      board.appendChild(sq);
    }
  }
  turnDisplay.textContent = `Sıra: ${turn==='white'?'Beyaz':'Siyah'}`;
}

function clickSquare(e){
  if(gameOver) return;
  const r=parseInt(e.currentTarget.dataset.row), c=parseInt(e.currentTarget.dataset.col);
  const p=boardState[r][c];

  if(p && colorOf(p)===turn){
    if(selectedSquare) selectedSquare.classList.remove('selected');
    selectedSquare=e.currentTarget;
    e.currentTarget.classList.add('selected');
    return;
  }

  if(selectedSquare){
    const fr=parseInt(selectedSquare.dataset.row), fc=parseInt(selectedSquare.dataset.col), piece=boardState[fr][fc];
    if(validMove(piece,fr,fc,r,c)){
      const backup=boardState[r][c];
      boardState[r][c]=piece; boardState[fr][fc]='';
      if(!isInCheck(turn)){
        selectedSquare.classList.remove('selected');
        selectedSquare=null;
        turn = turn==='white'?'black':'white';
        checkEnd(turn);
        drawBoard();
      } else {
        boardState[fr][fc]=piece; boardState[r][c]=backup;
        messageDisplay.textContent='Geçersiz hamle! Şah tehdit altında.';
      }
    } else {
      messageDisplay.textContent='Geçersiz hamle!';
    }
  }
}

drawBoard();
