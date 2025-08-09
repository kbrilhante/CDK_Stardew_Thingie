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
    
    const txtFileLocation = document.createElement("p");
    // inpText.textContent = "Windows: %AppData%\StardewValley\Saves\
    // Mac OSX & Linux: ~/.config/StardewValley/Saves/"
    txtFileLocation.textContent = "File locations:"
    txtFileLocation.className = "fs-6 text-muted mb-0 mt-2";
    divFile.appendChild(txtFileLocation);

    const ulLocationsList = document.createElement("ul");
    divFile.appendChild(ulLocationsList);
    
    const txtFileLocationWin = document.createElement("li");
    // inpText.textContent = "Windows: %AppData%\StardewValley\Saves\
    // Mac OSX & Linux: ~/.config/StardewValley/Saves/"
    txtFileLocationWin.textContent = "Windows: %AppData%\\StardewValley\\Saves\\"
    txtFileLocationWin.className = "fs-6 text-muted";
    ulLocationsList.appendChild(txtFileLocationWin);

    const txtFileLocationMacLinux = document.createElement("li");
    // inpText.textContent = "Windows: %AppData%\StardewValley\Saves\
    // Mac OSX & Linux: ~/.config/StardewValley/Saves/"
    txtFileLocationMacLinux.textContent = "Mac OSX & Linux: ~/.config/StardewValley/Saves/"
    txtFileLocationMacLinux.className = "fs-6 text-muted";
    ulLocationsList.appendChild(txtFileLocationMacLinux);

    const divOptions = createDiv(contentTag);
    
    
}

function createDiv(parent) {
    const div = document.createElement("div");
    div.className = "mb-3 my-2 border-bottom border-2";
    parent.appendChild(div);

    return div;
}