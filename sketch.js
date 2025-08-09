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

            console.log(xmlDoc);

        }

        reader.onerror = (err) => {
            console.error("Error reading file: ", err);
        }

        reader.readAsText(file);
    });
}