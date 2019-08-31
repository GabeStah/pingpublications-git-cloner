/**
 * @license
 * Copyright 2018 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs';
import * as resolve from 'resolve';

/**
 * Strip comments from file content.
 */
export function stripComments(content: string): string {
  /**
   * First capturing group matches double quoted string
   * Second matches single quotes string
   * Third matches block comments
   * Fourth matches line comments
   */
  const regexp: RegExp = /("(?:[^\\\"]*(?:\\.)?)*")|('(?:[^\\\']*(?:\\.)?)*')|(\/\*(?:\r?\n|.)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))/g;
  const result = content.replace(
    regexp,
    (match: string, _m1: string, _m2: string, m3: string, m4: string) => {
      // Only one of m1, m2, m3, m4 matches
      if (m3 !== undefined) {
        // A block comment. Replace with nothing
        return '';
      } else if (m4 !== undefined) {
        // A line comment. If it ends in \r?\n then keep it.
        const length = m4.length;
        if (length > 2 && m4[length - 1] === '\n') {
          return m4[length - 2] === '\r' ? '\r\n' : '\n';
        } else {
          return '';
        }
      } else {
        // We match a string
        return match;
      }
    }
  );
  return result;
}

/**
 * Tries to resolve a package by name, optionally relative to a file path. If the
 * file path is under a symlink, it tries to resolve the package under both the real path and under
 * the symlink path.
 */
export function tryResolvePackage(
  packageName: string,
  relativeTo?: string
): string | undefined {
  const realRelativeToPath: string | undefined =
    relativeTo !== undefined ? fs.realpathSync(relativeTo) : undefined;

  let resolvedPath: string | undefined = tryResolveSync(
    packageName,
    realRelativeToPath
  );
  if (resolvedPath === undefined) {
    resolvedPath = tryResolveSync(packageName, relativeTo);
  }

  return resolvedPath;
}

/**
 * Calls `resolve.sync` and if it fails, it returns `undefined`
 */
function tryResolveSync(
  packageName: string,
  relativeTo?: string
): string | undefined {
  try {
    return resolve.sync(packageName, { basedir: relativeTo });
  } catch {
    return undefined;
  }
}
