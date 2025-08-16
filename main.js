function initialize() {
    document.title = TITLE;
    document.getElementById("title").innerText = TITLE;
    content();
    if (typeof startup === "function") startup();
}

function content() {
    const contentTag = document.getElementById("main");

    const divFile = createDiv(contentTag);

    const lblFile = document.createElement("label");
    lblFile.htmlFor = "#" + FILE_ID;
    lblFile.className = "form-label";
    lblFile.textContent = "Upload save file:";
    divFile.appendChild(lblFile);

    const inpFile = document.createElement("input");
    inpFile.type = "file";
    inpFile.name = FILE_ID;
    inpFile.id = FILE_ID;
    inpFile.className = "form-control";
    divFile.appendChild(inpFile);

    const txtInstructions = document.createElement("p");
    txtInstructions.textContent = "Use the full name of the farm as \"SaveGameInfo\" does not have all the information needed."
    txtInstructions.className = "fs-6 text-muted mb-0 mt-2";
    divFile.appendChild(txtInstructions);

    const txtFileLocation = document.createElement("p");
    txtFileLocation.textContent = "File locations:"
    txtFileLocation.className = "fs-6 text-muted mb-0 mt-2";
    divFile.appendChild(txtFileLocation);

    const ulLocationsList = document.createElement("ul");
    divFile.appendChild(ulLocationsList);

    const txtFileLocationWin = document.createElement("li");
    txtFileLocationWin.textContent = "Windows: %AppData%\\StardewValley\\Saves\\";
    txtFileLocationWin.className = "fs-6 text-muted";
    ulLocationsList.appendChild(txtFileLocationWin);

    const txtFileLocationMacLinux = document.createElement("li");
    txtFileLocationMacLinux.textContent = "Mac OSX & Linux: ~/.config/StardewValley/Saves/";
    txtFileLocationMacLinux.className = "fs-6 text-muted";
    ulLocationsList.appendChild(txtFileLocationMacLinux);

    const divFarmerPerks = createDiv(contentTag);

    const txtFarmerTitle = document.createElement("h5");
    txtFarmerTitle.textContent = "Farmer perks";
    divFarmerPerks.appendChild(txtFarmerTitle);

    const divFieldSets = document.createElement("div");
    divFieldSets.className = "row pb-2";
    divFarmerPerks.appendChild(divFieldSets);

    const fsProfessions = createFieldSet(divFieldSets, "Professions");

    createCheckBox(fsProfessions, "Tiller (Lv 5)", "chkTiller");
    createCheckBox(fsProfessions, "Artisan (Lv 10)", "chkArtisan");

    const fsSpecialPowers = createFieldSet(divFieldSets, "Special Items and Powers");

    createCheckBox(fsSpecialPowers, "Bear's Knowledge", "chkBear");
    createCheckBox(fsSpecialPowers, "Spring Onion Mastery", "chkSprOnion");
}

function createFieldSet(parent, legendText) {
    const div = document.createElement("div");
    div.className = "col";
    parent.appendChild(div);
    const fieldSet = document.createElement("fieldset");
    fieldSet.className = "border p-3 rounded";
    div.appendChild(fieldSet);
    const legend = document.createElement("legend");
    legend.className = "w-auto px-2 fs-6";
    legend.textContent = legendText;
    fieldSet.appendChild(legend);
    return fieldSet;
}

function createCheckBox(parent, text, id) {
    const div = document.createElement("div");
    div.className = "form-check";
    parent.appendChild(div);
    const chk = document.createElement("input");
    chk.className = "form-check-input";
    chk.type = "checkbox";
    chk.id = id;
    div.appendChild(chk);
    const lbl = document.createElement("label");
    lbl.className = "form-check-label";
    lbl.htmlFor = id;
    lbl.textContent = text;
    div.appendChild(lbl);
}

function getChecked(id) {
    const chk = document.getElementById(id);
    return chk.checked;
}

function fillCheckBox(id, value) {
    document.getElementById(id).checked = value;
}

function createDiv(parent) {
    const div = document.createElement("div");
    div.className = "mb-3 my-2 border-bottom border-2 p-2";
    parent.appendChild(div);
    return div;
}