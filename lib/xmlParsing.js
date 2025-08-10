/**
 * 
 * @param {Document} xml 
 * @returns 
 */

function xmlToJson(xml) {
    // Return next node
    if (xml.nodeType === 3) {
        return xml.nodeValue.trim();
    }

    let obj = {};

    if (xml.nodeType === 1 && xml.attributes.length > 0) {
        obj["@attributes"] = {}
        for (let attr of xml.attributes) {
            obj["@attributes"][attr.nodeName] = attr.nodeValue;
        }
    }

    // Children
    if (xml.hasChildNodes()) {
        for (let child of xml.childNodes) {
            const name = child.nodeName;
            const value = xmlToJson(child);
            if (value === "") continue;
            if (!obj[name]) {
                obj[name] = value;
            } else {
                // if already exists convert to array
                if (!Array.isArray(obj[name])) {
                    obj[name] = [obj[name]];
                }
                obj[name].push(value);
            }
        }
    }

    return obj;
}