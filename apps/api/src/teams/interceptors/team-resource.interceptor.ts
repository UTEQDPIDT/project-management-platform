import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from "@nestjs/common";
import { Model } from "mongoose";
import { Team } from "../../schemas";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class TeamResourceInterceptor implements NestInterceptor {
    constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest();
        const teamId = req.params?.id;
        if (!teamId) {
            return next.handle();
        }

        const team = await this.teamModel.findById(teamId).exec();
        if(!team){
            throw new NotFoundException('Team not found');
        }
        
        req.resource = team;
        return next.handle();
    } 
}
