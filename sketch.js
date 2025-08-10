const TITLE = "Stardew Valley Thingie";
const FILE_ID = "stardewFile";

function startup() {
    document.getElementById(FILE_ID).addEventListener("change", (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const contents = e.target.result;

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(contents, "application/xml");

            console.log(xmlDoc)

            const saveFile = xmlToJson(xmlDoc.documentElement);
            handleSaveFile(saveFile);
        }

        reader.onerror = (err) => {
            console.error("Error reading file: ", err);
        }

        reader.readAsText(file);

    });
}

function handleSaveFile(saveObj) {
    // console.log(saveObj.player.items)
    console.log(saveObj.locations.GameLocation[0].buildings)
    console.log(saveObj.locations.GameLocation[0].objects)
}