const { dirname, join } = require("upath");
const fsPromises = require("fs").promises;
const SwaggerParser = require("@apidevtools/swagger-parser");

const PATH_TO_ROOT_FOLDER = dirname(__dirname);
const config = {
  PATH_TO_YAML_SPEC: join(PATH_TO_ROOT_FOLDER, "assets", "oas3", "openapi.yml"),
  PATH_TO_JSON_API: join(PATH_TO_ROOT_FOLDER, "src", "api.json"),
};

generateApiJson(config);

async function generateApiJson({ PATH_TO_YAML_SPEC, PATH_TO_JSON_API }) {
  const api = await getApiAsJson(PATH_TO_YAML_SPEC);

  await writeApiFile(PATH_TO_JSON_API, api);
}

async function getApiAsJson(PATH_TO_YAML_SPEC) {
  let api = {};

  try {
    api = await SwaggerParser.bundle(PATH_TO_YAML_SPEC);
  } catch (error) {
    console.error(error);
  }

  return api;
}

async function writeApiFile(PATH_TO_JSON_API, api) {
  try {
    await fsPromises.writeFile(PATH_TO_JSON_API, JSON.stringify(api));
  } catch (error) {
    console.error(error);
  }
}
