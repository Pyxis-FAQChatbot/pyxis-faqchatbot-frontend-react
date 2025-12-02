import fastApiInstance from "./fastApiInstance";
import endpoints from "./endpoints";

const mkHourPath = async (dong) => {
  const response = await fastApiInstance.get(endpoints.market.hour, {
    params: { dong: dong },
  });
  return response.data; 
};
const mkAgePath = async (dong) => {
  const response = await fastApiInstance.get(endpoints.market.age, {
    params: { dong: dong },
  });
  return response.data; 
};
const mkShopPath = async (dong) => {
  const response = await fastApiInstance.get(endpoints.market.shop, {
    params: { dong: dong },
  });
  return response.data; 
};

export const marketApi = {
    mkHourPath,
    mkAgePath,
    mkShopPath
};