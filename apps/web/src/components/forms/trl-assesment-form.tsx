import { calculateTRL, TRL_QUESTIONS } from '@/lib/utils';
import { trlAssessmentSchema } from '@/schemas/trlAssesment.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '../ui/field';

type TRLFormProps = {
  onTRLChange: (trl: number) => void;
};

type TRLFormValues = {
  answers: Record<string, boolean>;
};

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

  return (
    <form className="flex flex-col gap-6 max-h-[600px] overflow-y-auto px-1">
      {Object.entries(TRL_QUESTIONS).map(([level, questions]) => (
        <FieldSet key={level}>
          <FieldLegend variant="label">Nivel {level}</FieldLegend>
          <FieldDescription></FieldDescription>
          <FieldGroup data-slot="checkbox-group">
            {questions.map((q) => (
              <Controller
                key={q.id}
                control={form.control}
                defaultValue={false}
                name={`answers.${q.id}`}
                render={({ field }) => (
                  <Field orientation="horizontal" key={q.id}>
                    <Checkbox
                      id={q.id}
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                    />
                    <FieldLabel htmlFor={q.id}>{q.label}</FieldLabel>
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
        </FieldSet>
      ))}
      <div className="flex">
        <Button type="button" onClick={form.handleSubmit(onSubmit)}>
          Evaluar
        </Button>
      </div>
    </form>
  );
}
