// constants
const TITLE = "Stardew Valley Thingie";
const FILE_ID = "stardewFile";
const JSON_URL_BC = "./gameData/Data/BigCraftables.json";
const JSON_URL_MACHINES = "./gameData/Data/Machines.json";
const JSON_URL_OBJECTS = "./gameData/Data/Objects.json";
const JSON_URL_STRINGS_OBJECTS = "./gameData/Strings/Objects.json";
const JSON_URL_CATEGORIES = "./gameData/categories.json";
const JSON_URL_PROFESSIONS = "./gameData/professions.json";
const JSON_URL_QUALITY = "./gameData/quality.json";
// const JSON_URL_COLORS = ""
// const JSON_URL_ITEM_TYPES = "";
const BEAR_KNOWLEDGE_EVENT = "2120303";
const SPRING_ONION_MASTERY_EVENT = "3910979";

const MACHINES = ["Keg", "Preserves Jar", "Dehydrator"];

// global variables
let objGameData;
let machinesData;
let saveFileData;

async function deleteThis() {
    const URL = "./test files/DumbBunnies_411596522";
    const response = await fetch(URL);
    const contents = await response.text(response);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(contents, "application/xml");
    const saveFile = xmlToJson(xmlDoc.documentElement);
    handleSaveFile(saveFile);
    filterInventory();
    fillTable();
}

function startup() {
    document.getElementById(FILE_ID).addEventListener("change", loadSaveFile);
    document.getElementById("chkFillAll").addEventListener("change", fillTable);
    document.getElementById("chkTiller").addEventListener("change", fillTable);
    document.getElementById("chkArtisan").addEventListener("change", fillTable);
    document.getElementById("chkBear").addEventListener("change", fillTable);
    document.getElementById("chkSprOnion").addEventListener("change", fillTable);
    for (const machine of MACHINES) {
        document.getElementById(`chk${machine}`).addEventListener("change", fillTable);
    }

    loadJsonFiles().then((data) => {
        objGameData = data;
        console.log("game data", objGameData);
        getMachineDetails();

        deleteThis();
    });
}

async function loadJsonFiles() {
    let obj = {}

    obj.BigCraftables = await loadJson(JSON_URL_BC);
    obj.Machines = await loadJson(JSON_URL_MACHINES);
    obj.Objects = await loadJson(JSON_URL_OBJECTS);
    obj.Strings = await loadJson(JSON_URL_STRINGS_OBJECTS);
    obj.Categories = await loadJson(JSON_URL_CATEGORIES);
    obj.Professions = await loadJson(JSON_URL_PROFESSIONS);
    obj.Quality = await loadJson(JSON_URL_QUALITY);
    // obj.Colors = await loadJson(JSON_URL_COLORS);
    // obj.ItemTypes = await loadJson(JSON_URL_ITEM_TYPES);

    return obj;
}

function getMachineDetails() {
    const bc = { ...objGameData.BigCraftables };
    const machines = {};
    for (const id in bc) {
        const bcName = bc[id].Name;
        if (MACHINES.includes(bcName)) {
            const machineDetails = objGameData.Machines["(BC)" + id];
            let outputRules = [...machineDetails.OutputRules];
            machines[bcName] = getOutputAndTriggers(outputRules);
        }
    }
    machinesData = machines;
    groupAllMachineTriggers();
    console.log("machines", machinesData);
}

function groupAllMachineTriggers() {
    let allTriggers = new Set();
    for (const machine in machinesData) {
        const machineValue = machinesData[machine];
        let allMachineTriggers = new Set();
        for (const product in machineValue) {
            const triggers = machineValue[product].Triggers.TriggersList;
            for (const trigger of triggers) {
                const triggerName = trigger.Name;
                allTriggers.add(triggerName);
                allMachineTriggers.add(triggerName);
            }
        }
        machineValue.AllTriggers = setToArray(allMachineTriggers);
    }
    machinesData.AllTriggers = setToArray(allTriggers);
}

