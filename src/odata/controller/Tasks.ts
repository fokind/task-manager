import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Task } from "../model/Task";

const collectionName = "task";

@odata.type(Task)
@Edm.EntitySet("Tasks")
export class TasksController extends ODataController {
    @odata.GET
    public async get(@odata.query query: ODataQuery): Promise<Task[]> {
        const db = await connect();
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        if (mongodbQuery.query.stateId) {
            mongodbQuery.query.stateId = new ObjectID(
                mongodbQuery.query.stateId
            );
        }

        const items: Task[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await db
                      .collection(collectionName)
                      .find(mongodbQuery.query)
                      .project(mongodbQuery.projection)
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .toArray();

        if (mongodbQuery.inlinecount) {
            items.inlinecount = await db
                .collection(collectionName)
                .find(mongodbQuery.query)
                .project(mongodbQuery.projection)
                .count(false);
        }
        return items;
    }

    @odata.GET
    public async getOne(
        @odata.key key: string,
        @odata.query query: ODataQuery
    ): Promise<Task> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const db = await connect();
        const instance = new Task(
            await db.collection(collectionName).findOne({ _id }, { projection })
        );
        return instance;
    }

    @odata.POST
    public async post(@odata.body body: any): Promise<Task> {
        if (body.stateId) {
            body.stateId = new ObjectID(body.stateId);
        }

        const instance = new Task(body);
        const db = await connect();
        const collection = await db.collection(collectionName);
        instance._id = (await collection.insertOne(instance)).insertedId;
        return instance;
    }

    @odata.PATCH
    public async patch(
        @odata.key key: string,
        @odata.body body: any
    ): Promise<number> {
        const db = await connect();

        if (body._id) {
            delete body._id;
        }

        if (body.stateId) {
            body.stateId = new ObjectID(body.stateId);
        }

        const _id = new ObjectID(key);
        return await db
            .collection(collectionName)
            .updateOne({ _id }, { $set: body })
            .then((result) => result.modifiedCount);
    }

    @odata.DELETE
    public async remove(@odata.key key: string): Promise<number> {
        const _id = new ObjectID(key);
        return (await connect())
            .collection(collectionName)
            .deleteOne({ _id })
            .then((result) => result.deletedCount);
    }
}
