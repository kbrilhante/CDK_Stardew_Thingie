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

/**
 * Checks whether an array contains an object that matches another object
 * on a given set of keys.
 *
 * @template T
 * @param {T[]} array - The array of objects to search.
 * @param {Partial<T>} object - The object with key-value pairs to match.
 * @param {Array<keyof T>} keys - The keys to compare between items in the array and the target object.
 * @returns {boolean} `true` if at least one object in the array matches all the provided keys, otherwise `false`.
 *
 * @example
 * const arr = [
 *   { name: "apple", type: "fruit", color: "red" },
 *   { name: "carrot", type: "vegetable", color: "orange" }
 * ];
 *
 * arrayHasObject(arr, { name: "apple", type: "fruit" }, ["name", "type"]);
 * // => true
 *
 * arrayHasObject(arr, { name: "apple", type: "vegetable" }, ["name", "type"]);
 * // => false
 */

function arrayHasObject(array, object, keys) {
    return array.some(element => 
        keys.every(key => element[key] === object[key])
    );
}

/**
 * Finds the index of the first object in an array that matches another object
 * on a given set of keys.
 *
 * @template T
 * @param {T[]} array - The array of objects to search.
 * @param {Partial<T>} object - The object with key-value pairs to match.
 * @param {Array<keyof T>} keys - The keys to compare between items in the array and the target object.
 * @returns {number} The index of the matching object, or -1 if no match is found.
 *
 * @example
 * const arr = [
 *   { name: "apple", type: "fruit", color: "red" },
 *   { name: "carrot", type: "vegetable", color: "orange" }
 * ];
 *
 * arrayFindIndexByKeys(arr, { name: "carrot", type: "vegetable" }, ["name", "type"]);
 * // => 1
 *
 * arrayFindIndexByKeys(arr, { name: "apple", type: "vegetable" }, ["name", "type"]);
 * // => -1
 */
function arrayFindIndexByKeys(array, object, keys) {
  return array.findIndex(item =>
    keys.every(key => item[key] === object[key])
  );
}
