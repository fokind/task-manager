import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { ProjectState } from "./ProjectState";

export class Task {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  public _id: ObjectID;

  @Edm.String
  public title: string;

  @Edm.String
  public stateId: string;

  @Edm.String
  public projectId: ObjectID;

  @Edm.EntityType(Edm.ForwardRef(() => ProjectState))
  public State: ProjectState;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
