// Function Name : hook useApp
// Created date :  24/7/24             by :  NgVinh
// Updated date :                      by :  NgVinh

export const getParamsHelp = (params) => {
  const urlParams = [];
  for (const key of Object.keys(params)) {
    const value = params[key];

    if (Array.isArray(value)) {
      value.forEach((item) => {
        urlParams.push(`${key}[]=${encodeURIComponent(item)}`);
      });
    } else {
      urlParams.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return urlParams.join("&");
};
