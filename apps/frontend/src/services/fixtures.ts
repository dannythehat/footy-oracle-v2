import api from "./api";

export const getFixturesByDate = async (date) => {
  const res = await api.get(`/fixtures`, { params: { date } });
  return res.data.fixtures;
};
