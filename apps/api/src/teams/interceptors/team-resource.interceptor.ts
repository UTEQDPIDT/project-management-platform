import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Model } from "mongoose";
import { Team } from "../../schemas";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class TeamResourceInterceptor implements NestInterceptor {
    constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest();
        if (req.params?.id) {
            req.resource = await this.teamModel.findById(req.params.id);
        }
    return next.handle();
    } 
}
