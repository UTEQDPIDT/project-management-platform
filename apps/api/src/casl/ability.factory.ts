import { AbilityBuilder, ExtractSubjectType, InferSubjects , MongoAbility, createMongoAbility} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { User, Activity, Event, File, Product, Project, Team } from "../schemas/index";
import { TeamUserRole, TeamUserStatus } from "@repo/types";

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
    defineAbility(user: any) {
        const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
        const userRole = user.role || 'USER';
        const userId = user._id || user.id;

        //ADMINS        
        if (userRole === 'ADMIN') {
            can(Action.Manage, 'all'); // admins can do anything
        }

        //USERS
        if (userRole === 'USER') { // regular users

            // FILE PERMISSIONS
            can([Action.Read, Action.Create], File); // users can read and upload files
            can(Action.Manage, File, { owner: userId }); // users can manage files they own

            //PROJECT PERMISSIONS
            can([Action.Create, Action.Read], Project); // users can create and read projects
            can(Action.Manage, Project, {owner: userId}); //Only project owners can update and delete their projects

            //EVENT PERMISSIONS
            can(Action.Manage, Event, { createdBy: userId }); // users can manage events they created
            can(Action.Read, Event); // users can read events and user info
            can(Action.UpdateContent, Event, {participants: userId} ); // users can update and delete events they are participating in

            //USER PERMISSIONS
            can([Action.ReadSelf, Action.Update], User, { _id: userId }); // users can read and update their own user info
            
            //TEAM PERMISSION
            can(Action.Create, Team); // users can create teams
            can(Action.Manage, Team, {memberships: {$elemMatch: {user: userId, role: TeamUserRole.OWNER, status: TeamUserStatus.ACTIVE}}}); //Only team owners can manage their teams
            can([Action.Read, Action.Update], Team, {memberships: {$elemMatch: {user: userId, role: TeamUserRole.MEMBER, status: TeamUserStatus.ACTIVE}}}); //Team members can read and update their teams
            can(Action.Read, Team, {memberships: {$elemMatch: {user: userId, role: TeamUserRole.COLLABORATOR, status: TeamUserStatus.ACTIVE}}}); //Team collaborators can read their teams

            //ACTIVITY PERMISSIONS
            can([Action.Read, Action.UpdateContent, Action.Create], Activity); // users can read activities & add themselves as assignees on activities related to events or projects they are part of
            can(Action.Manage, Activity, { createdBy: userId }); // users manage activities they created
        }

    
        return build({
            detectSubjectType: (item) => {
                // Si el item ya es una función (la clase/constructor), lo devolvemos tal cual
                if (typeof item === 'function') {
                return item as ExtractSubjectType<Subjects>;
                }
                
                // Si es un objeto, intentamos obtener su constructor (la clase)
                if (item && typeof item === 'object') {
                const constructor = item.constructor as ExtractSubjectType<Subjects>;
                return constructor;
                }

                // Caso de respaldo para 'all' o tipos desconocidos
                return item as unknown as ExtractSubjectType<Subjects>;
            }
        });
    }
}
