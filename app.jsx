var tableClickHandler = function(square, table){
    var prevPiece = table.state.currentPiece;
    var moves = prevPiece.getPossibleMove();
    
    if(prevPiece != null && isInPossibleMove(moves, square.props.row, square.props.column)){
        var piecePos = table.data.game.piecePosition;
        piecePos[square.props.row][square.props.column] = prevPiece.props.data;
        piecePos[prevPiece.props.row][prevPiece.props.column] = ""
        table.updateData(piecePos);
        table.setState({"possibleMoves": null});
    }  else{
        table.setState({"currentPiece": null});
    }
};

var pieceClickHandler = function(piece, table){
    var prevPiece = table.state.currentPiece;
    if(prevPiece != null){
        var moves = prevPiece.getPossibleMove();
    }
    
    if(prevPiece === piece){
        table.setState({"currentPiece": null});    
    } else if(prevPiece != null && isInPossibleMove(moves, piece.props.row, piece.props.column)){
        table.setState({"currentPiece": null});
        var piecePos = table.data.game.piecePosition;
        piecePos[piece.props.row][piece.props.column] = prevPiece.props.data;
        piecePos[prevPiece.props.row][prevPiece.props.column] = ""
        table.updateData(piecePos);
    } else if(piece.props.white === table.data.game.whiteTurn){
        table.setState({"currentPiece": piece, "possibleMoves": piece.getPossibleMove()});
    } else{
        table.setState({"currentPiece": null});
    }
};

var isInPossibleMove = function(moves, row, column){
    if(moves == null){
        return false;
    }
    for(var a = 0; a < moves.length; a++){
        var move = moves[a];
        if(move.row === row && move.column === column) return true;
    }
    return false;
};

var loadGameClickGlobal = function(parent, id){
    parent.loadGame(id);
}

App = React.createClass({
   
   getInitialState: function(){
       return {
        chessTableShown: false,
        currentGameId: ""
       };
   },
   newGameClick: function(event){
       
       event.preventDefault();
       var text = ReactDOM.findDOMNode(this.refs.gameName).value.trim();
       var pieceMoved = [];
       for(var i  = 0; i < 8; i++){
           pieceMoved[i] = [];
           for(var j = 0; j < 8; j++){
               pieceMoved[i][j] = false;
           }
       }
       var id = Games.insert({
           name: text,
           createdAt: new Date(),
           piecePosition: [["rb","nb","bb","qb","kb","bb","nb","rb"],
                    ["pb","pb","pb","pb","pb","pb","pb","pb"],
                    ["","","","","","","",""],
                    ["","","","","","","",""],
                    ["","","","","","","",""],
                    ["","","","","","","",""],
                    ["pw","pw","pw","pw","pw","pw","pw","pw"],
                    ["rw","nw","bw","qw","kw","bw","nw","rw"]],
            pieceMoved: pieceMoved,
            whiteTurn: true
       })
       this.loadGame(id);
   },
   loadGame: function(id){
       this.setState({chessTableShown: true, currentGameId: id});
   },
   render: function(){
     if (this.state.chessTableShown){
         return ( 
             <Table id={this.state.currentGameId}/> 
         );
     } else {
         return ( 
             <div>
                 <div>
                     <form onSubmit={this.newGameClick}>
                         <input type="field" ref="gameName" placeholder="Name of game"/>
                         <input type="submit" value="New game"/>   
                     </form>
                 </div>
                 <div>
                    <ListGame parent={this}/>
                 </div>
             </div>
             );
     }
   },
});

ListGame = React.createClass({
   
   mixins: [ReactMeteorData],
   
   getMeteorData(){
     var temp= Games.find().fetch();
     return{
         games: temp
     }  
     this.render();
   },
    render:function(){
        if(this.data.games.length > 0){
            return (
            <div>
                {this.data.games.map(function(game){
                    var boundClick = loadGameClickGlobal.bind(this, this.props.parent, game._id);
                    return(
                        <div key={"div" + game._id}>
                            <Game name={game.name} key={game._id}/>
                            <button key={"button" + game._id} type="button" onClick={boundClick}>Load game</button>
                        </div>
                    );
                }.bind(this))}
            </div>  
            );
        } else{
            return <h1>Loading</h1>
        }
    } 
});

Game = React.createClass({
    render:function(){
        return (
            <h1>{this.props.name}</h1>
        )
    }
})

