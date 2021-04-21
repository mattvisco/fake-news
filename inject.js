var paywallFound = false;
var findPaywallInterval;
var fakeNewsButton;
var fakeNewsTagline;
var paywall;
var generatedTextArray = [];

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
var SUBHEADERSTYLE = "css-w6ymp8";
var DESCRIPTIONSTYLE = "css-19hdyf3";

var TOTALTEXTGENERATION = 2;

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
			fakeNewsButton.className = PAYWALLBTN;
			fakeNewsButton.innerHTML = "Go Behind The Paywall";
			fakeNewsButton.style.backgroundColor = "red";
			fakeNewsButton.style.alignText = "center";
			fakeNewsButton.onclick = makeFakeNews;

			fakeNewsTagline = document.createElement('h2');
			fakeNewsTagline.id = 'injected-tagline';
			fakeNewsTagline.className = SUBHEADERSTYLE;
			fakeNewsTagline.innerHTML = "It might be wrong, but at least it's free.";
			fakeNewsTagline.style.marginBottom = "16px";


			fakeNewsDescription = document.createElement('p');
			fakeNewsDescription.id = 'injected-description';
			fakeNewsDescription.className = DESCRIPTIONSTYLE;
			fakeNewsDescription.innerHTML = "Behind the paywall is an experiment that uses artificial intelligence to dream up what article might be hidden behind the paywall. Read more <a class='css-19hdyf3' href='https://medium.com/' target='_blank'>here.</a>";
			fakeNewsDescription.style.marginBottom = "80px";
			fakeNewsDescription.style.width = "600px";
			fakeNewsDescription.style.textAlign = "center";
			fakeNewsDescription.style.color = "rgb(102, 102, 102)";

			paywall.insertBefore(fakeNewsButton, paywall.childNodes[0]);
			paywall.insertBefore(fakeNewsTagline, paywall.childNodes[1]);
			paywall.insertBefore(fakeNewsDescription, paywall.childNodes[2]);
		}
	}
}

function makeFakeNews() {
	// Seed article with summary
	var prompt = document.getElementsByTagName("h1")[0].innerHTML +  document.getElementById(SUBTITLE).innerHTML;
	generateText(prompt, TOTALTEXTGENERATION); // Only creating two articles

	addScanner();
}

function generateText(prompt, currIndex) {
	// Set runway stuff
	const inputs = {
	  "prompt": prompt,
	  "max_characters": 1024,
	  "top_p": 0.9,
	  "seed": Math.floor(Math.random() * 1000)
	};

	if (currIndex > 0) {
		model.query(inputs).then(outputs => {
		  const { generated_text, encountered_end } = outputs;

			var textOutput = generated_text.split(prompt)[1];
			var textOutputSplit = textOutput.split('.');
			var deleteThisPartOfTheString = textOutputSplit.pop();

			textOutput = textOutput.substring(0,textOutput.length - deleteThisPartOfTheString.length);
			generatedTextArray.push(textOutput);

			var newPrompt = textOutputSplit[textOutputSplit.length-2] + '.' + textOutputSplit[textOutputSplit.length-1] + '.';
			currIndex--;

			generateText(newPrompt, currIndex);
		});
	} else {
		removePayWall();
		clearRealArticle();
		addFakeNews();
	}
}

function addFakeNews() {
	// TODO: make this smarter
	for(var i = 0; i < generatedTextArray.length; i++) {
		if(i == 0) {
			document.getElementsByClassName(PARAGRAPHS)[0].innerHTML = generatedTextArray[i];
		} else {
			// TODO: find where to put this one
			document.getElementsByClassName(PARAGRAPHS)[10].innerHTML = generatedTextArray[i];
		}
	}
}

function addScanner() {
	var scannerBar = document.createElement("div");
	scannerBar.className = "scanner-bar";
	document.getElementsByClassName(PAYWALLOVERLAY)[0].appendChild(scannerBar);
	document.getElementsByClassName(PAYWALLCONTENT)[0].remove();
	fakeNewsButton.remove();
	fakeNewsTagline.remove();
	fakeNewsDescription.remove();

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
