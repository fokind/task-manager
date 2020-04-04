import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Task } from "./Task";

export class State {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  public _id: ObjectID;

  @Edm.String
  public projectId: ObjectID;

  @Edm.String
  public title: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Task)))
  public Tasks: Task[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}