Table = React.createClass({
    mixins: [ReactMeteorData],
   
    getMeteorData(){
        var temp= Games.findOne({_id:this.props.id});
        return{
         game: temp
        }  
        this.render();
    },
    
    updateData(piecePos){
        Games.update({_id: this.props.id}, {$set: {piecePosition: piecePos, whiteTurn: !this.data.game.whiteTurn}})  
    },
    getInitialState:function(){
        return {
            currentPiece: null, 
            whiteTurn:true,
            possibleMoves:null,
        };  
    },
    
    highlight:function(i,j){
        if(this.state.currentPiece != null){
            return isInPossibleMove(this.state.possibleMoves, i, j);
        }
        return false;
    },
    
    render: function() {
        if(this.data.game.piecePosition !== undefined){
            return (
              <div className="chessTable">
                {this.data.game.piecePosition.map(function(item, i) {
                  var result = item.map(function(square, j){
                    return (
                        <Square row={i} column={j} data={square} highlight={this.highlight(i,j)} parent={this} />
                    );
                  }, this);
                  return result;
                }, this)}
            
              </div>
            );
        } else{
            return ( <div>Loading</div>);
        }
        
    }
});

Pawn = React.createClass({
    getPossibleMove:function(){
        var ret = [];
        ret.push({row:this.props.row, column:this.props.column});
        
        if(this.props.white){
            if(this.checkIfPieceAndAddMove(this.props.row-1, this.props.column, ret)){
                if(this.props.row == 6){
                    this.checkIfPieceAndAddMove(this.props.row-2, this.props.column, ret)
                }    
            }
            this.checkIfEnemyAndAddMove(this.props.row-1, this.props.column-1, ret);
            this.checkIfEnemyAndAddMove(this.props.row-1, this.props.column+1, ret);
        } else{
             if(this.checkIfPieceAndAddMove(this.props.row+1, this.props.column, ret)){
                if(this.props.row == 1){
                    this.checkIfPieceAndAddMove(this.props.row+2, this.props.column, ret)
                }    
            }
            this.checkIfEnemyAndAddMove(this.props.row+1, this.props.column-1, ret);
            this.checkIfEnemyAndAddMove(this.props.row+1, this.props.column+1, ret);
        }
        return ret;
    },
    checkIfPieceAndAddMove: function(row, column, moves){
        if(row < 0 || row > 7) return;
        if(column < 0 || column > 7) return;
        
        var data = this.props.root.data.game.piecePosition;
        if (data[row][column] === ""){
            moves.push({row:row, column:column});
            return true;
        }
        return false;
    },
    checkIfEnemyAndAddMove: function(row, column, moves){
        if(row < 0 || row > 7) return;
        if(column < 0 || column > 7) return;
        
        var data = this.props.root.data.game.piecePosition;
        if ((data[row][column].endsWith("w") && !this.props.white) || 
            (data[row][column].endsWith("b") && this.props.white)){
                moves.push({row:row,column:column});
                return true;
            }
        return false;
    },
    getHTML: function(){
        var ret = {};
        if(this.props.white){
            ret.__html = "&#9817"
        } else{
            ret.__html = "&#9823"
        }
        return ret;
    },
    render:function(){
        return (
            <div dangerouslySetInnerHTML={this.getHTML()} className={this.props.class} onClick={pieceClickHandler.bind(this,this,this.props.root)}></div>
        );
    } 
});

Knight = React.createClass({
    getPossibleMove:function(){
        var ret = [];
        ret.push({row:this.props.row, column:this.props.column});
        
        var moves = [[1,2],[1,-2],
                    [2,1],[2,-1],
                    [-1,2],[-1,-2],
                    [-2,1],[-2,-1]];
        for(var i = 0; i < moves.length; i++){
            this.checkIfNotFriendAddMove(this.props.row + moves[i][0], this.props.column + moves[i][1], ret);
        }
        return ret;
    },
    checkIfNotFriendAddMove: function(row, column, moves){
        if(row < 0 || row > 7) return;
        if(column < 0 || column > 7) return;
        
        var data = this.props.root.data.game.piecePosition;
        if(data[row][column] === ""){
            moves.push({row:row,column:column});
            return true;
        }else if ((data[row][column].endsWith("w") && !this.props.white) || 
            (data[row][column].endsWith("b") && this.props.white)){
                moves.push({row:row,column:column});
                return true;
            }
        return false;
    },
    getHTML: function(){
        var ret = {};
        if(this.props.white){
            ret.__html = "&#9816"
        } else{
            ret.__html = "&#9822"
        }
        return ret;
    },
    render:function(){
        return (
            <div dangerouslySetInnerHTML={this.getHTML()} className={this.props.class} onClick={pieceClickHandler.bind(this,this,this.props.root)}></div>
        );
    }    
});

