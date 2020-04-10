import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { State } from "../model/State";
import { Task } from "../model/Task";

const collectionName = "state";

@odata.type(State)
@Edm.EntitySet("States")
export class StatesController extends ODataController {
    @(odata.POST("Tasks").$ref)
    @(odata.PATCH("Tasks").$ref)
    @(odata.DELETE("Tasks").$ref)
    @odata.GET
    public async get(@odata.query query: ODataQuery): Promise<State[]> {
        const db = await connect();
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        if (mongodbQuery.query.projectId) {
            mongodbQuery.query.projectId = new ObjectID(
                mongodbQuery.query.projectId
            );
        }

        const items: State[] & { inlinecount?: number } =
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
    ): Promise<State> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const db = await connect();
        const instance = new State(
            await db.collection(collectionName).findOne({ _id }, { projection })
        );
        return instance;
    }

    @odata.POST
    public async post(@odata.body body: any): Promise<State> {
        if (body.projectId) {
            body.projectId = new ObjectID(body.projectId);
        }

        const instance = new State(body);
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

        if (body.projectId) {
            body.projectId = new ObjectID(body.projectId);
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

    @odata.GET("Tasks")
    public async getTasks(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<Task[]> {
        const stateId = new ObjectID(result._id);
        const db = await connect();
        const collection = db.collection("task");
        const mongodbQuery = createQuery(query);
        const items: Task[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .find({
                          $and: [
                              {
                                  stateId,
                              },
                              mongodbQuery.query,
                          ],
                      })
                      .project(mongodbQuery.projection)
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .toArray();
        if (mongodbQuery.inlinecount) {
            items.inlinecount = await collection
                .find({
                    $and: [
                        {
                            stateId,
                        },
                        mongodbQuery.query,
                    ],
                })
                .project(mongodbQuery.projection)
                .count(false);
        }
        return items;
    }
}