function getOutputAndTriggers(outputRules) {
    const outputTriggers = {};

    for (let rule of outputRules) {
        const obj = {
            DaysUntilReady: rule.DaysUntilReady,
            MinutesUntilReady: rule.MinutesUntilReady,
        };
        const output = rule.OutputItem[0];
        const triggers = rule.Triggers;

        obj.Output = processOutput(output.Id, output.ItemId);
        obj.Triggers = processTriggers(triggers);

        const ruleId = obj.Output.Name.replaceAll(" ", "");

        outputTriggers[ruleId] = obj;
    }
    return outputTriggers
}

function processOutput(id, itemId, isFlavoredItem = false) {
    if (id.includes("(O)")) {
        const object = getObjectById(id.replace("(O)", ""));
        const name = getObjectName(object.DisplayName)
        return formatOutput(name, object.Price, isFlavoredItem);
    }
    itemId = itemId.replace("FLAVORED_ITEM", "");
    itemId = itemId.replace("DROP_IN_ID", "");
    itemId = itemId.replace("DROP_IN_PRESERVE", "");
    itemId = itemId.trim();
    switch (itemId) {
        case "Pickle":
            itemId = "Pickles";
            break;
        case "DriedMushroom":
            itemId = "DriedMushrooms";
            break;
    }
    id = "(O)" + getObjectIdByName(itemId);
    return processOutput(id, itemId, true);
}

function getObjectName(displayName) {
    displayName = displayName.split(":")[1];
    displayName = displayName.replace("]", "");
    hasCollectionsTabName = displayName.replace("_Name", "_CollectionsTabName") in objGameData.Strings;
    if (hasCollectionsTabName) displayName = displayName.replace("_Name", "_CollectionsTabName");
    const name = objGameData.Strings[displayName];
    return name
}

function formatOutput(name, price, isFlavoredItem = false) {
    const obj = {
        Name: name,
        Price: price,
        IsFlavoredItem: isFlavoredItem,
    }
    return obj;
}

function processTriggers(triggers) {
    const processedTriggers = {
        RequiredCount: triggers[0].RequiredCount,
        TriggersList: getTriggers(triggers),
    };
    return processedTriggers;
}

function getTriggers(triggers) {
    let triggersList = [];
    for (const trigger of triggers) {
        const id = trigger.RequiredItemId ? trigger.RequiredItemId.replace("(O)", "") : null;
        const requiredTags = trigger.RequiredTags ? [...trigger.RequiredTags] : [];
        if (id) {
            triggersList = processObjectById(id, requiredTags);
            continue;
        }
        triggersList.push(...processObjectByTags(requiredTags))
    }
    return triggersList;
}

function processObjectByTags(requiredTags) {
    const ids = getObjectsIds(requiredTags);
    const objects = [];
    for (const id of ids) {
        const obj = getObjectById(id);
        objects.push(formatTrigger(obj.Name, obj.Price));
    }
    return objects;
}

function processObjectById(id, requiredTags = []) {
    const object = getObjectById(id);
    const contextTags = object.ContextTags;
    if (contextTags.includes('use_reverse_name_for_sorting')) {
        return getReverseProducts(object, requiredTags);
    }
    return [formatTrigger(object.Name, object.Price)];
}

function getReverseProducts(object, requiredTags = []) {
    const name = object.Name;
    let childIds = [];
    const products = [];
    let multiplier;
    const offset = object.Price;
    switch (name) {
        case "Honey":
            childIds = getObjectsIds(["flower_item"], ["forage_item"]);
            multiplier = 2;
            products.push(formatTrigger(`Wild ${name}`, calculatePrice(0, multiplier, offset)));
            break;
        case "Roe":
            const sturgeonId = 698;
            if (requiredTags.includes('preserve_sheet_index_698')) {
                childIds = [sturgeonId]
            } else {
                childIds = getObjectsIds(["fish_has_roe", "category_fish"])
                childIds.splice(childIds.indexOf(sturgeonId), 1);
            }
            multiplier = 0.5;
            break;
    }
    for (const id of childIds) {
        products.push(getReverseProduct(name, id, multiplier, offset));
    }
    return products;
}

