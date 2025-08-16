/**
 * 
 * @param {Array} array1 
 * @param {Array} array2 
 * @returns 
 */
function includesAny(array1, array2) {
    for (const element of array2) {
        if (array1.includes(element)) return true;
    }
    return false;
}

/**
 * 
 * @param {Array} array1 
 * @param {Array} array2 
 * @returns 
 */
function includesAll(array1, array2) {
    for (const element of array2) {
        if (!array1.includes(element)) return false;
    }
    return true;
}

/**
 * 
 * @param {Set} set 
 */
function setToArray(set) {
    let arr = [];
    for (const value of set.values()) {
        arr.push(value);
    }
    return arr;
}