const getData = (key) => {
    return utools.dbStorage.getItem(key);
}

const setData = (key, value) => {
    return utools.dbStorage.setItem(key, value);
}

export { getData, setData }
