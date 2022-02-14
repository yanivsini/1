var quizTimer = 50;
var Android;


var quizStarted = false;

var apptitle = "funquiz";
var appData = {
	title : apptitle,
	score : 0,
	highscore : 0
};

if(localStorage.getItem(appData.title) === null){
	saveData();
}

appData = JSON.parse(localStorage.getItem(appData.title));

function saveData(){
	localStorage.setItem(appData.title, JSON.stringify(appData));
}

var correctS, wrongS, gameover, bgmusic;
$("document").ready(function(){
	firstPage();
	gameover = new Howl({
		src: ["../sounds/gameover.mp3"],
		loop: false
	});
	bgmusic = new Howl({
		src: ["../sounds/bgmusic.mp3"],
		loop: true
	});
	correctS = new Howl({
		src: ["../sounds/correct.mp3"]
	});
	wrongS = new Howl({
		src: ["../sounds/wrong.mp3"]
	});
});

function firstPage(){
	quizStarted = false;
	$("#quizstart").html("<center><p style='text-align:center;'><img src='../images/logohome.png' alt='Logo' style='height: 16%;margin-bottom: 30px;margin-top: 200px;'></p><button onclick='startGame()' style=' width: 67%;font-size: 35px;padding-top: 0px !important;line-height: 0px; '>Play</button><br><button onclick='integration.rateThisApp()' style='background: url(../images/button2.png);text-shadow: 0px 2px #bd6c15;width: 67%;font-size: 35px;padding-top: 0px !important;padding: 30px;height: 50px;line-height: 49px;'><i class='fa fa-star' aria-hidden='true' style='margin-right: 10px;text-shadow: 0px 2px #bd6c15;'></i>Rate Us</button></center>");
}

function gameoverPage(){
	quizStarted = false;
	$("#quizholder").html("<h2 style='margin-top: 35px;font-size: 40px;margin-bottom: 30px;'><p style='text-align:center;'><img src='../images/gameover.png' alt='Logo' style='height: 9%;'></p></h2><p style=' font-size: 25px; '>Score:</p><p style='text-align: center;margin-bottom: 20px;font-size: 25px;'>" +appData.score+ "</p><p style=' font-size: 25px; '>High Score:</p><p style='text-align: center;font-size: 25px;margin-bottom: 30px;'>" +appData.highscore+ "</p><div style='text-align: center'><button onclick='startGame()' style=' padding-top: 1px; width: 45%;'>Retry</button><div style='text-align: center'><button onclick='restart()' style=' width: 45%; '>Menu</button></div><div style='text-align: center'><button onclick='integration.rateThisApp()' style='background: url(../images/button2.png);text-shadow: 0px 2px #bd6c15;width: 45%;'><i class='fa fa-star' aria-hidden='true' style='margin-right: 10px;text-shadow: 0px 2px #bd6c15;'></i>Rate Us</button></div></div>");
}

function restart(){
	location.href = "index.html";
}

var time = quizTimer;
var timer;
function startTimer(){
	time = quizTimer;
	updateTimerAndScore();
	timer = setInterval(function(){
		if(!paused){
			updateTimerAndScore();
			if(time < 1){
				$(".choice").prop('onclick',null).off('click');
				endGame();
				gameoverPage();
				showAlert("Oops!");
			}
			time -= 1;
		}
	}, 1000);
}

var paused = false;
function pauseGame(){
	paused = true;
}
function resumeGame(){
	paused = false;
}

function updateTimerAndScore(){
	$("#timer").html(time);
	$("#score").html(appData.score);
	$("#highscore").html(appData.highscore);
}

function endGame(){
	bgmusic.pause();
	gameover.play();
	integration.showInterstitial();
	clearInterval(timer);
	$("#scoreholder").fadeOut(300);
	quizStarted = false;
	if(appData.score > appData.highscore){
		appData.highscore = appData.score;
		try {
			cl.update(appData.highscore)
		} catch (e) {
			console.log(e)
		}
	}
}

