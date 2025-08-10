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

            // console.log(xmlDoc)

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
    let inventory = {};

    console.log(saveObj)

    const allItems = sortItemsByLocation(saveObj);
    inventory = getChests(allItems);

    // console.log(saveObj.player.items)
    // console.log(saveObj.locations.GameLocation[0].buildings.Building)
    // for (let building of saveObj.locations.GameLocation[0].buildings.Building) {
    //     console.log(building.buildingType["#text"])
    // }

    const player = saveObj.player;
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
        // chestItem["xsi:type"] = item["@attributes"] ? item["@attributes"]["xsi:type"] : null;

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