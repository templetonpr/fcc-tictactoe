var playerMark = ""; // Player's mark
var compMark = ""; // Comp's mark
var wins = 0; // Number of player wins.
var games = 0; // Number of games played to completion.
var easyMode = false; // Makes comp always select randomly.
var gameState = "player"; // Current state of game. Can be end, player, or comp.

// Board model. "P" for player, "C" for comp, and "E" for empty.
var boardState = {
  s1: "E",
  s2: "E",
  s3: "E",
  s4: "E",
  s5: "E",
  s6: "E",
  s7: "E",
  s8: "E",
  s9: "E"
};

// Lookup table containing all possible win conditions.
var WINTABLE = {
  // horizontal
  horizontal1: [1, 2, 3],
  horizontal2: [4, 5, 6],
  horizontal3: [7, 8, 9],
  //vertical
  vertical1: [1, 4, 7],
  vertical2: [2, 5, 8],
  vertical3: [3, 6, 9],
  // diagonal
  diagonal1: [1, 5, 9],
  diagonal2: [3, 5, 7]
};

function resetBoard() {
  // resets board.
  $('#dialog').css("display", "none");
  $('#board').css("display", "table");
  $('.square').text("");
  $('.square').css("background-color", "#fff");
  for (var i = 1; i <= 9; i++) {
    boardState["s" + i] = "E";
  }
  gameState = "player";
}

function showWinningSquares(winCond, winner) {
  $('.square').css("background-color", "#fff");
  var squares = WINTABLE[winCond];
  for (var i = 0; i < squares.length; i++) {
    $('#s' + squares[i]).css("background-color", winner == "P" ? "#f00" : "#00f");
  }
}

function lookForTwo(mark) {
  var goodSquares = [];
  $.each(WINTABLE, function(k, v){
    var marks = [];
    var empty = [];
    for (var i = 0; i < v.length; i++) {
      if (boardState["s" + v[i]] == mark) {
        marks.push("s"+v[i]);
      } else if (boardState["s" + v[i]] == "E") {
        empty.push("s"+v[i]);
      }
    }
    if (marks.length == 2 && empty.length == 1) {
      goodSquares.push(empty[0]);
    }
  });
  
  if (goodSquares.length > 0) {
    return goodSquares[0];
  } else {
    return false;
  }
}

function getEmptySquares() { // returns array containing id of empty squares or false if none
  var emptySquares = [];
  $.each(boardState, function (k, v) {
    if (v == "E") {
      emptySquares.push(k);
    }
  });
  if (emptySquares.length) {
    return emptySquares;
  } else {
    return false;
  }
}

function compDoTurn() {
  if (gameState == "comp") {
    var squares = getEmptySquares();
    if (squares) {
      var selection;
      
      if (!easyMode) {
        // first, look for an empty square in a row with two comp squares already
        // if there aren't any, look for an empty square in a row with two player squares already
        // next, pick s5 if available
        // finally, pick a random square
        
        var foundCMove = lookForTwo("C");
        var foundPMove = lookForTwo("P");
        if (foundCMove){
          selection = foundCMove;
          console.log("Comp Offense " + selection);
        } else if (foundPMove) {
          selection = foundPMove;
          console.log("Comp Defensive " + selection);
        } else if (squares.indexOf("s5") != -1) {
          selection = "s5";
          console.log("Comp center " + selection);
        } else {
          selection = squares[Math.floor(Math.random() * squares.length)];
          console.log("Comp random " + selection);
        }
      } else { // easyMode enabled
        selection = squares[Math.floor(Math.random() * squares.length)];
      }
      boardState[selection] = "C";

      $("#" + selection).text(compMark);
      $("#" + selection).css("background-color", "#00f");
      $("#" + selection).animate({
        backgroundColor: "#fff"
      }, 500);

      if (!checkForWin()) {
        gameState = "player";
      }
    } else {
      checkForWin();
    }
  }
}

function checkForWin() {
  // compares board against each win condition in WINTABLE
  $.each(WINTABLE, function (k, v) {
    if (boardState["s" + v[0]] != "E") {
      var lookingFor = boardState["s" + v[0]];
      if (boardState["s" + v[1]] == lookingFor && boardState["s" + v[2]] == lookingFor) {
        console.log("Win detected: " + k);
        gameState = "end";
        $('#wins').text("Wins: " + wins);
        $('#games').text("games: " + games);
        var winner = lookingFor;
        showWinningSquares(k, winner);
        if (winner == "P") {
          wins++;
          games++;
          $('#wins').text("Wins: " + wins);
          $('#games').text("games: " + games);
          console.log("Player won!");
          alert("Player Won!");
          resetBoard();
          return "player";
        } else {
          games++;
          $('#wins').text("Wins: " + wins);
          $('#games').text("games: " + games);
          console.log("Comp won!");
          alert("Comp Won!");
          resetBoard();
          return "comp";
        }
      }
    }
  });

  var emptySquares = getEmptySquares();
  if (!emptySquares) {
    // no more empty squares, game ends in draw.
    gameState = "end";
    games++;
    $('#wins').text("Wins: " + wins);
    $('#games').text("games: " + games);
    console.log("Game ended in a draw");
    alert("Draw");
    resetBoard();
    return "draw";
  } else {
    return false;
  }
}

$(function () {

  $('#buttonO').click(function (event) {
    playerMark = "O";
    compMark = "X";
    console.log(playerMark + " selected. Computer is " + compMark + ".");
    resetBoard();
  });

  $('#buttonX').click(function (event) {
    playerMark = "X";
    compMark = "O";
    console.log(playerMark + " selected. Computer is " + compMark + ".");
    resetBoard();
  });

  $('#buttonReset').click(function (event) {
    resetBoard();
  });

  $('.square').click(function (event) {
    $(this).css("background-color", "#f00");
    $(this).animate({
      backgroundColor: "#fff"
    }, 500);

    var selection = $(this).attr("id");
    if (boardState[selection] == "E" && gameState == "player") { // if square is empty and it is the player's turn
      console.log("Player chooses " + selection);
      boardState[selection] = "P";
      $('#'+ selection).text(playerMark);
      if (!checkForWin()) {
        gameState = "comp";
        compDoTurn();
      }
    }
  });
  
});