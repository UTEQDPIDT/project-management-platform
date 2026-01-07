import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { User } from "../../schemas/user.schema";

export enum Action {
    Manage = 'manage', // wildcard for any action
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}

export type Subjects = InferSubjects<typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
    defineAbility(user: User) {
        const { can, cannot, build} = new AbilityBuilder(Ability as AbilityClass<AppAbility>);

            if (user.role === 'ADMIN') {
                can(Action.Manage, 'all'); // admins can do anything
            } else {
                can(Action.Read, User); // all users can read users
                cannot(Action.Delete, User).because('Only admins can delete users'); // non-admins cannot delete users
        }

        return build({
            detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
