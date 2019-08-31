import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';
import * as fetch from 'node-fetch';
import * as os from 'os';
import * as path from 'path';

import { stripComments, tryResolvePackage } from './utils';

export interface IConfigurationFile {
  apollo?: Partial<{
    headers: Partial<{ authorization: string }>;
    fetch?: any;
    uri: string;
  }>;

  repositories?: Partial<{
    owner: string;
    name: string;
    service: string;
    refName: string;
    client: Partial<{
      name: string;
      url: string;
      tagline: string;
    }>;
    projects: Partial<{
      path: string;
      writ: string | string[];
      options: Partial<{ hasSources: boolean }>;
    }>[];
  }>[];
}

export interface IConfigurationLoadResult {
  path?: string;
  results?: IConfigurationFile;
}

export const DEFAULT_CONFIG_FILE_NAME = 'git-cloner.config.js';
export const CONFIG_FILENAMES = [
  DEFAULT_CONFIG_FILE_NAME,
  'git-cloner.config.json',
  'git-cloner.config.yaml',
  'git-cloner.config.yml'
];

export const DEFAULT_CONFIG: IConfigurationFile = {
  apollo: {
    headers: {
      authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
    },
    fetch: fetch as any,
    uri: 'https://api.github.com/graphql'
  },
  repositories: []
};

const CONFIG_NAME_MASK = /^git-cloner:(.*)$/;

/**
 * Searches for a GitCloner configuration and returns the data from the config.
 * @param configFile A path to a config file, this can be null if the location of a config is not known
 * of the search for a configuration.
 * @returns Load status for a GitCloner configuration object
 */
export function findConfiguration(
  configFile?: string
): IConfigurationLoadResult {
  const configPath = findConfigurationPath(configFile);
  const loadResult: IConfigurationLoadResult = { path: configPath };

  try {
    loadResult.results = loadConfigurationFromPath(configPath);
    return loadResult;
  } catch (error) {
    throw new Error(
      `Failed to load ${configPath}: ${(error as Error).message}`
    );
  }
}

/**
 * Searches for a GitCloner configuration and returns the path to it.
 * Could return undefined if not configuration is found.
 * @param suppliedConfigFilePath A path to an known config file supplied by a user. Pass null here if
 * the location of the config file is not known and you want to search for one.
 * of the search for a configuration.
 * @returns An absolute path to a git-cloner js, json, yml, or yaml file
 * or undefined if neither can be found.
 */
export function findConfigurationPath(
  suppliedConfigFilePath?: string
): string | undefined {
  if (suppliedConfigFilePath !== undefined) {
    if (!fs.existsSync(suppliedConfigFilePath)) {
      throw new Error(
        `Could not find config file at: ${path.resolve(suppliedConfigFilePath)}`
      );
    } else {
      return path.resolve(suppliedConfigFilePath);
    }
  } else {
    // search for git-cloner config from input file location
    let configFilePath = findup(CONFIG_FILENAMES, path.resolve(process.cwd()!));
    if (configFilePath !== undefined) {
      return configFilePath;
    }

    // search for git-cloner config in home directory
    const homeDir = os.homedir();
    for (const configFilename of CONFIG_FILENAMES) {
      configFilePath = path.join(homeDir, configFilename);
      if (fs.existsSync(configFilePath)) {
        return path.resolve(configFilePath);
      }
    }
    // no path could be found
    return undefined;
  }
}

/**
 * Find a file by names in a directory or any ancestor directory.
 * Will try each filename in filenames before recursing to a parent directory.
 * This is case-insensitive, so it can find 'GiTClOnEr.js' when searching for 'git-cloner.js'.
 */
function findup(filenames: string[], directory: string): string | undefined {
  while (true) {
    const res = findFile(directory);
    if (res !== undefined) {
      return path.join(directory, res);
    }

    const parent = path.dirname(directory);
    if (parent === directory) {
      return undefined;
    }
    directory = parent;
  }

  function findFile(cwd: string): string | undefined {
    const dirFiles = fs.readdirSync(cwd);
    for (const filename of filenames) {
      const index = dirFiles.indexOf(filename);
      if (index > -1) {
        return filename;
      }
      // Try reading in the entire directory and looking for a file with different casing.
      const result = dirFiles.find(entry => entry.toLowerCase() === filename);
      if (result !== undefined) {
        console.log(
          `Using mixed case ${filename} is deprecated. Found: ${path.join(
            cwd,
            result
          )}`
        );
        return result;
      }
    }
    return undefined;
  }
}

/**
 * Used Node semantics to load a configuration file given configFilePath.
 * For example:
 * '/path/to/config' will be treated as an absolute path
 * './path/to/config' will be treated as a relative path
 * 'path/to/config' will attempt to load a to/config file inside a node module named path
 * @param configFilePath The configuration to load
 * @param _originalFilePath
 * @returns a configuration object for GitCloner loaded from the file at configFilePath
 */
export function loadConfigurationFromPath(
  configFilePath?: string,
  _originalFilePath?: string
) {
  if (configFilePath == undefined) {
    return DEFAULT_CONFIG;
  } else {
    const resolvedConfigFilePath = resolveConfigurationPath(configFilePath);
    const config = readConfigurationFile(resolvedConfigFilePath);
    // Override missing defaults.
    return _.defaultsDeep(config, DEFAULT_CONFIG);
  }
}

/** Reads the configuration file from disk and parses it as raw JSON, YAML or JS depending on the extension. */
export function readConfigurationFile(filepath: string): IConfigurationFile {
  const resolvedConfigFileExt = path.extname(filepath);
  if (/\.(json|ya?ml)/.test(resolvedConfigFileExt)) {
    const fileContent = fs
      .readFileSync(filepath, 'utf8')
      .replace(/^\uFEFF/, '');
    try {
      if (resolvedConfigFileExt === '.json') {
        return JSON.parse(stripComments(fileContent)) as IConfigurationFile;
      } else {
        return yaml.safeLoad(fileContent) as IConfigurationFile;
      }
    } catch (e) {
      const error = e as Error;
      // include the configuration file being parsed in the error since it may differ from the directly referenced config
      throw new Error(`${error.message} in ${filepath}`);
    }
  } else {
    return eval('require')(filepath) as IConfigurationFile;
  }
}

/**
 * Resolve configuration file path or node_module reference
 * @param filePath Relative ("./path"), absolute ("/path"), node module ("path"), or built-in ("tslint:path")
 */
function resolveConfigurationPath(filePath: string, relativeTo?: string) {
  const matches = filePath.match(CONFIG_NAME_MASK);
  const isBuiltInConfig = matches !== null && matches.length > 0;
  if (isBuiltInConfig) {
    const configName = matches![1];
    try {
      return require.resolve(`./${configName}`);
    } catch (err) {
      throw new Error(
        `${filePath} is not a built-in config, try "tslint:recommended" instead.`
      );
    }
  }

  const basedir = relativeTo !== undefined ? relativeTo : process.cwd();
  try {
    let resolvedPackagePath: string | undefined = tryResolvePackage(
      filePath,
      basedir
    );
    if (resolvedPackagePath === undefined) {
      resolvedPackagePath = require.resolve(filePath);
    }

    return resolvedPackagePath;
  } catch (err) {
    throw new Error(
      `Invalid "extends" configuration value - could not require "${filePath}". ` +
        'Review the Node lookup algorithm (https://nodejs.org/api/modules.html#modules_all_together) ' +
        'for the approximate method TSLint uses to find the referenced configuration file.'
    );
  }
}
