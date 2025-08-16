// constants
const TITLE = "Stardew Valley Thingie";
const FILE_ID = "stardewFile";
const JSON_URL_BC = "./gameData/Data/BigCraftables.json";
const JSON_URL_MACHINES = "./gameData/Data/Machines.json";
const JSON_URL_OBJECTS = "./gameData/Data/Objects.json";
const JSON_URL_STRINGS_OBJECTS = "./gameData/Strings/Objects.json";
const JSON_URL_CATEGORIES = "./gameData/categories.json";
const JSON_URL_PROFESSIONS = "./gameData/professions.json";
// const JSON_URL_COLORS = "./Data/colors.json"
// const JSON_URL_ITEM_TYPES = "./Data/item_types.json";
// const JSON_URL_QUALITY = "./Data/quality.json";
const BEAR_KNOWLEDGE_EVENT = "2120303";
const SPRING_ONION_MASTERY_EVENT = "3910979";

const MACHINES = ["Preserves Jar", "Keg", "Dehydrator"];

// global variables
let objGameData;
let machinesData;
let saveFileData;

function startup() {
    document.getElementById(FILE_ID).addEventListener("change", loadSaveFile);

    loadJsonFiles().then((data) => {
        objGameData = data;
        console.log(objGameData);
        getMachineDetails();
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
    // obj.Colors = await loadJson(JSON_URL_COLORS);
    // obj.ItemTypes = await loadJson(JSON_URL_ITEM_TYPES);
    // obj.Quality = await loadJson(JSON_URL_QUALITY);

    return obj;
}

function getMachineDetails() {
    const bc = objGameData.BigCraftables;
    const machines = {};
    for (const id in bc) {
        const bcName = bc[id].Name;
        if (MACHINES.includes(bcName)) {
            const machineDetails = objGameData.Machines["(BC)" + id];
            const outputRules = machineDetails.OutputRules;
            machines[bcName] = getOutputAndTriggers(outputRules);
        }
    }
    machinesData = machines;
    console.log("machines", machinesData);
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
        const requiredTags = trigger.RequiredTags ? trigger.RequiredTags : [];
        if (id) {
            triggersList = processObjectById(id, requiredTags);
            continue;
        }
        triggersList.push(...processObjectByTags(requiredTags))
    }
    return triggersList;
}

function processObjectByTags(requiredTags) {
    const ids = getObjectsIds(requiredTags)
    const objects = [];
    for (const id of ids) {
        const obj = getObjectById(id)
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
    }

    reader.onerror = (err) => {
        console.error("Error reading file: ", err);
    }

    reader.readAsText(file);
}

function handleSaveFile(saveObj) {
    saveFileData = {};
    let inventory = {};

    console.log(saveObj)

    const allItems = sortItemsByLocation(saveObj);
    inventory = getChests(allItems);

    const player = saveObj.player;
    console.log("player", player)
    const playerInventory = getChestItems(player);
    inventory.PlayerInventory = playerInventory;

    saveFileData.Inventory = inventory;

    const playerProfessions = getPlayerProfessions(player)
    const tillerId = getProfession("Tiller");
    saveFileData.IsTiller = playerProfessions.includes(tillerId);

    const artisanId = getProfession("Artisan");
    saveFileData.IsArtisan = playerProfessions.includes(artisanId);

    saveFileData.HasBearPaw = hasEventHappened(player, BEAR_KNOWLEDGE_EVENT);
    saveFileData.HasSpringOnionMastery = hasEventHappened(player, SPRING_ONION_MASTERY_EVENT);



    console.log("save file", saveFileData)
}

function hasEventHappened(player, eventId) {
    for (const event of player.eventsSeen.int) {
        if (Object.values(event).includes(eventId)) {
            return true;
        }
    }
    return false;
}

function getPlayerProfessions(player) {
    const professions = [];
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
    let items = chest.items.Item;
    if (!items) return [];
    const chestItems = [];
    if (!Array.isArray(items)) items = [items];
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
    if (info.specialChestType) {
        obj.specialChestType = info.specialChestType["#text"];
    }
    obj.name = info.name["#text"];
    obj.itemId = info.itemId["#text"];
    obj.info = info;
    return obj;
}