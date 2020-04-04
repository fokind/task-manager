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

        const result: Task[] & { inlinecount?: number } =
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
            result.inlinecount = await db
                .collection(collectionName)
                .find(mongodbQuery.query)
                .project(mongodbQuery.projection)
                .count(false);
        }
        return result;
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
    public async post(
        @odata.body { title, stateId, projectId }: any
    ): Promise<Task> {
        const instance = new Task({
            title,
            stateId,
        });
        if (projectId) {
            instance.projectId = new ObjectID(projectId);
        }
        const db = await connect();
        const collection = await db.collection(collectionName);
        instance._id = (await collection.insertOne(instance)).insertedId;
        return instance;
    }

    @odata.PATCH
    public async patch(
        @odata.key key: string,
        @odata.body delta: any
    ): Promise<number> {
        const db = await connect();
        if (delta._id) {
            delete delta._id;
        }

        const _id = new ObjectID(key);
        return await db
            .collection(collectionName)
            .updateOne({ _id }, { $set: delta })
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
