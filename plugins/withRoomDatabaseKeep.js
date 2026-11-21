const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function withRoomDatabaseKeep(config) {
  return withAppBuildGradle(config, (config) => {
    const marker = "// CleanWise: preserve Room constructors used by reflection";
    if (!config.modResults.contents.includes(marker)) {
      config.modResults.contents += `\n${marker}\nandroid.buildTypes.release.proguardFile(rootProject.file('../plugins/room-database.pro'))\n`;
    }
    return config;
  });
};
