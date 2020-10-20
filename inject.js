var ctaFound = false;
var findCTAInterval;

const model = new rw.HostedModel({
	url: "https://andreas-matt-test-extra-small.hosted-models.runwayml.cloud/v1/",
	token: "xpQHoYU0Ig/baEwCj2uKQA==",
});

(function() {
	findCTAInterval = setInterval(findCTA, 500);
})();


function findCTA() {
	if (!ctaFound) {
		var cta = document.getElementById("gateway-content");

		if (cta) {
			clearInterval(findCTAInterval);
			ctaFound = true;


			var fakeNewsButton = document.createElement('button');
			fakeNewsButton.id = 'injected-button'
			fakeNewsButton.className = 'css-1dma08p';
			fakeNewsButton.innerHTML = "Create Fake News";
			fakeNewsButton.style.backgroundColor = "red";
			fakeNewsButton.style.alignText = "center";
			fakeNewsButton.onclick = makeFakeNews;

			cta.insertBefore(fakeNewsButton, cta.childNodes[0]);
		}
	}
}

function makeFakeNews() {
	var prompt = document.getElementsByTagName("h1")[0].innerHTML +  document.getElementById("article-summary").innerHTML;


	const inputs = {
	  "prompt": prompt,
	  "max_characters": 1024,
	  "top_p": 0.9,
	  "seed": 1000
	};
	model.query(inputs).then(outputs => {
	  const { generated_text, encountered_end } = outputs;
		console.log(generated_text);
		console.log(outputs);
		document.getElementsByClassName("css-158dogj")[0].innerHTML = generated_text.split(prompt)[1];
	});


	var cta = document.getElementById("gateway-content");
	cta.style.display = "none";
	document.getElementsByClassName("css-1bd8bfl")[0].style.display = "none";
	document.getElementsByClassName("css-mcm29f")[0].style.overflow = "scroll";

	var paragraphs = document.getElementsByClassName("css-158dogj");
	for(var i = 0; i < paragraphs.length; i++) {
		paragraphs[i].innerHTML = "";
	}

	var firstImage = document.getElementsByClassName("css-11cwn6f")[0];
	console.log(firstImage);
	firstImage.style.display = "none";
	var caption = document.getElementsByClassName("css-17ai7jg")[0];
	console.log(caption);
	caption.style.display = "none";
}
