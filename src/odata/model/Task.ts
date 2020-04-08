import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
// import { State } from "./State";

export class Task {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public title: string;

    @Edm.Double
    public order: number;

    @Edm.String
    public stateId: ObjectID;

    // @Edm.EntityType(Edm.ForwardRef(() => State))
    // public State: State;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
