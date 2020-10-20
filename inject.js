var paywallFound = false;
var findPaywallInterval;

const model = new rw.HostedModel({
	url: "https://andreas-matt-test-extra-small.hosted-models.runwayml.cloud/v1/",
	token: "xpQHoYU0Ig/baEwCj2uKQA==",
});

(function() {
	findPaywallInterval = setInterval(findPaywall, 500);
})();


function findPaywall() {
	if (!paywallFound) {
		var paywall = document.getElementById("gateway-content");

		if (paywall) {
			clearInterval(findPaywallInterval);
			paywallFound = true;

			// Create fake news button
			// TODO: style button
			var fakeNewsButton = document.createElement('button');
			fakeNewsButton.id = 'injected-button'
			fakeNewsButton.className = 'css-1dma08p'; // This isn't doing anything anymore
			fakeNewsButton.innerHTML = "Create Fake News";
			fakeNewsButton.style.backgroundColor = "red";
			fakeNewsButton.style.alignText = "center";
			fakeNewsButton.onclick = makeFakeNews;

			paywall.insertBefore(fakeNewsButton, paywall.childNodes[0]);
		}
	}
}

function makeFakeNews() {
	// Do runway stuff
	var prompt = document.getElementsByTagName("h1")[0].innerHTML +  document.getElementById("article-summary").innerHTML;
	const inputs = {
	  "prompt": prompt,
	  "max_characters": 1024,
	  "top_p": 0.9,
	  "seed": 1000
	};
	model.query(inputs).then(outputs => {
	  const { generated_text, encountered_end } = outputs;
		document.getElementsByClassName("css-158dogj")[0].innerHTML = generated_text.split(prompt)[1];
	});


	// Get rid of paywall
	var paywall = document.getElementById("gateway-content");
	paywall.style.display = "none";
	document.getElementsByClassName("css-1bd8bfl")[0].style.display = "none";
	document.getElementsByClassName("css-mcm29f")[0].style.overflow = "scroll";

	// Empty text from paragraphs
	var paragraphs = document.getElementsByClassName("css-158dogj");
	for(var i = 0; i < paragraphs.length; i++) {
		paragraphs[i].innerHTML = "";
	}

	// Remove first image
	var firstImage = document.getElementsByClassName("css-11cwn6f")[0];
	console.log(firstImage);
	firstImage.style.display = "none";
	var caption = document.getElementsByClassName("css-17ai7jg")[0];
	console.log(caption);
	caption.style.display = "none";
}
