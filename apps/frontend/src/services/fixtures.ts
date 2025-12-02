import { fixturesApi } from "./api";

export const getFixturesByDate = async (date: string) => {
  const res = await fixturesApi.getByDate(date: string);
  return res.fixtures || res.data || res; 
};