Bishop = React.createClass({
    getPossibleMove:function(){
        var ret=[];
        ret.push({row:this.props.row, column:this.props.column});
        var i = this.props.row + 1;
        var j = this.props.column + 1;
        while(this.isEmptySquare(i,j, ret)){
            i++;
            j++;
        }
        
        i = this.props.row - 1;
        j = this.props.column + 1;
        while(this.isEmptySquare(i,j, ret)){
            i--;
            j++;
        }
        
        i = this.props.row - 1;
        j = this.props.column - 1;
        while(this.isEmptySquare(i,j, ret)){
            i--;
            j--;
        }
        
        i = this.props.row + 1;
        j = this.props.column - 1;
        while(this.isEmptySquare(i,j, ret)){
            i++;
            j--;
        }
        return ret;
    },
    isEmptySquare: function(row, column, moves){
        if(row < 0 || row > 7) return false;
        if(column < 0 || column > 7) return false;
        
        var data = this.props.root.data.game.piecePosition;
        if(data[row][column] === ""){
            moves.push({row:row,column:column});
            return true;
        }else if ((data[row][column].endsWith("w") && !this.props.white) || 
            (data[row][column].endsWith("b") && this.props.white)){
                moves.push({row:row,column:column});
                return false;
            }
        return false;
    },
    getHTML: function(){
        var ret = {};
        if(this.props.white){
            ret.__html = "&#9815"
        } else{
            ret.__html = "&#9821"
        }
        return ret;
    },
    render:function(){
        return (
            <div dangerouslySetInnerHTML={this.getHTML()} className={this.props.class} onClick={pieceClickHandler.bind(this,this,this.props.root)}></div>
        );
    }    
});

Rook = React.createClass({
    getPossibleMove:function(){
        var ret = [];
        ret.push({row:this.props.row, column:this.props.column});
        
        var i = this.props.row + 1;
        var j = this.props.column;
        while(this.isEmptySquare(i,j, ret)){
            i++;
        }
        
        i = this.props.row - 1;
        while(this.isEmptySquare(i,j, ret)){
            i--;
        }
        
        i = this.props.row;
        j = this.props.column + 1;
        while(this.isEmptySquare(i,j, ret)){
            j++;
        }
        
        j = this.props.column - 1;
        while(this.isEmptySquare(i,j, ret)){
            j--;
        }
        
        return ret;
    },
     
    isEmptySquare: function(row, column, moves){
        if(row < 0 || row > 7) return false;
        if(column < 0 || column > 7) return false;
        
        var data = this.props.root.data.game.piecePosition;
        if(data[row][column] === ""){
            moves.push({row:row,column:column});
            return true;
        }else if ((data[row][column].endsWith("w") && !this.props.white) || 
            (data[row][column].endsWith("b") && this.props.white)){
                moves.push({row:row,column:column});
                return false;
            }
        return false;
    },
    getHTML: function(){
        var ret = {};
        if(this.props.white){
            ret.__html = "&#9814"
        } else{
            ret.__html = "&#9820"
        }
        return ret;
    },
    render:function(){
        return (
            <div dangerouslySetInnerHTML={this.getHTML()} className={this.props.class} onClick={pieceClickHandler.bind(this,this,this.props.root)}></div>
        );
    }
});

