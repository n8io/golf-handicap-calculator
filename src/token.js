let jwt = null;

const setToken = (token) => (jwt = token);

export { jwt as token, setToken };
