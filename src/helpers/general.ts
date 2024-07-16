export function empty(mixedVar: any) {
    let undef;
    let key;
    let i;
    let len;
    let emptyValues = [undef, null, false, 0, '', '0'];

    for (i = 0, len = emptyValues.length; i < len; i++) {
        if (mixedVar === emptyValues[i]) {
            return true
        }
    }

    if (typeof mixedVar === 'object') {
        for (key in mixedVar) {
            if (mixedVar.hasOwnProperty(key)) {
                return false
            }
        }
        return true
    }

    return false
}