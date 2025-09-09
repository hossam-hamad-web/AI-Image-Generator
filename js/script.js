
/*Variables to add action  */

const themToggle = document.querySelector(".theme");
const prompotBtn = document.querySelector(".prompot-btn");
const prompotInput = document.querySelector(".prompot-input");
const prompotform = document.querySelector(".form-prompot");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");
const API_KEY = CONFIG.API_KEY;
const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
];
// Toggle Theme in Page light and dark
// set the default based on system default or saved prefernce 
(() => {
    const saveTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarkThem = saveTheme == "dark" || (!saveTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkThem);
    themToggle.querySelector("i").className = isDarkThem ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

themToggle.addEventListener('click', () => {
    const isDarkThem = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkThem ? "dark" : "light")
    themToggle.querySelector("i").className = isDarkThem ? "fa-solid fa-sun" : "fa-solid fa-moon";
})

// Fill prompor with random exmple
prompotBtn.addEventListener('click', () => {
    const prompot = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    prompotInput.value = prompot;

    prompotInput.focus(); // to prevent the focus go out the text are when we used it

})


const getImageDimentions = (selectedration, basesize = 512) => {
    const [width, height] = selectedration.split("/").map(Number);
    const scaleFactor = basesize / Math.sqrt(width * height);

    let calcWidth = Math.random(width * scaleFactor);
    let calcHeight = Math.random(height * scaleFactor);

    calcWidth = Math.floor(calcWidth / 16) * 16;
    calcHeight = Math.floor(calcHeight / 16) * 16;

    return { width: calcWidth, height: calcHeight };
};


const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card${imgIndex}`);

    if (!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = ` <img class="result-img" src="${imgUrl}" alt="result.img">
                        <div class="img-overlay">
                            <a href="${imgUrl}" class="img-download-btn"  download="${Date.now()}.png">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </div>`;
};
const genereateImages = async (selectedModel, imageCount, selectedration, prompotText) => {
    const ModelURL = `https://api-inference.huggingface.co/models/${selectedModel}`
    const { width, height } = getImageDimentions(selectedration);

    const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
        try {
            const response = await fetch(ModelURL, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"

                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompotText,
                    parameters: { width, height },
                    options: { wait_for_model: true, use_cache: false }
                })
            });
            if (!response.ok) throw new Error((await response.json())?.error);
            const result = await response.blob();
            updateImageCard(i, URL.createObjectURL(result));
        } catch (error) {
            console.log(error);

        }
    });

    await Promise.allSettled(imagePromises);


};
const createImageCards = (selectedModel, imageCount, selectedration, prompotText) => {
    gridGallery.innerHTML = "";
    for (let i = 0; i < imageCount; i++) {
        gridGallery.innerHTML += ` <div class="img-card loading" id="img-card${i}" style="aspect-ratio: ${selectedration}">
                        <div class="satus-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p class="status-text">Generating...</p>
                        </div>
                        <img class="result-img" src="test.png" alt="result.img">
                       
                    </div>`;
    }
    genereateImages(selectedModel, imageCount, selectedration, prompotText);
};

// Form handeler
prompotform.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedModel = modelSelect.value;
    const selectedcount = parseInt(countSelect.value) || 1;
    const selectedration = ratioSelect.value || "1/1";
    const prompotText = prompotInput.value.trim();
    createImageCards(selectedModel, selectedcount, selectedration, prompotText);


});