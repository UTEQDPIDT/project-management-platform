import { SetMetadata } from "@nestjs/common";
import { Action, Subjects } from "./ability.factory";
import { User } from "../schemas/user.schema";

export interface RequiredRule {
    action: Action;
    subject: Subjects;
}

export const CHECK_ABILITY_KEY = 'check_ability';

export const CheckAbilities = (...requirements: RequiredRule[]) =>
    SetMetadata(CHECK_ABILITY_KEY, requirements);

// Example usage of defining a specific ability rule:
// export class ReadUserAbility implements RequiredRule {
//     action = Action.Read;
//     subject = User;
// }