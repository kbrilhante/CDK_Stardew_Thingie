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
    txtFarmerTitle.textContent = "Save State Details";
    divFarmerPerks.appendChild(txtFarmerTitle);

    const divFieldSets = document.createElement("div");
    divFieldSets.classList.add("row");
    divFieldSets.classList.add("row-cols-1");
    divFieldSets.classList.add("row-cols-sm-2");
    divFieldSets.classList.add("row-cols-lg-3");
    divFieldSets.classList.add("row-cols-xl-4");
    divFieldSets.classList.add("pb-2");
    divFarmerPerks.appendChild(divFieldSets);

    const fsProfessions = createFieldSet(divFieldSets, "Farmer Professions");

    createCheckBox(fsProfessions, "chkTiller", "Tiller (Lv 5)");
    createCheckBox(fsProfessions, "chkArtisan", "Artisan (Lv 10)");

    const fsSpecialPowers = createFieldSet(divFieldSets, "Special Items and Powers");

    createCheckBox(fsSpecialPowers, "chkBear", "Bear's Knowledge");
    createCheckBox(fsSpecialPowers, "chkSprOnion", "Spring Onion Mastery");

    const fsMachines = createFieldSet(divFieldSets, "Machinery");
    for (const machine of MACHINES) {
        createMachineInput(fsMachines, machine);
    }

    const fsOptions = createFieldSet(divFieldSets, "Options");
    createCheckBox(fsOptions, "chkFillAll", "Fill all machines of the same type with the same crop");
    fsOptions.style.display = "none";

    const divTable = createDiv(contentTag);
    divTable.id = "divTable";
    // divTable.style.display = "none";
}

function createFieldSet(parent, legendText) {
    const div = document.createElement("div");
    div.className = "col mb-2";
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

function createFormDiv(parent) {
    const div = document.createElement("div");
    div.className = "form-check";
    parent.appendChild(div);
    return div;
}

function createFormLabel(parent, htmlFor, text) {
    const lbl = document.createElement("label");
    lbl.className = "form-label";
    lbl.htmlFor = htmlFor;
    lbl.textContent = text;
    parent.appendChild(lbl);
    return lbl;
}

function createMachineInput(parent, txtLabel) {
    const div = createFormDiv(parent);
    div.className = "input-group mb-3";

    const chk = createCheckBox(div, `chk${txtLabel}`);
    chk.checked = true;
    // chk.onchange = toggleMachine;

    const span = document.createElement("span");
    span.className = "input-group-text";
    span.textContent = txtLabel;
    div.appendChild(span);

    const inpNumber = document.createElement("input");
    inpNumber.type = "number";
    inpNumber.className = "form-control";
    inpNumber.id = `inp${txtLabel}`;
    inpNumber.value = 0;
    div.appendChild(inpNumber);
}

function createCheckBox(parent, id, text = "") {
    const div = createFormDiv(parent);
    const chk = document.createElement("input");
    chk.className = "form-check-input";
    chk.type = "checkbox";
    chk.id = id;
    div.appendChild(chk);
    if (text) {
        const lbl = createFormLabel(div, id, text);
        lbl.className = "form-check-label";
    }
    return chk;
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

function setInputValue(id, value) {
    document.getElementById(id).value = value;
}

function getInputValue(id) {
    return document.getElementById(id).value;
}

function createTable(parent, id, content) {
    parent.innerHTML = "";

    const divResp = document.createElement("div");
    divResp.className = "table-responsive";
    parent.appendChild(divResp);

    const table = document.createElement("table");
    table.id = id;
    table.className = "table table-striped-columns table-hover table-sort";
    divResp.appendChild(table)

    const headers = content.headers;
    const thead = document.createElement("thead");
    table.appendChild(thead);
    const tableHeader = createTableHeader(headers);
    thead.appendChild(tableHeader);
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    for (const bodyRow of content.body) {
        const row = createTableBodyRow(bodyRow);
        tbody.appendChild(row);
    }

    return table;
}

function createTableRow() {
    return document.createElement("tr");
}

/**
 * @typedef {Object} TableHeader
 * @property {string} header - Text content of the header cell.
 * @property {string} type - Data type associated with the column.
 */

/**
 * Creates a table header row from an array of header definitions.
 *
 * @param {TableHeader[]} headers - List of headers for the table.
 * @returns {HTMLTableRowElement} A <tr> element containing the header cells.
 *
 * @example
 * // Example: Create a header row with Name and Age columns
 * const headers = [
 *   { header: "Name", type: "string" },
 *   { header: "Age", type: "number" }
 * ];
 * const tableHeaderRow = createTableHeader(headers);
 * document.querySelector("thead").appendChild(tableHeaderRow);
 */
function createTableHeader(headers) {
    const tr = createTableRow();

    for (const objHeader of headers) {
        const th = document.createElement("th");
        th.scope = "col";
        th.innerHTML = objHeader.header;
        th.setAttribute("data-sort", objHeader.type);
        th.ariaSort = "none";
        tr.appendChild(th);

        const span = document.createElement("span");
        span.className = "indicator";
        th.appendChild(span);
    }

    return tr;
}

/**
 * Creates a table body row (`<tr>`) with a header cell and data cells.
 *
 * @param {(string|number)[]} bodyRow - The row data. First element becomes a <th>, rest become <td>.
 * @returns {HTMLTableRowElement} A populated table row element.
 */

function createTableBodyRow(bodyRow) {
    const tr = createTableRow();

    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = bodyRow[0];
    tr.appendChild(th);

    for (let i = 1; i < bodyRow.length; i++) {
        const column = bodyRow[i];
        const td = document.createElement("td");
        td.textContent = column;
        tr.appendChild(td);
    }

    return tr;
}

/**
 * 
 * @param {HTMLElement} table 
 */
function makeTableSortable(table) {
    const headers = table.querySelectorAll("th[data-sort");
    const tBody = table.querySelector("tbody");
    if (!tBody) {
        console.error("Table does not have a <tbody> element.");
        return;
    }

    console.log(tBody)
    for (const entry of headers.entries()) {
        const colIndex = entry[0];
        const header = entry[1];
        header.addEventListener("click", () => {
            const currentSort = header.getAttribute("aria-sort");

            let newSort;
            switch (currentSort) {
                case "ascending":
                    newSort = "descending";
                    break;
                case "descending":
                default:
                    newSort = "ascending";
                    break;
            }

            for (const otherHeader of headers) {
                if (otherHeader !== header) {
                    otherHeader.setAttribute("aria-sort", "none");
                }
            }

            header.setAttribute("aria-sort", newSort);

            const  dataType = header.getAttribute("data-sort");

            const rows = Array.from(tBody.querySelectorAll("tr"));
            rows.sort((rowA, rowB) => {
                const cellA = rowA.children[colIndex].textContent.trim();
                const cellB = rowB.children[colIndex].textContent.trim();

                let compareValue;

                if (dataType === "number") {
                    const numA = cellA === "-" || cellA === "" ? -Infinity : parseFloat(cellA);
                    const numB = cellB === "-" || cellB === "" ? -Infinity : parseFloat(cellB);
                    compareValue = numA - numB;
                } else {
                    compareValue = cellA.localeCompare(cellB, undefined, { sensitivity: "base" })
                }

                return newSort === "ascending" ? compareValue : -compareValue;
            });

            tBody.innerHTML = "";
            for (const row of rows) {
                tBody.appendChild(row);
            }
        });
    }
}