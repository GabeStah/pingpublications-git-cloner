import { RepositoryServiceType } from '../enums';
import { Client } from './Client';
import { Project } from './Project';

export class Repository {
  public client: Client;
  public name: string;
  public owner: string;
  public projects: Project[];
  public refName: string = 'master';
  public service: RepositoryServiceType;
  public hash?: string;

  constructor(config: any) {
    this.client = new Client(config.client);
    this.name = config.name;
    this.owner = config.owner;
    this.refName = config.refName;
    this.service = config.service;

    if (config.projects) {
      this.projects = config.projects.map(
        (project: any) => new Project(project)
      );
    }
  }
}
