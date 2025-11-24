import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { TeamsGrade } from "../../enums/teams-grade.enum";

export class CreateTeamDto {
    @ApiProperty({
        description: 'El nombre del equipo.',
        example: 'Equipo DTAI',
        maxLength: 50,
    })
    @IsString()
    @MaxLength(50)
    teamName: string;

    @ApiProperty({
        description: 'Una breve descripción del equipo.',
        example: 'Equipo enfocado en el desarrollo de modelos CAD.',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    summary?: string;

    @ApiProperty({
        description: 'El grado del equipo.',
        default: TeamsGrade.FORMACION,
        enum: TeamsGrade
    })
    @IsOptional()
    @IsEnum(TeamsGrade)
    grade?: TeamsGrade;
}
