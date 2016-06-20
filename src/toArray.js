// from babel but corrected to work in IE8
export default function toConsumableArray(arr) {
    if (typeof Array.from === 'function' && !Array.isArray(arr)) {
        return Array.from(arr);
    }
    const arr2 = Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        arr2[i] = arr[i];
    }
    return arr2;
}
