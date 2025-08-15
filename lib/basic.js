function includesAny(array1, array2) {
    for (const element of array2) {
        if (array1.includes(element)) return true;
    }
    return false;
}

function includesAll(array1, array2) {
    for (const element of array2) {
        if (!array1.includes(element)) return false;
    }
    return true;
}