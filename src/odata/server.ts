import { odata, ODataServer } from "odata-v4-server";
import { ProjectsController } from "./controller/Projects";
import { ProjectStatesController } from "./controller/ProjectStates";
import { TasksController } from "./controller/Tasks";

@odata.cors
@odata.namespace("Kanban")
@odata.controller(ProjectsController, true)
@odata.controller(ProjectStatesController, true)
@odata.controller(TasksController, true)
export class KanbanServer extends ODataServer {}
