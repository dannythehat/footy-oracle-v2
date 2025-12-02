import { fixturesApi } from "./api";

export const getFixturesByDate = async (date: string) => {
  const res = await fixturesApi.getByDate(date);
  return res.fixtures || res.data || res; 
};
