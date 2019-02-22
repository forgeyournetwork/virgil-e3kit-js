type IndexObject = { [index: string]: any } & {};

export const withDefaults = <T extends IndexObject, P extends Partial<T>>(obj: T, defaults: P) => {
    Object.keys(defaults).forEach(key => {
        if (obj[key] === undefined && defaults[key] !== undefined) obj[key] = defaults[key];
    });
    return obj as T;
};
