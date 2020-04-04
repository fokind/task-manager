import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { ProjectState } from "../model/ProjectState";
import { Task } from "../model/Task";

@odata.type(ProjectState)
@Edm.EntitySet("ProjectStates")
export class ProjectStatesController extends ODataController {
    @(odata.POST("Tasks").$ref)
    @odata.GET
    public async getOne(
        @odata.key stateId: string,
        @odata.key projectId: string
    ): Promise<ProjectState> {
        let title;
        switch (stateId) {
            case "todo":
                title = "To Do";
                break;

            case "inprogress":
                title = "In Progress";
                break;

            case "done":
                title = "Done";
                break;

            default:
                title = "";
                break;
        }

        return new ProjectState({
            stateId,
            projectId: new ObjectID(projectId),
            title,
        });
    }

    @odata.GET("Tasks")
    public async getTasks(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<Task[]> {
        const { stateId } = result;
        const projectId = new ObjectID(result.projectId);
        const db = await connect();
        const collection = db.collection("task");
        const mongodbQuery = createQuery(query);
        const items: any =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .find({
                          $and: [
                              {
                                  stateId,
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
                            stateId,
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
