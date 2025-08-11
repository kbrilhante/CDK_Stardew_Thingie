// constants
const TITLE = "Stardew Valley Thingie";
const FILE_ID = "stardewFile";
const JSON_URL_BC = "./data/BigCraftables.json";
const JSON_URL_CATEGORIES = "./data/categories.json";
const JSON_URL_COLORS = "./data/colors.json"
const JSON_URL_ITEM_TYPES = "./data/item_types.json";
const JSON_URL_MACHINES = "./data/Machines.json";
const JSON_URL_OBJECTS = "./data/Objects.json";
const JSON_URL_PROFESSIONS = "./data/professions.json";
const JSON_URL_QUALITY = "./data/quality.json";
const BEAR_KNOWLEDGE_EVENT = "2120303";
const SPRING_ONION_MASTERY_EVENT = "3910979";

const MACHINES = ["Preserves Jar", "Keg", "Dehydrator"];

// global variables
// let objGameData;

function startup() {
    document.getElementById(FILE_ID).addEventListener("change", loadSaveFile);

    loadJsonFiles().then((data) => {
        console.log(data);
        getMachineDetails(data);
    });
}

function getMachineDetails(data) {
    const bc = data.BigCraftables;
    const machines = {};
    for (const id in bc) {
        const bcName = bc[id].Name;
        if (MACHINES.includes(bcName)) {
            console.log(bcName);
            const machineDetails = data.Machines["(BC)" + id];
            const outputRules = machineDetails.OutputRules;
            console.log(getOutputAndTriggers(outputRules))
        }
    }
    console.log(machines);
}

function getOutputAndTriggers(outputRules) {

}

async function loadJsonFiles() {
    const objBigCraftables = await loadJsonContent(JSON_URL_BC);
    const objCategories = await loadJsonContent(JSON_URL_CATEGORIES);
    const objColors = await loadJsonContent(JSON_URL_COLORS);
    const objItemTypes = await loadJsonContent(JSON_URL_ITEM_TYPES);
    const objMachines = await loadJsonContent(JSON_URL_MACHINES);
    const objObjects = await loadJsonContent(JSON_URL_OBJECTS);
    const objProfessions = await loadJsonContent(JSON_URL_PROFESSIONS);
    const objQuality = await loadJsonContent(JSON_URL_QUALITY);

    let obj = {
        BigCraftables: objBigCraftables,
        Categories: objCategories,
        Colors: objColors,
        ItemTypes: objItemTypes,
        Machines: objMachines,
        Objects: objObjects,
        Professions: objProfessions,
        Quality: objQuality,
    }

    return obj;
}

async function loadJsonContent(url) {
    let data = await loadJson(url);
    return data.content;
}

function loadSaveFile(e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const contents = e.target.result;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contents, "application/xml");

        // console.log(xmlDoc)

        const saveFile = xmlToJson(xmlDoc.documentElement);
        handleSaveFile(saveFile);
    }

    reader.onerror = (err) => {
        console.error("Error reading file: ", err);
    }

    reader.readAsText(file);
}

function handleSaveFile(saveObj) {
    let inventory = {};

    console.log(saveObj)

    const allItems = sortItemsByLocation(saveObj);
    inventory = getChests(allItems);

    const player = saveObj.player;
    console.log("player", player)
    const playerInventory = getChestItems(player);
    inventory["PlayerInventory"] = playerInventory;
    console.log(inventory)
}

function getChests(allItems) {
    const chests = {};
    for (const location in allItems) {
        const items = allItems[location];
        const arrChests = [];
        for (const item of items) {
            if (item.xsiType === "Chest") {
                item.items = getChestItems(item.info);
                item.playerChoiceColor = item.info.playerChoiceColor;
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
    const items = chest.items.Item;
    if (!items) return [];
    const chestItems = [];
    for (const item of items) {
        if (!item.name) continue;
        const chestItem = {
            name: item.name["#text"],
            itemId: item.itemId["#text"],
        };
        chestItem.item = item ? item : null
        chestItem.price = item.price ? item.price["#text"] : null;
        chestItem.quality = item.quality ? item.quality["#text"] : null;
        chestItem.type = item.type ? item.type["#text"] : null;
        chestItem.stack = item.stack ? item.stack["#text"] : null;

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
    if (Array.isArray(items)) {
        for (let item of items) {
            arrItems.push(getItemInfo(item));
        }
    } else {
        arrItems.push(getItemInfo(items));
    }
    return arrItems;
}

function getItemInfo(item) {
    const info = item.value.Object;
    const obj = {};
    if (info["@attributes"]) {
        obj.xsiType = info["@attributes"]["xsi:type"]
    }
    obj.name = info.name["#text"];
    obj.itemId = info.itemId["#text"];
    obj.info = info;
    return obj;
}