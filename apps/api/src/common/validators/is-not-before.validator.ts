import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsNotBefore(
  relatedProperty: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isNotBefore',
      target: object.constructor,
      propertyName,
      constraints: [relatedProperty],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedName] = args.constraints;
          const related = (args.object as Record<string, unknown>)[relatedName];

          // Skip when either is missing; @IsOptional / @IsDefined handle that.
          if (value == null || related == null) return true;

          const current = new Date(value as string | number | Date);
          const other = new Date(related as string | number | Date);
          if (isNaN(current.getTime()) || isNaN(other.getTime())) return true;

          return current.getTime() >= other.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} no puede ser anterior a ${args.constraints[0]}`;
        },
      },
    });
  };
}