function getReverseProduct(mainName, productId, multiplier, offset) {
    const object = getObjectById(productId);
    const objectName = `${object.Name} ${mainName}`;
    const objectPrice = calculatePrice(object.Price, multiplier, offset);
    return formatTrigger(objectName, objectPrice);
}

function formatTrigger(name, price) {
    const obj = {
        Name: name,
        price: price
    }
    return obj;
}

function calculatePrice(base, multiplier, offset = 0) {
    return Math.floor(base * multiplier + offset);
}

function getObjectById(id) {
    return objGameData.Objects[id];
}

function getObjectsIds(tagsInclude = [], tagsExclude = []) {
    const ids = [];
    let cat = null;
    for (let i = 0; i < tagsInclude.length; i++) {
        const t = tagsInclude[i];
        if (t.includes("category_")) {
            cat = getCategoryId(t);
            tagsInclude.splice(i, 1);
            break;
        }
    }
    for (const objectId in objGameData.Objects) {
        const object = objGameData.Objects[objectId];
        const ct = object.ContextTags ? object.ContextTags : [];
        let isFromCat = cat ? object.Category == cat : true;
        if (cat == -81 && object.Edibility < 0) isFromCat = false;
        if (includesAll(ct, tagsInclude) && !includesAny(ct, tagsExclude) && isFromCat) {
            ids.push(objectId);
        }
    }
    return ids;
}

function getObjectIdByName(name) {
    name = `[LocalizedText Strings\\Objects:${name}_Name]`
    let id = Object.entries(objGameData.Objects).filter(([id, object]) => object.DisplayName === name)
    while (Array.isArray(id)) {
        id = id[0];
    }
    return id
}

function getCategoryId(catString) {
    const categories = objGameData.Categories;
    for (const cat of categories) {
        if (catString === cat["context tag"]) {
            return cat.value;
        }
    }
}

function loadSaveFile(e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const contents = e.target.result;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contents, "application/xml");
        const saveFile = xmlToJson(xmlDoc.documentElement);
        handleSaveFile(saveFile);
        filterInventory();
        fillTable();
    }

    reader.onerror = (err) => {
        console.error("Error reading file: ", err);
    }

    reader.readAsText(file);
}

function handleSaveFile(saveObj) {
    saveFileData = {};

    console.log(saveObj)

    const allItems = sortItemsByLocation(saveObj);
    console.log("all items", allItems)
    let machines = getMachines(allItems);
    saveFileData.Machines = machines;

    saveFileData.ChestItems = getChests(allItems);

    const player = saveObj.player;
    console.log("player", player);
    const playerInventory = getChestItems(player);
    saveFileData.PlayerItems = playerInventory;

    const playerProfessions = getPlayerProfessions(player);
    const tillerId = getProfession("Tiller");
    saveFileData.IsTiller = playerProfessions.includes(tillerId);
    const artisanId = getProfession("Artisan");
    saveFileData.IsArtisan = playerProfessions.includes(artisanId);
    saveFileData.HasBearPaw = hasEventHappened(player, BEAR_KNOWLEDGE_EVENT);
    saveFileData.HasSpringOnionMastery = hasEventHappened(player, SPRING_ONION_MASTERY_EVENT);

    fillPlayerInfo();
}

function hasEventHappened(player, eventId) {
    let events = player.eventsSeen.int;
    if (!Array.isArray(events)) events = [events];
    for (const event of events) {
        if (Object.values(event).includes(eventId)) {
            return true;
        }
    }
    return false;
}

function getPlayerProfessions(player) {
    const professions = [];
    if (Object.keys(player.professions).length == 0) return professions;
    for (const prof of player.professions.int) {
        professions.push(...Object.values(prof))
    }
    return professions;
}

