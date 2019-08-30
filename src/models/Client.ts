export class Client {
  public name: string;
  public tagline: string;
  public url: string;

  constructor(config: any) {
    this.name = config.name;
    this.tagline = config.tagline;
    this.url = config.url;
  }
}
