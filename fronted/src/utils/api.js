export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const finalOptions = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
            ...(options.headers || {}),
        },
    };

    const res = await fetch(url, finalOptions);
    return res.json();
};
