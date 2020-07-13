import { join } from "path";
import { last } from "ramda";
import { API_URL, COUNTRY, STATE } from "./constants";
import { fetchWithAuth } from "./fetchWithAuth";
import { writeFile } from "./file";
import { courseToTeeSets } from "./tee";

let course = null;
let courses = null;

const normalize = (c) => ({
  address: c.Facility.GeoLocationFormattedAddress,
  id: c.CourseId,
  name: c.CourseName,
  tees: courseToTeeSets(c),
});

const fetchCourseDetails = async (id) => {
  const pathname = `/api/v1/courses/${id}.json`;
  const uri = new URL(pathname, API_URL);
  const { data } = await fetchWithAuth(uri);

  return normalize(data);
};

const fetchCourseByName = async (name) => {
  const pathname = "/api/v1/courses/search.json";
  const uri = new URL(pathname, API_URL);

  uri.searchParams.set("name", name);
  uri.searchParams.set("country", "USA");

  const { data } = await fetchWithAuth(uri);
  const { courses } = data;
  const recent = last(courses);

  if (!recent) return null;

  const { CourseID: id } = recent;

  return fetchCourseDetails(id);
};

const fetchCourse = async (name) => {
  const pathname = "/api/v1/courses/search.json";
  const uri = new URL(pathname, API_URL);

  uri.searchParams.set("name", name);
  uri.searchParams.set("country", "USA");

  const { data } = await fetchWithAuth(uri);
  const { courses } = data;
  const recent = last(courses);
  const { CourseID, CourseName } = recent;

  return fetchCourseDetails(CourseID);
};

const fetchCourses = async (state) => {
  const pathname = `/api/v1/courses/search.json`;
  const uri = new URL(pathname, API_URL);

  uri.searchParams.set("state", state);
  uri.searchParams.set("country", COUNTRY);

  const { data } = await fetchWithAuth(uri);
  ({ courses } = data);

  await writeFile(
    join(__dirname, "./data", "courses.json"),
    JSON.stringify(courses, null, 2)
  );

  return courses;
};

const courseHandicap = ({ courseRating, handicapIndex, par, slopeRating }) => {
  if (par === 0) return 0;

  const handicap = Math.floor(
    handicapIndex * (slopeRating / 113) + (courseRating - par)
  );

  const isNineHoles = par && par < 54;

  if (isNineHoles) {
    return Math.floor(handicap / 2);
  }

  return handicap;
};

export {
  course,
  courseHandicap,
  fetchCourse,
  fetchCourseByName,
  fetchCourseDetails,
  fetchCourses,
};
