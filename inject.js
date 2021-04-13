var paywallFound = false;
var findPaywallInterval;

// NYTIMES Class & ID Names
var PAYWALLID = "gateway-content"; // Used to query the paywall div
var PAYWALLBTN = 'css-l33adv'; // Used to style our button
var PAYWALLOVERLAY = "css-1bd8bfl"; // Used to remove paywall overlay
var PAYWALLCONTENT = "css-1n69xkm";
var PAYWALLSUBHEAD = "css-184j79q-RegiWallSubhead"; // Used to add our own text
var MAINCONTENTAREA = "css-mcm29f"; // Used to reenable scrolling
var SUBTITLE = "article-summary"; // Used to seed the article
var PARAGRAPHS = "css-axufdj"; // Used to remove/update paragraphs
var IMAGES = "css-11cwn6f"; // Used to remove/update images
var CAPTIONS = "css-17ai7jg"; // Used to remove/update image captions

const model = new rw.HostedModel({
	url: "https://ny-times-articles-1500-steps.hosted-models.runwayml.cloud/v1/",
	token: "GOROiTsPBIsoIRL66okjUg==",
});

(function() {
	findPaywallInterval = setInterval(findPaywall, 500);
})();


function findPaywall() {
	if (!paywallFound) {
		var paywall = document.getElementById(PAYWALLID);

		if (paywall) {
			clearInterval(findPaywallInterval);
			paywallFound = true;

			// Create fake news button
			// TODO: style button
			var fakeNewsButton = document.createElement('button');
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
	  "seed": 1000
	};
	
	// TODO: do this iteratively and fill out some set of the paragraphs
	model.query(inputs).then(outputs => {
	  const { generated_text, encountered_end } = outputs;
		// removeScanner();
		removePayWall();
		clearRealArticle();

		var textOutput = generated_text.split(prompt)[1];
		console.log("textOutput raw" + textOutput)
		var deleteThisPartOfTheString = textOutput.split('.').pop();
		
		textOutput = textOutput.substring(0,textOutput.length - deleteThisPartOfTheString.length);	

		//var generated_textTrimmed = generated_text.substring(0,generated_text.length - deleteThisPartOfTheString.length);	
		
		document.getElementsByClassName(PARAGRAPHS)[0].innerHTML = textOutput;
	});

	addScanner();

}

function addScanner() {
	var scannerBar = document.createElement("div");
	scannerBar.className = "scanner-bar";
	document.getElementsByClassName(PAYWALLOVERLAY)[0].appendChild(scannerBar);
	//document.getElementsByClassName(PAYWALLCONTENT)[0]

}


function clearRealArticle() {
	// Empty text from paragraphs
	var paragraphs = document.getElementsByClassName(PARAGRAPHS);
	for(var i = 0; i < paragraphs.length; i++) {
		paragraphs[i].innerHTML = "";
	}

	// Remove first image
	var firstImage = document.getElementsByClassName(IMAGES)[0];
	console.log(firstImage);
	firstImage.style.display = "none";
	var caption = document.getElementsByClassName(CAPTIONS)[0];
	console.log(caption);
	caption.style.display = "none";
}

function removePayWall() {
	var paywall = document.getElementById(PAYWALLID);
	paywall.style.display = "none";
	document.getElementsByClassName(PAYWALLOVERLAY)[0].style.display = "none";
	document.getElementsByClassName(MAINCONTENTAREA)[0].style.overflow = "scroll";
}
