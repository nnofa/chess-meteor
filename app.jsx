var tableClickHandler = function(square, table){
    var prevPiece = table.state.currentPiece;
    console.log("tableClickHandler");
    if(prevPiece != null && isInPossibleMove(prevPiece.getPossibleMove(), square.props.row, square.props.column)){
        var piecePos = table.state.piecePosition;
        piecePos[square.props.row][square.props.column] = prevPiece.props.data;
        piecePos[prevPiece.props.row][prevPiece.props.column] = ""
        table.setState({"currentPiece": null, "piecePosition":piecePos, whiteTurn: !table.state.whiteTurn});
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
        var piecePos = table.state.piecePosition;
        piecePos[piece.props.row][piece.props.column] = prevPiece.props.data;
        piecePos[prevPiece.props.row][prevPiece.props.column] = ""
        table.setState({"currentPiece": null, "piecePosition":piecePos, whiteTurn: !table.state.whiteTurn});
    } else if(piece.props.white === table.state.whiteTurn){
        table.setState({"currentPiece": piece, "possibleMoves": piece.getPossibleMove()});
    } else{
        table.setState({"currentPiece": null});
    }
};

var isInPossibleMove = function(moves, row, column){
    for(var a = 0; a < moves.length; a++){
        var move = moves[a];
        if(move.row === row && move.column === column) return true;
    }
    return false;
};

App = React.createClass({
    getInitialState:function(){
        return {
            currentPiece: null, 
            piecePosition: [["rb","nb","bb","qb","kb","bb","nb","rb"],
                    ["pb","pb","pb","pb","pb","pb","pb","pb"],
                    ["","","","","","","",""],
                    ["","","","","","","",""],
                    ["","","","","","","",""],
                    ["","","","","","","",""],
                    ["pw","pw","pw","pw","pw","pw","pw","pw"],
                    ["rw","nw","bw","qw","kw","bw","nw","rw"]],
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
        return (
          
          <div className="container">
            <div className="chessTable">
                {this.state.piecePosition.map(function(item, i) {
                  var result = item.map(function(square, j){
                    return (
                        <Square row={i} column={j} data={square} highlight={this.highlight(i,j)} parent={this} />
                    );
                  }, this);
                  return result;
                }, this)}
                
            </div>
          </div>
        );
      }
});

Pawn = React.createClass({
    getPossibleMove:function(){
        var ret = [];
        ret.push({row:this.props.row, column:this.props.column})
        
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
        
        var data = this.props.root.state.piecePosition;
        if (data[row][column] === ""){
            moves.push({row:row, column:column});
            return true;
        }
        return false;
    },
    checkIfEnemyAndAddMove: function(row, column, moves){
        if(row < 0 || row > 7) return;
        if(column < 0 || column > 7) return;
        
        var data = this.props.root.state.piecePosition;
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
        ret.push({row:this.props.row, column:this.props.column})
        
        var moves = [[1,2],[1,-2],
                    [2,1],[2,-1],
                    [-1,2],[-1,-2],
                    [-2,1],[-2,-1]];
        for(var i = 0; i < moves.length; i++){
            console.log(moves[i]);
            this.checkIfNotFriendAddMove(this.props.row + moves[i][0], this.props.column + moves[i][1], ret);
        }
        return ret;
    },
    checkIfNotFriendAddMove: function(row, column, moves){
        if(row < 0 || row > 7) return;
        if(column < 0 || column > 7) return;
        
        var data = this.props.root.state.piecePosition;
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
        ret.push({row:this.props.row, column:this.props.column})
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
        
        var data = this.props.root.state.piecePosition;
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
        switch(this.props.data){
            case "rb":
                return {__html: "&#9820"};
            case "qb":
                return {__html: "&#9819"};
            case "kb":
                return {__html: "&#9818"};
            case "kw":
                return {__html: "&#9812"};
            case "qw":
                return {__html: "&#9813"};
            case "rw":
                return {__html: "&#9814"};
            default:
                return {__html: ""}
        }
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
            default:
                 return (<div dangerouslySetInnerHTML={this.getDivInside()} className={this.squareClass()} 
                    onClick={tableClickHandler.bind(this, this, this.props.parent)}></div>);
        }
        
    } 
})