function getProfession(profession) {
    const professions = objGameData.Professions
    for (const id in professions) {
        const value = professions[id];
        if (profession === value) {
            return id;
        }
    }
    return null;
}

function getMachines(allItems) {
    const machines = {};
    for (const machine of MACHINES) {
        let totalAmount = 0;
        machines[machine] = {}
        for (const location in allItems) {
            let amount = 0;
            let readyForHarvest = 0;
            const items = allItems[location];
            for (const item of items) {
                const itemName = item.info.name["#text"];
                if (itemName === machine) {
                    amount++;
                    if (item.info.readyForHarvest["#text"] == "true") readyForHarvest++;
                };
            }
            totalAmount += amount;
            if (amount > 0) machines[machine][location] = {
                Amount: amount,
                ReadyForHarvest: readyForHarvest,
            }
        }
        machines[machine].TotalAmount = totalAmount;
    }
    return machines;
}

function getChests(allItems) {
    const chests = {};
    for (const location in allItems) {
        const items = allItems[location];
        const arrChests = [];
        for (const item of items) {
            if (item.xsiType === "Chest") {
                item.Items = getChestItems(item.info);
                if (item.Items.length == 0) continue;
                item.PlayerChoiceColor = item.info.playerChoiceColor;
                item.Location = {
                    X: item.info.boundingBox.X["#text"],
                    Y: item.info.boundingBox.Y["#text"],
                };
                delete item.info;
                arrChests.push(item);
            }
        }
        if (arrChests.length > 0) {
            chests[location] = arrChests;
        }
    }
    return chests;
}

function getChestItems(chest) {
    let items = chest.items.Item;
    if (!items) return [];
    const chestItems = [];
    if (!Array.isArray(items)) items = [items];
    for (const item of items) {
        if (!item.name) continue;
        const name = item.name["#text"];
        if (!machinesData.AllTriggers.includes(name)) continue;
        const chestItem = {
            Name: name,
            ItemId: item.itemId["#text"],
        };
        chestItem.Item = item ? item : null
        chestItem.Price = item.price ? item.price["#text"] : null;
        chestItem.Quality = item.quality ? item.quality["#text"] : null;
        chestItem.Type = item.type ? item.type["#text"] : null;
        chestItem.Stack = item.stack ? item.stack["#text"] : null;
        chestItems.push(chestItem);
    }
    return chestItems;
}

function sortItemsByLocation(saveObj) {
    const itemsCollection = {};
    const gameLocations = saveObj.locations.GameLocation;

    for (let gameLocation of gameLocations) {
        const items = gameLocation.objects.item;
        const location = gameLocation.name["#text"];
        if (!items) continue;
        const arrItems = getItemsCollection(items);
        itemsCollection[location] = arrItems;
    }
    return itemsCollection;
}

function getItemsCollection(items) {
    let arrItems = [];
    if (!Array.isArray(items)) items = [items];
    for (let item of items) {
        arrItems.push(getItemInfo(item));
    }
    return arrItems;
}

function getItemInfo(item) {
    const info = item.value.Object;
    const obj = {};
    if (info["@attributes"]) {
        obj.xsiType = info["@attributes"]["xsi:type"]
    }
    if (info.specialChestType) {
        obj.specialChestType = info.specialChestType["#text"];
    }
    obj.name = info.name["#text"];
    obj.itemId = info.itemId["#text"];
    obj.info = info;
    return obj;
}

function fillPlayerInfo() {
    fillCheckBox("chkTiller", saveFileData.IsTiller);
    fillCheckBox("chkArtisan", saveFileData.IsArtisan);
    fillCheckBox("chkBear", saveFileData.HasBearPaw);
    fillCheckBox("chkSprOnion", saveFileData.HasSpringOnionMastery);
    for (const machine in saveFileData.Machines) {
        const value = saveFileData.Machines[machine].TotalAmount;
        setInputValue(`inp${machine}`, value);
    }
}

