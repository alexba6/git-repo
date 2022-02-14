
export const END_PUSH_HEX_DATA = [
    '303033300130303065756e7061636b206f6b0a303031396f6b20726566732f68656164732f6d61737465720a30303030',
    '30303030'
]

/**
 * @param s
 */
export const packSideband = (s: string): string => {
    const n = (4 + s.length).toString(16);
    return Array(4 - n.length + 1).join('0') + n + s;
}