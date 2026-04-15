const fs = require('fs');
const path = require('path');

function listJsFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => path.join(dirPath, entry.name));
}

function scanModules(basePath = process.cwd()) {
  const commandsPath = path.join(basePath, 'commands');
  const eventsPath = path.join(basePath, 'events');
  const logsPath = path.join(basePath, 'logs');
  const modelsPath = path.join(basePath, 'models');

  const commandModules = [];

  if (fs.existsSync(commandsPath)) {
    const categories = fs
      .readdirSync(commandsPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    for (const category of categories) {
      const categoryPath = path.join(commandsPath, category);
      const files = listJsFiles(categoryPath);
      commandModules.push({
        type: 'command-category',
        name: category,
        path: `commands/${category}`,
        featureCount: files.length,
        features: files.map((file) => path.basename(file, '.js')).sort((a, b) => a.localeCompare(b)),
      });
    }
  }

  const eventFiles = listJsFiles(eventsPath);
  const logFiles = listJsFiles(logsPath);
  const modelFiles = listJsFiles(modelsPath);

  const groupedModules = [
    ...commandModules,
    {
      type: 'events',
      name: 'events',
      path: 'events',
      featureCount: eventFiles.length,
      features: eventFiles.map((file) => path.basename(file, '.js')).sort((a, b) => a.localeCompare(b)),
    },
    {
      type: 'logs',
      name: 'logs',
      path: 'logs',
      featureCount: logFiles.length,
      features: logFiles.map((file) => path.basename(file, '.js')).sort((a, b) => a.localeCompare(b)),
    },
    {
      type: 'models',
      name: 'models',
      path: 'models',
      featureCount: modelFiles.length,
      features: modelFiles.map((file) => path.basename(file, '.js')).sort((a, b) => a.localeCompare(b)),
    },
  ];

  const summary = {
    moduleCount: groupedModules.length,
    commandCategoryCount: commandModules.length,
    commandCount: commandModules.reduce((total, module) => total + module.featureCount, 0),
    eventCount: eventFiles.length,
    logCount: logFiles.length,
    modelCount: modelFiles.length,
    scannedAt: new Date().toISOString(),
  };

  return {
    summary,
    modules: groupedModules,
  };
}

module.exports = {
  scanModules,
};
