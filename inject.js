var paywallFound = false;
var findPaywallInterval;
var fakeNewsButton;
var paywall;

// NYTIMES Class & ID Names
var PAYWALLID = "gateway-content"; // Used to query the paywall div
var PAYWALLBTN = 'css-l33adv'; // Used to style our button
var PAYWALLOVERLAY = "css-1bd8bfl"; // Used to remove paywall overlay
var PAYWALLCONTENT = "css-1n69xkm"; // Paywall content
var PAYWALLSUBHEAD = "css-184j79q-RegiWallSubhead"; // Used to add our own text
var MAINCONTENTAREA = "css-mcm29f"; // Used to reenable scrolling
var SUBTITLE = "article-summary"; // Used to seed the article
var TEXTCONTAINERS = "StoryBodyCompanionColumn";
var PARAGRAPHS = "css-axufdj"; // Used to remove/update paragraphs
var IMAGES = "css-79elbk"; // Used to remove images

const model = new rw.HostedModel({
	url: "https://ny-times-articles-1500-steps.hosted-models.runwayml.cloud/v1/",
	token: "GOROiTsPBIsoIRL66okjUg==",
});

(function() {
	findPaywallInterval = setInterval(findPaywall, 500);
})();


function findPaywall() {
	if (!paywallFound) {
		paywall = document.getElementById(PAYWALLID);

		if (paywall) {
			clearInterval(findPaywallInterval);
			paywallFound = true;

			// Create fake news button
			fakeNewsButton = document.createElement('button');
			fakeNewsButton.id = 'injected-button';
			// This isn't doing anything anymore
			// TODO: find the new class for nytimes button and use it?
			fakeNewsButton.className = PAYWALLBTN;
			fakeNewsButton.innerHTML = "Go Behind The Paywall";
			fakeNewsButton.style.backgroundColor = "red";
			fakeNewsButton.style.alignText = "center";
			fakeNewsButton.onclick = makeFakeNews;

			paywall.insertBefore(fakeNewsButton, paywall.childNodes[0]);
		}
	}
}

function makeFakeNews() {
	// Do runway stuff
	var prompt = document.getElementsByTagName("h1")[0].innerHTML +  document.getElementById(SUBTITLE).innerHTML;
	const inputs = {
	  "prompt": prompt,
	  "max_characters": 1024,
	  "top_p": 0.9,
	  "seed": Math.floor(Math.random() * 1000)
	};

	// TODO: do this iteratively and fill out some set of the paragraphs
	model.query(inputs).then(outputs => {
	  const { generated_text, encountered_end } = outputs;
		removePayWall();
		clearRealArticle();

		var textOutput = generated_text.split(prompt)[1];
		var deleteThisPartOfTheString = textOutput.split('.').pop();

		textOutput = textOutput.substring(0,textOutput.length - deleteThisPartOfTheString.length);
		
		document.getElementsByClassName(PARAGRAPHS)[0].innerHTML = textOutput;
	});

	addScanner();
}

function addScanner() {
	var scannerBar = document.createElement("div");
	scannerBar.className = "scanner-bar";
	document.getElementsByClassName(PAYWALLOVERLAY)[0].appendChild(scannerBar);
	document.getElementsByClassName(PAYWALLCONTENT)[0].remove();
	fakeNewsButton.remove();

	// Create creating fake news text
	var processingText = document.createElement('div');
	processingText.className = PAYWALLSUBHEAD;
	processingText.innerHTML = "Generating your fake news, please wait...";
	paywall.appendChild(processingText);
}

function clearRealArticle() {
	// Empty text from paragraphs
	var paragraphs = document.getElementsByClassName(PARAGRAPHS);
	for(var i = 0; i < paragraphs.length; i++) {
		paragraphs[i].innerHTML = "";
	}

	// Remove second story companion
	document.getElementsByClassName(TEXTCONTAINERS)[1].remove();

	// Remove all images but 1
	var images = document.getElementsByClassName(IMAGES);
	var imgArrayLength = images.length;
	for (var i = 0; i < imgArrayLength; i++) {
		if (i != 1) {
			images[i].style.display = "none";
		}
	}
}

function removePayWall() {
	var paywall = document.getElementById(PAYWALLID);
	paywall.style.display = "none";
	document.getElementsByClassName(PAYWALLOVERLAY)[0].style.display = "none";
	document.getElementsByClassName(MAINCONTENTAREA)[0].style.overflow = "scroll";
}
