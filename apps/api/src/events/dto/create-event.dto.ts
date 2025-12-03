import { ApiProperty } from "@nestjs/swagger";
import { EventType } from "@repo/types";
import { IsDate, IsEnum, IsString } from "class-validator";
//import { Type } from "class-transformer";
export class CreateEventDto {
    
    @ApiProperty({
        description: "Nombre del evento",
        example: "Feria de Ciencias 2025",
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: "Resumen del evento",
        example: "Feria de ciencias  para muestra de proyectos de alumnos a académicos y directivos.",
        maxLength: 500,
    })
    @IsString()
    summary?: string;

    @ApiProperty({
        description: "Fecha del evento",
        example: "2025-05-01T00:00:00Z",
    })
    //@Type(() => Date)
    @IsDate()
    date: Date;

    @ApiProperty({
        description: "Organización que realiza el evento.",
        example: "CONCYTEQ",
    })
    @IsString()
    organization: string;

    @ApiProperty({
        description: "Ubicación del evento",
        example: "Edificio PIDET, UTEQ.",
    })
    @IsString()
    location: string;

    @ApiProperty({
        description: "Tipo de evento",
        enum: EventType,
        example: EventType.EXTERNO,
    })
    @IsEnum(EventType)
    type: EventType;
}
