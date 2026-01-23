import { AbilityBuilder, ExtractSubjectType, InferSubjects , MongoAbility, createMongoAbility} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { User, Activity, Event, File, Product, Project, Team } from "../schemas/index";
import { TeamUserRole, TeamUserStatus } from "@repo/types";
import { $elemMatch } from "@ucast/mongo2js";


export enum Action {
    Manage = 'manage', // wildcard for any action
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
    UpdateContent = 'updateContent',
    ReadSelf = 'readSelf',
}

export type Subjects = InferSubjects<typeof User | typeof Activity | typeof Event | typeof File | typeof Product | typeof Project | typeof Team> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
    defineAbility(user: User) {
        const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);


        //ADMINS        
        if (user.role === 'ADMIN') {
            can(Action.Manage, 'all'); // admins can do anything
        }

        //USERS
        if (user.role === 'USER') { // regular users
            can([Action.Create, Action.Read, Action.Update, Action.UpdateContent, Action.Delete], [File, Product]); // users can create, read, update, and delete activities, files, and products

            //PROJECT PERMISSIONS
            can([Action.Create, Action.Read], Project); // users can create and read projects
            can(Action.Manage, Project, {owner: user._id}); //Only project owners can update and delete their projects

            //EVENT PERMISSIONS
            can(Action.Manage, Event, { createdBy: user._id }); // users can manage events they created
            can(Action.Read, [Event, User]); // users can read events and user info
            can(Action.UpdateContent, Event, {participants: user._id} ); // users can update and delete events they are participating in

            //USER PERMISSIONS
            can([Action.ReadSelf, Action.Update], User, { _id: user._id }); // users can read and update their own user info
            
            //TEAM PERMISSION
            can(Action.Create, Team); // users can create teams
            can(Action.Manage, Team, {memberships: {$elemMatch: {user: user._id, role: TeamUserRole.OWNER, status: TeamUserStatus.ACTIVE}}}); //Only team owners can manage their teams
            can([Action.Read, Action.Update], Team, {memberships: {$elemMatch: {user: user._id, role: TeamUserRole.MEMBER, status: TeamUserStatus.ACTIVE}}}); //Team members can read and update their teams
            can(Action.Read, Team, {memberships: {$elemMatch: {user: user._id, role: TeamUserRole.COLLABORATOR, status: TeamUserStatus.ACTIVE}}}); //Team collaborators can read their teams

            //ACTIVITY PERMISSIONS
            //can([Action.Read, Action.UpdateContent], Activity); // users can read activities & add themselves as assignees on activities related to events or projects they are part of
            can(Action.Manage, Activity, { createdBy: user._id }); // users manage activities they created
        }

    
        return build({
            detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
