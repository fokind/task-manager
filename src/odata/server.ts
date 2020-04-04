import { odata, ODataServer } from "odata-v4-server";
import { ProjectsController } from "./controller/Projects";
import { StatesController } from "./controller/States";
import { TasksController } from "./controller/Tasks";

@odata.cors
@odata.namespace("Kanban")
@odata.controller(ProjectsController, true)
@odata.controller(StatesController, true)
@odata.controller(TasksController, true)
export class KanbanServer extends ODataServer {}
