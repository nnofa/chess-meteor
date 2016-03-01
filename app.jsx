var tableClickHandler = function(square, table){
    var prevSquare = table.state.currentPiece;
    square.handleClick();
    if(prevSquare != null && prevSquare === square){
        table.setState({"currentPiece": null});
    }else if(prevSquare != null && prevSquare.props.data !== "" && isInPossibleMove(prevSquare.getPossibleMove(), square.props.row, square.props.column)){
        var piecePos = table.state.piecePosition;
        piecePos[square.props.row][square.props.column] = prevSquare.props.data;
        piecePos[prevSquare.props.row][prevSquare.props.column] = ""
        table.setState({"currentPiece": null, "piecePosition":piecePos});
    } else if(square.props.data === ""){
        console.log("secondifif");
        table.setState({"currentPiece": null});
    } else{
         console.log("else");
        table.setState({"currentPiece": square});
    }
};

var isInPossibleMove = function(moves, row, column){
    for(var a = 0; a < moves.length; a++){
        var move = moves[a];
        if(move.row === row && move.column === column) return true;
    }
    return false;
}
var pawnClickHandler = function()
App = React.createClass({
    getInitialState:function(){
        return {currentPiece: null, 
                piecePosition: [["rb","nb","bb","qb","kb","bb","nb","rb"],
                    ["pb","pb","pb","pb","pb","pb","pb","pb"],
                    ["","","","","","","",""],
                    ["","","","","","","",""],
                    ["","","","","","","",""],
                    ["","","","","","","",""],
                    ["pw","pw","pw","pw","pw","pw","pw","pw"],
                    ["rw","nw","bw","qw","kw","bw","nw","rw"]]};  
    },
    highlight:function(i,j){
        if(this.state.currentPiece != null){
            return isInPossibleMove(this.state.currentPiece.getPossibleMove(), i, j);
        }
        return false;
    },
    render: function() {
        var data
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
    getInitialState: function() {
        return {moved: false, white:true};
    },

    render:function(){
        return (
            <div dangerouslySetInnerHTML={{__html: "&#9817"}} className={this.props.class} onClick={this.props.onClick}></div>
        );
    } 
});

Square = React.createClass({
    getInitialState: function() {
        return {moved: false};
    },
    handleClick:function(){
        if(this.props.data !== ""){
            this.setState({"clicked": !this.state.clicked});
        }
        console.log("test");
    },
    squareClass:function(){
        var r = parseInt(this.props.row);
        var c = parseInt(this.props.column);
        if(this.props.highlight) return "square beige";
        if((r + c) % 2 === 0) return "square black";
        return "square white";
    },
    getDivInside:function(){
        switch(this.props.data){
            case "rb":
                return {__html: "&#9820"};
            case "nb":
                return {__html: "&#9822"};
            case "bb":
                return {__html: "&#9821"};
            case "qb":
                return {__html: "&#9818"};
            case "kb":
                return {__html: "&#9819"};
            case "pb":
                return {__html: "&#9823"};
            case "kw":
                return {__html: "&#9812"};
            case "qw":
                return {__html: "&#9813"};
            case "rw":
                return {__html: "&#9814"};
            case "bw":
                return {__html: "&#9815"};
            case "nw":
                return {__html: "&#9816"};
            case "pw":
                return {__html: "&#9817"};
            default:
                return {__html: ""}
        }
    },
    getPossibleMove:function(){
        var ret = [];
        switch(this.props.data){
            case "pb":
                ret.push({row:this.props.row, column:this.props.column})
                ret.push({row:this.props.row+1, column:this.props.column})
                if(!this.state.moved){
                    ret.push({row:this.props.row+2, column:this.props.column})
                }
                break;
            default:
                
        }
        return ret;
    },
    render:function(){
        if (this.props.data !== "pw"){
            return (
                <div dangerouslySetInnerHTML={this.getDivInside()} className={this.squareClass()} onClick={tableClickHandler.bind(this, this, this.props.parent)}></div>
            );
        }
        return ( <Pawn class={this.squareClass()} root={this.props.parent}/>);
    } 
})