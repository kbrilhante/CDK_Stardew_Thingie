// constants
const TITLE = "Stardew Valley Thingie";
const FILE_ID = "stardewFile";
const JSON_URL_BC = "./gameData/Data/BigCraftables.json";
// const JSON_URL_FISH_POND = "./Data/FishPondData.json";
const JSON_URL_MACHINES = "./gameData/Data/Machines.json";
const JSON_URL_OBJECTS = "./gameData/Data/Objects.json";
const JSON_URL_STRINGS_OBJECTS = "./gameData/Strings/Objects.json";
const JSON_URL_CATEGORIES = "./gameData/categories.json";
// const JSON_URL_COLORS = "./Data/colors.json"
// const JSON_URL_ITEM_TYPES = "./Data/item_types.json";
// const JSON_URL_PROFESSIONS = "./Data/professions.json";
// const JSON_URL_QUALITY = "./Data/quality.json";
const BEAR_KNOWLEDGE_EVENT = "2120303";
const SPRING_ONION_MASTERY_EVENT = "3910979";

const MACHINES = ["Preserves Jar", "Keg", "Dehydrator"];

// global variables
let objGameData;

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
    // obj.FishPonds = await loadJsonContent(JSON_URL_FISH_POND);
    obj.Categories = await loadJson(JSON_URL_CATEGORIES);
    // obj.Colors = await loadJson(JSON_URL_COLORS);
    // obj.ItemTypes = await loadJson(JSON_URL_ITEM_TYPES);
    // obj.Professions = await loadJson(JSON_URL_PROFESSIONS);
    // obj.Quality = await loadJson(JSON_URL_QUALITY);

    return obj;
}

async function loadJsonContent(url) {
    let data = await loadJson(url);
    return data.content;
}

function getMachineDetails() {
    const bc = objGameData.BigCraftables;
    const machines = {};
    for (const id in bc) {
        const bcName = bc[id].Name;
        if (MACHINES.includes(bcName)) {
            console.log(bcName);
            const machineDetails = objGameData.Machines["(BC)" + id];
            const outputRules = machineDetails.OutputRules;
            machines[bcName] = getOutputAndTriggers(outputRules);
        }
    }
    console.log("machines", machines);
}

function getOutputAndTriggers(outputRules) {
    // console.log("output rules", outputRules);
    const outputTriggers = {};

    for (let rule of outputRules) {
        console.log("rule", rule.Id);
        const ruleId = rule.Id; // process this information with the output object name
        const obj = {
            DaysUntilReady: rule.DaysUntilReady,
            MinutesUntilReady: rule.MinutesUntilReady,
        };
        const output = rule.OutputItem;
        const triggers = rule.Triggers;

        obj.Output = processOutput(output);
        obj.Triggers = processTriggers(triggers);

        outputTriggers[ruleId] = obj;
    }
    return outputTriggers
}

function processOutput(output) {
    if (Array.isArray(output)) output = output[0];
    console.log("output item", output);
    const id = output.Id;
    const itemId = output.ItemId.split(" ");
    console.log(">>>>", id, "|", itemId);
    console.log()
    // todo: filter information
    // "DisplayName": "[LocalizedText Strings\\Objects:Jelly_Name]",
}

function processTriggers(triggers) {
    const processedTriggers  = {
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


// function getOutputAndTriggers(outputRules) {
//     // console.log(outputRules)
//     for (let out of outputRules) {
//         const outTriggers = out.Triggers;
//         const outputItems = out.OutputItem;
//         console.log(out)
//         // console.log("triggers", outTriggers)
//         // console.log("output", outputItems)
//         const obj = {
//             triggers: []
//         };
//         for (const objTrigger of outTriggers) {
//             const triggers = getTriggers(objTrigger);
//             for (const tr of triggers) {
//                 obj.triggers.push(tr);
//             }
//         }
//         for (const output of outputItems) {
//             getOutput(output);
//         }
//         console.log(obj)
//         console.log("----------------")
//     }
// }

// function getOutput(output) {
//     console.log("O", output);

// }

// function getTriggers(trigger) {
//     let reqId = trigger.RequiredItemId;
//     let objects = [];
//     if (reqId) {
//         reqId = reqId.replace("(O)", "");
//         objects.push(getTrigger(reqId, trigger));
//     } else {
//         let tags = trigger.RequiredTags
//         const objIds = getObjectsIds(tags);
//         for (const id of objIds) {
//             const obj = getTrigger(id, trigger);
//             objects.push(obj);
//         }
//     }
//     return objects;
// }

// function getTrigger(id, trigger) {
//     const obj = getObject(id);
//     obj.requiredCount = trigger.RequiredCount;
//     return obj;
// }

// function getObject(id) {
//     // console.log("id", id)
//     const objInfo = objGameData.Objects[id];
//     // console.log("object", objInfo)
//     const obj = {
//         id: id,
//         name: objInfo.Name,
//         price: objInfo.Price,
//         objInfo: objInfo,
//     }
//     return obj;
// }

// function getObjectsIds(tags) {
//     const tag = tags[0];
//     let cat = null;
//     if (tag.includes("category_")) {
//         cat = getCategoryId(tag);
//     }
//     const ids = [];
//     const objects = objGameData.Objects;
//     for (const objId in objects) {
//         const object = objects[objId];
//         const isInContext = object.ContextTags == null ? false : object.ContextTags.includes(tag);
//         // console.log(object.Category)
//         if (cat === object.Category || isInContext) {
//             ids.push(objId);
//         }
//     }
//     return ids;
// }

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