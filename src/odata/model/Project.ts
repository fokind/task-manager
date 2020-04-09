import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { State } from "./State";

export class Project {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public title: string;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => State)))
    public States: State[];

    constructor(data: any) {
        Object.assign(this, data);
    }
}
