const axios = require("axios");

const GITHUB_API_URL = "https://api.github.com/search/repositories";

const getMostStarredProjects = async (startDate, endDate) => {
  const query = `created:${startDate}..${endDate}`;
  const url = `${GITHUB_API_URL}?q=${encodeURIComponent(
    query
  )}&sort=stars&order=desc`;

  try {
    const response = await axios.get(url);
    const projects = response.data.items;

    if (projects.length === 0) {
      console.log("No projects found in this date range.");
      return;
    }

    console.log(
      `Most starred GitHub projects from ${startDate} to ${endDate}:`
    );
    projects.forEach((project) => {
      console.log(
        `- ${project.full_name} (Stars: ${project.stargazers_count})`
      );
    });
  } catch (error) {
    console.error("Error fetching data from GitHub API:", error.message);
  }
};

const parseArguments = () => {
  const args = process.argv.slice(2,5);
  let startDate = args[0] || "2000-01-01";
  let endDate = args[1] || new Date().toISOString().split("T")[0];

  return { startDate, endDate };
};

const main = () => {
  const { startDate, endDate } = parseArguments();
  getMostStarredProjects(startDate, endDate);
};

main();
