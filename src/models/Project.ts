export interface ProjectOptions {
  hasMetaDescription: boolean;
  hasSources: boolean;
  hasFrontMatter: boolean;
}

export class Project {
  public options: ProjectOptions;
  public path: string;
  // TODO: Glob support
  // See: https://github.com/isaacs/node-glob
  public writ: string | string[];

  constructor(config: any) {
    this.options = config.options;
    this.path = config.path;
    this.writ = config.writ;
  }
}
