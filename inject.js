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
var FOOTER = "css-19hdyf3";

var TOTALTEXTGENERATION = 0;

var FAKENEWSBUTTONTXT = "Go Behind The Paywall";
var FAKENEWSTAGLINETXT = "It might be wrong, but at least it's free.";
var FAKENEWSDESCRIPTIONTXT = "Behind the paywall is an experiment that uses artificial intelligence to dream up what article might be hidden behind the paywall. Read more <a class='css-19hdyf3' href='https://medium.com/' target='_blank'>here.</a>";

var FOOTERTXT = "<p>This article was generated using a <a class='css-1rj8to8' href='https://openai.com/blog/better-language-models/' target='_blank'>GPT-2</a> model trained on <a class='css-1rj8to8' href='https://www.kaggle.com/nzalake52/new-york-times-articles?select=nytimes_news_articles.txt' target='_blank'>a dataset of previous articles from New York Times.</a> The text generated is likely to be <a class='css-1rj8to8' href='https://arxiv.org/pdf/2102.04130.pdf' target='_blank'>biased</a> and potentially <a class='css-1rj8to8' href='https://onezero.medium.com/for-some-reason-im-covered-in-blood-gpt-3-contains-disturbing-bias-against-muslims-693d275552bf' target='_blank'>offensive.</a> The hope of this project is to start a conversation about the spread of fake news and the future of automated journalism. Read more about the project <a class='css-1rj8to8' href='https://medium.com/' target='_blank'>here.</a></p>";

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
			fakeNewsButton.innerHTML = FAKENEWSBUTTONTXT;
			fakeNewsButton.style.backgroundColor = "red";
			fakeNewsButton.style.alignText = "center";
			fakeNewsButton.onclick = makeFakeNews;

			fakeNewsTagline = document.createElement('h2');
			fakeNewsTagline.id = 'injected-tagline';
			fakeNewsTagline.className = SUBHEADERSTYLE;
			fakeNewsTagline.innerHTML = FAKENEWSTAGLINETXT;
			fakeNewsTagline.style.marginBottom = "16px";

			fakeNewsDescription = document.createElement('p');
			fakeNewsDescription.id = 'injected-description';
			fakeNewsDescription.className = FOOTER; // Footer has the style we lookin fooo
			fakeNewsDescription.innerHTML = FAKENEWSDESCRIPTIONTXT;
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
		// addFooter(); // Not working at the moment
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

function addFooter() {
	// The footer gets lazy loaded so when we look for it, it doesn't exist yet
	// TODO: watch for mutations in the DOM, replace footer when it appears
	var footers = document.getElementsByClassName(FOOTER);
	for(var i = 0; i < footers.length; i++) {
		console.log(footers[i]);
		footers[i].innerHTML = "";
		if(i == 0) {
			footers[0].innerHTML = FOOTERTXT;
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
