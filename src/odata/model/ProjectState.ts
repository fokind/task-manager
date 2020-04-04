import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Task } from "./Task";

export class ProjectState {
  @Edm.Key
  @Edm.String
  public projectId: ObjectID;

  @Edm.Key
  @Edm.String
  public stateId: string;

  @Edm.String
  public title: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Task)))
  public Tasks: Task[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}
