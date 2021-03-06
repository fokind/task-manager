import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Project } from "../model/Project";
import { State } from "../model/State";

const collectionName = "project";

@odata.type(Project)
@Edm.EntitySet("Projects")
export class ProjectsController extends ODataController {
    @(odata.POST("States").$ref)
    @(odata.PATCH("States").$ref)
    @(odata.DELETE("States").$ref)
    @odata.GET
    public async get(@odata.query query: ODataQuery): Promise<Project[]> {
        const db = await connect();
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        const result: Project[] & { inlinecount?: number } =
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
    ): Promise<Project> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const db = await connect();
        const instance = new Project(
            await db.collection(collectionName).findOne({ _id }, { projection })
        );
        return instance;
    }

    @odata.POST
    public async post(@odata.body body: any): Promise<Project> {
        const instance = new Project(body);
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

    @odata.GET("States")
    public async getStates(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<State[]> {
        const projectId = new ObjectID(result._id);
        const db = await connect();
        const collection = db.collection("state");
        const mongodbQuery = createQuery(query);
        const items: State[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .find({
                          $and: [
                              {
                                  projectId,
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
                            projectId,
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
