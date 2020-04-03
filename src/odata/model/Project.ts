import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Project {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  public _id: ObjectID;

  @Edm.String
  public title: string;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
