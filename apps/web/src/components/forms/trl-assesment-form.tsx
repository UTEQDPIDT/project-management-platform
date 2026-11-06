// apps/web/src/components/forms/trl-assesment-form.tsx
import { calculateTRL, TRL_QUESTIONS } from '@/lib/utils';
import { trlAssessmentSchema } from '@/schemas/trlAssesment.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '../ui/field';

type TRLFormProps = {
  onTRLChange: (trl: number) => void;
};

type TRLFormValues = {
  answers: Record<string, boolean>;
};

const LEVELS = Object.keys(TRL_QUESTIONS).map(Number); // [1..9]

export function TRLForm({ onTRLChange }: TRLFormProps) {
  const form = useForm<TRLFormValues>({
    resolver: zodResolver(trlAssessmentSchema),
    defaultValues: {
      answers: {},
    },
  });

  const onSubmit = (values: TRLFormValues) => {
    const trl = calculateTRL(values.answers);
    onTRLChange(trl);
  };

  /**
   * Checking level N checks levels 1..N.
   * Unchecking level N unchecks levels N..9 (a higher level can't stay
   * checked if a lower one isn't, which is also how calculateTRL works).
   */
  const handleLevelToggle = (level: number, checked: boolean) => {
    for (const l of LEVELS) {
      const affected = checked ? l <= level : l >= level;
      if (!affected) continue;

      for (const q of TRL_QUESTIONS[l as keyof typeof TRL_QUESTIONS]) {
        form.setValue(`answers.${q.id}`, checked, { shouldDirty: true });
      }
    }
  };

  return (
    <form className="flex flex-col gap-4 max-h-[600px] overflow-y-auto px-1">
      <FieldGroup data-slot="checkbox-group" className="gap-3">
        {LEVELS.map((level) =>
          TRL_QUESTIONS[level as keyof typeof TRL_QUESTIONS].map((q) => (
            <Controller
              key={q.id}
              control={form.control}
              defaultValue={false}
              name={`answers.${q.id}`}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id={q.id}
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      handleLevelToggle(level, Boolean(checked))
                    }
                  />
                  <FieldLabel htmlFor={q.id} className="font-normal">
                    <span className="font-semibold">Nivel {level}:</span>{q.label}
                  </FieldLabel>
                </Field>
              )}
            />
          )),
        )}
      </FieldGroup>

      <div className="flex">
        <Button type="button" onClick={form.handleSubmit(onSubmit)}>
          Evaluar
        </Button>
      </div>
    </form>
  );
}