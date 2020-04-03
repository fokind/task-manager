import { odata, ODataServer } from "odata-v4-server";
import { ProjectController } from "./controller/Project";

@odata.cors
@odata.namespace("Kanban")
@odata.controller(ProjectController, true)
export class KanbanServer extends ODataServer {}