function flash(n){
	if(n == 0){
		$("#flasher").css({"background-color" : "red"}).fadeIn(100, function(){
			$("#flasher").fadeOut(500);
		});
	}else{
		$("#flasher").css({"background-color" : "lime"}).fadeIn(100, function(){
			$("#flasher").fadeOut(500);
		});
	}
}

var currentQuestion;
function showQuestion(){
	if(quizStarted){
		var randomQ = requestRandomQ();
		currentQuestion = randomQ;
		if(qst.length > 0){
			if(navigator.onLine){
				var question = qst[randomQ].q;
				var answers = "<div id='choices' style=' margin-top: 25px; '>";
				var ansArray = [];
				for(var i = 0; i < qst[randomQ].a.length; i ++){
					var clickF;
					if(qst[randomQ].ca == i+1)
						clickF = "id='correctAnswer' onclick='userAnswer(1)'";
					else 
						clickF = "onclick='userAnswer(0)'";
					ansArray.push("<div class='choice' " +clickF+ ">" + qst[randomQ].a[i] + "</div>");
				}
				ansArray = shuffle(ansArray);
				for(var i = 0; i < ansArray.length; i++){
					answers += ansArray[i];
				}
				answers += "</div>";
				$("#quizstart").html("<div id='appbar'><p style='text-align:center;'><img src='../images/logo.png' alt='Logo' style='height: 100%;'></p></div>");
				$("#quizstart").fadeIn(300);
				$("#quizholder").html(question + answers);
				$("#quizholder").fadeIn(300);
			}
		}else{
			$("#quizholder").html("<p align='Center'>Great! You answered all the questions.</p><div style='text-align: center'><button onclick='restart()'>Back</button></div>");
			$("#quizholder").fadeIn(300);
			endGame();
		}
	}else{
		endGame();
	}
}

function startGame(){
	bgmusic.play();
	gameover.pause();
	integration.showBanner();
	quizStarted = true;
	$("#quizholder").fadeOut(300, function(){
		appData.score = 0;
		saveData();
		showQuestion();
		startTimer();
		$("#scoreholder").fadeIn(300);
	});
}

function requestRandomQ(){
	return Math.floor(Math.random()*qst.length);
}

function userAnswer(n){
	if(n == 1){
		showAlert("Correct!");
		flash(1);
		appData.score += 10;
		if(appData.score > appData.highscore){
			appData.highscore = appData.score;
			try {
				cl.update(appData.highscore)
			} catch (e) {
				console.log(e)
			}
		}
		saveData();
		$("#score").html(appData.score);
		qst.splice(currentQuestion, 1);
		$("#quizholder").fadeOut(300, function(){
			showQuestion();
		});
		correctS.play();
	}else{
		showAlert("Wrong!");
		flash(0);
		appData.score -= 3;
		if(appData.score < 0) appData.score = 0;
		saveData();
		$("#score").html(appData.score);
		$("#correctAnswer").css({"text-shadow" : "0px 2px #7fa120", "background-image" : "url(../images/correctanswerbutton.png)"});
		$(".choice").prop('onclick',null).off('click');
		setTimeout(function(){
			showQuestion();
		}, 1500);
		wrongS.play();
	}	
}

var drawerShown = false;
function showDrawer(){
	if(!drawerShown){
		$("#drawer").animate({ left : "0px" });
		$("#mainscreen").animate({ left : "250px", right : "-250px"});
		drawerShown = true;
	}else{
		$("#mainscreen").animate({ left : "0px", right : "0px" });
		$("#drawer").animate({ left : "-250px" });
		drawerShown = false;
	}
}

function showAlert(msg){
	$("#notification").html(msg);
	$("#notification").fadeIn(300);
	setTimeout(function(){
		$("#notification").fadeOut(300);
	}, 1500);
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

setTimeout(function(){
	$("#mainscreen").css({ "height" : innerHeight - 150});
}, 50);