Queen = React.createClass({
    getPossibleMove:function(){
        var ret = [];
        ret.push({row:this.props.row, column:this.props.column});
        
        //rooks move
        var i = this.props.row + 1;
        var j = this.props.column;
        while(this.isEmptySquare(i,j, ret)){
            i++;
        }
        
        i = this.props.row - 1;
        while(this.isEmptySquare(i,j, ret)){
            i--;
        }
        
        i = this.props.row;
        j = this.props.column + 1;
        while(this.isEmptySquare(i,j, ret)){
            j++;
        }
        
        j = this.props.column - 1;
        while(this.isEmptySquare(i,j, ret)){
            j--;
        }
        
        //bishops move
        i = this.props.row + 1;
        j = this.props.column + 1;
        while(this.isEmptySquare(i,j, ret)){
            i++;
            j++;
        }
        
        i = this.props.row - 1;
        j = this.props.column + 1;
        while(this.isEmptySquare(i,j, ret)){
            i--;
            j++;
        }
        
        i = this.props.row - 1;
        j = this.props.column - 1;
        while(this.isEmptySquare(i,j, ret)){
            i--;
            j--;
        }
        
        i = this.props.row + 1;
        j = this.props.column - 1;
        while(this.isEmptySquare(i,j, ret)){
            i++;
            j--;
        }
        return ret;
    },
    isEmptySquare: function(row, column, moves){
        if(row < 0 || row > 7) return false;
        if(column < 0 || column > 7) return false;
        
        var data = this.props.root.data.game.piecePosition;
        if(data[row][column] === ""){
            moves.push({row:row,column:column});
            return true;
        }else if ((data[row][column].endsWith("w") && !this.props.white) || 
            (data[row][column].endsWith("b") && this.props.white)){
                moves.push({row:row,column:column});
                return false;
            }
        return false;
    },
    getHTML: function(){
        var ret = {};
        if(this.props.white){
            ret.__html = "&#9813"
        } else{
            ret.__html = "&#9819"
        }
        return ret;
    },
    render:function(){
        return (
            <div dangerouslySetInnerHTML={this.getHTML()} className={this.props.class} onClick={pieceClickHandler.bind(this,this,this.props.root)}></div>
        );
    }
});

King = React.createClass({
    getPossibleMove:function(){
        var ret = [];
        ret.push({row:this.props.row, column:this.props.column});
        
        for(var i =-1; i <= 1; i++){
            for(var j=-1; j <=1; j++){
                this.isEmptySquare(this.props.row + i, this.props.column + j,ret);
            }
        }
        return ret;
    },
   isEmptySquare: function(row, column, moves){
        if(row < 0 || row > 7) return false;
        if(column < 0 || column > 7) return false;
        
        var data = this.props.root.data.game.piecePosition;
        if(data[row][column] === ""){
            moves.push({row:row,column:column});
            return true;
        }else if ((data[row][column].endsWith("w") && !this.props.white) || 
            (data[row][column].endsWith("b") && this.props.white)){
                moves.push({row:row,column:column});
                return false;
            }
        return false;
    },
    getHTML: function(){
        var ret = {};
        if(this.props.white){
            ret.__html = "&#9812"
        } else{
            ret.__html = "&#9818"
        }
        return ret;
    },
    render:function(){
        return (
            <div dangerouslySetInnerHTML={this.getHTML()} className={this.props.class} onClick={pieceClickHandler.bind(this,this,this.props.root)}></div>
        );
    } 
});
Square = React.createClass({
    handleClick:function(){
        if(this.props.data !== ""){
            this.setState({"clicked": !this.state.clicked});
        }
    },
    squareClass:function(){
        var r = parseInt(this.props.row);
        var c = parseInt(this.props.column);
        if(this.props.highlight) return "square yellow";
        if((r + c) % 2 === 0) return "square black";
        return "square white";
    },
    getDivInside:function(){
        return {__html: ""}
    },
    isWhite: function(){
        if(this.props.data.endsWith("w")){
            return true;
        } else return false;
    },
    render:function(){
        switch(this.props.data){
            case "pb":
            case "pw":
                return ( <Pawn class={this.squareClass()} root={this.props.parent} white={this.isWhite()} 
                    row={this.props.row} column={this.props.column} data={this.props.data}/>);
            case "nb":
            case "nw":
                return ( <Knight class={this.squareClass()} root={this.props.parent} white={this.isWhite()} 
                    row={this.props.row} column={this.props.column} data={this.props.data}/>);
            case "bb":
            case "bw":
                return ( <Bishop class={this.squareClass()} root={this.props.parent} white={this.isWhite()} 
                    row={this.props.row} column={this.props.column} data={this.props.data}/>);
            case "rb":
            case "rw":
                return ( <Rook class={this.squareClass()} root={this.props.parent} white={this.isWhite()} 
                    row={this.props.row} column={this.props.column} data={this.props.data}/>);
            case "qb":
            case "qw":
                return ( <Queen class={this.squareClass()} root={this.props.parent} white={this.isWhite()} 
                    row={this.props.row} column={this.props.column} data={this.props.data}/>);
            case "kb":
            case "kw":
                return ( <King class={this.squareClass()} root={this.props.parent} white={this.isWhite()} 
                    row={this.props.row} column={this.props.column} data={this.props.data}/>);
            default:
                 return (<div dangerouslySetInnerHTML={this.getDivInside()} className={this.squareClass()} 
                    onClick={tableClickHandler.bind(this, this, this.props.parent)}></div>);
        }
        
    } 
})