function filterInventory() {
    const allItems = [];
    for (const location in saveFileData.ChestItems) {
        const locationInventory = saveFileData.ChestItems[location];
        for (const chest of locationInventory) {
            const chestItems = chest.Items;
            filterItems(allItems, chestItems, location);
        }
    }
    filterItems(allItems, saveFileData.PlayerItems, "Player inventory");
    saveFileData.AllItems = allItems;
}

function filterItems(allItems, items, location) {
    for (const item of items) {
        const obj = {
            Name: item.Name,
            Quality: item.Quality,
            Price: Number(item.Price),
            Stack: Number(item.Stack),
            Locations: [location]
        }
        const index = arrayFindIndexByKeys(allItems, obj, ["Name", "Quality"]);
        if (index < 0) {
            allItems.push(obj);
        } else {
            allItems[index].Stack += obj.Stack;
            if (!allItems[index].Locations.includes(obj.Locations[0])) {
                allItems[index].Locations.push(...obj.Locations);
            }
        }
    }
}

function fillTable() {
    if (!saveFileData) return;
    console.log("save file", saveFileData);
    const chkFillAll = document.getElementById("chkFillAll").checked;
    console.log("fill all?", chkFillAll);

    const objTableInfo = {};

    // headers
    objTableInfo.headers = [
        { header: "Input Item", type: "string" },
        { header: "Quality", type: "string" },
        { header: "Quantity", type: "number" },
        { header: "Input Item Sell Price", type: "number" },
    ];
    const machines = [];
    for (const machine of MACHINES) {
        const chkMachine = document.getElementById(`chk${machine}`);
        if (chkMachine.checked) {
            machines.push(machine);
            const columns = [
                { header: `${machine} Processed Item`, type: "string" },
                { header: `${machine} Processed Sell Price`, type: "number" },
                { header: `${machine} Productivity (g/minute)`, type: "number" },
                { header: `${machine} Productivity (g/day)`, type: "number" },
            ]
            objTableInfo.headers.push(...columns);
        }
    }

    objTableInfo.body = [];
    for (const item of saveFileData.AllItems) {
        const row = [
            item.Name,
            getQualityString(item.Quality),
            item.Stack,
            getInputSellPrice(item),
        ];
        let hasMachines = false;
        for (const machine of machines) {
            console.log("--- machine ---", machine)
            const machineColumns = getMachinePrices(item, machine)
            if (!machineColumns) {
                row.push(...["no item", "-", "-", "-"]);
            } else  {
                row.push(...machineColumns);
                hasMachines = true;
            }
        }
        if (hasMachines) objTableInfo.body.push(row);
    }

    const table = createTable(document.getElementById("divTable"), "table", objTableInfo);
    console.log(table)
}

function getItemByTrigger(machineData, trigger) {
    for (const produce in machineData) {
        if (produce != "AllTriggers") {
            const list = machineData[produce].Triggers.TriggersList;
            const index = arrayFindIndexByKeys(list, trigger, ["Name"]);
            if (index >= 0) {
                return produce;
            }
        }
    }
    return null;
}

function getMachinePrices(item, machine) {
    const response = [];
    const machineData = machinesData[machine];

    const machineItem = getItemByTrigger(machineData, item); // gets the key of the machine processed product
    
    if (!machineItem) return null;

    console.log(machineItem, machineData[machineItem])
    const product = machineData[machineItem];
    const output = product.Output;

    switch (machine) {
        case 'Dehydrator':
            break;
        case 'Keg':
            break;
        case 'Preserves Jar':
            break;
    }

    // return [item name, sell price, productivity g/minute, productivity g/day]
    return response;
}

function getQualityString(quality) {
    return objGameData.Quality[quality].quality
}

function getInputSellPrice(item) {
    const multiplier = objGameData.Quality[item.Quality].multiplier;
    return Math.floor(item.Price * multiplier);
}
