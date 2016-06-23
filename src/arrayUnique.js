export default function(origArr) {
    if (typeof origArr.splice !== 'function') {
        throw new TypeError('array must have splice method');
    }
    const arr = origArr.slice(0, origArr.length);
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] !== arr[j]) {
                continue;
            }
            arr.splice(j, 1);
            // now we move back one because we just deleted something from the array
            j--;
        }
    }
    return arr;
};
